import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';
import { NAVITEMS } from './navitems.js';

// Configuration
const BASE_URL = 'https://api.oaexample.com'; // Update with your actual base URL
const AUTH_TOKEN = '${__ENV.AUTH_TOKEN}'; // Pass token via environment variable
const CSRF_TOKEN = '${__ENV.CSRF_TOKEN}'; // CSRF token for requests
const COOKIE = '${__ENV.COOKIE}'; // Cookie value for authenticated requests

// Custom metrics
const errorRate = new Rate('error_rate');
const responseTime = new Trend('response_time');
const validJsonRate = new Rate('valid_json_rate');
const validResultsRate = new Rate('valid_results_rate');

// Create trend metrics for different test types
const baseEndpointTrend = new Trend('base_endpoint_response_time');
const paginationTrend = new Trend('pagination_response_time');
const searchTrend = new Trend('search_response_time');

// Create endpoint-specific metrics
NAVITEMS.forEach(item => {
  const name = item.type.toLowerCase();
  item.trends = {
    base: new Trend(`${name}_base_response_time`),
    pagination: new Trend(`${name}_pagination_response_time`),
    search: new Trend(`${name}_search_response_time`)
  };
});

// Test options
export const options = {
  scenarios: {
    endpoint_tests: {
      executor: 'per-vu-iterations',
      vus: 5,
      iterations: 1,
      maxDuration: '5m',
    }
  },
  thresholds: {
    'error_rate': ['rate<0.1'], // Error rate under 10%
    'http_req_duration': ['p(95)<3000'], // 95% of requests should be below 3s
    'valid_json_rate': ['rate>0.95'], // Valid JSON rate should be >95%
    'valid_results_rate': ['rate>0.95'], // Valid results array rate should be >95%
  }
};

// Setup function (runs once per VU)
export function setup() {
  // Create results directory if it doesn't exist
  if (__ENV.K6_JS_HOME) {
    const fs = require('fs');
    if (!fs.existsSync('results')) {
      fs.mkdirSync('results');
    }
  } else {
    console.log('Note: Results directory will be created by k6 if it does not exist');
  }

  // You can perform setup operations here, like getting an auth token
  // if you're not passing it as an environment variable
  return {
    token: AUTH_TOKEN,
    csrfToken: CSRF_TOKEN,
    cookie: COOKIE
  };
}

// Helper function to validate JSON response
function validateJsonResponse(body) {
  try {
    const data = JSON.parse(body);
    const hasResults = data.hasOwnProperty('results') && Array.isArray(data.results);
    return {
      isValidJson: true,
      hasValidResults: hasResults
    };
  } catch (e) {
    return {
      isValidJson: false,
      hasValidResults: false
    };
  }
}

// Helper function to make requests
function makeRequest(url, headers, metricName, itemTrend) {
  const response = http.get(url, { headers });

  // Add to general metric
  responseTime.add(response.timings.duration);

  // Add to specific test type metric
  if (metricName) {
    metricName.add(response.timings.duration);
  }

  // Add to endpoint-specific metric
  if (itemTrend) {
    itemTrend.add(response.timings.duration);
  }

  // Validate JSON and results array
  const validation = validateJsonResponse(response.body);
  validJsonRate.add(validation.isValidJson);
  validResultsRate.add(validation.hasValidResults);

  // Check if the request was successful
  const success = check(response, {
    'status is 200': (r) => r.status === 200,
    'response is valid JSON': (r) => validation.isValidJson,
    'response has results array': (r) => validation.hasValidResults
  });

  // Record errors
  errorRate.add(!success);

  // Log detailed information for failed requests
  if (!success) {
    console.log(`Failed request to ${url}: Status ${response.status}, Body: ${response.body.substring(0, 100)}...`);
    if (!validation.isValidJson) {
      console.log('Response is not valid JSON');
    } else if (!validation.hasValidResults) {
      console.log('Response does not contain a results array');
    }
  }

  return response;
}

// Main function
export default function(data) {
  // Common headers for all requests
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-CSRFToken': CSRF_TOKEN,
    'Cookie': COOKIE,
  };

  // Add authorization if token is available
  if (data.token) {
    headers['Authorization'] = `Bearer ${data.token}`;
  }

  // Loop through each NAVITEM and run three tests for each
  for (const item of NAVITEMS) {
    const endpointBase = `${BASE_URL}${item.api}`;

    // Test 1: Base endpoint request
    console.log(`Testing base endpoint: ${endpointBase}`);
    makeRequest(endpointBase, headers, baseEndpointTrend, item.trends.base);
    sleep(1); // Short pause between requests

    // Test 2: Paginated request
    const paginatedUrl = `${endpointBase}?offset=10&limit=10`;
    console.log(`Testing pagination: ${paginatedUrl}`);
    makeRequest(paginatedUrl, headers, paginationTrend, item.trends.pagination);
    sleep(1); // Short pause between requests

    // Test 3: Search request (if search fields are available)
    if (item.search_fields && item.search_fields.length > 0) {
      const searchUrl = `${endpointBase}?search=a`;
      console.log(`Testing search: ${searchUrl}`);
      makeRequest(searchUrl, headers, searchTrend, item.trends.search);
      sleep(1); // Short pause between requests
    } else {
      console.log(`Skipping search test for ${item.api} - no search fields defined`);
    }

    // Sleep between testing different endpoints
    sleep(2);
  }
}

// Helper function to summarize results for reporting
export function handleSummary(data) {
  const timestamp = new Date().toISOString().split("T")[0];

  // Ensure results directory exists
  const resultsDir = 'test-results';
  if (__ENV.K6_JS_HOME) {
    const fs = require('fs');
    if (!fs.existsSync(resultsDir)) {
      fs.mkdirSync(resultsDir);
    }
  }

  // Create a summary object with timestamped filenames
  const summary = {};

  // JSON report
  summary[`${resultsDir}/test-${timestamp}.json`] = JSON.stringify({
    metrics: data.metrics,
    root_group: data.root_group,
  }, null, 2);

  // HTML report
  summary[`${resultsDir}/test-${timestamp}.html`] = generateHtmlReport(data);

  return summary;
}

// Generate a simple HTML report
function generateHtmlReport(data) {
  // Group metrics by endpoint
  const endpointMetrics = {};

  NAVITEMS.forEach(item => {
    const name = item.type.toLowerCase();
    const baseMetric = data.metrics[`${name}_base_response_time`];
    const paginationMetric = data.metrics[`${name}_pagination_response_time`];
    const searchMetric = data.metrics[`${name}_search_response_time`];

    endpointMetrics[name] = {
      endpoint: item.api,
      baseResponse: baseMetric ? {
        avg: baseMetric.values.avg,
        min: baseMetric.values.min,
        max: baseMetric.values.max
      } : 'N/A',
      paginationResponse: paginationMetric ? {
        avg: paginationMetric.values.avg,
        min: paginationMetric.values.min,
        max: paginationMetric.values.max
      } : 'N/A',
      searchResponse: searchMetric ? {
        avg: searchMetric.values.avg,
        min: searchMetric.values.min,
        max: searchMetric.values.max
      } : 'N/A',
    };
  });

  // Create a simple HTML report
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <title>API Endpoint Performance Test Report</title>
    <style>
      body { font-family: Arial, sans-serif; margin: 20px; }
      table { border-collapse: collapse; width: 100%; margin-top: 20px; }
      th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
      th { background-color: #f2f2f2; }
      tr:nth-child(even) { background-color: #f9f9f9; }
      .summary { margin-bottom: 30px; }
      .header { background-color: #333; color: white; padding: 10px; margin-bottom: 20px; }
      .metric-cell { display: flex; flex-direction: column; }
      .metric-item { margin: 2px 0; }
      .metric-label { font-weight: bold; display: inline-block; width: 40px; }
    </style>
  </head>
  <body>
    <div class="header">
      <h1>API Endpoint Performance Test Report</h1>
      <p>Generated: ${new Date().toISOString()}</p>
      <p>Base URL: ${BASE_URL}</p>
    </div>
    
    <div class="summary">
      <h2>Summary</h2>
      <p>Total requests: ${data.metrics.http_reqs.values.count}</p>
      <p>Error rate: ${(data.metrics.error_rate.values.rate * 100).toFixed(2)}%</p>
      <p>Valid JSON rate: ${(data.metrics.valid_json_rate.values.rate * 100).toFixed(2)}%</p>
      <p>Valid results array rate: ${(data.metrics.valid_results_rate.values.rate * 100).toFixed(2)}%</p>
      <p>Average response time: ${data.metrics.http_req_duration.values.avg.toFixed(2)}ms</p>
      <p>Min response time: ${data.metrics.http_req_duration.values.min.toFixed(2)}ms</p>
      <p>Max response time: ${data.metrics.http_req_duration.values.max.toFixed(2)}ms</p>
      <p>95th percentile: ${data.metrics.http_req_duration.values["p(95)"].toFixed(2)}ms</p>
    </div>
    
    <h2>Endpoint Performance</h2>
    <table>
      <tr>
        <th>Endpoint</th>
        <th>Base Response (ms)</th>
        <th>Pagination Response (ms)</th>
        <th>Search Response (ms)</th>
      </tr>
      ${Object.values(endpointMetrics).map(metric => `
        <tr>
          <td>${metric.endpoint}</td>
          <td>
            ${typeof metric.baseResponse === 'object' ? `
              <div class="metric-cell">
                <div class="metric-item"><span class="metric-label">Avg:</span> ${metric.baseResponse.avg.toFixed(2)}</div>
                <div class="metric-item"><span class="metric-label">Min:</span> ${metric.baseResponse.min.toFixed(2)}</div>
                <div class="metric-item"><span class="metric-label">Max:</span> ${metric.baseResponse.max.toFixed(2)}</div>
              </div>
            ` : metric.baseResponse}
          </td>
          <td>
            ${typeof metric.paginationResponse === 'object' ? `
              <div class="metric-cell">
                <div class="metric-item"><span class="metric-label">Avg:</span> ${metric.paginationResponse.avg.toFixed(2)}</div>
                <div class="metric-item"><span class="metric-label">Min:</span> ${metric.paginationResponse.min.toFixed(2)}</div>
                <div class="metric-item"><span class="metric-label">Max:</span> ${metric.paginationResponse.max.toFixed(2)}</div>
              </div>
            ` : metric.paginationResponse}
          </td>
          <td>
            ${typeof metric.searchResponse === 'object' ? `
              <div class="metric-cell">
                <div class="metric-item"><span class="metric-label">Avg:</span> ${metric.searchResponse.avg.toFixed(2)}</div>
                <div class="metric-item"><span class="metric-label">Min:</span> ${metric.searchResponse.min.toFixed(2)}</div>
                <div class="metric-item"><span class="metric-label">Max:</span> ${metric.searchResponse.max.toFixed(2)}</div>
              </div>
            ` : metric.searchResponse}
          </td>
        </tr>
      `).join('')}
    </table>
    
    <h2>Test Configuration</h2>
    <p>Base URL: ${BASE_URL}</p>
    <p>Virtual Users: 5</p>
    <p>Iterations per VU: 1</p>
  </body>
  </html>
  `;
}

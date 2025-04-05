import http from "k6/http";
import { check, sleep } from "k6";
import { Counter, Rate, Trend } from "k6/metrics";
import { NAVITEMS } from "./navitems.js";

// Configuration
const BASE_URL = "https://api.oaexample.com"; // Update with your actual base URL
const CSRF_TOKEN = "${__ENV.CSRF_TOKEN}"; // CSRF token for requests
const COOKIE = "${__ENV.COOKIE}"; // Cookie value for authenticated requests

// Custom metrics
const errorRate = new Rate("error_rate");
const responseTime = new Trend("response_time");
const validJsonRate = new Rate("valid_json_rate");
const validResultsRate = new Rate("valid_results_rate");

// Create trend metrics for different test types
const detailItemTrend = new Trend("detail_item_response_time");
const paginationTrend = new Trend("pagination_response_time");
const searchTrend = new Trend("search_response_time");

// Status code tracking
const statusCodeCounter = {};
for (let i = 100; i < 600; i++) {
  statusCodeCounter[i] = new Counter(`status_code_${i}`);
}

// Create endpoint-detail metrics and result count tracking
NAVITEMS.forEach(item => {
  const name = item.type.toLowerCase();
  item.trends = {
    pagination: new Trend(`${name}_pagination_response_time`),
    search: new Trend(`${name}_search_response_time`),
    detail: new Trend(`${name}_detail_item_response_time`)
  };
  // Add properties to track result counts and errors
  item.resultCounts = {
    detail: 0,
    pagination: 0,
    search: 0
  };
  item.errors = {
    detail: [],
    pagination: [],
    search: []
  };
});

// Test options
export const options = {
  scenarios: {
    endpoint_tests: {
      executor: "per-vu-iterations",
      vus: 5,
      iterations: 1,
      maxDuration: "5m"
    }
  },
  thresholds: {
    "error_rate": ["rate<0.1"], // Error rate under 10%
    "http_req_duration": ["p(95)<3000"], // 95% of requests should be below 3s
    "valid_json_rate": ["rate>0.95"], // Valid JSON rate should be >95%
    "valid_results_rate": ["rate>0.95"] // Valid results array rate should be >95%
  }
};

// Setup function (runs once per VU)
export function setup () {
  // Create results directory if it doesn't exist
  if (__ENV.K6_JS_HOME) {
    const fs = require("fs");
    if (!fs.existsSync("results")) {
      fs.mkdirSync("results");
    }
  } else {
    console.log("Note: Results directory will be created by k6 if it does not exist");
  }

  return {
    csrfToken: CSRF_TOKEN,
    cookie: COOKIE
  };
}

// Helper function to validate JSON response
function validateJsonResponse (body) {
  try {
    const data = JSON.parse(body);
    const hasResults = (data.hasOwnProperty("results") && Array.isArray(data.results)) || data.hasOwnProperty("_type");
    const total = (data.count) ? data.count : 0;
    return {
      total: total,
      isValidJson: true,
      hasValidResults: hasResults,
      data: data
    };
  } catch (e) {
    return {
      total: -1,
      isValidJson: false,
      hasValidResults: false,
      data: null,
      error: e.message
    };
  }
}

// Helper function to extract error message from response
function extractErrorMessage (response, validation) {
  // If we have valid JSON with error details
  if (validation.isValidJson && validation.data) {
    if (validation.data.detail) {
      return validation.data.detail;
    }
    if (validation.data.error) {
      return validation.data.error;
    }
    if (validation.data.message) {
      return validation.data.message;
    }
  }

  // Otherwise return a snippet of the response body
  return response.body ? response.body.substring(0, 200) : "No response body";
}

// Helper function to make requests
function makeRequest (url, headers, metricName, itemTrend, item, testType) {
  const response = http.get(url, { headers });

  // Track status code
  if (statusCodeCounter[response.status]) {
    statusCodeCounter[response.status].add(1);
  }

  // Add to general metric
  responseTime.add(response.timings.duration);

  // Add to detail test type metric
  if (metricName) {
    metricName.add(response.timings.duration);
  }

  // Add to endpoint-detail metric
  if (itemTrend) {
    itemTrend.add(response.timings.duration);
  }

  // Validate JSON and results array
  const validation = validateJsonResponse(response.body);
  validJsonRate.add(validation.isValidJson);
  validResultsRate.add(validation.hasValidResults);

  // Store the result count if item and testType are provided
  if (item && testType && validation.isValidJson) {
    item.resultCounts[testType] = validation.total;
  }

  // Check if the request was successful
  const success = check(response, {
    "status is 200": (r) => r.status === 200,
    "response is valid JSON": (r) => validation.isValidJson,
    "response has results array": (r) => validation.hasValidResults
  });

  // Record errors
  errorRate.add(!success);

  // Log and store detailed information for failed requests
  if (!success || response.status !== 200) {
    const errorMessage = extractErrorMessage(response, validation);
    const errorDetails = {
      url: url,
      status: response.status,
      message: errorMessage,
      json_valid: validation.isValidJson,
      timestamp: new Date().toISOString()
    };

    console.log(`Failed request to ${url}: Status ${response.status}, Message: ${errorMessage}`);

    if (item && testType) {
      item.errors[testType].push(errorDetails);
    }

    if (!validation.isValidJson) {
      console.log("Response is not valid JSON");
    } else if (!validation.hasValidResults) {
      console.log("Response does not contain a results array");
    }
  }

  return response;
}

// Main function
export default function(data) {
  // Common headers for all requests
  const headers = {
    "Content-Type": "application/json",
    "Accept": "application/json",
    "X-CSRFToken": data.csrfToken,
    "Cookie": data.cookie
  };

  // Loop through each NAVITEM and run three tests for each
  for (const item of NAVITEMS) {
    const endpointBase = `${BASE_URL}${item.api}`;

    // Test 1: Paginated request
    const paginatedUrl = `${endpointBase}?offset=0&limit=10`;
    console.log(`Testing pagination: ${paginatedUrl}`);
    const paginationResponse = makeRequest(paginatedUrl, headers, paginationTrend, item.trends.pagination, item, "pagination");
    sleep(1); // Short pause between requests

    // Test 2: Get first item from pagination results if available
    let firstItemId = null;
    try {
      const responseData = JSON.parse(paginationResponse.body);

      if (responseData.results && responseData.results.length > 0 && responseData.results[0].id) {
        firstItemId = responseData.results[0].id;
        const itemUrl = `${endpointBase}/${firstItemId}`;
        console.log(`Testing detail item: ${itemUrl}`);
        makeRequest(itemUrl, headers, detailItemTrend, item.trends.detail, item, "detail");
        sleep(1); // Short pause between requests
      } else {
        if (responseData.results && responseData.results.length === 0) {
          console.log(`NO DATA @ ${item.api} - ${JSON.stringify(responseData).substring(0, 100)}`);
        } else {
          console.log(`Invalid pagination results for ${item.api} - ${JSON.stringify(responseData).substring(0, 100)}`);
        }
      }
    } catch (e) {
      console.log(`Error parsing pagination response for ${item.api}: ${e.message}`);
    }

    // Test 3: Search request (if search fields are available)
    if (item.search_fields && item.search_fields.length > 0) {
      const searchUrl = `${endpointBase}?search=a`;
      console.log(`Testing search: ${searchUrl}`);
      makeRequest(searchUrl, headers, searchTrend, item.trends.search, item, "search");
      sleep(1); // Short pause between requests
    } else {
      console.log(`Skipping search test for ${item.api} - no search fields defined`);
    }

    // Sleep between testing different endpoints
    sleep(2);
  }
}

// Helper function to summarize results for reporting
export function handleSummary (data) {
  const timestamp = new Date().toISOString().split("T")[0];

  // Ensure results directory exists
  const resultsDir = "test-results";
  if (__ENV.K6_JS_HOME) {
    const fs = require("fs");
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
    endpoints: NAVITEMS.map(item => ({
      type: item.type,
      api: item.api,
      resultCounts: item.resultCounts,
      errors: item.errors
    }))
  }, null, 2);

  // HTML report
  summary[`${resultsDir}/test-${timestamp}.html`] = generateHtmlReport(data);

  return summary;
}

// Generate a simple HTML report
function generateHtmlReport (data) {
  // Group metrics by endpoint
  const endpointMetrics = {};

  // Extract status code data
  const statusCodes = {};
  for (let i = 100; i < 600; i++) {
    if (data.metrics[`status_code_${i}`] && data.metrics[`status_code_${i}`].values.count > 0) {
      statusCodes[i] = data.metrics[`status_code_${i}`].values.count;
    }
  }

  NAVITEMS.forEach(item => {
    const name = item.type.toLowerCase();
    const baseMetric = data.metrics[`${name}_detail_item_response_time`];
    const paginationMetric = data.metrics[`${name}_pagination_response_time`];
    const searchMetric = data.metrics[`${name}_search_response_time`];

    endpointMetrics[name] = {
      endpoint: item.api,
      paginationResponse: paginationMetric ? {
        avg: paginationMetric.values.avg,
        min: paginationMetric.values.min,
        max: paginationMetric.values.max
      } : "N/A",
      detailItemResponse: baseMetric ? {
        avg: baseMetric.values.avg,
        min: baseMetric.values.min,
        max: baseMetric.values.max
      } : "N/A",
      searchResponse: searchMetric ? {
        avg: searchMetric.values.avg,
        min: searchMetric.values.min,
        max: searchMetric.values.max
      } : "N/A",
      resultCounts: item.resultCounts,
      errors: item.errors
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
      .result-count { font-weight: bold; color: #1a73e8; }
      .error-section { margin-top: 30px; }
      .error-details { background-color: #fff8f8; border: 1px solid #ffdddd; padding: 10px; margin: 10px 0; border-radius: 4px; }
      .status-code { font-weight: bold; }
      .status-success { color: #28a745; }
      .status-error { color: #dc3545; }
      .status-redirect { color: #fd7e14; }
      .status-info { color: #17a2b8; }
      .status-section { display: flex; flex-wrap: wrap; gap: 10px; margin: 20px 0; }
      .status-badge { 
        padding: 5px 10px; 
        border-radius: 4px; 
        display: inline-block;
        margin-right: 5px;
        margin-bottom: 5px;
      }
      .collapsible { 
        background-color: #f1f1f1;
        cursor: pointer;
        padding: 10px;
        width: 100%;
        border: none;
        text-align: left;
        outline: none;
        font-weight: bold;
      }
      .active, .collapsible:hover { background-color: #ddd; }
      .content { 
        padding: 0 18px;
        max-height: 0;
        overflow: hidden;
        transition: max-height 0.2s ease-out;
        background-color: #f9f9f9;
      }
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
    
    <h2>HTTP Status Codes</h2>
    <div class="status-section">
      ${Object.entries(statusCodes).map(([code, count]) => {
    let colorClass = "status-info";
    if (code >= 200 && code < 300) colorClass = "status-success";
    else if (code >= 300 && code < 400) colorClass = "status-redirect";
    else if (code >= 400) colorClass = "status-error";

    return `<div class="status-badge ${colorClass}">
          Status ${code}: ${count} requests
        </div>`;
  }).join("")}
    </div>
    
    <h2>Endpoint Performance</h2>
    <table>
      <tr>
        <th>Endpoint</th>
        <th>Detail Item Response (ms)</th>
        <th>Pagination Response (ms)</th>
        <th>Search Response (ms)</th>
      </tr>
      ${Object.values(endpointMetrics).map(metric => `
        <tr>
          <td>${metric.endpoint}</td>
          <td>
            ${typeof metric.detailItemResponse === "object" ? `
              <div class="metric-cell">
                <div class="metric-item"><span class="metric-label">Avg:</span> ${metric.detailItemResponse.avg.toFixed(2)}</div>
                <div class="metric-item"><span class="metric-label">Min:</span> ${metric.detailItemResponse.min.toFixed(2)}</div>
                <div class="metric-item"><span class="metric-label">Max:</span> ${metric.detailItemResponse.max.toFixed(2)}</div>
                <div class="metric-item"><span class="metric-label">Count:</span> <span class="result-count">${metric.resultCounts.detail}</span></div>
                ${metric.errors.detail.length > 0 ?
    `<div class="metric-item"><span class="status-error">Errors: ${metric.errors.detail.length}</span></div>` : ""}
              </div>
            ` : `
              ${metric.detailItemResponse}
              ${metric.detailItemResponse !== "N/A" ?
    `<div class="metric-item"><span class="metric-label">Count:</span> <span class="result-count">${metric.resultCounts.detail}</span></div>` : ""}
            `}
          </td>
          <td>
            ${typeof metric.paginationResponse === "object" ? `
              <div class="metric-cell">
                <div class="metric-item"><span class="metric-label">Avg:</span> ${metric.paginationResponse.avg.toFixed(2)}</div>
                <div class="metric-item"><span class="metric-label">Min:</span> ${metric.paginationResponse.min.toFixed(2)}</div>
                <div class="metric-item"><span class="metric-label">Max:</span> ${metric.paginationResponse.max.toFixed(2)}</div>
                <div class="metric-item"><span class="metric-label">Count:</span> <span class="result-count">${metric.resultCounts.pagination}</span></div>
                ${metric.errors.pagination.length > 0 ?
    `<div class="metric-item"><span class="status-error">Errors: ${metric.errors.pagination.length}</span></div>` : ""}
              </div>
            ` : `
              ${metric.paginationResponse}
              ${metric.paginationResponse !== "N/A" ?
    `<div class="metric-item"><span class="metric-label">Count:</span> <span class="result-count">${metric.resultCounts.pagination}</span></div>` : ""}
            `}
          </td>
          <td>
            ${typeof metric.searchResponse === "object" ? `
              <div class="metric-cell">
                <div class="metric-item"><span class="metric-label">Avg:</span> ${metric.searchResponse.avg.toFixed(2)}</div>
                <div class="metric-item"><span class="metric-label">Min:</span> ${metric.searchResponse.min.toFixed(2)}</div>
                <div class="metric-item"><span class="metric-label">Max:</span> ${metric.searchResponse.max.toFixed(2)}</div>
                <div class="metric-item"><span class="metric-label">Count:</span> <span class="result-count">${metric.resultCounts.search}</span></div>
                ${metric.errors.search.length > 0 ?
    `<div class="metric-item"><span class="status-error">Errors: ${metric.errors.search.length}</span></div>` : ""}
              </div>
            ` : `
              ${metric.searchResponse}
              ${metric.searchResponse !== "N/A" ?
    `<div class="metric-item"><span class="metric-label">Count:</span> <span class="result-count">${metric.resultCounts.search}</span></div>` : ""}
            `}
          </td>
        </tr>
      `).join("")}
    </table>
    
    <div class="error-section">
      <h2>Error Details</h2>
      
      ${Object.values(endpointMetrics).filter(metric =>
    metric.errors.detail.length > 0 ||
    metric.errors.pagination.length > 0 ||
    metric.errors.search.length > 0
  ).map(metric => `
        <button class="collapsible">${metric.endpoint} - Total Errors: ${
    metric.errors.detail.length +
    metric.errors.pagination.length +
    metric.errors.search.length
  }</button>
        <div class="content">
          ${metric.errors.pagination.length > 0 ? `
            <h4>Pagination Errors (${metric.errors.pagination.length})</h4>
            ${metric.errors.pagination.map(err => `
              <div class="error-details">
                <p><strong>URL:</strong> ${err.url}</p>
                <p><strong>Status:</strong> <span class="status-code status-error">${err.status}</span></p>
                <p><strong>Message:</strong> ${err.message}</p>
                <p><strong>Time:</strong> ${err.timestamp}</p>
              </div>
            `).join("")}
          ` : ""}
          
          ${metric.errors.detail.length > 0 ? `
            <h4>Detail Item Errors (${metric.errors.detail.length})</h4>
            ${metric.errors.detail.map(err => `
              <div class="error-details">
                <p><strong>URL:</strong> ${err.url}</p>
                <p><strong>Status:</strong> <span class="status-code status-error">${err.status}</span></p>
                <p><strong>Message:</strong> ${err.message}</p>
                <p><strong>Time:</strong> ${err.timestamp}</p>
              </div>
            `).join("")}
          ` : ""}
          
          ${metric.errors.search.length > 0 ? `
            <h4>Search Errors (${metric.errors.search.length})</h4>
            ${metric.errors.search.map(err => `
              <div class="error-details">
                <p><strong>URL:</strong> ${err.url}</p>
                <p><strong>Status:</strong> <span class="status-code status-error">${err.status}</span></p>
                <p><strong>Message:</strong> ${err.message}</p>
                <p><strong>Time:</strong> ${err.timestamp}</p>
              </div>
            `).join("")}
          ` : ""}
        </div>
      `).join("")}
    </div>
    
    <h2>Test Configuration</h2>
    <p>Base URL: ${BASE_URL}</p>
    <p>Virtual Users: 5</p>
    <p>Iterations per VU: 1</p>
    
    <script>
    var coll = document.getElementsByClassName("collapsible");
    var i;

    for (i = 0; i < coll.length; i++) {
      coll[i].addEventListener("click", function() {
        this.classList.toggle("active");
        var content = this.nextElementSibling;
        if (content.style.maxHeight){
          content.style.maxHeight = null;
        } else {
          content.style.maxHeight = content.scrollHeight + "px";
        } 
      });
    }
    </script>
  </body>
  </html>
  `;
}

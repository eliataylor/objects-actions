import http from "k6/http";
import { check, sleep } from "k6";
import { Counter, Rate, Trend, Gauge } from "k6/metrics";
import { NAVITEMS } from "./navitems.js";

// Configuration
const BASE_URL = __ENV.REACT_APP_API_HOST; // Load API host from environment variable
const CSRF_TOKEN = __ENV.CSRF_TOKEN; // CSRF token for requests
const COOKIE = __ENV.COOKIE; // Cookie value for authenticated requests

// Custom metrics
const errorRate = new Rate("error_rate");
const responseTime = new Trend("response_time");
const validJsonRate = new Rate("valid_json_rate");

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
// Using Gauge instead of Counter to track current values
const resultGauges = {};

NAVITEMS.forEach(item => {
  const name = item.type.toLowerCase();

  // Create trends for response times
  item.trends = {
    pagination: new Trend(`${name}_pagination_response_time`),
    search: new Trend(`${name}_search_response_time`),
    detail: new Trend(`${name}_detail_item_response_time`)
  };

  // Create gauges for result counts instead of counters
  // Gauges can be set to specific values and report the current value, not a cumulative total
  resultGauges[`${name}_detail`] = new Gauge(`${name}_detail_count`);
  resultGauges[`${name}_pagination`] = new Gauge(`${name}_pagination_count`);
  resultGauges[`${name}_search`] = new Gauge(`${name}_search_count`);
});

// Test options
export const options = {
  scenarios: {
    endpoint_tests: {
      executor: "per-vu-iterations",
      vus: 5,
      iterations: 5,
      maxDuration: "5m"
    }
  },
  thresholds: {
    "error_rate": ["rate<0.1"], // Error rate under 10%
    "http_req_duration": ["p(95)<3000"], // 95% of requests should be below 3s
    "valid_json_rate": ["rate>0.95"] // Valid JSON rate should be >95%
  },
  insecureSkipTLSVerify: true
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
    const isValidError = (data.hasOwnProperty("error") || data.hasOwnProperty("detail") || data.hasOwnProperty("message"));
    const total = (data.count) ? data.count : (data.hasOwnProperty("_type") ? 1 : 0);
    return {
      total: total,
      isValidResponse: hasResults || isValidError,
      data: data
    };
  } catch (e) {
    return {
      total: 0,
      isValidResponse: false,
      data: e.message
    };
  }
}

// Helper function to extract error message from response
function extractErrorMessage (response, validation) {
  // If we have valid JSON with error details
  if (validation.isValidResponse && validation.data) {
    if (validation.data.error) {
      return validation.data.error;
    }
    if (validation.data.detail) {
      return validation.data.detail;
    }
    if (validation.data.message) {
      return validation.data.message;
    }
  }

  // Otherwise return a snippet of the response body
  return response.body ? response.body.substring(0, 200) : "No response body";
}

// Helper function to make requests
function makeRequest (url, headers, metricName, itemTrend, item, testType, data) {
  const response = http.get(url, { headers });
  const itemName = item.type.toLowerCase();

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
  validJsonRate.add(validation.isValidResponse);

  // Track the result count using Gauge.add() with the current value
  // This sets the gauge to the current value from this response instead of adding to it
  const gaugeKey = `${itemName}_${testType}`;
  if (resultGauges[gaugeKey]) {
    // Use .add() for Gauge to set the value, not accumulate it
    resultGauges[gaugeKey].add(validation.total);
  }

  // Check if the request was successful
  const success = check(response, {
    "status is 200": (r) => r.status === 200,
    "response is valid JSON": (r) => validation.isValidResponse
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
      json_valid: validation.isValidResponse,
      timestamp: new Date().toISOString()
    };

    console.log(`Failed request to ${url}: Status ${response.status}, Message: ${errorMessage}`);
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
    // if (item.segment !== "cities") continue;
    const endpointBase = `${BASE_URL}${item.api}`;

    // Test 1: Paginated request
    const paginatedUrl = `${endpointBase}?offset=0&limit=10`;
    console.log(`Testing pagination: ${paginatedUrl}`);
    const paginationResponse = makeRequest(paginatedUrl, headers, paginationTrend, item.trends.pagination, item, "pagination", data);
    sleep(1); // Short pause between requests

    // Test 2: Get first item from pagination results if available
    let firstItemId = null;
    try {
      const responseData = JSON.parse(paginationResponse.body);

      if (responseData.results && responseData.results.length > 0 && responseData.results[0].id) {
        firstItemId = responseData.results[0].id;
        const itemUrl = `${endpointBase}/${firstItemId}`;
        console.log(`Testing detail item: ${itemUrl}`);
        makeRequest(itemUrl, headers, detailItemTrend, item.trends.detail, item, "detail", data);
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
      makeRequest(searchUrl, headers, searchTrend, item.trends.search, item, "search", data);
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
    endpoints: NAVITEMS.map(item => {
        const name = item.type.toLowerCase();
        return {
          ...item,
          resultCounts: {
            detail: data.metrics[`${name}_detail_count`] ? data.metrics[`${name}_detail_count`].values?.value : 0,
            pagination: data.metrics[`${name}_pagination_count`] ? data.metrics[`${name}_pagination_count`].values?.value : 0,
            search: data.metrics[`${name}_search_count`] ? data.metrics[`${name}_search_count`].values?.value : 0
          }
        };
      }
    )
  }, null, 2);

  // HTML report - commented out as in original code
  // summary[`${resultsDir}/test-${timestamp}.html`] = generateHtmlReport(data);

  return summary;
}

// Generate HTML report function remains the same as your original code
// function generateHtmlReport(data) { ... }

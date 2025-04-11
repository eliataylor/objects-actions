import http from "k6/http";
import { check, sleep } from "k6";
import { Counter, Gauge, Rate, Trend } from "k6/metrics";
import { NAVITEMS } from "./navitems.js";

// Configuration
const BASE_URL = __ENV.REACT_APP_API_HOST; // Load API host from environment variable
const CSRF_TOKEN = __ENV.CSRF_TOKEN;
const SESSION_ID = __ENV.SESSION_ID;

// Custom metrics
const errorRate = new Rate("error_rate");
const validJsonRate = new Rate("valid_json_rate");

for (let i = 0; i < NAVITEMS.length; i++) {

  const item = NAVITEMS[i];
  const name = item.type.toLowerCase();

  // if (name !== "cities" && name !== "users") continue;

  // Create trends for response times
  item.timers = {
    pagination: new Trend(`${name}_pagination_response_time`),
    search: new Trend(`${name}_search_response_time`),
    detail: new Trend(`${name}_detail_response_time`)
  };

  item.tablesize = {
    pagination: new Gauge(`${name}_pagination_count`),
    search: new Gauge(`${name}_search_count`),
    detail: new Gauge(`${name}_detail_count`)
  };

  item.status_codes = {
    pagination: { "200s": 0, "300s": 0, "400s": 0, "500s": 0 },
    search: { "200s": 0, "300s": 0, "400s": 0, "500s": 0 },
    detail: { "200s": 0, "300s": 0, "400s": 0, "500s": 0 }
  };

  for (let i = 200; i <= 500; i += 100) {
    item.status_codes.pagination[`${i}s`] = new Counter(`${name}_pagination_status_code_${i}s`);
    item.status_codes.search[`${i}s`] = new Counter(`${name}_search_status_code_${i}s`);
    item.status_codes.detail[`${i}s`] = new Counter(`${name}_detail_status_code_${i}s`);
  }

}

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
    csrftoken: CSRF_TOKEN,
    sessionid: SESSION_ID
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
function makeRequest (url, item, testType) {

  const response = http.get(url, {
    "referer": BASE_URL,
    "Origin": BASE_URL,
    "Host:": BASE_URL.replace("https://", "").replace("http://", ""),
    "Content-Type": "application/json",
    "Accept": "application/json",
    "X-CSRFToken": CSRF_TOKEN,
    cookies: {
      csrftoken: CSRF_TOKEN,
      sessionid: SESSION_ID
    }
  });

  // Track status code
  const statusKey = Math.round(parseInt(response.status) / 100) * 100;

  if (typeof !item.status_codes[testType][`${statusKey}s`] === "undefined") {
    console.warn(`Unknown status code ${statusKey} for ${testType}`, item.status_codes[testType]);
    item.status_codes[testType][`${statusKey}s`] = new Gauge(`${item.segment}_${testType}_status_code_${statusKey}`);
  }
  item.status_codes[testType][`${statusKey}s`].add(1);

  // Add to general metric
  item.timers[testType].add(response.timings.duration);

  // Validate JSON and results array
  const validation = validateJsonResponse(response.body);
  validJsonRate.add(validation.isValidResponse);

  item.tablesize[testType].add(validation.total);

  // Check if the request was successful (includes valid permissions errors)
  const success = check(response, {
    "response is valid JSON": (r) => validation.isValidResponse
  });

  errorRate.add(!success);

  if (!success || response.status !== 200) {
    const errorMessage = extractErrorMessage(response, validation);
    console.warn(`Failed request to ${url}: Status ${response.status}, Message: ${errorMessage}`);
  }

  return response;
}

// Main function
export default function(data) {

  // Loop through each NAVITEMS and run three tests for each
  for (let i = 0; i < NAVITEMS.length; i++) {
    const item = NAVITEMS[i];

    // if (item.segment !== "cities" && item.segment !== "users") continue;

    const endpointBase = `${BASE_URL}${item.api}`;

    // Test 1: Paginated request
    const paginatedUrl = `${endpointBase}?offset=0&limit=10`;
    console.log(`Testing pagination: ${paginatedUrl}`);
    const paginationResponse = makeRequest(paginatedUrl, item, "pagination");
    sleep(1); // Short pause between requests

    // Test 2: Get first item from pagination results if available
    let firstItemId = null;
    try {
      const responseData = JSON.parse(paginationResponse.body);

      if (responseData.results && responseData.results.length > 0 && responseData.results[0].id) {
        firstItemId = responseData.results[0].id;
        const itemUrl = `${endpointBase}/${firstItemId}`;
        console.log(`Testing detail item: ${itemUrl}`);
        makeRequest(itemUrl, item, "detail");
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
      makeRequest(searchUrl, item, "search");
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

  // Create a summary object with timestamp filenames
  const summary = {};
  const endpoints = [];

  for (let i = 0; i < NAVITEMS.length; i++) {
    const item = NAVITEMS[i];
    const name = item.type.toLowerCase();
    // if (item.segment !== "cities" && item.segment !== "users") continue;
    const statusCodes = {
      pagination: { "200s": 0, "300s": 0, "400s": 0, "500s": 0 },
      search: { "200s": 0, "300s": 0, "400s": 0, "500s": 0 },
      detail: { "200s": 0, "300s": 0, "400s": 0, "500s": 0 }
    };
    for (let i = 200; i <= 500; i += 100) {
      ['pagination', 'search', 'detail'].forEach(testType => {
        statusCodes[testType][`${i}s`] = data.metrics[`${name}_${testType}_status_code_${i}s`] ? data.metrics[`${name}_${testType}_status_code_${i}s`].values?.value : 0
      })
    }

    endpoints.push({
      ...item,
      resultCounts: {
        detail: data.metrics[`${name}_detail_count`] ? data.metrics[`${name}_detail_count`].values?.value : 0,
        pagination: data.metrics[`${name}_pagination_count`] ? data.metrics[`${name}_pagination_count`].values?.value : 0,
        search: data.metrics[`${name}_search_count`] ? data.metrics[`${name}_search_count`].values?.value : 0
      },
      resultTimes: {
        detail: data.metrics[`${name}_detail_response_time`] ? data.metrics[`${name}_detail_response_time`].values : null,
        pagination: data.metrics[`${name}_pagination_response_time`] ? data.metrics[`${name}_pagination_response_time`].values : null,
        search: data.metrics[`${name}_search_response_time`] ? data.metrics[`${name}_search_response_time`].values : null
      },
      ...statusCodes
    });
  }

  summary[`${resultsDir}/test-${timestamp}.json`] = JSON.stringify({
    metrics: data.metrics,
    base_url: BASE_URL,
    root_group: data.root_group,
    endpoints: endpoints
  }, null, 2);

  // summary[`${resultsDir}/test-${timestamp}.html`] = generateHtmlReport(data);

  return summary;
}

// Generate HTML report function remains the same as your original code
// function generateHtmlReport(data) { ... }

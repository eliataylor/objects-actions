const http = require("k6/http");
const { check } = require("k6");
const { NAVITEMS } = require("./types.js");

export const options = {
  // A number specifying the number of VUs to run concurrently.
  vus: 1,
  duration: "30s",
  maxRedirects: 2
};

const MY_ENV = {
  host: "https://api.oaexample.com",
  token: "CHANGEME"
};

const BASE_REQUEST = {
  method: "GET",
  headers: {
    authority: "api.oaexample.com",
    accept: "application/json, text/plain, */*",
    "accept-language": "es-MX,es;q=0.9,en-US;q=0.8,en;q=0.7,es-419;q=0.6",
    authorization: `Bearer ${MY_ENV.token}`,
    "Cache-Control": "no-cache, no-store, must-revalidate",  // Prevents caching
    "Pragma": "no-cache",  // HTTP/1.0 backward compatibility
    "Expires": "0",  // Forces an expired date to prevent caching
    origin: "https://oaexample.com",
    referer: "https://oaexample.com/"
  }
};

function validateResponse (response, name) {

  if (response.timings.duration > 2000) {
    console.log(`Request took over 2 seconds to complete: ${response.timings.duration}ms`);
    console.log(`Request URL: ${response.request.url}`);
    console.log(`Response status: ${response.status}`);
  }

  const validationRules = [
//        ['is status 200', (r) => r.status === 200],
//        ['Response is JSON', (r) => r.headers['Content-Type'] === 'application/json'],
    ["Response has correct data property", (r) => r.json().hasOwnProperty("rows") || r.json().hasOwnProperty("canvassers") || Array.isArray(r.json())]
  ];

  const slashIndex = response.request.url.indexOf("/", response.request.url.indexOf("://") + 3);
  const basepath = response.request.url.substring(slashIndex, response.request.url.indexOf("?"));

  check(response, {
    [`${name} - ${basepath}: status code ${response.status}`]: (r) => r.status === 200
  });

  // TODO: can we take the first object ID and test requests by ID? maybe even form access?

  // Iterate over validation rules and apply checks dynamically
  for (let [description, condition] of validationRules) {
    check(response, {
      [`${name} - ${basepath}: ${description}`]: condition
    });
  }
}

export default function() {

  for (let navItem of NAVITEMS) {
    let url = `${MY_ENV.host}/${navItem.segment}`;
    const response = http.request(BASE_REQUEST.method, url, null, { headers: BASE_REQUEST.headers });
    validateResponse(response, request.name);
  }

}

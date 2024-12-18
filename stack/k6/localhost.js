import http from 'k6/http';
import {check} from 'k6';

export const options = {
    // A number specifying the number of VUs to run concurrently.
    vus: 1,
    duration: '30s',
    maxRedirects: 2
};

const MY_ENV = {
    host: "https://localapi..com:8080",
    token: "CHANGEME"
}

const BASE_REQUEST = {
    method: "GET",
    headers: {
        authority: "localapi..com",
        accept: "application/json, text/plain, */*",
        "accept-language": "es-MX,es;q=0.9,en-US;q=0.8,en;q=0.7,es-419;q=0.6",
        authorization: `Bearer ${MY_ENV.token}`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',  // Prevents caching
        'Pragma': 'no-cache',  // HTTP/1.0 backward compatibility
        'Expires': '0',  // Forces an expired date to prevent caching
        origin: "https://localapi..com",
        referer: "https://localapi..com/",
    }
}

const MY_REQUESTS = __ENV.environment === 'prod' ? [
        // PROD:
        {
            name: "Campaign Stats",
            address: "{{host}}/campaign-aggregates?start={{start_date}}&end={{end_date}}&campaign={{campaign_id}}"
        }] :
    [ // DEV:
        {
            name: "Campaign Stats",
            address: "{{host}}/aggregates/campaign?start={{start_date}}&end={{end_date}}&campaign={{campaign_id}}"
        }
    ]


function validateResponse(response, name) {

    if (response.timings.duration > 2000) {
        console.log(`Request took over 2 seconds to complete: ${response.timings.duration}ms`);
        console.log(`Request URL: ${response.request.url}`);
        console.log(`Response status: ${response.status}`);
    }

    const validationRules = [
//        ['is status 200', (r) => r.status === 200],
//        ['Response is JSON', (r) => r.headers['Content-Type'] === 'application/json'],
        ['Response has correct data property', (r) => r.json().hasOwnProperty('rows') || r.json().hasOwnProperty('canvassers') || Array.isArray(r.json())],
    ];

    const slashIndex = response.request.url.indexOf("/", response.request.url.indexOf("://") + 3);
    const basepath = response.request.url.substring(slashIndex, response.request.url.indexOf("?"));

    check(response, {
        [`${name} - ${basepath}: status code ${response.status}`]: (r) => r.status === 200,
    });

    // Iterate over validation rules and apply checks dynamically
    for (let [description, condition] of validationRules) {
        check(response, {
            [`${name} - ${basepath}: ${description}`]: condition,
        });
    }
}

export default function () {

    const params = ["host", "start_date", "end_date", "office_id", "route_id", "shift_id", "campaign_id"];

    for (let request of MY_REQUESTS) {
        let url = request.address;
        params.forEach(p => url = url.replace(`{{${p}}}`, MY_ENV[p]));

        const response = http.request(BASE_REQUEST.method, url, null, {headers: BASE_REQUEST.headers});

        validateResponse(response, request.name);
    }


}

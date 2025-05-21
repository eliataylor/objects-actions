export function generateHtmlReport (data, resultCounts) {
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
        total: resultCounts[item.api] ? resultCounts[item.api].pagination : 0,
        avg: paginationMetric.values.avg,
        min: paginationMetric.values.min,
        max: paginationMetric.values.max
      } : "N/A",
      detailItemResponse: baseMetric ? {
        total: resultCounts[item.api] ? resultCounts[item.api].detail : 0,
        avg: baseMetric.values.avg,
        min: baseMetric.values.min,
        max: baseMetric.values.max
      } : "N/A",
      searchResponse: searchMetric ? {
        total: resultCounts[item.api] ? resultCounts[item.api].search : 0,
        avg: searchMetric.values.avg,
        min: searchMetric.values.min,
        max: searchMetric.values.max
      } : "N/A",
      errors: errors[item.api]
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
                <div class="metric-item"><b>Docs:</b> <span class="result-count">${metric.detailItemResponse.total}</span></div>
                ${metric.errors.detail.length > 0 ? `<div class="metric-item"><span class="status-error">Errors: ${metric.errors.detail.length}</span></div>` : ""}
              </div>
            ` : metric.detailItemResponse}
          </td>
          <td>
            ${typeof metric.paginationResponse === "object" ? `
              <div class="metric-cell">
                <div class="metric-item"><span class="metric-label">Avg:</span> ${metric.paginationResponse.avg.toFixed(2)}</div>
                <div class="metric-item"><span class="metric-label">Min:</span> ${metric.paginationResponse.min.toFixed(2)}</div>
                <div class="metric-item"><span class="metric-label">Max:</span> ${metric.paginationResponse.max.toFixed(2)}</div>
                <div class="metric-item"><b>Docs:</b> <span class="result-count">${metric.paginationResponse.total}</span></div>
                ${metric.errors.pagination.length > 0 ?
    `<div class="metric-item"><span class="status-error">Errors: ${metric.errors.pagination.length}</span></div>` : ""}
              </div>
            ` : metric.paginationResponse}
          </td>
          <td>
            ${typeof metric.searchResponse === "object" ? `
              <div class="metric-cell">
                <div class="metric-item"><span class="metric-label">Avg:</span> ${metric.searchResponse.avg.toFixed(2)}</div>
                <div class="metric-item"><span class="metric-label">Min:</span> ${metric.searchResponse.min.toFixed(2)}</div>
                <div class="metric-item"><span class="metric-label">Max:</span> ${metric.searchResponse.max.toFixed(2)}</div>
                <div class="metric-item"><b>Docs:</b> <span class="result-count">${metric.searchResponse.total}</span></div>
                ${metric.errors.search.length > 0 ? `<div class="metric-item"><span class="status-error">Errors: ${metric.errors.search.length}</span></div>` : ""}
              </div>
            ` : metric.searchResponse}
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
    <p>Virtual Users: 1</p>
    <p>Iterations per VU: 1</p>
    
    <script>
    let coll = document.getElementsByClassName("collapsible");
    let i;

    for (i = 0; i < coll.length; i++) {
      coll[i].addEventListener("click", function() {
        this.classList.toggle("active");
        let content = this.nextElementSibling;
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

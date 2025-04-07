import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  FormControl,
  Grid,
  InputLabel,
  LinearProgress,
  MenuItem,
  Paper,
  Select,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Typography
} from "@mui/material";
import { SelectChangeEvent } from "@mui/material/Select";

// TypeScript interfaces for our data structure
interface EndpointResult {
  singular: string;
  plural: string;
  api: string;
  resultCounts: {
    detail: number;
    pagination: number;
    search: number;
  };
  trends: {
    pagination: { name: string };
    search: { name: string };
    detail: { name: string };
  };
}

interface Metric {
  type: string;
  contains: string;
  values: {
    avg?: number;
    min?: number;
    max?: number;
    med?: number;
    "p(90)"?: number;
    "p(95)"?: number;
    count?: number;
    rate?: number;
    passes?: number;
    fails?: number;
    value?: number;
  };
  thresholds?: any;
}

interface TestData {
  metrics: { [key: string]: Metric };
  endpoints: EndpointResult[];
}

const APIPerformanceDashboard = () => {
  const [data, setData] = useState<TestData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedDate, setSelectedDate] = useState<string>("2025-04-07");

  // Available test dates (normally this would be fetched from an API)
  const availableDates = [
    "2025-04-07",
    "2025-04-06",
    "2025-04-05",
    "2025-04-04",
    "2025-03-12"
  ];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch the test JSON file from Google Cloud Storage
        const url = `https://storage.googleapis.com/oa-loadtestresults/test-${selectedDate}.json`;
        const resp = await fetch(url, {
          method: "GET",
          mode: "cors",
          headers: {
            "Content-Type": "application/json"
          }
        });

        if (!resp.ok) {
          throw new Error(`HTTP error! Status: ${resp.status}`);
        }

        const parsedData = await resp.json();
        setData(parsedData);
        setError(null);
      } catch (err) {
        setError(`Failed to load test data for ${selectedDate}`);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedDate]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleDateChange = (event: SelectChangeEvent) => {
    setSelectedDate(event.target.value as string);
  };

  // Format milliseconds for display
  const formatTime = (ms: number) => {
    if (ms >= 1000) {
      return `${(ms / 1000).toFixed(2)}s`;
    }
    return `${ms.toFixed(2)}ms`;
  };

  // Get color based on response time (green -> yellow -> red)
  const getTimeColor = (time: number) => {
    if (time < 300) return "bg-green-100 text-green-800";
    if (time < 1000) return "bg-blue-100 text-blue-800";
    if (time < 3000) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  // Get status badge style
  const getStatusBadge = (code: number) => {
    if (code >= 200 && code < 300) return "bg-green-100 text-green-800";
    if (code >= 300 && code < 400) return "bg-blue-100 text-blue-800";
    if (code >= 400 && code < 500) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  if (loading) {
    return (
      <Box className="p-4">
        <LinearProgress />
        <Typography className="mt-2">Loading test results...</Typography>
      </Box>
    );
  }

  if (error || !data) {
    return (
      <Box className="p-4">
        <Alert severity="error">{error || "Failed to load data"}</Alert>
      </Box>
    );
  }

  // Extract summary metrics
  const totalRequests = data.metrics.http_reqs?.values.count || 0;
  const errorRate = data.metrics.error_rate?.values.rate || 0;
  const validJsonRate = data.metrics.valid_json_rate?.values.rate || 0;
  const avgResponseTime = data.metrics.http_req_duration?.values.avg || 0;
  const minResponseTime = data.metrics.http_req_duration?.values.min || 0;
  const maxResponseTime = data.metrics.http_req_duration?.values.max || 0;
  const p95ResponseTime = data.metrics.http_req_duration?.values["p(95)"] || 0;

  // Get HTTP status codes
  const status200Count = data.metrics.status_code_200?.values.count || 0;
  const status403Count = data.metrics.status_code_403?.values.count || 0;
  const status503Count = data.metrics.status_code_503?.values.count || 0;

  // Sort endpoints by max response time for "slowest endpoints" section
  const sortedEndpoints = [...data.endpoints].sort((a, b) => {
    const aMax = Math.max(
      data.metrics[a.trends.detail.name]?.values.avg || 0,
      data.metrics[a.trends.pagination.name]?.values.avg || 0,
      data.metrics[a.trends.search.name]?.values.avg || 0
    );

    const bMax = Math.max(
      data.metrics[b.trends.detail.name]?.values.avg || 0,
      data.metrics[b.trends.pagination.name]?.values.avg || 0,
      data.metrics[b.trends.search.name]?.values.avg || 0
    );

    return bMax - aMax;
  });

  // Find the endpoints with highest document counts
  const endpointsWithMostDocs = [...data.endpoints].sort((a, b) => {
    const aTotal = a.resultCounts.detail + a.resultCounts.pagination + a.resultCounts.search;
    const bTotal = b.resultCounts.detail + b.resultCounts.pagination + b.resultCounts.search;
    return bTotal - aTotal;
  });

  return (
    <Box className="p-4 max-w-6xl mx-auto">
      <Box className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
        <Typography variant="h4" className="font-bold mb-2 md:mb-0">API Endpoint Performance Test Report</Typography>

        <FormControl className="min-w-40">
          <InputLabel id="date-select-label">Test Date</InputLabel>
          <Select
            labelId="date-select-label"
            value={selectedDate}
            onChange={handleDateChange}
            label="Test Date"
            size="small"
          >
            {availableDates.map(date => (
              <MenuItem key={date} value={date}>
                {date}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Typography className="text-gray-500 mb-6">
        Generated: {selectedDate}T19:56:47.519Z | Base URL: https://api.oaexample.com
      </Typography>

      <Box className="mb-6">
        <Tabs value={activeTab} onChange={handleTabChange} className="mb-4" variant={'fullWidth'}>
          <Tab label="Summary" />
          <Tab label="Endpoints" />
          <Tab label="Analysis" />
        </Tabs>

        {activeTab === 0 && (
          <Box>
            {/* Summary Cards */}
            <Grid container spacing={3} className="mb-6">
              <Grid item xs={12} md={3}>
                <Card className="h-full">
                  <CardContent>
                    <Typography className="text-gray-500 text-sm">Total Requests</Typography>
                    <Typography className="text-2xl font-bold">{totalRequests}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={3}>
                <Card className="h-full">
                  <CardContent>
                    <Typography className="text-gray-500 text-sm">Error Rate</Typography>
                    <Typography className={`text-2xl font-bold ${errorRate > 0.05 ? "text-red-600" : "text-green-600"}`}>
                      {(errorRate * 100).toFixed(2)}%
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={3}>
                <Card className="h-full">
                  <CardContent>
                    <Typography className="text-gray-500 text-sm">Valid JSON Rate</Typography>
                    <Typography className={`text-2xl font-bold ${validJsonRate < 0.95 ? "text-red-600" : "text-green-600"}`}>
                      {(validJsonRate * 100).toFixed(2)}%
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={3}>
                <Card className="h-full">
                  <CardContent>
                    <Typography className="text-gray-500 text-sm">Avg Response Time</Typography>
                    <Typography className={`text-2xl font-bold ${avgResponseTime > 1000 ? "text-red-600" : "text-green-600"}`}>
                      {formatTime(avgResponseTime)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Response Time Metrics */}
            <Card className="mb-6">
              <CardContent>
                <Typography variant="h6" className="mb-3">Response Time Metrics</Typography>
                <Box className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Box>
                    <Typography className="text-gray-500 text-sm">Min Response Time</Typography>
                    <Typography className="text-xl font-semibold">{formatTime(minResponseTime)}</Typography>
                  </Box>
                  <Box>
                    <Typography className="text-gray-500 text-sm">Max Response Time</Typography>
                    <Typography className="text-xl font-semibold">{formatTime(maxResponseTime)}</Typography>
                  </Box>
                  <Box>
                    <Typography className="text-gray-500 text-sm">95th Percentile</Typography>
                    <Typography className="text-xl font-semibold">{formatTime(p95ResponseTime)}</Typography>
                  </Box>
                  <Box>
                    <Typography className="text-gray-500 text-sm">p95 Threshold Status</Typography>
                    <Chip
                      label={p95ResponseTime < 3000 ? "Passed" : "Failed"}
                      className={p95ResponseTime < 3000 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                    />
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* HTTP Status Codes */}
            <Card className="mb-6">
              <CardContent>
                <Typography variant="h6" className="mb-3">HTTP Status Codes</Typography>
                <Box className="flex flex-wrap gap-2">
                  <Chip label={`Status 200: ${status200Count} requests`} className="bg-green-100 text-green-800" />
                  {status403Count > 0 && (
                    <Chip label={`Status 403: ${status403Count} requests`} className="bg-red-100 text-red-800" />
                  )}
                  {status503Count > 0 && (
                    <Chip label={`Status 503: ${status503Count} requests`} className="bg-red-100 text-red-800" />
                  )}
                </Box>
              </CardContent>
            </Card>

            {/* Slowest Endpoints */}
            <Card className="mb-6">
              <CardContent>
                <Typography variant="h6" className="mb-3">Slowest Endpoints</Typography>
                <TableContainer component={Paper} className="overflow-x-auto">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Endpoint</TableCell>
                        <TableCell>Operation</TableCell>
                        <TableCell>Response Time</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {sortedEndpoints.slice(0, 5).map((endpoint) => {
                        const detailTime = data.metrics[endpoint.trends.detail.name]?.values.avg || 0;
                        const paginationTime = data.metrics[endpoint.trends.pagination.name]?.values.avg || 0;
                        const searchTime = data.metrics[endpoint.trends.search.name]?.values.avg || 0;

                        const operations = [
                          { name: "Detail", time: detailTime },
                          { name: "Pagination", time: paginationTime },
                          { name: "Search", time: searchTime }
                        ].sort((a, b) => b.time - a.time);

                        return operations[0].time > 0 ? (
                          <TableRow key={endpoint.api}>
                            <TableCell>{endpoint.api}</TableCell>
                            <TableCell>{operations[0].name}</TableCell>
                            <TableCell>
                              <Chip
                                label={formatTime(operations[0].time)}
                                className={getTimeColor(operations[0].time)}
                              />
                            </TableCell>
                          </TableRow>
                        ) : null;
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Box>
        )}

        {activeTab === 1 && (
          <Box>
            {/* Endpoint Performance Table */}
            <Card>
              <CardContent>
                <Typography variant="h6" className="mb-3">Endpoint Performance</Typography>
                <TableContainer component={Paper} className="overflow-x-auto">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Endpoint</TableCell>
                        <TableCell>Detail Item Response (ms)</TableCell>
                        <TableCell>Pagination Response (ms)</TableCell>
                        <TableCell>Search Response (ms)</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {data.endpoints.map((endpoint) => {
                        const detailTime = data.metrics[endpoint.trends.detail.name]?.values.avg;
                        const paginationTime = data.metrics[endpoint.trends.pagination.name]?.values.avg;
                        const searchTime = data.metrics[endpoint.trends.search.name]?.values.avg;

                        return (
                          <TableRow key={endpoint.api}>
                            <TableCell>{endpoint.api}</TableCell>
                            <TableCell>
                              {detailTime ? (
                                <Box>
                                  <Box className="flex items-center">
                                    <span className="font-bold mr-2">Avg:</span>
                                    <Chip label={formatTime(detailTime)} className={getTimeColor(detailTime)} size="small" />
                                  </Box>
                                  <Box className="text-xs mt-1">
                                    <span className="font-bold">Docs:</span> {endpoint.resultCounts.detail}
                                  </Box>
                                </Box>
                              ) : "N/A"}
                            </TableCell>
                            <TableCell>
                              {paginationTime ? (
                                <Box>
                                  <Box className="flex items-center">
                                    <span className="font-bold mr-2">Avg:</span>
                                    <Chip label={formatTime(paginationTime)} className={getTimeColor(paginationTime)} size="small" />
                                  </Box>
                                  <Box className="text-xs mt-1">
                                    <span className="font-bold">Docs:</span> {endpoint.resultCounts.pagination}
                                  </Box>
                                </Box>
                              ) : "N/A"}
                            </TableCell>
                            <TableCell>
                              {searchTime ? (
                                <Box>
                                  <Box className="flex items-center">
                                    <span className="font-bold mr-2">Avg:</span>
                                    <Chip label={formatTime(searchTime)} className={getTimeColor(searchTime)} size="small" />
                                  </Box>
                                  <Box className="text-xs mt-1">
                                    <span className="font-bold">Docs:</span> {endpoint.resultCounts.search}
                                  </Box>
                                </Box>
                              ) : "N/A"}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Box>
        )}

        {activeTab === 2 && (
          <Box>
            {/* Document Counts */}
            <Card className="mb-6">
              <CardContent>
                <Typography variant="h6" className="mb-3">Endpoints with Highest Document Counts</Typography>
                <TableContainer component={Paper}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Endpoint</TableCell>
                        <TableCell>Total Documents</TableCell>
                        <TableCell>Response Time</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {endpointsWithMostDocs.slice(0, 5).map((endpoint) => {
                        const totalDocs = endpoint.resultCounts.detail +
                          endpoint.resultCounts.pagination +
                          endpoint.resultCounts.search;
                        const avgTime = (
                          (data.metrics[endpoint.trends.detail.name]?.values.avg || 0) +
                          (data.metrics[endpoint.trends.pagination.name]?.values.avg || 0) +
                          (data.metrics[endpoint.trends.search.name]?.values.avg || 0)
                        ) / 3;

                        return totalDocs > 0 ? (
                          <TableRow key={endpoint.api}>
                            <TableCell>{endpoint.api}</TableCell>
                            <TableCell>{totalDocs.toLocaleString()}</TableCell>
                            <TableCell>
                              <Chip
                                label={formatTime(avgTime)}
                                className={getTimeColor(avgTime)}
                              />
                            </TableCell>
                          </TableRow>
                        ) : null;
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>

            {/* Performance Thresholds */}
            <Card className="mb-6">
              <CardContent>
                <Typography variant="h6" className="mb-3">Performance Thresholds</Typography>
                <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Box>
                    <Typography className="font-semibold">Error Rate Threshold</Typography>
                    <Box className="flex items-center mt-1">
                      <Typography className="mr-2">Rate &lt; 10%:</Typography>
                      <Chip
                        label={errorRate < 0.1 ? "Passed" : "Failed"}
                        className={errorRate < 0.1 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                        size="small"
                      />
                    </Box>
                  </Box>
                  <Box>
                    <Typography className="font-semibold">Valid JSON Rate Threshold</Typography>
                    <Box className="flex items-center mt-1">
                      <Typography className="mr-2">Rate &gt; 95%:</Typography>
                      <Chip
                        label={validJsonRate > 0.95 ? "Passed" : "Failed"}
                        className={validJsonRate > 0.95 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                        size="small"
                      />
                    </Box>
                  </Box>
                  <Box>
                    <Typography className="font-semibold">Response Time Threshold</Typography>
                    <Box className="flex items-center mt-1">
                      <Typography className="mr-2">p95 &lt; 3000ms:</Typography>
                      <Chip
                        label={p95ResponseTime < 3000 ? "Passed" : "Failed"}
                        className={p95ResponseTime < 3000 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                        size="small"
                      />
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* Test Configuration */}
            <Card>
              <CardContent>
                <Typography variant="h6" className="mb-3">Test Configuration</Typography>
                <Box className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Box>
                    <Typography className="text-gray-500 text-sm">Base URL</Typography>
                    <Typography>https://api.oaexample.com</Typography>
                  </Box>
                  <Box>
                    <Typography className="text-gray-500 text-sm">Virtual Users</Typography>
                    <Typography>1</Typography>
                  </Box>
                  <Box>
                    <Typography className="text-gray-500 text-sm">Iterations per VU</Typography>
                    <Typography>1</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default APIPerformanceDashboard;

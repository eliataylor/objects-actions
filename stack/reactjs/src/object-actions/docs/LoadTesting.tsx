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
  Select,
  styled,
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
import { useLocation } from "react-router-dom";

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
  timestamp: number;
  endpoints: EndpointResult[];
}

const MetricCard = styled(Card)(({ theme }) => ({
  height: "100%",
  transition: "transform 0.2s",
  "&:hover": {
    transform: "translateY(-3px)",
    boxShadow: theme.shadows[4]
  }
}));

const MetricLabel = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  fontSize: "0.875rem",
  marginRight: 2
}));

const MetricValue = styled(Typography)(({ theme }) => ({
  fontSize: "1.75rem",
  fontWeight: "bold"
}));

const SuccessValue = styled(MetricValue)(({ theme }) => ({
  color: theme.palette.success.main
}));

const ErrorValue = styled(MetricValue)(({ theme }) => ({
  color: theme.palette.error.main
}));

const SectionCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(3)
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(3)
}));

const MetricGrid = styled(Box)(({ theme }) => ({
  display: "grid",
  gridTemplateColumns: "1fr",
  gap: theme.spacing(4),
  [theme.breakpoints.up("md")]: {
    gridTemplateColumns: "repeat(4, 1fr)"
  }
}));

const MetricItem = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(1)
}));

const MetricItemLabel = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  fontSize: "0.875rem"
}));

const MetricItemValue = styled(Typography)(({ theme }) => ({
  fontSize: "1.25rem",
  fontWeight: 500
}));

const EndpointCell = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column"
}));

const CellMetricRow = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center"
}));

const DocCountRow = styled(Box)(({ theme }) => ({
  fontSize: "0.75rem"
}));

const ResultCount = styled("span")(({ theme }) => ({
  fontWeight: 500,
  color: theme.palette.secondary.main
}));

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  overflowX: "auto",
  "& .MuiTable-root": {
    borderCollapse: "collapse"
  },
  "& .MuiTableHead-root": {
    backgroundColor: theme.palette.mode === "dark"
      ? theme.palette.grey[800]
      : theme.palette.grey[100]
  },
  "& .MuiTableRow-root:hover": {
    backgroundColor: theme.palette.mode === "dark"
      ? theme.palette.grey[900]
      : theme.palette.grey[50]
  }
}));

const APIPerformanceDashboard = () => {
  const [data, setData] = useState<TestData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const params = new URLSearchParams(useLocation().search)

  const [activeTab, setActiveTab] = useState(typeof params.get('tab') === 'string' ? parseInt(params.get('tab') || '0') : 0);
  const [selectedDate, setSelectedDate] = useState<string>("2025-04-07");

  // Available test dates (normally this would be fetched from an API)
  const availableDates = [
    "2025-04-07", // Currently we only have fallback data for this date
    "2025-04-06",
    "2025-04-05"
  ];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      // Attempt to fetch the test JSON file from Google Cloud Storage with CORS mode
      const url = `https://storage.googleapis.com/oa-loadtestresults/test-${selectedDate}.json?v=${new Date().getTime()}`;

      try {
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
      } catch (primaryError) {
        console.warn("Primary fetch attempt failed:", primaryError);
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

  // Styled components for chips with different status colors
  const SuccessChip = styled(Chip)(({ theme }) => ({
    backgroundColor: theme.palette.success.light,
    color: theme.palette.success.dark
  }));

  const WarningChip = styled(Chip)(({ theme }) => ({
    backgroundColor: theme.palette.warning.light,
    color: theme.palette.warning.dark
  }));

  const ErrorChip = styled(Chip)(({ theme }) => ({
    backgroundColor: theme.palette.error.light,
    color: theme.palette.error.dark
  }));

  const InfoChip = styled(Chip)(({ theme }) => ({
    backgroundColor: theme.palette.info.light,
    color: theme.palette.info.dark
  }));

  // Format milliseconds for display
  const formatTime = (ms: number) => {
    if (ms >= 1000) {
      return `${(ms / 1000).toFixed(2)}s`;
    }
    return `${ms.toFixed(2)}ms`;
  };

  // Get chip component based on response time
  const getTimeChip = (time: number, label: string) => {
    if (time < 300) return <SuccessChip label={label} size="small" />;
    if (time < 1000) return <InfoChip label={label} size="small" />;
    if (time < 3000) return <WarningChip label={label} size="small" />;
    return <ErrorChip label={label} size="small" />;
  };

  // Get status chip component
  const getStatusChip = (code: number, label: string) => {
    if (code >= 200 && code < 300) return <SuccessChip label={label} />;
    if (code >= 300 && code < 400) return <InfoChip label={label} />;
    if (code >= 400 && code < 500) return <WarningChip label={label} />;
    return <ErrorChip label={label} />;
  };

  const LoadingContainer = styled(Box)(({ theme }) => ({
    padding: theme.spacing(4)
  }));

  const LoadingText = styled(Typography)(({ theme }) => ({
    marginTop: theme.spacing(2)
  }));

  const ErrorContainer = styled(Box)(({ theme }) => ({
    padding: theme.spacing(4)
  }));

  if (loading) {
    return (
      <LoadingContainer>
        <LinearProgress />
        <LoadingText>Loading test results...</LoadingText>
      </LoadingContainer>
    );
  }

  if (error || !data) {
    return (
      <ErrorContainer>
        <Alert severity="error">{error || "Failed to load data"}</Alert>
      </ErrorContainer>
    );
  }

  // Extract summary metrics
  const totalRequests = data.metrics.http_reqs?.values.count || 0;
  const requestRate = data.metrics.http_reqs?.values.rate || 0;
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

  // Additional styled components

  const HeaderTitle = styled(Typography)(({ theme }) => ({
    fontWeight: "bold",
    marginBottom: theme.spacing(2),
    [theme.breakpoints.up("md")]: {
      marginBottom: 0
    }
  }));

  function renderSummaryCell(metric: Metric, docs: number) {
    return <TableCell>
      {metric && metric.values ? (
        <EndpointCell>
          <CellMetricRow>
            <MetricLabel>Avg:</MetricLabel>
            {getTimeChip(metric.values.avg!, formatTime(metric.values.avg!))}
          </CellMetricRow>
          <Typography variant={"caption"}>
            <span style={{ fontWeight: "bold" }}>Min: </span>{formatTime(metric.values.min!)} | <span style={{ fontWeight: "bold" }}>Max: </span>{formatTime(metric.values.max!)}
          </Typography>
          <DocCountRow>
            <span style={{ fontWeight: "bold" }}>Docs:</span>{" "}
            <ResultCount>{docs.toLocaleString()}</ResultCount>
          </DocCountRow>
        </EndpointCell>
      ) : "N/A"}
    </TableCell>;
  }

  return (
    <Box mt={1}>
      <HeaderTitle variant="h4">API Performance Results</HeaderTitle>
      <Typography variant="subtitle1">
        Base URL: https://api.oaexample.com
      </Typography>
      <Typography variant="subtitle1">
        {data && data.timestamp ? new Intl.DateTimeFormat("en-US", {
          dateStyle: "full",
          timeStyle: "long"
        }).format(new Date(data.timestamp)) : null}
      </Typography>

      <FormControl fullWidth={true} margin={"normal"} >
        <InputLabel id="date-select-label">Test Date</InputLabel>
        <Select
          variant={"filled"}
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

      <Box>
        <Tabs
          value={activeTab}
          variant={"fullWidth"}
          onChange={handleTabChange}
          sx={{ mb: 2 }}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="Summary" />
          <Tab label="All Endpoints" />
          <Tab label="Analysis" />
        </Tabs>

        {activeTab === 2 && (
          <Box>
            <Typography gutterBottom={true}>1. Limit returned fields to those requested in query param: <a href={"https://github.com/eliataylor/objects-actions/blob/main/stack/django/oaexample_app/serializers.py#L138"}>github.com/eliataylor/objects-actions/blob/main/stack/django/oaexample_app/serializers.py#L138</a></Typography>
            <Typography gutterBottom={true}>2. Ease serializer on select foreign keys: <a href={"https://github.com/eliataylor/objects-actions/blob/main/stack/django/oaexample_app/serializers.py#L25"}>github.com/eliataylor/objects-actions/blob/main/stack/django/oaexample_app/serializers.py#L25</a></Typography>
            <Typography gutterBottom={true}>3. Replace queryset and search with Stored Procedure: https://github.com/eliataylor/objects-actions/blob/main/stack/django/oaexample_app/views.py#L113</Typography>
          </Box>
        )}
        {activeTab === 0 && (
          <Box>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6} md={3}>
                <MetricCard>
                  <CardContent>
                    <MetricLabel>Total Requests</MetricLabel>
                    <MetricValue>{totalRequests}</MetricValue>
                  </CardContent>
                </MetricCard>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <MetricCard>
                  <CardContent>
                    <MetricLabel>Request Rate <small>(reqs / second)</small></MetricLabel>
                    <MetricValue>{requestRate.toFixed(2)}</MetricValue>
                  </CardContent>
                </MetricCard>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <MetricCard>
                  <CardContent>
                    <MetricLabel>Avg Response Time</MetricLabel>
                    {avgResponseTime > 1000 ? (
                      <ErrorValue>{formatTime(avgResponseTime)}</ErrorValue>
                    ) : (
                      <SuccessValue>{formatTime(avgResponseTime)}</SuccessValue>
                    )}
                  </CardContent>
                </MetricCard>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <MetricCard>
                  <CardContent>
                    <MetricLabel>Valid Error Rate</MetricLabel>
                    {errorRate > 0.05 ? (
                      <ErrorValue>{(errorRate * 100).toFixed(2)}%</ErrorValue>
                    ) : (
                      <SuccessValue>{(errorRate * 100).toFixed(2)}%</SuccessValue>
                    )}
                  </CardContent>
                </MetricCard>
              </Grid>

            </Grid>
            <SectionCard>
              <CardContent>
                <SectionTitle variant="h6">Response Time Metrics</SectionTitle>
                <MetricGrid>
                  <MetricItem>
                    <MetricItemLabel>Min Response Time</MetricItemLabel>
                    <MetricItemValue>{formatTime(minResponseTime)}</MetricItemValue>
                  </MetricItem>
                  <MetricItem>
                    <MetricItemLabel>Max Response Time</MetricItemLabel>
                    <MetricItemValue>{formatTime(maxResponseTime)}</MetricItemValue>
                  </MetricItem>
                  <MetricItem>
                    <MetricItemLabel>95th Percentile</MetricItemLabel>
                    <MetricItemValue>{formatTime(p95ResponseTime)}</MetricItemValue>
                  </MetricItem>
                  <MetricItem>
                    <MetricItemLabel>p95 Threshold Status</MetricItemLabel>
                    {p95ResponseTime < 3000 ? (
                      <SuccessChip label="Passed" />
                    ) : (
                      <ErrorChip label="Failed" />
                    )}
                  </MetricItem>
                </MetricGrid>
              </CardContent>
            </SectionCard>

            {/* HTTP Status Codes */}
            <SectionCard>
              <CardContent>
                <SectionTitle variant="h6">HTTP Status Codes</SectionTitle>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                  <SuccessChip label={`Status 200: ${status200Count} requests`} />
                  {status403Count > 0 && (
                    <ErrorChip label={`Status 403: ${status403Count} requests`} />
                  )}
                  {status503Count > 0 && (
                    <ErrorChip label={`Status 503: ${status503Count} requests`} />
                  )}
                </Box>
              </CardContent>
            </SectionCard>
            <SectionCard>
              <CardContent>
                <SectionTitle variant="h6">Slowest Endpoints</SectionTitle>
                <StyledTableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Endpoint</TableCell>
                        <TableCell>Slowest Operation</TableCell>
                        <TableCell>Total Documents</TableCell>
                        <TableCell>Response Time</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {sortedEndpoints.map((endpoint) => {
                        const detailTime = data.metrics[endpoint.trends.detail.name]?.values.avg || 0;
                        const paginationTime = data.metrics[endpoint.trends.pagination.name]?.values.avg || 0;
                        const searchTime = data.metrics[endpoint.trends.search.name]?.values.avg || 0;

                        const operations = [
                          { name: "Detail", time: detailTime, docs: endpoint.resultCounts.detail },
                          { name: "Pagination", time: paginationTime, docs: endpoint.resultCounts.pagination },
                          { name: "Search", time: searchTime, docs: endpoint.resultCounts.search }
                        ].sort((a, b) => b.time - a.time);

                        return operations[0].time > 0 ? (
                          <TableRow key={endpoint.api}>
                            <TableCell>{endpoint.api}</TableCell>
                            <TableCell>{operations[0].name}</TableCell>
                            <TableCell>{operations[0].docs.toLocaleString()}</TableCell>
                            <TableCell>
                              {getTimeChip(operations[0].time, formatTime(operations[0].time))}
                            </TableCell>
                          </TableRow>
                        ) : null;
                      })}
                    </TableBody>
                  </Table>
                </StyledTableContainer>
              </CardContent>
            </SectionCard>

            {/* Performance Thresholds */}
            <SectionCard>
              <CardContent>
                <SectionTitle variant="h6">Performance Thresholds</SectionTitle>
                <Grid container spacing={4}>
                  <Grid item xs={12} md={6} lg={4}>
                    <Box>
                      <Typography sx={{ fontWeight: 600, mb: 1 }}>Error Rate Threshold</Typography>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Typography sx={{ mr: 2 }}>Rate &lt; 10%:</Typography>
                        {errorRate < 0.1 ? (
                          <SuccessChip label="Passed" size="small" />
                        ) : (
                          <ErrorChip label="Failed" size="small" />
                        )}
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6} lg={4}>
                    <Box>
                      <Typography sx={{ fontWeight: 600, mb: 1 }}>Valid JSON Rate Threshold</Typography>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Typography sx={{ mr: 2 }}>Rate &gt; 95%:</Typography>
                        {validJsonRate > 0.95 ? (
                          <SuccessChip label="Passed" size="small" />
                        ) : (
                          <ErrorChip label="Failed" size="small" />
                        )}
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6} lg={4}>
                    <Box>
                      <Typography sx={{ fontWeight: 600, mb: 1 }}>Response Time Threshold</Typography>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Typography sx={{ mr: 2 }}>p95 &lt; 3000ms:</Typography>
                        {p95ResponseTime < 3000 ? (
                          <SuccessChip label="Passed" size="small" />
                        ) : (
                          <ErrorChip label="Failed" size="small" />
                        )}
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </SectionCard>

            {/* Test Configuration */}
            <SectionCard sx={{ mb: 0 }}>
              <CardContent>
                <SectionTitle variant="h6">Test Configuration</SectionTitle>
                <Grid container spacing={4}>
                  <Grid item xs={12} md={4}>
                    <MetricItemLabel>Base URL</MetricItemLabel>
                    <Typography>https://api.oaexample.com</Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <MetricItemLabel>Virtual Users</MetricItemLabel>
                    <Typography>1</Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <MetricItemLabel>Iterations per VU</MetricItemLabel>
                    <Typography>1</Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </SectionCard>
          </Box>


        )}

        {activeTab === 1 && (
          <Box>
            <SectionCard>
              <CardContent>
                <SectionTitle variant="h6">Endpoint Performance</SectionTitle>
                <StyledTableContainer>
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
                      {sortedEndpoints.map((endpoint) => {
                        return (
                          <TableRow key={endpoint.api}>
                            <TableCell>{endpoint.api}</TableCell>
                            {renderSummaryCell(data.metrics[endpoint.trends.detail.name], endpoint.resultCounts.detail)}
                            {renderSummaryCell(data.metrics[endpoint.trends.pagination.name], endpoint.resultCounts.pagination)}
                            {renderSummaryCell(data.metrics[endpoint.trends.search.name], endpoint.resultCounts.search)}
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </StyledTableContainer>
              </CardContent>
            </SectionCard>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default APIPerformanceDashboard;

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
import { ModelName, NavItem } from "../types/types";

export type TestType = "search" | "pagination" | "detail";

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
  metrics: Record<string, Metric>;
  base_url?: string;
  timestamp: number;
  endpoints: EndpointResult[];
}

// Reusable type for a metric reference
type MetricReference = { name: keyof TestData["metrics"] };

// Reusable type for status codes structure
type StatusCodesStructure = {
  "200s": MetricReference;
  "300s": MetricReference;
  "400s": MetricReference;
  "500s": MetricReference;
};

// Reusable type for a test type to metric mapping
type TestTypeToMetric = {
  [K in TestType]: MetricReference;
};

interface EndpointResult extends NavItem<ModelName> {
  resultCounts: {
    [K in TestType]: number;
  };
  status_codes: {
    [K in TestType]: StatusCodesStructure;
  };
  timers: TestTypeToMetric;
  tablesize: TestTypeToMetric;
}


// Define types for the return structure
interface StatusCounts {
  "200s": number;
  "300s": number;
  "400s": number;
  "500s": number;
  others: number;
}

/**
 * Sums status codes from test data, either for all NAVITEMs or for a specific one
 *
 * @param testData The test data containing metrics and endpoints
 * @param navItemName Optional name of specific NAVITEM to sum (if omitted, sums all NAVITEMs)
 * @returns Object with status code counts
 */
function sumStatusCodes(testData: TestData, navItemName?: string): StatusCounts {
  // Initialize result object
  const result: StatusCounts = {
    "200s": 0,
    "300s": 0,
    "400s": 0,
    "500s": 0,
    "others": 0
  };

  // Process each endpoint
  for (const endpoint of testData.endpoints) {
    const currentNavName = endpoint.type.toLowerCase();

    // Skip if a specific navItemName was requested and this isn't it
    if (navItemName && currentNavName !== navItemName) {
      continue;
    }

    // Process each test type (pagination, search, detail)
    if (endpoint.status_codes) {
      for (const testType in endpoint.status_codes) {
        // @ts-ignore
        const statusCodes = endpoint.status_codes[testType];
        for (const range in statusCodes) {
          const key = `${currentNavName}_${testType}_status_code_${range}` as keyof typeof testData.metrics;
          if (typeof testData.metrics[key] !== "undefined" && typeof testData.metrics[key].values.count !== "undefined") {
            const count = testData.metrics[key].values.count as number;
            result[range as keyof StatusCounts] += count;
          }
        }
      }
    }
  }

  return result;
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
  gap: theme.spacing(1),
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

  const params = new URLSearchParams(useLocation().search);

  const [activeTab, setActiveTab] = useState(typeof params.get("tab") === "string" ? parseInt(params.get("tab") || "0") : 0);
  const [selectedDate, setSelectedDate] = useState<string>("2025-04-11-localhost");

  // Available test dates (normally this would be fetched from an API)
  const availableDates = [
    "2025-04-11-localhost",
    "2025-04-11-production"
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
  const statusCodes = sumStatusCodes(data, undefined);

  // Sort endpoints by max response time for "slowest endpoints" section
  const sortedEndpoints = [...data.endpoints].sort((a, b) => {
    const aMax = Math.max(
      data.metrics[a.timers.detail.name]?.values.avg || 0,
      data.metrics[a.timers.pagination.name]?.values.avg || 0,
      data.metrics[a.timers.search.name]?.values.avg || 0
    );

    const bMax = Math.max(
      data.metrics[b.timers.detail.name]?.values.avg || 0,
      data.metrics[b.timers.pagination.name]?.values.avg || 0,
      data.metrics[b.timers.search.name]?.values.avg || 0
    );

    return bMax - aMax;
  });

  const HeaderTitle = styled(Typography)(({ theme }) => ({
    fontWeight: "bold",
    marginBottom: theme.spacing(2),
    [theme.breakpoints.up("md")]: {
      marginBottom: 0
    }
  }));

  function renderSummaryCell(metric: Metric, docs: number, model_name: string) {
    if (!data) return null;
    const codes = sumStatusCodes(data, model_name);

    const toshow: string[] = [];
    ["200s", "300s", "400s", "500s", "others"].forEach(key => {
      if (codes[key as keyof StatusCounts] > 0) {
        toshow.push(`${key}: ${codes[key as keyof StatusCounts]}`);
      }
    });


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
          <DocCountRow>
            <span style={{ fontWeight: "bold" }}>Codes:</span>{" "} {toshow.join(", ")}
          </DocCountRow>
        </EndpointCell>
      ) : "N/A"}
    </TableCell>;
  }

  return (
    <Box mt={1}>
      <HeaderTitle variant="h4">API Performance Results</HeaderTitle>
      <Typography variant="subtitle1">
        Base URL: {data.base_url ?? "https://api.oaexample.com"}
      </Typography>
      <Typography variant="subtitle1">
        {data && data.timestamp ? new Intl.DateTimeFormat("en-US", {
          dateStyle: "full",
          timeStyle: "long"
        }).format(new Date(data.timestamp)) : null}
      </Typography>

      <FormControl fullWidth={true} margin={"normal"}>
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
            <Typography gutterBottom={true}>1. Limit returned fields to only those requested by client with query param: <a target={"_blank"}
                                                                                                                            href={"https://github.com/eliataylor/objects-actions/blob/main/stack/django/oaexample_app/serializers.py#L138"}>github.com/.../django/oaexample_app/serializers.py#L138</a></Typography>
            <Typography gutterBottom={true}>2. Ease serializer on foreign keys that can be loaded separately: <a target={"_blank"}
                                                                                                                 href={"https://github.com/eliataylor/objects-actions/blob/main/stack/django/oaexample_app/serializers.py#L25"}>github.com/.../django/oaexample_app/serializers.py#L25</a></Typography>
            <Typography gutterBottom={true}>3. Replace queryset and `search_filter` with SQL / Stored Procedure: <a target={"_blank"}
                                                                                                                    href={"https://github.com/eliataylor/objects-actions/blob/main/stack/django/oaexample_app/views.py#L113"}>github.com/.../django/oaexample_app/views.py#L113</a></Typography>
          </Box>
        )}
        {activeTab === 0 && (
          <Box>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={4}>
                <MetricCard>
                  <CardContent>
                    <MetricLabel>Total Requests</MetricLabel>
                    <MetricValue>{totalRequests}</MetricValue>
                  </CardContent>
                </MetricCard>
              </Grid>

              <Grid item xs={12} sm={4}>
                <MetricCard>
                  <CardContent>
                    <MetricLabel>Request Rate <small>(reqs / second)</small></MetricLabel>
                    <MetricValue>{requestRate.toFixed(2)}</MetricValue>
                  </CardContent>
                </MetricCard>
              </Grid>

              <Grid item xs={12} sm={4}>
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
            </Grid>
            <SectionCard>
              <CardContent>
                <SectionTitle variant="h6">Status Codes</SectionTitle>
                <Grid container justifyContent={"space-between"}>
                  <SuccessChip label={`200s: ${statusCodes["200s"]}`} />
                  <InfoChip label={`300s: ${statusCodes["300s"]}`} />
                  <WarningChip label={`400s: ${statusCodes["400s"]}`} />
                  <ErrorChip label={`500s: ${statusCodes["500s"]}`} />
                </Grid>
              </CardContent>
            </SectionCard>

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
                        const detailTime = data.metrics[endpoint.timers.detail.name]?.values.avg || 0;
                        const paginationTime = data.metrics[endpoint.timers.pagination.name]?.values.avg || 0;
                        const searchTime = data.metrics[endpoint.timers.search.name]?.values.avg || 0;

                        const operations = [
                          { name: "Detail", time: detailTime, docs: endpoint.resultCounts.detail },
                          { name: "Pagination", time: paginationTime, docs: endpoint.resultCounts.pagination },
                          { name: "Search", time: searchTime, docs: endpoint.resultCounts.search }
                        ].sort((a, b) => b.time - a.time);

                        return operations[0].time > 0 ? (
                          <TableRow key={endpoint.api}>
                            <TableCell><a href={`https://api.oaexample.com${endpoint.api}`} target={"_blank"}>{endpoint.api}</a></TableCell>
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
                    <Typography>{data.base_url ?? "https://api.oaexample.com"}</Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <MetricItemLabel>Virtual Users</MetricItemLabel>
                    <Typography>{data.metrics.vus_max.values.value}</Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <MetricItemLabel>Iterations per VU</MetricItemLabel>
                    <Typography>{data.metrics.iterations.values.count}</Typography>
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
                            <TableCell><a href={`https://api.oaexample.com${endpoint.api}`} target={"_blank"}>{endpoint.api}</a></TableCell>
                            {renderSummaryCell(data.metrics[endpoint.timers.detail.name], endpoint.resultCounts.detail, endpoint.type.toLowerCase())}
                            {renderSummaryCell(data.metrics[endpoint.timers.pagination.name], endpoint.resultCounts.pagination, endpoint.type.toLowerCase())}
                            {renderSummaryCell(data.metrics[endpoint.timers.search.name], endpoint.resultCounts.search, endpoint.type.toLowerCase())}
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

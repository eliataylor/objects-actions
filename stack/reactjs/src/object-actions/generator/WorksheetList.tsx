import React, { useEffect } from "react";
import { AppBar, Box, Grid, LinearProgress, Typography } from "@mui/material";
import TablePaginator from "../../components/TablePaginator";
import ApiClient, { HttpResponse } from "../../config/ApiClient";
import { useLocation, useNavigate } from "react-router-dom";
import { Add } from "@mui/icons-material";
import { WorksheetListResponse } from "./generator-types";
import WorksheetCard from "./WorksheetCard";
import { TightButton } from "../../theme/StyledFields";

const WorksheetList = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [listData, updateData] = React.useState<WorksheetListResponse | null | string>(null);

  const handlePagination = (limit: number, offset: number) => {
    const params = new URLSearchParams(location.search);
    params.set("offset", offset.toString());
    params.set("limit", limit.toString());
    navigate({ search: params.toString() });
  };

  useEffect(() => {
    const fetchData = async (offset = 0, limit = 10) => {
      let apiUrl = `/api/worksheets`;

      const params = new URLSearchParams();

      if (offset > 0) {
        params.set("offset", offset.toString());
      }
      if (limit > 0) {
        params.set("limit", limit.toString());
      }

      apiUrl += `/?${params.toString()}`;
      const response: HttpResponse<WorksheetListResponse> = await ApiClient.get(apiUrl);
      if (response.error) {
        return updateData(response.error);
      }

      updateData(response.data as WorksheetListResponse);
    };

    const params = new URLSearchParams(location.search);
    const offset = params.has("offset") ? parseInt(params.get("offset") || "0") : 0;
    const limit = params.has("limit") ? parseInt(params.get("limit") || "10") : 10;
    fetchData(offset, limit);
  }, [location.search]);

  const addButton = <TightButton
    color="secondary"
    variant={"contained"}
    startIcon={<Add />}
    data-href={`/oa/schemas/add`}
    onClick={() => navigate(`/oa/schemas/add`)}
  >
    Start a Thread
  </TightButton>;

  let content = null;
  if (!listData) {
    content = <Typography color={"warning"}><LinearProgress /></Typography>;
  } else if (typeof listData === "string") {
    content = <Typography color={"error"}>{listData} {addButton}</Typography>;
  } else {
    content = (
      <React.Fragment>
        <AppBar
          position="sticky"
          sx={{ marginBottom: 10 }}
          color="inherit"
        >
          <Grid
            pl={1} pr={1}
            container
            justifyContent="space-between"
            alignContent="center"
            alignItems="center"
          >
            <Grid item>
              Ideas
            </Grid>
            <TablePaginator
              totalItems={listData.count}
              onPageChange={handlePagination}
            />
            <Grid item>
              {addButton}
            </Grid>
          </Grid>
        </AppBar>
        <Grid container gap={2}>
          {listData.results.map((obj, i) => (
            <Grid xs={12} item key={`worksheetcard-${i}`}>
              <WorksheetCard worksheet={obj} />
            </Grid>
          ))}
        </Grid>
      </React.Fragment>
    );

  }

  return (
    <Box sx={{ padding: 2 }} id="WorksheetList">
      {content}
    </Box>
  );
};

export default WorksheetList;

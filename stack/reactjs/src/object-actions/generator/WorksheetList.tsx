import React, { useEffect } from "react";
import { AppBar, Box, Fab, Grid } from "@mui/material";
import TablePaginator from "../../components/TablePaginator";
import ApiClient, { HttpResponse } from "../../config/ApiClient";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Add } from "@mui/icons-material";
import { useAuth } from "../../allauth/auth";
import { WorksheetListResponse } from "./WorksheetType";
import WorksheetCard from "./WorksheetCard";
import WorksheetDetail from "./WorksheetDetail";

const WorksheetList = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const me = useAuth()?.data?.user;
  const { id } = useParams();
  const [listData, updateData] = React.useState<WorksheetListResponse | null | string>(null);

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

  const handlePagination = (limit: number, offset: number) => {
    const params = new URLSearchParams(location.search);
    params.set("offset", offset.toString());
    params.set("limit", limit.toString());
    navigate({ search: params.toString() });
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const offset = params.has("offset") ? parseInt(params.get("offset") || "0") : 0;
    const limit = params.has("limit") ? parseInt(params.get("limit") || "10") : 10;
    fetchData(offset, limit);
  }, [location.pathname, location.search]);

  let content = null;
  if (!listData) {
    content = <div>Loading...</div>;
  } else if (typeof listData === "string") {
    content = <div>{listData}</div>;
  } else if (id) {
    content = listData.results.find(l => l.id === parseInt(id))
    if (!content) content = <div>invalid id</div>;
    else content = <WorksheetDetail worksheet={content} />
  } else {
    content = (
      <React.Fragment>
        <AppBar
          position="sticky"
          sx={{ marginBottom: 10 }}
          color="inherit"
        >
          <Grid
            pl={1}
            container
            justifyContent="space-between"
            alignContent="center"
            alignItems="center"
          >
            <Grid item>Worksheets</Grid>
            <TablePaginator
              totalItems={listData.count}
              onPageChange={handlePagination}
            />
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

      <Fab
        color="secondary"
        size="small"
        sx={{ position: "fixed", right: 20, bottom: 20 }}
        data-href={`/oa/worksheets/add`}
        onClick={() => navigate(`/oa/worksheets/add`)}
      >
        <Add />
      </Fab>
    </Box>
  );
};

export default WorksheetList;

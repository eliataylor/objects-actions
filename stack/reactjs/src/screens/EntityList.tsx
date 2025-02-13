import React, { useEffect } from "react";
import { AppBar, Box, Fab, Grid } from "@mui/material";
import { ApiListResponse, ModelName, NavItem, ModelType, NAVITEMS } from "../object-actions/types/types";
import EntityCard from "../object-actions/components/EntityCard";
import TablePaginator from "../components/TablePaginator";
import ApiClient from "../config/ApiClient";
import { useLocation, useNavigate } from "react-router-dom";
import { Add } from "@mui/icons-material";
import { canDo } from "../object-actions/types/access";
import { useAuth } from "../allauth/auth";
import PermissionError from "../components/PermissionError";

interface EntityListProps<T extends ModelName = ModelName> {
  model?: T;
  author?: number | string;
  showFab?: boolean;
}

const EntityList = <T extends ModelName>({
  model,
  author,
  showFab = false
}: EntityListProps<T>) => {
  const location = useLocation();
  const navigate = useNavigate();
  const me = useAuth()?.data?.user;
  const [listData, updateData] = React.useState<
    ApiListResponse<T> | null | string
  >(null);

  const hasUrl = NAVITEMS.find((nav) => {
    if (!model) {
      return location.pathname.indexOf(`/${nav.segment}`) === 0;
    } else {
      return model === nav.type;
    }
  }) as NavItem<T>;

  const fetchData = async (offset = 0, limit = 10) => {
    if (!hasUrl) {
      console.error("NO URL " + model, location.pathname);
      return;
    }

    let apiUrl = ``;
    if (author) {
      apiUrl += `/api/users/${author}/${hasUrl.type.toLowerCase()}/list`;
    } else {
      apiUrl += `/api/${hasUrl.segment}`;
    }

    const params = new URLSearchParams();

    if (offset > 0) {
      params.set("offset", offset.toString());
    }
    if (limit > 0) {
      params.set("limit", limit.toString());
    }

    apiUrl += `/?${params.toString()}`;
    const response = await ApiClient.get(apiUrl);
    if (response.error) {
      return updateData(response.error);
    }

    updateData(response.data as ApiListResponse<T>);
  };

  const handlePagination = (limit: number, offset: number) => {
    if (!model) {
      // a view page so we can change query params
      const params = new URLSearchParams(location.search);
      params.set("offset", offset.toString());
      params.set("limit", limit.toString());
      navigate({ search: params.toString() });
    } else {
      fetchData(offset, limit);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const offset = params.has("offset") ? parseInt(params.get("offset") || "0") : 0;
    const limit = params.has("limit") ? parseInt(params.get("limit") || "10") : 10;
    fetchData(offset, limit);
  }, [model, location.pathname, location.search]);

  if (!hasUrl) return <div>Invalid URL...</div>;

  let content = null;
  if (!listData) {
    content = <div>Loading...</div>;
  } else if (typeof listData === "string") {
    content = <div>{listData}</div>;
  } else {
    const firstResult = listData.results[0] as ModelType<T>;
    const canView = (!listData.results.length) ? true : canDo("view", firstResult, me);
    // TODO: make this check BOTH own and others since list could contain both!

    if (typeof canView === "string") {
      content = <PermissionError error={canView} />;
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
              <Grid item>{hasUrl.plural}</Grid>
              <TablePaginator
                totalItems={listData.count}
                onPageChange={handlePagination}
              />
            </Grid>
          </AppBar>
          <Grid container gap={2}>
            {listData.results.map((obj, i) => (
              <Grid xs={12} item key={`entitycard-${i}`}>
                <EntityCard entity={obj} />
              </Grid>
            ))}
          </Grid>
        </React.Fragment>
      );
    }
  }

  return (
    <Box sx={{ padding: 2 }} id="EntityList">
      {content}

      {showFab && (
        <Fab
          color="secondary"
          size="small"
          sx={{ position: "fixed", right: 20, bottom: 20 }}
          data-href={`/forms/${hasUrl.segment}/0/add`}
          onClick={() => navigate(`/forms/${hasUrl.segment}/0/add`)}
        >
          <Add />
        </Fab>
      )}
    </Box>
  );
};

export default EntityList;

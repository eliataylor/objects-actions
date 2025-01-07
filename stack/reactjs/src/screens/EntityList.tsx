import React, { useEffect } from "react";
import { AppBar, Box, Fab, Grid, Typography } from "@mui/material";
import { ApiListResponse, NAVITEMS } from "../object-actions/types/types";
import EntityCard from "../object-actions/components/EntityCard";
import TablePaginator from "../components/TablePaginator";
import ApiClient from "../config/ApiClient";
import { useLocation, useNavigate } from "react-router-dom";
import { Add } from "@mui/icons-material";
import { canDo } from "../object-actions/types/access";
import { useAuth } from "../allauth/auth";

interface EntityListProps {
  model?: string;
  author?: number | string;
  showFab?: boolean;
}

const EntityList: React.FC<EntityListProps> = ({
                                                 model,
                                                 author,
                                                 showFab = false
                                               }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const me = useAuth()?.data?.user;
  const [listData, updateData] = React.useState<
    ApiListResponse | null | string
  >(null);

  const hasUrl = NAVITEMS.find((nav) => {
    if (!model) {
      return location.pathname.indexOf(`/${nav.segment}`) === 0;
    } else {
      return model === nav.type;
    }
  });

  const fetchData = async (page = 0, pageSize = 0) => {
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

    if (page > 0) {
      params.set("page", page.toString());
    }
    if (pageSize > 0) {
      params.set("page_size", pageSize.toString());
    }

    apiUrl += `/?${params.toString()}`;
    const response = await ApiClient.get(apiUrl);
    if (response.error) {
      return updateData(response.error);
    }

    updateData(response.data as ApiListResponse);
  };

  function handlePagination(page: number, pageSize: number) {
    if (!model) {
      // a view page so we can change query params
      const params = new URLSearchParams(location.search);
      params.set("page", page.toString());
      params.set("page_size", pageSize.toString());
      navigate({ search: params.toString() });
      return;
    } else {
      fetchData(page, pageSize);
    }
  }

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const page = params.has("page") ? parseInt(params.get("page") || "0") : 0;
    const page_size = params.has("page_size")
      ? parseInt(params.get("page_size") || "0")
      : 0;
    fetchData(page, page_size);
  }, [model, location.pathname, location.search]);

  if (!hasUrl) return <div>Invalid URL...</div>;


  let content = null;
  if (!listData) {
    content = <div>Loading...</div>;
  } else if (typeof listData === "string") {
    content = <div>{listData}</div>;
  } else {

    const canView = (!listData.results.length) ? true : canDo("view", listData.results[0], me);
    // TODO: make this check BOTH own and others since list could contain both!

    if (typeof canView === "string") {
      content = <Typography variant={'subtitle1'} color={'error'}>{canView}</Typography>;
    } else {
      content = <React.Fragment>
        <AppBar
          position={"sticky"}
          sx={{ marginBottom: 10 }}
          color={"inherit"}
        >
          <Grid
            pl={1}
            container
            justifyContent={"space-between"}
            alignContent={"center"}
            alignItems={"center"}
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
      </React.Fragment>;
    }

  }

  return (
    <Box sx={{ padding: 2 }} id={"EntityList"}>

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

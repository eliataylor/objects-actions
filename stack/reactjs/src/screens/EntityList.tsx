import React, {useEffect} from 'react';
import {AppBar, Box, Fab, Grid} from "@mui/material";
import {ApiListResponse, NAVITEMS} from "../object-actions/types/types";
import EntityCard from "../object-actions/EntityCard";
import TablePaginator from "../components/TablePaginator";
import ApiClient from "../config/ApiClient";
import {useLocation, useNavigate} from "react-router-dom";
import {Add} from "@mui/icons-material";
import {canDo, getEndpoints} from "../object-actions/types/access";

interface EntityListProps {
    model?: string;
    author?: number | string;
    showFab?: boolean;
}

const EntityList: React.FC<EntityListProps> = ({model, author, showFab = false}) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [listData, updateData] = React.useState<ApiListResponse | null | string>(null);

    const hasUrl = NAVITEMS.find(nav => {
        if (!model) {
            return location.pathname.indexOf(nav.screen) === 0
        } else {
            return model === nav.type;
        }
    });

    const fetchData = async (page: number = 0, pageSize: number = 0) => {
        if (!hasUrl) {
            console.error('NO URL ' + model, location.pathname)
            return;
        }

        let apiUrl = ``;
        if (author) {
            apiUrl += `/api/users/${author}/${hasUrl.type.toLowerCase()}`
        } else {
            apiUrl += hasUrl.api
        }

        const params = new URLSearchParams();

        if (page > 0) {
            params.set('page', page.toString());
        }
        if (pageSize > 0) {
            params.set('page_size', pageSize.toString());
        }

        apiUrl += `/?${params.toString()}`
        const response = await ApiClient.get(apiUrl);
        if (response.error) {
            return updateData(response.error)
        }

        updateData(response.data as ApiListResponse);
    };

    function handlePagination(page: number, pageSize: number) {
        if (!model) { // a view page so we can change query params
            const params = new URLSearchParams(location.search);
            params.set('page', page.toString());
            params.set('page_size', pageSize.toString());
            navigate({search: params.toString()});
            return;
        } else {
            fetchData(page, pageSize)
        }
    }

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const page = params.has('page') ? parseInt(params.get('page') || '0') : 0
        const page_size = params.has('page_size') ? parseInt(params.get('page_size') || '0') : 0
        fetchData(page, page_size);
    }, [model, location.pathname, location.search]);


    if (!hasUrl) return <div>Invalid URL...</div>

    // const allow = canDo('view', hasUrl.segment, me, entity)

    return (
        <Box sx={{padding: 2}} id={"EntityList"}>
            {!listData ? <div>Loading...</div>
            : typeof listData === 'string' ? <div>{listData}</div>
                :
                <React.Fragment>
                    <AppBar position={'sticky'} sx={{marginBottom: 10}} color={'inherit'}>
                        <Grid pl={1} container justifyContent={'space-between'} alignContent={'center'} alignItems={'center'}>
                            <Grid item>{hasUrl.plural}</Grid>
                            <TablePaginator totalItems={listData.count} onPageChange={handlePagination}/>
                        </Grid>
                    </AppBar>
                    <Grid container gap={2}>
                        {listData.results.map((obj, i) => <Grid xs={12} item key={`entitycard-${i}`}><EntityCard
                            entity={obj}/></Grid>)
                        }
                    </Grid>
                </React.Fragment>
            }
            {showFab && <Fab color="secondary"
                             size="small"
                             sx={{position: 'fixed', right: 20, bottom: 20}}
                             data-href={`/forms${hasUrl.screen}/0/add`}
                             onClick={() => navigate(`/forms${hasUrl.screen}/0/add`)}>
              <Add/>
            </Fab>}
        </Box>
    );
};

export default EntityList;

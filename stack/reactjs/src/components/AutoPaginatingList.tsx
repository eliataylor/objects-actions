import React, {useCallback, useEffect, useState} from "react";
import {Box, LinearProgress} from "@mui/material";
import { ApiListResponse, ModelName } from "../object-actions/types/types";
import ApiClient from "../config/ApiClient";
import { trackGAEvent } from "../config/GaTracking";

interface AutoPaginatingListProps<T extends ModelName = ModelName> {
    basePath: string;
    count: number;
    limit: number;
    offset: number;
    onSuccess?: (data: ApiListResponse<T>) => void;
    onError?: (error: string) => void;
    children: React.ReactNode;
}


const AutoPaginatingList = <T extends ModelName>({
                                                     basePath, limit, count, offset, onSuccess, onError, children
                                                 }: AutoPaginatingListProps<T>) => {
    const [loading, setLoading] = useState(false);

    const fetchData = useCallback(async (newOffset = 0, newLimit = 10) => {

        if (loading) {
            console.log(`Loading pagination, skipping fetchData`);
            return;
        }

        setLoading(true);
        const params = new URLSearchParams();
        params.set("offset", newOffset.toString());
        params.set("limit", newLimit.toString());
        const apiUrl = basePath + (basePath.indexOf("?") > -1 ? `&${params.toString()}` : `?${params.toString()}`);

        console.log(`Paginate ${apiUrl}`);
        const response = await ApiClient.get(apiUrl);
        if (response.error) {
            if (onError) onError(response.error);
        } else {
            if (onSuccess) onSuccess(response.data as ApiListResponse<T>);
        }
        setLoading(false);

        trackGAEvent('auto_paginate_search', {
            event_category: 'auto_paginate',
            event_label: 'auto_paginate',
            value: apiUrl,
        });

    }, [basePath, limit, offset, onError, onSuccess]);

    // Scroll handler
    useEffect(() => {
        const handleScroll = () => {
            const scrollPosition = window.innerHeight + window.scrollY;
            const bottomPosition = document.documentElement.scrollHeight;
            if (loading || count <= offset) return;
            if (bottomPosition - scrollPosition <= 150) {
                fetchData(offset + limit, limit);
            }
        };
        window.addEventListener("scroll", handleScroll);
        return () => {
            window.removeEventListener("scroll", handleScroll);
        };

    }, [basePath, count, offset, limit, loading]);

    useEffect(() => {
        fetchData(offset, limit)
    }, [basePath]);

    return (
        <Box id="AutoPaginatingList">
            {children}
            {loading && <LinearProgress />}
        </Box>
    );
};

export default AutoPaginatingList;

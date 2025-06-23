"use client"

import { useSearchParams } from "next/navigation"
import { SearchBox } from "~/app/_components/SearchBox"
import { useState, useCallback } from "react"
import { type ModelName, NAVITEMS, type SearchResponse } from "~/types/types"
import { Box, Typography, CircularProgress, Alert } from "@mui/material"
import EntityCard from "../_components/EntityCard"
import ApiClient from "../_components/ApiClient"
import z from "zod"
import { SelectionCount } from "../_components/SelectionCount"

// Define our search schema using zod
const searchSchema = z.object({
    types: z.array(z.enum([
        "Users",
        "Drugs",
        "SideEffects",
        "DrugEffects",
        "Manufacturers",
        "Trials",
        "DrugComparisons"
    ] as const)),
    query: z.string().min(1)
});

// Get searchable nav items (excluding admin and vocabulary types)
const searchableNavItems = NAVITEMS.filter(item =>
    item.model_type !== 'vocabulary' &&
    item.permissions !== 'IsAdmin' &&
    item.search_fields.length > 0
);

export default function SearchPage() {
    const searchParams = useSearchParams()
    const query = searchParams.get('q') || ""

    // Get valid types from URL params, defaulting to first searchable type
    const defaultType = searchableNavItems[0]?.type ?? "Drugs";
    const types = (searchParams.get('types')?.split(',')
        .filter(t => searchableNavItems.some(item => item.type === t)) || [defaultType]) as ModelName[];

    const [searchResults, setSearchResults] = useState<SearchResponse | null>(null);
    const [error, setError] = useState<Error | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const performSearch = useCallback(async (searchQuery: string, searchTypes: ModelName[]) => {
        try {
            // Only proceed if we have a valid query
            if (!searchQuery.trim()) {
                setSearchResults(null);
                return;
            }

            // Validate input
            const validInput = searchSchema.parse({
                types: searchTypes,
                query: searchQuery
            });

            setIsLoading(true);

            // Build query parameters
            const params = new URLSearchParams({
                query: validInput.query,
                types: validInput.types.join(',')
            });

            // Make GET API call
            const response = await ApiClient.get<SearchResponse>(`/api/search?${params.toString()}`);

            if (!response.success || !response.data) {
                throw new Error(response.error || 'Search failed');
            } else {
                setSearchResults(response.data);
                setError(null);
            }

        } catch (err) {
            setError(err instanceof Error ? err : new Error("Unknown error occurred"));
        } finally {
            setIsLoading(false);
        }
    }, []);

    function renderError() : string {
        if (error) {
            if (error instanceof z.ZodError) {
                return JSON.stringify(error.format(), null, 2);
            }
            return error.message;
        }
        return "unknown error";
    }

    return (
        <Box sx={{ p: 2 }}>
            <SearchBox
                onSearch={performSearch}
                defaultTypes={types}
            />

            {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                    {renderError()}
                </Alert>
            )}

            {isLoading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <CircularProgress />
                </Box>
            )}

            {searchResults ? (
                    <Box sx={{ mt: 4 }}>
                        {Object.entries(searchResults.results).map(([type, result]) => {
                            const navItem = searchableNavItems.find(item => item.type === type as ModelName)
                            if (!navItem) {
                                console.error(`No navItem found for type: ${type}`);
                                return null;
                            }

                            return (
                                <Box key={type} sx={{ mb: 4, mt:2 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="h6" gutterBottom>
                                            {navItem.plural} ({result.count})
                                        </Typography>
                                        <SelectionCount type={navItem.type} />
                                    </Box>
                                    <Box sx={{ display: 'grid', gap: 2 }}>
                                        {(!result?.items || result.items.length === 0) ? null : result.items.map((item) => (
                                            <EntityCard
                                                key={item.id}
                                                entity={item}
                                            />
                                        ))}
                                    </Box>
                                </Box>
                            )
                        })}
                    </Box>
                ) : (query) ? (
                    <Box sx={{ mt: 4, textAlign: 'center' }}>
                        <Typography color="text.secondary">
                            No results found for "{query}"
                        </Typography>
                    </Box>
                ) : null
            }
        </Box>
    )
} 
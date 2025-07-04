import { Suspense } from "react";
import { notFound } from "next/navigation";
import { AppBar, Box, Fab, LinearProgress, Typography } from "@mui/material";
import { Add } from "@mui/icons-material";
import Link from "next/link";

import { NAVITEMS, type ModelName, type ModelType } from "~/types/types";
import EntityCard from "../_components/EntityCard";
import PageLayout from "../_components/PageLayout";
import TablePaginator from "../_components/TablePaginator";
import SearchBar from "../_components/SearchBar";
import { api, HydrateClient } from "~/trpc/server";

type Props = {
  params: Promise<{ segment: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

// Server-side component with tRPC prefetching
async function EntityListContent({
  navItem,
  offset,
  limit,
  searchQuery
}: {
  navItem: typeof NAVITEMS[0];
  offset: number;
  limit: number;
  searchQuery?: string;
}) {

  // 🚀 Use tRPC for server-side data fetching
  const entityData = await api.entities.list({
    entityType: navItem.type as ModelName,
    limit,
    offset,
    search: searchQuery,
  });

  const { results, count } = entityData;

  const currentPage = Math.floor(offset / limit);

  return (
    <>
      {/* Search Bar */}
      <SearchBar currentType={navItem.type as ModelName} />

      {/* Header */}
      <AppBar position="sticky" sx={{ mb: 2 }} color="inherit" elevation={1}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ p: 2 }}>
            <Typography variant="h6">
              {navItem.plural}
              {searchQuery && (
                <Typography component="span" variant="body2" sx={{ ml: 1, opacity: 0.7 }}>
                  - filtered by "{searchQuery}"
                </Typography>
              )}
            </Typography>
          </Box>
          <TablePaginator
            totalItems={count}
            currentPage={currentPage}
            rowsPerPage={limit}
          />
        </Box>
      </AppBar>

      {/* Results */}
      <Box>
        {results.length > 0 ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {results.map((item: ModelType<ModelName>, i) => (
              <Box key={`entitycard-${i}`}>
                <EntityCard entity={item} />
              </Box>
            ))}
          </Box>
        ) : (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary">
              No {navItem.plural.toLowerCase()} found
            </Typography>
          </Box>
        )}
      </Box>

      {
        <Fab
          color="secondary"
          size="small"
          sx={{ position: "fixed", right: 20, bottom: 20 }}
          component={Link}
          href={ `/forms/${navItem.segment}/add`}
        >
          <Add />
        </Fab>
      }
    </>
  );
}

// Main page with tRPC prefetching
export default async function DynamicPageWithTRPC({ params, searchParams }: Props) {
  // Await params and searchParams as required by Next.js 15
  const { segment } = await params;
  const searchParamsResolved = await searchParams;

  const offset = typeof searchParamsResolved.offset === 'string' ? parseInt(searchParamsResolved.offset) || 0 : 0;
  const limit = typeof searchParamsResolved.limit === 'string' ? parseInt(searchParamsResolved.limit) || 10 : 10;
  const searchQuery = typeof searchParamsResolved.search === 'string' ? searchParamsResolved.search : undefined;

  const navItem = NAVITEMS.find(item => item.segment === segment);
  if (!navItem) notFound();

  void api.entities.list.prefetch({
    entityType: navItem.type as ModelName,
    limit,
    offset,
    search: searchQuery,
  });

  return (
    <HydrateClient>
      <PageLayout navItem={navItem}>
        <Box id="EntityList">
          <Suspense fallback={<LinearProgress />}>
            <EntityListContent
              navItem={navItem}
              offset={offset}
              limit={limit}
              searchQuery={searchQuery}
            />
          </Suspense>
        </Box>
      </PageLayout>
    </HydrateClient>
  );
} 
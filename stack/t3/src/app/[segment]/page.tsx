import { Suspense } from "react";
import { notFound } from "next/navigation";
import { type Metadata } from "next";
import { AppBar, Box, Fab, Typography, CircularProgress } from "@mui/material";
import { Add } from "@mui/icons-material";
import Link from "next/link";

import { NAVITEMS, type ModelName, type ModelType } from "~/types/types";
import EntityCard from "../_components/EntityCard";
import PageLayout from "../_components/PageLayout";
import TablePaginator from "../_components/TablePaginator";
import PermissionError from "../_components/PermissionError";
import SearchBar from "../_components/SearchBar";
import { canDo, canAddEntity } from "~/lib/permissions";
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
  // Mock session data
  const mockSession = {
    user: {
      id: "mock-user-1",
      name: "Mock User", 
      email: "mock@example.com",
      role: "admin"
    }
  };

  // 🚀 Use tRPC for server-side data fetching
  const entityData = await api.entities.list({
    entityType: navItem.type as ModelName,
    limit,
    offset,
    search: searchQuery,
  });

  const { results, count } = entityData;

  // Check permissions
  let permissionError: string | null = null;
  if (results.length > 0) {
    const canView = canDo("view", results[0] as ModelType<ModelName>, mockSession.user);
    if (typeof canView === "string") {
      permissionError = canView;
    }
  }

  if (permissionError) {
    return <PermissionError error={permissionError} />;
  }

  const canAdd = canAddEntity(navItem.type as ModelName, mockSession.user);
  const currentPage = Math.floor(offset / limit);

  return (
    <>
      {/* Search Bar */}
      <SearchBar currentType={navItem.type as ModelName} />

      {/* Header */}
      <AppBar position="sticky" sx={{ mb: 2 }} color="inherit" elevation={1}>
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h6">
              {navItem.plural}
              {searchQuery && (
                <Typography component="span" variant="body2" sx={{ ml: 1, opacity: 0.7 }}>
                  - searching for "{searchQuery}"
                </Typography>
              )}
            </Typography>
          </Box>
          <Box>
            <TablePaginator
              totalItems={count}
              currentPage={currentPage}
              rowsPerPage={limit}
            />
          </Box>
        </Box>
      </AppBar>

      {/* Results */}
      <Box sx={{ p: 2 }}>
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

      {/* FAB */}
      {canAdd && (
        <Fab
          color="secondary"
          size="small" 
          sx={{ position: "fixed", right: 20, bottom: 20 }}
          component={Link}
          href={`/forms/${navItem.segment}/0/add`}
        >
          <Add />
        </Fab>
      )}
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

  // 🚀 Prefetch data for instant loading
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
          <Suspense fallback={<div>Loading...</div>}>
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
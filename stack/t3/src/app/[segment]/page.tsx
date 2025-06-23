import { type Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { NAVITEMS, type ModelName, type ModelType, type ApiListResponse } from "~/types/types";
import PageLayout from "~/app/_components/PageLayout";
import ApiClient from "~/app/_components/ApiClient";
import EntityCard from "../_components/EntityCard";
import TablePaginator from "../_components/TablePaginator";
import PermissionError from "../_components/PermissionError";
import SearchBar from "../_components/SearchBar";
import { auth } from "~/server/auth";
import { canDo, canAddEntity } from "~/lib/permissions";
import { AppBar, Box, Fab, Typography, CircularProgress } from "@mui/material";
import { Add } from "@mui/icons-material";
import Link from "next/link";

type Props = {
  params: { segment: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

// Validate the segment exists in our nav items
const validateSegment = (segment: string) => {
  return NAVITEMS.some(item => item.segment === segment);
};

// Generate metadata for the page
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const segment = params.segment;
  
  if (!validateSegment(segment)) {
    return {
      title: "Not Found",
    };
  }

  const navItem = NAVITEMS.find(item => item.segment === segment);
  return {
    title: navItem?.plural || "Page Not Found",
    description: `Browse and manage ${navItem?.plural?.toLowerCase() || 'items'}`,
  };
}

// Generate static params for all valid segments
export function generateStaticParams() {
  return NAVITEMS.map((item) => ({
    segment: item.segment,
  }));
}

// This enables dynamic data fetching at request time
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Loading component for Suspense
function EntityListSkeleton() {
  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <Box
            key={i}
            sx={{
              height: 100,
              bgcolor: 'grey.100',
              borderRadius: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <CircularProgress size={24} />
          </Box>
        ))}
      </Box>
    </Box>
  );
}

// Entity list content component
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
  const session = await auth();
  
  // Build API URL with pagination and search
  const params = new URLSearchParams();
  if (offset > 0) params.set("offset", offset.toString());
  if (limit > 0) params.set("limit", limit.toString());
  if (searchQuery) params.set("search", searchQuery);
  
  const apiUrl = `${navItem.api}${params.toString() ? `?${params.toString()}` : ''}`;
  const response = await ApiClient.get<ApiListResponse<ModelName>>(apiUrl);

  if (response.error) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography color="error" variant="h6">
          Error loading data: {response.error}
        </Typography>
      </Box>
    );
  }

  if (!response.success || !response.data) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography color="error" variant="h6">
          Failed to load data
        </Typography>
      </Box>
    );
  }

  const { results, count } = response.data;

  // Check permissions for the first result (if any)
  let permissionError: string | null = null;
  if (results.length > 0) {
    const canView = canDo("view", results[0] as ModelType<ModelName>, session?.user);
    if (typeof canView === "string") {
      permissionError = canView;
    }
  }

  if (permissionError) {
    return <PermissionError error={permissionError} />;
  }

  // Check if user can add new items
  const canAdd = canAddEntity(navItem.type as ModelName, session?.user);
  const currentPage = Math.floor(offset / limit);

  return (
    <>
      {/* Search Bar */}
      <SearchBar currentType={navItem.type as ModelName} />

      {/* Header with pagination */}
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

      {/* Floating Action Button */}
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

// Main page component
export default async function DynamicPage({ params, searchParams }: Props) {
  const { segment } = params;
  
  // Parse URL parameters
  const offsetParam = searchParams.offset;
  const limitParam = searchParams.limit;
  const searchParam = searchParams.search;
  
  const offset = typeof offsetParam === 'string' ? parseInt(offsetParam) || 0 : 0;
  const limit = typeof limitParam === 'string' ? parseInt(limitParam) || 10 : 10;
  const searchQuery = typeof searchParam === 'string' ? searchParam : undefined;

  const navItem = NAVITEMS.find(item => item.segment === segment);

  if (!navItem) {
    notFound();
  }

  return (
    <PageLayout navItem={navItem}>
      <Box id="EntityList">
        <Suspense fallback={<EntityListSkeleton />}>
          <EntityListContent 
            navItem={navItem} 
            offset={offset} 
            limit={limit} 
            searchQuery={searchQuery}
          />
        </Suspense>
      </Box>
    </PageLayout>
  );
} 
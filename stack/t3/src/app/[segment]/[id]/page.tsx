import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Box, CircularProgress, Alert } from "@mui/material";
import EntityCard from "~/app/_components/EntityCard";
import PageLayout from "~/app/_components/PageLayout";
import { NAVITEMS, type ModelName, type ModelType } from "~/types/types";
import { api, HydrateClient } from "~/trpc/server";

interface Props {
  params: Promise<{
    segment: string;
    id: string;
  }>;
}

export function generateStaticParams() {
  return NAVITEMS.map((item) => ({
    segment: item.segment,
    id: 'placeholder' // Next.js requires this but the actual IDs will be dynamic
  }))
}

// Server component that uses tRPC to fetch entity data
async function EntityDetailContent({ 
  navItem, 
  entityId 
}: { 
  navItem: typeof NAVITEMS[0]; 
  entityId: string;
}) {
  try {
    // 🚀 Use tRPC byId router for server-side data fetching
    const entity = await api.entities.byId({
      entityType: navItem.type as ModelName,
      id: entityId,
    });

    if (!entity) {
      return (
        <Alert severity="error" sx={{ m: 2 }}>
          {navItem.singular} not found
        </Alert>
      );
    }

    return (
      <Box sx={{ mt: 2 }}>
        <EntityCard entity={entity as ModelType<ModelName>} />
      </Box>
    );
  } catch (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        Error loading {navItem.singular.toLowerCase()}: {error instanceof Error ? error.message : 'Unknown error'}
      </Alert>
    );
  }
}

export default async function SegmentDetailPage({ params }: Props) {
  // Await params as required by Next.js 15
  const { segment, id } = await params;

  const navItem = NAVITEMS.find(item => item.segment === segment);
  if (!navItem) notFound();

  // 🚀 Prefetch entity data for instant loading
  void api.entities.byId.prefetch({
    entityType: navItem.type as ModelName,
    id,
  });

  return (
    <HydrateClient>
      <PageLayout navItem={navItem}>
        <Box id="EntityView">
          <Suspense fallback={
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          }>
            <EntityDetailContent navItem={navItem} entityId={id} />
          </Suspense>
        </Box>
      </PageLayout>
    </HydrateClient>
  );
} 
import { Suspense } from "react";
import { Box, CircularProgress } from "@mui/material";
import { type ModelName, NAVITEMS } from "~/types/types";
import { api, HydrateClient } from "~/trpc/server";
import TanStackFormWrapper from "./TanStackFormWrapper";
import PageLayout from "~/app/_components/PageLayout";

interface SharedFormProps {
  model: string;
  id: string;
  verb: 'edit' | 'add' | 'delete';
}

// Server component that fetches data for editing
async function FormContent({
  navItem,
  entityId,
  verb,
}: {
  navItem: typeof NAVITEMS[0];
  entityId: string;
  verb: 'edit' | 'add' | 'delete';
}) {
  let initialData = undefined;

  // For edit mode, fetch existing entity
  if (verb === 'edit' || verb === 'delete') {
    try {
      initialData = await api.entities.byId({
        entityType: navItem.type as ModelName,
        id: entityId,
      });
    } catch (error) {
      return (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <p>Error loading {navItem.singular.toLowerCase()}: {error instanceof Error ? error.message : 'Unknown error'}</p>
        </Box>
      );
    }
  }

  return (
    <TanStackFormWrapper
      navItem={navItem}
      initialData={initialData}      
      verb={verb}
    />
  );
}

/**
 * Shared form logic that works with any route pattern
 * Eliminates duplication between different routing approaches
 */
export default function SharedFormLogic({ model, id, verb }: SharedFormProps) {
  // Find the corresponding NavItem
  const navItem = NAVITEMS.find(item => item.segment === model);
  if (!navItem) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <p>Model "{model}" not found</p>
      </Box>
    );
  }

  // For edit mode, prefetch the entity data
  if (verb !== 'add') {
    void api.entities.byId.prefetch({
      entityType: navItem.type as ModelName,
      id,
    });
  }

  return (
    <HydrateClient>
      <PageLayout navItem={navItem}>
        <Box sx={{ pt: 2 }}>
          <Suspense
            fallback={
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            }
          >
            <FormContent
              navItem={navItem}
              entityId={id}
              verb={verb}
            />
          </Suspense>
        </Box>
      </PageLayout>
    </HydrateClient>
  );
}

/**
 * Helper function to generate metadata for any form route
 */
export function generateFormMetadata(model: string, id: string, verb: string) {
  const navItem = NAVITEMS.find(item => item.segment === model)!;

  const capitalized = verb.charAt(0).toUpperCase() + verb.slice(1);

  return {
    title: `${capitalized} ${navItem.singular} | Object Actions`,
    description: `${capitalized} ${navItem.singular}`,
  };
}

/**
 * Helper function to generate static params for any form route
 */
export function generateFormStaticParams() {
  const params = [];
  
  // Generate params for all nav items (create mode)
  for (const navItem of NAVITEMS) {
    params.push({
      model: navItem.segment,
      id: "0",
    });
  }
  
  return params;
} 
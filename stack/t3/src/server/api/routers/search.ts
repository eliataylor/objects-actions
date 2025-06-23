import { z } from "zod"
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc"
import { type ModelName, NAVITEMS } from "~/types/types"

// Get searchable nav items
const searchableNavItems = NAVITEMS.filter(item =>
  item.model_type !== 'vocabulary' &&
  item.permissions !== 'IsAdmin' &&
  item.search_fields.length > 0
);

// Create enum from nav item types
const ModelNameEnum = z.enum(
  searchableNavItems.map(item => item.type) as [ModelName, ...ModelName[]]
);

// TODO: Implement tRPC search router when backend is ready
export const searchRouter = createTRPCRouter({
  // Placeholder for future implementation
});
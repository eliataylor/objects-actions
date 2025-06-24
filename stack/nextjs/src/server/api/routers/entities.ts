import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { type ModelName, NAVITEMS, type ApiListResponse } from "~/types/types";
import { env } from "~/env";

// Create enum from nav item types for validation
const ModelNameEnum = z.enum(
  NAVITEMS.map(item => item.type) as [ModelName, ...ModelName[]]
);

// Generic API client for Django backend
async function callDjangoAPI<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const baseUrl = env.NEXT_PUBLIC_API_HOST;
  const url = `${baseUrl}${endpoint}`;
  
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API call failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export const entitiesRouter = createTRPCRouter({
  // List entities with pagination and search
  list: publicProcedure
    .input(z.object({
      entityType: ModelNameEnum,
      limit: z.number().min(1).max(100).default(10), // match default in TablePaginator
      offset: z.number().min(0).default(0),
      search: z.string().optional(),
      filters: z.record(z.any()).optional(), // Additional filters
    }))
    .query(async ({ input }) => {
      const navItem = NAVITEMS.find(item => item.type === input.entityType);
      if (!navItem) {
        throw new Error(`Invalid entity type: ${input.entityType}`);
      }

      // Build query parameters
      const params = new URLSearchParams();
      if (input.limit) params.set("limit", input.limit.toString());
      if (input.offset) params.set("offset", input.offset.toString());
      if (input.search) params.set("search", input.search);
      
      // Add additional filters
      if (input.filters) {
        Object.entries(input.filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.set(key, String(value));
          }
        });
      }

      const endpoint = `${navItem.api}?${params.toString()}`;
      const response = await callDjangoAPI<ApiListResponse<typeof input.entityType>>(endpoint);
      
      return {
        results: response.results,
        count: response.count,
        offset: input.offset,
        limit: input.limit,
        hasMore: input.offset + input.limit < response.count,
        entityType: input.entityType,
      };
    }),

  // Get single entity by ID
  byId: publicProcedure
    .input(z.object({
      entityType: ModelNameEnum,
      id: z.union([z.string(), z.number()]),
    }))
    .query(async ({ input }) => {
      const navItem = NAVITEMS.find(item => item.type === input.entityType);
      if (!navItem) {
        throw new Error(`Invalid entity type: ${input.entityType}`);
      }

      const endpoint = `${navItem.api}/${input.id}`;
      return await callDjangoAPI(endpoint);
    }),

  // Create new entity
  create: publicProcedure
    .input(z.object({
      entityType: ModelNameEnum,
      data: z.record(z.any()), // You can make this more specific per entity type
    }))
    .mutation(async ({ input }) => {
      const navItem = NAVITEMS.find(item => item.type === input.entityType);
      if (!navItem) {
        throw new Error(`Invalid entity type: ${input.entityType}`);
      }

      const endpoint = `${navItem.api}`;
      return await callDjangoAPI(endpoint, {
        method: 'POST',
        body: JSON.stringify(input.data),
      });
    }),

  // Update existing entity
  update: publicProcedure
    .input(z.object({
      entityType: ModelNameEnum,
      id: z.union([z.string(), z.number()]),
      data: z.record(z.any()),
    }))
    .mutation(async ({ input }) => {
      const navItem = NAVITEMS.find(item => item.type === input.entityType);
      if (!navItem) {
        throw new Error(`Invalid entity type: ${input.entityType}`);
      }

      const endpoint = `${navItem.api}/${input.id}`;
      return await callDjangoAPI(endpoint, {
        method: 'PATCH',
        body: JSON.stringify(input.data),
      });
    }),

  // Delete entity
  delete: publicProcedure
    .input(z.object({
      entityType: ModelNameEnum,
      id: z.union([z.string(), z.number()]),
    }))
    .mutation(async ({ input }) => {
      const navItem = NAVITEMS.find(item => item.type === input.entityType);
      if (!navItem) {
        throw new Error(`Invalid entity type: ${input.entityType}`);
      }

      const endpoint = `${navItem.api}/${input.id}`;
      await callDjangoAPI(endpoint, {
        method: 'DELETE',
      });
      
      return { success: true, id: input.id };
    }),

  // Get entity metadata (schema, permissions, etc.)
  metadata: publicProcedure
    .input(z.object({
      entityType: ModelNameEnum,
    }))
    .query(async ({ input }) => {
      const navItem = NAVITEMS.find(item => item.type === input.entityType);
      if (!navItem) {
        throw new Error(`Invalid entity type: ${input.entityType}`);
      }

      return {
        navItem,
        searchFields: navItem.search_fields,
        apiEndpoint: navItem.api,
        // Add more metadata as needed
      };
    }),
}); 
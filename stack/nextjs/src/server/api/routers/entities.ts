import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { type ModelName, NAVITEMS, type ApiListResponse } from "~/types/types";
import ApiClient from "~/app/_components/ApiClient";

// Create enum from nav item types for validation
const ModelNameEnum = z.enum(
  NAVITEMS.map(item => item.type) as [ModelName, ...ModelName[]]
);

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
      const response = await ApiClient.get<ApiListResponse<typeof input.entityType>>(endpoint);
      
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch entities');
      }
      
      return {
        results: response.data.results,
        count: response.data.count,
        offset: input.offset,
        limit: input.limit,
        hasMore: input.offset + input.limit < response.data.count,
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
      const response = await ApiClient.get(endpoint);
      
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch entity');
      }
      
      return response.data;
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
      const response = await ApiClient.post(endpoint, input.data);
      
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to create entity');
      }
      
      return response.data;
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
      const response = await ApiClient.patch(endpoint, input.data);
      
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to update entity');
      }
      
      return response.data;
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
      const response = await ApiClient.delete(endpoint);
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to delete entity');
      }
      
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
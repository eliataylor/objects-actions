import { z } from "zod"
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc"
import { type ModelName, NAVITEMS } from "~/types/types"
import { type ApiListResponse } from "~/types/types"
import ApiClient from "~/app/_components/ApiClient"

// Get searchable nav items
const searchableNavItems = NAVITEMS.filter(item =>
  item.model_type !== 'vocabulary' &&
  item.search_fields && 
  item.search_fields.length > 0
);

// Create enum from nav item types
const ModelNameEnum = z.enum(
  searchableNavItems.map(item => item.type) as [ModelName, ...ModelName[]]
);

// TODO: Implement tRPC search router when backend is ready
export const searchRouter = createTRPCRouter({
  // Search within a specific content type
  byType: publicProcedure
    .input(z.object({
      type: ModelNameEnum,
      query: z.string().min(1),
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ input }) => {
      const navItem = searchableNavItems.find(item => item.type === input.type);
      if (!navItem) {
        throw new Error(`Invalid search type: ${input.type}`);
      }

      // Build API URL with search parameters
      const params = new URLSearchParams();
      params.set("search", input.query);
      if (input.offset > 0) params.set("offset", input.offset.toString());
      if (input.limit > 0) params.set("limit", input.limit.toString());
      
      const apiUrl = `${navItem.api}?${params.toString()}`;
      
      try {
        const response = await ApiClient.get<ApiListResponse<typeof input.type>>(apiUrl);
        
        if (!response.success || !response.data) {
          return {
            results: [],
            count: 0,
            offset: input.offset,
            limit: input.limit,
            query: input.query,
            type: input.type,
            hasMore: false,
          };
        }

        return {
          results: response.data.results,
          count: response.data.count,
          offset: input.offset,
          limit: input.limit,
          query: input.query,
          type: input.type,
          hasMore: input.offset + input.limit < response.data.count,
        };
      } catch (error) {
        console.error('Search error:', error);
        return {
          results: [],
          count: 0,
          offset: input.offset,
          limit: input.limit,
          query: input.query,
          type: input.type,
          hasMore: false,
        };
      }
    }),

  // Get autocomplete suggestions for a specific type
  autocomplete: publicProcedure
    .input(z.object({
      type: ModelNameEnum,
      query: z.string().min(1),
      limit: z.number().min(1).max(10).default(5),
    }))
    .query(async ({ input }) => {
      const navItem = searchableNavItems.find(item => item.type === input.type);
      if (!navItem) {
        return [];
      }

      const params = new URLSearchParams();
      params.set("search", input.query);
      params.set("limit", input.limit.toString());
      
      const apiUrl = `${navItem.api}?${params.toString()}`;
      
      try {
        const response = await ApiClient.get<ApiListResponse<typeof input.type>>(apiUrl);
        
        if (!response.success || !response.data?.results) {
          return [];
        }

        // Convert results to autocomplete format
        return response.data.results.map((item: any) => {
          const searchFields = navItem.search_fields || ['name'];
          let label = searchFields.map((field) => {
            if (field === "username") {
              return `@${item[field]}`;
            }
            return item[field];
          });
          
          if (label.length === 0) label = [item.id];
          
          return {
            id: item.id,
            label: label.join(", "),
            value: item.id,
            _type: input.type,
          };
        });
      } catch (error) {
        console.error('Autocomplete error:', error);
        return [];
      }
    }),

  // Get search suggestions for all types
  globalAutocomplete: publicProcedure
    .input(z.object({
      query: z.string().min(1),
      limit: z.number().min(1).max(20).default(10),
    }))
    .query(async ({ input }) => {
      const results: any[] = [];
      
      // Search across multiple content types IN PARALLEL for better performance
      const searchPromises = searchableNavItems.slice(0, 3).map(async (navItem) => {
        try {
          const params = new URLSearchParams();
          params.set("search", input.query);
          params.set("limit", "3"); // Only get top 3 results per type
          
          const apiUrl = `${navItem.api}?${params.toString()}`;
          const response = await ApiClient.get<ApiListResponse<ModelName>>(apiUrl);
          
          if (response.success && response.data?.results) {
            return response.data.results.map((item: any) => {
              const searchFields = navItem.search_fields || ['name'];
              let label = searchFields.map((field) => item[field]);
              if (label.length === 0) label = [item.id];
              
              return {
                id: item.id,
                label: label.join(", "),
                value: item.id,
                _type: navItem.type,
                category: navItem.plural,
              };
            });
          }
          return [];
        } catch (error) {
          console.error(`Search error for ${navItem.type}:`, error);
          return [];
        }
      });

      // Wait for all searches to complete in parallel
      const searchResults = await Promise.all(searchPromises);
      searchResults.forEach(typeResults => {
        results.push(...typeResults);
      });
      
      return results.slice(0, input.limit);
    }),
});
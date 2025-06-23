import { z } from "zod"
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc"
import { type ModelName, NAVITEMS, type SearchResponse as AppSearchResponse } from "~/types/types"
import { env } from "~/env"
import nodeFetch, { type RequestInit, type Response } from "node-fetch"
import https from "https"
import { ApiService } from "~/types/api/services/ApiService"
import { OpenAPI } from "~/types/api/core/OpenAPI"

// Create an https agent that accepts self-signed certificates
const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
  keepAlive: true,
  timeout: 10000
});

// Configure fetch to use the https agent
const customFetch = async (url: string, init?: RequestInit): Promise<Response> => {
  return nodeFetch(url, {
    ...init,
    agent: httpsAgent,
  });
};

// Configure OpenAPI to use custom fetch
OpenAPI.FETCH = customFetch as unknown as (url: string, init?: globalThis.RequestInit) => Promise<globalThis.Response>;

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

export const searchRouter = createTRPCRouter({
  query: publicProcedure
    .input(z.object({
      types: z.array(ModelNameEnum),
      query: z.string().min(1)
    }))
    .mutation(async ({ input }): Promise<AppSearchResponse> => {
      try {
        // Use the generated API service for each type
        const results: AppSearchResponse['results'] = {};
        
        for (const type of input.types) {
          switch (type) {
            case "Drugs":
              const drugs = await ApiService.apiDrugsList(10, 0, input.query);
              results[type] = {
                items: drugs.results,
                count: drugs.count
              };
              break;
            case "DrugEffects":
              const effects = await ApiService.apiDrugEffectsList(10, 0, input.query);
              results[type] = {
                items: effects.results,
                count: effects.count
              };
              break;
            case "DrugComparisons":
              const comparisons = await ApiService.apiDrugComparisonsList(10, 0, input.query);
              results[type] = {
                items: comparisons.results,
                count: comparisons.count
              };
              break;
            case "Manufacturers":
              const manufacturers = await ApiService.apiManufacturersList(10, 0, input.query);
              results[type] = {
                items: manufacturers.results,
                count: manufacturers.count
              };
              break;
            case "SideEffects":
              const sideEffects = await ApiService.apiSideEffectsList(10, 0, input.query);
              results[type] = {
                items: sideEffects.results,
                count: sideEffects.count
              };
              break;
            case "Trials":
              const trials = await ApiService.apiTrialsList(10, 0, input.query);
              results[type] = {
                items: trials.results,
                count: trials.count
              };
              break;
          }
        }

        return {
          results,
          query: input.query,
          selected_types: input.types
        };
      } catch (error) {
        console.error('Search error:', {
          error,
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined
        });
        return {
          results: {},
          query: input.query,
          selected_types: input.types
        };
      }
    }),

  // Add autocomplete procedure for each type
  autocomplete: publicProcedure
    .input(z.object({
      type: ModelNameEnum,
      query: z.string().min(1)
    }))
    .query(async ({ input }) => {
      try {
        switch (input.type) {
          case "Drugs":
            const drugs = await ApiService.apiDrugsList(5, 0, input.query);
            return drugs.results.map(drug => ({
              id: drug.id,
              label: drug.name
            }));
          case "DrugEffects":
            const effects = await ApiService.apiDrugEffectsList(5, 0, input.query);
            return effects.results.map(effect => ({
              id: effect.id,
              label: `Effect #${effect.id} - ${effect.severity} (${effect.reported_count || 0} reports)`
            }));
          case "DrugComparisons":
            const comparisons = await ApiService.apiDrugComparisonsList(5, 0, input.query);
            return comparisons.results.map(comparison => ({
              id: comparison.id,
              label: comparison.title
            }));
          case "Manufacturers":
            const manufacturers = await ApiService.apiManufacturersList(5, 0, input.query);
            return manufacturers.results.map(manufacturer => ({
              id: manufacturer.id,
              label: manufacturer.name
            }));
          case "SideEffects":
            const sideEffects = await ApiService.apiSideEffectsList(5, 0, input.query);
            return sideEffects.results.map(sideEffect => ({
              id: sideEffect.id,
              label: sideEffect.name
            }));
          case "Trials":
            const trials = await ApiService.apiTrialsList(5, 0, input.query);
            return trials.results.map(trial => ({
              id: trial.id,
              label: trial.title
            }));
          default:
            return [];
        }
      } catch (error) {
        console.error('Autocomplete error:', error);
        return [];
      }
    })
}); 
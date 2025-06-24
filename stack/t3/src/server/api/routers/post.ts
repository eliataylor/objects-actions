import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
} from "~/server/api/trpc";

export const postRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),

  // Example API endpoints - replace with your actual backend calls
  getExample: publicProcedure.query(() => {
    return {
      message: "This is an example endpoint. Replace with your backend API calls.",
      timestamp: new Date().toISOString(),
    };
  }),
});

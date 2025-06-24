import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  },
  client: {
    NEXT_PUBLIC_API_HOST: z.string().default("https://localapi.oaexample.com:8080"),
    NEXT_PUBLIC_APP_HOST: z.string().default("https://localhost.oaexample.com:3003"),
  },
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_API_HOST: process.env.NEXT_PUBLIC_API_HOST || process.env.REACT_APP_API_HOST,
    NEXT_PUBLIC_APP_HOST: process.env.NEXT_PUBLIC_APP_HOST || process.env.REACT_APP_APP_HOST,
  },
  skipValidation: !!process.env.CI || !!process.env.SKIP_ENV_VALIDATION,
}); 
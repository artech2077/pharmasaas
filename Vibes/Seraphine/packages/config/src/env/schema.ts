import { z } from "zod";

export const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().url().optional(),
  CONVEX_URL: z.string().url().optional(),
  VERCEL_PROJECT_ID: z.string().optional(),
  API_PORT: z.coerce.number().int().min(1).max(65535).optional(),
  API_HOST: z.string().min(1).optional()
});

export type EnvSchema = z.infer<typeof envSchema>;

export const parseEnv = (source: Partial<Record<keyof EnvSchema, string>>) => {
  return envSchema.parse(source);
};

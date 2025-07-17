import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  
  // Database
  DATABASE_URL: z.string().optional(),
  
  // AI Provider API Keys
  OPENAI_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  
  // Local AI Endpoints
  OLLAMA_BASE_URL: z.string().default("http://localhost:11434"),
  LOCALAI_BASE_URL: z.string().default("http://localhost:8080"),
  
  // App Configuration
  APP_URL: z.string().default("http://localhost:3000"),
});

export const env = envSchema.parse(process.env);
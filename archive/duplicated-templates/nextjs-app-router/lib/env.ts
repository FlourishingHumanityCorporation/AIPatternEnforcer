// Environment variables with validation
export const env = {
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY || '',
  DATABASE_URL: process.env.DATABASE_URL || '',
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || '',
  NEXTAUTH_URL: process.env.NEXTAUTH_URL || '',
  OLLAMA_BASE_URL: process.env.OLLAMA_BASE_URL || '',
  LOCALAI_BASE_URL: process.env.LOCALAI_BASE_URL || '',
}
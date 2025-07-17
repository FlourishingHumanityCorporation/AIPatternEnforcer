import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
export const prisma =
  global.prisma ||
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}

// Helper function to handle database errors
export function handleDbError(error: any): { message: string; code?: string } {
  if (error.code === "P2002") {
    return {
      message: "A record with this value already exists",
      code: "DUPLICATE",
    };
  }

  if (error.code === "P2025") {
    return { message: "Record not found", code: "NOT_FOUND" };
  }

  if (error.code === "P2003") {
    return { message: "Invalid reference", code: "INVALID_REFERENCE" };
  }

  // Generic database error
  return { message: "Database operation failed", code: "DB_ERROR" };
}

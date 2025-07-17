// Simple local development auth - no authentication required for local use
// For a local one-person app, we'll just use a mock user

export interface User {
  id: string
  email: string
  name: string
}

export const mockUser: User = {
  id: 'local-user',
  email: 'local@dev.com',
  name: 'Local User'
}

export function getCurrentUser(): User {
  return mockUser
}

export function requireAuth(): User {
  return mockUser
}

// For API routes that need user context
export async function getServerUser(): Promise<User> {
  return mockUser
}

// Legacy NextAuth placeholder for compatibility
export const authOptions = {
  providers: []
}
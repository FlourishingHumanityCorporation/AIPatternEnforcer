// Mock authentication for local development
// This is NOT for production use - it's designed for single-user local AI apps

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

// Mock user for local development
export const mockUser: User = {
  id: "mock-user-001",
  name: "Local Developer",
  email: "dev@localhost",
  avatar: "/avatar-placeholder.png",
};

// Mock auth functions
export async function getCurrentUser(): Promise<User> {
  // In a real app, this would check session/JWT
  // For local AI apps, we just return the mock user
  return mockUser;
}

export async function isAuthenticated(): Promise<boolean> {
  // Always authenticated in local development
  return true;
}

export async function signIn(): Promise<User> {
  // Mock sign in - instant success
  return mockUser;
}

export async function signOut(): Promise<void> {
  // Mock sign out - does nothing in local development
  // In a real app, this would clear session/JWT
}

// Helper to get user ID for database operations
export function getUserId(): string {
  return mockUser.id;
}

// Hook for React components
export function useAuth() {
  return {
    user: mockUser,
    isAuthenticated: true,
    signIn,
    signOut,
  };
}

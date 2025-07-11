# State Management Patterns

## Overview

State management patterns for maintaining predictable, debuggable application state.

## Frontend State Patterns

### 1. Component State (Local)

Use for UI-only state that doesn't need to be shared.

```typescript
// Good for: form inputs, toggles, temporary UI state
const [isOpen, setIsOpen] = useState(false);
const [formData, setFormData] = useState({ name: "", email: "" });
```

### 2. Context API (Shared)

Use for state that needs to be accessed by multiple components.

```typescript
// contexts/AuthContext.tsx
export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = async (credentials: LoginCredentials) => {
    const user = await authService.login(credentials);
    setUser(user);
  };

  return (
    <AuthContext.Provider value={{ user, login }}>
      {children}
    </AuthContext.Provider>
  );
};
```

### 3. Server State (React Query/SWR)

Use for data fetched from APIs.

```typescript
// hooks/useUser.ts
export const useUser = (userId: string) => {
  return useQuery({
    queryKey: ["user", userId],
    queryFn: () => userApi.getUser(userId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
```

## Backend State Patterns

### 1. Request-Scoped State

```typescript
// middleware/requestContext.ts
export const requestContext = asyncLocalStorage.run(new Map(), async () => {
  const context = asyncLocalStorage.getStore();
  context.set("requestId", generateId());
  context.set("user", req.user);
});
```

### 2. Cache Patterns

```typescript
// services/cache.ts
class CacheService {
  private cache = new Map<string, CacheEntry>();

  async get<T>(
    key: string,
    factory: () => Promise<T>,
    ttl: number,
  ): Promise<T> {
    const existing = this.cache.get(key);

    if (existing && existing.expires > Date.now()) {
      return existing.value;
    }

    const value = await factory();
    this.cache.set(key, { value, expires: Date.now() + ttl });
    return value;
  }
}
```

## Best Practices

1. **Single Source of Truth** - Each piece of state should have one authoritative source
2. **Minimize State** - Don't store what can be computed
3. **Immutable Updates** - Never mutate state directly
4. **Normalize Complex State** - Use normalized structures for relational data
5. **Separate Concerns** - UI state vs server state vs application state

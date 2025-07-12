# Data Fetching Patterns

## Table of Contents

1. [Overview](#overview)
2. [Frontend Patterns](#frontend-patterns)
  3. [1. React Query Setup](#1-react-query-setup)
  4. [2. Custom Hooks Pattern](#2-custom-hooks-pattern)
  5. [3. Optimistic Updates](#3-optimistic-updates)
6. [Backend Patterns](#backend-patterns)
  7. [1. Repository Pattern](#1-repository-pattern)
  8. [2. Data Loader Pattern](#2-data-loader-pattern)
  9. [3. Pagination Pattern](#3-pagination-pattern)
10. [Optimal Practices](#optimal-practices)

## Overview

Patterns for efficient, consistent data fetching across the application.

## Frontend Patterns

### 1. React Query Setup

```typescript
// lib/queryClient.ts
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
    },
  },
});
```

### 2. Custom Hooks Pattern

```typescript
// hooks/api/useProjects.ts
export const useProjects = (filters?: ProjectFilters) => {
  return useQuery({
    queryKey: ["projects", filters],
    queryFn: () => projectApi.getProjects(filters),
  });
};

export const useCreateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: projectApi.createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
};
```

### 3. Optimistic Updates

```typescript
export const useUpdateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: projectApi.updateProject,
    onMutate: async (updatedProject) => {
      await queryClient.cancelQueries(["projects", updatedProject.id]);

      const previousProject = queryClient.getQueryData([
        "projects",
        updatedProject.id,
      ]);

      queryClient.setQueryData(["projects", updatedProject.id], updatedProject);

      return { previousProject };
    },
    onError: (err, updatedProject, context) => {
      queryClient.setQueryData(
        ["projects", updatedProject.id],
        context.previousProject,
      );
    },
  });
};
```

## Backend Patterns

### 1. Repository Pattern

```typescript
// repositories/UserRepository.ts
export class UserRepository {
  async findById(id: string): Promise<User | null> {
    return db.user.findUnique({ where: { id } });
  }

  async findMany(filters: UserFilters): Promise<User[]> {
    return db.user.findMany({
      where: this.buildWhereClause(filters),
      orderBy: { createdAt: "desc" },
    });
  }

  private buildWhereClause(filters: UserFilters) {
    const where: any = {};

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: "insensitive" } },
        { email: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    return where;
  }
}
```

### 2. Data Loader Pattern

```typescript
// loaders/userLoader.ts
export const createUserLoader = () => {
  return new DataLoader<string, User>(async (userIds) => {
    const users = await db.user.findMany({
      where: { id: { in: userIds as string[] } },
    });

    const userMap = new Map(users.map((user) => [user.id, user]));
    return userIds.map((id) => userMap.get(id) || null);
  });
};
```

### 3. Pagination Pattern

```typescript
interface PaginationParams {
  page: number;
  limit: number;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}

export class PaginationService {
  async paginate<T>(
    query: any,
    params: PaginationParams,
  ): Promise<PaginatedResponse<T>> {
    const { page, limit } = params;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      query.skip(skip).take(limit),
      query.count(),
    ]);

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }
}
```

## Optimal Practices

1. **Cache Aggressively** - But know when to invalidate
2. **Handle Loading States** - Show skeletons, not spinners
3. **Handle Errors Gracefully** - Retry with exponential backoff
4. **Prefetch When Possible** - Anticipate user actions
5. **Optimize Bundle Size** - Only fetch what you need

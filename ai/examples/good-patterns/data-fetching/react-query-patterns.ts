/**
 * Data Fetching - Good Patterns with React Query
 * 
 * This file demonstrates best practices for data fetching using React Query
 * (TanStack Query) with proper error handling, caching, and optimization.
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { useState, useCallback } from 'react';

// Types
interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface Post {
  id: string;
  title: string;
  content: string;
  authorId: string;
  createdAt: string;
  updatedAt: string;
}

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// API Functions
export const userAPI = {
  getUsers: async (page = 1, limit = 20): Promise<PaginatedResponse<User>> => {
    const response = await fetch(`/api/users?page=${page}&limit=${limit}`);
    if (!response.ok) throw new Error('Failed to fetch users');
    return response.json();
  },

  getUser: async (id: string): Promise<User> => {
    const response = await fetch(`/api/users/${id}`);
    if (!response.ok) throw new Error('Failed to fetch user');
    return response.json();
  },

  createUser: async (userData: Omit<User, 'id'>): Promise<User> => {
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    if (!response.ok) throw new Error('Failed to create user');
    return response.json();
  },

  updateUser: async (id: string, userData: Partial<User>): Promise<User> => {
    const response = await fetch(`/api/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    if (!response.ok) throw new Error('Failed to update user');
    return response.json();
  },

  deleteUser: async (id: string): Promise<void> => {
    const response = await fetch(`/api/users/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete user');
  },
};

export const postAPI = {
  getPosts: async (authorId?: string): Promise<Post[]> => {
    const url = authorId ? `/api/posts?authorId=${authorId}` : '/api/posts';
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch posts');
    return response.json();
  },

  getPost: async (id: string): Promise<Post> => {
    const response = await fetch(`/api/posts/${id}`);
    if (!response.ok) throw new Error('Failed to fetch post');
    return response.json();
  },
};

// Query Keys Factory - Centralized query key management
export const queryKeys = {
  users: {
    all: ['users'] as const,
    lists: () => [...queryKeys.users.all, 'list'] as const,
    list: (page: number, limit: number) => 
      [...queryKeys.users.lists(), { page, limit }] as const,
    details: () => [...queryKeys.users.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.users.details(), id] as const,
  },
  posts: {
    all: ['posts'] as const,
    lists: () => [...queryKeys.posts.all, 'list'] as const,
    list: (authorId?: string) => 
      [...queryKeys.posts.lists(), { authorId }] as const,
    details: () => [...queryKeys.posts.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.posts.details(), id] as const,
  },
} as const;

// 1. Basic Data Fetching Hook
export function useUsers(page = 1, limit = 20) {
  return useQuery({
    queryKey: queryKeys.users.list(page, limit),
    queryFn: () => userAPI.getUsers(page, limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

export function useUser(id: string, options?: UseQueryOptions<User>) {
  return useQuery({
    queryKey: queryKeys.users.detail(id),
    queryFn: () => userAPI.getUser(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

// 2. Infinite Query for Pagination
import { useInfiniteQuery } from '@tanstack/react-query';

export function useInfiniteUsers(limit = 20) {
  return useInfiniteQuery({
    queryKey: ['users', 'infinite', limit],
    queryFn: ({ pageParam = 1 }) => userAPI.getUsers(pageParam, limit),
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.pagination;
      return page < totalPages ? page + 1 : undefined;
    },
    staleTime: 5 * 60 * 1000,
  });
}

// 3. Mutations with Optimistic Updates
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userAPI.createUser,
    onSuccess: (newUser) => {
      // Invalidate and refetch user lists
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
      
      // Optimistically add to existing queries
      queryClient.setQueriesData(
        { queryKey: queryKeys.users.lists() },
        (oldData: PaginatedResponse<User> | undefined) => {
          if (!oldData) return oldData;
          
          return {
            ...oldData,
            data: [newUser, ...oldData.data],
            pagination: {
              ...oldData.pagination,
              total: oldData.pagination.total + 1,
            },
          };
        }
      );
    },
    onError: (error) => {
      console.error('Failed to create user:', error);
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...userData }: { id: string } & Partial<User>) =>
      userAPI.updateUser(id, userData),
    onMutate: async ({ id, ...newData }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.users.detail(id) });

      // Snapshot previous value
      const previousUser = queryClient.getQueryData(queryKeys.users.detail(id));

      // Optimistically update
      queryClient.setQueryData(queryKeys.users.detail(id), (old: User | undefined) => ({
        ...old!,
        ...newData,
      }));

      return { previousUser };
    },
    onError: (error, { id }, context) => {
      // Rollback on error
      if (context?.previousUser) {
        queryClient.setQueryData(queryKeys.users.detail(id), context.previousUser);
      }
    },
    onSettled: (data, error, { id }) => {
      // Always refetch after mutation
      queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userAPI.deleteUser,
    onSuccess: (_, deletedId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: queryKeys.users.detail(deletedId) });
      
      // Update lists
      queryClient.setQueriesData(
        { queryKey: queryKeys.users.lists() },
        (oldData: PaginatedResponse<User> | undefined) => {
          if (!oldData) return oldData;
          
          return {
            ...oldData,
            data: oldData.data.filter(user => user.id !== deletedId),
            pagination: {
              ...oldData.pagination,
              total: oldData.pagination.total - 1,
            },
          };
        }
      );
      
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
    },
  });
}

// 4. Dependent Queries
export function useUserWithPosts(userId: string) {
  const userQuery = useUser(userId);
  
  const postsQuery = useQuery({
    queryKey: queryKeys.posts.list(userId),
    queryFn: () => postAPI.getPosts(userId),
    enabled: !!userQuery.data, // Only fetch posts if user exists
    staleTime: 5 * 60 * 1000,
  });

  return {
    user: userQuery.data,
    posts: postsQuery.data,
    isLoading: userQuery.isLoading || postsQuery.isLoading,
    error: userQuery.error || postsQuery.error,
  };
}

// 5. Custom Hook with Local State
export function useUserSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const searchResults = useQuery({
    queryKey: ['users', 'search', debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery.trim()) return [];
      
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(debouncedQuery)}`);
      if (!response.ok) throw new Error('Search failed');
      return response.json();
    },
    enabled: debouncedQuery.trim().length > 0,
    staleTime: 30 * 1000, // 30 seconds
  });

  return {
    searchQuery,
    setSearchQuery,
    results: searchResults.data || [],
    isSearching: searchResults.isFetching,
    error: searchResults.error,
  };
}

// 6. Prefetching for Better UX
export function usePrefetchUser() {
  const queryClient = useQueryClient();

  return useCallback((userId: string) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.users.detail(userId),
      queryFn: () => userAPI.getUser(userId),
      staleTime: 5 * 60 * 1000,
    });
  }, [queryClient]);
}

// 7. Background Refetching
export function useUserWithBackground(id: string) {
  return useQuery({
    queryKey: queryKeys.users.detail(id),
    queryFn: () => userAPI.getUser(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
    refetchIntervalInBackground: true, // Keep refetching in background
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
}

// 8. Error Boundary Integration
export function useQueryErrorReset() {
  const queryClient = useQueryClient();
  
  return useCallback(() => {
    queryClient.resetQueries();
  }, [queryClient]);
}

// 9. Suspense Support
export function useUserSuspense(id: string) {
  return useQuery({
    queryKey: queryKeys.users.detail(id),
    queryFn: () => userAPI.getUser(id),
    enabled: !!id,
    suspense: true,
  });
}

// 10. Component Examples

// Basic list component
export function UserList() {
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useUsers(page, 10);

  if (isLoading) return <div>Loading users...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <ul>
        {data?.data.map(user => (
          <li key={user.id}>
            {user.name} ({user.email})
          </li>
        ))}
      </ul>
      
      <div>
        <button 
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
        >
          Previous
        </button>
        
        <span>Page {page} of {data?.pagination.totalPages}</span>
        
        <button 
          onClick={() => setPage(p => p + 1)}
          disabled={page === data?.pagination.totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
}

// Infinite scroll component
export function InfiniteUserList() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = useInfiniteUsers();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const allUsers = data?.pages.flatMap(page => page.data) || [];

  return (
    <div>
      <ul>
        {allUsers.map(user => (
          <li key={user.id}>
            {user.name} ({user.email})
          </li>
        ))}
      </ul>
      
      {hasNextPage && (
        <button 
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
        >
          {isFetchingNextPage ? 'Loading more...' : 'Load More'}
        </button>
      )}
    </div>
  );
}

// Search component
export function UserSearch() {
  const { searchQuery, setSearchQuery, results, isSearching, error } = useUserSearch();

  return (
    <div>
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search users..."
      />
      
      {isSearching && <div>Searching...</div>}
      
      {error && <div>Search error: {error.message}</div>}
      
      <ul>
        {results.map(user => (
          <li key={user.id}>
            {user.name} ({user.email})
          </li>
        ))}
      </ul>
    </div>
  );
}

// User detail with mutations
export function UserDetail({ userId }: { userId: string }) {
  const { data: user, isLoading, error } = useUser(userId);
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();
  const prefetchUser = usePrefetchUser();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!user) return <div>User not found</div>;

  const handleUpdate = () => {
    updateUser.mutate({
      id: userId,
      name: 'Updated Name',
    });
  };

  const handleDelete = () => {
    if (confirm('Are you sure?')) {
      deleteUser.mutate(userId);
    }
  };

  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
      
      <button onClick={handleUpdate} disabled={updateUser.isLoading}>
        Update User
      </button>
      
      <button onClick={handleDelete} disabled={deleteUser.isLoading}>
        Delete User
      </button>
      
      {/* Prefetch on hover */}
      <button
        onMouseEnter={() => prefetchUser('other-user-id')}
        onClick={() => window.location.href = '/users/other-user-id'}
      >
        Go to Other User
      </button>
    </div>
  );
}
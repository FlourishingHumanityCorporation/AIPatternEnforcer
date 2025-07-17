const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");

describe("tanstack-query-validator", () => {
  const hookPath = path.join(__dirname, "..", "tanstack-query-validator.js");
  const projectRoot = path.join(__dirname, "..", "..", "..", "..");
  const envPath = path.join(projectRoot, ".env");
  const envBackupPath = path.join(projectRoot, ".env.backup");
  const envTestPath = path.join(projectRoot, ".env.test");

  beforeAll(() => {
    // Backup original .env file if it exists
    if (fs.existsSync(envPath)) {
      fs.copyFileSync(envPath, envBackupPath);
    }
    // Copy test .env file
    if (fs.existsSync(envTestPath)) {
      fs.copyFileSync(envTestPath, envPath);
    }
  });

  afterAll(() => {
    // Restore original .env file
    if (fs.existsSync(envBackupPath)) {
      fs.copyFileSync(envBackupPath, envPath);
      fs.unlinkSync(envBackupPath);
    }
  });

  function runHook(input) {
    try {
      const result = execSync(
        `echo '${JSON.stringify(input)}' | node ${hookPath}`,
        {
          encoding: "utf8",
          stdio: ["pipe", "pipe", "pipe"],
        },
      );
      return { exitCode: 0, stderr: "", stdout: result };
    } catch (error) {
      return {
        exitCode: error.status || 1,
        stderr: error.stderr?.toString() || error.message,
        stdout: error.stdout?.toString() || "",
      };
    }
  }

  describe("Legacy import detection", () => {
    it("should warn about legacy react-query import", () => {
      const input = {
        tool_name: "Write",
        tool_input: {
          file_path: "hooks/useUsers.ts",
          content: `
            import { useQuery } from 'react-query';
            
            export function useUsers() {
              return useQuery('users', fetchUsers);
            }
          `,
        },
      };

      const result = runHook(input);
      expect(result.exitCode).toBe(2);
      expect(result.stderr).toContain("Using legacy 'react-query' import");
      expect(result.stderr).toContain("@tanstack/react-query");
    });

    it("should allow modern TanStack Query imports", () => {
      const input = {
        tool_name: "Write",
        tool_input: {
          file_path: "hooks/useUsers.ts",
          content: `
            import { useQuery } from '@tanstack/react-query';
            
            export function useUsers() {
              return useQuery({ queryKey: ['users'], queryFn: fetchUsers });
            }
          `,
        },
      };

      const result = runHook(input);
      expect(result.exitCode).toBe(0);
    });
  });

  describe("Query key patterns", () => {
    it("should block string concatenation in query keys", () => {
      const input = {
        tool_name: "Write",
        tool_input: {
          file_path: "hooks/useUser.ts",
          content: `
            import { useQuery } from '@tanstack/react-query';
            
            export function useUser(id: string) {
              return useQuery(['user' + id], () => fetchUser(id));
            }
          `,
        },
      };

      const result = runHook(input);
      expect(result.exitCode).toBe(2);
      expect(result.stderr).toContain("String concatenation in query keys");
      expect(result.stderr).toContain('["users", userId]');
    });

    it("should block string query keys", () => {
      const input = {
        tool_name: "Write",
        tool_input: {
          file_path: "hooks/useUsers.ts",
          content: `
            import { useQuery } from '@tanstack/react-query';
            
            export function useUsers() {
              return useQuery('users', fetchUsers);
            }
          `,
        },
      };

      const result = runHook(input);
      expect(result.exitCode).toBe(2);
      expect(result.stderr).toContain(
        "Using string query key instead of array",
      );
    });

    it("should block Date.now() in query keys", () => {
      const input = {
        tool_name: "Write",
        tool_input: {
          file_path: "hooks/useRealtime.ts",
          content: `
            import { useQuery } from '@tanstack/react-query';
            
            export function useRealtime() {
              return useQuery({ 
                queryKey: ['realtime', Date.now()], 
                queryFn: fetchRealtime 
              });
            }
          `,
        },
      };

      const result = runHook(input);
      expect(result.exitCode).toBe(2);
      expect(result.stderr).toContain(
        "Date.now() in query keys prevents caching",
      );
    });

    it("should allow proper array query keys", () => {
      const input = {
        tool_name: "Write",
        tool_input: {
          file_path: "hooks/useUser.ts",
          content: `
            import { useQuery } from '@tanstack/react-query';
            
            export function useUser(id: string) {
              return useQuery({ 
                queryKey: ['user', id], 
                queryFn: () => fetchUser(id) 
              });
            }
          `,
        },
      };

      const result = runHook(input);
      expect(result.exitCode).toBe(0);
    });
  });

  describe("Query function patterns", () => {
    it("should warn about try without catch", () => {
      const input = {
        tool_name: "Write",
        tool_input: {
          file_path: "hooks/useData.ts",
          content: `
            import { useQuery } from '@tanstack/react-query';
            
            export function useData() {
              return useQuery({
                queryKey: ['data'],
                queryFn: async () => {
                  try {
                    const response = await fetch('/api/data');
                    return response.json();
                  }
                }
              });
            }
          `,
        },
      };

      const result = runHook(input);
      expect(result.exitCode).toBe(2);
      expect(result.stderr).toContain(
        "Query function with try block but no catch",
      );
    });

    it("should warn about fetch without response validation", () => {
      const input = {
        tool_name: "Write",
        tool_input: {
          file_path: "hooks/useData.ts",
          content: `
            import { useQuery } from '@tanstack/react-query';
            
            export function useData() {
              return useQuery({
                queryKey: ['data'],
                queryFn: () => fetch('/api/data').then(res => res.json())
              });
            }
          `,
        },
      };

      const result = runHook(input);
      expect(result.exitCode).toBe(2);
      expect(result.stderr).toContain("Fetch without response validation");
      expect(result.stderr).toContain("response.ok");
    });

    it("should allow proper fetch with validation", () => {
      const input = {
        tool_name: "Write",
        tool_input: {
          file_path: "hooks/useData.ts",
          content: `
            import { useQuery } from '@tanstack/react-query';
            
            export function useData() {
              return useQuery({
                queryKey: ['data'],
                queryFn: async () => {
                  const response = await fetch('/api/data');
                  if (!response.ok) throw new Error('Failed to fetch');
                  return response.json();
                }
              });
            }
          `,
        },
      };

      const result = runHook(input);
      expect(result.exitCode).toBe(0);
    });
  });

  describe("Mutation patterns", () => {
    it("should block invalidating all queries", () => {
      const input = {
        tool_name: "Write",
        tool_input: {
          file_path: "hooks/useCreateUser.ts",
          content: `
            import { useMutation, useQueryClient } from '@tanstack/react-query';
            
            export function useCreateUser() {
              const queryClient = useQueryClient();
              
              return useMutation({
                mutationFn: createUser,
                onSuccess: () => {
                  queryClient.invalidateQueries();
                }
              });
            }
          `,
        },
      };

      const result = runHook(input);
      expect(result.exitCode).toBe(2);
      expect(result.stderr).toContain("Invalidating all queries");
      expect(result.stderr).toContain('queryKey: ["specific"]');
    });

    it("should warn about missing error handling", () => {
      const input = {
        tool_name: "Write",
        tool_input: {
          file_path: "hooks/useCreateUser.ts",
          content: `
            import { useMutation } from '@tanstack/react-query';
            
            export function useCreateUser() {
              return useMutation({
                mutationFn: createUser
              });
            }
          `,
        },
      };

      const result = runHook(input);
      expect(result.exitCode).toBe(2);
      expect(result.stderr).toContain("Mutation without error handling");
      expect(result.stderr).toContain("onError handler");
    });

    it("should allow proper mutation with error handling", () => {
      const input = {
        tool_name: "Write",
        tool_input: {
          file_path: "hooks/useCreateUser.ts",
          content: `
            import { useMutation, useQueryClient } from '@tanstack/react-query';
            
            export function useCreateUser() {
              const queryClient = useQueryClient();
              
              return useMutation({
                mutationFn: createUser,
                onSuccess: () => {
                  queryClient.invalidateQueries({ queryKey: ['users'] });
                },
                onError: (error) => {
                  console.error('Failed to create user:', error);
                }
              });
            }
          `,
        },
      };

      const result = runHook(input);
      expect(result.exitCode).toBe(0);
    });
  });

  describe("Optimistic updates", () => {
    it("should warn about missing previous data save", () => {
      const input = {
        tool_name: "Write",
        tool_input: {
          file_path: "hooks/useUpdateUser.ts",
          content: `
            import { useMutation, useQueryClient } from '@tanstack/react-query';
            
            export function useUpdateUser() {
              const queryClient = useQueryClient();
              
              return useMutation({
                mutationFn: updateUser,
                onMutate: (newUser) => {
                  queryClient.setQueryData(['user', newUser.id], newUser);
                }
              });
            }
          `,
        },
      };

      const result = runHook(input);
      expect(result.exitCode).toBe(2);
      expect(result.stderr).toContain(
        "Optimistic update without saving previous data",
      );
      expect(result.stderr).toContain("getQueryData");
    });

    it("should warn about error handler not using context", () => {
      const input = {
        tool_name: "Write",
        tool_input: {
          file_path: "hooks/useUpdateUser.ts",
          content: `
            import { useMutation, useQueryClient } from '@tanstack/react-query';
            
            export function useUpdateUser() {
              const queryClient = useQueryClient();
              
              return useMutation({
                mutationFn: updateUser,
                onError: (error, variables) => {
                  queryClient.setQueryData(['user', variables.id], null);
                }
              });
            }
          `,
        },
      };

      const result = runHook(input);
      expect(result.exitCode).toBe(2);
      expect(result.stderr).toContain("Error handler not using context");
    });
  });

  describe("Configuration patterns", () => {
    it("should warn about staleTime: 0", () => {
      const input = {
        tool_name: "Write",
        tool_input: {
          file_path: "hooks/useData.ts",
          content: `
            import { useQuery } from '@tanstack/react-query';
            
            export function useData() {
              return useQuery({
                queryKey: ['data'],
                queryFn: fetchData,
                staleTime: 0
              });
            }
          `,
        },
      };

      const result = runHook(input);
      expect(result.exitCode).toBe(2);
      expect(result.stderr).toContain(
        "staleTime: 0 causes excessive refetching",
      );
    });

    it("should warn about disabled retry on queries", () => {
      const input = {
        tool_name: "Write",
        tool_input: {
          file_path: "hooks/useData.ts",
          content: `
            import { useQuery } from '@tanstack/react-query';
            
            export function useData() {
              return useQuery({
                queryKey: ['data'],
                queryFn: fetchData,
                retry: false
              });
            }
          `,
        },
      };

      const result = runHook(input);
      expect(result.exitCode).toBe(2);
      expect(result.stderr).toContain(
        "Disabling retry for queries may harm UX",
      );
    });

    it("should warn about very short refetch intervals", () => {
      const input = {
        tool_name: "Write",
        tool_input: {
          file_path: "hooks/useRealtime.ts",
          content: `
            import { useQuery } from '@tanstack/react-query';
            
            export function useRealtime() {
              return useQuery({
                queryKey: ['realtime'],
                queryFn: fetchRealtime,
                refetchInterval: 100
              });
            }
          `,
        },
      };

      const result = runHook(input);
      expect(result.exitCode).toBe(2);
      expect(result.stderr).toContain("Very short refetch interval");
      expect(result.stderr).toContain("WebSockets");
    });
  });

  describe("TypeScript patterns", () => {
    it("should warn about any type usage", () => {
      const input = {
        tool_name: "Write",
        tool_input: {
          file_path: "hooks/useData.ts",
          content: `
            import { useQuery } from '@tanstack/react-query';
            
            export function useData() {
              return useQuery<any>({
                queryKey: ['data'],
                queryFn: fetchData
              });
            }
          `,
        },
      };

      const result = runHook(input);
      expect(result.exitCode).toBe(2);
      expect(result.stderr).toContain("Using any type for useQuery");
    });

    it("should warn about untyped mutations", () => {
      const input = {
        tool_name: "Write",
        tool_input: {
          file_path: "hooks/useCreateUser.ts",
          content: `
            import { useMutation } from '@tanstack/react-query';
            
            export function useCreateUser() {
              return useMutation({
                mutationFn: createUser
              });
            }
          `,
        },
      };

      const result = runHook(input);
      expect(result.exitCode).toBe(2);
      expect(result.stderr).toContain("Mutation without type parameters");
    });
  });

  describe("Error boundary patterns", () => {
    it("should warn about throwOnError without boundary", () => {
      const input = {
        tool_name: "Write",
        tool_input: {
          file_path: "components/DataComponent.tsx",
          content: `
            import { useQuery } from '@tanstack/react-query';
            
            export function DataComponent() {
              const { data } = useQuery({
                queryKey: ['data'],
                queryFn: fetchData,
                throwOnError: true
              });
              
              return <div>{data}</div>;
            }
          `,
        },
      };

      const result = runHook(input);
      expect(result.exitCode).toBe(2);
      expect(result.stderr).toContain("throwOnError without error boundary");
    });
  });

  describe("Suspense patterns", () => {
    it("should warn about suspense without boundary", () => {
      const input = {
        tool_name: "Write",
        tool_input: {
          file_path: "components/DataComponent.tsx",
          content: `
            import { useQuery } from '@tanstack/react-query';
            
            export function DataComponent() {
              const { data } = useQuery({
                queryKey: ['data'],
                queryFn: fetchData,
                suspense: true
              });
              
              return <div>{data}</div>;
            }
          `,
        },
      };

      const result = runHook(input);
      expect(result.exitCode).toBe(2);
      expect(result.stderr).toContain("suspense without Suspense boundary");
    });
  });

  describe("File type filtering", () => {
    it("should skip non-React files", () => {
      const input = {
        tool_name: "Write",
        tool_input: {
          file_path: "utils/helpers.py",
          content: "def useQuery(): pass",
        },
      };

      const result = runHook(input);
      expect(result.exitCode).toBe(0);
    });

    it("should skip files without TanStack Query", () => {
      const input = {
        tool_name: "Write",
        tool_input: {
          file_path: "components/Plain.tsx",
          content: "export const Plain = () => <div>No queries</div>;",
        },
      };

      const result = runHook(input);
      expect(result.exitCode).toBe(0);
    });
  });
});

const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");

describe("zustand-pattern-enforcer", () => {
  const hookPath = path.join(__dirname, "..", "zustand-pattern-enforcer.js");
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

  describe("Store creation patterns", () => {
    it("should block direct state mutation", () => {
      const input = {
        tool_name: "Write",
        tool_input: {
          file_path: "store/userStore.ts",
          content: `
            import { create } from 'zustand';
            
            const useStore = create(() => {
              return {
                user: null,
                setUser: (user) => {
                  state = { ...state, user };
                }
              };
            });
          `,
        },
      };

      const result = runHook(input);
      expect(result.exitCode).toBe(2);
      expect(result.stderr).toContain("Direct state mutation detected");
      expect(result.stderr).toContain("Use Immer middleware");
    });

    it("should block store without set/get", () => {
      const input = {
        tool_name: "Write",
        tool_input: {
          file_path: "store/simpleStore.ts",
          content: `
            import { create } from 'zustand';
            
            const useStore = create(() => ({
              count: 0
            }));
          `,
        },
      };

      const result = runHook(input);
      expect(result.exitCode).toBe(2);
      expect(result.stderr).toContain(
        "Store created without set/get functions",
      );
    });

    it("should allow proper store creation", () => {
      const input = {
        tool_name: "Write",
        tool_input: {
          file_path: "store/properStore.ts",
          content: `
            import { create } from 'zustand';
            
            interface StoreState {
              count: number;
              increment: () => void;
            }
            
            const useStore = create<StoreState>((set, get) => ({
              count: 0,
              increment: () => set((state) => ({ count: state.count + 1 }))
            }));
          `,
        },
      };

      const result = runHook(input);
      expect(result.exitCode).toBe(0);
    });
  });

  describe("Performance patterns", () => {
    it("should block using entire store without selector", () => {
      const input = {
        tool_name: "Write",
        tool_input: {
          file_path: "components/Counter.tsx",
          content: `
            import { useStore } from '../store';
            
            function Counter() {
              const store = useStore();
              return <div>{store.count}</div>;
            }
          `,
        },
      };

      const result = runHook(input);
      expect(result.exitCode).toBe(2);
      expect(result.stderr).toContain("Using entire store without selector");
      expect(result.stderr).toContain("unnecessary re-renders");
    });

    it("should block object creation in selectors", () => {
      const input = {
        tool_name: "Write",
        tool_input: {
          file_path: "components/UserProfile.tsx",
          content: `
            import { useStore } from '../store';
            
            function UserProfile() {
              const userData = useStore((state) => {
                return { name: state.name, email: state.email };
              });
              return <div>{userData.name}</div>;
            }
          `,
        },
      };

      const result = runHook(input);
      expect(result.exitCode).toBe(2);
      expect(result.stderr).toContain("Creating new objects in selectors");
      expect(result.stderr).toContain("infinite re-renders");
    });

    it("should allow proper selector usage", () => {
      const input = {
        tool_name: "Write",
        tool_input: {
          file_path: "components/GoodCounter.tsx",
          content: `
            import { useStore } from '../store';
            import { shallow } from 'zustand/shallow';
            
            function Counter() {
              const count = useStore((state) => state.count);
              const [name, email] = useStore((state) => [state.name, state.email], shallow);
              return <div>{count}</div>;
            }
          `,
        },
      };

      const result = runHook(input);
      expect(result.exitCode).toBe(0);
    });
  });

  describe("Middleware patterns", () => {
    it("should suggest persist middleware for localStorage", () => {
      const input = {
        tool_name: "Write",
        tool_input: {
          file_path: "store/persistStore.ts",
          content: `
            import { create } from 'zustand';
            
            const useStore = create((set) => ({
              theme: 'light',
              setTheme: (theme) => {
                set({ theme });
                localStorage.setItem('theme', theme);
              }
            }));
          `,
        },
      };

      const result = runHook(input);
      expect(result.exitCode).toBe(2);
      expect(result.stderr).toContain("Manual localStorage sync");
      expect(result.stderr).toContain("Use persist middleware");
    });

    it("should suggest devtools for logging", () => {
      const input = {
        tool_name: "Write",
        tool_input: {
          file_path: "store/debugStore.ts",
          content: `
            import { create } from 'zustand';
            
            const useStore = create((set) => ({
              data: null,
              setData: (data) => {
                console.log('State update:', data);
                set({ data });
              }
            }));
          `,
        },
      };

      const result = runHook(input);
      expect(result.exitCode).toBe(2);
      expect(result.stderr).toContain("Manual state logging");
      expect(result.stderr).toContain("Use devtools middleware");
    });
  });

  describe("TypeScript patterns", () => {
    it("should require type annotations for selectors", () => {
      const input = {
        tool_name: "Write",
        tool_input: {
          file_path: "components/TypedComponent.tsx",
          content: `
            import { useStore } from '../store';
            
            function Component() {
              const value = useStore((state) => state.value);
              return <div>{value}</div>;
            }
          `,
        },
      };

      const result = runHook(input);
      expect(result.exitCode).toBe(2);
      expect(result.stderr).toContain("Missing type annotation");
    });

    it("should block any/unknown types", () => {
      const input = {
        tool_name: "Write",
        tool_input: {
          file_path: "store/badTypes.ts",
          content: `
            import { create } from 'zustand';
            
            const useStore = create((set) => ({
              data: null as any,
              setData: (data: unknown) => set({ data })
            }));
          `,
        },
      };

      const result = runHook(input);
      expect(result.exitCode).toBe(2);
      expect(result.stderr).toContain("Using any/unknown types");
    });
  });

  describe("Async patterns", () => {
    it("should block async in set", () => {
      const input = {
        tool_name: "Write",
        tool_input: {
          file_path: "store/asyncStore.ts",
          content: `
            import { create } from 'zustand';
            
            const useStore = create((set) => ({
              data: null,
              fetchData: () => {
                set(async () => {
                  const res = await fetch('/api/data');
                  return { data: await res.json() };
                });
              }
            }));
          `,
        },
      };

      const result = runHook(input);
      expect(result.exitCode).toBe(2);
      expect(result.stderr).toContain("Async function passed directly to set");
    });

    it("should allow proper async handling", () => {
      const input = {
        tool_name: "Write",
        tool_input: {
          file_path: "store/goodAsyncStore.ts",
          content: `
            import { create } from 'zustand';
            
            const useStore = create((set) => ({
              data: null,
              fetchData: async () => {
                const res = await fetch('/api/data');
                const data = await res.json();
                set({ data });
              }
            }));
          `,
        },
      };

      const result = runHook(input);
      expect(result.exitCode).toBe(0);
    });
  });

  describe("Testing patterns", () => {
    it("should warn about incorrect mocking", () => {
      const input = {
        tool_name: "Write",
        tool_input: {
          file_path: "__tests__/store.test.ts",
          content: `
            import { render } from '@testing-library/react';
            
            jest.mock('zustand');
            
            describe('Store tests', () => {
              it('should mock store', () => {
                // test code
              });
            });
          `,
        },
      };

      const result = runHook(input);
      expect(result.exitCode).toBe(2);
      expect(result.stderr).toContain("Incorrect Zustand mocking");
      expect(result.stderr).toContain("zustand/testing");
    });
  });

  describe("File type filtering", () => {
    it("should skip non-React files", () => {
      const input = {
        tool_name: "Write",
        tool_input: {
          file_path: "utils/helpers.py",
          content: "def create(): pass",
        },
      };

      const result = runHook(input);
      expect(result.exitCode).toBe(0);
    });

    it("should skip files without Zustand", () => {
      const input = {
        tool_name: "Write",
        tool_input: {
          file_path: "components/Plain.tsx",
          content: "export const Plain = () => <div>No state</div>;",
        },
      };

      const result = runHook(input);
      expect(result.exitCode).toBe(0);
    });
  });
});

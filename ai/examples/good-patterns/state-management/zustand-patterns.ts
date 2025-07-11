/**
 * State Management - Good Patterns with Zustand
 * 
 * This file demonstrates best practices for state management using Zustand
 * with proper TypeScript integration, middleware, and patterns.
 */

import { create } from 'zustand';
import { devtools, persist, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

// Types
interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'guest';
}

interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  timestamp: number;
  read: boolean;
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

// 1. Basic Store with TypeScript
interface CounterStore {
  count: number;
  increment: () => void;
  decrement: () => void;
  reset: () => void;
  setCount: (count: number) => void;
}

export const useCounterStore = create<CounterStore>()(
  devtools(
    (set, get) => ({
      count: 0,
      increment: () => set((state) => ({ count: state.count + 1 })),
      decrement: () => set((state) => ({ count: state.count - 1 })),
      reset: () => set({ count: 0 }),
      setCount: (count) => set({ count }),
    }),
    {
      name: 'counter-store',
    }
  )
);

// 2. User Authentication Store with Persistence
interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthStore>()(
  devtools(
    persist(
      (set, get) => ({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,

        login: async (email: string, password: string) => {
          set({ isLoading: true, error: null });
          
          try {
            const response = await fetch('/api/auth/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
              throw new Error('Login failed');
            }

            const { user, token } = await response.json();
            
            set({
              user,
              token,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : 'Login failed',
              isLoading: false,
            });
          }
        },

        logout: () => {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            error: null,
          });
        },

        updateUser: (userData) => {
          const currentUser = get().user;
          if (currentUser) {
            set({
              user: { ...currentUser, ...userData },
            });
          }
        },

        clearError: () => set({ error: null }),
      }),
      {
        name: 'auth-store',
        partialize: (state) => ({
          user: state.user,
          token: state.token,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    ),
    {
      name: 'auth-store',
    }
  )
);

// 3. Notifications Store with Immer for Complex Updates
interface NotificationStore {
  notifications: Notification[];
  
  addNotification: (message: string, type: Notification['type']) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  getUnreadCount: () => number;
}

export const useNotificationStore = create<NotificationStore>()(
  devtools(
    immer((set, get) => ({
      notifications: [],

      addNotification: (message, type) => {
        const notification: Notification = {
          id: crypto.randomUUID(),
          message,
          type,
          timestamp: Date.now(),
          read: false,
        };

        set((state) => {
          state.notifications.unshift(notification);
          
          // Keep only last 50 notifications
          if (state.notifications.length > 50) {
            state.notifications = state.notifications.slice(0, 50);
          }
        });

        // Auto-remove success notifications after 5 seconds
        if (type === 'success') {
          setTimeout(() => {
            get().removeNotification(notification.id);
          }, 5000);
        }
      },

      markAsRead: (id) => {
        set((state) => {
          const notification = state.notifications.find(n => n.id === id);
          if (notification) {
            notification.read = true;
          }
        });
      },

      markAllAsRead: () => {
        set((state) => {
          state.notifications.forEach(notification => {
            notification.read = true;
          });
        });
      },

      removeNotification: (id) => {
        set((state) => {
          state.notifications = state.notifications.filter(n => n.id !== id);
        });
      },

      clearAll: () => {
        set((state) => {
          state.notifications = [];
        });
      },

      getUnreadCount: () => {
        return get().notifications.filter(n => !n.read).length;
      },
    })),
    {
      name: 'notification-store',
    }
  )
);

// 4. Shopping Cart Store with Complex State Logic
interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  
  // Computed values
  totalItems: () => number;
  totalPrice: () => number;
  
  // Actions
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
}

export const useCartStore = create<CartStore>()(
  devtools(
    persist(
      (set, get) => ({
        items: [],
        isOpen: false,

        totalItems: () => {
          return get().items.reduce((total, item) => total + item.quantity, 0);
        },

        totalPrice: () => {
          return get().items.reduce((total, item) => total + (item.price * item.quantity), 0);
        },

        addItem: (newItem) => {
          set((state) => {
            const existingItem = state.items.find(item => item.id === newItem.id);
            
            if (existingItem) {
              return {
                items: state.items.map(item =>
                  item.id === newItem.id
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
                ),
              };
            } else {
              return {
                items: [...state.items, { ...newItem, quantity: 1 }],
              };
            }
          });
        },

        removeItem: (id) => {
          set((state) => ({
            items: state.items.filter(item => item.id !== id),
          }));
        },

        updateQuantity: (id, quantity) => {
          if (quantity <= 0) {
            get().removeItem(id);
            return;
          }

          set((state) => ({
            items: state.items.map(item =>
              item.id === id ? { ...item, quantity } : item
            ),
          }));
        },

        clearCart: () => {
          set({ items: [] });
        },

        toggleCart: () => {
          set((state) => ({ isOpen: !state.isOpen }));
        },
      }),
      {
        name: 'cart-store',
        partialize: (state) => ({ items: state.items }),
      }
    ),
    {
      name: 'cart-store',
    }
  )
);

// 5. Store with Subscriptions and Side Effects
interface ThemeStore {
  theme: 'light' | 'dark' | 'system';
  resolvedTheme: 'light' | 'dark';
  
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeStore>()(
  devtools(
    subscribeWithSelector(
      persist(
        (set, get) => ({
          theme: 'system',
          resolvedTheme: 'light',

          setTheme: (theme) => {
            set({ theme });
          },

          toggleTheme: () => {
            const currentTheme = get().theme;
            const nextTheme = currentTheme === 'light' ? 'dark' : 'light';
            set({ theme: nextTheme });
          },
        }),
        {
          name: 'theme-store',
          partialize: (state) => ({ theme: state.theme }),
        }
      )
    ),
    {
      name: 'theme-store',
    }
  )
);

// Subscribe to theme changes and update DOM
useThemeStore.subscribe(
  (state) => state.theme,
  (theme) => {
    const updateResolvedTheme = () => {
      let resolvedTheme: 'light' | 'dark' = 'light';
      
      if (theme === 'system') {
        resolvedTheme = window.matchMedia('(prefers-color-scheme: dark)').matches 
          ? 'dark' 
          : 'light';
      } else {
        resolvedTheme = theme;
      }
      
      useThemeStore.setState({ resolvedTheme });
      document.documentElement.setAttribute('data-theme', resolvedTheme);
    };

    updateResolvedTheme();

    // Listen for system theme changes
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', updateResolvedTheme);
      
      return () => {
        mediaQuery.removeEventListener('change', updateResolvedTheme);
      };
    }
  }
);

// 6. Store Composition Pattern
interface ApiStore {
  isLoading: boolean;
  error: string | null;
  
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

const createApiSlice = <T extends object>(
  name: string,
  initialData: T
) => {
  return create<T & ApiStore>()(
    devtools(
      (set) => ({
        ...initialData,
        isLoading: false,
        error: null,

        setLoading: (loading) => set({ isLoading: loading }),
        setError: (error) => set({ error }),
        clearError: () => set({ error: null }),
      }),
      {
        name: `${name}-store`,
      }
    )
  );
};

// Usage of composition pattern
interface UserListData {
  users: User[];
  setUsers: (users: User[]) => void;
  addUser: (user: User) => void;
}

export const useUserListStore = createApiSlice<UserListData>('user-list', {
  users: [],
  setUsers: (users) => useUserListStore.setState({ users }),
  addUser: (user) => useUserListStore.setState((state) => ({
    users: [...state.users, user],
  })),
});

// 7. Async Actions with Error Handling
interface TodoStore {
  todos: Array<{ id: string; text: string; completed: boolean }>;
  isLoading: boolean;
  error: string | null;
  
  fetchTodos: () => Promise<void>;
  addTodo: (text: string) => Promise<void>;
  toggleTodo: (id: string) => Promise<void>;
  deleteTodo: (id: string) => Promise<void>;
}

export const useTodoStore = create<TodoStore>()(
  devtools(
    (set, get) => ({
      todos: [],
      isLoading: false,
      error: null,

      fetchTodos: async () => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await fetch('/api/todos');
          if (!response.ok) throw new Error('Failed to fetch todos');
          
          const todos = await response.json();
          set({ todos, isLoading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Unknown error',
            isLoading: false,
          });
        }
      },

      addTodo: async (text) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await fetch('/api/todos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text }),
          });
          
          if (!response.ok) throw new Error('Failed to add todo');
          
          const newTodo = await response.json();
          set((state) => ({
            todos: [...state.todos, newTodo],
            isLoading: false,
          }));
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Unknown error',
            isLoading: false,
          });
        }
      },

      toggleTodo: async (id) => {
        const todo = get().todos.find(t => t.id === id);
        if (!todo) return;

        // Optimistic update
        set((state) => ({
          todos: state.todos.map(t =>
            t.id === id ? { ...t, completed: !t.completed } : t
          ),
        }));

        try {
          const response = await fetch(`/api/todos/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ completed: !todo.completed }),
          });

          if (!response.ok) {
            // Revert optimistic update
            set((state) => ({
              todos: state.todos.map(t =>
                t.id === id ? { ...t, completed: todo.completed } : t
              ),
            }));
            throw new Error('Failed to update todo');
          }
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      },

      deleteTodo: async (id) => {
        const originalTodos = get().todos;
        
        // Optimistic update
        set((state) => ({
          todos: state.todos.filter(t => t.id !== id),
        }));

        try {
          const response = await fetch(`/api/todos/${id}`, {
            method: 'DELETE',
          });

          if (!response.ok) {
            // Revert optimistic update
            set({ todos: originalTodos });
            throw new Error('Failed to delete todo');
          }
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      },
    }),
    {
      name: 'todo-store',
    }
  )
);

// 8. React Hook Integration Examples

export function useAuthActions() {
  const login = useAuthStore((state) => state.login);
  const logout = useAuthStore((state) => state.logout);
  const clearError = useAuthStore((state) => state.clearError);
  
  return { login, logout, clearError };
}

export function useCartActions() {
  const addItem = useCartStore((state) => state.addItem);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const clearCart = useCartStore((state) => state.clearCart);
  
  return { addItem, removeItem, updateQuantity, clearCart };
}

// Selective subscriptions for performance
export function useCartSummary() {
  const totalItems = useCartStore((state) => state.totalItems());
  const totalPrice = useCartStore((state) => state.totalPrice());
  
  return { totalItems, totalPrice };
}

// 9. Store Testing Utilities
export const createTestStore = <T>(store: any, initialState?: Partial<T>) => {
  const originalState = store.getState();
  
  if (initialState) {
    store.setState(initialState, true);
  }
  
  return {
    cleanup: () => store.setState(originalState, true),
    getState: () => store.getState(),
    setState: (state: Partial<T>) => store.setState(state, true),
  };
};

// 10. Component Examples

export function LoginForm() {
  const { user, isLoading, error } = useAuthStore();
  const { login, clearError } = useAuthActions();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email, password);
  };

  if (user) {
    return <div>Welcome, {user.name}!</div>;
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="error">
          {error}
          <button type="button" onClick={clearError}>×</button>
        </div>
      )}
      
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}

export function CartSummary() {
  const { totalItems, totalPrice } = useCartSummary();
  const toggleCart = useCartStore((state) => state.toggleCart);

  return (
    <button onClick={toggleCart} className="cart-summary">
      Cart ({totalItems}) - ${totalPrice.toFixed(2)}
    </button>
  );
}

export function NotificationList() {
  const notifications = useNotificationStore((state) => state.notifications);
  const { markAsRead, removeNotification } = useNotificationStore();

  return (
    <div className="notifications">
      {notifications.map(notification => (
        <div
          key={notification.id}
          className={`notification ${notification.type} ${notification.read ? 'read' : 'unread'}`}
          onClick={() => markAsRead(notification.id)}
        >
          <span>{notification.message}</span>
          <button onClick={() => removeNotification(notification.id)}>
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
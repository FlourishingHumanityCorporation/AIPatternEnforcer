/**
 * Performance Anti-Patterns - Common Mistakes
 *
 * This file demonstrates common performance anti-patterns and how to avoid them.
 * These are examples of what NOT to do, with explanations and better alternatives.
 */

import React, { useState, useEffect, useMemo, useCallback } from "react";

// ❌ ANTI-PATTERN 1: Unnecessary re-renders
export const UNNECESSARY_RERENDERS = {
  // DON'T DO THIS - Creating objects in render
  BadComponent: ({ users }: { users: User[] }) => {
    return (
      <div>
        {users.map((user) => (
          <UserCard
            key={user.id}
            user={user}
            style={{ padding: "10px" }} // New object every render!
            onClick={() => console.log(user)} // New function every render!
          />
        ))}
      </div>
    );
  },

  // DON'T DO THIS - Inline styles and functions
  BadListComponent: ({ items }: { items: any[] }) => {
    return (
      <div>
        {items.map((item, index) => (
          <div
            key={index} // Bad key choice
            style={{
              backgroundColor: index % 2 === 0 ? "#f0f0f0" : "#fff", // Computed every render
            }}
            onClick={() => handleItemClick(item.id)} // New function every render
          >
            {item.name}
          </div>
        ))}
      </div>
    );
  },

  // DON'T DO THIS - No memoization for expensive calculations
  BadExpensiveComponent: ({ data }: { data: number[] }) => {
    // Expensive calculation runs on every render
    const expensiveResult = data
      .filter((n) => n > 0)
      .map((n) => n * 2)
      .reduce((sum, n) => sum + n, 0);

    return <div>Result: {expensiveResult}</div>;
  },
};

// ✅ BETTER APPROACH: Optimized components
export const OPTIMIZED_COMPONENTS = {
  // Define styles outside component
  cardStyle = { padding: "10px" },

  GoodComponent: ({ users }: { users: User[] }) => {
    const handleUserClick = useCallback((user: User) => {
      console.log(user);
    }, []);

    return (
      <div>
        {users.map((user) => (
          <UserCard
            key={user.id}
            user={user}
            style={this.cardStyle} // Reuse same object
            onClick={handleUserClick} // Stable function reference
          />
        ))}
      </div>
    );
  },

  GoodListComponent: ({ items }: { items: any[] }) => {
    const handleItemClick = useCallback((itemId: string) => {
      // Handle click
    }, []);

    return (
      <div>
        {items.map((item) => (
          <ListItem
            key={item.id} // Stable, unique key
            item={item}
            onClick={handleItemClick}
          />
        ))}
      </div>
    );
  },

  GoodExpensiveComponent: ({ data }: { data: number[] }) => {
    // Memoize expensive calculation
    const expensiveResult = useMemo(() => {
      return data
        .filter((n) => n > 0)
        .map((n) => n * 2)
        .reduce((sum, n) => sum + n, 0);
    }, [data]);

    return <div>Result: {expensiveResult}</div>;
  },
};

// ❌ ANTI-PATTERN 2: Memory leaks and cleanup issues
export const MEMORY_LEAKS = {
  // DON'T DO THIS - No cleanup of event listeners
  BadEventListenerComponent: () => {
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    useEffect(() => {
      const handleResize = () => {
        setWindowWidth(window.innerWidth);
      };

      window.addEventListener("resize", handleResize);
      // Missing cleanup! Memory leak
    }, []);

    return <div>Width: {windowWidth}</div>;
  },

  // DON'T DO THIS - No cleanup of intervals/timeouts
  BadTimerComponent: () => {
    const [count, setCount] = useState(0);

    useEffect(() => {
      setInterval(() => {
        setCount((prev) => prev + 1);
      }, 1000);
      // Missing cleanup! Memory leak
    }, []);

    return <div>Count: {count}</div>;
  },

  // DON'T DO THIS - No cleanup of async operations
  BadAsyncComponent: ({ userId }: { userId: string }) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
      fetchUser(userId).then(setUser);
      // No way to cancel if component unmounts
    }, [userId]);

    return user ? <div>{user.name}</div> : <div>Loading...</div>;
  },

  // DON'T DO THIS - Accumulating DOM references
  BadDOMRefComponent: () => {
    const elementsRef = useRef<HTMLElement[]>([]);

    useEffect(() => {
      const elements = document.querySelectorAll(".some-class");
      elementsRef.current.push(...elements); // Accumulates references
    });

    return <div>Some content</div>;
  },
};

// ✅ BETTER APPROACH: Proper cleanup
export const PROPER_CLEANUP = {
  GoodEventListenerComponent: () => {
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    useEffect(() => {
      const handleResize = () => {
        setWindowWidth(window.innerWidth);
      };

      window.addEventListener("resize", handleResize);

      // Proper cleanup
      return () => {
        window.removeEventListener("resize", handleResize);
      };
    }, []);

    return <div>Width: {windowWidth}</div>;
  },

  GoodTimerComponent: () => {
    const [count, setCount] = useState(0);

    useEffect(() => {
      const intervalId = setInterval(() => {
        setCount((prev) => prev + 1);
      }, 1000);

      // Proper cleanup
      return () => {
        clearInterval(intervalId);
      };
    }, []);

    return <div>Count: {count}</div>;
  },

  GoodAsyncComponent: ({ userId }: { userId: string }) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
      let cancelled = false;

      fetchUser(userId).then((userData) => {
        if (!cancelled) {
          setUser(userData);
        }
      });

      // Proper cleanup
      return () => {
        cancelled = true;
      };
    }, [userId]);

    return user ? <div>{user.name}</div> : <div>Loading...</div>;
  },

  GoodDOMRefComponent: () => {
    const elementsRef = useRef<HTMLElement[]>([]);

    useEffect(() => {
      const elements = document.querySelectorAll(".some-class");
      elementsRef.current = Array.from(elements);

      // Proper cleanup
      return () => {
        elementsRef.current = [];
      };
    });

    return <div>Some content</div>;
  },
};

// ❌ ANTI-PATTERN 3: Inefficient state updates
export const INEFFICIENT_STATE_UPDATES = {
  // DON'T DO THIS - Multiple state updates in sequence
  BadStateUpdates: () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [data, setData] = useState(null);

    const fetchData = async () => {
      setLoading(true); // Render 1
      setError(null); // Render 2
      setData(null); // Render 3

      try {
        const result = await api.getData();
        setData(result); // Render 4
        setLoading(false); // Render 5
      } catch (err) {
        setError(err); // Render 6
        setLoading(false); // Render 7
      }
    };

    return <div>Content</div>;
  },

  // DON'T DO THIS - Updating large objects inefficiently
  BadObjectUpdates: () => {
    const [formData, setFormData] = useState({
      name: "",
      email: "",
      address: {
        street: "",
        city: "",
        state: "",
        zip: "",
      },
    });

    const updateName = (name: string) => {
      setFormData({ ...formData, name }); // Spreads entire object
    };

    const updateStreet = (street: string) => {
      setFormData({
        ...formData,
        address: {
          ...formData.address,
          street,
        },
      }); // Complex nested spread
    };

    return <div>Form</div>;
  },
};

// ✅ BETTER APPROACH: Efficient state updates
export const EFFICIENT_STATE_UPDATES = {
  GoodStateUpdates: () => {
    const [state, setState] = useState({
      loading: false,
      error: null,
      data: null,
    });

    const fetchData = async () => {
      setState({ loading: true, error: null, data: null }); // Single update

      try {
        const result = await api.getData();
        setState({ loading: false, error: null, data: result }); // Single update
      } catch (err) {
        setState({ loading: false, error: err, data: null }); // Single update
      }
    };

    return <div>Content</div>;
  },

  GoodObjectUpdates: () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [address, setAddress] = useState({
      street: "",
      city: "",
      state: "",
      zip: "",
    });

    const updateStreet = useCallback((street: string) => {
      setAddress((prev) => ({ ...prev, street })); // Only spread address
    }, []);

    return <div>Form</div>;
  },
};

// ❌ ANTI-PATTERN 4: Inefficient list rendering
export const INEFFICIENT_LIST_RENDERING = {
  // DON'T DO THIS - Rendering massive lists without virtualization
  BadMassiveList: ({ items }: { items: any[] }) => {
    return (
      <div style={{ height: "400px", overflow: "auto" }}>
        {items.map(
          (
            item,
            index, // 10,000+ items rendered
          ) => (
            <div key={index} style={{ height: "50px" }}>
              {item.name}
            </div>
          ),
        )}
      </div>
    );
  },

  // DON'T DO THIS - Complex calculations in render
  BadComplexListItem: ({ item }: { item: any }) => {
    // Expensive calculation on every render
    const processedData = processComplexData(item);
    const formattedDate = formatComplexDate(item.date);
    const calculatedScore = calculateComplexScore(item.metrics);

    return (
      <div>
        <h3>{item.name}</h3>
        <p>{processedData}</p>
        <span>{formattedDate}</span>
        <strong>{calculatedScore}</strong>
      </div>
    );
  },

  // DON'T DO THIS - No keys or bad keys
  BadKeysList: ({ items }: { items: any[] }) => {
    return (
      <div>
        {items.map((item, index) => (
          <div key={index}>
            {" "}
            {/* Bad: index as key */}
            {item.name}
          </div>
        ))}

        {items.map((item) => (
          <div>
            {" "}
            {/* Bad: no key */}
            {item.name}
          </div>
        ))}
      </div>
    );
  },
};

// ✅ BETTER APPROACH: Efficient list rendering
export const EFFICIENT_LIST_RENDERING = {
  // Use virtualization for large lists
  GoodMassiveList: ({ items }: { items: any[] }) => {
    const Row = ({ index, style }: { index: number; style: any }) => (
      <div style={style}>{items[index].name}</div>
    );

    return (
      <FixedSizeList height={400} itemCount={items.length} itemSize={50}>
        {Row}
      </FixedSizeList>
    );
  },

  // Memoize expensive calculations
  GoodComplexListItem: React.memo(({ item }: { item: any }) => {
    const processedData = useMemo(() => processComplexData(item), [item]);
    const formattedDate = useMemo(
      () => formatComplexDate(item.date),
      [item.date],
    );
    const calculatedScore = useMemo(
      () => calculateComplexScore(item.metrics),
      [item.metrics],
    );

    return (
      <div>
        <h3>{item.name}</h3>
        <p>{processedData}</p>
        <span>{formattedDate}</span>
        <strong>{calculatedScore}</strong>
      </div>
    );
  }),

  // Use proper keys
  GoodKeysList: ({ items }: { items: any[] }) => {
    return (
      <div>
        {items.map((item) => (
          <div key={item.id}>
            {" "}
            {/* Good: stable, unique key */}
            {item.name}
          </div>
        ))}
      </div>
    );
  },
};

// ❌ ANTI-PATTERN 5: Inefficient API calls
export const INEFFICIENT_API_CALLS = {
  // DON'T DO THIS - Multiple API calls for related data
  BadDataFetching: ({ userIds }: { userIds: string[] }) => {
    const [users, setUsers] = useState<User[]>([]);

    useEffect(() => {
      // Makes N API calls instead of 1
      Promise.all(userIds.map((id) => fetchUser(id))).then(setUsers);
    }, [userIds]);

    return <div>Users</div>;
  },

  // DON'T DO THIS - No caching or deduplication
  BadCachingComponent: ({ userId }: { userId: string }) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
      // Always fetches, even if data already exists
      fetchUser(userId).then(setUser);
    }, [userId]);

    return user ? <div>{user.name}</div> : <div>Loading...</div>;
  },

  // DON'T DO THIS - Fetching on every render
  BadRenderFetching: ({ searchTerm }: { searchTerm: string }) => {
    const [results, setResults] = useState([]);

    // Fetches on every render!
    if (searchTerm) {
      searchAPI(searchTerm).then(setResults);
    }

    return <div>Results: {results.length}</div>;
  },

  // DON'T DO THIS - No request deduplication
  BadRequestDeduplication: ({ userId }: { userId: string }) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
      // Multiple components making same request simultaneously
      fetchUser(userId).then(setUser);
    }, [userId]);

    return <div>User</div>;
  },
};

// ✅ BETTER APPROACH: Efficient API calls
export const EFFICIENT_API_CALLS = {
  // Batch API calls
  GoodDataFetching: ({ userIds }: { userIds: string[] }) => {
    const [users, setUsers] = useState<User[]>([]);

    useEffect(() => {
      // Single API call for multiple users
      fetchUsers(userIds).then(setUsers);
    }, [userIds]);

    return <div>Users</div>;
  },

  // Use React Query for caching
  GoodCachingComponent: ({ userId }: { userId: string }) => {
    const { data: user, isLoading } = useQuery({
      queryKey: ["user", userId],
      queryFn: () => fetchUser(userId),
      staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    });

    return isLoading ? <div>Loading...</div> : <div>{user?.name}</div>;
  },

  // Proper effect usage with debouncing
  GoodRenderFetching: ({ searchTerm }: { searchTerm: string }) => {
    const [results, setResults] = useState([]);
    const [debouncedTerm, setDebouncedTerm] = useState(searchTerm);

    // Debounce search term
    useEffect(() => {
      const timer = setTimeout(() => {
        setDebouncedTerm(searchTerm);
      }, 300);

      return () => clearTimeout(timer);
    }, [searchTerm]);

    // Search only when debounced term changes
    useEffect(() => {
      if (debouncedTerm) {
        searchAPI(debouncedTerm).then(setResults);
      }
    }, [debouncedTerm]);

    return <div>Results: {results.length}</div>;
  },

  // Request deduplication
  GoodRequestDeduplication: ({ userId }: { userId: string }) => {
    // Using React Query automatically deduplicates requests
    const { data: user } = useQuery({
      queryKey: ["user", userId],
      queryFn: () => fetchUser(userId),
    });

    return <div>{user?.name}</div>;
  },
};

// ❌ ANTI-PATTERN 6: Bundle size and loading issues
export const BUNDLE_SIZE_ISSUES = {
  // DON'T DO THIS - Import entire libraries
  badImports: () => {
    const _ = require("lodash"); // Entire library
    const moment = require("moment"); // Large library

    return _.debounce(() => {
      console.log(moment().format());
    }, 1000);
  },

  // DON'T DO THIS - No code splitting
  BadAppStructure: () => {
    return (
      <div>
        <HeavyDashboard />
        <HeavyReports />
        <HeavySettings />
        {/* All loaded upfront */}
      </div>
    );
  },

  // DON'T DO THIS - Large images without optimization
  BadImageComponent: ({ imageUrl }: { imageUrl: string }) => {
    return (
      <img
        src={imageUrl} // Full resolution image
        alt="Description"
        style={{ width: "200px", height: "200px" }}
      />
    );
  },
};

// ✅ BETTER APPROACH: Optimized bundle and loading
export const OPTIMIZED_BUNDLE = {
  // Import only what you need
  goodImports: () => {
    const debounce = require("lodash/debounce"); // Only debounce
    const format = require("date-fns/format"); // Lighter alternative

    return debounce(() => {
      console.log(format(new Date(), "yyyy-MM-dd"));
    }, 1000);
  },

  // Use code splitting
  GoodAppStructure: () => {
    const Dashboard = lazy(() => import("./Dashboard"));
    const Reports = lazy(() => import("./Reports"));
    const Settings = lazy(() => import("./Settings"));

    return (
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Suspense>
    );
  },

  // Optimize images
  GoodImageComponent: ({ imageUrl }: { imageUrl: string }) => {
    return (
      <picture>
        <source srcSet={`${imageUrl}?w=400&format=webp`} type="image/webp" />
        <img
          src={`${imageUrl}?w=400&format=jpg`}
          alt="Description"
          style={{ width: "200px", height: "200px" }}
          loading="lazy"
        />
      </picture>
    );
  },
};

// Mock functions and components
const fetchUser = async (id: string): Promise<User> => ({ id, name: "User" });
const fetchUsers = async (ids: string[]): Promise<User[]> =>
  ids.map((id) => ({ id, name: "User" }));
const searchAPI = async (term: string): Promise<any[]> => [];
const processComplexData = (data: any) => "processed";
const formatComplexDate = (date: any) => "formatted";
const calculateComplexScore = (metrics: any) => 100;

interface User {
  id: string;
  name: string;
}

// Mock components
const UserCard = ({ user, style, onClick }: any) => <div>{user.name}</div>;
const ListItem = ({ item, onClick }: any) => <div>{item.name}</div>;
const FixedSizeList = ({ children, height, itemCount, itemSize }: any) => (
  <div>Virtualized List</div>
);
const HeavyDashboard = () => <div>Heavy Dashboard</div>;
const HeavyReports = () => <div>Heavy Reports</div>;
const HeavySettings = () => <div>Heavy Settings</div>;

// Mock hooks
const useQuery = (options: any) => ({ data: null, isLoading: false });
const lazy = (fn: any) => fn;
const Suspense = ({ children }: any) => children;
const Routes = ({ children }: any) => children;
const Route = ({ path, element }: any) => element;

// Mock API
const api = {
  getData: async () => "data",
};

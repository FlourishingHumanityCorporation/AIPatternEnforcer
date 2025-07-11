# React Render Optimization Guide

## React Optimization Prompt Template

```
I need to optimize the rendering performance of [COMPONENT]. Please help me identify and fix unnecessary re-renders:

## Current Performance Issues:
- [ ] Component re-renders too frequently
- [ ] Child components re-render unnecessarily
- [ ] Expensive calculations run on every render
- [ ] Props/state changes cause cascading re-renders
- [ ] Large lists render slowly

## Component Details:
- Component: [Component name and file path]
- Parent component: [Parent component details]
- Child components: [List of child components]
- State structure: [Current state management]
- Props structure: [Props being passed down]

## Performance Symptoms:
- Re-render frequency: [X] times per action
- Render duration: [X] ms per render
- Memory usage: [Growing/Stable]
- User experience: [Laggy/Smooth]

Please analyze and provide optimization recommendations with specific code examples.
```

## React Rendering Optimization Strategies

### 1. Identifying Unnecessary Re-renders

#### React DevTools Profiler

```javascript
// Enable profiler in development
import { Profiler } from "react";

const ProfiledComponent = ({ children }) => {
  const onRenderCallback = (
    id,
    phase,
    actualDuration,
    baseDuration,
    startTime,
    commitTime,
  ) => {
    console.log("Profiler data:", {
      id,
      phase, // "mount" or "update"
      actualDuration, // Time spent rendering this update
      baseDuration, // Estimated time to render without memoization
      startTime, // When React began this update
      commitTime, // When React committed this update
    });
  };

  return (
    <Profiler id="ComponentProfiler" onRender={onRenderCallback}>
      {children}
    </Profiler>
  );
};
```

#### Custom Re-render Detection

```javascript
// Hook to detect re-renders
const useRenderCount = (componentName) => {
  const renderCount = useRef(0);
  renderCount.current++;

  console.log(`${componentName} rendered ${renderCount.current} times`);

  return renderCount.current;
};

// Usage
const MyComponent = (props) => {
  useRenderCount("MyComponent");

  // Component logic
};
```

### 2. Memoization Techniques

#### React.memo for Component Memoization

```typescript
// ❌ Component re-renders on every parent update
interface UserCardProps {
  user: User;
  onClick: (id: string) => void;
}

const UserCard: React.FC<UserCardProps> = ({ user, onClick }) => {
  return (
    <div onClick={() => onClick(user.id)}>
      <h3>{user.name}</h3>
      <p>{user.email}</p>
    </div>
  );
};

// ✅ Memoized component with custom comparison
const UserCard = React.memo<UserCardProps>(({ user, onClick }) => {
  return (
    <div onClick={() => onClick(user.id)}>
      <h3>{user.name}</h3>
      <p>{user.email}</p>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function
  return (
    prevProps.user.id === nextProps.user.id &&
    prevProps.user.name === nextProps.user.name &&
    prevProps.user.email === nextProps.user.email &&
    prevProps.onClick === nextProps.onClick
  );
});
```

#### useMemo for Expensive Calculations

```typescript
// ❌ Expensive calculation runs on every render
const ExpensiveComponent = ({ items, filter }) => {
  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(filter.toLowerCase())
  ).sort((a, b) => a.name.localeCompare(b.name));

  return (
    <ul>
      {filteredItems.map(item => (
        <li key={item.id}>{item.name}</li>
      ))}
    </ul>
  );
};

// ✅ Memoized expensive calculation
const OptimizedComponent = ({ items, filter }) => {
  const filteredItems = useMemo(() => {
    return items
      .filter(item =>
        item.name.toLowerCase().includes(filter.toLowerCase())
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [items, filter]);

  return (
    <ul>
      {filteredItems.map(item => (
        <li key={item.id}>{item.name}</li>
      ))}
    </ul>
  );
};
```

#### useCallback for Function Memoization

```typescript
// ❌ Function recreation causes child re-renders
const ParentComponent = ({ items }) => {
  const [selectedId, setSelectedId] = useState(null);

  const handleItemClick = (id: string) => {
    setSelectedId(id);
  };

  return (
    <div>
      {items.map(item => (
        <ChildComponent
          key={item.id}
          item={item}
          onClick={handleItemClick} // New function on every render
        />
      ))}
    </div>
  );
};

// ✅ Memoized function prevents child re-renders
const OptimizedParentComponent = ({ items }) => {
  const [selectedId, setSelectedId] = useState(null);

  const handleItemClick = useCallback((id: string) => {
    setSelectedId(id);
  }, []); // No dependencies, function never changes

  return (
    <div>
      {items.map(item => (
        <ChildComponent
          key={item.id}
          item={item}
          onClick={handleItemClick}
        />
      ))}
    </div>
  );
};
```

### 3. State Management Optimization

#### State Structure Optimization

```typescript
// ❌ Monolithic state causes unnecessary re-renders
const App = () => {
  const [appState, setAppState] = useState({
    user: { name: "", email: "" },
    ui: { theme: "light", sidebar: false },
    data: { items: [], loading: false },
  });

  // Any state change re-renders entire component
  const updateTheme = (theme: string) => {
    setAppState((prev) => ({
      ...prev,
      ui: { ...prev.ui, theme },
    }));
  };
};

// ✅ Split state to minimize re-renders
const App = () => {
  const [user, setUser] = useState({ name: "", email: "" });
  const [ui, setUi] = useState({ theme: "light", sidebar: false });
  const [data, setData] = useState({ items: [], loading: false });

  // Only UI-related components re-render
  const updateTheme = (theme: string) => {
    setUi((prev) => ({ ...prev, theme }));
  };
};
```

#### Context Optimization

```typescript
// ❌ Single context causes all consumers to re-render
const AppContext = createContext();

const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState('light');
  const [data, setData] = useState([]);

  const value = { user, setUser, theme, setTheme, data, setData };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

// ✅ Split contexts to minimize re-renders
const UserContext = createContext();
const ThemeContext = createContext();
const DataContext = createContext();

const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState('light');
  const [data, setData] = useState([]);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      <ThemeContext.Provider value={{ theme, setTheme }}>
        <DataContext.Provider value={{ data, setData }}>
          {children}
        </DataContext.Provider>
      </ThemeContext.Provider>
    </UserContext.Provider>
  );
};
```

### 4. List Rendering Optimization

#### Virtualization for Large Lists

```typescript
// ❌ Rendering thousands of items
const LargeList = ({ items }) => {
  return (
    <div>
      {items.map(item => (
        <ListItem key={item.id} item={item} />
      ))}
    </div>
  );
};

// ✅ Virtualized list for performance
import { FixedSizeList as List } from 'react-window';

const VirtualizedList = ({ items }) => {
  const Row = ({ index, style }) => (
    <div style={style}>
      <ListItem item={items[index]} />
    </div>
  );

  return (
    <List
      height={600}
      itemCount={items.length}
      itemSize={50}
    >
      {Row}
    </List>
  );
};
```

#### Optimized List Keys

```typescript
// ❌ Using array index as key
const BadList = ({ items }) => {
  return (
    <ul>
      {items.map((item, index) => (
        <li key={index}>{item.name}</li> // Bad: index as key
      ))}
    </ul>
  );
};

// ✅ Using stable, unique keys
const GoodList = ({ items }) => {
  return (
    <ul>
      {items.map(item => (
        <li key={item.id}>{item.name}</li> // Good: stable unique key
      ))}
    </ul>
  );
};
```

### 5. Component Splitting

#### Split Components by Responsibility

```typescript
// ❌ Monolithic component with multiple responsibilities
const UserDashboard = ({ userId }) => {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [settings, setSettings] = useState({});

  // All state changes cause entire component to re-render

  return (
    <div>
      <UserProfile user={user} />
      <UserPosts posts={posts} />
      <UserNotifications notifications={notifications} />
      <UserSettings settings={settings} />
    </div>
  );
};

// ✅ Split into focused components
const UserDashboard = ({ userId }) => {
  return (
    <div>
      <UserProfileContainer userId={userId} />
      <UserPostsContainer userId={userId} />
      <UserNotificationsContainer userId={userId} />
      <UserSettingsContainer userId={userId} />
    </div>
  );
};

const UserProfileContainer = ({ userId }) => {
  const [user, setUser] = useState(null);
  // Only this component re-renders on user changes

  return <UserProfile user={user} />;
};
```

### 6. Advanced Optimization Techniques

#### Lazy Loading with Suspense

```typescript
// Lazy load heavy components
const HeavyComponent = React.lazy(() => import('./HeavyComponent'));

const App = () => {
  const [showHeavy, setShowHeavy] = useState(false);

  return (
    <div>
      <button onClick={() => setShowHeavy(true)}>
        Load Heavy Component
      </button>

      {showHeavy && (
        <Suspense fallback={<div>Loading...</div>}>
          <HeavyComponent />
        </Suspense>
      )}
    </div>
  );
};
```

#### Portal for Expensive Overlays

```typescript
// Use portals to avoid affecting parent re-renders
import { createPortal } from 'react-dom';

const Modal = ({ children, isOpen }) => {
  if (!isOpen) return null;

  return createPortal(
    <div className="modal-overlay">
      <div className="modal-content">
        {children}
      </div>
    </div>,
    document.getElementById('modal-root')
  );
};
```

## Performance Optimization Patterns

### 1. Custom Hooks for Optimization

#### Debounced State Hook

```typescript
const useDebouncedState = <T>(initialValue: T, delay: number) => {
  const [value, setValue] = useState<T>(initialValue);
  const [debouncedValue, setDebouncedValue] = useState<T>(initialValue);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return [debouncedValue, setValue] as const;
};

// Usage
const SearchComponent = () => {
  const [searchTerm, setSearchTerm] = useDebouncedState("", 300);

  // API call only happens after 300ms of no typing
  useEffect(() => {
    if (searchTerm) {
      performSearch(searchTerm);
    }
  }, [searchTerm]);
};
```

#### Memoized Selector Hook

```typescript
const useMemoizedSelector = <T, R>(
  selector: (state: T) => R,
  state: T,
  deps: any[],
) => {
  return useMemo(() => selector(state), [state, ...deps]);
};

// Usage
const MyComponent = ({ appState }) => {
  const filteredData = useMemoizedSelector(
    (state) => state.items.filter((item) => item.active),
    appState,
    [],
  );
};
```

### 2. Optimization Checklist

#### Component-Level Optimization

- [ ] **React.memo**: Applied to components that receive same props
- [ ] **useMemo**: Used for expensive calculations
- [ ] **useCallback**: Used for event handlers passed to children
- [ ] **Keys**: Proper keys used in lists
- [ ] **State Structure**: State split appropriately
- [ ] **Context**: Multiple contexts for different concerns

#### Application-Level Optimization

- [ ] **Code Splitting**: Routes and heavy components are lazy loaded
- [ ] **Bundle Size**: Unnecessary libraries removed
- [ ] **Virtualization**: Large lists use virtualization
- [ ] **Image Optimization**: Images are optimized and lazy loaded
- [ ] **Network**: API calls are optimized and cached

### 3. Profiling and Measurement

#### Performance Metrics

```typescript
// Custom performance hook
const usePerformanceMetrics = (componentName: string) => {
  const renderStart = useRef<number>();
  const renderCount = useRef(0);

  renderCount.current++;

  useEffect(() => {
    renderStart.current = performance.now();
  });

  useEffect(() => {
    if (renderStart.current) {
      const renderTime = performance.now() - renderStart.current;
      console.log(
        `${componentName} render #${renderCount.current}: ${renderTime}ms`,
      );
    }
  });
};
```

#### Memory Usage Tracking

```typescript
// Memory tracking hook
const useMemoryTracking = (componentName: string) => {
  useEffect(() => {
    const logMemory = () => {
      if (performance.memory) {
        console.log(`${componentName} memory:`, {
          used: Math.round(performance.memory.usedJSHeapSize / 1048576),
          total: Math.round(performance.memory.totalJSHeapSize / 1048576),
        });
      }
    };

    logMemory();

    return () => {
      // Cleanup and final memory check
      setTimeout(logMemory, 0);
    };
  }, [componentName]);
};
```

## Common Optimization Anti-Patterns

### 1. Over-Optimization

```typescript
// ❌ Unnecessary memoization
const SimpleComponent = React.memo(({ text }) => {
  return <div>{text}</div>; // Too simple to need memoization
});

// ✅ Memoize only when beneficial
const ComplexComponent = React.memo(({ data, onUpdate }) => {
  // Complex rendering logic that benefits from memoization
  return <ComplexUI data={data} onUpdate={onUpdate} />;
});
```

### 2. Incorrect Dependencies

```typescript
// ❌ Missing or incorrect dependencies
const Component = ({ items, filter }) => {
  const filteredItems = useMemo(() => {
    return items.filter((item) => item.name.includes(filter));
  }, [items]); // Missing 'filter' dependency

  // ❌ Too many dependencies
  const expensiveValue = useMemo(() => {
    return items.length;
  }, [items, filter, someOtherProp]); // Only needs 'items'
};
```

### 3. Premature Optimization

```typescript
// ❌ Optimizing before measuring
const Component = () => {
  // Don't memoize without evidence of performance issues
  const value = useMemo(() => 1 + 1, []); // Unnecessary

  const handleClick = useCallback(() => {
    console.log("clicked");
  }, []); // May not be needed if not passed to children
};
```

## Optimization Testing

### 1. Performance Tests

```typescript
// Jest performance test
describe('Component Performance', () => {
  it('should render within performance budget', () => {
    const start = performance.now();

    render(<ExpensiveComponent data={largeDataSet} />);

    const end = performance.now();
    const renderTime = end - start;

    expect(renderTime).toBeLessThan(16); // 60fps budget
  });
});
```

### 2. Re-render Tracking

```typescript
// Test for unnecessary re-renders
describe('Re-render Optimization', () => {
  it('should not re-render when props unchanged', () => {
    let renderCount = 0;

    const TestComponent = React.memo(() => {
      renderCount++;
      return <div>Test</div>;
    });

    const { rerender } = render(<TestComponent />);
    expect(renderCount).toBe(1);

    // Re-render with same props
    rerender(<TestComponent />);
    expect(renderCount).toBe(1); // Should not increase
  });
});
```

## Optimization Guidelines

### When to Optimize

- Profile first, optimize second
- Focus on components that render frequently
- Optimize components with expensive calculations
- Address user-reported performance issues
- Optimize after core functionality is complete

### When NOT to Optimize

- Don't optimize simple components
- Don't add complexity without evidence
- Don't optimize during initial development
- Don't over-engineer memoization
- Don't optimize at the expense of readability

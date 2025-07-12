# Memory Leak Debugging Guide

## Table of Contents

1. [Memory Leak Investigation Prompt Template](#memory-leak-investigation-prompt-template)
2. [Symptoms:](#symptoms)
3. [Current Metrics:](#current-metrics)
4. [Technical Context:](#technical-context)
5. [Suspected Areas:](#suspected-areas)
6. [Memory Leak Detection](#memory-leak-detection)
  7. [1. Browser DevTools Memory Profiling](#1-browser-devtools-memory-profiling)
    8. [Heap Snapshot Analysis](#heap-snapshot-analysis)
    9. [Performance Timeline](#performance-timeline)
  10. [2. Common Memory Leak Sources](#2-common-memory-leak-sources)
    11. [Event Listeners](#event-listeners)
    12. [Timers and Intervals](#timers-and-intervals)
    13. [API Subscriptions](#api-subscriptions)
    14. [DOM References](#dom-references)
  15. [3. State Management Memory Leaks](#3-state-management-memory-leaks)
    16. [Redux/Context Leaks](#reduxcontext-leaks)
    17. [Large State Objects](#large-state-objects)
  18. [4. Third-Party Library Leaks](#4-third-party-library-leaks)
    19. [Library Cleanup](#library-cleanup)
20. [Memory Leak Prevention](#memory-leak-prevention)
  21. [1. React Optimal Practices](#1-react-optimal-practices)
    22. [Proper Effect Cleanup](#proper-effect-cleanup)
    23. [Custom Hooks for Common Patterns](#custom-hooks-for-common-patterns)
  24. [2. Memory Management Patterns](#2-memory-management-patterns)
    25. [Object Pooling](#object-pooling)
    26. [Weak References](#weak-references)
  27. [3. Memory Monitoring](#3-memory-monitoring)
    28. [Production Monitoring](#production-monitoring)
29. [Memory Leak Testing](#memory-leak-testing)
  30. [1. Automated Testing](#1-automated-testing)
    31. [Jest Memory Tests](#jest-memory-tests)
    32. [Cypress Memory Tests](#cypress-memory-tests)
  33. [2. Manual Testing](#2-manual-testing)
    34. [Memory Leak Testing Checklist](#memory-leak-testing-checklist)
35. [Common Memory Leak Solutions](#common-memory-leak-solutions)
  36. [1. React-Specific Solutions](#1-react-specific-solutions)
    37. [Abort Controllers for Fetch](#abort-controllers-for-fetch)
    38. [Cleanup Refs](#cleanup-refs)
  39. [2. General JavaScript Solutions](#2-general-javascript-solutions)
    40. [Cleanup Closures](#cleanup-closures)
41. [Memory Leak Prevention Checklist](#memory-leak-prevention-checklist)
  42. [Development Checklist](#development-checklist)
  43. [Testing Checklist](#testing-checklist)
  44. [Code Review Checklist](#code-review-checklist)

## Memory Leak Investigation Prompt Template

```text
I suspect there's a memory leak in [COMPONENT/FEATURE]. Please help me identify and fix the memory leak:

## Symptoms:
- [ ] Browser becomes slow over time
- [ ] Memory usage keeps increasing
- [ ] Tab crashes after extended use
- [ ] Performance degrades with usage
- [ ] DevTools shows growing heap size

## Current Metrics:
- Initial memory usage: [X] MB
- Memory after 1 hour: [X] MB
- Memory after 24 hours: [X] MB
- Growth rate: [X] MB/hour

## Technical Context:
- Component: [Specific component or page]
- Browser: [Browser and version]
- Usage pattern: [How the component is used]
- Timeframe: [When leak becomes apparent]

## Suspected Areas:
- [ ] Event listeners
- [ ] Timers/intervals
- [ ] API subscriptions
- [ ] State management
- [ ] Third-party libraries

Please analyze and provide debugging steps and solutions.
```

## Memory Leak Detection

### 1. Browser DevTools Memory Profiling

#### Heap Snapshot Analysis

```javascript
// Take heap snapshots in DevTools
// 1. Open DevTools → Memory tab
// 2. Select "Heap snapshot"
// 3. Take snapshot before and after actions
// 4. Compare snapshots to find growing objects

// Script to monitor memory usage
const monitorMemory = () => {
  if (performance.memory) {
    const memory = performance.memory;
    console.log({
      used: Math.round(memory.usedJSHeapSize / 1048576) + " MB",
      total: Math.round(memory.totalJSHeapSize / 1048576) + " MB",
      limit: Math.round(memory.jsHeapSizeLimit / 1048576) + " MB",
    });
  }
};

// Monitor every 5 seconds
setInterval(monitorMemory, 5000);
```

#### Performance Timeline

```javascript
// Record performance timeline
// 1. DevTools → Performance tab
// 2. Enable "Memory" checkbox
// 3. Record during leak-prone operations
// 4. Analyze memory graph for upward trends

// Memory pressure event
window.addEventListener("memory-pressure", () => {
  console.warn("Memory pressure detected");
  // Implement cleanup logic
});
```

### 2. Common Memory Leak Sources

#### Event Listeners

```javascript
// ❌ Memory leak - event listener not removed
class LeakyComponent extends React.Component {
  componentDidMount() {
    window.addEventListener("resize", this.handleResize);
  }

  handleResize = () => {
    // Handle resize
  };

  // Missing cleanup!
}

// ✅ Proper cleanup
class CleanComponent extends React.Component {
  componentDidMount() {
    window.addEventListener("resize", this.handleResize);
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.handleResize);
  }

  handleResize = () => {
    // Handle resize
  };
}

// ✅ React hooks version
const CleanFunctionalComponent = () => {
  useEffect(() => {
    const handleResize = () => {
      // Handle resize
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
};
```

#### Timers and Intervals

```javascript
// ❌ Memory leak - timer not cleared
const LeakyComponent = () => {
  useEffect(() => {
    const intervalId = setInterval(() => {
      // Update something
    }, 1000);

    // Missing cleanup!
  }, []);
};

// ✅ Proper cleanup
const CleanComponent = () => {
  useEffect(() => {
    const intervalId = setInterval(() => {
      // Update something
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);
};

// ✅ Custom hook for intervals
const useInterval = (callback, delay) => {
  const savedCallback = useRef();

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    const tick = () => {
      savedCallback.current();
    };

    if (delay !== null) {
      const id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
};
```

#### API Subscriptions

```javascript
// ❌ Memory leak - subscription not cancelled
const LeakyComponent = () => {
  useEffect(() => {
    const subscription = apiClient.subscribe((data) => {
      // Handle data
    });

    // Missing cleanup!
  }, []);
};

// ✅ Proper cleanup
const CleanComponent = () => {
  useEffect(() => {
    const subscription = apiClient.subscribe((data) => {
      // Handle data
    });

    return () => subscription.unsubscribe();
  }, []);
};

// ✅ Custom hook for subscriptions
const useSubscription = (subscribe, deps) => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const subscription = subscribe(setData);
    return () => subscription.unsubscribe();
  }, deps);

  return data;
};
```

#### DOM References

```javascript
// ❌ Memory leak - DOM references retained
const LeakyComponent = () => {
  const elementsRef = useRef([]);

  useEffect(() => {
    const elements = document.querySelectorAll(".some-class");
    elementsRef.current = Array.from(elements);

    // DOM nodes are retained even after component unmounts
  }, []);
};

// ✅ Proper cleanup
const CleanComponent = () => {
  const elementsRef = useRef([]);

  useEffect(() => {
    const elements = document.querySelectorAll(".some-class");
    elementsRef.current = Array.from(elements);

    return () => {
      elementsRef.current = [];
    };
  }, []);
};
```

### 3. State Management Memory Leaks

#### Redux/Context Leaks

```javascript
// ❌ Memory leak - store retains old state
const leakyReducer = (state = initialState, action) => {
  switch (action.type) {
    case "ADD_ITEM":
      return {
        ...state,
        items: [...state.items, action.payload],
      };
    // Missing cleanup actions
  }
};

// ✅ Proper cleanup
const cleanReducer = (state = initialState, action) => {
  switch (action.type) {
    case "ADD_ITEM":
      return {
        ...state,
        items: [...state.items, action.payload],
      };
    case "CLEANUP_ITEMS":
      return {
        ...state,
        items: [],
      };
    case "RESET_STATE":
      return initialState;
  }
};
```

#### Large State Objects

```javascript
// ❌ Memory leak - large objects in state
const [largeData, setLargeData] = useState({
  // Huge object that grows over time
});

// ✅ Proper management
const [largeData, setLargeData] = useState(null);

// Cleanup when component unmounts
useEffect(() => {
  return () => {
    setLargeData(null);
  };
}, []);
```

### 4. Third-Party Library Leaks

#### Library Cleanup

```javascript
// ❌ Memory leak - library not properly cleaned up
const LeakyComponent = () => {
  useEffect(() => {
    const chart = new Chart(canvas, config);

    // Missing cleanup
  }, []);
};

// ✅ Proper cleanup
const CleanComponent = () => {
  useEffect(() => {
    const chart = new Chart(canvas, config);

    return () => {
      chart.destroy();
    };
  }, []);
};
```

## Memory Leak Prevention

### 1. React Optimal Practices

#### Proper Effect Cleanup

```typescript
// Template for proper cleanup
const ComponentWithSideEffects = () => {
  useEffect(() => {
    // Setup
    const subscription = setupSideEffect();

    // Cleanup
    return () => {
      subscription.cleanup();
    };
  }, []);
};
```

#### Custom Hooks for Common Patterns

```typescript
// Reusable hook for event listeners
const useEventListener = (event, handler, element = window) => {
  useEffect(() => {
    const isSupported = element && element.addEventListener;
    if (!isSupported) return;

    element.addEventListener(event, handler);
    return () => element.removeEventListener(event, handler);
  }, [event, handler, element]);
};

// Reusable hook for async operations
const useAsync = (asyncFunction, deps) => {
  const [state, setState] = useState({ loading: true });

  useEffect(() => {
    let cancelled = false;

    asyncFunction().then(
      (data) => !cancelled && setState({ data, loading: false }),
      (error) => !cancelled && setState({ error, loading: false }),
    );

    return () => {
      cancelled = true;
    };
  }, deps);

  return state;
};
```

### 2. Memory Management Patterns

#### Object Pooling

```javascript
// Object pool to reuse objects
class ObjectPool {
  constructor(createFn, resetFn) {
    this.createFn = createFn;
    this.resetFn = resetFn;
    this.pool = [];
  }

  acquire() {
    return this.pool.pop() || this.createFn();
  }

  release(obj) {
    this.resetFn(obj);
    this.pool.push(obj);
  }
}

// Usage
const pointPool = new ObjectPool(
  () => ({ x: 0, y: 0 }),
  (point) => {
    point.x = 0;
    point.y = 0;
  },
);
```

#### Weak References

```javascript
// Use WeakMap for object associations
const objectData = new WeakMap();

// Objects can be garbage collected
const obj = {};
objectData.set(obj, { data: "some data" });

// When obj is no longer referenced, it can be collected
// and the WeakMap entry is automatically removed
```

### 3. Memory Monitoring

#### Production Monitoring

```javascript
// Memory monitoring service
class MemoryMonitor {
  constructor() {
    this.measurements = [];
    this.threshold = 50 * 1024 * 1024; // 50MB
  }

  measure() {
    if (performance.memory) {
      const measurement = {
        timestamp: Date.now(),
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize,
      };

      this.measurements.push(measurement);

      if (measurement.used > this.threshold) {
        this.reportHighMemoryUsage(measurement);
      }
    }
  }

  reportHighMemoryUsage(measurement) {
    console.warn("High memory usage detected:", measurement);
    // Send to monitoring service
  }

  getMemoryTrend() {
    if (this.measurements.length < 2) return null;

    const recent = this.measurements.slice(-10);
    const slope = this.calculateSlope(recent);

    return {
      trending: slope > 0 ? "up" : "down",
      rate: Math.abs(slope),
    };
  }

  calculateSlope(measurements) {
    // Simple linear regression
    const n = measurements.length;
    const sumX = measurements.reduce((sum, _, i) => sum + i, 0);
    const sumY = measurements.reduce((sum, m) => sum + m.used, 0);
    const sumXY = measurements.reduce((sum, m, i) => sum + i * m.used, 0);
    const sumXX = measurements.reduce((sum, _, i) => sum + i * i, 0);

    return (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  }
}

// Usage
const monitor = new MemoryMonitor();
setInterval(() => monitor.measure(), 30000); // Every 30 seconds
```

## Memory Leak Testing

### 1. Automated Testing

#### Jest Memory Tests

```javascript
// Test for memory leaks
describe("Memory leak tests", () => {
  it("should not leak memory after unmount", () => {
    const container = document.createElement("div");
    document.body.appendChild(container);

    // Mount and unmount component multiple times
    for (let i = 0; i < 100; i++) {
      const root = createRoot(container);
      root.render(<TestComponent />);
      root.unmount();
    }

    // Check if memory usage is stable
    expect(performance.memory.usedJSHeapSize).toBeLessThan(initialMemory * 1.1);
  });
});
```

#### Cypress Memory Tests

```javascript
// E2E memory leak test
describe("Memory leak E2E test", () => {
  it("should not leak memory during normal usage", () => {
    cy.visit("/");

    // Perform actions that might cause leaks
    for (let i = 0; i < 50; i++) {
      cy.get('[data-testid="open-modal"]').click();
      cy.get('[data-testid="close-modal"]').click();
    }

    // Check memory usage
    cy.window().then((win) => {
      expect(win.performance.memory.usedJSHeapSize).to.be.lessThan(
        50 * 1024 * 1024,
      );
    });
  });
});
```

### 2. Manual Testing

#### Memory Leak Testing Checklist

- [ ] **Baseline Memory**: Record initial memory usage
- [ ] **Action Repetition**: Perform leak-prone actions 50-100 times
- [ ] **Memory Measurement**: Check memory after each set of actions
- [ ] **Garbage Collection**: Force GC and measure again
- [ ] **Trend Analysis**: Look for consistent memory growth
- [ ] **Heap Snapshots**: Compare snapshots for growing objects

## Common Memory Leak Solutions

### 1. React-Specific Solutions

#### Abort Controllers for Fetch

```javascript
const ComponentWithFetch = () => {
  useEffect(() => {
    const abortController = new AbortController();

    fetch("/api/data", {
      signal: abortController.signal,
    })
      .then((response) => {
        // Handle response
      })
      .catch((error) => {
        if (error.name !== "AbortError") {
          console.error("Fetch error:", error);
        }
      });

    return () => abortController.abort();
  }, []);
};
```

#### Cleanup Refs

```javascript
const ComponentWithRefs = () => {
  const elementRef = useRef(null);
  const observerRef = useRef(null);

  useEffect(() => {
    if (elementRef.current) {
      observerRef.current = new IntersectionObserver(/* ... */);
      observerRef.current.observe(elementRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, []);
};
```

### 2. General JavaScript Solutions

#### Cleanup Closures

```javascript
// Problem: Closure retains references
const createHandler = (largeData) => {
  return (event) => {
    // Handler uses largeData
  };
};

// Solution: Explicit cleanup
const createHandler = (largeData) => {
  const handler = (event) => {
    // Handler uses largeData
  };

  handler.cleanup = () => {
    largeData = null;
  };

  return handler;
};
```

## Memory Leak Prevention Checklist

### Development Checklist

- [ ] **Effect Cleanup**: All useEffect hooks have proper cleanup
- [ ] **Event Listeners**: All event listeners are removed
- [ ] **Timers**: All timers and intervals are cleared
- [ ] **Subscriptions**: All API subscriptions are cancelled
- [ ] **DOM References**: DOM node references are cleared
- [ ] **Third-party Libraries**: Library instances are properly destroyed

### Testing Checklist

- [ ] **Memory Monitoring**: Memory usage is monitored in tests
- [ ] **Leak Detection**: Automated tests check for memory leaks
- [ ] **Performance Testing**: Memory usage is part of performance tests
- [ ] **Heap Analysis**: Regular heap snapshot analysis
- [ ] **Production Monitoring**: Memory monitoring in production

### Code Review Checklist

- [ ] **Cleanup Patterns**: All cleanup patterns are implemented
- [ ] **Library Usage**: Third-party libraries are properly managed
- [ ] **State Management**: Large state objects are properly managed
- [ ] **Async Operations**: Async operations can be cancelled
- [ ] **Resource Management**: All resources are properly released

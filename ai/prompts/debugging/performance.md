# Performance Investigation Guide

## Table of Contents

1. [Performance Debugging Prompt Template](#performance-debugging-prompt-template)
2. [Current Performance Issues:](#current-performance-issues)
3. [Performance Metrics:](#performance-metrics)
4. [Symptoms:](#symptoms)
5. [Technical Context:](#technical-context)
6. [Performance Investigation Methodology](#performance-investigation-methodology)
  7. [1. Identify Performance Bottlenecks](#1-identify-performance-bottlenecks)
    8. [Frontend Performance Issues](#frontend-performance-issues)
    9. [Backend Performance Issues](#backend-performance-issues)
  10. [2. Performance Profiling Tools](#2-performance-profiling-tools)
    11. [Browser DevTools](#browser-devtools)
    12. [React DevTools Profiler](#react-devtools-profiler)
  13. [3. Common Performance Patterns](#3-common-performance-patterns)
    14. [React Performance Optimization](#react-performance-optimization)
    15. [API Performance Optimization](#api-performance-optimization)
  16. [4. Performance Testing](#4-performance-testing)
    17. [Lighthouse Audit](#lighthouse-audit)
    18. [Bundle Analysis](#bundle-analysis)
    19. [Performance Monitoring](#performance-monitoring)
20. [Performance Optimization Strategies](#performance-optimization-strategies)
  21. [1. React Performance](#1-react-performance)
    22. [Unnecessary Re-renders](#unnecessary-re-renders)
    23. [State Management](#state-management)
  24. [2. Bundle Size Optimization](#2-bundle-size-optimization)
    25. [Code Splitting](#code-splitting)
    26. [Tree Shaking](#tree-shaking)
  27. [3. Network Optimization](#3-network-optimization)
    28. [Request Optimization](#request-optimization)
    29. [Asset Optimization](#asset-optimization)
  30. [4. Memory Management](#4-memory-management)
    31. [Cleanup Side Effects](#cleanup-side-effects)
32. [Performance Testing Checklist](#performance-testing-checklist)
  33. [Frontend Performance](#frontend-performance)
  34. [Backend Performance](#backend-performance)
  35. [Network Performance](#network-performance)
36. [Performance Monitoring](#performance-monitoring)
  37. [Continuous Monitoring](#continuous-monitoring)
  38. [Real User Monitoring](#real-user-monitoring)
39. [Common Performance Anti-Patterns](#common-performance-anti-patterns)
  40. [React Anti-Patterns](#react-anti-patterns)
  41. [JavaScript Anti-Patterns](#javascript-anti-patterns)
42. [Performance Optimization Checklist](#performance-optimization-checklist)

## Performance Debugging Prompt Template

```text
I'm experiencing performance issues with [COMPONENT/FEATURE]. Please help me investigate and optimize the performance:

## Current Performance Issues:
- [ ] Slow page load times
- [ ] Laggy user interactions
- [ ] High memory usage
- [ ] Slow API responses
- [ ] Bundle size issues

## Performance Metrics:
- Current load time: [X] seconds
- Bundle size: [X] MB
- Memory usage: [X] MB
- API response time: [X] ms
- Core Web Vitals scores: [LCP/FID/CLS]

## Symptoms:
- [Describe specific performance problems]
- [Include user reports or metrics]
- [Mention when issues occur]

## Technical Context:
- Browser: [Browser and version]
- Device: [Desktop/Mobile specifications]
- Network: [Connection speed]
- Component: [Specific component or page]

Please analyze and provide optimization recommendations.
```

## Performance Investigation Methodology

### 1. Identify Performance Bottlenecks

#### Frontend Performance Issues

- **Render Performance**: Components re-rendering unnecessarily
- **Bundle Size**: Large JavaScript bundles
- **Network**: Too many requests or large assets
- **Memory**: Memory leaks or excessive usage
- **CPU**: Expensive calculations or infinite loops

#### Backend Performance Issues

- **Database**: Slow queries or N+1 problems
- **API**: Long response times or blocking operations
- **Memory**: High memory usage or leaks
- **CPU**: Expensive operations or inefficient algorithms
- **Network**: Slow external API calls

### 2. Performance Profiling Tools

#### Browser DevTools

```javascript
// Performance profiling
console.time("operation");
// Your code here
console.timeEnd("operation");

// Memory profiling
const memoryBefore = performance.memory?.usedJSHeapSize;
// Your code here
const memoryAfter = performance.memory?.usedJSHeapSize;
console.log(`Memory used: ${memoryAfter - memoryBefore} bytes`);
```

#### React DevTools Profiler

```javascript
// Wrap components for profiling
import { Profiler } from "react";

function onRenderCallback(id, phase, actualDuration) {
  console.log("Render time:", actualDuration);
}

<Profiler id="MyComponent" onRender={onRenderCallback}>
  <MyComponent />
</Profiler>;
```

### 3. Common Performance Patterns

#### React Performance Optimization

```typescript
// Memoization
const ExpensiveComponent = React.memo(({ data }) => {
  const expensiveValue = useMemo(() => {
    return computeExpensiveValue(data);
  }, [data]);

  const handleClick = useCallback(() => {
    // Handler logic
  }, []);

  return <div>{expensiveValue}</div>;
});

// Lazy Loading
const LazyComponent = React.lazy(() => import('./LazyComponent'));

// Virtualization for large lists
import { FixedSizeList } from 'react-window';

const VirtualizedList = ({ items }) => (
  <FixedSizeList
    height={600}
    itemCount={items.length}
    itemSize={50}
  >
    {({ index, style }) => (
      <div style={style}>
        {items[index]}
      </div>
    )}
  </FixedSizeList>
);
```

#### API Performance Optimization

```typescript
// Request debouncing
const debouncedSearch = useMemo(
  () =>
    debounce(async (query) => {
      const results = await searchAPI(query);
      setResults(results);
    }, 300),
  [],
);

// Response caching
const cache = new Map();

const cachedFetch = async (url) => {
  if (cache.has(url)) {
    return cache.get(url);
  }

  const response = await fetch(url);
  const data = await response.json();
  cache.set(url, data);
  return data;
};

// Parallel requests
const [userData, settingsData] = await Promise.all([
  fetch("/api/user").then((r) => r.json()),
  fetch("/api/settings").then((r) => r.json()),
]);
```

### 4. Performance Testing

#### Lighthouse Audit

```bash
# Run Lighthouse programmatically
npm install -g lighthouse
lighthouse https://your-site.com --output=json --output-path=./report.json
```

#### Bundle Analysis

```bash
# Analyze bundle size
npm install -g webpack-bundle-analyzer
webpack-bundle-analyzer build/static/js/*.js
```

#### Performance Monitoring

```javascript
// Custom performance marks
performance.mark("component-start");
// Component logic
performance.mark("component-end");
performance.measure("component-time", "component-start", "component-end");

// Report performance metrics
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    console.log(`${entry.name}: ${entry.duration}ms`);
  }
});
observer.observe({ entryTypes: ["measure"] });
```

## Performance Optimization Strategies

### 1. React Performance

#### Unnecessary Re-renders

```typescript
// Problem: Component re-renders on every parent update
const SlowComponent = ({ data, onClick }) => {
  return <div onClick={onClick}>{data.value}</div>;
};

// Solution: Memoize the component
const FastComponent = React.memo(({ data, onClick }) => {
  return <div onClick={onClick}>{data.value}</div>;
});

// Or use useMemo for expensive calculations
const ComponentWithExpensiveCalc = ({ items }) => {
  const expensiveResult = useMemo(() => {
    return items.reduce((sum, item) => sum + item.value, 0);
  }, [items]);

  return <div>{expensiveResult}</div>;
};
```

#### State Management

```typescript
// Problem: All components re-render when any state changes
const [user, setUser] = useState({
  name: "",
  email: "",
  preferences: { theme: "light" },
});

// Solution: Split state into smaller pieces
const [userName, setUserName] = useState("");
const [userEmail, setUserEmail] = useState("");
const [userPreferences, setUserPreferences] = useState({ theme: "light" });
```

### 2. Bundle Size Optimization

#### Code Splitting

```typescript
// Dynamic imports
const LazyDashboard = React.lazy(() => import('./Dashboard'));
const LazySettings = React.lazy(() => import('./Settings'));

// Route-based splitting
import { Routes, Route } from 'react-router-dom';

<Routes>
  <Route path="/dashboard" element={
    <Suspense fallback={<Loading />}>
      <LazyDashboard />
    </Suspense>
  } />
</Routes>
```

#### Tree Shaking

```typescript
// Problem: Importing entire library
import _ from "lodash";

// Solution: Import only needed functions
import debounce from "lodash/debounce";
import pick from "lodash/pick";
```

### 3. Network Optimization

#### Request Optimization

```typescript
// Batch multiple requests
const batchRequest = async (requests) => {
  const results = await Promise.all(requests);
  return results;
};

// Implement request caching
const requestCache = new Map();

const cachedRequest = async (url) => {
  if (requestCache.has(url)) {
    return requestCache.get(url);
  }

  const data = await fetch(url).then((r) => r.json());
  requestCache.set(url, data);
  return data;
};
```

#### Asset Optimization

```typescript
// Image optimization
const OptimizedImage = ({ src, alt, ...props }) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <picture>
      <source srcSet={`${src}.webp`} type="image/webp" />
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        {...props}
      />
    </picture>
  );
};
```

### 4. Memory Management

#### Cleanup Side Effects

```typescript
// Proper cleanup in useEffect
useEffect(() => {
  const subscription = eventSource.subscribe(handleEvent);
  const intervalId = setInterval(updateData, 1000);

  return () => {
    subscription.unsubscribe();
    clearInterval(intervalId);
  };
}, []);

// Cleanup event listeners
useEffect(() => {
  const handleScroll = () => {
    // Handle scroll
  };

  window.addEventListener("scroll", handleScroll);
  return () => window.removeEventListener("scroll", handleScroll);
}, []);
```

## Performance Testing Checklist

### Frontend Performance

- [ ] Lighthouse audit score > 90
- [ ] Bundle size < 200KB gzipped
- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 3.5s
- [ ] No memory leaks in long-running sessions

### Backend Performance

- [ ] API response times < 200ms (p95)
- [ ] Database queries optimized
- [ ] No N+1 query problems
- [ ] Proper caching implemented
- [ ] Memory usage stable over time

### Network Performance

- [ ] Assets are compressed
- [ ] Images are optimized
- [ ] Requests are batched where possible
- [ ] CDN is used for static assets
- [ ] HTTP/2 is enabled

## Performance Monitoring

### Continuous Monitoring

```javascript
// Performance monitoring service
const performanceMonitor = {
  startTimer(label) {
    performance.mark(`${label}-start`);
  },

  endTimer(label) {
    performance.mark(`${label}-end`);
    performance.measure(label, `${label}-start`, `${label}-end`);
  },

  reportMetrics() {
    const measures = performance.getEntriesByType("measure");
    measures.forEach((measure) => {
      console.log(`${measure.name}: ${measure.duration}ms`);
    });
  },
};
```

### Real User Monitoring

```javascript
// Collect performance metrics
const collectMetrics = () => {
  const navigation = performance.getEntriesByType("navigation")[0];
  const paint = performance.getEntriesByType("paint");

  return {
    loadTime: navigation.loadEventEnd - navigation.loadEventStart,
    domContentLoaded:
      navigation.domContentLoadedEventEnd -
      navigation.domContentLoadedEventStart,
    firstPaint: paint.find((p) => p.name === "first-paint")?.startTime,
    firstContentfulPaint: paint.find((p) => p.name === "first-contentful-paint")
      ?.startTime,
  };
};
```

## Common Performance Anti-Patterns

### React Anti-Patterns

1. **Inline object creation in render**
2. **Creating functions in render**
3. **Not using keys in lists**
4. **Unnecessary state updates**
5. **Heavy computations in render**

### JavaScript Anti-Patterns

1. **Synchronous operations in main thread**
2. **Memory leaks from event listeners**
3. **Inefficient DOM manipulation**
4. **Blocking the event loop**
5. **Not leveraging browser caching**

## Performance Optimization Checklist

- [ ] Identified specific performance bottlenecks
- [ ] Measured current performance metrics
- [ ] Implemented appropriate optimizations
- [ ] Verified improvements with profiling
- [ ] Added performance monitoring
- [ ] Documented optimization decisions
- [ ] Created performance budget
- [ ] Set up continuous monitoring

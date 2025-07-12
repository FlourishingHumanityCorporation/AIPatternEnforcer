# Bundle Optimization Guide

**Purpose**: Comprehensive guide to optimizing JavaScript bundle size and improving application load performance.

## Table of Contents

1. [Bundle Analysis](#bundle-analysis)
2. [Code Splitting Strategies](#code-splitting-strategies)
3. [Tree Shaking](#tree-shaking)
4. [Dynamic Imports](#dynamic-imports)
5. [Dependency Optimization](#dependency-optimization)
6. [Build Configuration](#build-configuration)
7. [Monitoring and Metrics](#monitoring-and-metrics)

## Bundle Analysis

### Analyzing Bundle Size

```bash
# Install bundle analyzer
npm install --save-dev webpack-bundle-analyzer

# Analyze Vite bundle
npm run build
npx vite-bundle-analyzer dist

# Alternative: Use source-map-explorer
npm install --save-dev source-map-explorer
npm run build
npx source-map-explorer 'dist/assets/*.js'
```

### Understanding Bundle Composition

```typescript
// vite.config.ts - Enable bundle analysis
import { defineConfig } from 'vite';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    // ... other plugins
    visualizer({
      filename: 'dist/stats.html',
      open: true,
      gzipSize: true,
      brotliSize: true
    })
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          utils: ['lodash', 'date-fns']
        }
      }
    }
  }
});
```

## Code Splitting Strategies

### Route-Based Splitting

```typescript
// App.tsx - Lazy load route components
import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoadingSpinner from './components/LoadingSpinner';

// Lazy load route components
const Home = lazy(() => import('./pages/Home'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Settings = lazy(() => import('./pages/Settings'));

const App = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default App;
```

### Feature-Based Splitting

```typescript
// FeatureToggle.tsx - Conditionally load features
import { lazy, Suspense, useState } from 'react';

const AdvancedFeature = lazy(() => import('./AdvancedFeature'));

const FeatureToggle = () => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div>
      <button onClick={() => setShowAdvanced(!showAdvanced)}>
        Toggle Advanced Feature
      </button>
      
      {showAdvanced && (
        <Suspense fallback={<div>Loading advanced feature...</div>}>
          <AdvancedFeature />
        </Suspense>
      )}
    </div>
  );
};
```

### Component-Level Splitting

```typescript
// Modal.tsx - Split heavy components
import { lazy, Suspense } from 'react';

const HeavyChart = lazy(() => import('./HeavyChart'));
const DataTable = lazy(() => import('./DataTable'));

interface ModalProps {
  type: 'chart' | 'table';
  isOpen: boolean;
}

const Modal = ({ type, isOpen }: ModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="modal">
      <Suspense fallback={<div>Loading...</div>}>
        {type === 'chart' && <HeavyChart />}
        {type === 'table' && <DataTable />}
      </Suspense>
    </div>
  );
};
```

## Tree Shaking

### Optimizing Imports

```typescript
// ❌ Bad: Imports entire library
import * as _ from 'lodash';
import { Button, Modal, Form } from 'antd';

// ✅ Good: Import specific functions
import debounce from 'lodash/debounce';
import isEqual from 'lodash/isEqual';

// ✅ Better: Use tree-shakeable alternatives
import { debounce, isEqual } from 'lodash-es';

// ✅ Best: Use native alternatives when possible
const debounce = (fn: Function, delay: number) => {
  let timeoutId: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(null, args), delay);
  };
};
```

### Package Configuration

```json
// package.json - Enable tree shaking
{
  "sideEffects": false,
  "type": "module",
  "dependencies": {
    "lodash-es": "^4.17.21",
    "date-fns": "^2.29.3"
  }
}
```

### Barrel Exports Optimization

```typescript
// utils/index.ts - Avoid barrel exports that hurt tree shaking
// ❌ Bad: Re-exports everything
export * from './stringUtils';
export * from './dateUtils';
export * from './arrayUtils';

// ✅ Good: Specific exports
export { formatCurrency, formatNumber } from './stringUtils';
export { formatDate, addDays } from './dateUtils';
export { uniqueBy, groupBy } from './arrayUtils';

// ✅ Better: Direct imports in consuming files
// Instead of importing from barrel, import directly:
// import { formatCurrency } from './utils/stringUtils';
```

## Dynamic Imports

### Conditional Loading

```typescript
// utils/featureLoader.ts
export const loadFeature = async (featureName: string) => {
  switch (featureName) {
    case 'analytics':
      const { Analytics } = await import('./features/Analytics');
      return Analytics;
    
    case 'charts':
      const { Charts } = await import('./features/Charts');
      return Charts;
    
    case 'reports':
      const { Reports } = await import('./features/Reports');
      return Reports;
    
    default:
      throw new Error(`Unknown feature: ${featureName}`);
  }
};

// Usage
const handleLoadFeature = async (feature: string) => {
  try {
    const FeatureComponent = await loadFeature(feature);
    setActiveFeature(FeatureComponent);
  } catch (error) {
    console.error('Failed to load feature:', error);
  }
};
```

### Preloading Critical Resources

```typescript
// ResourcePreloader.tsx
import { useEffect } from 'react';

const ResourcePreloader = () => {
  useEffect(() => {
    // Preload critical chunks
    const preloadCriticalChunks = () => {
      // Preload dashboard (likely next page)
      import('./pages/Dashboard');
      
      // Preload common components
      import('./components/Chart');
      import('./components/DataTable');
    };

    // Preload on idle
    if ('requestIdleCallback' in window) {
      requestIdleCallback(preloadCriticalChunks);
    } else {
      setTimeout(preloadCriticalChunks, 1000);
    }
  }, []);

  return null;
};
```

## Dependency Optimization

### Bundle Analysis Script

```typescript
// scripts/analyzeDependencies.ts
import { readFileSync } from 'fs';
import { resolve } from 'path';

interface PackageInfo {
  name: string;
  version: string;
  size: number;
  dependencies?: string[];
}

const analyzeDependencies = () => {
  const packageJson = JSON.parse(
    readFileSync(resolve('package.json'), 'utf-8')
  );

  const dependencies = Object.keys(packageJson.dependencies || {});
  const devDependencies = Object.keys(packageJson.devDependencies || {});

  console.log('📦 Production Dependencies:', dependencies.length);
  console.log('🔧 Dev Dependencies:', devDependencies.length);

  // Check for potential optimizations
  const heavyPackages = [
    'moment', // Suggest date-fns instead
    'lodash', // Suggest lodash-es or native methods
    'axios', // Consider fetch API
    'jquery', // Consider native DOM methods
  ];

  const foundHeavy = dependencies.filter(dep => 
    heavyPackages.some(heavy => dep.includes(heavy))
  );

  if (foundHeavy.length > 0) {
    console.log('⚠️  Consider optimizing:', foundHeavy);
  }
};

analyzeDependencies();
```

### Dependency Substitutions

```typescript
// Before: Heavy dependencies
import moment from 'moment'; // 67.9KB
import _ from 'lodash'; // 71KB
import axios from 'axios'; // 15.6KB

// After: Lightweight alternatives
import { formatDate, addDays } from 'date-fns'; // Tree-shakeable
import { debounce, throttle } from './utils/performance'; // Custom utilities
const response = await fetch('/api/data'); // Native fetch
```

## Build Configuration

### Vite Optimization

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    // Target modern browsers for smaller bundles
    target: 'es2020',
    
    // Minimize bundle
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    
    // Optimize chunks
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor chunk for stable dependencies
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react';
            }
            if (id.includes('date-fns') || id.includes('lodash')) {
              return 'utils';
            }
            return 'vendor';
          }
          
          // Feature-based chunks
          if (id.includes('src/features/dashboard')) {
            return 'dashboard';
          }
          if (id.includes('src/features/settings')) {
            return 'settings';
          }
        },
      },
    },
    
    // Chunk size warnings
    chunkSizeWarningLimit: 1000,
  },
  
  // Enable compression
  server: {
    compress: true,
  },
});
```

### Environment-Specific Optimization

```typescript
// vite.config.ts - Production optimizations
export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production';
  
  return {
    plugins: [
      react(),
      // Only include dev tools in development
      !isProduction && someDevPlugin(),
    ].filter(Boolean),
    
    define: {
      // Remove development code in production
      __DEV__: !isProduction,
    },
    
    build: {
      // Production-only optimizations
      ...(isProduction && {
        rollupOptions: {
          external: ['some-dev-only-dependency'],
        },
      }),
    },
  };
});
```

## Monitoring and Metrics

### Performance Budget

```json
// .budgetrc.json
{
  "budget": [
    {
      "path": "dist/assets/index-*.js",
      "limit": "150KB",
      "type": "file"
    },
    {
      "path": "dist/assets/vendor-*.js", 
      "limit": "200KB",
      "type": "file"
    },
    {
      "path": "dist/**/*",
      "limit": "500KB",
      "type": "folder"
    }
  ]
}
```

### Bundle Size Monitoring

```typescript
// scripts/checkBundleSize.ts
import { readFileSync, statSync } from 'fs';
import { glob } from 'glob';
import { gzipSync } from 'zlib';

const checkBundleSize = async () => {
  const files = await glob('dist/assets/*.js');
  
  let totalSize = 0;
  let totalGzipSize = 0;
  
  console.log('📊 Bundle Size Report\n');
  
  files.forEach(file => {
    const content = readFileSync(file);
    const size = statSync(file).size;
    const gzipSize = gzipSync(content).length;
    
    totalSize += size;
    totalGzipSize += gzipSize;
    
    console.log(`${file}: ${(size / 1024).toFixed(1)}KB (${(gzipSize / 1024).toFixed(1)}KB gzipped)`);
  });
  
  console.log(`\nTotal: ${(totalSize / 1024).toFixed(1)}KB (${(totalGzipSize / 1024).toFixed(1)}KB gzipped)`);
  
  // Check against budget
  const budget = 500 * 1024; // 500KB budget
  if (totalGzipSize > budget) {
    console.error(`❌ Bundle size exceeds budget by ${((totalGzipSize - budget) / 1024).toFixed(1)}KB`);
    process.exit(1);
  }
  
  console.log('✅ Bundle size within budget');
};

checkBundleSize();
```

### CI/CD Integration

```yaml
# .github/workflows/bundle-check.yml
name: Bundle Size Check

on: [pull_request]

jobs:
  bundle-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - run: npm ci
      - run: npm run build
      - run: npm run check:bundle-size
      
      - name: Comment bundle size
        uses: marocchino/sticky-pull-request-comment@v2
        with:
          recreate: true
          message: |
            ## Bundle Size Report
            ${{ steps.bundle-report.outputs.report }}
```

## Performance Recommendations

### Loading Strategy

```typescript
// App.tsx - Optimized loading strategy
import { lazy, Suspense } from 'react';

// Critical components loaded immediately
import Header from './components/Header';
import Navigation from './components/Navigation';

// Non-critical components loaded lazily
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Settings = lazy(() => 
  import('./pages/Settings').then(module => ({
    default: module.Settings
  }))
);

// Feature detection for conditional loading
const AdvancedFeatures = lazy(() => {
  if ('IntersectionObserver' in window) {
    return import('./features/AdvancedFeatures');
  }
  return import('./features/BasicFeatures');
});
```

### Resource Hints

```html
<!-- index.html - Resource hints for better loading -->
<head>
  <!-- DNS prefetch for external resources -->
  <link rel="dns-prefetch" href="//api.example.com">
  
  <!-- Preconnect to critical origins -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  
  <!-- Preload critical resources -->
  <link rel="preload" href="/fonts/main.woff2" as="font" type="font/woff2" crossorigin>
  
  <!-- Module preload for critical chunks -->
  <link rel="modulepreload" href="/assets/vendor.js">
</head>
```

## Bundle Optimization Checklist

### Development
- [ ] Bundle analyzer configured and used regularly
- [ ] Route-based code splitting implemented
- [ ] Heavy dependencies identified and optimized
- [ ] Tree shaking enabled and verified
- [ ] Dynamic imports used for conditional features

### Build Configuration
- [ ] Modern browser target configured
- [ ] Terser minification enabled
- [ ] Manual chunk splitting optimized
- [ ] Development code removed in production
- [ ] Compression enabled

### Monitoring
- [ ] Performance budget defined
- [ ] Bundle size monitoring in CI/CD
- [ ] Regular dependency audits scheduled
- [ ] Loading performance measured
- [ ] User experience metrics tracked

## Related Documentation

- [Performance Optimization Playbook](optimization-playbook.md)

---

**Performance Note**: Bundle optimization is an ongoing process. Regular monitoring and optimization should be part of your development workflow.
# 14. Performance Optimization in TypeScript

This section covers techniques and best practices for optimizing TypeScript applications for better performance.

## Table of Contents
- [Compiler Optimizations](#compiler-optimizations)
- [Type-Level Optimizations](#type-level-optimizations)
- [Runtime Performance](#runtime-performance)
- [Memory Management](#memory-management)
- [Bundle Size Optimization](#bundle-size-optimization)
- [Lazy Loading](#lazy-loading)
- [Caching Strategies](#caching-strategies)
- [Performance Monitoring](#performance-monitoring)
- [Key Takeaways](#key-takeaways)
- [Exercises](#exercises)

## Compiler Optimizations

### Incremental Compilation

Enable incremental compilation to speed up subsequent builds:

```json
{
  "compilerOptions": {
    "incremental": true,
    "tsBuildInfoFile": "./buildcache/tsbuildinfo"
  }
}
```

### Project References

Split your project into smaller, independent projects to enable faster incremental builds:

```json
// tsconfig.json
{
  "references": [
    { "path": "./src/core" },
    { "path": "./src/app" },
    { "path": "./tests" }
  ]
}

// src/core/tsconfig.json
{
  "compilerOptions": {
    "composite": true,
    "outDir": "../../dist/core"
  }
}
```

### Skip Type Checking for Dependencies

Speed up compilation by skipping type checking for `node_modules`:

```json
{
  "compilerOptions": {
    "skipLibCheck": true
  }
}
```

## Type-Level Optimizations

### Use `const` Assertions

Help TypeScript infer more precise types:

```typescript
// Without const assertion
const colors = ['red', 'green', 'blue'];  // string[]


// With const assertion
const colors = ['red', 'green', 'blue'] as const;  // readonly ["red", "green", "blue"]
```

### Avoid `any` and Use More Specific Types

```typescript
// Bad
function processData(data: any) { /* ... */ }

// Better
function processData<T>(data: T): ProcessedData<T> { /* ... */ }
```

### Use `interface` for Better Performance

Interfaces are generally more performant than type aliases for large object types:

```typescript
// Good for large object types
interface User {
  id: string;
  name: string;
  // ... many more properties
}

// For union types or other complex types
type Status = 'pending' | 'in-progress' | 'completed';
```

## Runtime Performance

### Avoid Excessive Type Checking at Runtime

```typescript
// Bad - type checking at runtime
function processValue(value: unknown) {
  if (typeof value === 'object' && value !== null && 'data' in value) {
    // TypeScript still doesn't know about value.data
    console.log((value as any).data);
  }
}

// Better - use type predicates
function isDataObject(value: unknown): value is { data: unknown } {
  return typeof value === 'object' && value !== null && 'data' in value;
}

function processValue(value: unknown) {
  if (isDataObject(value)) {
    // TypeScript knows value has a data property
    console.log(value.data);
  }
}
```

### Use `as const` for Literal Types

```typescript
// Without const assertion
const actions = ['create', 'read', 'update', 'delete'];  // string[]


// With const assertion
const actions = ['create', 'read', 'update', 'delete'] as const;  // readonly ["create", "read", "update", "delete"]
type Action = typeof actions[number];  // "create" | "read" | "update" | "delete"
```

## Memory Management

### Avoid Memory Leaks with Event Listeners

```typescript
class EventHandler {
  private element: HTMLElement;
  private onClick: () => void;
  
  constructor(element: HTMLElement) {
    this.element = element;
    
    // Use arrow function to maintain 'this' context
    this.onClick = () => this.handleClick();
    
    this.element.addEventListener('click', this.onClick);
  }
  
  private handleClick() {
    console.log('Element clicked');
  }
  
  destroy() {
    // Important: Remove event listener to prevent memory leaks
    this.element.removeEventListener('click', this.onClick);
  }
}
```

### Use WeakMap/WeakSet for Private Data

```typescript
const privateData = new WeakMap<object, { count: number }>();

class Counter {
  constructor() {
    privateData.set(this, { count: 0 });
  }
  
  increment() {
    const data = privateData.get(this)!;
    data.count++;
    return data.count;
  }
  
  getCount() {
    return privateData.get(this)!.count;
  }
}
```

## Bundle Size Optimization

### Use `import type` for Type-Only Imports

```typescript
// Before - includes runtime code
import { SomeType, someFunction } from './types';

// After - only includes types at compile time
import type { SomeType } from './types';
import { someFunction } from './types';
```

### Tree Shaking with ES Modules

Ensure your `tsconfig.json` is configured for ES modules:

```json
{
  "compilerOptions": {
    "module": "esnext",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "target": "es2015"
  }
}
```

### Use Barrel Files Carefully

```typescript
// Bad - imports entire module even if only one export is used
import { someUtil } from './utils';

// Better - import only what's needed
import { someUtil } from './utils/some-util';
```

## Lazy Loading

### Dynamic Imports

```typescript
// Instead of
// import { heavyModule } from './heavy-module';


// Use dynamic import
async function loadHeavyModule() {
  const { heavyModule } = await import('./heavy-module');
  return heavyModule;
}

// In React component
const HeavyComponent = React.lazy(() => import('./HeavyComponent'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HeavyComponent />
    </Suspense>
  );
}
```

### Route-Based Code Splitting

```typescript
// Using React Router
import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

const Home = lazy(() => import('./routes/Home'));
const About = lazy(() => import('./routes/About'));
const Contact = lazy(() => import('./routes/Contact'));

function App() {
  return (
    <Router>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </Suspense>
    </Router>
  );
}
```

## Caching Strategies

### Service Worker for Offline Support

```typescript
// service-worker.ts
const CACHE_NAME = 'my-app-cache-v1';
const urlsToCache = [
  '/',
  '/styles/main.css',
  '/scripts/main.js',
  '/images/logo.png'
];

self.addEventListener('install', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event: FetchEvent) => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
```

### In-Memory Caching

```typescript
class DataCache<T> {
  private cache: Map<string, { data: T; expires: number }> = new Map();
  
  constructor(private ttl: number = 60 * 1000) {}
  
  set(key: string, data: T): void {
    this.cache.set(key, {
      data,
      expires: Date.now() + this.ttl
    });
  }
  
  get(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) return null;
    
    if (Date.now() > item.expires) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }
  
  clear(): void {
    this.cache.clear();
  }
  
  cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expires) {
        this.cache.delete(key);
      }
    }
  }
}

// Usage
const userCache = new DataCache<User>(5 * 60 * 1000); // 5 minutes TTL
```

## Performance Monitoring

### Using the Performance API

```typescript
// Start measuring
const startTime = performance.now();

// Your code here
const result = someExpensiveOperation();

// Measure duration
const duration = performance.now() - startTime;
console.log(`Operation took ${duration.toFixed(2)}ms`);
```

### Monitoring with PerformanceObserver

```typescript
// Monitor long tasks (blocking operations > 50ms)
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    console.log('[Long Task]', entry.startTime, entry.duration);
  }
});

observer.observe({ entryTypes: ['longtask'] });

// Monitor memory usage (Chrome only)
const memory = performance as any as {
  memory?: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
};

if (memory.memory) {
  console.log(`Used JS heap size: ${(memory.memory.usedJSHeapSize / 1048576).toFixed(2)} MB`);
}
```

## Key Takeaways

1. **Compiler Optimizations**: Use incremental compilation, project references, and skip type checking for dependencies to speed up builds.
2. **Type-Level Optimizations**: Use `const` assertions, avoid `any`, and prefer `interface` for better performance.
3. **Runtime Performance**: Minimize type checking at runtime and use `as const` for literal types.
4. **Memory Management**: Clean up event listeners and use `WeakMap`/`WeakSet` for private data.
5. **Bundle Size**: Use `import type` for type-only imports and enable tree shaking.
6. **Lazy Loading**: Implement dynamic imports and route-based code splitting.
7. **Caching**: Use service workers for offline support and implement in-memory caching.
8. **Monitoring**: Use the Performance API and PerformanceObserver to monitor and optimize performance.

## Exercises

1. Set up incremental compilation in a TypeScript project and measure the build time improvement.
2. Convert a large object type from `type` to `interface` and measure the performance impact.
3. Implement a simple in-memory cache with TTL (time-to-live) functionality.
4. Set up route-based code splitting in a React application.
5. Create a performance monitoring utility that logs long tasks and memory usage.

## Next Steps

Now that you understand performance optimization in TypeScript, you're ready to explore how to work with the TypeScript compiler API in the next section.

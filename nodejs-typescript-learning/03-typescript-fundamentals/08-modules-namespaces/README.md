# 8. Modules and Namespaces in TypeScript

TypeScript supports organizing code using modules and namespaces. This section covers both ES modules and TypeScript namespaces, along with module resolution strategies.

## Table of Contents
- [ES Modules](#es-modules)
- [Namespaces](#namespaces)
- [Module Resolution](#module-resolution)
- [Declaration Merging](#declaration-merging)
- [Ambient Modules](#ambient-modules)
- [Key Takeaways](#key-takeaways)
- [Exercises](#exercises)

## ES Modules

### Exporting

```typescript
// math.ts
export const PI = 3.14;

export function add(x: number, y: number): number {
  return x + y;
}

export interface Point {
  x: number;
  y: number;
}

// Default export
export default class Calculator {
  static multiply(x: number, y: number): number {
    return x * y;
  }
}
```

### Importing

```typescript
// app.ts
import { PI, add, Point } from './math';
import Calculator from './math';

console.log(PI); // 3.14
console.log(add(2, 3)); // 5

const point: Point = { x: 10, y: 20 };
console.log(point);

console.log(Calculator.multiply(4, 5)); // 20
```

### Re-exports

```typescript
// utils/index.ts
export * from './math';
export * from './string-utils';

// Re-export with renaming
export { add as addNumbers } from './math';
```

## Namespaces

### Single File Namespace

```typescript
namespace Geometry {
  export namespace Area {
    export function rectangle(width: number, height: number): number {
      return width * height;
    }
    
    export function circle(radius: number): number {
      return Math.PI * radius * radius;
    }
  }
  
  export function perimeterOfRectangle(width: number, height: number): number {
    return 2 * (width + height);
  }
}

// Usage
const area = Geometry.Area.rectangle(10, 20);
const perimeter = Geometry.perimeterOfRectangle(10, 20);
```

### Multi-file Namespaces

```typescript
// geometry/area.ts
namespace Geometry {
  export namespace Area {
    export function rectangle(width: number, height: number): number {
      return width * height;
    }
  }
}

// geometry/perimeter.ts
/// <reference path="area.ts" />
namespace Geometry {
  export function perimeterOfRectangle(width: number, height: number): number {
    return 2 * (width + height);
  }
}

// app.ts
/// <reference path="geometry/area.ts" />
/// <reference path="geometry/perimeter.ts" />

const area = Geometry.Area.rectangle(10, 20);
const perimeter = Geometry.perimeterOfRectangle(10, 20);
```

## Module Resolution

### Relative vs Non-relative Imports

```typescript
// Relative import (starts with ./ or ../)
import { something } from './localModule';

// Non-relative import
import * as _ from 'lodash';
```

### Module Resolution Strategies

1. **Classic**: Legacy TypeScript module resolution (used with `--module` other than `commonjs` or `es2015`)
2. **Node**: Follows Node.js module resolution algorithm (default for `--module commonjs`)
3. **Bundler**: Similar to Node but allows for `.ts` and `.tsx` files (used with `--module es2015`, `--module esnext`)

### Path Mapping

```json
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": "./src",
    "paths": {
      "@app/*": ["app/*"],
      "@utils/*": ["utils/*"]
    }
  }
}
```

```typescript
// Usage with path mapping
import { someUtil } from '@utils/string-utils';
import { AppComponent } from '@app/components/AppComponent';
```

## Declaration Merging

### Merging Interfaces

```typescript
interface User {
  name: string;
  age: number;
}

interface User {
  email: string;
}

// Merged as:
// interface User {
//   name: string;
//   age: number;
//   email: string;
// }
```

### Merging Namespaces

```typescript
namespace Validation {
  export interface StringValidator {
    isAcceptable(s: string): boolean;
  }
}

namespace Validation {
  export const lettersRegexp = /^[A-Za-z]+$/;
  
  export class LettersOnlyValidator implements StringValidator {
    isAcceptable(s: string) {
      return lettersRegexp.test(s);
    }
  }
}
```

## Ambient Modules

### Declaring Ambient Modules

```typescript
// types/custom.d.ts
declare module 'my-module' {
  export function doSomething(): void;
  export const value: number;
}

// Usage
import { doSomething, value } from 'my-module';
```

### Shorthand Ambient Modules

```typescript
// types/custom.d.ts
declare module '*.json' {
  const value: any;
  export default value;
}

declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}
```

## Key Takeaways

1. **ES Modules** are the standard way to organize code in modern JavaScript/TypeScript.
2. **Namespaces** provide a way to organize code and avoid global scope pollution, but are less commonly used in modern codebases.
3. **Module Resolution** determines how TypeScript resolves module imports.
4. **Path Mapping** allows for cleaner import paths using aliases.
5. **Declaration Merging** allows you to extend existing types and interfaces.
6. **Ambient Modules** allow you to declare types for modules that don't have type definitions.

## Exercises

1. Convert a namespace-based codebase to use ES modules.
2. Create a type declaration file for a third-party JavaScript library.
3. Set up path aliases in your TypeScript project.
4. Create a module that re-exports functionality from multiple other modules.
5. Use declaration merging to extend the global `Window` interface.

## Next Steps

Now that you understand modules and namespaces in TypeScript, you're ready to explore decorators and how they can be used for metaprogramming in the next section.

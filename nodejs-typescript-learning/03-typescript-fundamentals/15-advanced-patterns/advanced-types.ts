/**
 * Advanced TypeScript Types
 * 
 * This file demonstrates advanced type patterns in TypeScript including:
 * - Advanced Utility Types
 * - Conditional Types with Inference
 * - Advanced Mapped Types
 */

// ==================== Type Definitions for Examples ====================

interface User {
  id: number;
  name: string;
  email: string;
  age?: number;
  address?: {
    street: string;
    city: string;
    country: string;
  };
  roles: string[];
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  metadata?: Record<string, unknown>;
}

interface Post {
  id: number;
  title: string;
  content: string;
  authorId: number;
  published: boolean;
  tags: string[];
  likes: number;
  comments: Array<{
    id: number;
    userId: number;
    content: string;
    createdAt: Date;
  }>;
}

type AsyncFunction = (...args: any[]) => Promise<any>;
type SyncFunction = (...args: any[]) => any;

// ==================== Advanced Utility Types ====================


/**
 * 1. Make all properties mutable (remove readonly)
 */
type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};

/**
 * 2. Make specific properties required
 */
type WithRequired<T, K extends keyof T> = T & {
  [P in K]-?: T[P];
};

/**
 * 3. Get the type of array elements
 */
type ElementType<T> = T extends (infer U)[] ? U : never;

/**
 * 4. Get the return type of a function, unwrapping Promise if needed
 */
type AwaitedReturnType<T> = T extends (...args: any[]) => Promise<infer R>
  ? Awaited<R>
  : T extends (...args: any[]) => infer R
  ? R
  : never;

/**
 * 5. Get the constructor parameters as a tuple
 */
type ConstructorParameters<T extends new (...args: any) => any> = 
  T extends new (...args: infer P) => any ? P : never;

// ==================== Conditional Types with Inference ====================

/**
 * 1. Extract the type of a promise
 */
type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;

/**
 * 2. Get the type of the first argument of a function
 */
type FirstArgument<T> = T extends (first: infer U, ...rest: any[]) => any ? U : never;

/**
 * 3. Extract the type of a resolved promise
 */
type Awaited<T> = T extends PromiseLike<infer U> ? Awaited<U> : T;

/**
 * 4. Get the return type of a function that might return a promise
 */
type SyncOrAsyncReturnType<T> = T extends (...args: any[]) => Promise<infer R>
  ? R
  : T extends (...args: any[]) => infer R
  ? R
  : never;

/**
 * 5. Check if a type is a union type
 */
type IsUnion<T, U = T> = T extends U 
  ? [U] extends [T] 
    ? false 
    : true 
  : never;

// ==================== Advanced Mapped Types ====================

/**
 * 1. Make all properties optional and nullable
 */
type Nullable<T> = {
  [P in keyof T]: T[P] | null | undefined;
};

/**
 * 2. Make all properties writable (remove readonly)
 */
type Writable<T> = {
  -readonly [P in keyof T]: T[P];
};

/**
 * 3. Make all properties required and non-nullable
 */
type RequiredNotNull<T> = {
  [P in keyof T]: NonNullable<T[P]>;
};

/**
 * 4. Pick properties by value type
 */
type PickByType<T, ValueType> = {
  [P in keyof T as T[P] extends ValueType ? P : never]: T[P];
};

/**
 * 5. Omit properties by value type
 */
type OmitByType<T, ValueType> = {
  [P in keyof T as T[P] extends ValueType ? never : P]: T[P];
};

// ==================== Advanced Type Manipulation ====================

/**
 * 1. Deep partial type (recursive)
 */
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * 2. Deep readonly type (recursive)
 */
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

/**
 * 3. Deep required type (recursive)
 */
type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P];
};

/**
 * 4. Deep nullable type (recursive)
 */
type DeepNullable<T> = {
  [P in keyof T]: T[P] extends object ? DeepNullable<T[P]> | null : T[P] | null;
};

// ==================== Type Predicates ====================

/**
 * Type guard to check if a value is an object (not array or null)
 */
function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/**
 * Type guard to check if a value is a plain object
 */
function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== 'object') return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

// ==================== Practical Examples ====================

// Example 1: Type-safe object property access
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

// Example 2: Type-safe object property setter
function setProperty<T, K extends keyof T>(
  obj: T,
  key: K,
  value: T[K]
): void {
  obj[key] = value;
}

// Example 3: Type-safe function composition
type Compose<F extends (x: any) => any> = (
  ...fns: F[]
) => F extends (x: infer X) => any
  ? (x: X) => ReturnType<F>
  : never;

// Example 4: Type-safe event emitter
type EventMap = {
  click: { x: number; y: number };
  change: { value: string };
  submit: { data: Record<string, unknown> };
};

class TypedEventEmitter<T extends Record<string, any>> {
  private listeners: {
    [K in keyof T]?: ((event: T[K]) => void)[];
  } = {};

  on<K extends keyof T>(event: K, listener: (event: T[K]) => void): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event]!.push(listener);
  }

  emit<K extends keyof T>(event: K, data: T[K]): void {
    this.listeners[event]?.forEach(listener => listener(data));
  }
}

// ==================== Advanced Type Patterns ====================

/**
 * Type-level if-else
 */
type If<C extends boolean, T, F> = C extends true ? T : F;

/**
 * Type-level equality check
 */
type Equals<X, Y> = 
  (<T>() => T extends X ? 1 : 2) extends
  (<T>() => T extends Y ? 1 : 2) ? true : false;

/**
 * Type-level not
 */
type Not<X extends boolean> = X extends true ? false : true;

/**
 * Type-level or
 */
type Or<A extends boolean, B extends boolean> = A extends true 
  ? true 
  : B extends true 
    ? true 
    : false;

// ==================== Type Utilities for API Responses ====================

interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    page?: number;
    pageSize?: number;
    total?: number;
    [key: string]: unknown;
  };
}

// Helper to create a successful API response
function createSuccessResponse<T>(
  data: T,
  meta?: ApiResponse['meta']
): ApiResponse<T> {
  return {
    success: true,
    data,
    ...(meta && { meta }),
  };
}

// Helper to create an error API response
function createErrorResponse(
  code: string,
  message: string,
  details?: unknown
): ApiResponse<never> {
  return {
    success: false,
    error: {
      code,
      message,
      ...(details && { details }),
    },
  };
}

// ==================== Type Utilities for Forms ====================

type FormField<T> = {
  value: T;
  error?: string;
  touched: boolean;
  validate: (value: T) => string | undefined;
};

type FormShape<T> = {
  [K in keyof T]: FormField<T[K]>;
};

function createFormField<T>(
  initialValue: T,
  validate: (value: T) => string | undefined = () => undefined
): FormField<T> {
  return {
    value: initialValue,
    touched: false,
    error: undefined,
    validate,
  };
}

// ==================== Export Everything ====================

export {
  // Example types
  type User,
  type Post,
  type AsyncFunction,
  type SyncFunction,
  
  // Advanced Utility Types
  type Mutable,
  type WithRequired,
  type ElementType,
  type AwaitedReturnType,
  type ConstructorParameters,
  
  // Conditional Types with Inference
  type UnwrapPromise,
  type FirstArgument,
  type Awaited,
  type SyncOrAsyncReturnType,
  type IsUnion,
  
  // Advanced Mapped Types
  type Nullable,
  type Writable,
  type RequiredNotNull,
  type PickByType,
  type OmitByType,
  
  // Advanced Type Manipulation
  type DeepPartial,
  type DeepReadonly,
  type DeepRequired,
  type DeepNullable,
  
  // Type Predicates
  isObject,
  isPlainObject,
  
  // Practical Examples
  getProperty,
  setProperty,
  type Compose,
  type EventMap,
  TypedEventEmitter,
  
  // Advanced Type Patterns
  type If,
  type Equals,
  type Not,
  type Or,
  
  // API Response Types
  type ApiResponse,
  createSuccessResponse,
  createErrorResponse,
  
  // Form Types
  type FormField,
  type FormShape,
  createFormField,
};

// Example usage of the exported types and utilities
/*
// Example 1: Using WithRequired
type UserWithRequiredEmail = WithRequired<User, 'email' | 'name'>;

// Example 2: Using DeepPartial
const partialUser: DeepPartial<User> = {
  name: 'John',
  address: {
    city: 'New York'
  }
};

// Example 3: Using PickByType
type StringProps = PickByType<User, string>; // { name: string; email: string; }

// Example 4: Using the event emitter
const emitter = new TypedEventEmitter<EventMap>();
emitter.on('click', (event) => {
  // event is { x: number; y: number }
  console.log(`Clicked at (${event.x}, ${event.y})`);
});
*/

// ==================== Summary ====================
/*
Key Takeaways:

1. Advanced Utility Types:
   - Create more precise and reusable type utilities
   - Manipulate object properties at the type level
   - Work with function types more effectively

2. Conditional Types with Inference:
   - Create type-safe abstractions
   - Infer types from other types
   - Build complex type relationships

3. Advanced Mapped Types:
   - Transform object types in powerful ways
   - Create readonly/required variations
   - Filter and pick properties by type

4. Practical Applications:
   - Type-safe API clients
   - Form handling
   - State management
   - Event systems
   - And much more!

These patterns will help you write more maintainable, type-safe, and self-documenting code.
*/

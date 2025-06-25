/**
 * Performance Optimization with `as const` Assertions in TypeScript
 * 
 * This file demonstrates how to use TypeScript's `as const` assertion
 * for better type inference, improved performance, and more precise types.
 */

// ==================== Basic Usage ====================

// Without const assertion
const colors = ['red', 'green', 'blue'];  // string[]
const firstColor = colors[0];             // string

// With const assertion
const colorsConst = ['red', 'green', 'blue'] as const;  // readonly ["red", "green", "blue"]
const firstColorConst = colorsConst[0];                // "red"

// ==================== Object Literals ====================

// Regular object literal
const user = {
  name: 'John',
  age: 30,
  address: {
    street: '123 Main St',
    city: 'Anytown'
  }
};
// Type: { name: string; age: number; address: { street: string; city: string; } }

// With const assertion
const userConst = {
  name: 'John',
  age: 30,
  address: {
    street: '123 Main St',
    city: 'Anytown'
  }
} as const;
// Type: { 
//   readonly name: "John"; 
//   readonly age: 30; 
//   readonly address: { 
//     readonly street: "123 Main St"; 
//     readonly city: "Anytown"; 
//   }; 
// }

// ==================== Performance Benefits ====================

/**
 * 1. Better Type Inference
 *    - More precise types mean less runtime type checking
 *    - Enables better optimization by the TypeScript compiler
 */

// Without const assertion (less precise)
function processStatus(status: 'success' | 'error') {
  // ...
}
processStatus('success'); // Works, but also allows any string after type checking

// With const assertion (more precise)
const STATUS = {
  SUCCESS: 'success',
  ERROR: 'error',
} as const;

type Status = typeof STATUS[keyof typeof STATUS]; // "success" | "error"

function processStatusConst(status: Status) {
  // ...
}
processStatusConst(STATUS.SUCCESS); // Type-safe, only allows 'success' or 'error'

/**
 * 2. Eliminates Need for Enums
 *    - More concise than enums
 *    - Works better with tree-shaking
 */

// Instead of enum
enum DirectionEnum {
  Up = 'UP',
  Down = 'DOWN',
  Left = 'LEFT',
  Right = 'RIGHT',
}

// Use const assertion
const Direction = {
  Up: 'UP',
  Down: 'DOWN',
  Left: 'LEFT',
  Right: 'RIGHT',
} as const;

type Direction = typeof Direction[keyof typeof Direction]; // "UP" | "DOWN" | "LEFT" | "RIGHT"

// ==================== Advanced Patterns ====================

/**
 * 1. Readonly Tuples
 */
// Regular tuple
function move1(direction: [number, number]) {
  // direction is mutable
  direction[0] = 100; // No error
}

// With const assertion
function move2(direction: readonly [number, number]) {
  // direction[0] = 100; // Error: Cannot assign to '0' because it is a read-only property
}

// Even better with `as const`
const MOVE_UP = [0, -1] as const;
// MOVE_UP[0] = 1; // Error: Cannot assign to '0' because it is a read-only property

/**
 * 2. Type-Safe Redux Actions
 */
// Without const assertion
const ADD_TODO = 'ADD_TODO';
function addTodo1(text: string) {
  return {
    type: ADD_TODO,
    payload: { text }
  };
}
// Type: { type: string; payload: { text: string; }; }

// With const assertion
const ADD_TODO_CONST = 'ADD_TODO' as const;
function addTodo2(text: string) {
  return {
    type: ADD_TODO_CONST,
    payload: { text }
  } as const;
}
// Type: { 
//   readonly type: "ADD_TODO"; 
//   readonly payload: { 
//     readonly text: string; 
//   }; 
// }

/**
 * 3. Function Return Type Inference
 */
// Without const assertion
function getConfig1() {
  return {
    apiUrl: 'https://api.example.com',
    timeout: 5000,
    retries: 3,
  };
}
// Type: { apiUrl: string; timeout: number; retries: number; }

// With const assertion
function getConfig2() {
  return {
    apiUrl: 'https://api.example.com',
    timeout: 5000,
    retries: 3,
  } as const;
}
// Type: { 
//   readonly apiUrl: "https://api.example.com"; 
//   readonly timeout: 5000; 
//   readonly retries: 3; 
// }

// ==================== Performance Optimization Techniques ====================

/**
 * 1. Memoization with Literal Types
 */
// Without const assertion
function getTheme1(theme: 'light' | 'dark') {
  // TypeScript doesn't know these are constant
  const styles = {
    light: { backgroundColor: 'white', color: 'black' },
    dark: { backgroundColor: 'black', color: 'white' },
  };
  return styles[theme];
}

// With const assertion
const THEMES = {
  light: { backgroundColor: 'white', color: 'black' } as const,
  dark: { backgroundColor: 'black', color: 'white' } as const,
} as const;

type Theme = keyof typeof THEMES;

function getTheme2(theme: Theme) {
  return THEMES[theme]; // More efficient, as TypeScript knows the exact shape
}

/**
 * 2. String Literal Unions for Better Inference
 */
// Without const assertion
const ACTIONS = ['create', 'read', 'update', 'delete'];
type Action = typeof ACTIONS[number]; // string

// With const assertion
const ACTIONS_CONST = ['create', 'read', 'update', 'delete'] as const;
type ActionConst = typeof ACTIONS_CONST[number]; // "create" | "read" | "update" | "delete"

// This enables better optimization in switch statements
function handleAction(action: ActionConst) {
  switch (action) {
    case 'create':
      // TypeScript knows action is 'create' here
      return 'Creating...';
    case 'read':
      return 'Reading...';
    // TypeScript will error if we forget a case
    default:
      // TypeScript knows this should be never
      const _exhaustiveCheck: never = action;
      return _exhaustiveCheck;
  }
}

/**
 * 3. Immutable Configuration Objects
 */
// Without const assertion
const config = {
  api: {
    baseUrl: 'https://api.example.com',
    version: 'v1',
    endpoints: ['users', 'posts', 'comments'],
  },
  features: {
    darkMode: true,
    notifications: true,
    analytics: false,
  },
  // ...
};

// With const assertion
const CONFIG = {
  api: {
    baseUrl: 'https://api.example.com',
    version: 'v1',
    endpoints: ['users', 'posts', 'comments'] as const,
  },
  features: {
    darkMode: true,
    notifications: true,
    analytics: false,
  },
  // ...
} as const;

// TypeScript knows all the exact values and structure
// CONFIG.api.endpoints[0] is known to be "users" at compile time

// ==================== When to Use `as const` ====================
/*
Use `as const` when:
1. You want literal types instead of general types
2. You need readonly properties/tuples
3. You're defining configuration objects or constants
4. You want better IDE autocompletion
5. You're working with Redux actions or similar patterns

Avoid `as const` when:
1. You need to modify the object/array later
2. The exact literal types aren't important
3. You're working with large objects where the type might become unwieldy
*/

// ==================== Real-world Example ====================

// API Response Types with `as const`
const API_RESPONSE = {
  SUCCESS: 'success',
  ERROR: 'error',
  STATUS_CODES: {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500,
  },
  DEFAULT_PAGINATION: {
    page: 1,
    pageSize: 10,
    totalPages: 1,
  },
  CACHE_KEYS: {
    USER: 'user',
    SETTINGS: 'settings',
    PREFERENCES: 'preferences',
  },
} as const;

type ApiResponse<T = unknown> = {
  status: typeof API_RESPONSE.SUCCESS | typeof API_RESPONSE.ERROR;
  data?: T;
  error?: {
    message: string;
    code: number;
  };
  meta?: {
    page: number;
    pageSize: number;
    total: number;
  };
};

// Using the types
function fetchUser(userId: string): Promise<ApiResponse<{ id: string; name: string }>> {
  // Implementation...
  return Promise.resolve({
    status: API_RESPONSE.SUCCESS,
    data: { id: userId, name: 'John Doe' },
    meta: {
      page: 1,
      pageSize: 10,
      total: 1,
    },
  });
}

// ==================== Summary ====================
/*
Key Benefits of `as const`:
1. More precise types for literals
2. Readonly properties prevent accidental mutations
3. Better IDE autocompletion
4. Enables more specific type checking
5. Can improve runtime performance in some cases
6. Makes code more self-documenting
7. Works well with Redux and similar patterns

Best Practices:
1. Use for configuration objects and constants
2. Combine with `typeof` for type definitions
3. Use with tuples for fixed-length arrays
4. Consider using with Redux actions and reducers
5. Be mindful of type inference in complex objects
*/

// Export for usage in other files
export {
  colorsConst,
  userConst,
  STATUS,
  Direction,
  THEMES,
  ACTIONS_CONST,
  CONFIG,
  API_RESPONSE,
  type Status,
  type Direction as DirectionType,
  type ActionConst,
  type ApiResponse,
};

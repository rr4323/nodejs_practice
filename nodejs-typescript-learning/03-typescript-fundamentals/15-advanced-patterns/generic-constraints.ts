/**
 * Advanced Generic Constraints in TypeScript
 * 
 * This file demonstrates various advanced generic constraint patterns
 * that provide type safety and flexibility in TypeScript.
 */

// ==================== Basic Generic Constraints ====================

// 1. Constrain to object types
type ObjectType<T> = T extends object ? T : never;

// 2. Ensure a type is not null or undefined
type NonNullableType<T> = T extends null | undefined ? never : T;

// 3. Constrain to constructor functions
type Constructor<T = any> = new (...args: any[]) => T;

// 4. Ensure a type is an array
type ArrayType<T> = T extends (infer U)[] ? U : never;

// ==================== Utility Types with Constraints ====================

// 5. Make specific properties required
// T - The type to modify
// K - Union of keys to make required
type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] };

// 6. Make specific properties optional
// T - The type to modify
// K - Union of keys to make optional
type WithOptional<T, K extends keyof T> = Omit<T, K> & { [P in K]?: T[P] };

// 7. Get the return type of a function, handling async functions
type AwaitedReturnType<T> = T extends (...args: any[]) => Promise<infer R>
  ? Awaited<R>
  : T extends (...args: any[]) => infer R
  ? R
  : never;

// ==================== Advanced Constraint Patterns ====================

// 8. Ensure a type has at least one property
type NonEmptyObject<T> = keyof T extends never ? never : T;

// 9. Ensure a type is a primitive
type Primitive = string | number | boolean | bigint | symbol | null | undefined;
type IsPrimitive<T> = T extends Primitive ? true : false;

// 10. Ensure a type is a function with specific parameters and return type
type FunctionWithParamsAndReturn<
  TArgs extends any[],
  TReturn
> = (...args: TArgs) => TReturn;

// 11. Ensure all properties of an object are of a specific type
type AllPropertiesOfType<T, U> = {
  [K in keyof T]: T[K] extends U ? T[K] : never;
};

// 12. Ensure a type is a plain object (not array, function, etc.)
type PlainObject<T = any> = {
  [key: string]: T;
};

// ==================== Conditional Type Constraints ====================

// 13. Extract only function properties from a type
type FunctionProperties<T> = {
  [K in keyof T]: T[K] extends (...args: any[]) => any ? K : never;
}[keyof T];

// 14. Extract only non-function properties from a type
type NonFunctionProperties<T> = {
  [K in keyof T]: T[K] extends (...args: any[]) => any ? never : K;
}[keyof T];

// 15. Ensure a type is a union of string literals
type StringLiteralUnion<T extends string> = T | (string & {});

// ==================== Mapped Type Constraints ====================

// 16. Create a type with all properties as readonly and required
type Immutable<T> = {
  readonly [P in keyof T]: T[P] extends object ? Immutable<T[P]> : T[P];
};

// 17. Create a type with all properties as mutable
type Mutable<T> = {
  -readonly [P in keyof T]: T[P] extends object ? Mutable<T[P]> : T[P];
};

// 18. Create a type with all properties as optional and nullable
type Nullable<T> = {
  [P in keyof T]: T[P] | null | undefined;
};

// ==================== Recursive Type Constraints ====================

// 19. Deep partial (recursive)
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// 20. Deep required (recursive)
type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P];
};

// 21. Deep readonly (recursive)
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

// ==================== Type-Level Programming ====================

// 22. Check if two types are equal
type Equals<X, Y> = 
  (<T>() => T extends X ? 1 : 2) extends
  (<T>() => T extends Y ? 1 : 2) ? true : false;

// 23. If-Else at type level
type If<Condition extends boolean, Then, Else> = Condition extends true ? Then : Else;

// 24. Check if a type is never
type IsNever<T> = [T] extends [never] ? true : false;

// ==================== Practical Examples ====================

// Example 1: Function that requires at least one property
function hasAtLeastOneProp<T extends object>(
  obj: NonEmptyObject<T>,
  message?: string
): void {
  if (Object.keys(obj).length === 0) {
    throw new Error(message || 'Object must have at least one property');
  }
}

// Example 2: Factory function with constructor constraint
function createInstance<T>(
  ctor: Constructor<T>,
  ...args: any[]
): T {
  return new ctor(...args);
}

// Example 3: Deep freeze an object
function deepFreeze<T extends object>(obj: T): Immutable<T> {
  Object.freeze(obj);
  
  Object.getOwnPropertyNames(obj).forEach(prop => {
    const value = (obj as any)[prop];
    if (value && typeof value === 'object' && !Object.isFrozen(value)) {
      deepFreeze(value);
    }
  });
  
  return obj as Immutable<T>;
}

// Example 4: Type-safe property accessor
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

// Example 5: Type-safe object builder
class Builder<T> {
  private value: Partial<T> = {};
  
  with<K extends keyof T>(key: K, value: T[K]): Builder<T> {
    this.value[key] = value;
    return this;
  }
  
  build(): WithRequired<Partial<T>, NonFunctionProperties<T>> {
    return this.value as WithRequired<Partial<T>, NonFunctionProperties<T>>;
  }
}

// ==================== Advanced Examples ====================

// Example 6: Type-safe event emitter
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

// Example 7: Type-safe state machine
type StateMachine<State extends string, Event extends string> = {
  initial: State;
  states: {
    [S in State]: {
      on?: {
        [E in Event]?: State;
      };
    };
  };
};

function createMachine<State extends string, Event extends string>(
  config: StateMachine<State, Event>
) {
  let currentState = config.initial;
  
  return {
    get state() {
      return currentState;
    },
    
    send(event: Event): State | null {
      const nextState = config.states[currentState]?.on?.[event];
      if (nextState) {
        currentState = nextState;
        return nextState;
      }
      return null;
    }
  };
}

// ==================== Export All Types and Utilities ====================
export {
  // Basic constraints
  ObjectType,
  NonNullableType,
  Constructor,
  ArrayType,
  
  // Utility types
  WithRequired,
  WithOptional,
  AwaitedReturnType,
  
  // Advanced constraints
  NonEmptyObject,
  Primitive,
  IsPrimitive,
  FunctionWithParamsAndReturn,
  AllPropertiesOfType,
  PlainObject,
  
  // Conditional types
  FunctionProperties,
  NonFunctionProperties,
  StringLiteralUnion,
  
  // Mapped types
  Immutable,
  Mutable,
  Nullable,
  
  // Recursive types
  DeepPartial,
  DeepRequired,
  DeepReadonly,
  
  // Type-level programming
  Equals,
  If,
  IsNever,
  
  // Example classes
  TypedEventEmitter,
  createMachine,
  
  // Example functions
  hasAtLeastOneProp,
  createInstance,
  deepFreeze,
  getProperty,
  Builder
};

// Example usage of exported types
/*
// 1. Using WithRequired
interface User {
  id?: number;
  name?: string;
  email: string;
}

const user1: WithRequired<User, 'id' | 'name'> = {
  id: 1,
  name: 'John',
  email: 'john@example.com'
};

// 2. Using TypedEventEmitter
const emitter = new TypedEventEmitter<EventMap>();
emitter.on('click', (event) => {
  // event is { x: number; y: number }
  console.log(`Clicked at (${event.x}, ${event.y})`);
});

// 3. Using State Machine
const trafficLight = createMachine({
  initial: 'red',
  states: {
    red: { on: { TIMER: 'green' } },
    yellow: { on: { TIMER: 'red' } },
    green: { on: { TIMER: 'yellow' } }
  }
} as const);

trafficLight.send('TIMER'); // 'green'
*/"

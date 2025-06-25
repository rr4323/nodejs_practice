# 7. Object Types in TypeScript

TypeScript provides powerful ways to define and work with object types. This section covers the various aspects of object types, including property modifiers, index signatures, and more.

## Table of Contents
- [Property Modifiers](#property-modifiers)
- [Index Signatures](#index-signatures)
- [Readonly and Const Assertions](#readonly-and-const-assertions)
- [Excess Property Checks](#excess-property-checks)
- [Intersection Types](#intersection-types)
- [Type Aliases vs Interfaces](#type-aliases-vs-interfaces)
- [Key Takeaways](#key-takeaways)
- [Exercises](#exercises)

## Property Modifiers

### Optional Properties

```typescript
interface User {
  name: string;
  age?: number;  // Optional property
  email?: string; // Optional property
}

const user1: User = { name: 'John' }; // Valid
const user2: User = { name: 'Jane', age: 30 }; // Valid
// const user3: User = { name: 'Bob', age: 25, phone: '123-456-7890' }; // Error
```

### Readonly Properties

```typescript
interface Point {
  readonly x: number;
  readonly y: number;
}

const point: Point = { x: 10, y: 20 };
// point.x = 5; // Error: Cannot assign to 'x' because it is a read-only property
```

## Index Signatures

Index signatures allow you to define the type of properties that an object can have.

### String Index Signatures

```typescript
interface StringDictionary {
  [key: string]: string;
}

const dict: StringDictionary = {
  name: 'John',
  email: 'john@example.com',
  // age: 30 // Error: Type 'number' is not assignable to type 'string'
};
```

### Number Index Signatures

```typescript
interface NumberDictionary {
  [index: number]: string;
}

const arr: NumberDictionary = ['a', 'b', 'c'];
const value = arr[0]; // string
```

### Hybrid Types

```typescript
interface HybridDictionary {
  [key: string]: string | number;
  name: string;
  age: number;
}

const person: HybridDictionary = {
  name: 'John',
  age: 30,
  email: 'john@example.com',
  score: 100
};
```

## Readonly and Const Assertions

### Readonly Arrays

```typescript
let numbers: readonly number[] = [1, 2, 3];
// numbers.push(4); // Error: Property 'push' does not exist on type 'readonly number[]'
// numbers[0] = 10; // Error: Index signature in type 'readonly number[]' only permits reading
```

### Const Assertions

```typescript
const point = { x: 10, y: 20 } as const;
// point.x = 5; // Error: Cannot assign to 'x' because it is a read-only property

const colors = ['red', 'green', 'blue'] as const;
// colors.push('yellow'); // Error: Property 'push' does not exist on type 'readonly ["red", "green", "blue"]'
```

## Excess Property Checks

TypeScript performs excess property checking when object literals are assigned to variables or passed as arguments.

```typescript
interface SquareConfig {
  color?: string;
  width?: number;
}

function createSquare(config: SquareConfig): { color: string; area: number } {
  return {
    color: config.color || 'red',
    area: config.width ? config.width * config.width : 20
  };
}

// Error: Object literal may only specify known properties, but 'colour' does not exist
// const square = createSquare({ colour: 'red', width: 100 });

// Workaround 1: Use a type assertion
const square1 = createSquare({ colour: 'red', width: 100 } as SquareConfig);

// Workaround 2: Use a variable
const squareOptions = { colour: 'red', width: 100 };
const square2 = createSquare(squareOptions);
```

## Intersection Types

Intersection types combine multiple types into one.

```typescript
interface Employee {
  name: string;
  id: number;
}

interface Manager {
  department: string;
  numberOfReports: number;
}

type ManagerEmployee = Employee & Manager;

const manager: ManagerEmployee = {
  name: 'John',
  id: 1,
  department: 'Engineering',
  numberOfReports: 5
};
```

## Type Aliases vs Interfaces

### Type Aliases

```typescript
type Point = {
  x: number;
  y: number;
};

type ID = string | number;

type Callback<T> = (data: T) => void;
```

### Interfaces

```typescript
interface Point {
  x: number;
  y: number;
}

interface User {
  id: number;
  name: string;
  email: string;
}
```

### When to Use Each

- Use **interfaces** when:
  - You want to take advantage of declaration merging
  - You're working with object-oriented code and want to use `implements` or `extends`
  - You want to define contracts for public API

- Use **type aliases** when:
  - You need to define union or intersection types
  - You need to define a type that's a function or a tuple
  - You want to use mapped types or conditional types

## Key Takeaways

1. **Property Modifiers** like `?` and `readonly` help define the shape and mutability of object properties.
2. **Index Signatures** allow you to define the types of properties that aren't known in advance.
3. **Readonly and Const Assertions** help create immutable data structures.
4. **Excess Property Checks** help catch typos and other errors in object literals.
5. **Intersection Types** combine multiple types into one.
6. **Type Aliases vs Interfaces** - Both can be used to define object shapes, but they have different use cases.

## Exercises

1. Create an interface for a product with required properties (id, name, price) and optional properties (description, discount).
2. Write a function that takes an object with string keys and number values and returns the sum of all values.
3. Create a type that represents a configuration object that can have any string key, but values must be either strings, numbers, or booleans.
4. Implement a function that merges two objects with the same shape using intersection types.
5. Create a readonly version of an existing interface using mapped types.

## Next Steps

Now that you understand object types in TypeScript, you're ready to explore how to work with modules and namespaces in the next section.

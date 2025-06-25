# 10. Type System Deep Dive

This section explores the advanced concepts of TypeScript's type system, including type inference, type compatibility, and advanced type manipulation techniques.

## Table of Contents
- [Type Inference](#type-inference)
- [Type Compatibility](#type-compatibility)
- [Type Widening and Narrowing](#type-widening-and-narrowing)
- [Discriminated Unions](#discriminated-unions)
- [Exhaustiveness Checking](#exhaustiveness-checking)
- [Mapped Types Deep Dive](#mapped-types-deep-dive)
- [Conditional Types Deep Dive](#conditional-types-deep-dive)
- [Template Literal Types Deep Dive](#template-literal-types-deep-dive)
- [Key Takeaways](#key-takeaways)
- [Exercises](#exercises)

## Type Inference

TypeScript can infer types in many cases without explicit type annotations.

### Basic Type Inference

```typescript
// TypeScript infers the type based on the assigned value
let x = 3;                // x is inferred as number
let y = [0, 1, null];     // y is inferred as (number | null)[]
let z = { a: 1, b: '2' }; // z is inferred as { a: number; b: string; }

// Contextual typing for function parameters
const names = ['Alice', 'Bob', 'Charlie'];
// name is inferred as string because of the array type
names.forEach(name => console.log(name.toUpperCase()));
```

### Best Common Type

When inferring from multiple expressions, TypeScript uses the "best common type" algorithm.

```typescript
let values = [0, 1, null, 'hello'];  // (number | string | null)[]

class Animal {}
class Rhino extends Animal {}
class Elephant extends Animal {}
class Snake extends Animal {}

let animals = [new Rhino(), new Elephant(), new Snake()];  // (Rhino | Elephant | Snake)[]
```

### Contextual Typing

TypeScript uses the context to infer types in certain situations.

```typescript
window.onmousedown = function(mouseEvent) {
  console.log(mouseEvent.button);  // OK
  // console.log(mouseEvent.kangaroo); // Error: Property 'kangaroo' does not exist on type 'MouseEvent'
};
```

## Type Compatibility

TypeScript's type system is structural, not nominal.

### Basic Compatibility

```typescript
interface Named {
  name: string;
}

class Person {
  name: string = '';
}

let p: Named;
p = new Person();  // OK, because of structural typing

let x = (a: number) => 0;
let y = (b: number, s: string) => 0;

y = x;  // OK
// x = y;  // Error: y has a required second parameter
```

### Function Parameter Bivariance

TypeScript's function parameter types are bivariant, which is unsound but common in JavaScript.

```typescript
enum EventType { Mouse, Keyboard }

interface Event { timestamp: number; }
interface MouseEvent extends Event { x: number; y: number }
interface KeyEvent extends Event { keyCode: number }

function listenEvent(eventType: EventType, handler: (n: Event) => void) {
  /* ... */
}

// Unsound, but useful and common
listenEvent(EventType.Mouse, (e: MouseEvent) => console.log(e.x + ',' + e.y));

// Undesirable alternatives in presence of soundness
listenEvent(EventType.Mouse, (e: Event) => 
  console.log((e as MouseEvent).x + ',' + (e as MouseEvent).y)
);

listenEvent(EventType.Mouse, ((e: MouseEvent) => 
  console.log(e.x + ',' + e.y)
) as (e: Event) => void);
```

### Classes and Private/Protected Members

Classes with private/protected members are only compatible if they share the same declaration.

```typescript
class Animal {
  private name: string;
  constructor(theName: string) { this.name = theName; }
}

class Rhino extends Animal {
  constructor() { super('Rhino'); }
}

class Employee {
  private name: string;
  constructor(theName: string) { this.name = theName; }
}

let animal: Animal = new Animal('Goat');
let rhino: Rhino = new Rhino();
let employee: Employee = new Employee('Bob');

animal = rhino;    // OK
// animal = employee; // Error: 'Animal' and 'Employee' are not compatible
```

## Type Widening and Narrowing

### Type Widening

```typescript
let x = 'hello';  // Type is 'hello' (literal type)
let y = 'world';  // Type is string (widened)

const obj = { x: 1 };  // Type is { x: number }
const arr = [1, 2, 3]; // Type is number[]
```

### Type Narrowing

Type narrowing is the process of moving from a less precise type to a more precise type.

```typescript
// Type guards
function isString(test: any): test is string {
  return typeof test === 'string';
}

function example(foo: any) {
  if (isString(foo)) {
    // foo is type string in this block
    console.log('It is a string: ' + foo);
  } else {
    // foo is type any in this block
    console.log('It is not a string');
  }
}

// Typeof type guards
function padLeft(value: string, padding: string | number) {
  if (typeof padding === 'number') {
    return Array(padding + 1).join(' ') + value;
  }
  if (typeof padding === 'string') {
    return padding + value;
  }
  throw new Error(`Expected string or number, got '${padding}'.`);
}

// Instanceof type guards
class Bird {
  fly() {
    console.log('bird fly');
  }
  
  layEggs() {
    console.log('bird lay eggs');
  }
}

const pet = new Bird();

// Each of these property accesses will cause an error
if (pet instanceof Bird) {
  pet.fly();
} else {
  console.log('pet is not a bird');
}
```

## Discriminated Unions

Discriminated unions combine union types, type guards, and type aliases to create a pattern for working with objects that can be of different types but share a common property.

```typescript
interface Square {
  kind: 'square';
  size: number;
}

interface Rectangle {
  kind: 'rectangle';
  width: number;
  height: number;
}

interface Circle {
  kind: 'circle';
  radius: number;
}

type Shape = Square | Rectangle | Circle;

function area(shape: Shape): number {
  switch (shape.kind) {
    case 'square':
      return shape.size * shape.size;
    case 'rectangle':
      return shape.width * shape.height;
    case 'circle':
      return Math.PI * shape.radius ** 2;
  }
}
```

## Exhaustiveness Checking

TypeScript can check for exhaustiveness in switch statements using the `never` type.

```typescript
function assertNever(x: never): never {
  throw new Error('Unexpected object: ' + x);
}

function area(shape: Shape): number {
  switch (shape.kind) {
    case 'square':
      return shape.size * shape.size;
    case 'rectangle':
      return shape.width * shape.height;
    case 'circle':
      return Math.PI * shape.radius ** 2;
    default:
      return assertNever(shape); // Error if any case is not handled
  }
}
```

## Mapped Types Deep Dive

Mapped types allow you to create new types based on old ones by transforming properties.

### Basic Mapped Type

```typescript
type Keys = 'option1' | 'option2';
type Flags = { [K in Keys]: boolean };

// Equivalent to:
// type Flags = {
//   option1: boolean;
//   option2: boolean;
// }
```

### Mapped Type Modifiers

```typescript
// Make all properties optional
type Partial<T> = {
  [P in keyof T]?: T[P];
};

// Make all properties required
type Required<T> = {
  [P in keyof T]-?: T[P];
};

// Make all properties read-only
type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};

// Remove 'readonly' attributes
type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};
```

## Conditional Types Deep Dive

Conditional types help describe the relation between types of inputs and outputs.

### Basic Conditional Type

```typescript
type TypeName<T> =
  T extends string ? 'string' :
  T extends number ? 'number' :
  T extends boolean ? 'boolean' :
  T extends undefined ? 'undefined' :
  T extends Function ? 'function' :
  'object';
```

### Distributive Conditional Types

```typescript
// When a conditional type acts on a generic type, it becomes distributive
// when given a union type.
type ToArray<Type> = Type extends any ? Type[] : never;

type StrArrOrNumArr = ToArray<string | number>;  // string[] | number[]

// This is equivalent to:
// ToArray<string> | ToArray<number>
// Which is:
// string[] | number[]


// To avoid distribution, surround the type parameter with square brackets
type ToArrayNonDist<Type> = [Type] extends [any] ? Type[] : never;
type StrOrNumArr = ToArrayNonDist<string | number>;  // (string | number)[]
```

## Template Literal Types Deep Dive

Template literal types build on string literal types to build new string literal types.

### Basic Template Literal Types

```typescript
type World = 'world';
type Greeting = `hello ${World}`;  // 'hello world'

type Color = 'red' | 'blue';
type Quantity = 'one' | 'two';

type SeussFish = `${Quantity | Color} fish`;
// "one fish" | "two fish" | "red fish" | "blue fish"
```

### String Manipulation Types

```typescript
// Uppercase<StringType>
type Greeting = 'Hello, world';
type ShoutyGreeting = Uppercase<Greeting>;  // 'HELLO, WORLD'

// Lowercase<StringType>
type QuietGreeting = Lowercase<Greeting>;  // 'hello, world'

// Capitalize<StringType>
type CapitalizedGreeting = Capitalize<Greeting>;  // 'Hello, world'

// Uncapitalize<StringType>
type UncapitalizedGreeting = Uncapitalize<Greeting>;  // 'hello, world'
```

## Key Takeaways

1. **Type Inference** allows TypeScript to automatically determine types in many cases.
2. **Type Compatibility** in TypeScript is structural, not nominal.
3. **Type Narrowing** helps TypeScript understand more specific types within certain code blocks.
4. **Discriminated Unions** are a powerful pattern for working with objects that can be of different types but share a common property.
5. **Exhaustiveness Checking** ensures that all possible cases are handled in a union type.
6. **Mapped Types** allow you to create new types by transforming properties of existing types.
7. **Conditional Types** enable type relationships that depend on other types.
8. **Template Literal Types** provide powerful string manipulation capabilities at the type level.

## Exercises

1. Create a mapped type that makes all properties of an object immutable (readonly) and nullable.
2. Write a conditional type that extracts the return type of a function type.
3. Create a type that represents all possible CSS length units using template literal types.
4. Implement a type that transforms all methods of a class to return Promises of their original return types.
5. Create a type that represents all possible paths of a nested object using template literal types.

## Next Steps

Now that you have a deep understanding of TypeScript's type system, you're ready to explore how to work with the TypeScript compiler and configuration in the next section.

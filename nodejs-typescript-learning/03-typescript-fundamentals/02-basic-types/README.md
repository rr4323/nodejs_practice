# 3.2. Basic Types in TypeScript

TypeScript extends JavaScript's type system with additional features that help you write more robust and maintainable code. This section covers the fundamental types and type-related features in TypeScript.

## Primitive Types

### String
Represents text data. TypeScript supports template strings with backticks.

```typescript
let name: string = 'John';
let greeting: string = `Hello, ${name}!`; // Template literal
```

### Number
Represents both integer and floating-point numbers. TypeScript also supports binary, octal, and hexadecimal literals.

```typescript
let decimal: number = 6;
let hex: number = 0xf00d;      // 61453 in decimal
let binary: number = 0b1010;   // 10 in decimal
let octal: number = 0o744;     // 484 in decimal
```

### Boolean
Represents `true` or `false` values.

```typescript
let isDone: boolean = false;
```

### Null and Undefined
In TypeScript, both `null` and `undefined` have their own types named `null` and `undefined` respectively. They're not very useful on their own, but can be used in union types.

```typescript
let u: undefined = undefined;
let n: null = null;
```

## Object Types

### Arrays
TypeScript allows you to work with arrays of values. The array type can be written in one of two ways:

```typescript
let list1: number[] = [1, 2, 3];
let list2: Array<number> = [1, 2, 3]; // Generic array type
```

### Tuples
Tuples allow you to express an array with a fixed number of elements whose types are known, but need not be the same.

```typescript
// Declare a tuple type
let x: [string, number];
// Initialize it
x = ["hello", 10]; // OK
// x = [10, "hello"]; // Error

// Accessing elements
console.log(x[0].substring(1)); // "ello"
// console.log(x[1].substring(1)); // Error: 'number' does not have 'substring'
```

### Enums
A helpful addition to the standard set of datatypes from JavaScript is the `enum`. 

```typescript
enum Color {Red, Green, Blue}
let c: Color = Color.Green;

// By default, enums begin numbering their members starting at 0. You can change this by manually setting the value of one of its members.
enum Color2 {Red = 1, Green, Blue}
let colorName: string = Color2[2]; // "Green"
```

## Special Types

### Any
The `any` type is a powerful way to work with existing JavaScript, allowing you to gradually opt-in and opt-out of type checking during compilation.

```typescript
let notSure: any = 4;
notSure = "maybe a string instead";
notSure = false; // okay, definitely a boolean
```

### Unknown
The `unknown` type is the type-safe counterpart of `any`. Anything is assignable to `unknown`, but `unknown` isn't assignable to anything but itself and `any` without a type assertion or a control flow based narrowing.

```typescript
let value: unknown;

value = true;             // OK
value = 42;                // OK
value = "Hello World";     // OK
value = [];                // OK
value = {};                // OK
value = Math.random;       // OK
value = null;              // OK
value = undefined;         // OK
value = new TypeError();   // OK

// let value1: unknown = value;   // OK
// let value2: any = value;       // OK
// let value3: boolean = value;   // Error
// let value4: number = value;    // Error
// let value5: string = value;    // Error
// let value6: object = value;    // Error
// let value7: any[] = value;     // Error
// let value8: Function = value;  // Error
```

### Never
The `never` type represents the type of values that never occur. For instance, `never` is the return type for a function expression or an arrow function expression that always throws an exception or one that never returns.

```typescript
// Function returning never must have unreachable end point
function error(message: string): never {
    throw new Error(message);
}

// Inferred return type is never
function fail() {
    return error("Something failed");
}

// Function returning never must have unreachable end point
function infiniteLoop(): never {
    while (true) {
    }
}
```

## Type Assertions

Sometimes you'll end up in a situation where you'll know more about a value than TypeScript does. In such cases, you can use type assertions to specify a more specific type.

```typescript
// Angle-bracket syntax
let someValue: any = "this is a string";
let strLength: number = (<string>someValue).length;

// as-syntax (preferred in .tsx files)
let someValue2: any = "this is a string";
let strLength2: number = (someValue2 as string).length;
```

## Type Guards

Type guards are a way to narrow down the type of an object within a conditional block.

```typescript
// Using typeof
type StringOrNumber = string | number;

function padLeft(value: string, padding: StringOrNumber) {
    if (typeof padding === "number") {
        return Array(padding + 1).join(" ") + value;  // padding is number here
    }
    if (typeof padding === "string") {
        return padding + value;  // padding is string here
    }
    throw new Error(`Expected string or number, got '${padding}'.`);
}

// Using instanceof
class Bird {
    fly() {
        console.log('flying');
    }
    layEggs() {
        console.log('laying eggs');
    }
}

function move(pet: Bird | Fish) {
    if (pet instanceof Bird) {
        pet.fly();
    } else {
        pet.swim();
    }
}
```

## Literal Types

Literal types allow you to specify the exact value a variable can have.

```typescript
let direction: 'north' | 'east' | 'south' | 'west';
direction = 'north'; // OK
// direction = 'northwest'; // Error

function compare(a: string, b: string): -1 | 0 | 1 {
    return a === b ? 0 : a > b ? 1 : -1;
}
```

## Type Aliases

Type aliases create a new name for a type. They're sometimes similar to interfaces, but can name primitives, unions, tuples, and any other types that you'd otherwise have to write by hand.

```typescript
type StringOrNumber = string | number;
type Text = string | { text: string };
type NameLookup = Dictionary<string, Person>;
type Callback<T> = (data: T) => void;
type Pair<T> = [T, T];
type Coordinates = Pair<number>;
type Tree<T> = T | { left: Tree<T>, right: Tree<T> };
```

## Exercises

1. Create a function that takes a parameter which can be either a string or an array of strings. Return the length if it's a string, or the count of array elements if it's an array.

2. Define a type for a function that takes two numbers and returns a number. Then create a function of that type that adds two numbers.

3. Create a type that represents a person with a name (string) and age (number). Then create a function that takes a person and returns a greeting string.

## Next Steps

Now that you understand TypeScript's basic types, let's move on to more complex object types with interfaces and classes in the next section (`03-interfaces-classes`).

Next, we will learn about Interfaces and Classes, which allow you to create more complex types.

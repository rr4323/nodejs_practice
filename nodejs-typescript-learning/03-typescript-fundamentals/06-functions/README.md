# 6. Functions in TypeScript

Functions are the building blocks of any application. TypeScript adds powerful type-checking capabilities to JavaScript functions, making them more robust and maintainable.

## Table of Contents
- [Function Types](#function-types)
- [Optional and Default Parameters](#optional-and-default-parameters)
- [Rest Parameters](#rest-parameters)
- [Function Overloads](#function-overloads)
- [this Context](#this-context)
- [Void vs Never](#void-vs-never)
- [Function Type Expressions](#function-type-expressions)
- [Key Takeaways](#key-takeaways)
- [Exercises](#exercises)

## Function Types

### Basic Function Types

```typescript
// Function declaration
function add(x: number, y: number): number {
  return x + y;
}

// Function expression
const multiply = function(x: number, y: number): number {
  return x * y;
};

// Arrow function
const subtract = (x: number, y: number): number => x - y;
```

### Function Type Expressions

```typescript
// Type for a function that takes two numbers and returns a number
type BinaryOperation = (a: number, b: number) => number;

const add: BinaryOperation = (x, y) => x + y;
const multiply: BinaryOperation = (x, y) => x * y;

// Using interface for function type
interface BinaryOperationInterface {
  (a: number, b: number): number;
}
```

## Optional and Default Parameters

### Optional Parameters

```typescript
function buildName(firstName: string, lastName?: string): string {
  return lastName ? `${firstName} ${lastName}` : firstName;
}

buildName('John'); // 'John'
buildName('John', 'Doe'); // 'John Doe'
```

### Default Parameters

```typescript
function createElement(
  tag: string,
  content: string = '',
  className: string = 'default'
): string {
  return `<${tag} class="${className}">${content}</${tag}>`;
}

createElement('div'); // '<div class="default"></div>'
createElement('p', 'Hello', 'text'); // '<p class="text">Hello</p>'
```

## Rest Parameters

```typescript
// Rest parameters are typed as an array
function sum(...numbers: number[]): number {
  return numbers.reduce((total, n) => total + n, 0);
}

sum(1, 2, 3); // 6
sum(1, 2, 3, 4, 5); // 15

// With other parameters
function greet(greeting: string, ...names: string[]): string {
  return `${greeting} ${names.join(', ')}!`;
}

greet('Hello', 'John', 'Jane'); // 'Hello John, Jane!'
```

## Function Overloads

TypeScript allows you to declare multiple function signatures for a single function.

```typescript
// Overload signatures
function makeDate(timestamp: number): Date;
function makeDate(year: number, month: number, day: number): Date;

// Implementation
function makeDate(timestampOrYear: number, month?: number, day?: number): Date {
  if (month !== undefined && day !== undefined) {
    return new Date(timestampOrYear, month - 1, day);
  } else {
    return new Date(timestampOrYear);
  }
}

const d1 = makeDate(12345678);
const d2 = makeDate(2023, 5, 25);
// const d3 = makeDate(2023, 5); // Error: No overload expects 2 arguments
```

## this Context

### Typing `this` in Functions

```typescript
interface Card {
  suit: string;
  card: number;
}

interface Deck {
  suits: string[];
  cards: number[];
  createCardPicker(this: Deck): () => Card;
}

let deck: Deck = {
  suits: ['hearts', 'spades', 'clubs', 'diamonds'],
  cards: Array(52),
  createCardPicker: function(this: Deck) {
    return () => {
      const pickedCard = Math.floor(Math.random() * 52);
      const pickedSuit = Math.floor(pickedCard / 13);

      return {
        suit: this.suits[pickedSuit],
        card: pickedCard % 13
      };
    };
  }
};

const cardPicker = deck.createCardPicker();
const pickedCard = cardPicker();
console.log(`card: ${pickedCard.card} of ${pickedCard.suit}`);
```

### `this` Parameters in Callbacks

```typescript
class Handler {
  info: string = 'Handler info';
  
  // Use arrow function to capture 'this' correctly
  handleClick = () => {
    console.log(this.info);
  }
  
  // Or explicitly type 'this' parameter
  handleKeyDown(this: void, e: KeyboardEvent) {
    // 'this' is void, can't use 'this' here
    console.log(e.key);
  }
}

const handler = new Handler();
document.addEventListener('click', handler.handleClick);
document.addEventListener('keydown', (e) => handler.handleKeyDown(e));
```

## Void vs Never

### Void

`void` represents the return value of functions that don't return a value.

```typescript
function logMessage(message: string): void {
  console.log(message);
  // No return statement or 'return;' is valid
}

// The inferred return type is void
const logger = (message: string) => console.log(message);
```

### Never

`never` represents the type of values that never occur.

```typescript
// Function returning never must have unreachable end point
function error(message: string): never {
  throw new Error(message);
}

// Inferred return type is never
function fail() {
  return error('Something failed');
}

// Function returning never must have unreachable end point
function infiniteLoop(): never {
  while (true) {}
}
```

## Function Type Expressions

### Call Signatures

```typescript
type DescribableFunction = {
  description: string;
  (someArg: number): boolean;
};

function doSomething(fn: DescribableFunction) {
  console.log(fn.description + ' returned ' + fn(6));
}

const myFunc: DescribableFunction = (num: number) => num > 5;
myFunc.description = 'Check if number is greater than 5';

doSomething(myFunc); // 'Check if number is greater than 5 returned true'
```

### Construct Signatures

```typescript
type SomeConstructor = {
  new (s: string): SomeObject;
};

function createInstance(ctor: SomeConstructor, s: string): SomeObject {
  return new ctor(s);
}

class SomeObject {
  constructor(public name: string) {}
}

const obj = createInstance(SomeObject, 'test');
console.log(obj.name); // 'test'
```

## Key Takeaways

1. **Function Types** can be defined using type annotations for parameters and return values.
2. **Optional and Default Parameters** make functions more flexible.
3. **Rest Parameters** allow working with an indefinite number of arguments.
4. **Function Overloads** provide multiple type signatures for a single function.
5. **`this` Context** can be explicitly typed in functions.
6. **`void` vs `never`** - `void` for functions that don't return, `never` for functions that never complete.
7. **Function Type Expressions** describe the shape of functions with call and construct signatures.

## Exercises

1. Create a function that takes a string and returns a function that adds that string as a prefix to any string passed to it.
2. Write a function that can take either a string or an array of strings and returns their combined length.
3. Create a function with multiple overloads that can format dates in different ways based on the number of arguments.
4. Implement a simple event emitter class with `on` and `emit` methods using function types.
5. Write a higher-order function that takes a function and returns a new function that logs the function call and its result.

## Next Steps

Now that you understand functions in TypeScript, you're ready to explore how to work with objects and object types in the next section.

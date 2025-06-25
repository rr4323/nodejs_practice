# 4. Type Manipulation in TypeScript

TypeScript's type system is incredibly powerful and allows for sophisticated type transformations and operations. This section covers the essential type manipulation techniques that will help you write more flexible and maintainable code.

## Table of Contents
- [Union and Intersection Types](#union-and-intersection-types)
- [Type Guards and Type Predicates](#type-guards-and-type-predicates)
- [Type Assertions](#type-assertions)
- [Type Aliases vs Interfaces](#type-aliases-vs-interfaces)
- [Key Takeaways](#key-takeaways)
- [Exercises](#exercises)

## Union and Intersection Types

### Union Types

Union types allow a value to be one of several types. Use the `|` operator to separate each type.

```typescript
// A variable can be a number or a string
type StringOrNumber = string | number;

function formatId(id: StringOrNumber) {
  // TypeScript knows id could be a string or number
  if (typeof id === 'string') {
    return id.toUpperCase();
  }
  return id.toFixed(2);
}

// Usage
console.log(formatId('abc123')); // 'ABC123'
console.log(formatId(42));      // '42.00'
```

### Intersection Types

Intersection types combine multiple types into one. Use the `&` operator to combine types.

```typescript
interface Employee {
  name: string;
  startDate: Date;
}

interface Manager {
  department: string;
  numberOfReports: number;
}

type ManagerEmployee = Employee & Manager;

const manager: ManagerEmployee = {
  name: 'Jane Smith',
  startDate: new Date('2020-01-01'),
  department: 'Engineering',
  numberOfReports: 8
};
```

## Type Guards and Type Predicates

### Type Guards

Type guards are expressions that perform a runtime check that guarantees the type in some scope.

```typescript
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
```

### Using `in` Operator

The `in` operator can be used to narrow types.

```typescript
interface Bird {
  fly(): void;
  layEggs(): void;
}

interface Fish {
  swim(): void;
  layEggs(): void;
}

function move(pet: Fish | Bird) {
  if ('swim' in pet) {
    return pet.swim();
  }
  return pet.fly();
}
```

## Type Assertions

Type assertions tell the TypeScript compiler to treat a value as a specific type.

### Angle Bracket Syntax

```typescript
let someValue: any = 'this is a string';
let strLength: number = (<string>someValue).length;
```

### As Syntax

```typescript
let someValue: any = 'this is a string';
let strLength: number = (someValue as string).length;
```

### Non-null Assertion Operator

```typescript
function liveDangerously(x?: number | null) {
  // No error
  console.log(x!.toFixed());
}
```

## Type Aliases vs Interfaces

### Type Aliases

```typescript
type Point = {
  x: number;
  y: number;
};

// Extending a type alias
type Point3D = Point & {
  z: number;
};
```

### Interfaces

```typescript
interface Point {
  x: number;
  y: number;
}

// Extending an interface
interface Point3D extends Point {
  z: number;
}
```

### Key Differences

| Feature          | Type Alias | Interface |
|-----------------|------------|-----------|
| Extending       | Uses `&`   | Uses `extends` |
| Implementing    | Can't be implemented by class | Can be implemented by class |
| Declaration merging | No | Yes |
| Primitives, unions, tuples | Yes | No |


## Key Takeaways

1. **Union Types (`|`)** allow a value to be one of several types.
2. **Intersection Types (`&`)** combine multiple types into one.
3. **Type Guards** help narrow down types within conditional blocks.
4. **Type Assertions** tell the compiler to treat a value as a specific type.
5. **Type Aliases** and **Interfaces** are similar but have key differences in usage and capabilities.

## Exercises

1. Create a function that takes a parameter that can be either a string or an array of strings. Return the length if it's a string, or the count of array elements if it's an array.

2. Create a type that represents a person with a name (string) and age (number). Then create a function that takes a person and returns a greeting string.

3. Write a type guard function that checks if a value is an object with a specific property.

4. Create a type that combines two interfaces using intersection types.

5. Write a function that uses a type assertion to convert a value to a specific type.

## Next Steps

Now that you understand type manipulation in TypeScript, you're ready to explore more advanced type features like generics and utility types in the next section.

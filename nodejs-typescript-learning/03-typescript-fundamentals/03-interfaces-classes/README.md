# 3.3. Interfaces and Classes in TypeScript

Interfaces and classes are fundamental building blocks in TypeScript that enable object-oriented programming patterns. This section dives deep into how to use them effectively.

## Table of Contents
- [Interfaces](#interfaces)
  - [Optional Properties](#optional-properties)
  - [Readonly Properties](#readonly-properties)
  - [Function Types](#function-types)
  - [Indexable Types](#indexable-types)
  - [Interface Extending Classes](#interface-extending-classes)
- [Classes](#classes)
  - [Class Properties and Methods](#class-properties-and-methods)
  - [Access Modifiers](#access-modifiers)
  - [Readonly Modifier](#readonly-modifier)
  - [Parameter Properties](#parameter-properties)
  - [Accessors (Getters/Setters)](#accessors-getterssetters)
  - [Static Properties](#static-properties)
  - [Abstract Classes](#abstract-classes)
- [Class and Interface Relationships](#class-and-interface-relationships)
  - [Implementing an Interface](#implementing-an-interface)
  - [Differences Between Classes and Interfaces](#differences-between-classes-and-interfaces)

## Interfaces

An interface defines the structure of an object, acting as a contract for what properties and methods an object must have.

### Basic Interface

```typescript
interface User {
  id: number;
  name: string;
  email: string;
  register(): string;
}

const user: User = {
  id: 1,
  name: 'John Doe',
  email: 'john@example.com',
  register() {
    return `${this.name} is now registered`;
  }
};
```

### Optional Properties

Properties can be marked as optional using `?`.

```typescript
interface Config {
  width: number;
  height: number;
  color?: string;  // Optional property
}

const config: Config = { width: 100, height: 200 };  // color is optional
```

### Readonly Properties

Properties can be marked as read-only, meaning they can only be modified when an object is first created.

```typescript
interface Point {
  readonly x: number;
  readonly y: number;
}

let p1: Point = { x: 10, y: 20 };
// p1.x = 5; // Error: Cannot assign to 'x' because it is a read-only property
```

### Function Types

Interfaces can describe function types.

```typescript
interface SearchFunc {
  (source: string, subString: string): boolean;
}

let mySearch: SearchFunc;
mySearch = function(source: string, subString: string) {
  return source.search(subString) > -1;
};
```

### Indexable Types

Interfaces can describe array or object index signatures.

```typescript
// Array-like interface
interface StringArray {
  [index: number]: string;
}

let myArray: StringArray;
myArray = ["Bob", "Fred"];
let myStr: string = myArray[0];

// Object index signature
interface Dictionary {
  [key: string]: number;
}

let scores: Dictionary = {"math": 95, "science": 89};
```

### Interface Extending Classes

Interfaces can extend classes, inheriting their members.

```typescript
class Control {
  private state: any;
}

interface SelectableControl extends Control {
  select(): void;
}

class Button extends Control implements SelectableControl {
  select() { }
}
```

## Classes

TypeScript adds type annotations and visibility modifiers to JavaScript classes.

### Class Properties and Methods

```typescript
class Person {
  // Properties
  firstName: string;
  lastName: string;
  
  // Constructor
  constructor(firstName: string, lastName: string) {
    this.firstName = firstName;
    this.lastName = lastName;
  }
  
  // Method
  getFullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}

const person = new Person('John', 'Doe');
console.log(person.getFullName()); // "John Doe"
```

### Access Modifiers

TypeScript provides three access modifiers: `public`, `private`, and `protected`.

```typescript
class Animal {
  public name: string;          // Accessible from anywhere
  private age: number;           // Accessible only within class
  protected species: string;     // Accessible within class and subclasses
  
  constructor(name: string, age: number, species: string) {
    this.name = name;
    this.age = age;
    this.species = species;
  }
  
  public getAge(): number {
    return this.age;  // Can access private member within class
  }
}

class Dog extends Animal {
  constructor(name: string, age: number) {
    super(name, age, 'Canine');
    // this.age = 5;  // Error: 'age' is private
    this.species = 'Canis lupus familiaris';  // Can access protected member
  }
}
```

### Readonly Modifier

Properties can be marked as `readonly` to prevent modification after initialization.

```typescript
class Circle {
  readonly PI = 3.14;
  readonly radius: number;
  
  constructor(radius: number) {
    this.radius = radius;
  }
  
  getArea(): number {
    // this.radius = 10; // Error: Cannot assign to 'radius' because it is a read-only property
    return this.PI * this.radius * this.radius;
  }
}
```

### Parameter Properties

Shorthand for declaring and initializing class properties.

```typescript
class Point {
  // Shorthand for declaring and initializing x and y
  constructor(public x: number, public y: number) {}
  
  distanceFromOrigin(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }
}

const point = new Point(3, 4);
console.log(point.distanceFromOrigin()); // 5
```

### Accessors (Getters/Setters)

Control access to class properties using getters and setters.

```typescript
class Employee {
  private _fullName: string = '';
  
  get fullName(): string {
    return this._fullName;
  }
  
  set fullName(newName: string) {
    if (newName.length < 3) {
      throw new Error('Name must be at least 3 characters long');
    }
    this._fullName = newName;
  }
}

const emp = new Employee();
emp.fullName = 'John Doe';  // Uses setter
console.log(emp.fullName);  // Uses getter
// emp.fullName = 'Al';     // Error: Name must be at least 3 characters long
```

### Static Properties

Properties and methods that belong to the class itself, not instances.

```typescript
class Department {
  static fiscalYear = 2023;
  private static instance: Department;
  
  private constructor(public name: string) {}
  
  static getInstance(): Department {
    if (!Department.instance) {
      Department.instance = new Department('Accounting');
    }
    return Department.instance;
  }
  
  static getFiscalYear(): number {
    return this.fiscalYear;
  }
}

const accounting = Department.getInstance();
console.log(Department.getFiscalYear()); // 2023
```

### Abstract Classes

Base classes that can't be instantiated directly, meant to be inherited.

```typescript
abstract class Animal {
  abstract makeSound(): void;  // Must be implemented by subclasses
  
  move(): void {
    console.log('Moving...');
  }
}

class Dog extends Animal {
  makeSound(): void {
    console.log('Woof! Woof!');
  }
}

// const animal = new Animal(); // Error: Cannot create an instance of an abstract class
const dog = new Dog();
dog.makeSound(); // "Woof! Woof!"
dog.move();      // "Moving..."
```

## Class and Interface Relationships

### Implementing an Interface

Classes can implement interfaces to ensure they meet a contract.

```typescript
interface ClockInterface {
  currentTime: Date;
  setTime(d: Date): void;
}

class Clock implements ClockInterface {
  currentTime: Date = new Date();
  
  setTime(d: Date) {
    this.currentTime = d;
  }
  
  constructor(h: number, m: number) {}
}
```

### Differences Between Classes and Interfaces

| Feature          | Class | Interface |
|-----------------|-------|-----------|
| Instantiation   | Can be instantiated with `new` | Cannot be instantiated |
| Implementation  | Can have implementation | No implementation, only declarations |
| Constructor     | Can have a constructor | Cannot have a constructor |
| Access Modifiers | Supports `public`, `private`, `protected` | All members are public |
| Runtime         | Exists in compiled JavaScript | Removed during compilation |
| Extending       | Can extend one class | Can extend multiple interfaces |
| Implementing    | Can implement interfaces | Can extend other interfaces |

## Best Practices

1. **Prefer interfaces for public API definitions** - They're more flexible and don't carry implementation details.
2. **Use classes when you need implementation** - For creating objects with behavior and state.
3. **Leverage access modifiers** - Use `private` and `protected` to encapsulate implementation details.
4. **Consider abstract classes** - When you want to share code between similar classes.
5. **Use readonly for immutable properties** - When a property shouldn't change after initialization.

## Exercises

1. Create an interface `Vehicle` with properties `make`, `model`, and `year`, and a method `start()`.
2. Implement a class `Car` that implements the `Vehicle` interface.
3. Create an abstract class `Shape` with an abstract method `area()` and extend it with `Circle` and `Rectangle` classes.
4. Implement a singleton pattern using a class with a private constructor and a static method to get the instance.

## Next Steps

Now that you understand interfaces and classes in TypeScript, you're ready to explore more advanced features like generics, decorators, and modules in the next sections.

## Running the Examples

I have created an `index.ts` file that combines these examples. To run it:

1.  Make sure you have a `tsconfig.json` file (a basic one is provided).
2.  Compile the code: `npx tsc`
3.  Run the compiled code: `node index.js`

---

This concludes the TypeScript fundamentals. Next, we'll apply what we've learned to **build a simple API**.

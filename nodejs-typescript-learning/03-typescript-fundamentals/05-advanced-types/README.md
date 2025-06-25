# 5. Advanced Types in TypeScript

TypeScript's type system is incredibly powerful and allows for sophisticated type transformations and operations. This section dives into advanced type features that enable you to create more flexible and reusable code.

## Practical Example: E-commerce Product Catalog

Let's explore a practical example that demonstrates many of TypeScript's advanced type features in action. We'll build a simple e-commerce product catalog system.

### Key Features Demonstrated:

- **Mapped Types** (`Readonly`, `Partial`, `Pick`, `Omit`)
- **Conditional Types**
- **Template Literal Types**
- **Intersection & Union Types**
- **Type Guards**
- **Generic Repository Pattern**

### Code Structure

1. **product.ts** - Contains all type definitions and the ProductRepository class
2. **example.ts** - Demonstrates usage of the types and repository

### Key TypeScript Concepts in Action

#### 1. Mapped Types

```typescript
type ReadonlyProduct = Readonly<Product>;
type PartialProduct = Partial<Product>;
type ProductPreview = Pick<Product, 'id' | 'name' | 'price' | 'currency' | 'category'>;
```

#### 2. Template Literal Types

```typescript
type ProductID = `prod_${string}`;
type OrderID = `order_${string}`;
```

#### 3. Intersection Types

```typescript
type DiscountedProduct = Product & Discountable;
```

#### 4. Type Guards

```typescript
function isDiscountedProduct(product: Product | DiscountedProduct): product is DiscountedProduct {
  return 'discount' in product;
}
```

#### 5. Generic Repository Interface

```typescript
interface Repository<T extends { id: string }> {
  getById(id: string): Promise<T | undefined>;
  getAll(): Promise<T[]>;
  create(item: Omit<T, 'id'>): Promise<T>;
  update(id: string, item: Partial<T>): Promise<T | undefined>;
  delete(id: string): Promise<boolean>;
}
```

### Running the Example

1. Ensure you have TypeScript installed:
   ```bash
   npm install -g typescript
   ```

2. Compile the TypeScript files:
   ```bash
   tsc
   ```
   
   This will use the `tsconfig.json` configuration and output the compiled JavaScript files to the `dist` directory.

3. Run the example:
   ```bash
   node dist/example.js
   ```

This example provides a solid foundation for understanding how to leverage TypeScript's advanced type system in real-world applications. The product catalog system demonstrates how these features can work together to create type-safe, maintainable code.

---

## Table of Contents

TypeScript's type system is incredibly powerful and allows for sophisticated type transformations and operations. This section dives into advanced type features that enable you to create more flexible and reusable code.

## Table of Contents
- [Generics](#generics)
- [Utility Types](#utility-types)
- [Mapped Types](#mapped-types)
- [Conditional Types](#conditional-types)
- [Template Literal Types](#template-literal-types)
- [Indexed Access Types](#indexed-access-types)
- [Key Takeaways](#key-takeaways)
- [Exercises](#exercises)

## Generics

Generics allow you to create reusable components that work with any type.

### Basic Generic Function

```typescript
function identity<T>(arg: T): T {
  return arg;
}

// Usage
let output1 = identity<string>('myString');
let output2 = identity<number>(100);
let output3 = identity('myString'); // Type inference
```

### Generic Interfaces

```typescript
interface GenericIdentityFn<T> {
  (arg: T): T;
}

function identity<T>(arg: T): T {
  return arg;
}

let myIdentity: GenericIdentityFn<number> = identity;
```

### Generic Classes

```typescript
class GenericNumber<T> {
  zeroValue: T;
  add: (x: T, y: T) => T;
}

let myGenericNumber = new GenericNumber<number>();
myGenericNumber.zeroValue = 0;
myGenericNumber.add = (x, y) => x + y;
```

## Utility Types

TypeScript provides several utility types to facilitate common type transformations.

### Partial<Type>

Makes all properties of a type optional.

```typescript
interface Todo {
  title: string;
  description: string;
}

function updateTodo(todo: Todo, fieldsToUpdate: Partial<Todo>) {
  return { ...todo, ...fieldsToUpdate };
}
"""This line uses the JavaScript spread syntax (...). Here's how it works:

    ...todo: It first creates a new object and copies all properties from the original todo object into it.

    ...fieldsToUpdate: Then, it copies all properties from the fieldsToUpdate object into that same new object. If any properties have the same name, the ones from fieldsToUpdate will overwrite the original ones.
"""
```

### Readonly<Type>

Makes all properties of a type read-only.

```typescript
interface Todo {
  title: string;
}

const todo: Readonly<Todo> = {
  title: 'Delete inactive users'
};

// todo.title = 'Hello'; // Error: cannot reassign a readonly property
```

### Record<Keys, Type>

Constructs an object type with specified keys and value type.

```typescript
interface PageInfo {
  title: string;
}

type Page = 'home' | 'about' | 'contact';

const nav: Record<Page, PageInfo> = {
  home: { title: 'Home' },
  about: { title: 'About' },
  contact: { title: 'Contact' }
};
```

## Mapped Types

Mapped types build on the syntax for index signatures.

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

### Common Mapped Types

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

// From T pick a set of properties K
type Pick<T, K extends keyof T> = {
  [P in K]: T[P];
};
```

## Conditional Types

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

type T0 = TypeName<string>;  // 'string'
type T1 = TypeName<'a'>;      // 'string'
type T2 = TypeName<true>;     // 'boolean'
type T3 = TypeName<() => void>; // 'function'
type T4 = TypeName<string[]>;  // 'object'
```

### Infer Keyword

```typescript
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : any;

type T0 = ReturnType<() => string>;  // string
type T1 = ReturnType<() => Promise<number>>;  // Promise<number>
```

## Template Literal Types

Template literal types build on string literal types to build new string literal types.

```typescript
type EmailLocaleIDs = 'welcome_email' | 'email_heading';
type FooterLocaleIDs = 'footer_title' | 'footer_sendoff';

type AllLocaleIDs = `${EmailLocaleIDs | FooterLocaleIDs}_id`;
// type AllLocaleIDs = 'welcome_email_id' | 'email_heading_id' | 'footer_title_id' | 'footer_sendoff_id'
```

## Indexed Access Types

You can use an indexed access type to look up a specific property on another type.

```typescript
type Person = { age: number; name: string; alive: boolean };
type Age = Person['age'];  // number

type I1 = Person['age' | 'name'];  // string | number
type I2 = Person[keyof Person];    // string | number | boolean

const MyArray = [
  { name: 'Alice', age: 15 },
  { name: 'Bob', age: 23 },
  { name: 'Eve', age: 38 }
];

type Person = typeof MyArray[number];  // { name: string; age: number; }
type Age = typeof MyArray[number]['age'];  // number
```

## Key Takeaways

1. **Generics** enable creating reusable components that work with any type.
2. **Utility Types** like `Partial`, `Readonly`, and `Record` provide common type transformations.
3. **Mapped Types** allow you to create new types based on old ones by transforming properties.
4. **Conditional Types** enable types to be selected based on other types.
5. **Template Literal Types** provide a way to build string literal types from other types.
6. **Indexed Access Types** allow you to look up specific properties of other types.

## Exercises

1. Create a generic function that takes an array of any type and returns the first element.
2. Write a mapped type that makes all properties of a type nullable.
3. Create a conditional type that extracts the return type of a function type.
4. Use template literal types to create a type that represents all possible CSS length units.
5. Write a utility type that makes all properties of a type optional and nullable.

## Next Steps

Now that you understand advanced types in TypeScript, you're ready to explore how to work with functions in a type-safe way in the next section.

# 9. Decorators in TypeScript

Decorators are a special kind of declaration that can be attached to a class declaration, method, accessor, property, or parameter. They use the form `@expression`, where `expression` must evaluate to a function that will be called at runtime with information about the decorated declaration.

## Table of Contents
- [Enabling Decorators](#enabling-decorators)
- [Class Decorators](#class-decorators)
- [Method Decorators](#method-decorators)
- [Accessor Decorators](#accessor-decorators)
- [Property Decorators](#property-decorators)
- [Parameter Decorators](#parameter-decorators)
- [Decorator Factories](#decorator-factories)
- [Decorator Composition](#decorator-composition)
- [Metadata Reflection](#metadata-reflection)
- [Key Takeaways](#key-takeaways)
- [Exercises](#exercises)

## Enabling Decorators

To use decorators, you need to enable the `experimentalDecorators` and `emitDecoratorMetadata` compiler options in your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES5",
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

## Class Decorators

A class decorator is applied to the constructor of the class and can be used to observe, modify, or replace a class definition.

```typescript
function sealed(constructor: Function) {
  Object.seal(constructor);
  Object.seal(constructor.prototype);
}

@sealed
class Greeter {
  greeting: string;
  
  constructor(message: string) {
    this.greeting = message;
  }
  
  greet() {
    return 'Hello, ' + this.greeting;
  }
}
```

### Class Decorator with Runtime Logic

```typescript
function logClass(target: any) {
  // Save a reference to the original constructor
  const original = target;
  
  // A utility function to generate instances of a class
  function construct(constructor: any, args: any[]) {
    const c: any = function (this: any) {
      return constructor.apply(this, args);
    };
    c.prototype = constructor.prototype;
    return new c();
  }
  
  // The new constructor behavior
  const f: any = function (...args: any[]) {
    console.log(`New ${original.name} was created with arguments: ${JSON.stringify(args)}`);
    return construct(original, args);
  };
  
  // Copy prototype so intanceof operator still works
  f.prototype = original.prototype;
  
  // Return new constructor (will override original)
  return f;
}

@logClass
class Person {
  constructor(public name: string, public age: number) {}
}

const person = new Person('John', 30);
// Logs: New Person was created with arguments: ["John",30]
```

## Method Decorators

A method decorator is applied to a method and can be used to observe, modify, or replace a method definition.

```typescript
function logMethod(
  target: any,
  propertyKey: string,
  descriptor: PropertyDescriptor
) {
  const originalMethod = descriptor.value;
  
  descriptor.value = function(...args: any[]) {
    console.log(`Calling ${propertyKey} with arguments: ${JSON.stringify(args)}`);
    const result = originalMethod.apply(this, args);
    console.log(`Method ${propertyKey} returned: ${JSON.stringify(result)}`);
    return result;
  };
  
  return descriptor;
}

class Calculator {
  @logMethod
  add(x: number, y: number): number {
    return x + y;
  }
}

const calc = new Calculator();
calc.add(5, 3);
// Logs:
// Calling add with arguments: [5,3]
// Method add returned: 8
```

## Accessor Decorators

An accessor decorator is applied to a property accessor and can be used to observe, modify, or replace an accessor's definitions.

```typescript
function configurable(value: boolean) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    descriptor.configurable = value;
  };
}

class Point {
  private _x: number;
  private _y: number;
  
  constructor(x: number, y: number) {
    this._x = x;
    this._y = y;
  }
  
  @configurable(false)
  get x() { return this._x; }
  
  @configurable(false)
  get y() { return this._y; }
}
```

## Property Decorators

A property decorator is applied to a property and can be used to observe that a property has been declared on a class.

```typescript
function format(formatString: string) {
  return function (target: any, propertyKey: string) {
    let value: string;
    
    const getter = function() {
      return value;
    };
    
    const setter = function(newVal: string) {
      value = formatString.replace('{}', newVal);
    };
    
    Object.defineProperty(target, propertyKey, {
      get: getter,
      set: setter,
      enumerable: true,
      configurable: true
    });
  };
}

class Greeter {
  @format('Hello, {}!')
  greeting: string;
  
  constructor(message: string) {
    this.greeting = message;
  }
  
  greet() {
    return this.greeting;
  }
}

const greeter = new Greeter('John');
console.log(greeter.greet()); // 'Hello, John!'
```

## Parameter Decorators

A parameter decorator is applied to a parameter and can be used to observe that a parameter has been declared on a method.

```typescript
function validate(
  target: any,
  propertyKey: string | symbol,
  parameterIndex: number
) {
  const existingRequiredParameters: number[] = 
    Reflect.getOwnMetadata('required', target, propertyKey) || [];
  
  existingRequiredParameters.push(parameterIndex);
  
  Reflect.defineMetadata(
    'required',
    existingRequiredParameters,
    target,
    propertyKey
  );
}

function validateMethod(
  target: any,
  propertyName: string,
  descriptor: PropertyDescriptor
) {
  const method = descriptor.value;
  
  descriptor.value = function() {
    const requiredParameters: number[] = 
      Reflect.getOwnMetadata('required', target, propertyName) || [];
    
    requiredParameters.forEach(parameterIndex => {
      if (parameterIndex >= arguments.length || arguments[parameterIndex] === undefined) {
        throw new Error(`Missing required argument at position ${parameterIndex}`);
      }
    });
    
    return method.apply(this, arguments);
  };
}

class Calculator {
  @validateMethod
  add(@validate x: number, @validate y: number): number {
    return x + y;
  }
}

const calc = new Calculator();
console.log(calc.add(5, 3)); // 8
// console.log(calc.add(5)); // Error: Missing required argument at position 1
```

## Decorator Factories

Decorator factories are functions that return decorator functions, allowing you to customize how the decorator is applied.

```typescript
function logWithPrefix(prefix: string) {
  return function(
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    
    descriptor.value = function(...args: any[]) {
      console.log(`[${prefix}] Entering ${propertyKey} with args:`, args);
      const result = originalMethod.apply(this, args);
      console.log(`[${prefix}] Exiting ${propertyKey} with result:`, result);
      return result;
    };
    
    return descriptor;
  };
}

class Calculator {
  @logWithPrefix('DEBUG')
  add(x: number, y: number): number {
    return x + y;
  }
}

const calc = new Calculator();
calc.add(2, 3);
// Logs:
// [DEBUG] Entering add with args: [2, 3]
// [DEBUG] Exiting add with result: 5
```

## Decorator Composition

Multiple decorators can be applied to a declaration, and they'll be evaluated in a specific order.

```typescript
function first() {
  console.log('first(): factory evaluated');
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    console.log('first(): called');
  };
}

function second() {
  console.log('second(): factory evaluated');
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    console.log('second(): called');
  };
}

class ExampleClass {
  @first()
  @second()
  method() {}
}

// Output:
// first(): factory evaluated
// second(): factory evaluated
// second(): called
// first(): called
```

## Metadata Reflection

With `emitDecoratorMetadata` enabled, TypeScript can emit type metadata that can be used at runtime.

```typescript
import 'reflect-metadata';

function logType(
  target: any,
  propertyKey: string
) {
  const type = Reflect.getMetadata('design:type', target, propertyKey);
  console.log(`${propertyKey} type: ${type.name}`);
  
  const paramTypes = Reflect.getMetadata('design:paramtypes', target, propertyKey);
  if (paramTypes) {
    console.log(`${propertyKey} param types: ${paramTypes.map((t: any) => t.name).join(', ')}`);
  }
  
  const returnType = Reflect.getMetadata('design:returntype', target, propertyKey);
  if (returnType) {
    console.log(`${propertyKey} return type: ${returnType.name}`);
  }
}

class Example {
  @logType
  public name: string = 'test';
  
  @logType
  public print(@logType text: string): number {
    return 42;
  }
}

// Output:
// name type: String
// print type: Function
// print param types: String
// print return type: Number
// text type: String
```

## Key Takeaways

1. **Decorators** are a powerful metaprogramming feature that allows you to add annotations and a meta-programming syntax for class declarations and members.
2. **Types of Decorators**: Class, Method, Accessor, Property, and Parameter decorators.
3. **Decorator Factories** are functions that return decorator functions, allowing for configuration.
4. **Decorator Composition** allows multiple decorators to be applied to a declaration in a specific order.
5. **Metadata Reflection** enables runtime type information to be available for decorators.
6. **Experimental Feature**: Decorators are still an experimental feature in TypeScript and may change in future versions.

## Exercises

1. Create a `@memoize` decorator that caches the results of expensive function calls.
2. Implement a `@deprecated` decorator that logs a warning when a deprecated method is called.
3. Create a `@validate` decorator that validates method arguments against a schema.
4. Implement a `@timeout` decorator that cancels a method call if it takes longer than a specified duration.
5. Create a `@log` decorator that logs method calls with their arguments and return values.

## Next Steps

Now that you understand decorators in TypeScript, you're ready to explore how to work with the TypeScript compiler and configuration in the next section.

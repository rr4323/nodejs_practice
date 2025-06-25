# 15. Advanced TypeScript Patterns

This section covers advanced design patterns and techniques in TypeScript that help build robust, maintainable, and type-safe applications.

## Table of Contents
- [Dependency Injection](#dependency-injection)
- [Factory Pattern](#factory-pattern)
- [Builder Pattern](#builder-pattern)
- [Repository Pattern](#repository-pattern)
- [Strategy Pattern](#strategy-pattern)
- [Observer Pattern](#observer-pattern)
- [Decorator Pattern](#decorator-pattern)
- [State Pattern](#state-pattern)
- [Command Pattern](#command-pattern)
- [Type-Safe Event Emitter](#type-safe-event-emitter)
- [Key Takeaways](#key-takeaways)
- [Exercises](#exercises)

## Dependency Injection

Dependency Injection (DI) is a technique where an object receives its dependencies from external sources rather than creating them itself.

### Basic DI Container

```typescript
class Container {
  private services: Map<string, any> = new Map();
  
  register<T>(name: string, creator: () => T): void {
    this.services.set(name, { creator, instance: null, isSingleton: true });
  }
  
  resolve<T>(name: string): T {
    const service = this.services.get(name);
    if (!service) throw new Error(`Service '${name}' not found`);
    
    if (service.isSingleton) {
      if (!service.instance) {
        service.instance = service.creator();
      }
      return service.instance;
    }
    
    return service.creator();
  }
}

// Usage
const container = new Container();
container.register('logger', () => ({
  log: (msg: string) => console.log(`[LOG] ${msg}`)
}));

const logger = container.resolve<{ log: (msg: string) => void }>('logger');
logger.log('Hello, DI!');
```

## Factory Pattern

The Factory Pattern provides an interface for creating objects without specifying their concrete classes.

### Basic Factory

```typescript
interface Animal {
  speak(): string;
}

class Dog implements Animal {
  speak() { return 'Woof!'; }
}

class Cat implements Animal {
  speak() { return 'Meow!'; }
}

class AnimalFactory {
  static createAnimal(type: 'dog' | 'cat'): Animal {
    switch (type) {
      case 'dog': return new Dog();
      case 'cat': return new Cat();
      default: throw new Error('Unknown animal type');
    }
  }
}

// Usage
const dog = AnimalFactory.createAnimal('dog');
console.log(dog.speak()); // Woof!
```

## Builder Pattern

The Builder Pattern separates the construction of a complex object from its representation.

### Fluent Builder

```typescript
class Pizza {
  constructor(
    public size: number,
    public cheese: boolean,
    public pepperoni: boolean,
    public bacon: boolean
  ) {}
}

class PizzaBuilder {
  private size: number = 12;
  private cheese: boolean = false;
  private pepperoni: boolean = false;
  private bacon: boolean = false;
  
  setSize(size: number): this {
    this.size = size;
    return this;
  }
  
  addCheese(): this {
    this.cheese = true;
    return this;
  }
  
  addPepperoni(): this {
    this.pepperoni = true;
    return this;
  }
  
  addBacon(): this {
    this.bacon = true;
    return this;
  }
  
  build(): Pizza {
    return new Pizza(this.size, this.cheese, this.pepperoni, this.bacon);
  }
}

// Usage
const pizza = new PizzaBuilder()
  .setSize(14)
  .addCheese()
  .addPepperoni()
  .build();
```

## Repository Pattern

The Repository Pattern abstracts the data layer, providing a collection-like interface for accessing domain objects.

```typescript
interface Repository<T, ID> {
  findById(id: ID): Promise<T | null>;
  findAll(): Promise<T[]>;
  create(entity: T): Promise<T>;
  update(id: ID, entity: Partial<T>): Promise<T | null>;
  delete(id: ID): Promise<boolean>;
}

class UserRepository implements Repository<User, string> {
  private users: Map<string, User> = new Map();
  
  async findById(id: string): Promise<User | null> {
    return this.users.get(id) || null;
  }
  
  async findAll(): Promise<User[]> {
    return Array.from(this.users.values());
  }
  
  async create(user: User): Promise<User> {
    this.users.set(user.id, user);
    return user;
  }
  
  async update(id: string, updates: Partial<User>): Promise<User | null> {
    const user = await this.findById(id);
    if (!user) return null;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  async delete(id: string): Promise<boolean> {
    return this.users.delete(id);
  }
}
```

## Strategy Pattern

The Strategy Pattern defines a family of algorithms, encapsulates each one, and makes them interchangeable.

```typescript
interface PaymentStrategy {
  pay(amount: number): void;
}

class CreditCardPayment implements PaymentStrategy {
  constructor(private cardNumber: string, private cvv: string) {}
  
  pay(amount: number): void {
    console.log(`Paying $${amount} with credit card ${this.cardNumber.substring(0, 4)}...`);
  }
}

class ShoppingCart {
  constructor(private paymentStrategy: PaymentStrategy) {}
  
  checkout(amount: number): void {
    this.paymentStrategy.pay(amount);
  }
}

// Usage
const cart = new ShoppingCart(new CreditCardPayment('1234567890123456', '123'));
cart.checkout(100);
```

## Observer Pattern

The Observer Pattern defines a one-to-many dependency between objects so that when one object changes state, all its dependents are notified.

```typescript
class Observable<T> {
  private observers: Array<(value: T) => void> = [];
  
  subscribe(observer: (value: T) => void): () => void {
    this.observers.push(observer);
    return () => {
      this.observers = this.observers.filter(obs => obs !== observer);
    };
  }
  
  notify(value: T): void {
    this.observers.forEach(observer => observer(value));
  }
}

// Usage
const observable = new Observable<number>();
const unsubscribe = observable.subscribe(value => console.log(`Received: ${value}`));
observable.notify(42); // Logs: Received: 42
unsubscribe();
```

## Decorator Pattern

The Decorator Pattern attaches additional responsibilities to an object dynamically.

### Method Decorator

```typescript
function log(target: any, key: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;
  
  descriptor.value = function(...args: any[]) {
    console.log(`Calling ${key} with args:`, args);
    const result = originalMethod.apply(this, args);
    console.log(`Method ${key} returned:`, result);
    return result;
  };
  
  return descriptor;
}

class Calculator {
  @log
  add(a: number, b: number): number {
    return a + b;
  }
}

// Usage
const calc = new Calculator();
calc.add(2, 3);
// Logs:
// Calling add with args: [2, 3]
// Method add returned: 5
```

## State Pattern

The State Pattern allows an object to alter its behavior when its internal state changes.

```typescript
interface State {
  handle(context: Context): void;
}

class Context {
  private state: State;
  
  constructor(state: State) {
    this.transitionTo(state);
  }
  
  transitionTo(state: State): void {
    console.log(`Context: Transition to ${state.constructor.name}`);
    this.state = state;
    this.state.handle(this);
  }
  
  request1(): void {
    this.state.handle(this);
  }
}

class ConcreteStateA implements State {
  handle(context: Context): void {
    console.log('ConcreteStateA handles request1');
    console.log('ConcreteStateA wants to change the state of the context');
    context.transitionTo(new ConcreteStateB());
  }
}

class ConcreteStateB implements State {
  handle(context: Context): void {
    console.log('ConcreteStateB handles request1');
    console.log('ConcreteStateB wants to change the state of the context');
    context.transitionTo(new ConcreteStateA());
  }
}

// Usage
const context = new Context(new ConcreteStateA());
context.request1();
```

## Command Pattern

The Command Pattern encapsulates a request as an object, thereby allowing for parameterization of clients with different requests, queue or log requests, and support undoable operations.

```typescript
interface Command {
  execute(): void;
  undo(): void;
}

class Light {
  on(): void { console.log('Light is on'); }
  off(): void { console.log('Light is off'); }
}

class LightOnCommand implements Command {
  constructor(private light: Light) {}
  
  execute(): void { this.light.on(); }
  undo(): void { this.light.off(); }
}

class RemoteControl {
  private command: Command | null = null;
  
  setCommand(command: Command): void {
    this.command = command;
  }
  
  pressButton(): void {
    if (this.command) this.command.execute();
  }
  
  pressUndo(): void {
    if (this.command) this.command.undo();
  }
}

// Usage
const light = new Light();
const lightOn = new LightOnCommand(light);

const remote = new RemoteControl();
remote.setCommand(lightOn);

remote.pressButton();   // Light is on
remote.pressUndo();     // Light is off
```

## Type-Safe Event Emitter

A type-safe event emitter that ensures type safety for event names and their payloads.

```typescript
type EventMap = {
  login: { userId: string; name: string };
  logout: { userId: string };
  message: { from: string; to: string; text: string };
};

class TypedEventEmitter<T extends Record<string, any>> {
  private listeners: {
    [K in keyof T]?: Array<(payload: T[K]) => void>;
  } = {};

  on<K extends keyof T>(event: K, listener: (payload: T[K]) => void): () => void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event]!.push(listener);
    
    return () => {
      this.off(event, listener);
    };
  }

  off<K extends keyof T>(event: K, listener: (payload: T[K]) => void): void {
    if (!this.listeners[event]) return;
    
    const index = this.listeners[event]!.indexOf(listener);
    if (index > -1) {
      this.listeners[event]!.splice(index, 1);
    }
  }

  emit<K extends keyof T>(event: K, payload: T[K]): void {
    if (!this.listeners[event]) return;
    
    for (const listener of this.listeners[event]!) {
      listener(payload);
    }
  }
}

// Usage
const emitter = new TypedEventEmitter<EventMap>();

emitter.on('login', ({ userId, name }) => {
  console.log(`User ${name} (${userId}) logged in`);
});

emitter.emit('login', { userId: '123', name: 'John' });
// Logs: User John (123) logged in
```

## Asynchronous Patterns

TypeScript provides powerful tools for working with asynchronous code. Here are some advanced patterns and techniques.

### Promises and Async/Await

```typescript
// Basic async/await
async function fetchData(url: string): Promise<Response> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
}

// Parallel execution with Promise.all
async function fetchMultiple(urls: string[]): Promise<any[]> {
  const promises = urls.map(url => fetchData(url));
  return Promise.all(promises);
}

// Race conditions with Promise.race
async function timeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms);
  });
  return Promise.race([promise, timeoutPromise]);
}
```

### Promise Utility Types

TypeScript provides utility types for working with Promises:

```typescript
type Awaited<T> = T extends PromiseLike<infer U> ? U : T;

// Example usage
async function getUser(id: number): Promise<{ id: number; name: string }> {
  return { id, name: 'John Doe' };
}

type User = Awaited<ReturnType<typeof getUser>>; // { id: number; name: string }

// For arrays of promises
type PromiseArray<T> = Promise<PromiseSettledResult<Awaited<T>>[]>;
```

### Async Iterators and Generators

Async generators are perfect for handling streams of data:

```typescript
// Async generator example
async function* asyncCounter(limit: number): AsyncGenerator<number> {
  for (let i = 1; i <= limit; i++) {
    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 1000));
    yield i;
  }
}

// Using for-await-of with async iterators
async function processCounter() {
  for await (const count of asyncCounter(5)) {
    console.log(`Count: ${count}`);
  }
}
```

### Advanced Async Patterns

#### Retry Pattern

```typescript
async function retry<T>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 1000
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries <= 0) throw error;
    await new Promise(resolve => setTimeout(resolve, delay));
    return retry(fn, retries - 1, delay * 2);
  }
}
```

#### Throttling and Debouncing

```typescript
// Debounce function
function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  
  return function(this: any, ...args: Parameters<T>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), delay);
  };
}

// Throttle function
function throttle<T extends (...args: any[]) => any>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  
  return function(this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      fn.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}
```

#### Async Queue

```typescript
class AsyncQueue<T> {
  private queue: (() => Promise<void>)[] = [];
  private isProcessing = false;

  async enqueue(task: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await task();
          resolve(result);
        } catch (error) {
          reject(error);
        } finally {
          this.processNext();
        }
      });

      if (!this.isProcessing) {
        this.processNext();
      }
    });
  }

  private processNext(): void {
    if (this.queue.length === 0) {
      this.isProcessing = false;
      return;
    }

    this.isProcessing = true;
    const task = this.queue.shift()!;
    task();
  }
}

// Usage
const queue = new AsyncQueue();
queue.enqueue(() => fetchData('https://api.example.com/data/1'));
queue.enqueue(() => fetchData('https://api.example.com/data/2'));
```

## Key Takeaways

1. **Dependency Injection** promotes loose coupling and testability by injecting dependencies rather than hard-coding them.
2. **Factory Pattern** provides a way to create objects without specifying their exact class.
3. **Builder Pattern** separates the construction of complex objects from their representation.
4. **Repository Pattern** abstracts data access, making your application more maintainable and testable.
5. **Strategy Pattern** defines a family of algorithms and makes them interchangeable.
6. **Observer Pattern** establishes a one-to-many dependency between objects.
7. **Decorator Pattern** adds behavior to objects dynamically.
8. **State Pattern** allows an object to change its behavior when its internal state changes.
9. **Command Pattern** encapsulates a request as an object.
10. **Type Safety** is crucial for maintaining large codebases and catching errors at compile time.

## Exercises

1. **DI Container**: Extend the DI container to support transient and scoped lifetimes.
2. **Builder Pattern**: Create a fluent builder for a complex object like a computer with components.
3. **Repository Pattern**: Implement a repository that works with a real database.
4. **Observer Pattern**: Create a simple event bus that supports multiple event types.
5. **Decorator Pattern**: Implement a caching decorator that caches the results of expensive function calls.
6. **State Pattern**: Implement a vending machine with different states.
7. **Command Pattern**: Add undo/redo functionality to a text editor.
8. **Type-Safe Event Emitter**: Add support for wildcard events.

These patterns will help you write more maintainable, testable, and scalable TypeScript applications. Practice implementing them in your projects to become more proficient.

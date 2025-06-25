/**
 * Advanced Type Guards in TypeScript
 * 
 * This file demonstrates various advanced type guard patterns and techniques
 * for narrowing types in TypeScript.
 */

// ==================== Basic Type Guards ====================

// 1. typeof type guards
function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value);
}

function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

function isFunction(value: unknown): value is Function {
  return typeof value === 'function';
}

// 2. instanceof type guards
class User {
  constructor(public id: number, public name: string) {}
}

class Admin extends User {
  constructor(id: number, name: string, public permissions: string[]) {
    super(id, name);
  }
}

function isUser(value: unknown): value is User {
  return value instanceof User;
}

function isAdmin(value: unknown): value is Admin {
  return value instanceof Admin;
}

// ==================== Discriminated Unions ====================


// 3. Discriminated union type
interface Success<T> {
  type: 'success';
  data: T;
  timestamp: Date;
}

interface Error {
  type: 'error';
  message: string;
  code: number;
}

type Result<T> = Success<T> | Error;

function isSuccess<T>(result: Result<T>): result is Success<T> {
  return result.type === 'success';
}

function isError<T>(result: Result<T>): result is Error {
  return result.type === 'error';
}

// 4. Type predicate with type parameter
function isType<T>(
  value: unknown,
  check: (val: unknown) => boolean
): value is T {
  return check(value);
}

// ==================== Property Checks ====================


// 5. Check for property existence
function hasProperty<T extends object, K extends string>(
  obj: T,
  key: K
): obj is T & { [P in K]: unknown } {
  return key in obj;
}

// 6. Check for property with type
function hasPropertyOfType<T, K extends string, V>(
  obj: T,
  key: K,
  typeGuard: (value: unknown) => value is V
): obj is T & { [P in K]: V } {
  return key in obj && typeGuard((obj as any)[key]);
}

// 7. Check if all properties are non-null
type NonNullableProperties<T> = { [K in keyof T]: NonNullable<T[K]> };

function hasNoNullProperties<T extends object>(
  obj: T
): obj is NonNullableProperties<T> {
  return Object.values(obj).every(value => value != null);
}

// ==================== Array Type Guards ====================

// 8. Check if all array elements are of a specific type
function isArrayOf<T>(
  arr: unknown[], 
  guard: (value: unknown) => value is T
): arr is T[] {
  return Array.isArray(arr) && arr.every(guard);
}

// 9. Type guard for tuples
function isTuple<T extends any[]>(
  value: unknown[],
  ...guards: { [K in keyof T]: (val: unknown) => val is T[K] }
): value is T {
  if (!Array.isArray(value) || value.length !== guards.length) {
    return false;
  }
  return guards.every((guard, index) => guard(value[index]));
}

// ==================== Complex Type Guards ====================

// 10. Type guard for objects with specific shape
interface HasId {
  id: string | number;
  [key: string]: unknown;
}

function hasId(value: unknown): value is HasId {
  return (
    typeof value === 'object' && 
    value !== null && 
    ('id' in value) && 
    (typeof (value as any).id === 'string' || typeof (value as any).id === 'number')
  );
}

// 11. Type guard for indexable types
interface StringDictionary {
  [key: string]: unknown;
}

function isStringDictionary(value: unknown): value is StringDictionary {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    Object.getOwnPropertySymbols(value).length === 0
  );
}

// 12. Type guard for branded/nominal types
type Brand<T, B> = T & { readonly __brand: B };

type UserId = Brand<number, 'UserId'>;

type Email = Brand<string, 'Email'>;

function isEmail(value: string): value is Email {
  // Simple email regex for demonstration
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value);
}

// ==================== Example Usage ====================

function processResult<T>(result: Result<T>): void {
  if (isSuccess(result)) {
    console.log('Success:', result.data);
  } else {
    console.error('Error:', result.message);
  }
}

function processUserData(data: unknown): void {
  if (isType<User>(data, (d): d is User => 
    d !== null && 
    typeof d === 'object' && 
    'id' in d && 
    'name' in d
  )) {
    console.log(`Processing user: ${data.name} (ID: ${data.id})`);
    
    if (isAdmin(data)) {
      console.log('Admin permissions:', data.permissions.join(', '));
    }
  } else {
    throw new Error('Invalid user data');
  }
}

function validateConfig(config: unknown): { dbUrl: string; port: number } {
  if (
    isType<{ dbUrl: unknown; port: unknown }>(
      config,
      (c): c is { dbUrl: unknown; port: unknown } =>
        typeof c === 'object' && c !== null && 'dbUrl' in c && 'port' in c
    ) &&
    typeof config.dbUrl === 'string' &&
    typeof config.port === 'number'
  ) {
    return { dbUrl: config.dbUrl, port: config.port };
  }
  throw new Error('Invalid config');
}

// ==================== Type Assertion Functions ====================

/**
 * Asserts that a value is not null or undefined
 * @throws {Error} If the value is null or undefined
 */
function assertIsDefined<T>(value: T): asserts value is NonNullable<T> {
  if (value === null || value === undefined) {
    throw new Error(`Expected value to be defined, but received ${value}`);
  }
}

/**
 * Asserts that a condition is true
 * @throws {Error} If the condition is false
 */
function assert(condition: unknown, message?: string): asserts condition {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

// ==================== Example of Type Assertion Usage ====================
function processValue(value: string | null): string {
  assertIsDefined(value);
  // TypeScript now knows value is string
  return value.toUpperCase();
}

// ==================== Type Guard Composition ====================

// 13. Combine multiple type guards
function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0;
}

function isPositiveNumber(value: unknown): value is number {
  return isNumber(value) && value > 0;
}

// Combine guards with logical AND
function isValidUserInput(value: unknown): value is { name: string; age: number } {
  return (
    typeof value === 'object' &&
    value !== null &&
    'name' in value &&
    'age' in value &&
    isNonEmptyString((value as any).name) &&
    isPositiveNumber((value as any).age)
  );
}

// ==================== Export All Type Guards ====================
export {
  // Basic
  isString,
  isNumber,
  isBoolean,
  isFunction,
  
  // Class
  isUser,
  isAdmin,
  
  // Discriminated Unions
  isSuccess,
  isError,
  
  // Property Checks
  hasProperty,
  hasPropertyOfType,
  hasNoNullProperties,
  
  // Arrays
  isArrayOf,
  isTuple,
  
  // Complex
  hasId,
  isStringDictionary,
  isEmail,
  
  // Assertions
  assertIsDefined,
  assert,
  
  // Composition
  isNonEmptyString,
  isPositiveNumber,
  isValidUserInput,
  
  // Types
  type Result,
  type Success,
  type Error as ErrorResult,
  type HasId,
  type StringDictionary,
  type Brand,
  type UserId,
  type Email,
  User,
  Admin
};

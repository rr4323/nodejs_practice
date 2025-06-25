/**
 * Advanced TypeScript Decorators
 * 
 * This file demonstrates various advanced decorator patterns in TypeScript
 * including class, method, property, and parameter decorators with metadata.
 * 
 * Enable these settings in tsconfig.json:
 * {
 *   "compilerOptions": {
 *     "experimentalDecorators": true,
 *     "emitDecoratorMetadata": true,
 *     "strictPropertyInitialization": false
 *   }
 * }
 */

import 'reflect-metadata';

// ==================== Utility Types ====================

type Constructor<T = any> = new (...args: any[]) => T;
type AbstractConstructor<T = any> = abstract new (...args: any[]) => T;
type ClassDecorator<T extends Function> = (target: T) => T | void;
type MethodDecoratorType<T> = (
  target: Object,
  propertyKey: string | symbol,
  descriptor: TypedPropertyDescriptor<T>
) => TypedPropertyDescriptor<T> | void;

// ==================== Metadata Keys ====================

const METADATA_KEYS = {
  PARAM_TYPES: 'design:paramtypes',
  RETURN_TYPE: 'design:returntype',
  TYPE: 'design:type',
  CUSTOM: 'custom:metadata'
} as const;

// ==================== Class Decorators ====================


/**
 * Singleton decorator - ensures only one instance of the class exists
 */
export function Singleton<T extends Constructor>(): ClassDecorator<T> {
  return (target: T) => {
    const instances = new Map<string, any>();
    
    return class extends target {
      constructor(...args: any[]) {
        const className = target.name;
        if (instances.has(className)) {
          return instances.get(className);
        }
        
        super(...args);
        instances.set(className, this);
      }
    };
  };
}

/**
 * Logs class instantiation and method calls
 */
export function Loggable<T extends Constructor>(): ClassDecorator<T> {
  return (target: T) => {
    return class extends target {
      constructor(...args: any[]) {
        super(...args);
        console.log(`[${new Date().toISOString()}] Instance of ${target.name} created`);
      }
    };
  };
}

// ==================== Method Decorators ====================

/**
 * Memoizes method results based on arguments
 * @param ttl Time to live in milliseconds
 */
export function Memoize(ttl: number = 0): MethodDecorator {
  const cache = new Map<string, { value: any; expiresAt: number }>();
  
  return function (
    target: Object,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    
    descriptor.value = function (...args: any[]) {
      const cacheKey = `${String(propertyKey)}_${JSON.stringify(args)}`;
      const cached = cache.get(cacheKey);
      
      if (cached && (ttl === 0 || Date.now() < cached.expiresAt)) {
        console.log(`[Memoize] Cache hit for ${String(propertyKey)}`);
        return cached.value;
      }
      
      console.log(`[Memoize] Cache miss for ${String(propertyKey)}`);
      const result = originalMethod.apply(this, args);
      
      cache.set(cacheKey, {
        value: result,
        expiresAt: ttl > 0 ? Date.now() + ttl : Number.MAX_SAFE_INTEGER
      });
      
      return result;
    };
    
    return descriptor;
  };
}

/**
 * Measures and logs method execution time
 */
export function Measure(): MethodDecorator {
  return function (
    target: Object,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      const start = performance.now();
      const result = await originalMethod.apply(this, args);
      const end = performance.now();
      
      console.log(`[${target.constructor.name}.${String(propertyKey)}] took ${(end - start).toFixed(2)}ms`);
      return result;
    };
    
    return descriptor;
  };
}

/**
 * Retries a failed method call
 * @param maxRetries Maximum number of retry attempts
 * @param delay Delay between retries in milliseconds
 */
export function Retry(maxRetries: number = 3, delay: number = 1000): MethodDecorator {
  return function (
    target: Object,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      let lastError: Error | null = null;
      
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          return await originalMethod.apply(this, args);
        } catch (error) {
          lastError = error as Error;
          if (attempt < maxRetries) {
            console.warn(`[Retry] Attempt ${attempt} failed for ${String(propertyKey)}, retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
      }
      
      throw new Error(`[Retry] All ${maxRetries} attempts failed for ${String(propertyKey)}: ${lastError?.message}`);
    };
    
    return descriptor;
  };
}

// ==================== Property Decorators ====================

/**
 * Marks a property as required (throws if undefined)
 */
export function Required(): PropertyDecorator {
  return function (target: Object, propertyKey: string | symbol) {
    const properties: string[] = Reflect.getOwnMetadata('required:properties', target) || [];
    if (!properties.includes(propertyKey as string)) {
      properties.push(propertyKey as string);
      Reflect.defineMetadata('required:properties', properties, target);
    }
  };
}

/**
 * Validates property values against a validator function
 * @param validator Function that validates the property value
 */
export function Validate<T>(
  validator: (value: T) => boolean | Promise<boolean>,
  errorMessage: string = 'Validation failed'
): PropertyDecorator {
  return function (target: Object, propertyKey: string | symbol) {
    const key = Symbol(String(propertyKey));
    
    // Store the original value in a symbol-keyed property
    Object.defineProperty(target, propertyKey, {
      get() {
        return this[key];
      },
      set(value: T) {
        const isValid = validator(value);
        if (isValid instanceof Promise) {
          isValid.then(valid => {
            if (!valid) throw new Error(`[Validate] ${errorMessage}`);
            this[key] = value;
          });
        } else if (!isValid) {
          throw new Error(`[Validate] ${errorMessage}`);
        } else {
          this[key] = value;
        }
      },
      enumerable: true,
      configurable: true
    });
  };
}

// ==================== Parameter Decorators ====================

/**
 * Validates method parameters
 * @param validator Function that validates the parameter value
 */
export function ValidateParam<T>(
  validator: (value: T) => boolean,
  paramIndex: number = 0
): ParameterDecorator {
  return function (target: Object, propertyKey: string | symbol, parameterIndex: number) {
    const existingValidators: Array<{ index: number; validator: (value: any) => boolean }> = 
      Reflect.getOwnMetadata('parameter:validators', target, propertyKey) || [];
    
    existingValidators.push({
      index: parameterIndex,
      validator: (value: T) => {
        const isValid = validator(value);
        if (!isValid) {
          throw new Error(`Parameter at index ${parameterIndex} failed validation`);
        }
        return true;
      }
    });
    
    Reflect.defineMetadata('parameter:validators', existingValidators, target, propertyKey);
  };
}

// ==================== Method Decorator Factories ====================

/**
 * Creates a method decorator that checks user roles
 * @param allowedRoles Array of allowed roles
 */
export function RoleGuard(allowedRoles: string[]): MethodDecorator {
  return function (
    target: Object,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    
    descriptor.value = function (this: any, ...args: any[]) {
      // In a real app, get user roles from a request context or auth service
      const userRoles = this.userRoles || [];
      
      const hasPermission = allowedRoles.some(role => 
        userRoles.includes(role)
      );
      
      if (!hasPermission) {
        throw new Error(`Insufficient permissions to access ${String(propertyKey)}`);
      }
      
      return originalMethod.apply(this, args);
    };
    
    return descriptor;
  };
}

/**
 * Rate limits method calls
 * @param limit Maximum number of calls
 * @param timeWindow Time window in milliseconds
 */
export function RateLimit(limit: number, timeWindow: number): MethodDecorator {
  const calls = new Map<string, number[]>();
  
  return function (
    target: Object,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    
    descriptor.value = function (...args: any[]) {
      const now = Date.now();
      const key = `${target.constructor.name}_${String(propertyKey)}`;
      
      // Clean up old timestamps
      const timestamps = (calls.get(key) || []).filter(timestamp => 
        now - timestamp < timeWindow
      );
      
      if (timestamps.length >= limit) {
        throw new Error(
          `Rate limit exceeded: ${limit} requests per ${timeWindow}ms`
        );
      }
      
      timestamps.push(now);
      calls.set(key, timestamps);
      
      return originalMethod.apply(this, args);
    };
    
    return descriptor;
  };
}

// ==================== Class Decorator with Metadata ====================

interface ControllerOptions {
  path: string;
  version?: string;
  middleware?: any[];
}

/**
 * Decorator for API controllers
 */
export function Controller(options: ControllerOptions): ClassDecorator {
  return function (target: Function) {
    Reflect.defineMetadata('controller:config', options, target);
    
    // Initialize routes array if it doesn't exist
    if (!Reflect.hasMetadata('routes', target)) {
      Reflect.defineMetadata('routes', [], target);
    }
  };
}

// ==================== Example Usage ====================

if (require.main === module) {
  // Example: Using multiple decorators
  @Loggable()
  @Singleton()
  class ExampleService {
    @Required()
    @Validate((value: string) => value.length > 0, 'Name cannot be empty')
    name!: string;
    
    private userRoles: string[] = ['admin'];
    
    constructor(name: string) {
      this.name = name;
    }
    
    @Measure()
    @Memoize(5000) // Cache for 5 seconds
    @Retry(3, 1000)
    async fetchData(id: number): Promise<string> {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 100));
      return `Data for id ${id}`;
    }
    
    @RoleGuard(['admin'])
    deleteResource(id: string): boolean {
      console.log(`Deleting resource ${id}`);
      return true;
    }
    
    @RateLimit(5, 10000) // 5 requests per 10 seconds
    limitedMethod(): string {
      return 'This method is rate limited';
    }
  }
  
  // Example: Using the decorated class
  async function runExample() {
    try {
      const service1 = new ExampleService('Service 1');
      const service2 = new ExampleService('Service 2'); // Will return the same instance
      
      console.log(service1 === service2); // true (Singleton)
      
      // Test memoization
      console.log(await service1.fetchData(1)); // Cache miss
      console.log(await service1.fetchData(1)); // Cache hit
      
      // Test role guard
      service1.deleteResource('123'); // Works (has admin role)
      
      // Test rate limiting
      for (let i = 0; i < 6; i++) {
        try {
          console.log(service1.limitedMethod());
        } catch (error) {
          console.error(error.message);
        }
      }
      
    } catch (error) {
      console.error('Error:', error);
    }
  }
  
  runExample();
}

// ==================== Export All Decorators ====================
export {
  // Class Decorators
  Singleton,
  Loggable,
  
  // Method Decorators
  Memoize,
  Measure,
  Retry,
  RoleGuard,
  RateLimit,
  
  // Property Decorators
  Required,
  Validate,
  
  // Parameter Decorators
  ValidateParam,
  
  // Controller Decorator
  Controller,
  
  // Types
  type ControllerOptions,
  type Constructor,
  type MethodDecoratorType
};

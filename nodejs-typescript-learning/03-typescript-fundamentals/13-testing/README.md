# 13. Testing in TypeScript

This section covers testing strategies and tools for TypeScript projects, including unit testing, integration testing, and end-to-end testing.

## Table of Contents
- [Testing Frameworks](#testing-frameworks)
- [Test Runners](#test-runners)
- [Assertion Libraries](#assertion-libraries)
- [Mocking](#mocking)
- [Test Coverage](#test-coverage)
- [E2E Testing](#e2e-testing)
- [Performance Testing](#performance-testing)
- [Testing Best Practices](#testing-best-practices)
- [Key Takeaways](#key-takeaways)
- [Exercises](#exercises)

## Testing Frameworks

### Jest

Jest is a popular testing framework with TypeScript support out of the box.

#### Setup

```bash
npm install --save-dev jest @types/jest ts-jest ts-node
```

#### jest.config.js

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  moduleNameMapper: {
    '^@app/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!**/node_modules/**'],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov'],
};
```

#### Example Test

```typescript
// src/utils/math.ts
export function add(a: number, b: number): number {
  return a + b;
}

// src/__tests__/math.test.ts
import { add } from '../utils/math';

describe('math module', () => {
  describe('add', () => {
    it('adds two numbers', () => {
      expect(add(1, 2)).toBe(3);
    });

    it('handles negative numbers', () => {
      expect(add(-1, -2)).toBe(-3);
    });
  });
});
```

### Mocha with Chai

Mocha is a flexible testing framework that can be paired with assertion libraries like Chai.

#### Setup

```bash
npm install --save-dev mocha chai @types/mocha @types/chai ts-node
```

#### .mocharc.json

```json
{
  "extension": ["ts"],
  "spec": "src/**/*.test.ts",
  "require": "ts-node/register"
}
```

#### Example Test

```typescript
// src/utils/string-utils.test.ts
import { expect } from 'chai';
import { reverse } from '../utils/string-utils';

describe('string-utils', () => {
  describe('reverse', () => {
    it('should reverse a string', () => {
      expect(reverse('hello')).to.equal('olleh');
    });
    
    it('should handle empty strings', () => {
      expect(reverse('')).to.equal('');
    });
  });
});
```

## Test Runners

### ts-node

Run TypeScript tests directly with ts-node:

```bash
npx ts-node node_modules/.bin/mocha
```

### Nodemon for Development

Watch for changes and rerun tests:

```bash
npm install --save-dev nodemon
```

#### package.json

```json
{
  "scripts": {
    "test": "mocha",
    "test:watch": "nodemon --ext ts --exec \"npm test\""
  }
}
```

## Assertion Libraries

### Chai

Chai provides several assertion styles:

```typescript
import { expect } from 'chai';

describe('Chai Assertions', () => {
  it('should demonstrate different assertion styles', () => {
    const value = 'hello';
    const obj = { a: 1, b: 2 };
    const arr = [1, 2, 3];
    
    // BDD style
    expect(value).to.be.a('string');
    expect(value).to.equal('hello');
    expect(value).to.have.lengthOf(5);
    expect(obj).to.have.property('a').that.equals(1);
    expect(arr).to.include(2);
    
    // Classic style
    assert.typeOf(value, 'string');
    assert.equal(value, 'hello');
    assert.lengthOf(arr, 3);
    assert.property(obj, 'a');
    assert.include(arr, 2);
  });
});
```

### Jest Matchers

Jest comes with its own set of matchers:

```typescript
describe('Jest Matchers', () => {
  it('should demonstrate different matchers', () => {
    const value = 'hello';
    const obj = { a: 1, b: 2 };
    const arr = [1, 2, 3];
    
    expect(value).toBe('hello');
    expect(value).toEqual('hello');
    expect(value).toHaveLength(5);
    expect(obj).toHaveProperty('a', 1);
    expect(arr).toContain(2);
    expect(value).not.toBe('world');
    
    // For async code
    return expect(Promise.resolve('result')).resolves.toBe('result');
  });
});
```

## Mocking

### Jest Mocks

```typescript
// src/services/api.ts
export class ApiService {
  async fetchData(): Promise<any> {
    // Actual implementation
  }
}

// src/__tests__/api.test.ts
import { ApiService } from '../services/api';

jest.mock('../services/api');

describe('ApiService', () => {
  let apiService: jest.Mocked<ApiService>;
  
  beforeEach(() => {
    apiService = new ApiService() as jest.Mocked<ApiService>;
    apiService.fetchData = jest.fn().mockResolvedValue({ data: 'mocked data' });
  });
  
  it('should fetch data', async () => {
    const result = await apiService.fetchData();
    expect(apiService.fetchData).toHaveBeenCalled();
    expect(result).toEqual({ data: 'mocked data' });
  });
});
```

### Sinon.js

```typescript
import * as sinon from 'sinon';
import { expect } from 'chai';
import { UserService } from '../services/user-service';

describe('UserService', () => {
  let userService: UserService;
  let fetchStub: sinon.SinonStub;
  
  beforeEach(() => {
    userService = new UserService();
    fetchStub = sinon.stub(global, 'fetch');
  });
  
  afterEach(() => {
    fetchStub.restore();
  });
  
  it('should fetch user data', async () => {
    const mockUser = { id: 1, name: 'John Doe' };
    fetchStub.resolves({
      ok: true,
      json: () => Promise.resolve(mockUser),
    });
    
    const user = await userService.getUser(1);
    expect(user).to.deep.equal(mockUser);
    expect(fetchStub.calledWith('https://api.example.com/users/1')).to.be.true;
  });
});
```

## Test Coverage

### Jest Coverage

```json
{
  "scripts": {
    "test:coverage": "jest --coverage"
  }
}
```

### NYC (Istanbul)

```bash
npm install --save-dev nyc
```

```json
{
  "scripts": {
    "test:coverage": "nyc --reporter=text mocha"
  },
  "nyc": {
    "extension": [
      ".ts",
      ".tsx"
    ],
    "exclude": [
      "**/*.d.ts",
      "**/*.test.ts"
    ],
    "reporter": [
      "text",
      "html",
      "lcov"
    ]
  }
}
```

## E2E Testing

### Cypress

```bash
npm install --save-dev cypress @cypress/webpack-preprocessor
```

#### cypress/plugins/index.js

```javascript
const webpackPreprocessor = require('@cypress/webpack-preprocessor');

module.exports = (on) => {
  const options = {
    webpackOptions: require('../../webpack.config'),
    watchOptions: {},
  };
  on('file:preprocessor', webpackPreprocessor(options));
};
```

#### Example Test

```typescript
// cypress/integration/app.spec.ts
describe('App', () => {
  it('should load the home page', () => {
    cy.visit('/');
    cy.contains('Welcome to My App');
  });
  
  it('should navigate to about page', () => {
    cy.visit('/');
    cy.get('a[href="/about"]').click();
    cy.url().should('include', '/about');
    cy.contains('About Us');
  });
});
```

## Performance Testing

### Benchmark.js

```bash
npm install --save-dev benchmark @types/benchmark
```

#### Example Benchmark

```typescript
// benchmarks/string-reverse.bench.ts
import * as Benchmark from 'benchmark';
import { reverseString } from '../src/utils/string-utils';

const suite = new Benchmark.Suite();
const testString = 'Hello, World!';

suite
  .add('String#split-reverse-join', () => {
    testString.split('').reverse().join('');
  })
  .add('for loop', () => {
    let result = '';
    for (let i = testString.length - 1; i >= 0; i--) {
      result += testString[i];
    }
    return result;
  })
  .add('custom reverseString', () => {
    reverseString(testString);
  })
  .on('cycle', (event: any) => {
    console.log(String(event.target));
  })
  .on('complete', function (this: any) {
    console.log('Fastest is ' + this.filter('fastest').map('name'));
  })
  .run({ async: true });
```

## Testing Best Practices

### 1. Follow the AAA Pattern

```typescript
describe('Calculator', () => {
  it('should add two numbers', () => {
    // Arrange
    const a = 5;
    const b = 3;
    const expected = 8;
    
    // Act
    const result = add(a, b);
    
    // Assert
    expect(result).toBe(expected);
  });
});
```

### 2. Test One Thing per Test

```typescript
// Bad
it('should validate and process user input', () => {
  // Too many assertions for one test
});

// Good
describe('UserInput', () => {
  it('should validate email format', () => {
    // Test email validation only
  });
  
  it('should process valid input', () => {
    // Test processing logic only
  });
});
```

### 3. Use Descriptive Test Names

```typescript
// Bad
it('works', () => {});
it('test1', () => {});

// Good
it('should return null when input is empty', () => {});
it('should throw an error when network request fails', () => {});
```

### 4. Test Edge Cases

```typescript
describe('divide', () => {
  it('should divide two numbers', () => {
    expect(divide(10, 2)).toBe(5);
  });
  
  it('should throw when dividing by zero', () => {
    expect(() => divide(10, 0)).toThrow('Division by zero');
  });
  
  it('should handle negative numbers', () => {
    expect(divide(-10, 2)).toBe(-5);
  });
});
```

### 5. Use Mocks and Stubs for External Dependencies

```typescript
// Bad - hits actual API
describe('UserService', () => {
  it('should fetch user data', async () => {
    const user = await userService.getUser(1);
    expect(user).toBeDefined();
  });
});

// Good - mocks API call
describe('UserService', () => {
  it('should fetch user data', async () => {
    const mockUser = { id: 1, name: 'Test User' };
    jest.spyOn(api, 'get').mockResolvedValue(mockUser);
    
    const user = await userService.getUser(1);
    
    expect(api.get).toHaveBeenCalledWith('/users/1');
    expect(user).toEqual(mockUser);
  });
});
```

## Key Takeaways

1. **Choose the Right Tools**: Select testing frameworks and libraries that fit your project needs (Jest, Mocha, Cypress, etc.).
2. **Write Testable Code**: Structure your code to make it easy to test (dependency injection, pure functions).
3. **Follow Best Practices**: Use the AAA pattern, test one thing per test, and write descriptive test names.
4. **Mock External Dependencies**: Isolate your tests from external services and APIs.
5. **Measure Coverage**: Use coverage tools to identify untested code paths.
6. **Automate Testing**: Set up CI/CD pipelines to run tests automatically.
7. **Test at Different Levels**: Write unit tests, integration tests, and end-to-end tests as needed.
8. **Performance Testing**: Don't forget to test the performance of critical paths.

## Exercises

1. Set up a testing environment with Jest for a TypeScript project.
2. Write unit tests for a utility function that formats dates.
3. Create integration tests for an API endpoint using supertest.
4. Write an end-to-end test for a web application using Cypress.
5. Create a benchmark test to compare the performance of two different algorithms.

## Next Steps

Now that you understand testing in TypeScript, you're ready to explore how to optimize TypeScript applications for production in the next section.

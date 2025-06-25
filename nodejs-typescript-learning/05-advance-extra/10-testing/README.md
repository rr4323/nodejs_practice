# Testing in Node.js

This directory contains examples of testing in Node.js using Jest, a popular testing framework.

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the tests:
   ```bash
   npm test
   ```

3. Run tests in watch mode:
   ```bash
   npm run test:watch
   ```

4. Generate test coverage report:
   ```bash
   npm run test:coverage
   ```

## Test Examples

### Unit Testing
- Testing synchronous functions
- Testing asynchronous code (Promises, async/await, callbacks)
- Mocking functions and modules
- Snapshot testing

### Test Structure
- Describe blocks for organizing tests
- Before/After hooks for setup and teardown
- Test assertions and matchers

### Mocking
- Mock functions
- Mock implementations
- Mock return values

## Best Practices

1. **Write testable code**: Keep functions small and focused on a single responsibility.
2. **Use descriptive test names**: Test names should describe what's being tested.
3. **Test edge cases**: Don't just test the happy path.
4. **Keep tests independent**: Each test should be able to run in isolation.
5. **Use mocks for external dependencies**: Don't make real API calls in tests.
6. **Keep tests fast**: Tests should run quickly to encourage frequent testing.
7. **Test behavior, not implementation**: Focus on what the code does, not how it does it.

## Running Specific Tests

Run a specific test file:
```bash
npx jest calculator.test.js
```

Run tests that match a specific name pattern:
```bash
npx jest -t "adds two numbers correctly"
```

## Coverage Reports

After running `npm run test:coverage`, open `coverage/lcov-report/index.html` in a browser to view the coverage report.

## Additional Resources

- [Jest Documentation](https://jestjs.io/)
- [Testing Node.js with Jest](https://www.valentinog.com/blog/jest/)
- [Node.js Testing Best Practices](https://github.com/goldbergyoni/nodebestpractices#-6-testing-and-quality-practices)

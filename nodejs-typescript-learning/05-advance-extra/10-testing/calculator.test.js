const Calculator = require('./calculator');

describe('Calculator', () => {
  let calculator;

  // Run before each test
  beforeEach(() => {
    calculator = new Calculator();
  });

  describe('add', () => {
    test('adds two numbers correctly', () => {
      expect(calculator.add(2, 3)).toBe(5);
      expect(calculator.add(-1, 1)).toBe(0);
      expect(calculator.add(0.1, 0.2)).toBeCloseTo(0.3);
    });

    test('throws error for non-number inputs', () => {
      expect(() => calculator.add('2', 3)).toThrow('Both arguments must be numbers');
      expect(() => calculator.add(2, '3')).toThrow('Both arguments must be numbers');
      expect(() => calculator.add(null, undefined)).toThrow('Both arguments must be numbers');
    });
  });

  describe('subtract', () => {
    test('subtracts two numbers correctly', () => {
      expect(calculator.subtract(5, 3)).toBe(2);
      expect(calculator.subtract(0, 0)).toBe(0);
      expect(calculator.subtract(-1, -1)).toBe(0);
    });
  });

  describe('multiply', () => {
    test('multiplies two numbers correctly', () => {
      expect(calculator.multiply(2, 3)).toBe(6);
      expect(calculator.multiply(0, 5)).toBe(0);
      expect(calculator.multiply(-2, 3)).toBe(-6);
    });
  });

  describe('divide', () => {
    test('divides two numbers correctly', () => {
      expect(calculator.divide(6, 3)).toBe(2);
      expect(calculator.divide(1, 2)).toBe(0.5);
      expect(calculator.divide(-6, 2)).toBe(-3);
    });

    test('throws error when dividing by zero', () => {
      expect(() => calculator.divide(5, 0)).toThrow('Division by zero is not allowed');
    });
  });

  describe('squareRoot', () => {
    test('calculates square root correctly', async () => {
      await expect(calculator.squareRoot(9)).resolves.toBe(3);
      await expect(calculator.squareRoot(0)).resolves.toBe(0);
    });

    test('throws error for negative numbers', async () => {
      await expect(calculator.squareRoot(-1)).rejects.toThrow(
        'Cannot calculate square root of negative numbers'
      );
    });

    test('throws error for non-number input', async () => {
      await expect(calculator.squareRoot('16')).rejects.toThrow(
        'Argument must be a number'
      );
    });
  });

  // Test hooks and setup/teardown
  describe('test hooks', () => {
    beforeAll(() => {
      console.log('Running before all tests in this describe block');
    });

    afterAll(() => {
      console.log('Running after all tests in this describe block');
    });

    afterEach(() => {
      // Clean up after each test if needed
    });
  });
});

// Mocking example
describe('Mock Functions', () => {
  test('mock function', () => {
    const mockFn = jest.fn();
    mockFn('hello');
    expect(mockFn).toHaveBeenCalledWith('hello');
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  test('mock implementation', () => {
    const mockAdd = jest.fn().mockImplementation((a, b) => a + b);
    expect(mockAdd(2, 3)).toBe(5);
    expect(mockAdd).toHaveBeenCalledWith(2, 3);
  });
});

// Snapshot testing
describe('Snapshot Testing', () => {
  test('object assignment', () => {
    const data = { one: 1 };
    data.two = 2;
    expect(data).toMatchSnapshot();
  });
});

// Testing async code with callbacks
describe('Async Testing', () => {
  // Using async/await
  test('async/await', async () => {
    const result = await Promise.resolve('async data');
    expect(result).toBe('async data');
  });

  // Using Promises
  test('promise', () => {
    return Promise.resolve('promise data').then(data => {
      expect(data).toBe('promise data');
    });
  });

  // Using callbacks
  test('callback', done => {
    function fetchData(callback) {
      setTimeout(() => callback('callback data'), 100);
    }
    
    function callback(data) {
      try {
        expect(data).toBe('callback data');
        done();
      } catch (error) {
        done(error);
      }
    }
    
    fetchData(callback);
  });
});

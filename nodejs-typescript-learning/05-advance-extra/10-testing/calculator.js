// Simple calculator module to demonstrate testing
class Calculator {
  add(a, b) {
    if (typeof a !== 'number' || typeof b !== 'number') {
      throw new Error('Both arguments must be numbers');
    }
    return a + b;
  }


  subtract(a, b) {
    if (typeof a !== 'number' || typeof b !== 'number') {
      throw new Error('Both arguments must be numbers');
    }
    return a - b;
  }

  multiply(a, b) {
    if (typeof a !== 'number' || typeof b !== 'number') {
      throw new Error('Both arguments must be numbers');
    }
    return a * b;
  }

  divide(a, b) {
    if (typeof a !== 'number' || typeof b !== 'number') {
      throw new Error('Both arguments must be numbers');
    }
    if (b === 0) {
      throw new Error('Division by zero is not allowed');
    }
    return a / b;
  }

  async squareRoot(n) {
    if (typeof n !== 'number') {
      throw new Error('Argument must be a number');
    }
    if (n < 0) {
      throw new Error('Cannot calculate square root of negative numbers');
    }
    
    // Simulate async operation
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(Math.sqrt(n));
      }, 100);
    });
  }
}

module.exports = Calculator;

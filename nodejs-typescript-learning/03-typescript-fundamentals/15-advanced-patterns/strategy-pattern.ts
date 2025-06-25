/**
 * Strategy Pattern Implementation
 * 
 * The Strategy Pattern defines a family of algorithms, encapsulates each one, and makes them
 * interchangeable. Strategy lets the algorithm vary independently from clients that use it.
 */

// Strategy Interface
export interface PaymentStrategy {
  pay(amount: number): Promise<PaymentResult>;
}

// Context that uses the strategy
export class PaymentProcessor {
  private strategy: PaymentStrategy;

  constructor(strategy: PaymentStrategy) {
    this.strategy = strategy;
  }

  setStrategy(strategy: PaymentStrategy): void {
    this.strategy = strategy;
  }

  async processPayment(amount: number): Promise<PaymentResult> {
    try {
      console.log(`Processing payment of $${amount.toFixed(2)}`);
      const result = await this.strategy.pay(amount);
      console.log('Payment successful:', result);
      return result;
    } catch (error) {
      console.error('Payment failed:', error);
      throw error;
    }
  }
}

// Concrete Strategies
export class CreditCardStrategy implements PaymentStrategy {
  constructor(
    private cardNumber: string,
    private expiryDate: string,
    private cvv: string
  ) {}

  async pay(amount: number): Promise<PaymentResult> {
    // In a real app, this would integrate with a payment gateway
    console.log(`Processing credit card payment with card ending in ${this.cardNumber.slice(-4)}`);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (Math.random() < 0.05) { // 5% chance of failure
      throw new Error('Credit card payment failed: Insufficient funds');
    }
    
    return {
      success: true,
      amount,
      paymentMethod: 'credit_card',
      transactionId: `cc_${Date.now()}`,
      timestamp: new Date()
    };
  }
}

export class PayPalStrategy implements PaymentStrategy {
  constructor(private email: string, private password: string) {}

  async pay(amount: number): Promise<PaymentResult> {
    console.log(`Processing PayPal payment for ${this.email}`);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    if (Math.random() < 0.1) { // 10% chance of failure
      throw new Error('PayPal payment failed: Authentication failed');
    }
    
    return {
      success: true,
      amount,
      paymentMethod: 'paypal',
      transactionId: `pp_${Date.now()}`,
      timestamp: new Date()
    };
  }
}

export class CryptoStrategy implements PaymentStrategy {
  constructor(private walletAddress: string) {}

  async pay(amount: number): Promise<PaymentResult> {
    console.log(`Processing crypto payment to ${this.walletAddress}`);
    
    // Simulate blockchain confirmation
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    if (Math.random() < 0.15) { // 15% chance of failure
      throw new Error('Crypto payment failed: Network congestion');
    }
    
    return {
      success: true,
      amount,
      paymentMethod: 'crypto',
      transactionId: `crypto_${Date.now()}`,
      timestamp: new Date(),
      additionalInfo: {
        walletAddress: this.walletAddress,
        confirmationBlocks: 3
      }
    };
  }
}

// Types
export interface PaymentResult {
  success: boolean;
  amount: number;
  paymentMethod: string;
  transactionId: string;
  timestamp: Date;
  errorMessage?: string;
  additionalInfo?: Record<string, any>;
}

// Example usage
async function demo() {
  // Create payment strategies
  const creditCard = new CreditCardStrategy('4111111111111111', '12/25', '123');
  const paypal = new PayPalStrategy('user@example.com', 'password123');
  const crypto = new CryptoStrategy('0x1234...abcd');
  
  // Create payment processor with default strategy
  const processor = new PaymentProcessor(creditCard);
  
  // Process payment with credit card
  console.log('--- Processing with Credit Card ---');
  try {
    await processor.processPayment(100);
  } catch (error) {
    console.error('Payment failed:', error.message);
  }
  
  // Switch to PayPal
  console.log('\n--- Processing with PayPal ---');
  processor.setStrategy(paypal);
  try {
    await processor.processPayment(75.50);
  } catch (error) {
    console.error('Payment failed:', error.message);
  }
  
  // Switch to Crypto
  console.log('\n--- Processing with Crypto ---');
  processor.setStrategy(crypto);
  try {
    await processor.processPayment(250);
  } catch (error) {
    console.error('Payment failed:', error.message);
  }
}

// Uncomment to run the demo
// demo();

export {
  PaymentStrategy,
  PaymentProcessor,
  CreditCardStrategy,
  PayPalStrategy,
  CryptoStrategy,
  PaymentResult
};

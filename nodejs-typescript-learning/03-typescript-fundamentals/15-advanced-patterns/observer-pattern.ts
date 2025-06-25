/**
 * Observer Pattern Implementation
 * 
 * The Observer Pattern defines a one-to-many dependency between objects so that when one
 * object changes state, all its dependents are notified and updated automatically.
 */

// Observer Interface
export interface Observer<T> {
  update(data: T): void;
}

// Subject (Observable) Interface
export interface Subject<T> {
  subscribe(observer: Observer<T>): void;
  unsubscribe(observer: Observer<T>): void;
  notify(data: T): void;
}

// Concrete Subject
export class ConcreteSubject<T> implements Subject<T> {
  private observers: Observer<T>[] = [];
  private state: T;

  constructor(initialState: T) {
    this.state = initialState;
  }

  subscribe(observer: Observer<T>): void {
    if (this.observers.includes(observer)) {
      console.log('Observer already subscribed');
      return;
    }
    this.observers.push(observer);
    console.log('Observer subscribed');
  }

  unsubscribe(observer: Observer<T>): void {
    const index = this.observers.indexOf(observer);
    if (index === -1) {
      console.log('Observer not found');
      return;
    }
    this.observers.splice(index, 1);
    console.log('Observer unsubscribed');
  }

  notify(data: T): void {
    console.log(`Notifying ${this.observers.length} observers`);
    for (const observer of this.observers) {
      observer.update(data);
    }
  }

  // Example method that changes the state and notifies observers
  setState(newState: T): void {
    console.log('Subject: State changing to', newState);
    this.state = newState;
    this.notify(this.state);
  }

  getState(): T {
    return this.state;
  }
}

// Example Observer Implementations
export class ConsoleLogger<T> implements Observer<T> {
  private name: string;

  constructor(name: string) {
    this.name = name;
  }

  update(data: T): void {
    console.log(`[${this.name}] Received update:`, data);
  }
}

export class WebSocketClient<T> implements Observer<T> {
  private url: string;
  private connected: boolean = false;

  constructor(url: string) {
    this.url = url;
    this.connect();
  }

  private connect(): void {
    console.log(`WebSocket connecting to ${this.url}...`);
    // Simulate connection
    setTimeout(() => {
      this.connected = true;
      console.log('WebSocket connected');
    }, 1000);
  }

  update(data: T): void {
    if (!this.connected) {
      console.log('WebSocket not connected, queuing message');
      // In a real implementation, you might queue messages here
      return;
    }
    console.log(`[WebSocket] Sending data:`, JSON.stringify(data));
    // In a real implementation, send data via WebSocket
  }
}

// Example usage with a Stock Market application
type StockPrice = {
  symbol: string;
  price: number;
  change: number;
  timestamp: Date;
};

class StockMarket extends ConcreteSubject<StockPrice> {
  private intervalId?: NodeJS.Timeout;
  private symbols: string[] = ['AAPL', 'GOOGL', 'MSFT', 'AMZN'];

  startUpdates(intervalMs: number = 2000): void {
    console.log('Starting stock market updates...');
    this.intervalId = setInterval(() => this.updateStockPrices(), intervalMs);
  }

  stopUpdates(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      console.log('Stopped stock market updates');
    }
  }

  private updateStockPrices(): void {
    const symbol = this.symbols[Math.floor(Math.random() * this.symbols.length)];
    const price = Math.random() * 1000 + 100; // Random price between 100 and 1100
    const change = (Math.random() * 20 - 10); // Random change between -10 and +10
    
    const stockUpdate: StockPrice = {
      symbol,
      price: parseFloat(price.toFixed(2)),
      change: parseFloat(change.toFixed(2)),
      timestamp: new Date()
    };
    
    this.setState(stockUpdate);
  }
}

// Example usage
function demo() {
  // Create the subject (stock market)
  const stockMarket = new StockMarket({ symbol: '', price: 0, change: 0, timestamp: new Date() });
  
  // Create observers
  const consoleLogger1 = new ConsoleLogger<StockPrice>('Console 1');
  const consoleLogger2 = new ConsoleLogger<StockPrice>('Console 2');
  const webSocketClient = new WebSocketClient<StockPrice>('ws://localhost:8080/ws');
  
  // Subscribe observers
  stockMarket.subscribe(consoleLogger1);
  stockMarket.subscribe(consoleLogger2);
  stockMarket.subscribe(webSocketClient);
  
  // Start updates
  stockMarket.startUpdates(1500);
  
  // Simulate running for a while
  setTimeout(() => {
    // Unsubscribe one observer after some time
    stockMarket.unsubscribe(consoleLogger2);
    
    // Stop updates after some more time
    setTimeout(() => {
      stockMarket.stopUpdates();
      console.log('Demo finished');
    }, 5000);
  }, 5000);
}

// Uncomment to run the demo
// demo();

export {
  Observer,
  Subject,
  ConcreteSubject,
  ConsoleLogger,
  WebSocketClient,
  StockMarket,
  StockPrice
};

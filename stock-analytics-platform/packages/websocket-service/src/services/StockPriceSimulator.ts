import { logger } from '../utils/logger';
import WebSocketService from './WebSocketService';

interface StockPrice {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  timestamp: number;
  volume: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

class StockPriceSimulator {
  private stocks: Record<string, StockPrice> = {};
  private intervalIds: NodeJS.Timeout[] = [];
  private webSocketService: WebSocketService;

  constructor(webSocketService: WebSocketService) {
    this.webSocketService = webSocketService;
    this.initializeStocks();
  }

  private initializeStocks(): void {
    // Initialize with some popular stocks
    const initialStocks = [
      { symbol: 'AAPL', basePrice: 175.34 },
      { symbol: 'GOOGL', basePrice: 135.25 },
      { symbol: 'MSFT', basePrice: 330.12 },
      { symbol: 'AMZN', basePrice: 128.45 },
      { symbol: 'TSLA', basePrice: 260.54 },
      { symbol: 'META', basePrice: 290.38 },
      { symbol: 'NFLX', basePrice: 420.15 },
      { symbol: 'NVDA', basePrice: 450.37 },
    ];

    // Initialize stock prices
    initialStocks.forEach(({ symbol, basePrice }) => {
      this.stocks[symbol] = this.generateStockPrice(symbol, basePrice);
    });
  }

  private generateStockPrice(symbol: string, basePrice: number): StockPrice {
    const volatility = 0.02; // 2% volatility
    const changePercent = (Math.random() * 2 - 1) * volatility;
    const price = basePrice * (1 + changePercent);
    const change = price - basePrice;
    
    return {
      symbol,
      price: parseFloat(price.toFixed(2)),
      change: parseFloat(change.toFixed(2)),
      changePercent: parseFloat((changePercent * 100).toFixed(2)),
      timestamp: Date.now(),
      volume: Math.floor(Math.random() * 10000000) + 1000000, // 1M-10M
      open: basePrice,
      high: parseFloat((price * (1 + Math.random() * 0.01)).toFixed(2)),
      low: parseFloat((price * (1 - Math.random() * 0.01)).toFixed(2)),
      close: price,
    };
  }

  public startSimulation(intervalMs: number = 3000): void {
    logger.info('Starting stock price simulation...');
    
    // Update each stock at the specified interval
    Object.keys(this.stocks).forEach(symbol => {
      const intervalId = setInterval(() => {
        const currentPrice = this.stocks[symbol].price;
        const newPrice = this.generateStockPrice(symbol, currentPrice);
        this.stocks[symbol] = newPrice;
        
        // Broadcast the update to all subscribed clients
        this.webSocketService.broadcastStockUpdate(symbol, newPrice);
        
        // Randomly generate alerts
        if (Math.random() > 0.9) { // 10% chance of an alert
          this.generateStockAlert(symbol, newPrice);
        }
        
        logger.debug(`Updated ${symbol} price: $${newPrice.price} (${newPrice.change >= 0 ? '+' : ''}${newPrice.changePercent}%)`);
      }, intervalMs);
      
      this.intervalIds.push(intervalId);
    });
  }

  private generateStockAlert(symbol: string, priceData: StockPrice): void {
    const alertTypes = [
      { type: 'PRICE_ABOVE', condition: (p: number) => p > priceData.price * 1.02 },
      { type: 'PRICE_BELOW', condition: (p: number) => p < priceData.price * 0.98 },
      { type: 'VOLUME_SPIKE', condition: () => Math.random() > 0.95 },
    ];
    
    const alertType = alertTypes[Math.floor(Math.random() * alertTypes.length)];
    
    if (alertType.condition(priceData.price)) {
      const alert = {
        id: `alert_${Date.now()}`,
        type: alertType.type,
        symbol,
        price: priceData.price,
        timestamp: new Date().toISOString(),
        message: `${symbol} ${this.getAlertMessage(alertType.type, priceData)}`,
      };
      
      // Broadcast the alert to all subscribed clients
      this.webSocketService.broadcastStockAlert(symbol, alert);
      logger.info(`Alert: ${alert.message}`);
    }
  }

  private getAlertMessage(type: string, priceData: StockPrice): string {
    switch (type) {
      case 'PRICE_ABOVE':
        return `is up ${priceData.changePercent.toFixed(2)}% to $${priceData.price}`;
      case 'PRICE_BELOW':
        return `is down ${Math.abs(priceData.changePercent).toFixed(2)}% to $${priceData.price}`;
      case 'VOLUME_SPIKE':
        return `has unusual trading volume: ${priceData.volume.toLocaleString()} shares`;
      default:
        return `has an update: $${priceData.price} (${priceData.change >= 0 ? '+' : ''}${priceData.changePercent}%)`;
    }
  }

  public stopSimulation(): void {
    this.intervalIds.forEach(clearInterval);
    this.intervalIds = [];
    logger.info('Stopped stock price simulation');
  }

  public getStock(symbol: string): StockPrice | undefined {
    return this.stocks[symbol];
  }

  public getAllStocks(): Record<string, StockPrice> {
    return { ...this.stocks };
  }
}

export default StockPriceSimulator;

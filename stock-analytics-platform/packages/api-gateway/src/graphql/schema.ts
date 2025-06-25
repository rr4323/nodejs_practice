import { gql } from 'graphql-tag';

// Define your GraphQL schema here
export const typeDefs = gql`
  type Query {
    """
    Get the current server status
    """
    status: Status!
    
    """
    Get stock data by symbol
    """
    stock(symbol: String!): Stock
    
    """
    Get stock history for a symbol
    """
    stockHistory(symbol: String!, from: String!, to: String!): [StockData!]!
  }

  type Mutation {
    """
    Add a stock to watchlist
    """
    addToWatchlist(symbol: String!): WatchlistResponse!
    
    """
    Remove a stock from watchlist
    """
    removeFromWatchlist(symbol: String!): WatchlistResponse!
  }

  type Subscription {
    """
    Subscribe to stock price updates
    """
    stockUpdated(symbol: String!): StockData
    
    """
    Subscribe to stock alerts
    """
    stockAlert(symbol: String!): StockAlert
  }

  """
  Server status information
  """
  type Status {
    status: String!
    timestamp: String!
    uptime: Float!
  }

  """
  Stock data type
  """
  type Stock {
    symbol: String!
    name: String
    price: Float!
    change: Float!
    changePercent: Float!
    timestamp: String!
    volume: Int!
    open: Float
    high: Float
    low: Float
    close: Float
  }

  """
  Historical stock data point
  """
  type StockData {
    symbol: String!
    price: Float!
    timestamp: String!
    volume: Int
    open: Float
    high: Float
    low: Float
    close: Float
  }

  """
  Stock alert type
  """
  type StockAlert {
    id: ID!
    symbol: String!
    condition: String!
    value: Float!
    isActive: Boolean!
    createdAt: String!
    triggeredAt: String
  }

  """
  Watchlist response type
  """
  type WatchlistResponse {
    success: Boolean!
    message: String
    watchlist: [String!]
  }
`;

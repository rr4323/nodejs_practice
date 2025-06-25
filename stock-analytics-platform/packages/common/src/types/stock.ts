import { z } from 'zod';

export const StockDataSchema = z.object({
  symbol: z.string(),
  price: z.number(),
  change: z.number(),
  changePercent: z.number(),
  timestamp: z.number(),
  volume: z.number(),
  open: z.number(),
  high: z.number(),
  low: z.number(),
  close: z.number(),
});

export type StockData = z.infer<typeof StockDataSchema>;

export const StockPredictionSchema = z.object({
  symbol: z.string(),
  predictedPrice: z.number(),
  confidence: z.number(),
  timestamp: z.number(),
  predictionFor: z.number(), // timestamp
});

export type StockPrediction = z.infer<typeof StockPredictionSchema>;

export const StockAlertSchema = z.object({
  id: z.string(),
  userId: z.string(),
  symbol: z.string(),
  condition: z.string(),
  value: z.number(),
  isActive: z.boolean(),
  createdAt: z.number(),
  triggeredAt: z.number().optional(),
});

export type StockAlert = z.infer<typeof StockAlertSchema>;

export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  watchlist: z.array(z.string()),
  createdAt: z.number(),
  updatedAt: z.number(),
});

export type User = z.infer<typeof UserSchema>;

export const AuthPayloadSchema = z.object({
  token: z.string(),
  user: UserSchema,
});

export type AuthPayload = z.infer<typeof AuthPayloadSchema>;

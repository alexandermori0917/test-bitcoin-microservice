import dotenv from 'dotenv';
import { ServiceConfig } from '../types';

// Load environment variables
dotenv.config();

export const config: ServiceConfig = {
  port: parseInt(process.env.PORT || '3000', 10),
  updateIntervalMs: parseInt(process.env.UPDATE_INTERVAL_MS || '10000', 10),
  serviceCommission: parseFloat(process.env.SERVICE_COMMISSION || '0.0001'),
  binanceApiUrl: process.env.BINANCE_API_URL || 'https://api.binance.com'
};

export const validateConfig = (): void => {
  if (config.port < 1 || config.port > 65535) {
    throw new Error('PORT must be between 1 and 65535');
  }
  
  if (config.updateIntervalMs < 1000) {
    throw new Error('UPDATE_INTERVAL_MS must be at least 1000ms');
  }
  
  if (config.serviceCommission < 0 || config.serviceCommission > 1) {
    throw new Error('SERVICE_COMMISSION must be between 0 and 1');
  }
  
  if (!config.binanceApiUrl) {
    throw new Error('BINANCE_API_URL is required');
  }
};

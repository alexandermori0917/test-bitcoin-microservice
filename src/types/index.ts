export interface BinanceTickerResponse {
  symbol: string;
  bidPrice: string;
  bidQty: string;
  askPrice: string;
  askQty: string;
}

export interface BitcoinPrice {
  symbol: string;
  bidPrice: number;
  askPrice: number;
  midPrice: number;
  timestamp: number;
}

export interface ServiceConfig {
  port: number;
  updateIntervalMs: number;
  serviceCommission: number;
  binanceApiUrl: string;
}

export interface PriceResponse {
  success: boolean;
  data?: BitcoinPrice;
  error?: string;
  timestamp: number;
}

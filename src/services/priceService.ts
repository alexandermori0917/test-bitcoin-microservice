import { BinanceClient } from './binanceClient';
import { BitcoinPrice, BinanceTickerResponse } from '../types';

export class PriceService {
  private binanceClient: BinanceClient;
  private serviceCommission: number;
  private currentPrice: BitcoinPrice | null = null;
  private lastUpdateTime: number = 0;

  constructor(binanceClient: BinanceClient, serviceCommission: number) {
    this.binanceClient = binanceClient;
    this.serviceCommission = serviceCommission;
  }

  /**
   * Fetches the latest Bitcoin price from Binance and applies service commission
   */
  async updatePrice(): Promise<BitcoinPrice> {
    try {
      const tickerData: BinanceTickerResponse = await this.binanceClient.getBitcoinTicker();
      
      const rawBidPrice = parseFloat(tickerData.bidPrice);
      const rawAskPrice = parseFloat(tickerData.askPrice);

      if (isNaN(rawBidPrice) || isNaN(rawAskPrice)) {
        throw new Error('Invalid price data received from Binance');
      }

      // Apply service commission
      // For bid price, we reduce it (subtract commission)
      // For ask price, we increase it (add commission)
      const bidPrice = rawBidPrice * (1 - this.serviceCommission);
      const askPrice = rawAskPrice * (1 + this.serviceCommission);
      
      // Calculate mid price
      const midPrice = (bidPrice + askPrice) / 2;

      const bitcoinPrice: BitcoinPrice = {
        symbol: tickerData.symbol,
        bidPrice: parseFloat(bidPrice.toFixed(8)),
        askPrice: parseFloat(askPrice.toFixed(8)),
        midPrice: parseFloat(midPrice.toFixed(8)),
        timestamp: Date.now()
      };

      this.currentPrice = bitcoinPrice;
      this.lastUpdateTime = Date.now();

      return bitcoinPrice;
    } catch (error) {
      console.error('Error updating Bitcoin price:', error);
      throw error;
    }
  }

  /**
   * Gets the current cached price
   */
  getCurrentPrice(): BitcoinPrice | null {
    return this.currentPrice;
  }

  /**
   * Gets the last update time
   */
  getLastUpdateTime(): number {
    return this.lastUpdateTime;
  }

  /**
   * Checks if the price data is fresh (updated within the last 15 seconds)
   */
  isPriceFresh(): boolean {
    if (!this.currentPrice) return false;
    const now = Date.now();
    return (now - this.lastUpdateTime) < 15000; // 15 seconds
  }

  /**
   * Gets the service commission rate
   */
  getServiceCommission(): number {
    return this.serviceCommission;
  }
}

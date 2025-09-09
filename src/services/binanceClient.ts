import axios, { AxiosResponse } from 'axios';
import { BinanceTickerResponse } from '../types';

export class BinanceClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  /**
   * Fetches the current ticker data for BTCUSDT from Binance
   */
  async getBitcoinTicker(): Promise<BinanceTickerResponse> {
    try {
      const response: AxiosResponse<BinanceTickerResponse> = await axios.get(
        `${this.baseUrl}/api/v3/ticker/bookTicker`,
        {
          params: {
            symbol: 'BTCUSDT'
          },
          timeout: 10000 // 10 second timeout
        }
      );

      if (!response.data) {
        throw new Error('Empty response from Binance API');
      }

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          throw new Error(`Binance API error: ${error.response.status} - ${error.response.statusText}`);
        } else if (error.request) {
          throw new Error('Network error: Unable to reach Binance API');
        } else {
          throw new Error(`Request error: ${error.message}`);
        }
      }
      throw new Error(`Unexpected error: ${error}`);
    }
  }

  /**
   * Health check for the Binance API
   */
  async healthCheck(): Promise<boolean> {
    try {
      await axios.get(`${this.baseUrl}/api/v3/ping`, { timeout: 5000 });
      return true;
    } catch (error) {
      return false;
    }
  }
}

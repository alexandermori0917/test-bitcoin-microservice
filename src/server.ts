import express, { Request, Response } from 'express';
import cors from 'cors';
import { BinanceClient } from './services/binanceClient';
import { PriceService } from './services/priceService';
import { config } from './config';
import { PriceResponse } from './types';

export class BitcoinPriceServer {
  private app: express.Application;
  private priceService: PriceService;
  private updateInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
    
    // Initialize services
    const binanceClient = new BinanceClient(config.binanceApiUrl);
    this.priceService = new PriceService(binanceClient, config.serviceCommission);
  }

  private setupMiddleware(): void {
    this.app.use(cors());
    this.app.use(express.json());
    
    // Request logging
    this.app.use((req, res, next) => {
      console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
      next();
    });
  }

  private setupRoutes(): void {
    // Health check endpoint
    this.app.get('/health', async (req: Request, res: Response) => {
      try {
        const binanceClient = new BinanceClient(config.binanceApiUrl);
        const isHealthy = await binanceClient.healthCheck();
        
        res.status(isHealthy ? 200 : 503).json({
          status: isHealthy ? 'healthy' : 'unhealthy',
          timestamp: Date.now(),
          binanceApi: isHealthy ? 'connected' : 'disconnected'
        });
      } catch (error) {
        res.status(503).json({
          status: 'unhealthy',
          timestamp: Date.now(),
          error: 'Health check failed'
        });
      }
    });

    // Get current Bitcoin price
    this.app.get('/price', async (req: Request, res: Response) => {
      try {
        const currentPrice = this.priceService.getCurrentPrice();
        
        if (!currentPrice) {
          const response: PriceResponse = {
            success: false,
            error: 'No price data available. Service may be starting up.',
            timestamp: Date.now()
          };
          return res.status(503).json(response);
        }

        const response: PriceResponse = {
          success: true,
          data: currentPrice,
          timestamp: Date.now()
        };

        res.json(response);
      } catch (error) {
        const response: PriceResponse = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error occurred',
          timestamp: Date.now()
        };
        res.status(500).json(response);
      }
    });

    // Force price update
    this.app.post('/price/update', async (req: Request, res: Response) => {
      try {
        const updatedPrice = await this.priceService.updatePrice();
        
        const response: PriceResponse = {
          success: true,
          data: updatedPrice,
          timestamp: Date.now()
        };

        res.json(response);
      } catch (error) {
        const response: PriceResponse = {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to update price',
          timestamp: Date.now()
        };
        res.status(500).json(response);
      }
    });

    // Get service configuration
    this.app.get('/config', (req: Request, res: Response) => {
      res.json({
        port: config.port,
        updateIntervalMs: config.updateIntervalMs,
        serviceCommission: config.serviceCommission,
        binanceApiUrl: config.binanceApiUrl,
        lastUpdateTime: this.priceService.getLastUpdateTime(),
        isPriceFresh: this.priceService.isPriceFresh()
      });
    });

    // Catch-all for undefined routes
    this.app.use('*', (req: Request, res: Response) => {
      res.status(404).json({
        error: 'Route not found',
        availableRoutes: ['/health', '/price', '/price/update', '/config']
      });
    });
  }

  /**
   * Starts the price update interval
   */
  startPriceUpdates(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }

    // Initial price fetch
    this.priceService.updatePrice().catch(error => {
      console.error('Initial price fetch failed:', error);
    });

    // Set up interval for regular updates
    this.updateInterval = setInterval(async () => {
      try {
        await this.priceService.updatePrice();
        console.log(`Price updated at ${new Date().toISOString()}`);
      } catch (error) {
        console.error('Price update failed:', error);
      }
    }, config.updateIntervalMs);

    console.log(`Price updates started with ${config.updateIntervalMs}ms interval`);
  }

  /**
   * Stops the price update interval
   */
  stopPriceUpdates(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
      console.log('Price updates stopped');
    }
  }

  /**
   * Starts the HTTP server
   */
  async start(): Promise<void> {
    return new Promise((resolve) => {
      this.app.listen(config.port, () => {
        console.log(`Bitcoin Price Microservice running on port ${config.port}`);
        console.log(`Service commission: ${(config.serviceCommission * 100).toFixed(4)}%`);
        console.log(`Update interval: ${config.updateIntervalMs}ms`);
        console.log(`Binance API URL: ${config.binanceApiUrl}`);
        resolve();
      });
    });
  }

  /**
   * Graceful shutdown
   */
  async shutdown(): Promise<void> {
    console.log('Shutting down Bitcoin Price Microservice...');
    this.stopPriceUpdates();
    process.exit(0);
  }
}

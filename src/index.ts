import { BitcoinPriceServer } from './server';
import { config, validateConfig } from './config';

async function main(): Promise<void> {
  try {
    // Validate configuration
    validateConfig();
    console.log('Configuration validated successfully');

    // Create and start the server
    const server = new BitcoinPriceServer();
    
    // Start the HTTP server
    await server.start();
    
    // Start price updates
    server.startPriceUpdates();

    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      console.log('\nReceived SIGINT, shutting down gracefully...');
      await server.shutdown();
    });

    process.on('SIGTERM', async () => {
      console.log('\nReceived SIGTERM, shutting down gracefully...');
      await server.shutdown();
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      console.error('Uncaught Exception:', error);
      process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
      console.error('Unhandled Rejection at:', promise, 'reason:', reason);
      process.exit(1);
    });

  } catch (error) {
    console.error('Failed to start Bitcoin Price Microservice:', error);
    process.exit(1);
  }
}

// Start the application
main().catch((error) => {
  console.error('Application startup failed:', error);
  process.exit(1);
});

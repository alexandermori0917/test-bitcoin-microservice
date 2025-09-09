# Bitcoin Price Microservice

A TypeScript-based microservice that provides real-time Bitcoin price data from the Binance exchange API with configurable service commission and automatic price updates.

## Features

- 🚀 **Real-time Bitcoin Price Data**: Fetches current BTC/USDT prices from Binance API
- 💰 **Service Commission**: Applies configurable commission to bid/ask prices
- 📊 **Mid Price Calculation**: Automatically calculates mid price from adjusted bid/ask
- ⏰ **Auto Updates**: Configurable price update intervals (default: 10 seconds)
- 🔧 **Environment Configuration**: All settings configurable via environment variables
- 🐳 **Docker Support**: Complete containerization with Dockerfile and docker-compose
- 🌐 **RESTful API**: Clean HTTP endpoints for price data and health checks
- 🎨 **Test Frontend**: Beautiful web interface to test the microservice
- 🛡️ **Error Handling**: Comprehensive error handling and logging
- 📈 **Health Monitoring**: Built-in health checks and status monitoring

## API Endpoints

### GET `/price`
Returns the current Bitcoin price data.

**Response:**
```json
{
  "success": true,
  "data": {
    "symbol": "BTCUSDT",
    "bidPrice": 43250.50,
    "askPrice": 43251.00,
    "midPrice": 43250.75,
    "timestamp": 1703123456789
  },
  "timestamp": 1703123456789
}
```

### POST `/price/update`
Forces an immediate price update.

**Response:** Same as GET `/price`

### GET `/health`
Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": 1703123456789,
  "binanceApi": "connected"
}
```

### GET `/config`
Returns current service configuration.

**Response:**
```json
{
  "port": 3000,
  "updateIntervalMs": 10000,
  "serviceCommission": 0.0001,
  "binanceApiUrl": "https://api.binance.com",
  "lastUpdateTime": 1703123456789,
  "isPriceFresh": true
}
```

## Installation & Setup

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Docker (optional)

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/alexandermori0917/test-bitcoin-microservice.git
   cd test-bitcoin-microservice
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` with your preferred settings:
   ```env
   PORT=3000
   UPDATE_INTERVAL_MS=10000
   SERVICE_COMMISSION=0.0001
   BINANCE_API_URL=https://api.binance.com
   ```

4. **Build the project**
   ```bash
   npm run build
   ```

5. **Start the service**
   ```bash
   npm start
   ```

6. **For development with auto-reload**
   ```bash
   npm run dev
   ```

### Docker Deployment

1. **Build the Docker image**
   ```bash
   docker build -t bitcoin-price-microservice .
   ```

2. **Run with Docker Compose**
   ```bash
   docker-compose up -d
   ```

3. **Or run directly with Docker**
   ```bash
   docker run -p 3000:3000 \
     -e PORT=3000 \
     -e UPDATE_INTERVAL_MS=10000 \
     -e SERVICE_COMMISSION=0.0001 \
     bitcoin-price-microservice
   ```

## Testing the Service

### Using the Web Frontend

1. Start the microservice
2. Open `frontend/index.html` in your browser
3. The frontend will automatically connect to the service and display real-time price data

### Using curl

```bash
# Get current price
curl http://localhost:3000/price

# Force price update
curl -X POST http://localhost:3000/price/update

# Check health
curl http://localhost:3000/health

# Get configuration
curl http://localhost:3000/config
```

### Using the frontend server

```bash
# Start the frontend server (from project root)
npm run frontend

# Then open http://localhost:3001 in your browser
```

## Configuration

All configuration is done through environment variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 3000 | HTTP server port |
| `UPDATE_INTERVAL_MS` | 10000 | Price update interval in milliseconds |
| `SERVICE_COMMISSION` | 0.0001 | Service commission rate (0.0001 = 0.01%) |
| `BINANCE_API_URL` | https://api.binance.com | Binance API base URL |

## Architecture

```
src/
├── config/           # Configuration management
├── services/         # Business logic services
│   ├── binanceClient.ts    # Binance API client
│   └── priceService.ts     # Price calculation service
├── types/            # TypeScript type definitions
├── server.ts         # HTTP server implementation
└── index.ts          # Application entry point
```

## Service Commission Logic

The service applies commission as follows:

- **Bid Price**: `rawBidPrice * (1 - commission)` (reduces bid)
- **Ask Price**: `rawAskPrice * (1 + commission)` (increases ask)
- **Mid Price**: `(adjustedBid + adjustedAsk) / 2`

This ensures the service always has a small spread to cover operational costs.

## Error Handling

The service includes comprehensive error handling for:

- Network connectivity issues
- Binance API errors
- Invalid price data
- Configuration validation
- Graceful shutdown handling

## Health Monitoring

The service provides health checks that verify:

- Service is running
- Binance API connectivity
- Price data freshness
- Configuration validity

## Development

### Project Structure

- **TypeScript**: Full type safety and modern ES features
- **Express.js**: Lightweight HTTP server
- **Axios**: HTTP client for API calls
- **CORS**: Cross-origin resource sharing support
- **dotenv**: Environment variable management

### Scripts

- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Start the production server
- `npm run dev` - Start development server with auto-reload
- `npm run watch` - Watch mode for TypeScript compilation
- `npm run frontend` - Start frontend test server

## License

MIT License - see LICENSE file for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Support

For issues and questions, please create an issue in the repository.

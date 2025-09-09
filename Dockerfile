# Use Node.js 18 LTS as base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy TypeScript configuration
COPY tsconfig.json ./

# Copy source code
COPY src/ ./src/

# Build the application
RUN npm run build

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S bitcoin-service -u 1001

# Change ownership of the app directory
RUN chown -R bitcoin-service:nodejs /app
USER bitcoin-service

# Expose the port
EXPOSE 3000

# Set default environment variables
ENV PORT=3000
ENV UPDATE_INTERVAL_MS=10000
ENV SERVICE_COMMISSION=0.0001
ENV BINANCE_API_URL=https://api.binance.com

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the application
CMD ["npm", "start"]

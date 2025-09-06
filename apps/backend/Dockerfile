# Multi-stage Dockerfile for AI Interview Prep Backend
# Supports both local development and Lambda deployment

ARG NODE_VERSION=18
ARG BUILD_TARGET=local

# Build stage
FROM node:${NODE_VERSION}-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig*.json ./

# Install dependencies
RUN npm ci --only=production=false

# Copy source code
COPY src/ ./src/

# Build based on target
RUN if [ "$BUILD_TARGET" = "lambda" ] ; then npm run build:lambda ; else npm run build ; fi

# Production stage
FROM node:${NODE_VERSION}-alpine AS production

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8080

# Create app directory and user
WORKDIR /app
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Copy package files and install production dependencies
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy built application
COPY --from=builder /app/dist ./dist

# Change ownership to nodejs user
RUN chown -R nextjs:nodejs /app
USER nextjs

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the application (default to local server)
CMD ["node", "dist/src/local/server.js"]
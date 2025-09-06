# Docker Setup for AI Interview Prep Backend

This directory contains Docker configuration for running the AI Interview Prep Backend application in containerized environments, supporting both development and production deployments.

## Files

- `Dockerfile` - Production Docker image
- `Dockerfile.dev` - Development Docker image with hot reloading
- `docker-compose.yml` - Production deployment
- `docker-compose.dev.yml` - Development environment
- `tsconfig.docker.json` - Standalone TypeScript configuration for Docker builds

## Quick Start

### Production

```bash
# Build and run with Docker Compose
npm run docker:up

# Or build and run manually
npm run docker:build
npm run docker:run
```

### Development

```bash
# Run development environment with hot reloading
npm run docker:dev
```

## Available Scripts

- `npm run docker:build` - Build the Docker image
- `npm run docker:run` - Run container from image
- `npm run docker:up` - Start services with docker-compose
- `npm run docker:down` - Stop docker-compose services
- `npm run docker:dev` - Start development environment
- `npm run docker:logs` - View container logs
- `npm run docker:rebuild` - Rebuild and restart services

## Environment Variables

Create a `.env` file in this directory with:

```env
OPENAI_API_KEY=your_openai_api_key_here
ENVIRONMENT=docker
PORT=8080
```

## Docker Images

### Production Image (`Dockerfile`)
- Multi-stage build
- Node.js 18 Alpine Linux
- Non-root user for security
- Health checks
- Compiled TypeScript
- Production dependencies only
- ~50MB final image size

### Development Image (`Dockerfile.dev`)
- Single stage build
- All dependencies included
- Volume mounting for hot reloading
- TypeScript compilation on-the-fly

## Ports

- **8080** - Application server (mapped from container)

## Health Check

The application includes a built-in health check endpoint:

```bash
curl http://localhost:8080/health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2025-08-26T00:00:00.000Z",
  "environment": "docker",
  "openai_configured": true
}
```

## Security Features

- Runs as non-root user (`nextjs:nodejs`)
- Minimal Alpine Linux base image
- Production dependencies only in final image
- No sensitive data in image layers

## Troubleshooting

### Port Already in Use
```bash
# Kill processes on port 8080
sudo lsof -ti:8080 | xargs kill -9
```

### View Container Logs
```bash
docker logs ai-interview-prep-backend
# OR
npm run docker:logs
```

### Rebuild from Scratch
```bash
npm run docker:rebuild
```

### Access Container Shell
```bash
docker exec -it ai-interview-prep-backend sh
```
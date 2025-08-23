#!/bin/bash

# Build frontend with environment-specific configuration
# Usage: ./scripts/build-frontend.sh [dev|prod|local]

set -e

ENVIRONMENT=${1:-local}
FRONTEND_DIR="apps/frontend"

echo "🏗️ Building frontend for environment: $ENVIRONMENT"

# Navigate to frontend directory
cd $FRONTEND_DIR

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Set API endpoint based on environment
case $ENVIRONMENT in
  "dev")
    echo "🔧 Configuring for development environment..."
    API_ENDPOINT="api.dev.ai-ip.chrismarasco.io"
    ;;
  "prod")
    echo "🔧 Configuring for production environment..."
    API_ENDPOINT="api.ai-ip.chrismarasco.io"
    ;;
  "local"|*)
    echo "🔧 Configuring for local development..."
    API_ENDPOINT="localhost:8080"
    # No changes needed for local - already configured
    ;;
esac

# Update API endpoint in aiAnalysis service (if not local)
if [ "$ENVIRONMENT" != "local" ]; then
  echo "🔗 Updating API endpoint to: $API_ENDPOINT"
  
  # Create backup of original file
  cp src/services/aiAnalysis.ts src/services/aiAnalysis.ts.backup
  
  # Update the API endpoint
  sed -i "s/api\.dev\.ai-ip\.chrismarasco\.io/$API_ENDPOINT/g" src/services/aiAnalysis.ts
  sed -i "s/api\.ai-ip\.chrismarasco\.io/$API_ENDPOINT/g" src/services/aiAnalysis.ts
fi

# Build the application
echo "🚀 Building application..."
npm run build

echo "✅ Frontend build complete!"
echo "📁 Build files available in: $FRONTEND_DIR/dist/"

# Restore original file if we made changes
if [ "$ENVIRONMENT" != "local" ] && [ -f "src/services/aiAnalysis.ts.backup" ]; then
  echo "🔄 Restoring original configuration..."
  mv src/services/aiAnalysis.ts.backup src/services/aiAnalysis.ts
fi

echo "🎉 Build process finished successfully!"
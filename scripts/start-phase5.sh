#!/bin/bash
# Phase 5 Startup Script with Pull Failure Workarounds
#
# This script handles common Docker pull failures (Cloudflare EOF, timeouts)

set -e

echo "=== Phase 5: Event-Driven Todo App ==="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
COMPOSE_FILE="docker-compose.phase5.yml"
MAX_RETRIES=3
RETRY_DELAY=10

# Infrastructure images (external)
INFRA_IMAGES=(
    "redis:7-alpine"
    "confluentinc/cp-zookeeper:7.5.0"
    "confluentinc/cp-kafka:7.5.0"
    "daprio/dapr:1.13.0"
)

# App images (local, from Phase 4)
APP_IMAGES=(
    "todo-backend"
    "todo-frontend"
)

# Function: Pull image with retries
pull_with_retry() {
    local image=$1
    local attempt=1

    while [ $attempt -le $MAX_RETRIES ]; do
        echo -e "${YELLOW}Pulling $image (attempt $attempt/$MAX_RETRIES)...${NC}"

        if docker pull "$image"; then
            echo -e "${GREEN}Successfully pulled $image${NC}"
            return 0
        else
            echo -e "${RED}Failed to pull $image${NC}"
            if [ $attempt -lt $MAX_RETRIES ]; then
                echo "Waiting ${RETRY_DELAY}s before retry..."
                sleep $RETRY_DELAY
            fi
        fi
        ((attempt++))
    done

    echo -e "${RED}Failed to pull $image after $MAX_RETRIES attempts${NC}"
    return 1
}

# Function: Check if image exists locally
image_exists() {
    docker image inspect "$1" > /dev/null 2>&1
}

# Step 1: Verify Phase 4 app images exist
echo ""
echo "=== Step 1: Verifying Phase 4 App Images ==="
for img in "${APP_IMAGES[@]}"; do
    if image_exists "$img"; then
        echo -e "${GREEN}[OK] $img exists locally${NC}"
    else
        echo -e "${RED}[MISSING] $img not found!${NC}"
        echo "Please build Phase 4 images first or run:"
        echo "  docker build -t $img ./backend  # or ./frontend"
        exit 1
    fi
done

# Step 2: Pull infrastructure images
echo ""
echo "=== Step 2: Pulling Infrastructure Images ==="
PULL_FAILED=false

for img in "${INFRA_IMAGES[@]}"; do
    if image_exists "$img"; then
        echo -e "${GREEN}[CACHED] $img already exists${NC}"
    else
        if ! pull_with_retry "$img"; then
            PULL_FAILED=true
            echo -e "${YELLOW}[WARN] Could not pull $img - will try alternative${NC}"
        fi
    fi
done

# Step 3: Handle pull failures
if [ "$PULL_FAILED" = true ]; then
    echo ""
    echo -e "${YELLOW}=== Some images failed to pull ===${NC}"
    echo ""
    echo "Options:"
    echo "1. Run WITHOUT Kafka/Dapr (app works, events disabled):"
    echo "   docker-compose -f docker-compose.yml up -d"
    echo ""
    echo "2. Try pulling from alternative registry:"
    echo "   docker pull docker.io/confluentinc/cp-kafka:7.5.0"
    echo ""
    echo "3. Use local Kafka installation instead of Docker"
    echo ""
    echo "4. Wait and retry later (network issue may be temporary)"
    echo ""

    read -p "Continue without failed images? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Step 4: Start services
echo ""
echo "=== Step 3: Starting Services ==="
docker-compose -f "$COMPOSE_FILE" up -d

# Step 5: Health check
echo ""
echo "=== Step 4: Health Check ==="
sleep 5

echo "Checking backend..."
if curl -s http://localhost:8000/api/health | grep -q "healthy"; then
    echo -e "${GREEN}[OK] Backend is healthy${NC}"
else
    echo -e "${YELLOW}[WARN] Backend not responding yet${NC}"
fi

echo "Checking frontend..."
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo -e "${GREEN}[OK] Frontend is accessible${NC}"
else
    echo -e "${YELLOW}[WARN] Frontend not responding yet${NC}"
fi

echo "Checking Kafka..."
if docker exec todo-kafka kafka-topics --bootstrap-server localhost:9092 --list > /dev/null 2>&1; then
    echo -e "${GREEN}[OK] Kafka is running${NC}"
else
    echo -e "${YELLOW}[WARN] Kafka not ready (events will be disabled)${NC}"
fi

echo ""
echo "=== Phase 5 Startup Complete ==="
echo ""
echo "Services:"
echo "  - Frontend:  http://localhost:3000"
echo "  - Backend:   http://localhost:8000"
echo "  - Kafka:     localhost:9092"
echo "  - Redis:     localhost:6379"
echo ""
echo "View logs: docker-compose -f $COMPOSE_FILE logs -f"

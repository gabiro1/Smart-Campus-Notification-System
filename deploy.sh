#!/bin/bash
# ==========================================
# Smart Campus Notification System
# Deployment Script
# ==========================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}==========================================${NC}"
echo -e "${GREEN}  Smart Campus Notification System${NC}"
echo -e "${GREEN}  Deployment Script${NC}"
echo -e "${GREEN}==========================================${NC}"

# ==========================================
# Functions
# ==========================================
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_requirements() {
    log_info "Checking requirements..."
    
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    log_info "All requirements met!"
}

setup_env() {
    log_info "Setting up environment variables..."
    
    if [ ! -f .env ]; then
        if [ -f .env.production.example ]; then
            log_warn ".env not found. Copying from .env.production.example"
            cp .env.production.example .env
            log_warn "Please edit .env and fill in your values before continuing."
            exit 1
        else
            log_error ".env file not found and no example to copy from."
            exit 1
        fi
    fi
    
    log_info "Environment variables configured!"
}

deploy() {
    log_info "Building and starting containers..."
    
    docker-compose build --no-cache
    docker-compose up -d
    
    log_info "Waiting for services to be healthy..."
    sleep 10
    
    # Check health
    docker-compose ps
    
    log_info "Deployment complete!"
    log_info "Application available at: http://localhost:3000"
    log_info "API available at: http://localhost:8000"
}

stop_services() {
    log_info "Stopping services..."
    docker-compose down
    log_info "Services stopped!"
}

restart_services() {
    log_info "Restarting services..."
    docker-compose restart
    log_info "Services restarted!"
}

show_logs() {
    docker-compose logs -f --tail=100
}

show_status() {
    echo ""
    echo -e "${GREEN}Container Status:${NC}"
    docker-compose ps
    echo ""
    echo -e "${GREEN}Container Health:${NC}"
    docker-compose ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"
}

# ==========================================
# Main
# ==========================================
case "${1:-deploy}" in
    deploy)
        check_requirements
        setup_env
        deploy
        ;;
    start)
        docker-compose up -d
        ;;
    stop)
        stop_services
        ;;
    restart)
        restart_services
        ;;
    logs)
        show_logs
        ;;
    status)
        show_status
        ;;
    rebuild)
        log_info "Rebuilding containers..."
        docker-compose build --no-cache
        docker-compose up -d
        ;;
    clean)
        log_warn "Cleaning up containers and volumes..."
        docker-compose down -v --remove-orphans
        docker system prune -f
        log_info "Cleanup complete!"
        ;;
    *)
        echo "Usage: $0 {deploy|start|stop|restart|logs|status|rebuild|clean}"
        echo ""
        echo "Commands:"
        echo "  deploy   - Build and deploy the entire stack (default)"
        echo "  start    - Start existing containers"
        echo "  stop     - Stop all containers"
        echo "  restart  - Restart all containers"
        echo "  logs     - Show logs (Ctrl+C to exit)"
        echo "  status   - Show container status"
        echo "  rebuild  - Rebuild and restart containers"
        echo "  clean    - Remove containers, volumes, and prune Docker"
        exit 1
        ;;
esac

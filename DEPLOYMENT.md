# 🚀 Smart Campus Notification System - Deployment Guide

## Overview

This guide covers deploying the Smart Campus Notification System using Docker and Docker Compose.

## Prerequisites

- **Docker** (v20.10+) - [Install Docker](https://docs.docker.com/get-docker/)
- **Docker Compose** (v2.0+) - [Install Docker Compose](https://docs.docker.com/compose/install/)
- **Domain Name** (for production) - Optional but recommended

---

## Quick Start

### 1. Clone and Configure

```bash
# Clone the repository
git clone <your-repo-url>
cd Smart-Campus-Notification-System

# Copy environment template
cp .env.production.example .env

# Edit .env with your production values
nano .env
```

### 2. Configure Environment Variables

Edit `.env` and fill in:

```env
# API URL for frontend
API_URL=https://your-domain.com/api

# MongoDB
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/uni-notify

# Authentication (Generate secure values!)
JWT_SECRET=generate-a-secure-64-char-string
JWT_REFRESH_SECRET=another-secure-64-char-string

# Email
EMAIL_USER=your-email@gmail.com
EMAIL_APP_PASSWORD=your-app-password

# Twilio (SMS)
TWILIO_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_NUMBER=+1234567890

# Firebase (Download service account JSON)
# Place as: backend/firebase-service-account-key.json

# AI Providers
GEMINI_API_KEY=your-gemini-key
GROQ_API_KEY=your-groq-key
```

### 3. Deploy

**Linux/Mac:**
```bash
chmod +x deploy.sh
./deploy.sh deploy
```

**Windows:**
```cmd
deploy.bat deploy
```

**Manual:**
```bash
docker-compose build --no-cache
docker-compose up -d
```

---

## Services

| Service | Port | Description |
|---------|------|-------------|
| Frontend | 3000 | React app (Nginx) |
| Backend | 8000 | Node.js API |
| MongoDB | 27017 | Database |
| Redis | 6379 | Job Queue |

---

## Deployment Commands

| Command | Description |
|---------|-------------|
| `./deploy.sh deploy` | Full deployment |
| `./deploy.sh start` | Start services |
| `./deploy.sh stop` | Stop services |
| `./deploy.sh restart` | Restart services |
| `./deploy.sh logs` | View logs |
| `./deploy.sh status` | Check status |
| `./deploy.sh rebuild` | Rebuild & restart |
| `./deploy.sh clean` | Clean up everything |

---

## Production Setup

### 1. Generate Secure Secrets

```bash
# Generate JWT secrets
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 2. SSL/HTTPS Setup

For production, enable SSL in `nginx/nginx.conf`:

```nginx
server {
    listen 443 ssl http2;
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    # ... rest of config
}
```

Mount certificates in `docker-compose.yml`:

```yaml
nginx:
  volumes:
    - /path/to/cert.pem:/etc/nginx/ssl/cert.pem:ro
    - /path/to/key.pem:/etc/nginx/ssl/key.pem:ro
```

### 3. Firewall Configuration

```bash
# Allow HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Allow Docker ports (if using remote)
sudo ufw allow 2375/tcp  # Docker daemon
```

### 4. Reverse Proxy (Production)

Update `frontend/.env`:

```env
VITE_API_URL=https://your-domain.com/api
```

Update `backend/.env`:

```env
FRONTEND_URL=https://your-domain.com
```

---

## Monitoring

### Check Container Health

```bash
docker-compose ps
docker-compose ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"
```

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend

# Last 100 lines
docker-compose logs --tail=100
```

### Resource Usage

```bash
docker stats
```

---

## Backup & Recovery

### Backup MongoDB

```bash
# Create backup directory
mkdir -p backups

# Backup database
docker-compose exec mongodb mongodump --archive=backups/backup_$(date +%Y%m%d).archive --db uni-notify
```

### Restore MongoDB

```bash
docker-compose exec -T mongodb mongorestore --archive=backups/backup_20240101.archive --nsFrom='uni-notify' --nsTo='uni-notify'
```

---

## Troubleshooting

### Container Won't Start

```bash
# Check logs
docker-compose logs backend

# Common issues:
# - Port already in use: change ports in docker-compose.yml
# - Missing env vars: ensure .env is configured
# - MongoDB connection: check MONGO_URI format
```

### Database Connection Issues

```bash
# Check MongoDB is running
docker-compose ps mongodb

# Test connection
docker-compose exec mongodb mongosh --eval "db.adminCommand('ping')"
```

### API Not Responding

```bash
# Check backend health
curl http://localhost:8000/

# Check backend logs
docker-compose logs backend --tail=50
```

---

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Deploy to Server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USERNAME }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd /opt/smart-campus
            docker-compose pull
            docker-compose up -d
```

---

## Security Checklist

- [ ] Change default passwords
- [ ] Use strong JWT secrets (64+ characters)
- [ ] Enable HTTPS/SSL
- [ ] Restrict MongoDB port access
- [ ] Configure firewall rules
- [ ] Set up monitoring/alerting
- [ ] Regular backup schedule
- [ ] Update Docker images regularly

---

## Support

For issues or questions, please open an issue on GitHub.

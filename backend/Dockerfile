# Smart Campus Notification System - Backend Dockerfile
# Multi-stage build for optimized production image

# ==========================================
# Stage 1: Dependencies
# ==========================================
FROM node:22-alpine AS deps

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# ==========================================
# Stage 2: Production
# ==========================================
FROM node:22-alpine AS production

WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy application code
COPY --chown=nodejs:nodejs . .

# Create necessary directories
RUN mkdir -p /app/uploads /app/backups && \
    chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:8000/', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

# Start application
ENV NODE_ENV=production
ENV PORT=8000

CMD ["node", "server.js"]

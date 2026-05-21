# =========================
# Stage 1: Dependencies
# =========================
FROM node:22-bookworm-slim AS deps

WORKDIR /app

# Install only dependency manifests first (cache optimization)
COPY package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev


# =========================
# Stage 2: Build (optional but recommended if using TS)
# =========================
FROM node:22-bookworm-slim AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Uncomment if using TypeScript or build step
# RUN npm run build


# =========================
# Stage 3: Runtime (FINAL IMAGE)
# =========================
FROM node:22-bookworm-slim AS runtime

WORKDIR /app

# Create non-root user (security hardening)
RUN groupadd -r nodejs && useradd -r -g nodejs nodejs

# Copy production dependencies
COPY --from=deps /app/node_modules ./node_modules

# Copy application code (built or raw)
COPY --from=build /app ./

# Create required runtime directories
RUN mkdir -p /app/uploads /app/logs && \
    chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Environment configuration
ENV NODE_ENV=production
ENV PORT=8000

# Expose service port
EXPOSE 8000

# Health check (real endpoint recommended)
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node healthcheck.js || exit 1

# Start application
CMD ["node", "server.js"]
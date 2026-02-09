# =============================================================================
# Endeavor SUPER CRM - Production Dockerfile
# Multi-stage build with security hardening
# =============================================================================

# -----------------------------------------------------------------------------
# Stage 1: Dependencies
# -----------------------------------------------------------------------------
FROM node:20-alpine AS dependencies

# Set working directory
WORKDIR /app

# Install dependencies first (for better layer caching)
COPY package*.json ./

# Install all dependencies (including devDependencies for build)
RUN npm ci --include=dev && npm cache clean --force

# -----------------------------------------------------------------------------
# Stage 2: Build
# -----------------------------------------------------------------------------
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Install security updates
RUN apk update && apk upgrade && apk add --no-cache dumb-init

# Copy dependencies from previous stage
COPY --from=dependencies /app/node_modules ./node_modules

# Copy source code
COPY . .

# Build arguments (passed from Coolify or CI/CD)
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_APP_ENV=production
ARG VITE_APP_VERSION
ARG VITE_SECURITY_HEADERS_ENABLED=true
ARG VITE_CSP_MODE=strict
ARG VITE_ENABLE_CACHE=true

# Set build-time environment variables
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY
ENV VITE_APP_ENV=$VITE_APP_ENV
ENV VITE_APP_VERSION=$VITE_APP_VERSION
ENV VITE_SECURITY_HEADERS_ENABLED=$VITE_SECURITY_HEADERS_ENABLED
ENV VITE_CSP_MODE=$VITE_CSP_MODE
ENV VITE_ENABLE_CACHE=$VITE_ENABLE_CACHE

# Build the application
RUN npm run build

# -----------------------------------------------------------------------------
# Stage 3: Production
# -----------------------------------------------------------------------------
FROM nginx:1.25-alpine-slim AS production

# Labels for maintainability
LABEL maintainer="Endeavor SUPER CRM Team" \
      version="1.0.0" \
      description="Endeavor SUPER CRM - Production Build" \
      org.opencontainers.image.source="https://github.com/your-org/endeavor-super-crm"

# Create non-root user for nginx
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001 && \
    chown -R nextjs:nodejs /var/cache/nginx && \
    chown -R nextjs:nodejs /var/log/nginx && \
    chown -R nextjs:nodejs /etc/nginx/conf.d && \
    touch /var/run/nginx.pid && \
    chown -R nextjs:nodejs /var/run/nginx.pid

# Install security updates
RUN apk update && \
    apk upgrade && \
    apk add --no-cache curl ca-certificates && \
    rm -rf /var/cache/apk/*

# Copy built assets from builder stage
COPY --from=builder --chown=nextjs:nodejs /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY --chown=nextjs:nodejs nginx.conf /etc/nginx/conf.d/default.conf

# Copy custom nginx security headers configuration
COPY --chown=nextjs:nodejs nginx-security.conf /etc/nginx/conf.d/security.conf

# Remove default nginx static assets
RUN rm -f /usr/share/nginx/html/index.html

# Set proper permissions
RUN chown -R nextjs:nodejs /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

# Health check script
COPY --chown=nextjs:nodejs docker-healthcheck.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-healthcheck.sh

# Health check for container
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD /usr/local/bin/docker-healthcheck.sh

# Expose port
EXPOSE 80

# Switch to non-root user
USER nextjs

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

# -----------------------------------------------------------------------------
# Stage 4: Development (optional, for local dev with Docker)
# -----------------------------------------------------------------------------
FROM node:20-alpine AS development

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --include=dev

# Copy source
COPY . .

# Expose port
EXPOSE 5176

# Start development server
CMD ["npm", "run", "dev"]

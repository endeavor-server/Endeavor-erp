# 🚀 Endeavor SUPER CRM - Deployment Guide

Complete deployment guide for production hosting via Coolify, Docker, or manual server setup.

---

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Deployment Methods](#deployment-methods)
  - [Coolify (Recommended)](#coolify-recommended)
  - [Docker Compose](#docker-compose)
  - [Manual Server Setup](#manual-server-setup)
- [Post-Deployment](#post-deployment)
- [Troubleshooting](#troubleshooting)
- [Security Checklist](#security-checklist)

---

## Prerequisites

### Required

- **Node.js** 18+ (for local development)
- **Docker** 20+ & Docker Compose (for containerized deployment)
- **Supabase Project** with configured:
  - Database schema
  - Authentication enabled
  - Row Level Security (RLS) policies
  - API keys generated

### Optional

- **Coolify** instance (self-hosted or managed)
- **Reverse Proxy** (nginx, traefik, or caddy)
- **SSL Certificate** (Let's Encrypt recommended)

---

## Environment Setup

### 1. Create Environment File

```bash
cp .env.example .env
```

### 2. Configure Required Variables

```bash
# Supabase Configuration (REQUIRED)
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
```

Get these from your Supabase Dashboard → Project Settings → API.

### 3. Optional Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_APP_NAME` | "Endeavor SUPER CRM" | Application name |
| `VITE_CSP_MODE` | "strict" | Content Security Policy mode |
| `VITE_LOG_LEVEL` | "warn" | Logging level |
| `VITE_API_TIMEOUT` | 30000 | API timeout (ms) |

---

## Deployment Methods

### Coolify (Recommended)

Coolify is a self-hosted Heroku/Netlify alternative with built-in SSL, auto-deploy, and monitoring.

#### Step 1: Prepare Repository

```bash
# Ensure all files are committed
git add .
git commit -m "Production deployment configuration"
git push origin main
```

#### Step 2: Coolify Configuration

1. **Login to Coolify Dashboard**
2. **Create New Resource** → "Application"
3. **Select Source**: Git Repository
4. **Configure Git**:
   - Repository: `your-org/endeavor-super-crm`
   - Branch: `main`
   - Build Pack: `Dockerfile`

#### Step 3: Environment Variables

Add these in Coolify's Environment Variables section:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_APP_ENV=production
VITE_SECURITY_HEADERS_ENABLED=true
VITE_CSP_MODE=strict
```

#### Step 4: Deployment Settings

| Setting | Value |
|---------|-------|
| Port | `80` |
| Health Check Path | `/health` |
| Health Check Port | `80` |
| Auto Deploy | Enabled |

#### Step 5: Deploy

Click **Deploy** → Wait for build → Access your domain!

---

### Docker Compose

For self-hosted deployment with Docker Compose.

#### Step 1: Configure Environment

```bash
# Create and edit .env file
nano .env
```

#### Step 2: Deploy

```bash
# Production deployment
docker-compose up -d --build

# View logs
docker-compose logs -f app

# Stop
docker-compose down

# Update (after code changes)
docker-compose up -d --build
```

#### Step 3: Verify

```bash
# Check health
curl http://localhost:5176/health

# Expected response:
# {"status":"healthy","service":"endeavor-super-crm","timestamp":"..."}
```

#### Step 4: Configure Reverse Proxy (Optional)

**nginx example:**

```nginx
server {
    listen 80;
    server_name crm.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name crm.yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:5176;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

### Manual Server Setup

For traditional server deployment without Docker.

#### Step 1: Install Dependencies

```bash
# Clone repository
git clone https://github.com/your-org/endeavor-super-crm.git
cd endeavor-super-crm

# Install dependencies
npm ci
```

#### Step 2: Build Application

```bash
# Set environment variables
export VITE_SUPABASE_URL=https://your-project.supabase.co
export VITE_SUPABASE_ANON_KEY=your-anon-key

# Build
npm run build

# Output will be in ./dist directory
```

#### Step 3: Serve with nginx

```bash
# Copy built files
sudo cp -r dist/* /var/www/crm/

# Copy nginx configuration
sudo cp nginx.conf /etc/nginx/sites-available/crm
sudo ln -s /etc/nginx/sites-available/crm /etc/nginx/sites-enabled/

# Test and reload nginx
sudo nginx -t
sudo systemctl reload nginx
```

---

## Post-Deployment

### Verification Checklist

- [ ] Application loads without errors
- [ ] Login functionality works
- [ ] All modules accessible based on role
- [ ] Real-time updates working (if enabled)
- [ ] Invoice/PDF generation works
- [ ] Health endpoint responds: `curl https://your-domain.com/health`

### SSL Certificate Setup

**Using Let's Encrypt with Certbot:**

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d crm.yourdomain.com

# Auto-renewal is configured automatically
```

### Monitoring Setup

**Health Checks:**

```bash
# Liveness probe
curl https://your-domain.com/health

# Readiness probe
curl https://your-domain.com/ready
```

**Uptime Monitoring (Optional):**

Configure external monitoring (UptimeRobot, Pingdom, etc.) to check `/health` endpoint.

---

## Troubleshooting

### Build Failures

**Issue**: Docker build fails with "Cannot find module"

```bash
# Clear npm cache and rebuild
npm cache clean --force
rm -rf node_modules
npm ci
```

**Issue**: Out of memory during build

```bash
# Increase Docker memory limit
docker build --memory=2g --memory-swap=2g .
```

### Runtime Issues

**Issue**: Blank page after deployment

```bash
# Check browser console for CSP errors
# If restrictive CSP, update VITE_CSP_MODE=relaxed
curl -I https://your-domain.com
```

**Issue**: 502 Bad Gateway

```bash
# Check if container is running
docker ps

# Check container logs
docker logs endeavor-super-crm

# Verify health endpoint
docker exec endeavor-super-crm wget http://localhost/health
```

**Issue**: Supabase connection errors

```bash
# Verify environment variables are set
docker exec endeavor-super-crm env | grep VITE_SUPABASE
```

### Performance Issues

**Issue**: Slow initial load

- Enable Gzip compression (enabled by default in nginx.conf)
- Enable Brotli compression (if nginx supports it)
- Check CDN configuration for static assets

**Issue**: High memory usage

```bash
# Monitor container stats
docker stats endeavor-super-crm

# Adjust resource limits in docker-compose.yml
```

---

## Security Checklist

### Pre-Deployment

- [ ] All secrets stored in environment variables (not in code)
- [ ] `.env` file added to `.gitignore`
- [ ] Supabase RLS policies configured
- [ ] Strong authentication enabled in Supabase
- [ ] Content Security Policy configured

### Post-Deployment

- [ ] HTTPS enforced (SSL certificate installed)
- [ ] Security headers verified
  ```bash
  curl -I https://your-domain.com | grep -E "X-Frame|X-Content|X-XSS|Content-Security"
  ```
- [ ] Sensitive endpoints protected (admin, /api)
- [ ] Rate limiting enabled (if supported by reverse proxy)
- [ ] Server tokens hidden (nginx: `server_tokens off;`)

### Regular Maintenance

- [ ] Update dependencies monthly: `npm audit fix`
- [ ] Review Supabase audit logs weekly
- [ ] Monitor error tracking dashboard
- [ ] Backup database regularly (Supabase handles this)
- [ ] Review and rotate API keys quarterly

---

## Rollback Procedure

If deployment fails:

```bash
# Using Docker Compose
docker-compose down
git checkout <previous-stable-commit>
docker-compose up -d --build

# Using Coolify
# Use Coolify's built-in rollback feature in the dashboard
```

---

## Support

For deployment issues:

1. Check logs: `docker-compose logs -f`
2. Review [Troubleshooting](#troubleshooting) section
3. Open issue with:
   - Deployment method used
   - Error messages
   - Environment (host OS, Docker version)

---

**Deployment Version**: 1.0.0  
**Last Updated**: 2026-02-09  
**Maintainer**: Endeavor SUPER CRM Team

# Production Launch Checklist

**Project:** Endeavor SUPER CRM  
**Version:** 1.0.0  
**Date:** 2026-02-09

---

## Pre-Launch Checklist

### 1. Environment Setup

#### 1.1 Server Requirements
- [ ] Linux server (Ubuntu 22.04 LTS recommended)
- [ ] Node.js 18+ installed
- [ ] Nginx installed
- [ ] PM2 installed (`npm install -g pm2`)
- [ ] Git installed

#### 1.2 Domain & SSL
- [ ] Domain registered (e.g., crm.endeavor.in)
- [ ] DNS A record pointing to server IP
- [ ] SSL certificate obtained (Let's Encrypt recommended)
- [ ] HTTPS redirect configured

#### 1.3 Supabase Setup
- [ ] Supabase project created
- [ ] Database migrations applied (see `supabase/schema.sql`)
- [ ] Row Level Security enabled
- [ ] Authentication providers configured
- [ ] API keys generated
- [ ] Backup policy configured

---

## Deployment Steps

### Step 1: Clone & Build
```bash
# Clone repository
git clone <repository-url> /var/www/endeavor-crm
cd /var/www/endeavor-crm

# Install dependencies
npm ci --production

# Create environment file
cat > .env << 'EOF'
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
EOF

# Build application
npm run build
```

### Step 2: Configure Nginx
```nginx
# /etc/nginx/sites-available/endeavor-crm
server {
    listen 80;
    server_name crm.endeavor.in;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name crm.endeavor.in;

    ssl_certificate /etc/letsencrypt/live/crm.endeavor.in/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/crm.endeavor.in/privkey.pem;

    root /var/www/endeavor-crm/dist;
    index index.html;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml;

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Handle SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy (if needed)
    location /api/ {
        proxy_pass http://localhost:3000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Step 3: Enable Site
```bash
sudo ln -s /etc/nginx/sites-available/endeavor-crm /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Step 4: Database Migration
```bash
# Connect to Supabase SQL Editor
# Run migration files in order:

1. supabase/schema.sql          # Core schema
2. supabase/schema_invoicing.sql # Invoice compliance

# Verify migrations
SELECT * FROM information_schema.tables WHERE table_schema = 'public';
```

---

## Post-Deployment Verification

### Functional Tests
- [ ] Homepage loads correctly
- [ ] Login page accessible
- [ ] Authentication works (all 6 roles)
- [ ] Dashboard displays data
- [ ] All modules accessible per role
- [ ] RBAC enforced correctly
- [ ] GST calculations accurate
- [ ] Invoice generation works
- [ ] PDF export functional
- [ ] Dark/light mode toggle works

### Security Tests
- [ ] HTTPS enforced
- [ ] Security headers present
- [ ] No console errors
- [ ] API calls use HTTPS
- [ ] Tokens stored securely
- [ ] Session timeout working

### Performance Tests
- [ ] Page load < 3 seconds
- [ ] Bundle size acceptable
- [ ] Images optimized
- [ ] Caching headers set
- [ ] Gzip enabled

---

## Configuration Reference

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| VITE_SUPABASE_URL | ✅ | - | Supabase project URL |
| VITE_SUPABASE_ANON_KEY | ✅ | - | Supabase anonymous key |
| PORT | ❌ | 5176 | Development server port |

### Supabase RLS Policies

**Automatically applied with migrations:**
- Invoice sequences: Admin-only modification
- Users can view their own data
- Role-based module access enforced

---

## Monitoring Setup (Post-Launch)

### Recommended Tools
1. **Uptime Monitoring:** UptimeRobot or Pingdom
2. **Error Tracking:** Sentry
3. **Analytics:** Google Analytics or Plausible
4. **Performance:** Lighthouse CI

### Health Check Endpoint
```bash
# Test application health
curl -f https://crm.endeavor.in/ || echo "Application down"

# Test API connectivity
curl -f https://your-project.supabase.co/rest/v1/ || echo "Database down"
```

---

## Backup & Recovery

### Database Backup
```bash
# Automated daily backups via Supabase
# Manual backup command:
pg_dump -h db.your-project.supabase.co -U postgres -d postgres > backup.sql
```

### Application Backup
```bash
# Backup build artifacts
tar -czf endeavor-crm-backup-$(date +%Y%m%d).tar.gz /var/www/endeavor-crm/dist
```

---

## Rollback Procedure

If deployment fails:

```bash
# 1. Disable new site
sudo rm /etc/nginx/sites-enabled/endeavor-crm

# 2. Restore previous version
sudo ln -s /etc/nginx/sites-available/endeavor-crm-old /etc/nginx/sites-enabled/

# 3. Restart nginx
sudo systemctl restart nginx

# 4. Notify team
```

---

## Launch Day Timeline

| Time | Task | Owner |
|------|------|-------|
| T-2h | Final backup | DevOps |
| T-1h | Deploy to staging | DevOps |
| T-30m | Smoke tests | QA |
| T-0 | Deploy to production | DevOps |
| T+15m | Health checks | DevOps |
| T+30m | Monitor metrics | DevOps |
| T+2h | User acceptance | Product |

---

## Emergency Contacts

| Role | Name | Contact | Escalation |
|------|------|---------|------------|
| Tech Lead | - | - | - |
| DevOps | - | - | - |
| Product | - | - | - |
| Supabase Support | - | support@supabase.io | - |

---

## Approval Signatures

| Role | Name | Date | Signature |
|------|------|------|-----------|
| CTO | | | |
| DevOps Lead | | | |
| Security Lead | | | |
| Product Owner | | | |

---

*Checklist Version: 1.0*  
*Last Updated: 2026-02-09*

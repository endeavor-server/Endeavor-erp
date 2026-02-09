# 🗄️ Supabase Setup Guide for Endeavor CRM

## Option 1: Managed Supabase (Recommended - Easiest)

1. **Go to https://supabase.com and sign up**

2. **Create new project:**
   - Organization: Endeavor Academy
   - Project name: endeavor-crm
   - Database password: (generate strong password)
   - Region: Mumbai (ap-south-1) - closest to India

3. **Get your credentials:**
   - Go to Project Settings → API
   - Copy these values:
   ```
   Project URL: https://xxxxxx.supabase.co
   anon public: eyJhbGciOiJIUzI1NiIs...
   ```

4. **Run database migrations:**
   - Go to SQL Editor
   - Copy contents of `supabase/schema.sql`
   - Paste and Run
   - Then run `supabase/schema_invoicing.sql`

5. **Done!** Use these credentials:
   ```
   VITE_SUPABASE_URL=https://xxxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
   ```

---

## Option 2: Self-Hosted Supabase (Full Control)

### Deploy to Coolify:

1. **Use the provided docker-compose.supabase.yml:**
```bash
# In Coolify, create new resource → Docker Compose
cat docker-compose.supabase.yml
```

2. **Set environment variables:**
```
POSTGRES_PASSWORD=your-secure-password
JWT_SECRET=your-jwt-secret-min-32-chars
SITE_URL=https://crm.endeavoracademy.us
API_EXTERNAL_URL=https://api-crm.endeavoracademy.us
```

3. **Access URLs after deploy:**
   - CRM App: `https://crm.endeavoracademy.us`
   - Supabase API: `https://api-crm.endeavoracademy.us`
   - Supabase Studio: `https://studio.endeavoracademy.us`
   - Mailpit: `https://mail.endeavoracademy.us`

---

## Option 3: Quick Local Testing (Docker)

```bash
# Start everything locally
docker-compose -f docker-compose.supabase.yml up -d

# Access:
# - CRM: http://localhost
# - Supabase Studio: http://localhost:3001
# - API: http://localhost:8000

# Default credentials:
# URL: http://localhost:8000
# Anon Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlc3QiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTcwMDAwMDAwMCwiZXhwIjoyMDE1MjI4MDAwfQ.test
```

---

## 📋 Database Schema Setup

After Supabase is running, execute these SQL files in order:

1. **supabase/schema.sql** - Main database schema
2. **supabase/schema_invoicing.sql** - Invoice compliance tables
3. **supabase/indexes.sql** - Performance indexes (optional)

---

## 🔐 Security Checklist

- [ ] Change default passwords
- [ ] Enable Row Level Security (RLS) - already in schema
- [ ] Set up SSL/TLS for production
- [ ] Configure CORS origins
- [ ] Enable 2FA in Supabase dashboard

---

## 🆘 Troubleshooting

**Issue: Cannot connect to database**
- Check if port 5432 is open
- Verify POSTGRES_PASSWORD

**Issue: Auth not working**
- Ensure JWT_SECRET is same across all services
- Check Kong logs: `docker logs endeavor-crm-kong`

**Issue: CRM not loading**
- Check VITE_SUPABASE_URL is correct
- Verify network connectivity between containers

---

## 💡 Recommendation

For production use **Option 1 (Managed Supabase)** - it's:
- Free tier available (500MB database)
- Automatic backups
- Built-in authentication
- Real-time subscriptions
- No maintenance overhead

For development/testing use **Option 3 (Local Docker)**.

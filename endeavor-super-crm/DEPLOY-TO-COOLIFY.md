# 🚀 Deploy to Coolify - Quick Start

**⚡ Recommended: Option 1 (Fastest - 5 minutes)**

## Option 1: Simple Deploy (Using Managed Supabase)

### Step 1: Create Supabase Project (2 mins)
1. Go to https://supabase.com
2. Create new project
3. Get credentials from Settings → API:
   - Project URL: `https://xxxx.supabase.co`
   - Anon Key: `eyJhbGciOiJIUzI1NiIs...`

### Step 2: Run Database Migrations (1 min)
In Supabase SQL Editor, run:
1. Copy contents of `supabase/schema.sql`
2. Run the SQL
3. Run `supabase/schema_invoicing.sql`

### Step 3: Deploy to Coolify (2 mins)
1. Go to https://coolify.endeavoracademy.us
2. Projects → Endeavor Academy → + New Resource
3. Choose **"Dockerfile"**
4. Settings:
   - Name: `Endeavor Super CRM`
   - Repository: Upload the project files
   - Dockerfile: `/Dockerfile`
   - Port: `80`
5. Environment Variables:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
6. Click **Deploy**

### Access URLs After Deploy:
- **CRM:** https://endeavor-super-crm.endeavoracademy.us
- **Supabase Studio:** https://your-project.supabase.co

---

## Option 2: Manual Deploy via Coolify UI

1. **Push code to GitHub:**
```bash
git add .
git commit -m "Complete CRM - All phases 2-7"
git push origin main
```

2. **In Coolify Dashboard (https://coolify.endeavoracademy.us):**
   - Go to Projects → Endeavor Academy → Production
   - Click "+ New Resource"
   - Select "Public Repository"
   - Repository: `https://github.com/YOUR_USERNAME/endeavor-super-crm`
   - Branch: `main`
   - Build Pack: `Dockerfile`
   - Port: `80`
   - Click "Continue"

3. **Set Environment Variables:**
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

4. **Click "Deploy"**

## Option 2: API Deploy (Using Provided Token)

Run this curl command:

```bash
# Set your GitHub repo URL
REPO_URL="https://github.com/YOUR_USERNAME/endeavor-super-crm"

# Deploy via Coolify API
curl -X POST \
  -H "Authorization: Bearer 1|M0sPjnOn4HJkXVjqLvdysAWaNyruJcHPeJJ2SaNJfd51bf7f" \
  -H "Content-Type: application/json" \
  -d "{
    \"project_uuid\": \"skgcc8okg8sgs44occg44gww\",
    \"environment_uuid\": \"bossg0w40ko8g4w8gwo8so4c\",
    \"server_uuid\": \"jkk4o4804ggsgkw4k40okow4\",
    \"git_repository\": \"$REPO_URL\",
    \"git_branch\": \"main\",
    \"build_pack\": \"dockerfile\",
    \"name\": \"Endeavor Super CRM\",
    \"description\": \"Enterprise CRM with GST compliance\",
    \"ports_exposes\": \"80\",
    \"dockerfile_location\": \"/Dockerfile\",
    \"instant_deploy\": false
  }" \
  https://coolify.endeavoracademy.us/api/v1/applications/public
```

Then configure environment variables in the Coolify UI.

## Option 3: Docker Compose (Self-Hosted)

On your server:
```bash
# Extract the project
tar -xzf endeavor-super-crm-complete.tar.gz
cd endeavor-super-crm

# Create .env file
cp .env.example .env
# Edit .env with your Supabase credentials

# Deploy with docker-compose
docker-compose up -d
```

## Post-Deployment Checklist

- [ ] Set domain (e.g., `crm.endeavoracademy.us`)
- [ ] Configure SSL certificate
- [ ] Set health check endpoint: `/health`
- [ ] Test login with demo credentials
- [ ] Verify GST calculations

## Demo Credentials (After Deploy)

| Email | Password | Role |
|-------|----------|------|
| admin@endeavor.in | admin123 | Super Admin |
| ops@endeavor.in | ops123 | Operations |
| client@acme.com | client123 | Client |

---

## Need Help?

Check the full deployment guide: `DEPLOYMENT-GUIDE.md`

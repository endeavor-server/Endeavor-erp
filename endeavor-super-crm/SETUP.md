# Supabase Setup Instructions

## Connected Project

**Project URL:** https://wmlvwujfefkpilfljosa.supabase.co
**Status:** Connected ✅

---

## Step 1: Run Database Migrations

1. Go to: https://wmlvwujfefkpilfljosa.supabase.co/project/default/sql

2. Copy and paste the contents of `supabase/schema.sql`

3. Click "Run"

4. Wait for completion

5. Then run `supabase/schema_invoicing.sql`

---

## Step 2: Set Environment Variables in Codespaces

In your Codespaces terminal:

```bash
cat > .env.local << 'EOF'
VITE_SUPABASE_URL=https://wmlvwujfefkpilfljosa.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_j1kHtoX0GAfjhcrr1iqKgw_MbXj7n-y
EOF
```

---

## Step 3: Restart Dev Server

```bash
Ctrl+C
npm run dev
```

---

## Step 4: Test Login

Use the demo accounts:
- admin@endeavor.in / admin123
- ops@endeavor.in / ops123
- client@acme.com / client123
- freelancer@dev.com / freelancer123

---

## Database Password (for reference)
2025$Supabase

# Endeavor SUPER CRM - Troubleshooting Guide

**Version:** 1.0.0  
**Last Updated:** 2026-02-09

---

## Quick Diagnostics

### System Health Check

Run this checklist first:

```bash
# 1. Check if app is running
curl -I https://crm.endeavor.in

# 2. Check Supabase connectivity
curl -I https://your-project.supabase.co/rest/v1/

# 3. Verify environment variables
echo $VITE_SUPABASE_URL
echo $VITE_SUPABASE_ANON_KEY

# 4. Check disk space
df -h

# 5. Check memory usage
free -m
```

---

## Common Issues & Solutions

### 1. Login Problems

#### Issue: "Invalid email or password"

**Check:**
1. Caps Lock is off
2. Email has no extra spaces
3. Using correct domain (@endeavor.in vs external)

**Solution:**
```javascript
// Reset password via Supabase
await supabase.auth.resetPasswordForEmail('user@example.com');
```

#### Issue: "Account is inactive"

**Cause:** User account has been deactivated

**Solution:**
1. Contact admin@endeavor.in
2. Provide user's email address
3. Admin reactivates in Admin → Users

#### Issue: Session expires too quickly

**Cause:** JWT token expiry (1 hour default)

**Solution:**
- System auto-refreshes 5 minutes before expiry
- If persistent, check browser localStorage permissions
- Clear browser cache and re-login

---

### 2. Invoice Issues

#### Issue: "GST Validation Failed"

**Common Causes:**

| Error Message | Cause | Fix |
|---------------|-------|-----|
| CGST and SGST must be equal | Rounding difference | CGST and SGST recalculated to match |
| IGST must be 0 for intra-state | Wrong transaction type | Check client state matches company state |
| Invalid GST rate | Rate not in {0,5,12,18,28} | Use standard GST rates only |
| Total GST mismatch | Calculation error | Verify line item totals |

**Debug Commands:**
```sql
-- Check invoice GST calculation
SELECT 
  invoice_number,
  taxable_amount,
  cgst_amount,
  sgst_amount,
  igst_amount,
  (cgst_amount + sgst_amount + igst_amount) as calculated_gst,
  (taxable_amount * 0.18) as expected_gst
FROM invoices 
WHERE id = 'uuid';
```

#### Issue: "Duplicate invoice number"

**Cause:** Attempting to use existing invoice number

**Solution:**
1. Let system auto-generate number
2. Check for existing: `SELECT * FROM invoices WHERE invoice_number = '...'`
3. If truly unique, check audit log for sequence issues

#### Issue: Invoice total doesn't match line items

**Debug:**
```sql
-- Sum line items
SELECT 
  i.invoice_number,
  i.total_amount as invoice_total,
  SUM(li.total_amount) as line_items_total
FROM invoices i
LEFT JOIN invoice_line_items li ON i.id = li.invoice_id
WHERE i.id = 'uuid'
GROUP BY i.id, i.invoice_number, i.total_amount;
```

**Fix:**
```sql
-- Recalculate invoice totals
UPDATE invoices 
SET 
  subtotal = (SELECT SUM(taxable_value) FROM invoice_line_items WHERE invoice_id = 'uuid'),
  total_amount = (SELECT SUM(total_amount) FROM invoice_line_items WHERE invoice_id = 'uuid')
WHERE id = 'uuid';
```

---

### 3. Database Issues

#### Issue: "Connection refused" or timeout

**Check:**
1. Supabase project status (dashboard)
2. Network connectivity: `ping your-project.supabase.co`
3. Connection pool exhaustion

**Solutions:**

```javascript
// Check connection
const { data, error } = await supabase.from('invoices').select('id').limit(1);
if (error) console.error('Connection failed:', error);
```

**Increase timeout:**
```typescript
const supabase = createClient(url, key, {
  db: {
    schema: 'public',
    autoRefreshToken: true,
    persistSession: true
  }
});
```

#### Issue: Row Level Security blocking access

**Symptoms:**
- Query returns empty results
- Error: "new row violates row-level security policy"

**Check RLS policies:**
```sql
-- View policies
SELECT * FROM pg_policies WHERE tablename = 'invoices';

-- Check user role
SELECT auth.jwt() ->> 'role';
```

**Solution:**
```sql
-- Grant appropriate permissions
CREATE POLICY "Enable read for authenticated users"
ON invoices FOR SELECT
TO authenticated
USING (true);
```

#### Issue: Slow queries

**Diagnose:**
```sql
-- Check for missing indices
SELECT 
  schemaname, tablename, attname as column
FROM pg_stats 
WHERE tablename = 'invoices';

-- Analyze query plan
EXPLAIN ANALYZE SELECT * FROM invoices WHERE status = 'pending';
```

**Common fixes:**
```sql
-- Add missing index
CREATE INDEX idx_invoices_status_date ON invoices(status, invoice_date);

-- Vacuum analyze
VACUUM ANALYZE invoices;
```

---

### 4. GST Compliance Issues

#### Issue: Wrong GST type calculated

**Problem:** IGST calculated instead of CGST+SGST (or vice versa)

**Check:**
```javascript
import { isIntraStateTransaction } from './utils/gstCalculations';

const clientState = '27'; // Maharashtra
const companyState = '27'; // Maharashtra

console.log(isIntraStateTransaction(clientState, companyState)); 
// Should be true for intra-state
```

**Fix:**
1. Verify client's state is correctly stored
2. Check GSTIN extraction: first 2 digits = state code
3. Update contact record if state is wrong

#### Issue: GSTR-1 export fails

**Check JSON structure:**
```javascript
const gstr1Data = generateGSTR1Summary(invoices);

// Validate structure
console.assert(gstr1Data.b2b !== undefined, 'Missing B2B data');
console.assert(gstr1Data.b2cs !== undefined, 'Missing B2CS data');
console.assert(gstr1Data.hsn !== undefined, 'Missing HSN data');
```

**Common fixes:**
- Ensure all invoices have required fields (invoice_number, date, amounts)
- Verify GSTIN format for B2B invoices
- Check for null values in taxable amounts

---

### 5. TDS Issues

#### Issue: TDS not calculating

**Check threshold:**
```javascript
// TDS only applies if:
// 1. Single payment > ₹30,000 OR
// 2. Annual aggregate > ₹1,00,000 (for 194C)

const payment = { amount: 25000, section: '194C' };
// This won't have TDS deducted (below threshold)
```

#### Issue: Wrong TDS rate applied

**Verify party type:**
```javascript
calculateTDS({
  amount: 50000,
  section: '194C',
  isCompany: true, // Company rate = 2%
  // isCompany: false, // Individual rate = 1%
});
```

---

### 6. Build & Deployment Issues

#### Issue: "Cannot find module"

**Cause:** Missing node_modules or import path error

**Fix:**
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Check TypeScript paths
cat tsconfig.json | grep -A 5 paths
```

#### Issue: Build fails with TypeScript errors

**Current known issues:**
```
tdsCalculations.ts: Type union refinement needed
```

**Workaround:**
```json
// tsconfig.json - temporarily relax strict mode
{
  "compilerOptions": {
    "strict": false
  }
}
```

**Proper fix:** Update type definitions in `tdsCalculations.ts`

#### Issue: Environment variables not loading

**Check:**
```bash
# Verify .env file exists
cat .env

# Check variable names (must start with VITE_)
echo "VITE_SUPABASE_URL=$VITE_SUPABASE_URL"

# In code, access via:
# import.meta.env.VITE_SUPABASE_URL
```

#### Issue: 404 on refresh (SPA routing)

**Nginx fix:**
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

---

### 7. Performance Issues

#### Issue: Slow page load

**Diagnose:**
1. Open Chrome DevTools → Network tab
2. Check for:
   - Large bundle size (> 500KB gzipped)
   - Too many API requests
   - Slow database queries
   - Missing cache headers

**Solutions:**

```javascript
// Lazy load modules
const FinanceModule = lazy(() => import('./modules/finance/FinanceModule'));

// Memoize expensive calculations
const gstCalculation = useMemo(() => 
  calculateGST(amount, rate, isIntraState), 
  [amount, rate, isIntraState]
);
```

**Nginx caching:**
```nginx
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

#### Issue: API calls timing out

**Implement retry logic:**
```typescript
const fetchWithRetry = async (fn, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(r => setTimeout(r, 1000 * (i + 1)));
    }
  }
};
```

---

### 8. Authentication Issues

#### Issue: "JWT expired" errors

**Cause:** Token not refreshing automatically

**Fix:**
```typescript
// Ensure refresh timer is set
useEffect(() => {
  const interval = setInterval(() => {
    refreshToken();
  }, 55 * 60 * 1000); // Refresh every 55 minutes
  
  return () => clearInterval(interval);
}, []);
```

#### Issue: CORS errors

**Supabase settings:**
1. Go to Supabase Dashboard → API → URL Settings
2. Add your domain to "Allowed Origins"
3. For local dev, add `http://localhost:5176`

---

## Error Log Reference

### Application Logs

Location: Browser Console + Supabase Logs

```javascript
// Enable debug logging
localStorage.setItem('debug', 'true');

// View auth logs
console.log(localStorage.getItem('auth_audit_logs'));
```

### Database Logs

Supabase Dashboard → Logs → Postgres

```sql
-- View recent errors
SELECT * FROM pg_log 
WHERE log_time > NOW() - INTERVAL '1 hour'
AND error_severity IN ('ERROR', 'FATAL')
ORDER BY log_time DESC;
```

---

## Emergency Recovery

### Database Rollback

```bash
# Restore from backup
psql -h db.your-project.supabase.co -U postgres < backup.sql

# Or use Supabase CLI
supabase db restore backup-file.sql
```

### Application Rollback

```bash
# Rollback to previous version
git log --oneline -10
git checkout <previous-commit>
npm ci
npm run build
sudo systemctl restart nginx
```

---

## Support Escalation

### Level 1 - Self-Service
1. Check this troubleshooting guide
2. Review application logs
3. Try common fixes

### Level 2 - Technical Lead
- Email: tech-lead@endeavor.in
- Include:
  - Error screenshot
  - Browser console logs
  - Steps to reproduce

### Level 3 - Supabase Support
- URL: support.supabase.io
- Include:
  - Project reference ID
  - Error timestamps
  - Request ID from response headers

---

## Debugging Tools

### Browser Extensions
- **React DevTools:** Component inspection
- **Redux DevTools:** State management (if using)
- **Supabase Studio:** Database management

### CLI Tools
```bash
# Check API endpoints
http GET https://your-project.supabase.co/rest/v1/invoices \
  apikey:your-anon-key \
  Authorization:"Bearer jwt-token"

# Monitor network
npm install -g wscat
wscat -c wss://your-project.supabase.co/realtime/v1/websocket
```

---

## Quick Fixes Reference

| Problem | Quick Fix |
|---------|-----------|
| White screen | Hard refresh (Ctrl+Shift+R) |
| Login loop | Clear cookies and localStorage |
| Data not syncing | Check network, refresh page |
| Slow UI | Close unused browser tabs |
| Invoice error | Check all required fields |
| Calculation wrong | Verify state codes |
| Can't save | Check for validation errors |
| PDF not generating | Check popup blocker |

---

*Endeavor SUPER CRM - Troubleshooting Guide*

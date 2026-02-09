# Endeavor SUPER CRM - API Documentation

**Version:** 1.0.0  
**Base URL:** `https://your-project.supabase.co/rest/v1`  
**Authentication:** JWT Bearer Token

---

## Table of Contents

1. [Authentication](#authentication)
2. [Core Endpoints](#core-endpoints)
3. [Invoice API](#invoice-api)
4. [GST Calculation API](#gst-calculation-api)
5. [TDS Calculation API](#tds-calculation-api)
6. [Database Schema](#database-schema)
7. [Error Codes](#error-codes)
8. [Rate Limiting](#rate-limiting)

---

## Authentication

### JWT Token

All API requests require a valid JWT token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

### Obtaining a Token

```javascript
// Using Supabase client
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
});

const token = data.session.access_token;
```

### Token Refresh

Tokens expire after 1 hour. Use the refresh token to get a new access token:

```javascript
const { data, error } = await supabase.auth.refreshSession();
```

---

## Core Endpoints

### Supabase REST API

The CRM uses Supabase's auto-generated REST API. Standard operations:

| Method | Description |
|--------|-------------|
| GET | Retrieve records |
| POST | Create records |
| PATCH | Update records |
| DELETE | Delete records |

### Headers Required

```
apikey: <supabase-anon-key>
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

---

## Invoice API

### Create Invoice

**Endpoint:** `POST /rest/v1/invoices`

**Request Body:**
```json
{
  "invoice_type": "client",
  "contact_id": "uuid",
  "invoice_number": "INV/2024-25/00001",
  "invoice_date": "2024-12-15",
  "due_date": "2025-01-15",
  "subtotal": 100000,
  "taxable_amount": 100000,
  "is_gst_applicable": true,
  "gst_type": "cgst_sgst",
  "cgst_rate": 9,
  "sgst_rate": 9,
  "igst_rate": 0,
  "cgst_amount": 9000,
  "sgst_amount": 9000,
  "igst_amount": 0,
  "total_amount": 118000,
  "status": "draft"
}
```

**Response:**
```json
{
  "id": "uuid",
  "invoice_number": "INV/2024-25/00001",
  "created_at": "2024-12-15T10:30:00Z"
}
```

### Create Invoice Line Items

**Endpoint:** `POST /rest/v1/invoice_line_items`

**Request Body:**
```json
{
  "invoice_id": "uuid",
  "item_description": "Web Development Services",
  "hsn_sac_code": "998314",
  "quantity": 1,
  "unit": "project",
  "unit_price": 100000,
  "taxable_value": 100000,
  "gst_rate": 18,
  "gst_amount": 18000,
  "total_amount": 118000
}
```

### Get Invoice with Line Items

**Endpoint:** `GET /rest/v1/invoices`

**Query Parameters:**
```
select=*,line_items:invoice_line_items(*),contacts(*)
id=eq.<invoice_id>
```

**Response:**
```json
[
  {
    "id": "uuid",
    "invoice_number": "INV/2024-25/00001",
    "contacts": {
      "first_name": "John",
      "last_name": "Doe",
      "company_name": "Tech Solutions"
    },
    "line_items": [
      {
        "item_description": "Web Development Services",
        "taxable_value": 100000,
        "gst_amount": 18000,
        "total_amount": 118000
      }
    ]
  }
]
```

### Update Invoice Status

**Endpoint:** `PATCH /rest/v1/invoices`

**Query Parameters:**
```
id=eq.<invoice_id>
```

**Request Body:**
```json
{
  "status": "sent",
  "sent_at": "2024-12-15T12:00:00Z"
}
```

### List Invoices

**Endpoint:** `GET /rest/v1/invoices`

**Query Parameters:**
```
select=*,contacts(company_name)
status=eq.paid
order=created_at.desc
limit=10
offset=0
```

---

## GST Calculation API

### Calculate GST

**Function:** `calculateGST()` (Client-side utility)

**Usage:**
```typescript
import { calculateGST, isIntraStateTransaction } from './utils/gstCalculations';

const isIntraState = isIntraStateTransaction('27', '07'); // false (MH to DL)
const result = calculateGST(100000, 18, isIntraState);

// Result:
{
  taxableValue: 100000,
  cgstRate: 0,
  sgstRate: 0,
  igstRate: 18,
  cgstAmount: 0,
  sgstAmount: 0,
  igstAmount: 18000,
  totalGST: 18000,
  totalAmount: 118000,
  gstType: 'igst'
}
```

### Validate GSTIN

**Function:** `isValidGSTIN()`

**Usage:**
```typescript
import { isValidGSTIN } from './utils/gstCalculations';

const isValid = isValidGSTIN('27AABCU9603R1ZX'); // true
```

### Get State Code from GSTIN

**Function:** `getStateCodeFromGSTIN()`

**Usage:**
```typescript
import { getStateCodeFromGSTIN, STATE_CODES } from './utils/gstCalculations';

const stateCode = getStateCodeFromGSTIN('27AABCU9603R1ZX'); // '27'
const stateName = STATE_CODES[stateCode]; // 'Maharashtra'
```

### Generate GSTR-1 Summary

**Function:** `generateGSTR1Summary()`

**Usage:**
```typescript
import { generateGSTR1Summary } from './utils/gstCalculations';

const invoices = [/* invoice data */];
const gstr1Data = generateGSTR1Summary(invoices);

// Returns:
{
  b2b: [...],     // Business to Business
  b2cs: [...],    // Business to Consumer Small
  hsn: [...],     // HSN summary
  totalTaxable: 1000000,
  totalCGST: 90000,
  totalSGST: 90000,
  totalIGST: 180000
}
```

---

## TDS Calculation API

### Calculate TDS

**Function:** `calculateTDS()` (Client-side utility)

**Usage:**
```typescript
import { calculateTDS, TDS_SECTIONS } from './utils/tdsCalculations';

const result = calculateTDS({
  amount: 50000,
  section: '194J',
  isCompany: false,
  financialYear: '2024-25'
});

// Result:
{
  tdsAmount: 5000,
  netAmount: 45000,
  tdsRate: 10,
  section: '194J',
  thresholdBreached: true
}
```

### TDS Sections Reference

| Section | Description | Individual Rate | Company Rate | Threshold |
|---------|-------------|-----------------|--------------|-----------|
| 192 | Salary | Slab-based | Slab-based | - |
| 194C | Contractor | 1% | 2% | ₹30,000/₹1,00,000 |
| 194J | Professional | 10% | 10% | ₹30,000 |
| 194H | Commission | 5% | 5% | ₹15,000 |

---

## Database Schema

### Core Tables

#### invoices
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| invoice_number | VARCHAR(50) | Unique invoice number |
| invoice_type | VARCHAR(20) | client/freelancer/contractor/vendor |
| contact_id | UUID | FK to contacts (for client invoices) |
| freelancer_id | UUID | FK to freelancers |
| contractor_id | UUID | FK to contractors |
| vendor_id | UUID | FK to vendors |
| invoice_date | DATE | Invoice date |
| due_date | DATE | Payment due date |
| subtotal | DECIMAL(12,2) | Pre-tax amount |
| taxable_amount | DECIMAL(12,2) | GST-taxable amount |
| cgst_amount | DECIMAL(12,2) | CGST value |
| sgst_amount | DECIMAL(12,2) | SGST value |
| igst_amount | DECIMAL(12,2) | IGST value |
| total_amount | DECIMAL(12,2) | Final amount |
| status | VARCHAR(20) | draft/sent/paid/overdue |

#### freelancers
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| freelancer_code | VARCHAR(20) | Unique identifier |
| email | VARCHAR(255) | Contact email |
| skills | TEXT[] | Array of skills |
| hourly_rate | DECIMAL(10,2) | Rate per hour |
| availability | VARCHAR(20) | available/busy/unavailable |
| pan_number | VARCHAR(10) | PAN for TDS |
| tds_rate | DECIMAL(5,2) | Default 10% |

#### contacts
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| contact_type | VARCHAR(20) | lead/prospect/customer/partner |
| company_name | VARCHAR(200) | Organization name |
| gst_number | VARCHAR(15) | GSTIN |
| state | VARCHAR(50) | For GST calculation |

### Database Functions

#### `get_next_invoice_number(prefix, financial_year, company_id)`
Atomically generates the next invoice number.

**Parameters:**
- `prefix` - INV, FCO, CON, FVE
- `financial_year` - YYYY-YY format
- `company_id` - Optional for multi-company

**Returns:** Formatted invoice number (e.g., "INV/2024-25/00001")

#### `validate_gst_calculation(taxable_amount, cgst, sgst, igst, rate, is_intra_state)`
Validates GST calculations against taxable amount.

**Returns:** `{ is_valid: boolean, error_message: text }`

---

## Error Codes

### HTTP Status Codes

| Code | Meaning | Resolution |
|------|---------|------------|
| 200 | Success | - |
| 201 | Created | - |
| 400 | Bad Request | Check request body |
| 401 | Unauthorized | Re-authenticate |
| 403 | Forbidden | Check permissions |
| 404 | Not Found | Verify resource ID |
| 409 | Conflict | Duplicate or constraint violation |
| 422 | Unprocessable Entity | Validation failed |
| 429 | Rate Limited | Wait and retry |
| 500 | Server Error | Contact support |

### Validation Errors

| Code | Description |
|------|-------------|
| GST001 | Invalid GST rate (must be 0, 5, 12, 18, 28) |
| GST002 | CGST/SGST must be equal for intra-state |
| GST003 | IGST must be 0 for intra-state |
| INV001 | Invalid invoice number format |
| INV002 | Duplicate invoice number |
| TDS001 | Invalid TDS section |

---

## Rate Limiting

### Supabase Limits

| Plan | Requests/second | Burst capacity |
|------|-----------------|----------------|
| Free | 10 | 100 |
| Pro | 100 | 1000 |

### Best Practices

1. **Batch operations:** Use `in` filter instead of multiple requests
2. **Cache responses:** Cache reference data (HSN codes, state codes)
3. **Debounce inputs:** Wait for typing to stop before search
4. **Optimistic updates:** Update UI before API confirmation

### Example: Efficient Query

```typescript
// ❌ Inefficient: Multiple requests
const invoices = await Promise.all(
  ids.map(id => supabase.from('invoices').select('*').eq('id', id))
);

// ✅ Efficient: Single request with filter
const { data } = await supabase
  .from('invoices')
  .select('*')
  .in('id', ids);
```

---

## Webhooks

### Real-time Subscriptions

Subscribe to database changes:

```typescript
const subscription = supabase
  .channel('invoices')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'invoices' },
    (payload) => {
      console.log('Invoice changed:', payload);
    }
  )
  .subscribe();
```

### Events

| Event | Trigger |
|-------|---------|
| INSERT | New invoice created |
| UPDATE | Invoice modified |
| DELETE | Invoice deleted |

---

## SDK Examples

### JavaScript/TypeScript

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

// Create invoice
const { data, error } = await supabase
  .from('invoices')
  .insert({
    invoice_type: 'client',
    contact_id: 'uuid',
    total_amount: 118000
  })
  .select()
  .single();
```

### cURL

```bash
# Get invoices
curl -X GET 'https://your-project.supabase.co/rest/v1/invoices?select=*' \
  -H "apikey: your-anon-key" \
  -H "Authorization: Bearer jwt-token"

# Create invoice
curl -X POST 'https://your-project.supabase.co/rest/v1/invoices' \
  -H "apikey: your-anon-key" \
  -H "Authorization: Bearer jwt-token" \
  -H "Content-Type: application/json" \
  -d '{
    "invoice_type": "client",
    "total_amount": 118000
  }'
```

---

## Changelog

### v1.0.0 (2026-02-09)
- Initial API release
- Core invoice CRUD operations
- GST calculation endpoints
- TDS calculation utilities
- Real-time subscriptions

---

*Endeavor SUPER CRM API Documentation*

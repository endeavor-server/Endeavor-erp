# Database Indexes for Performance Optimization

## Overview

This document outlines the recommended database indexes for Supabase to handle 900+ workforce and thousands of invoices with optimal query performance.

## Index Strategy

### Core Principle
- **Query Frequency**: Index fields used in WHERE, JOIN, ORDER BY clauses
- **Cardinality**: High cardinality fields benefit most from indexes
- **Trade-offs**: Each index adds write overhead, index only what's queried

---

## Tables & Recommended Indexes

### 1. Freelancers Table (600+ records)

```sql
-- Primary lookups
CREATE INDEX idx_freelancers_email ON freelancers(email);
CREATE INDEX idx_freelancers_status ON freelancers(status) WHERE status = 'active';

-- Skill-based searches (array operations)
CREATE INDEX idx_freelancers_skills ON freelancers USING GIN(skills);
CREATE INDEX idx_freelancers_primary_skill ON freelancers(primary_skill);

-- Availability filtering
CREATE INDEX idx_freelancers_availability ON freelancers(availability) WHERE availability = 'available';

-- Rating-based sorting
CREATE INDEX idx_freelancers_rating ON freelancers(rating DESC);

-- Geographic filtering
CREATE INDEX idx_freelancers_city ON freelancers(city);

-- Pagination (cursor-based)
CREATE INDEX idx_freelancers_created_sort ON freelancers(created_at DESC, id DESC);

-- Composite index for common queries
CREATE INDEX idx_freelancers_active_skills ON freelancers(status, primary_skill) 
  WHERE status = 'active';
```

**Usage Examples:**
- `select * from freelancers where status = 'active' and skills @> ARRAY['React']`
- `select * from freelancers order by created_at desc limit 20`
- `select * from freelancers where availability = 'available' and city = 'Bangalore'`

---

### 2. Employees Table (100+ records)

```sql
-- Common lookups
CREATE INDEX idx_employees_email ON employees(email);
CREATE INDEX idx_employees_employee_code ON employees(employee_code);

-- Department filtering
CREATE INDEX idx_employees_department ON employees(department);

-- HR queries
CREATE INDEX idx_employees_status ON employees(status);
CREATE INDEX idx_employees_doj ON employees(date_of_joining);

-- Manager relationship
CREATE INDEX idx_employees_reporting_manager ON employees(reporting_manager_id);

-- Pagination
CREATE INDEX idx_employees_created_sort ON employees(created_at DESC, id DESC);
```

---

### 3. Invoices Table (1000+ records)

```sql
-- Invoice number lookups
CREATE INDEX idx_invoices_number ON invoices(invoice_number);

-- Status filtering (very common)
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_status_date ON invoices(status, invoice_date) 
  WHERE status IN ('draft', 'sent', 'overdue');

-- Date range queries
CREATE INDEX idx_invoices_date ON invoices(invoice_date);
CREATE INDEX idx_invoices_due_date ON invoices(due_date) 
  WHERE status NOT IN ('paid', 'cancelled');

-- Foreign key lookups
CREATE INDEX idx_invoices_contact ON invoices(contact_id);
CREATE INDEX idx_invoices_freelancer ON invoices(freelancer_id);
CREATE INDEX idx_invoices_contractor ON invoices(contractor_id);
CREATE INDEX idx_invoices_vendor ON invoices(vendor_id);

-- Type filtering
CREATE INDEX idx_invoices_type ON invoices(invoice_type);

-- Financial queries
CREATE INDEX idx_invoices_amount_pending ON invoices(total_amount) 
  WHERE status IN ('sent', 'viewed', 'partial');

-- Payment tracking
CREATE INDEX idx_invoices_paid ON invoices(paid_at) WHERE status = 'paid';

-- Pagination
CREATE INDEX idx_invoices_created_sort ON invoices(created_at DESC, id DESC);

-- GST queries
CREATE INDEX idx_invoices_gst_applicable ON invoices(is_gst_applicable) 
  WHERE is_gst_applicable = true;
```

---

### 4. Contacts Table (500+ records)

```sql
-- Email lookups
CREATE INDEX idx_contacts_email ON contacts(email);

-- Company searches
CREATE INDEX idx_contacts_company ON contacts(company_name);

-- Sales pipeline filtering
CREATE INDEX idx_contacts_status ON contacts(status);
CREATE INDEX idx_contacts_type ON contacts(contact_type);

-- Source tracking
CREATE INDEX idx_contacts_source ON contacts(source);

-- Geographic
CREATE INDEX idx_contacts_city ON contacts(city);

-- Pagination
CREATE INDEX idx_contacts_created_sort ON contacts(created_at DESC, id DESC);
CREATE INDEX idx_contacts_last_activity ON contacts(last_activity_at DESC);

-- Assigned user queries
CREATE INDEX idx_contacts_assigned ON contacts(assigned_to);
```

---

### 5. Deals Table (200+ records)

```sql
-- Sales pipeline (stage-based queries)
CREATE INDEX idx_deals_stage ON deals(stage);
CREATE INDEX idx_deals_stage_value ON deals(stage, value DESC);

-- Contact relationship
CREATE INDEX idx_deals_contact ON deals(contact_id);

-- Assigned tracking
CREATE INDEX idx_deals_assigned ON deals(assigned_to);

-- Expected close queries
CREATE INDEX idx_deals_expected_close ON deals(expected_close_date);
CREATE INDEX idx_deals_actual_close ON deals(actual_close_date);

-- Priority filtering
CREATE INDEX idx_deals_priority ON deals(priority);

-- Pagination
CREATE INDEX idx_deals_created_sort ON deals(created_at DESC, id DESC);

-- Closed won/lost analysis
CREATE INDEX idx_deals_closed ON deals(stage, actual_close_date) 
  WHERE stage IN ('closed_won', 'closed_lost');
```

---

### 6. Invoice Line Items Table (5000+ records)

```sql
-- Invoice relationship (most common query)
CREATE INDEX idx_invoice_line_items_invoice ON invoice_line_items(invoice_id);

-- Product analysis
CREATE INDEX idx_invoice_line_items_hsn ON invoice_line_items(hsn_sac_code);
```

---

### 7. Payments Table

```sql
-- Invoice relationship
CREATE INDEX idx_payments_invoice ON payments(invoice_id);

-- Date queries
CREATE INDEX idx_payments_date ON payments(payment_date);

-- Method analysis
CREATE INDEX idx_payments_method ON payments(payment_method);
```

---

### 8. Timesheets Table

```sql
-- Freelancer queries
CREATE INDEX idx_timesheets_freelancer ON timesheets(freelancer_id);

-- Invoice relationship
CREATE INDEX idx_timesheets_invoice ON timesheets(invoice_id);

-- Status filtering
CREATE INDEX idx_timesheets_status ON timesheets(status);

-- Date queries
CREATE INDEX idx_timesheets_date ON timesheets(work_date);

-- Unbilled hours
CREATE INDEX idx_timesheets_unbilled ON timesheets(freelancer_id, work_date) 
  WHERE is_billable = true AND is_invoiced = false;
```

---

### 9. Purchase Orders Table

```sql
-- Vendor relationship
CREATE INDEX idx_purchase_orders_vendor ON purchase_orders(vendor_id);

-- Status filtering
CREATE INDEX idx_purchase_orders_status ON purchase_orders(status);

-- PO number lookups
CREATE INDEX idx_purchase_orders_number ON purchase_orders(po_number);
```

---

### 10. TDS Records Table

```sql
-- Quarter and FY queries
CREATE INDEX idx_tds_records_quarter ON tds_records(quarter, financial_year);

-- Party queries
CREATE INDEX idx_tds_records_party ON tds_records(party_type, party_id);

-- Section queries
CREATE INDEX idx_tds_records_section ON tds_records(section);

-- Deposit status
CREATE INDEX idx_tds_records_deposited ON tds_records(is_deposited) 
  WHERE is_deposited = false;
```

---

### 11. Activities Table

```sql
-- Entity relationship
CREATE INDEX idx_activities_contact ON activities(contact_id);
CREATE INDEX idx_activities_deal ON activities(deal_id);

-- Type filtering
CREATE INDEX idx_activities_type ON activities(activity_type);

-- Scheduled queries
CREATE INDEX idx_activities_scheduled ON activities(scheduled_at) 
  WHERE is_completed = false;

-- Recently completed
CREATE INDEX idx_activities_completed ON activities(completed_at DESC) 
  WHERE is_completed = true;

-- Assigned queries
CREATE INDEX idx_activities_assigned ON activities(assigned_to);
```

---

## Index Maintenance

### Monthly Maintenance Script
```sql
-- Check index usage
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;

-- Find unused indexes (consider removing after 30+ days)
SELECT 
  schemaname,
  tablename,
  indexname
FROM pg_stat_user_indexes
WHERE idx_scan = 0
ORDER BY tablename, indexname;

-- Index sizes
SELECT 
  schemaname,
  tablename,
  indexname,
  pg_size_pretty(pg_relation_size(indexrelid)) as index_size
FROM pg_stat_user_indexes
ORDER BY pg_relation_size(indexrelid) DESC;
```

---

## Migration Script

Run this SQL in Supabase SQL Editor to apply all indexes:

```sql
-- Indexes for Freelancers
CREATE INDEX IF NOT EXISTS idx_freelancers_email ON freelancers(email);
CREATE INDEX IF NOT EXISTS idx_freelancers_status ON freelancers(status);
CREATE INDEX IF NOT EXISTS idx_freelancers_skills ON freelancers USING GIN(skills);
CREATE INDEX IF NOT EXISTS idx_freelancers_primary_skill ON freelancers(primary_skill);
CREATE INDEX IF NOT EXISTS idx_freelancers_availability ON freelancers(availability);
CREATE INDEX IF NOT EXISTS idx_freelancers_rating ON freelancers(rating DESC);
CREATE INDEX IF NOT EXISTS idx_freelancers_city ON freelancers(city);
CREATE INDEX IF NOT EXISTS idx_freelancers_created_sort ON freelancers(created_at DESC, id DESC);

-- Indexes for Employees
CREATE INDEX IF NOT EXISTS idx_employees_email ON employees(email);
CREATE INDEX IF NOT EXISTS idx_employees_department ON employees(department);
CREATE INDEX IF NOT EXISTS idx_employees_status ON employees(status);
CREATE INDEX IF NOT EXISTS idx_employees_created_sort ON employees(created_at DESC, id DESC);

-- Indexes for Invoices
CREATE INDEX IF NOT EXISTS idx_invoices_number ON invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_date ON invoices(invoice_date);
CREATE INDEX IF NOT EXISTS idx_invoices_contact ON invoices(contact_id);
CREATE INDEX IF NOT EXISTS idx_invoices_freelancer ON invoices(freelancer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_created_sort ON invoices(created_at DESC, id DESC);

-- Indexes for Contacts
CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);
CREATE INDEX IF NOT EXISTS idx_contacts_status ON contacts(status);
CREATE INDEX IF NOT EXISTS idx_contacts_created_sort ON contacts(created_at DESC, id DESC);

-- Indexes for Deals
CREATE INDEX IF NOT EXISTS idx_deals_stage ON deals(stage);
CREATE INDEX IF NOT EXISTS idx_deals_contact ON deals(contact_id);
CREATE INDEX IF NOT EXISTS idx_deals_created_sort ON deals(created_at DESC, id DESC);

-- Indexes for Timesheets
CREATE INDEX IF NOT EXISTS idx_timesheets_freelancer ON timesheets(freelancer_id);
CREATE INDEX IF NOT EXISTS idx_timesheets_status ON timesheets(status);
```

---

## Performance Impact

| Table | Est. Records | Without Indexes | With Indexes | Improvement |
|-------|-------------|-----------------|--------------|-------------|
| Freelancers | 642 | 80-100ms | 5-10ms | 10-20x |
| Invoices | 2,000+ | 150-200ms | 10-20ms | 10-15x |
| Contacts | 500+ | 50-80ms | 5-10ms | 8-10x |
| Timesheets | 5,000+ | 200-300ms | 15-25ms | 12-15x |

---

## Notes

1. **Partial Indexes**: Used WHERE clauses to reduce index size for status/active queries
2. **Composite Indexes**: Combine frequently used column pairs
3. **GIN vs B-tree**: GIN for array columns (skills), B-tree for standard lookups
4. **Covering Indexes**: Consider including commonly selected fields
5. **Monitor**: Use Supabase Dashboard's Query Performance tab regularly

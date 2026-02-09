-- ============================================
-- ENDEAVOR SUPER CRM DATABASE SCHEMA
-- With Referential Integrity & Data Constraints
-- ============================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- ENUM TYPES
-- ============================================

CREATE TYPE user_role AS ENUM (
  'admin',
  'endeavor_ops',
  'client',
  'freelancer',
  'contractor',
  'vendor'
);

CREATE TYPE contact_type AS ENUM (
  'lead',
  'prospect',
  'customer',
  'partner'
);

CREATE TYPE contact_status AS ENUM (
  'new',
  'contacted',
  'qualified',
  'proposal',
  'negotiation',
  'closed_won',
  'closed_lost'
);

CREATE TYPE deal_stage AS ENUM (
  'new',
  'contacted',
  'qualified',
  'proposal',
  'negotiation',
  'closed_won',
  'closed_lost'
);

CREATE TYPE deal_priority AS ENUM (
  'low',
  'medium',
  'high'
);

CREATE TYPE employee_status AS ENUM (
  'active',
  'inactive',
  'terminated'
);

CREATE TYPE freelancer_status AS ENUM (
  'active',
  'inactive',
  'blacklisted'
);

CREATE TYPE freelancer_availability AS ENUM (
  'available',
  'busy',
  'unavailable'
);

CREATE TYPE vendor_status AS ENUM (
  'active',
  'inactive',
  'blacklisted'
);

CREATE TYPE vendor_type AS ENUM (
  'supplier',
  'service_provider',
  'consultant',
  'contractor'
);

CREATE TYPE invoice_status AS ENUM (
  'draft',
  'sent',
  'viewed',
  'paid',
  'partial',
  'overdue',
  'cancelled'
);

CREATE TYPE invoice_type AS ENUM (
  'client',
  'freelancer',
  'contractor',
  'vendor'
);

CREATE TYPE gst_type AS ENUM (
  'cgst_sgst',
  'igst'
);

CREATE TYPE payment_method AS ENUM (
  'cash',
  'cheque',
  'bank_transfer',
  'upi',
  'credit_card',
  'debit_card',
  'wallet'
);

CREATE TYPE activity_type AS ENUM (
  'call',
  'email',
  'meeting',
  'task',
  'note',
  'whatsapp'
);

CREATE TYPE timesheet_status AS ENUM (
  'pending',
  'approved',
  'rejected'
);

-- ============================================
-- AUDIT LOGGING
-- ============================================

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action VARCHAR(50) NOT NULL CHECK (action IN ('create', 'update', 'delete', 'soft_delete', 'restore', 'login', 'logout', 'view')),
  entity_type VARCHAR(100) NOT NULL,
  entity_id UUID,
  old_data JSONB,
  new_data JSONB,
  changed_fields TEXT[],
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT audit_logs_action_check CHECK (action IS NOT NULL),
  CONSTRAINT audit_logs_entity_type_check CHECK (entity_type IS NOT NULL)
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- ============================================
-- PROFILES (Extended user information)
-- ============================================

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name VARCHAR(100) NOT NULL CHECK (first_name ~ '^[a-zA-Z\s-\'\'\.]+$'),
  last_name VARCHAR(100) NOT NULL CHECK (last_name ~ '^[a-zA-Z\s-\'\'\.]+$'),
  email VARCHAR(255) NOT NULL UNIQUE CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  avatar_url TEXT CHECK (avatar_url IS NULL OR avatar_url ~ '^https?://'),
  role user_role DEFAULT 'freelancer' NOT NULL,
  organization_id UUID,
  phone VARCHAR(20) CHECK (phone IS NULL OR phone ~ '^[+]?[0-9\s-]{10,15}$'),
  is_active BOOLEAN DEFAULT true NOT NULL,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_org ON profiles(organization_id);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- EMPLOYEES
-- ============================================

CREATE TABLE IF NOT EXISTS employees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_code VARCHAR(20) UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL CHECK (first_name ~ '^[a-zA-Z\s-\'\'\.]+$'),
  last_name VARCHAR(100) NOT NULL CHECK (last_name ~ '^[a-zA-Z\s-\'\'\.]+$'),
  email VARCHAR(255) UNIQUE NOT NULL CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  phone VARCHAR(20) CHECK (phone IS NULL OR phone ~ '^[+]?[0-9\s-]{10,15}$'),
  date_of_joining DATE NOT NULL CHECK (date_of_joining <= CURRENT_DATE),
  department VARCHAR(100),
  designation VARCHAR(100),
  reporting_manager_id UUID REFERENCES employees(id) ON DELETE SET NULL,
  
  -- KYC Fields
  pan_number VARCHAR(10) UNIQUE CHECK (pan_number IS NULL OR pan_number ~ '^[A-Z]{5}[0-9]{4}[A-Z]{1}$'),
  aadhaar_number VARCHAR(12) UNIQUE CHECK (aadhaar_number IS NULL OR aadhaar_number ~ '^[0-9]{12}$'),
  
  -- Bank Details
  bank_account_number VARCHAR(18) CHECK (bank_account_number IS NULL OR bank_account_number ~ '^[0-9]{9,18}$'),
  bank_ifsc_code VARCHAR(11) CHECK (bank_ifsc_code IS NULL OR bank_ifsc_code ~ '^[A-Z]{4}0[A-Z0-9]{6}$'),
  bank_name VARCHAR(100),
  
  -- Salary Structure
  base_salary DECIMAL(12,2) CHECK (base_salary IS NULL OR base_salary >= 0),
  hra DECIMAL(12,2) CHECK (hra IS NULL OR hra >= 0),
  special_allowance DECIMAL(12,2) CHECK (special_allowance IS NULL OR special_allowance >= 0),
  
  -- Compliance
  pf_number VARCHAR(30),
  esi_number VARCHAR(30),
  uan VARCHAR(20),
  
  -- Emergency Contact
  emergency_contact_name VARCHAR(200) CHECK (emergency_contact_name IS NULL OR emergency_contact_name ~ '^[a-zA-Z\s-\'\'\.]+$'),
  emergency_contact_phone VARCHAR(20) CHECK (emergency_contact_phone IS NULL OR emergency_contact_phone ~ '^[+]?[0-9\s-]{10,15}$'),
  
  -- Address
  address TEXT CHECK (LENGTH(address) <= 500),
  city VARCHAR(100),
  state VARCHAR(100),
  pincode VARCHAR(6) CHECK (pincode IS NULL OR pincode ~ '^[0-9]{6}$'),
  
  status employee_status DEFAULT 'active' NOT NULL,
  documents JSONB DEFAULT '[]',
  
  -- Soft delete
  is_deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES profiles(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  created_by UUID REFERENCES profiles(id),
  
  CONSTRAINT employees_manager_check CHECK (
    reporting_manager_id IS NULL OR reporting_manager_id != id
  )
);

CREATE INDEX idx_employees_status ON employees(status) WHERE is_deleted = false;
CREATE INDEX idx_employees_dept ON employees(department) WHERE is_deleted = false;
CREATE INDEX idx_employees_email ON employees(email) WHERE is_deleted = false;

CREATE TRIGGER update_employees_updated_at
  BEFORE UPDATE ON employees
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Audit trigger for employees
CREATE OR REPLACE FUNCTION audit_employees_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        INSERT INTO audit_logs (user_id, action, entity_type, entity_id, old_data)
        VALUES (current_setting('app.current_user_id', true)::UUID, 'delete', 'employee', OLD.id, row_to_json(OLD));
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_logs (user_id, action, entity_type, entity_id, old_data, new_data, changed_fields)
        VALUES (
            current_setting('app.current_user_id', true)::UUID,
            'update',
            'employee',
            NEW.id,
            row_to_json(OLD),
            row_to_json(NEW),
            (SELECT array_agg(key) FROM jsonb_each_text(to_jsonb(NEW)) AS t(key, value) WHERE to_jsonb(OLD) ->> key IS DISTINCT FROM value)
        );
        RETURN NEW;
    ELSIF TG_OP = 'INSERT' THEN
        INSERT INTO audit_logs (user_id, action, entity_type, entity_id, new_data)
        VALUES (current_setting('app.current_user_id', true)::UUID, 'create', 'employee', NEW.id, row_to_json(NEW));
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER audit_employees_trigger
  AFTER INSERT OR UPDATE OR DELETE ON employees
  FOR EACH ROW
  EXECUTE FUNCTION audit_employees_changes();

-- ============================================
-- FREELANCERS
-- ============================================

CREATE TABLE IF NOT EXISTS freelancers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  freelancer_code VARCHAR(20) UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL CHECK (first_name ~ '^[a-zA-Z\s-\'\'\.]+$'),
  last_name VARCHAR(100) NOT NULL CHECK (last_name ~ '^[a-zA-Z\s-\'\'\.]+$'),
  email VARCHAR(255) UNIQUE NOT NULL CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  phone VARCHAR(20) CHECK (phone IS NULL OR phone ~ '^[+]?[0-9\s-]{10,15}$'),
  
  skills TEXT[] DEFAULT '{}',
  primary_skill VARCHAR(100),
  experience_years INTEGER CHECK (experience_years IS NULL OR (experience_years >= 0 AND experience_years <= 50)),
  
  -- Rates
  hourly_rate DECIMAL(10,2) CHECK (hourly_rate IS NULL OR hourly_rate >= 0),
  daily_rate DECIMAL(10,2) CHECK (daily_rate IS NULL OR daily_rate >= 0),
  monthly_rate DECIMAL(10,2) CHECK (monthly_rate IS NULL OR monthly_rate >= 0),
  
  availability freelancer_availability DEFAULT 'available' NOT NULL,
  rating DECIMAL(3,2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  total_projects INTEGER DEFAULT 0 CHECK (total_projects >= 0),
  total_hours DECIMAL(10,2) DEFAULT 0 CHECK (total_hours >= 0),
  
  -- KYC
  gst_number VARCHAR(15) UNIQUE CHECK (gst_number IS NULL OR gst_number ~ '^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$'),
  pan_number VARCHAR(10) UNIQUE CHECK (pan_number IS NULL OR pan_number ~ '^[A-Z]{5}[0-9]{4}[A-Z]{1}$'),
  
  -- Bank Details
  bank_account_number VARCHAR(18) CHECK (bank_account_number IS NULL OR bank_account_number ~ '^[0-9]{9,18}$'),
  bank_ifsc_code VARCHAR(11) CHECK (bank_ifsc_code IS NULL OR bank_ifsc_code ~ '^[A-Z]{4}0[A-Z0-9]{6}$'),
  bank_name VARCHAR(100),
  
  -- Address
  address TEXT CHECK (LENGTH(address) <= 500),
  city VARCHAR(100),
  state VARCHAR(100),
  country VARCHAR(100) DEFAULT 'India',
  
  -- Compliance
  nda_signed BOOLEAN DEFAULT false,
  nda_signed_date DATE CHECK (nda_signed_date IS NULL OR nda_signed_date <= CURRENT_DATE),
  contract_signed BOOLEAN DEFAULT false,
  onboarding_completed BOOLEAN DEFAULT false,
  
  -- Links
  linkedin_url TEXT CHECK (linkedin_url IS NULL OR linkedin_url ~ '^https?://'),
  portfolio_url TEXT CHECK (portfolio_url IS NULL OR portfolio_url ~ '^https?://'),
  resume_url TEXT CHECK (resume_url IS NULL OR resume_url ~ '^https?://'),
  bio TEXT CHECK (bio IS NULL OR LENGTH(bio) <= 2000),
  
  status freelancer_status DEFAULT 'active' NOT NULL,
  tds_rate DECIMAL(5,2) DEFAULT 0 CHECK (tds_rate >= 0 AND tds_rate <= 100),
  
  -- Soft delete
  is_deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES profiles(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_by UUID REFERENCES profiles(id),
  
  -- At least one rate must be provided if freelancer is active
  CONSTRAINT freelancers_rate_check CHECK (
    status != 'active' OR (hourly_rate IS NOT NULL OR daily_rate IS NOT NULL OR monthly_rate IS NOT NULL)
  )
);

CREATE INDEX idx_freelancers_status ON freelancers(status) WHERE is_deleted = false;
CREATE INDEX idx_freelancers_availability ON freelancers(availability) WHERE is_deleted = false;
CREATE INDEX idx_freelancers_skills ON freelancers USING GIN(skills) WHERE is_deleted = false;

CREATE TRIGGER update_freelancers_updated_at
  BEFORE UPDATE ON freelancers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- CONTRACTORS
-- ============================================

CREATE TABLE IF NOT EXISTS contractors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contractor_code VARCHAR(20) UNIQUE NOT NULL,
  company_name VARCHAR(200),
  first_name VARCHAR(100) NOT NULL CHECK (first_name ~ '^[a-zA-Z\s-\'\'\.]+$'),
  last_name VARCHAR(100) NOT NULL CHECK (last_name ~ '^[a-zA-Z\s-\'\'\.]+$'),
  email VARCHAR(255) UNIQUE NOT NULL CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  phone VARCHAR(20) CHECK (phone IS NULL OR phone ~ '^[+]?[0-9\s-]{10,15}$'),
  
  contract_start_date DATE NOT NULL CHECK (contract_start_date <= CURRENT_DATE),
  contract_end_date DATE CHECK (contract_end_date IS NULL OR contract_end_date >= contract_start_date),
  contract_value DECIMAL(15,2) CHECK (contract_value IS NULL OR contract_value >= 0),
  payment_terms VARCHAR(100),
  
  -- KYC
  gst_number VARCHAR(15) UNIQUE CHECK (gst_number IS NULL OR gst_number ~ '^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$'),
  pan_number VARCHAR(10) UNIQUE CHECK (pan_number IS NULL OR pan_number ~ '^[A-Z]{5}[0-9]{4}[A-Z]{1}$'),
  
  -- Bank Details
  bank_account_number VARCHAR(18) CHECK (bank_account_number IS NULL OR bank_account_number ~ '^[0-9]{9,18}$'),
  bank_ifsc_code VARCHAR(11) CHECK (bank_ifsc_code IS NULL OR bank_ifsc_code ~ '^[A-Z]{4}0[A-Z0-9]{6}$'),
  bank_name VARCHAR(100),
  
  -- Address
  address TEXT CHECK (LENGTH(address) <= 500),
  city VARCHAR(100),
  state VARCHAR(100),
  pincode VARCHAR(6) CHECK (pincode IS NULL OR pincode ~ '^[0-9]{6}$'),
  
  scope_of_work TEXT CHECK (LENGTH(scope_of_work) <= 5000),
  milestones JSONB DEFAULT '[]',
  
  status VARCHAR(20) DEFAULT 'active' NOT NULL CHECK (status IN ('active', 'completed', 'terminated')),
  tds_rate DECIMAL(5,2) DEFAULT 0 CHECK (tds_rate >= 0 AND tds_rate <= 100),
  documents JSONB DEFAULT '[]',
  
  -- Soft delete
  is_deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES profiles(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_by UUID REFERENCES profiles(id)
);

CREATE INDEX idx_contractors_status ON contractors(status) WHERE is_deleted = false;

CREATE TRIGGER update_contractors_updated_at
  BEFORE UPDATE ON contractors
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- VENDORS
-- ============================================

CREATE TABLE IF NOT EXISTS vendors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_code VARCHAR(20) UNIQUE NOT NULL,
  company_name VARCHAR(200) NOT NULL,
  contact_person VARCHAR(100),
  email VARCHAR(255) UNIQUE NOT NULL CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  phone VARCHAR(20) CHECK (phone IS NULL OR phone ~ '^[+]?[0-9\s-]{10,15}$'),
  
  -- KYC
  gst_number VARCHAR(15) UNIQUE CHECK (gst_number IS NULL OR gst_number ~ '^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$'),
  pan_number VARCHAR(10) UNIQUE CHECK (pan_number IS NULL OR pan_number ~ '^[A-Z]{5}[0-9]{4}[A-Z]{1}$'),
  
  vendor_type vendor_type,
  
  -- Bank Details
  bank_account_number VARCHAR(18) CHECK (bank_account_number IS NULL OR bank_account_number ~ '^[0-9]{9,18}$'),
  bank_ifsc_code VARCHAR(11) CHECK (bank_ifsc_code IS NULL OR bank_ifsc_code ~ '^[A-Z]{4}0[A-Z0-9]{6}$'),
  bank_name VARCHAR(100),
  
  -- Address
  address TEXT CHECK (LENGTH(address) <= 500),
  city VARCHAR(100),
  state VARCHAR(100),
  pincode VARCHAR(6) CHECK (pincode IS NULL OR pincode ~ '^[0-9]{6}$'),
  
  credit_limit DECIMAL(15,2) CHECK (credit_limit IS NULL OR credit_limit >= 0),
  payment_terms INTEGER DEFAULT 30 CHECK (payment_terms >= 0),
  msme_registered BOOLEAN DEFAULT false,
  tds_section VARCHAR(10) DEFAULT '194C',
  tds_rate DECIMAL(5,2) DEFAULT 0 CHECK (tds_rate >= 0 AND tds_rate <= 100),
  performance_rating DECIMAL(3,2) CHECK (performance_rating IS NULL OR (performance_rating >= 0 AND performance_rating <= 5)),
  total_purchases DECIMAL(15,2) DEFAULT 0 CHECK (total_purchases >= 0),
  
  status vendor_status DEFAULT 'active' NOT NULL,
  documents JSONB DEFAULT '[]',
  
  -- Soft delete
  is_deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES profiles(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_by UUID REFERENCES profiles(id)
);

CREATE INDEX idx_vendors_status ON vendors(status) WHERE is_deleted = false;
CREATE INDEX idx_vendors_type ON vendors(vendor_type) WHERE is_deleted = false;

CREATE TRIGGER update_vendors_updated_at
  BEFORE UPDATE ON vendors
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- CONTACTS (CRM)
-- ============================================

CREATE TABLE IF NOT EXISTS contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contact_type contact_type DEFAULT 'lead' NOT NULL,
  first_name VARCHAR(100) NOT NULL CHECK (first_name ~ '^[a-zA-Z\s-\'\'\.]+$'),
  last_name VARCHAR(100) NOT NULL CHECK (last_name ~ '^[a-zA-Z\s-\'\'\.]+$'),
  email VARCHAR(255) CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  phone VARCHAR(20) CHECK (phone IS NULL OR phone ~ '^[+]?[0-9\s-]{10,15}$'),
  company_name VARCHAR(200),
  job_title VARCHAR(100),
  industry VARCHAR(100),
  company_size VARCHAR(50) CHECK (company_size IS NULL OR company_size IN ('1-10', '11-50', '51-200', '201-500', '500+')),
  website TEXT CHECK (website IS NULL OR website ~ '^https?://'),
  linkedin_url TEXT CHECK (linkedin_url IS NULL OR linkedin_url ~ '^https?://'),
  source VARCHAR(100),
  status contact_status DEFAULT 'new' NOT NULL,
  
  assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
  estimated_value DECIMAL(15,2) CHECK (estimated_value IS NULL OR estimated_value >= 0),
  expected_close_date DATE CHECK (expected_close_date IS NULL OR expected_close_date >= CURRENT_DATE),
  
  notes TEXT CHECK (notes IS NULL OR LENGTH(notes) <= 5000),
  address TEXT CHECK (LENGTH(address) <= 500),
  city VARCHAR(100),
  state VARCHAR(100),
  country VARCHAR(100) DEFAULT 'India',
  
  gst_number VARCHAR(15) UNIQUE CHECK (gst_number IS NULL OR gst_number ~ '^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$'),
  pan_number VARCHAR(10) UNIQUE CHECK (pan_number IS NULL OR pan_number ~ '^[A-Z]{5}[0-9]{4}[A-Z]{1}$'),
  billing_address TEXT CHECK (LENGTH(billing_address) <= 500),
  shipping_address TEXT CHECK (LENGTH(shipping_address) <= 500),
  
  tags TEXT[] DEFAULT '{}',
  last_activity_at TIMESTAMPTZ,
  
  -- Soft delete
  is_deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES profiles(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_by UUID REFERENCES profiles(id),
  
  -- Either email or phone must be present
  CONSTRAINT contacts_contact_check CHECK (
    email IS NOT NULL OR phone IS NOT NULL
  )
);

CREATE INDEX idx_contacts_status ON contacts(status) WHERE is_deleted = false;
CREATE INDEX idx_contacts_type ON contacts(contact_type) WHERE is_deleted = false;
CREATE INDEX idx_contacts_assigned ON contacts(assigned_to) WHERE is_deleted = false;
CREATE INDEX idx_contacts_company ON contacts(company_name) WHERE is_deleted = false;

CREATE TRIGGER update_contacts_updated_at
  BEFORE UPDATE ON contacts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- DEALS
-- ============================================

CREATE TABLE IF NOT EXISTS deals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deal_name VARCHAR(200) NOT NULL,
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE RESTRICT,
  stage deal_stage DEFAULT 'new' NOT NULL,
  value DECIMAL(15,2) NOT NULL CHECK (value >= 0),
  currency VARCHAR(3) DEFAULT 'INR',
  probability INTEGER DEFAULT 0 CHECK (probability >= 0 AND probability <= 100),
  expected_close_date DATE CHECK (expected_close_date IS NULL OR expected_close_date >= CURRENT_DATE),
  actual_close_date DATE CHECK (actual_close_date IS NULL OR actual_close_date <= CURRENT_DATE),
  
  assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
  description TEXT CHECK (description IS NULL OR LENGTH(description) <= 5000),
  source VARCHAR(100),
  competitors TEXT,
  loss_reason VARCHAR(500),
  priority deal_priority DEFAULT 'medium' NOT NULL,
  
  -- Soft delete
  is_deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES profiles(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_by UUID REFERENCES profiles(id)
);

CREATE INDEX idx_deals_stage ON deals(stage) WHERE is_deleted = false;
CREATE INDEX idx_deals_contact ON deals(contact_id) WHERE is_deleted = false;
CREATE INDEX idx_deals_assigned ON deals(assigned_to) WHERE is_deleted = false;
CREATE INDEX idx_deals_expected_close ON deals(expected_close_date) WHERE is_deleted = false;

CREATE TRIGGER update_deals_updated_at
  BEFORE UPDATE ON deals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ACTIVITIES
-- ============================================

CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  activity_type activity_type DEFAULT 'note' NOT NULL,
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
  subject VARCHAR(200),
  description TEXT CHECK (description IS NULL OR LENGTH(description) <= 5000),
  scheduled_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ CHECK (completed_at IS NULL OR completed_at >= scheduled_at),
  duration_minutes INTEGER CHECK (duration_minutes IS NULL OR duration_minutes > 0),
  outcome VARCHAR(500),
  
  assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  
  is_completed BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- At least one of contact_id or deal_id must be present
  CONSTRAINT activities_entity_check CHECK (
    contact_id IS NOT NULL OR deal_id IS NOT NULL
  )
);

CREATE INDEX idx_activities_contact ON activities(contact_id);
CREATE INDEX idx_activities_deal ON activities(deal_id);
CREATE INDEX idx_activities_scheduled ON activities(scheduled_at);

CREATE TRIGGER update_activities_updated_at
  BEFORE UPDATE ON activities
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- INVOICES
-- ============================================

CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  invoice_type invoice_type NOT NULL,
  
  -- Foreign keys (one must be set based on invoice_type)
  contact_id UUID REFERENCES contacts(id) ON DELETE RESTRICT,
  freelancer_id UUID REFERENCES freelancers(id) ON DELETE RESTRICT,
  contractor_id UUID REFERENCES contractors(id) ON DELETE RESTRICT,
  vendor_id UUID REFERENCES vendors(id) ON DELETE RESTRICT,
  purchase_order_id UUID,
  
  invoice_date DATE NOT NULL CHECK (invoice_date <= CURRENT_DATE),
  due_date DATE NOT NULL CHECK (due_date >= invoice_date),
  
  -- Amounts
  subtotal DECIMAL(15,2) DEFAULT 0 CHECK (subtotal >= 0),
  discount_amount DECIMAL(15,2) DEFAULT 0 CHECK (discount_amount >= 0),
  taxable_amount DECIMAL(15,2) DEFAULT 0 CHECK (taxable_amount >= 0),
  
  -- GST
  is_gst_applicable BOOLEAN DEFAULT true,
  gst_type gst_type,
  cgst_rate DECIMAL(5,2) DEFAULT 9 CHECK (cgst_rate >= 0 AND cgst_rate <= 100),
  sgst_rate DECIMAL(5,2) DEFAULT 9 CHECK (sgst_rate >= 0 AND sgst_rate <= 100),
  igst_rate DECIMAL(5,2) DEFAULT 18 CHECK (igst_rate >= 0 AND igst_rate <= 100),
  cgst_amount DECIMAL(15,2) DEFAULT 0 CHECK (cgst_amount >= 0),
  sgst_amount DECIMAL(15,2) DEFAULT 0 CHECK (sgst_amount >= 0),
  igst_amount DECIMAL(15,2) DEFAULT 0 CHECK (igst_amount >= 0),
  gstin VARCHAR(15) CHECK (gstin IS NULL OR gstin ~ '^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$'),
  
  -- TDS
  tds_applicable BOOLEAN DEFAULT false,
  tds_section VARCHAR(10),
  tds_rate DECIMAL(5,2) DEFAULT 0 CHECK (tds_rate >= 0 AND tds_rate <= 100),
  tds_amount DECIMAL(15,2) DEFAULT 0 CHECK (tds_amount >= 0),
  
  -- Totals
  total_amount DECIMAL(15,2) DEFAULT 0 CHECK (total_amount >= 0),
  amount_due DECIMAL(15,2) DEFAULT 0 CHECK (amount_due >= 0),
  amount_paid DECIMAL(15,2) DEFAULT 0 CHECK (amount_paid >= 0),
  
  status invoice_status DEFAULT 'draft' NOT NULL,
  notes TEXT CHECK (notes IS NULL OR LENGTH(notes) <= 5000),
  terms TEXT CHECK (terms IS NULL OR LENGTH(terms) <= 5000),
  
  timesheet_ids UUID[] DEFAULT '{}',
  milestone_id UUID,
  
  sent_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Invoice type must match one of the foreign keys
  CONSTRAINT invoices_party_check CHECK (
    (invoice_type = 'client' AND contact_id IS NOT NULL) OR
    (invoice_type = 'freelancer' AND freelancer_id IS NOT NULL) OR
    (invoice_type = 'contractor' AND contractor_id IS NOT NULL) OR
    (invoice_type = 'vendor' AND vendor_id IS NOT NULL)
  ),
  
  -- Amount due calculation check
  CONSTRAINT invoices_amount_due_check CHECK (
    amount_due = total_amount - amount_paid
  )
);

CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_type ON invoices(invoice_type);
CREATE INDEX idx_invoices_contact ON invoices(contact_id);
CREATE INDEX idx_invoices_freelancer ON invoices(freelancer_id);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);
CREATE INDEX idx_invoices_invoice_date ON invoices(invoice_date);

CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- INVOICE LINE ITEMS
-- ============================================

CREATE TABLE IF NOT EXISTS invoice_line_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  item_description VARCHAR(500) NOT NULL,
  hsn_sac_code VARCHAR(20),
  quantity DECIMAL(10,2) NOT NULL CHECK (quantity > 0),
  unit VARCHAR(20) NOT NULL,
  unit_price DECIMAL(15,2) NOT NULL CHECK (unit_price >= 0),
  discount_percent DECIMAL(5,2) DEFAULT 0 CHECK (discount_percent >= 0 AND discount_percent <= 100),
  discount_amount DECIMAL(15,2) DEFAULT 0 CHECK (discount_amount >= 0),
  taxable_value DECIMAL(15,2) NOT NULL CHECK (taxable_value >= 0),
  gst_rate DECIMAL(5,2) DEFAULT 18 CHECK (gst_rate >= 0 AND gst_rate <= 100),
  gst_amount DECIMAL(15,2) DEFAULT 0 CHECK (gst_amount >= 0),
  total_amount DECIMAL(15,2) NOT NULL CHECK (total_amount >= 0),
  sort_order INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_invoice_line_items_invoice ON invoice_line_items(invoice_id);

-- ============================================
-- PAYMENTS
-- ============================================

CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE RESTRICT,
  payment_date DATE NOT NULL,
  amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
  payment_method payment_method,
  reference_number VARCHAR(100),
  bank_name VARCHAR(100),
  transaction_id VARCHAR(100),
  notes TEXT CHECK (notes IS NULL OR LENGTH(notes) <= 1000),
  received_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_payments_invoice ON payments(invoice_id);
CREATE INDEX idx_payments_date ON payments(payment_date);

-- ============================================
-- TDS RECORDS
-- ============================================

CREATE TABLE IF NOT EXISTS tds_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID NOT NULL REFERENCES invoices(id),
  party_type VARCHAR(20) NOT NULL CHECK (party_type IN ('contractor', 'freelancer', 'vendor')),
  party_id UUID NOT NULL,
  section VARCHAR(10) NOT NULL,
  tds_rate DECIMAL(5,2) NOT NULL CHECK (tds_rate >= 0 AND tds_rate <= 100),
  invoice_amount DECIMAL(15,2) NOT NULL CHECK (invoice_amount >= 0),
  tds_amount DECIMAL(15,2) NOT NULL CHECK (tds_amount >= 0),
  payment_date DATE,
  is_deposited BOOLEAN DEFAULT false,
  deposited_date DATE CHECK (deposited_date IS NULL OR deposited_date >= payment_date),
  challan_number VARCHAR(50),
  bsr_code VARCHAR(10),
  quarter VARCHAR(10) NOT NULL,
  financial_year VARCHAR(10) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_tds_records_party ON tds_records(party_type, party_id);
CREATE INDEX idx_tds_records_quarter ON tds_records(quarter, financial_year);

-- ============================================
-- TIMESHEETS
-- ============================================

CREATE TABLE IF NOT EXISTS timesheets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  freelancer_id UUID NOT NULL REFERENCES freelancers(id) ON DELETE RESTRICT,
  deal_id UUID REFERENCES deals(id) ON DELETE SET NULL,
  project_name VARCHAR(200),
  work_date DATE NOT NULL CHECK (work_date <= CURRENT_DATE),
  hours_worked DECIMAL(4,2) NOT NULL CHECK (hours_worked > 0 AND hours_worked <= 24),
  hourly_rate DECIMAL(10,2) CHECK (hourly_rate IS NULL OR hourly_rate >= 0),
  description TEXT CHECK (description IS NULL OR LENGTH(description) <= 1000),
  task_type VARCHAR(100),
  is_billable BOOLEAN DEFAULT true,
  is_invoiced BOOLEAN DEFAULT false,
  invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
  
  approved_by UUID REFERENCES profiles(id),
  approved_at TIMESTAMPTZ,
  rejection_reason VARCHAR(500),
  
  status timesheet_status DEFAULT 'pending' NOT NULL,
  
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_timesheets_freelancer ON timesheets(freelancer_id);
CREATE INDEX idx_timesheets_status ON timesheets(status);
CREATE INDEX idx_timesheets_work_date ON timesheets(work_date);
CREATE INDEX idx_timesheets_deal ON timesheets(deal_id);

CREATE TRIGGER update_timesheets_updated_at
  BEFORE UPDATE ON timesheets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- PURCHASE ORDERS
-- ============================================

CREATE TABLE IF NOT EXISTS purchase_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  po_number VARCHAR(50) UNIQUE NOT NULL,
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE RESTRICT,
  po_date DATE NOT NULL CHECK (po_date <= CURRENT_DATE),
  expected_delivery_date DATE CHECK (expected_delivery_date IS NULL OR expected_delivery_date >= po_date),
  
  subtotal DECIMAL(15,2) DEFAULT 0 CHECK (subtotal >= 0),
  cgst_amount DECIMAL(15,2) DEFAULT 0 CHECK (cgst_amount >= 0),
  sgst_amount DECIMAL(15,2) DEFAULT 0 CHECK (sgst_amount >= 0),
  igst_amount DECIMAL(15,2) DEFAULT 0 CHECK (igst_amount >= 0),
  total_amount DECIMAL(15,2) DEFAULT 0 CHECK (total_amount >= 0),
  
  status VARCHAR(20) DEFAULT 'draft' NOT NULL CHECK (status IN ('draft', 'sent', 'partial', 'received', 'closed', 'cancelled')),
  terms TEXT CHECK (terms IS NULL OR LENGTH(terms) <= 5000),
  notes TEXT CHECK (notes IS NULL OR LENGTH(notes) <= 5000),
  
  approved_by UUID REFERENCES profiles(id),
  approved_at TIMESTAMPTZ,
  created_by UUID REFERENCES profiles(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_purchase_orders_vendor ON purchase_orders(vendor_id);
CREATE INDEX idx_purchase_orders_status ON purchase_orders(status);

CREATE TRIGGER update_po_updated_at
  BEFORE UPDATE ON purchase_orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- PO LINE ITEMS
-- ============================================

CREATE TABLE IF NOT EXISTS po_line_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  po_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
  item_description VARCHAR(500) NOT NULL,
  hsn_sac_code VARCHAR(20),
  quantity DECIMAL(10,2) NOT NULL CHECK (quantity > 0),
  unit VARCHAR(20) NOT NULL,
  unit_price DECIMAL(15,2) NOT NULL CHECK (unit_price >= 0),
  gst_rate DECIMAL(5,2) DEFAULT 18 CHECK (gst_rate >= 0 AND gst_rate <= 100),
  total_amount DECIMAL(15,2) NOT NULL CHECK (total_amount >= 0),
  received_quantity DECIMAL(10,2) DEFAULT 0 CHECK (received_quantity >= 0),
  sort_order INTEGER DEFAULT 0
);

CREATE INDEX idx_po_line_items_po ON po_line_items(po_id);

-- ============================================
-- GRN (Goods Receipt Note)
-- ============================================

CREATE TABLE IF NOT EXISTS grns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  grn_number VARCHAR(50) UNIQUE NOT NULL,
  po_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE RESTRICT,
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE RESTRICT,
  grn_date DATE NOT NULL CHECK (grn_date <= CURRENT_DATE),
  invoice_number VARCHAR(100),
  invoice_date DATE,
  received_by UUID REFERENCES profiles(id),
  notes TEXT CHECK (notes IS NULL OR LENGTH(notes) <= 1000),
  status VARCHAR(20) DEFAULT 'draft' NOT NULL CHECK (status IN ('draft', 'approved', 'matched', 'rejected')),
  approved_by UUID REFERENCES profiles(id),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_grns_po ON grns(po_id);
CREATE INDEX idx_grns_vendor ON grns(vendor_id);

-- ============================================
-- GRN LINE ITEMS
-- ============================================

CREATE TABLE IF NOT EXISTS grn_line_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  grn_id UUID NOT NULL REFERENCES grns(id) ON DELETE CASCADE,
  po_line_item_id UUID REFERENCES po_line_items(id),
  item_description VARCHAR(500) NOT NULL,
  ordered_quantity DECIMAL(10,2) NOT NULL CHECK (ordered_quantity > 0),
  received_quantity DECIMAL(10,2) NOT NULL CHECK (received_quantity >= 0),
  accepted_quantity DECIMAL(10,2) NOT NULL CHECK (accepted_quantity >= 0 AND accepted_quantity <= received_quantity),
  rejected_quantity DECIMAL(10,2) NOT NULL CHECK (rejected_quantity >= 0 AND rejected_quantity <= received_quantity),
  unit VARCHAR(20),
  unit_price DECIMAL(15,2),
  quality_remarks TEXT
);

CREATE INDEX idx_grn_line_items_grn ON grn_line_items(grn_id);

-- ============================================
-- EXPENSE REIMBURSEMENTS
-- ============================================

CREATE TABLE IF NOT EXISTS expense_reimbursements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE RESTRICT,
  expense_date DATE NOT NULL CHECK (expense_date <= CURRENT_DATE),
  category VARCHAR(100) NOT NULL,
  description TEXT CHECK (description IS NULL OR LENGTH(description) <= 1000),
  amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
  gst_amount DECIMAL(12,2) DEFAULT 0 CHECK (gst_amount >= 0),
  gstin VARCHAR(15) CHECK (gstin IS NULL OR gstin ~ '^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$'),
  invoice_number VARCHAR(100),
  receipt_url TEXT,
  status VARCHAR(20) DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'approved', 'rejected', 'paid')),
  approved_by UUID REFERENCES profiles(id),
  approved_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  payment_reference VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_expenses_employee ON expense_reimbursements(employee_id);
CREATE INDEX idx_expenses_status ON expense_reimbursements(status);

CREATE TRIGGER update_expenses_updated_at
  BEFORE UPDATE ON expense_reimbursements
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- COMPANY CONFIGURATION
-- ============================================

CREATE TABLE IF NOT EXISTS company_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_name VARCHAR(200) NOT NULL,
  gstin VARCHAR(15) UNIQUE CHECK (gstin ~ '^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$'),
  pan VARCHAR(10) CHECK (pan ~ '^[A-Z]{5}[0-9]{4}[A-Z]{1}$'),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  pincode VARCHAR(6) CHECK (pincode IS NULL OR pincode ~ '^[0-9]{6}$'),
  phone VARCHAR(20) CHECK (phone IS NULL OR phone ~ '^[+]?[0-9\s-]{10,15}$'),
  email VARCHAR(255),
  website TEXT CHECK (website IS NULL OR website ~ '^https?://'),
  bank_name VARCHAR(100),
  bank_account_number VARCHAR(18) CHECK (bank_account_number IS NULL OR bank_account_number ~ '^[0-9]{9,18}$'),
  bank_ifsc_code VARCHAR(11) CHECK (bank_ifsc_code IS NULL OR bank_ifsc_code ~ '^[A-Z]{4}0[A-Z0-9]{6}$'),
  invoice_prefix VARCHAR(10) DEFAULT 'INV',
  default_payment_terms INTEGER DEFAULT 30,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TRIGGER update_company_config_updated_at
  BEFORE UPDATE ON company_config
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- AI GENERATED CONTENT
-- ============================================

CREATE TABLE IF NOT EXISTS ai_generated_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_type VARCHAR(20) NOT NULL CHECK (content_type IN ('email', 'whatsapp', 'pitch', 'proposal', 'followup')),
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  deal_id UUID REFERENCES deals(id) ON DELETE SET NULL,
  prompt TEXT NOT NULL,
  generated_content TEXT NOT NULL,
  tone VARCHAR(20),
  language VARCHAR(10) DEFAULT 'en',
  is_used BOOLEAN DEFAULT false,
  rating INTEGER CHECK (rating IS NULL OR (rating >= 1 AND rating <= 5)),
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_ai_content_type ON ai_generated_content(content_type);
CREATE INDEX idx_ai_content_contact ON ai_generated_content(contact_id);

-- ============================================
-- RLS POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE freelancers ENABLE ROW LEVEL SECURITY;
ALTER TABLE contractors ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE timesheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_reimbursements ENABLE ROW LEVEL SECURITY;

-- Profiles RLS
CREATE POLICY "Profiles can be viewed by authenticated users" ON profiles
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Profiles can be updated by owner or admin" ON profiles
  FOR UPDATE USING (
    auth.uid() = id OR 
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Employees RLS (admin and ops only for write)
CREATE POLICY "Employees viewable by authenticated" ON employees
  FOR SELECT USING (is_deleted = false);

CREATE POLICY "Employees manageable by admin or ops" ON employees
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'endeavor_ops')
    )
  );

-- Similar policies for other tables would be added here...

-- ============================================
-- SEED DATA
-- ============================================

-- Insert default company config
INSERT INTO company_config (id, company_name, gstin, address, city, state, invoice_prefix)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Endeavor Academy Pvt Ltd',
  '27AABCE1234A1Z5',
  '123, Business Park, Andheri East',
  'Mumbai',
  'Maharashtra',
  'INV'
)
ON CONFLICT (id) DO NOTHING;

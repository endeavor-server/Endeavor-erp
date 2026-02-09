// ============================================
// APP TYPES
// ============================================

export type ModuleType = 
  | 'command-center'
  | 'clients'
  | 'work-delivery'
  | 'people'
  | 'finance'
  | 'sales'
  | 'ai-automation'
  | 'integrations'
  | 'reports'
  | 'admin';

// ============================================
// WORKFORCE TYPES
// ============================================

export interface Employee {
  id: string;
  employee_code: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  date_of_joining: string;
  department?: string;
  designation?: string;
  reporting_manager_id?: string;
  pan_number?: string;
  aadhaar_number?: string;
  bank_account_number?: string;
  bank_ifsc_code?: string;
  bank_name?: string;
  base_salary?: number;
  hra?: number;
  special_allowance?: number;
  pf_number?: string;
  esi_number?: string;
  uan?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  status: 'active' | 'inactive' | 'terminated';
  documents?: Document[];
  created_at: string;
  updated_at: string;
}

export interface Contractor {
  id: string;
  contractor_code: string;
  company_name?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  contract_start_date: string;
  contract_end_date?: string;
  contract_value?: number;
  payment_terms?: string;
  gst_number?: string;
  pan_number?: string;
  bank_account_number?: string;
  bank_ifsc_code?: string;
  bank_name?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  scope_of_work?: string;
  milestones?: Milestone[];
  status: 'active' | 'completed' | 'terminated';
  tds_rate: number;
  documents?: Document[];
  created_at: string;
  updated_at: string;
}

export interface Freelancer {
  id: string;
  freelancer_code: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  skills: string[];
  primary_skill?: string;
  experience_years?: number;
  hourly_rate?: number;
  daily_rate?: number;
  monthly_rate?: number;
  availability: 'available' | 'busy' | 'unavailable';
  rating: number;
  total_projects: number;
  total_hours: number;
  gst_number?: string;
  pan_number?: string;
  bank_account_number?: string;
  bank_ifsc_code?: string;
  bank_name?: string;
  address?: string;
  city?: string;
  state?: string;
  country: string;
  nda_signed: boolean;
  nda_signed_date?: string;
  contract_signed: boolean;
  onboarding_completed: boolean;
  linkedin_url?: string;
  portfolio_url?: string;
  resume_url?: string;
  bio?: string;
  status: 'active' | 'inactive' | 'blacklisted';
  tds_rate: number;
  created_at: string;
  updated_at: string;
}

export interface Vendor {
  id: string;
  vendor_code: string;
  company_name: string;
  contact_person?: string;
  email: string;
  phone?: string;
  gst_number?: string;
  pan_number?: string;
  vendor_type?: 'supplier' | 'service_provider' | 'consultant' | 'contractor';
  bank_account_number?: string;
  bank_ifsc_code?: string;
  bank_name?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  credit_limit?: number;
  payment_terms: number;
  msme_registered: boolean;
  tds_section: string;
  tds_rate: number;
  performance_rating?: number;
  total_purchases: number;
  status: 'active' | 'inactive' | 'blacklisted';
  documents?: Document[];
  created_at: string;
  updated_at: string;
}

// ============================================
// SALES TYPES
// ============================================

export interface Contact {
  id: string;
  contact_type: 'lead' | 'prospect' | 'customer' | 'partner';
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  company_name?: string;
  job_title?: string;
  industry?: string;
  company_size?: string;
  website?: string;
  linkedin_url?: string;
  source?: string;
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';
  assigned_to?: string;
  estimated_value?: number;
  expected_close_date?: string;
  notes?: string;
  address?: string;
  city?: string;
  state?: string;
  country: string;
  gst_number?: string;
  pan_number?: string;
  billing_address?: string;
  shipping_address?: string;
  tags: string[];
  last_activity_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Deal {
  id: string;
  deal_name: string;
  contact_id: string;
  stage: 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';
  value: number;
  currency: string;
  probability: number;
  expected_close_date?: string;
  actual_close_date?: string;
  assigned_to?: string;
  description?: string;
  source?: string;
  competitors?: string;
  loss_reason?: string;
  priority: 'low' | 'medium' | 'high';
  created_at: string;
  updated_at: string;
}

export interface Activity {
  id: string;
  activity_type: 'call' | 'email' | 'meeting' | 'task' | 'note' | 'whatsapp';
  contact_id?: string;
  deal_id?: string;
  subject?: string;
  description?: string;
  scheduled_at?: string;
  completed_at?: string;
  duration_minutes?: number;
  outcome?: string;
  assigned_to?: string;
  created_by?: string;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface AIGeneratedContent {
  id: string;
  content_type: 'email' | 'whatsapp' | 'pitch' | 'proposal' | 'followup';
  contact_id?: string;
  deal_id?: string;
  prompt: string;
  generated_content: string;
  tone?: string;
  language: string;
  is_used: boolean;
  rating?: number;
  created_at: string;
}

// ============================================
// INVOICING TYPES
// ============================================

export interface Invoice {
  id: string;
  invoice_number: string;
  invoice_type: 'client' | 'freelancer' | 'contractor' | 'vendor';
  contact_id?: string;
  freelancer_id?: string;
  contractor_id?: string;
  vendor_id?: string;
  purchase_order_id?: string;
  invoice_date: string;
  due_date: string;
  subtotal: number;
  discount_amount: number;
  taxable_amount: number;
  is_gst_applicable: boolean;
  gst_type?: 'cgst_sgst' | 'igst';
  cgst_rate: number;
  sgst_rate: number;
  igst_rate: number;
  cgst_amount: number;
  sgst_amount: number;
  igst_amount: number;
  gstin?: string;
  tds_applicable: boolean;
  tds_section?: string;
  tds_rate: number;
  tds_amount: number;
  total_amount: number;
  amount_due: number;
  amount_paid: number;
  status: 'draft' | 'sent' | 'viewed' | 'paid' | 'partial' | 'overdue' | 'cancelled';
  notes?: string;
  terms?: string;
  timesheet_ids: string[];
  milestone_id?: string;
  sent_at?: string;
  paid_at?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface InvoiceLineItem {
  id: string;
  invoice_id: string;
  item_description: string;
  hsn_sac_code?: string;
  quantity: number;
  unit: string;
  unit_price: number;
  discount_percent: number;
  discount_amount: number;
  taxable_value: number;
  gst_rate: number;
  gst_amount: number;
  total_amount: number;
  sort_order: number;
}

export interface Payment {
  id: string;
  invoice_id: string;
  payment_date: string;
  amount: number;
  payment_method?: 'cash' | 'cheque' | 'bank_transfer' | 'upi' | 'credit_card' | 'debit_card' | 'wallet';
  reference_number?: string;
  bank_name?: string;
  transaction_id?: string;
  notes?: string;
  received_by?: string;
  created_at: string;
}

export interface TDSRecord {
  id: string;
  invoice_id: string;
  party_type: 'contractor' | 'freelancer' | 'vendor';
  party_id: string;
  section: string;
  tds_rate: number;
  invoice_amount: number;
  tds_amount: number;
  payment_date?: string;
  is_deposited: boolean;
  deposited_date?: string;
  challan_number?: string;
  bsr_code?: string;
  quarter: string;
  financial_year: string;
  created_at: string;
}

// ============================================
// ACCOUNTING TYPES
// ============================================

export interface ChartOfAccount {
  id: string;
  account_code: string;
  account_name: string;
  account_type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  parent_account_id?: string;
  is_bank_account: boolean;
  bank_account_number?: string;
  bank_ifsc_code?: string;
  opening_balance: number;
  current_balance: number;
  gst_applicable: boolean;
  gst_rate: number;
  tds_applicable: boolean;
  tds_section?: string;
  description?: string;
  is_active: boolean;
  created_at: string;
}

export interface Transaction {
  id: string;
  transaction_date: string;
  reference_number?: string;
  reference_type?: 'invoice' | 'payment' | 'expense' | 'journal' | 'purchase_order' | 'grn';
  reference_id?: string;
  debit_account_id?: string;
  credit_account_id?: string;
  amount: number;
  description?: string;
  notes?: string;
  gst_amount: number;
  tds_amount: number;
  attachments?: Attachment[];
  created_by?: string;
  created_at: string;
}

export interface ExpenseReimbursement {
  id: string;
  employee_id: string;
  expense_date: string;
  category: string;
  description?: string;
  amount: number;
  gst_amount: number;
  gstin?: string;
  invoice_number?: string;
  receipt_url?: string;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  approved_by?: string;
  approved_at?: string;
  paid_at?: string;
  payment_reference?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface PurchaseOrder {
  id: string;
  po_number: string;
  vendor_id: string;
  po_date: string;
  expected_delivery_date?: string;
  subtotal: number;
  cgst_amount: number;
  sgst_amount: number;
  igst_amount: number;
  total_amount: number;
  status: 'draft' | 'sent' | 'partial' | 'received' | 'closed' | 'cancelled';
  terms?: string;
  notes?: string;
  approved_by?: string;
  approved_at?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface POLineItem {
  id: string;
  po_id: string;
  item_description: string;
  hsn_sac_code?: string;
  quantity: number;
  unit: string;
  unit_price: number;
  gst_rate: number;
  total_amount: number;
  received_quantity: number;
  sort_order: number;
}

export interface GRN {
  id: string;
  grn_number: string;
  po_id: string;
  vendor_id: string;
  grn_date: string;
  invoice_number?: string;
  invoice_date?: string;
  received_by?: string;
  notes?: string;
  status: 'draft' | 'approved' | 'matched' | 'rejected';
  approved_by?: string;
  approved_at?: string;
  created_at: string;
}

export interface GRNLineItem {
  id: string;
  grn_id: string;
  po_line_item_id?: string;
  item_description: string;
  ordered_quantity: number;
  received_quantity: number;
  accepted_quantity: number;
  rejected_quantity: number;
  unit?: string;
  unit_price?: number;
  quality_remarks?: string;
}

// ============================================
// TIME TRACKING TYPES
// ============================================

export interface Timesheet {
  id: string;
  freelancer_id: string;
  deal_id?: string;
  project_name?: string;
  work_date: string;
  hours_worked: number;
  hourly_rate?: number;
  description?: string;
  task_type?: string;
  is_billable: boolean;
  is_invoiced: boolean;
  invoice_id?: string;
  approved_by?: string;
  approved_at?: string;
  rejection_reason?: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface FreelancerAssignment {
  id: string;
  freelancer_id: string;
  deal_id: string;
  assignment_type: 'hourly' | 'fixed' | 'milestone';
  hourly_rate?: number;
  fixed_amount?: number;
  start_date?: string;
  end_date?: string;
  total_hours_allocated?: number;
  status: 'active' | 'completed' | 'cancelled';
  created_at: string;
}

// ============================================
// GST RETURN TYPES
// ============================================

export interface GSTReturn {
  id: string;
  return_type: 'GSTR-1' | 'GSTR-3B' | 'GSTR-9';
  financial_year: string;
  tax_period: string;
  filing_due_date?: string;
  filed_date?: string;
  total_taxable_value: number;
  total_igst: number;
  total_cgst: number;
  total_sgst: number;
  total_cess: number;
  status: 'pending' | 'filed' | 'late';
  json_data?: any;
  acknowledgement_number?: string;
  created_at: string;
  updated_at: string;
}

// ============================================
// COMMON TYPES
// ============================================

export interface Document {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploaded_at: string;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
}

export interface Milestone {
  id: string;
  title: string;
  description?: string;
  due_date?: string;
  amount: number;
  status: 'pending' | 'completed' | 'invoiced';
  completed_at?: string;
}

// ============================================
// DASHBOARD TYPES
// ============================================

export interface DashboardStats {
  totalRevenue: number;
  totalInvoices: number;
  totalContacts: number;
  totalDeals: number;
  activeFreelancers: number;
  activeProjects: number;
  pendingApprovals: number;
  overdueInvoices: number;
  monthlyRevenue: number;
  revenueGrowth: number;
}

export interface MonthlyRevenue {
  month: string;
  revenue: number;
  expenses: number;
}

export interface PipelineStage {
  stage: string;
  count: number;
  value: number;
}

export interface RecentActivity {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  user?: string;
}

import { z } from 'zod';

// ============================================
// COMMON VALIDATION HELPERS
// ============================================

// Indian phone number validation
export const phoneSchema = z
  .string()
  .regex(/^[+]?[0-9\s-]{10,15}$/, 'Invalid phone number format')
  .transform((val) => val.replace(/\s/g, '').replace(/^\+91/, '').replace(/^(?!\+)/, ''))
  .optional()
  .or(z.literal(''));

// Email validation
export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Invalid email address')
  .toLowerCase();

// GST Number validation (India)
export const gstSchema = z
  .string()
  .regex(
    /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
    'Invalid GSTIN format (e.g., 27AABCT1234C1Z5)'
  )
  .optional()
  .or(z.literal(''));

// PAN Number validation (India)
export const panSchema = z
  .string()
  .regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN format (e.g., AABCT1234C)')
  .optional()
  .or(z.literal(''));

// IFSC Code validation
export const ifscSchema = z
  .string()
  .regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Invalid IFSC code')
  .optional()
  .or(z.literal(''));

// Bank account number validation
export const bankAccountSchema = z
  .string()
  .regex(/^[0-9]{9,18}$/, 'Bank account number must be 9-18 digits')
  .optional()
  .or(z.literal(''));

// PIN code validation (India)
export const pincodeSchema = z
  .string()
  .regex(/^[0-9]{6}$/, 'PIN code must be 6 digits')
  .optional()
  .or(z.literal(''));

// URL validation
export const urlSchema = z
  .string()
  .url('Invalid URL format')
  .optional()
  .or(z.literal(''));

// Money amount validation (non-negative)
export const amountSchema = z.number().min(0, 'Amount must be non-negative');

// Percentage validation (0-100)
export const percentageSchema = z
  .number()
  .min(0, 'Percentage must be at least 0')
  .max(100, 'Percentage cannot exceed 100');

// Date validation (ISO string)
export const dateSchema = z.string().refine(
  (val) => !isNaN(Date.parse(val)),
  { message: 'Invalid date format' }
);

// Name validation (letters, spaces, hyphens only)
export const nameSchema = z
  .string()
  .min(2, 'Name must be at least 2 characters')
  .max(100, 'Name cannot exceed 100 characters')
  .regex(/^[a-zA-Z\s-']+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes');

// ============================================
// CONTACT/CLIENT VALIDATION SCHEMAS
// ============================================

export const contactTypeSchema = z.enum(['lead', 'prospect', 'customer', 'partner']);
export const contactStatusSchema = z.enum([
  'new',
  'contacted',
  'qualified',
  'proposal',
  'negotiation',
  'closed_won',
  'closed_lost',
]);

export const contactSchema = z.object({
  contact_type: contactTypeSchema.default('lead'),
  first_name: nameSchema,
  last_name: nameSchema,
  email: emailSchema.optional().or(z.literal('')),
  phone: phoneSchema,
  company_name: z.string().min(1, 'Company name is required').max(200),
  job_title: z.string().max(100).optional().or(z.literal('')),
  industry: z.string().max(100).optional().or(z.literal('')),
  company_size: z.enum(['1-10', '11-50', '51-200', '201-500', '500+']).optional().or(z.literal('')),
  website: urlSchema,
  linkedin_url: urlSchema,
  source: z.string().max(100).optional().or(z.literal('')),
  status: contactStatusSchema.default('new'),
  assigned_to: z.string().uuid().optional().or(z.literal('')),
  estimated_value: z.number().min(0).optional(),
  expected_close_date: dateSchema.optional().or(z.literal('')),
  notes: z.string().max(5000).optional().or(z.literal('')),
  address: z.string().max(500).optional().or(z.literal('')),
  city: z.string().max(100).optional().or(z.literal('')),
  state: z.string().max(100).optional().or(z.literal('')),
  country: z.string().default('India'),
  gst_number: gstSchema,
  pan_number: panSchema,
  billing_address: z.string().max(500).optional().or(z.literal('')),
  shipping_address: z.string().max(500).optional().or(z.literal('')),
  tags: z.array(z.string().max(50)).default([]),
});

export type ContactFormData = z.infer<typeof contactSchema>;

// ============================================
// DEAL VALIDATION SCHEMAS
// ============================================

export const dealStageSchema = z.enum([
  'new',
  'contacted',
  'qualified',
  'proposal',
  'negotiation',
  'closed_won',
  'closed_lost',
]);

export const dealPrioritySchema = z.enum(['low', 'medium', 'high']);

export const dealSchema = z.object({
  deal_name: z.string().min(1, 'Deal name is required').max(200),
  contact_id: z.string().uuid('Please select a valid contact'),
  stage: dealStageSchema.default('new'),
  value: z.number().min(0, 'Deal value must be non-negative'),
  currency: z.string().length(3).default('INR'),
  probability: percentageSchema.default(0),
  expected_close_date: dateSchema.optional().or(z.literal('')),
  actual_close_date: dateSchema.optional().or(z.literal('')),
  assigned_to: z.string().uuid().optional().or(z.literal('')),
  description: z.string().max(5000).optional().or(z.literal('')),
  source: z.string().max(100).optional().or(z.literal('')),
  competitors: z.string().max(500).optional().or(z.literal('')),
  loss_reason: z.string().max(500).optional().or(z.literal('')),
  priority: dealPrioritySchema.default('medium'),
});

export type DealFormData = z.infer<typeof dealSchema>;

// ============================================
// EMPLOYEE VALIDATION SCHEMAS
// ============================================

export const employeeStatusSchema = z.enum(['active', 'inactive', 'terminated']);

export const employeeSchema = z.object({
  employee_code: z.string().min(1, 'Employee code is required').max(20),
  first_name: nameSchema,
  last_name: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  date_of_joining: dateSchema,
  department: z.string().max(100).optional().or(z.literal('')),
  designation: z.string().max(100).optional().or(z.literal('')),
  reporting_manager_id: z.string().uuid().optional().or(z.literal('')),
  pan_number: panSchema,
  aadhaar_number: z
    .string()
    .regex(/^[0-9]{12}$/, 'Aadhaar must be 12 digits')
    .optional()
    .or(z.literal('')),
  bank_account_number: bankAccountSchema,
  bank_ifsc_code: ifscSchema,
  bank_name: z.string().max(100).optional().or(z.literal('')),
  base_salary: amountSchema.optional(),
  hra: amountSchema.optional(),
  special_allowance: amountSchema.optional(),
  pf_number: z.string().max(30).optional().or(z.literal('')),
  esi_number: z.string().max(30).optional().or(z.literal('')),
  uan: z.string().max(20).optional().or(z.literal('')),
  emergency_contact_name: nameSchema.or(z.literal('')),
  emergency_contact_phone: phoneSchema,
  address: z.string().max(500).optional().or(z.literal('')),
  city: z.string().max(100).optional().or(z.literal('')),
  state: z.string().max(100).optional().or(z.literal('')),
  pincode: pincodeSchema,
  status: employeeStatusSchema.default('active'),
});

export type EmployeeFormData = z.infer<typeof employeeSchema>;

// ============================================
// FREELANCER VALIDATION SCHEMAS
// ============================================

export const freelancerStatusSchema = z.enum(['active', 'inactive', 'blacklisted']);
export const availabilitySchema = z.enum(['available', 'busy', 'unavailable']);

export const freelancerSchema = z.object({
  freelancer_code: z.string().min(1, 'Freelancer code is required').max(20),
  first_name: nameSchema,
  last_name: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  skills: z.array(z.string().max(50)).default([]),
  primary_skill: z.string().max(100).optional().or(z.literal('')),
  experience_years: z.number().min(0).max(50).optional(),
  hourly_rate: z.number().min(0).optional(),
  daily_rate: z.number().min(0).optional(),
  monthly_rate: z.number().min(0).optional(),
  availability: availabilitySchema.default('available'),
  rating: z.number().min(0).max(5).default(0),
  total_projects: z.number().min(0).default(0),
  total_hours: z.number().min(0).default(0),
  gst_number: gstSchema,
  pan_number: panSchema,
  bank_account_number: bankAccountSchema,
  bank_ifsc_code: ifscSchema,
  bank_name: z.string().max(100).optional().or(z.literal('')),
  address: z.string().max(500).optional().or(z.literal('')),
  city: z.string().max(100).optional().or(z.literal('')),
  state: z.string().max(100).optional().or(z.literal('')),
  country: z.string().max(100).default('India'),
  nda_signed: z.boolean().default(false),
  nda_signed_date: dateSchema.optional().or(z.literal('')),
  contract_signed: z.boolean().default(false),
  onboarding_completed: z.boolean().default(false),
  linkedin_url: urlSchema,
  portfolio_url: urlSchema,
  resume_url: urlSchema,
  bio: z.string().max(2000).optional().or(z.literal('')),
  status: freelancerStatusSchema.default('active'),
  tds_rate: percentageSchema.default(0),
});

export type FreelancerFormData = z.infer<typeof freelancerSchema>;

// ============================================
// VENDOR VALIDATION SCHEMAS
// ============================================

export const vendorStatusSchema = z.enum(['active', 'inactive', 'blacklisted']);
export const vendorTypeSchema = z.enum(['supplier', 'service_provider', 'consultant', 'contractor']);

export const vendorSchema = z.object({
  vendor_code: z.string().min(1, 'Vendor code is required').max(20),
  company_name: z.string().min(1, 'Company name is required').max(200),
  contact_person: z.string().max(100).optional().or(z.literal('')),
  email: emailSchema,
  phone: phoneSchema,
  gst_number: gstSchema,
  pan_number: panSchema,
  vendor_type: vendorTypeSchema.optional(),
  bank_account_number: bankAccountSchema,
  bank_ifsc_code: ifscSchema,
  bank_name: z.string().max(100).optional().or(z.literal('')),
  address: z.string().max(500).optional().or(z.literal('')),
  city: z.string().max(100).optional().or(z.literal('')),
  state: z.string().max(100).optional().or(z.literal('')),
  pincode: pincodeSchema,
  credit_limit: z.number().min(0).optional(),
  payment_terms: z.number().min(0).default(30),
  msme_registered: z.boolean().default(false),
  tds_section: z.string().max(10).default('194C'),
  tds_rate: percentageSchema.default(0),
  performance_rating: z.number().min(0).max(5).optional(),
  total_purchases: z.number().min(0).default(0),
  status: vendorStatusSchema.default('active'),
});

export type VendorFormData = z.infer<typeof vendorSchema>;

// ============================================
// INVOICE VALIDATION SCHEMAS
// ============================================

export const invoiceStatusSchema = z.enum([
  'draft',
  'sent',
  'viewed',
  'paid',
  'partial',
  'overdue',
  'cancelled',
]);

export const invoiceTypeSchema = z.enum(['client', 'freelancer', 'contractor', 'vendor']);
export const gstTypeSchema = z.enum(['cgst_sgst', 'igst']);

export const invoiceLineItemSchema = z.object({
  item_description: z.string().min(1, 'Item description is required').max(500),
  hsn_sac_code: z.string().max(20).optional().or(z.literal('')),
  quantity: z.number().min(0.01, 'Quantity must be greater than 0'),
  unit: z.string().min(1, 'Unit is required').max(20),
  unit_price: z.number().min(0, 'Unit price must be non-negative'),
  discount_percent: percentageSchema.default(0),
  discount_amount: z.number().min(0).default(0),
  taxable_value: z.number().min(0),
  gst_rate: percentageSchema.default(18),
  gst_amount: z.number().min(0),
  total_amount: z.number().min(0),
  sort_order: z.number().int().default(0),
});

export const invoiceSchema = z.object({
  invoice_number: z.string().min(1, 'Invoice number is required').max(50),
  invoice_type: invoiceTypeSchema.default('client'),
  contact_id: z.string().uuid().optional().or(z.literal('')),
  freelancer_id: z.string().uuid().optional().or(z.literal('')),
  contractor_id: z.string().uuid().optional().or(z.literal('')),
  vendor_id: z.string().uuid().optional().or(z.literal('')),
  purchase_order_id: z.string().uuid().optional().or(z.literal('')),
  invoice_date: dateSchema,
  due_date: dateSchema,
  subtotal: z.number().min(0).default(0),
  discount_amount: z.number().min(0).default(0),
  taxable_amount: z.number().min(0).default(0),
  is_gst_applicable: z.boolean().default(true),
  gst_type: gstTypeSchema.optional().or(z.literal('')),
  cgst_rate: percentageSchema.default(9),
  sgst_rate: percentageSchema.default(9),
  igst_rate: percentageSchema.default(18),
  cgst_amount: z.number().min(0).default(0),
  sgst_amount: z.number().min(0).default(0),
  igst_amount: z.number().min(0).default(0),
  gstin: gstSchema,
  tds_applicable: z.boolean().default(false),
  tds_section: z.string().max(10).optional().or(z.literal('')),
  tds_rate: percentageSchema.default(0),
  tds_amount: z.number().min(0).default(0),
  total_amount: z.number().min(0).default(0),
  amount_due: z.number().min(0).default(0),
  amount_paid: z.number().min(0).default(0),
  status: invoiceStatusSchema.default('draft'),
  notes: z.string().max(5000).optional().or(z.literal('')),
  terms: z.string().max(5000).optional().or(z.literal('')),
  line_items: z.array(invoiceLineItemSchema).min(1, 'At least one line item is required'),
});

export type InvoiceFormData = z.infer<typeof invoiceSchema>;
export type InvoiceLineItemFormData = z.infer<typeof invoiceLineItemSchema>;

// ============================================
// PAYMENT VALIDATION SCHEMAS
// ============================================

export const paymentMethodSchema = z.enum([
  'cash',
  'cheque',
  'bank_transfer',
  'upi',
  'credit_card',
  'debit_card',
  'wallet',
]);

export const paymentSchema = z.object({
  invoice_id: z.string().uuid('Please select an invoice'),
  payment_date: dateSchema,
  amount: z.number().min(0.01, 'Payment amount must be greater than 0'),
  payment_method: paymentMethodSchema.optional(),
  reference_number: z.string().max(100).optional().or(z.literal('')),
  bank_name: z.string().max(100).optional().or(z.literal('')),
  transaction_id: z.string().max(100).optional().or(z.literal('')),
  notes: z.string().max(1000).optional().or(z.literal('')),
});

export type PaymentFormData = z.infer<typeof paymentSchema>;

// ============================================
// TIMESHEET VALIDATION SCHEMAS
// ============================================

export const timesheetStatusSchema = z.enum(['pending', 'approved', 'rejected']);

export const timesheetSchema = z.object({
  freelancer_id: z.string().uuid('Please select a freelancer'),
  deal_id: z.string().uuid().optional().or(z.literal('')),
  project_name: z.string().max(200).optional().or(z.literal('')),
  work_date: dateSchema,
  hours_worked: z.number().min(0.01, 'Hours must be greater than 0').max(24, 'Hours cannot exceed 24'),
  hourly_rate: z.number().min(0).optional(),
  description: z.string().max(1000).optional().or(z.literal('')),
  task_type: z.string().max(100).optional().or(z.literal('')),
  is_billable: z.boolean().default(true),
  status: timesheetStatusSchema.default('pending'),
});

export type TimesheetFormData = z.infer<typeof timesheetSchema>;

// ============================================
// ACTIVITY VALIDATION SCHEMAS
// ============================================

export const activityTypeSchema = z.enum(['call', 'email', 'meeting', 'task', 'note', 'whatsapp']);

export const activitySchema = z.object({
  activity_type: activityTypeSchema.default('note'),
  contact_id: z.string().uuid().optional().or(z.literal('')),
  deal_id: z.string().uuid().optional().or(z.literal('')),
  subject: z.string().max(200).optional().or(z.literal('')),
  description: z.string().max(5000).optional().or(z.literal('')),
  scheduled_at: dateSchema.optional().or(z.literal('')),
  completed_at: dateSchema.optional().or(z.literal('')),
  duration_minutes: z.number().min(0).optional(),
  outcome: z.string().max(500).optional().or(z.literal('')),
  assigned_to: z.string().uuid().optional().or(z.literal('')),
  is_completed: z.boolean().default(false),
});

export type ActivityFormData = z.infer<typeof activitySchema>;

// ============================================
// USER/AUTH VALIDATION SCHEMAS
// ============================================

export const userRoleSchema = z.enum([
  'admin',
  'endeavor_ops',
  'client',
  'freelancer',
  'contractor',
  'vendor',
]);

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(8, 'Password must be at least 8 characters').max(100),
});

export const passwordChangeSchema = z
  .object({
    current_password: z.string().min(1, 'Current password is required'),
    new_password: z
      .string()
      .min(8, 'New password must be at least 8 characters')
      .max(100)
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        'Password must contain uppercase, lowercase, number and special character'
      ),
    confirm_password: z.string(),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "Passwords don't match",
    path: ['confirm_password'],
  });

export type LoginFormData = z.infer<typeof loginSchema>;
export type PasswordChangeFormData = z.infer<typeof passwordChangeSchema>;

// ============================================
// CONFIGURATION VALIDATION SCHEMAS
// ============================================

export const companyConfigSchema = z.object({
  company_name: z.string().min(1, 'Company name is required').max(200),
  gstin: gstSchema,
  pan: panSchema,
  address: z.string().max(500).optional().or(z.literal('')),
  city: z.string().max(100),
  state: z.string().max(100),
  pincode: pincodeSchema,
  phone: phoneSchema,
  email: emailSchema.optional().or(z.literal('')),
  website: urlSchema,
  bank_name: z.string().max(100).optional().or(z.literal('')),
  bank_account_number: bankAccountSchema,
  bank_ifsc_code: ifscSchema,
  invoice_prefix: z.string().max(10).default('INV'),
  default_payment_terms: z.number().min(0).default(30),
});

export type CompanyConfigFormData = z.infer<typeof companyConfigSchema>;

// ============================================
// ERROR FORMATTING UTILITIES
// ============================================

export function formatZodError(error: z.ZodError): Record<string, string> {
  const formatted: Record<string, string> = {};
  error.issues.forEach((err) => {
    const path = err.path.join('.');
    formatted[path] = err.message;
  });
  return formatted;
}

export function getFieldError(errors: Record<string, string>, field: string): string | undefined {
  return errors[field];
}

export function hasErrors(errors: Record<string, boolean>): boolean {
  return Object.keys(errors).length > 0;
}

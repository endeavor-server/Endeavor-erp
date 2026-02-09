// Invoice Numbering Utilities for Indian GST Compliance
// Format: INV/YYYY-YY/XXXXX (e.g., INV/2024-25/00001)

/**
 * Interface for invoice sequence tracking
 */
export interface InvoiceSequence {
  financialYear: string;      // e.g., "2024-25"
  prefix: string;             // e.g., "INV" or "FCI"
  lastNumber: number;         // Last issued sequence number
  updatedAt: string;
}

/**
 * Get current financial year string
 * FY runs from April 1 to March 31
 * Returns format: "YYYY-YY" (e.g., "2024-25")
 */
export function getFinancialYear(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1; // 1-12 (Jan-Dec)
  
  // FY starts in April
  if (month >= 4) {
    return `${year}-${(year + 1).toString().slice(-2)}`;
  } else {
    return `${year - 1}-${year.toString().slice(-2)}`;
  }
}

/**
 * Get financial year start date
 * Returns the date when the FY started
 */
export function getFinancialYearStart(date: Date = new Date()): Date {
  const fy = getFinancialYear(date);
  const [startYear] = fy.split('-');
  return new Date(parseInt(startYear), 3, 1); // April 1
}

/**
 * Check if date is in same financial year
 */
export function isSameFinancialYear(date1: Date, date2: Date): boolean {
  return getFinancialYear(date1) === getFinancialYear(date2);
}

/**
 * Generate invoice number with proper GST-compliant format
 * Format: INV/YYYY-YY/XXXXX
 * 
 * @param prefix - Invoice type prefix (INV, FCI, FCO, FVE for Client, Freelancer, Contractor, Vendor)
 * @param financialYear - FY string (e.g., "2024-25")
 * @param sequence - Sequence number
 * @returns Formatted invoice number
 */
export function formatInvoiceNumber(
  prefix: string,
  financialYear: string,
  sequence: number
): string {
  return `${prefix}/${financialYear}/${sequence.toString().padStart(5, '0')}`;
}

/**
 * Parse invoice number into components
 * Inverse of formatInvoiceNumber
 */
export function parseInvoiceNumber(invoiceNumber: string): {
  prefix: string;
  financialYear: string;
  sequence: number;
} | null {
  const match = invoiceNumber.match(/^([A-Z]+)\/(\d{4}-\d{2})\/(\d{5})$/);
  if (!match) return null;
  
  return {
    prefix: match[1],
    financialYear: match[2],
    sequence: parseInt(match[3], 10),
  };
}

/**
 * Invoice type prefixes for different entities
 */
export const INVOICE_PREFIXES = {
  CLIENT: 'INV',       // Client invoices (Endeavor → Client)
  FREELANCER: 'FCO',   // Freelancer invoices (Freelancer → Endeavor)
  CONTRACTOR: 'CON',   // Contractor invoices (Contractor → Endeavor)
  VENDOR: 'FVE',       // Vendor invoices (Vendor → Endeavor)
} as const;

export type InvoicePrefix = typeof INVOICE_PREFIXES[keyof typeof INVOICE_PREFIXES];

/**
 * Generate next invoice number atomically
 * This simulates atomic DB increment - in production, this should be:
 * 1. SELECT last_number FROM invoice_sequences WHERE financial_year = $1 AND prefix = $2 FOR UPDATE
 * 2. UPDATE invoice_sequences SET last_number = last_number + 1 WHERE ...
 * 3. COMMIT
 * 
 * @param prefix - Invoice prefix (INV, FCO, etc.)
 * @param existingInvoices - Array of existing invoice objects with invoice_number field
 * @returns Next formatted invoice number
 */
export function generateNextInvoiceNumber(
  prefix: InvoicePrefix,
  existingInvoices: Array<{ invoice_number: string }>
): string {
  const financialYear = getFinancialYear();
  
  // Find the highest sequence number for this prefix and FY
  let maxSequence = 0;
  const fyPattern = `${prefix}/${financialYear}/`;
  
  for (const inv of existingInvoices) {
    if (inv.invoice_number && inv.invoice_number.startsWith(fyPattern)) {
      const parsed = parseInvoiceNumber(inv.invoice_number);
      if (parsed && parsed.financialYear === financialYear) {
        maxSequence = Math.max(maxSequence, parsed.sequence);
      }
    }
  }
  
  // Next sequence
  const nextSequence = maxSequence + 1;
  
  return formatInvoiceNumber(prefix, financialYear, nextSequence);
}

/**
 * Get invoice number for specific entity type
 */
export function generateClientInvoiceNumber(
  existingInvoices: Array<{ invoice_number: string }>
): string {
  return generateNextInvoiceNumber(INVOICE_PREFIXES.CLIENT, existingInvoices);
}

export function generateFreelancerInvoiceNumber(
  existingInvoices: Array<{ invoice_number: string }>
): string {
  return generateNextInvoiceNumber(INVOICE_PREFIXES.FREELANCER, existingInvoices);
}

export function generateContractorInvoiceNumber(
  existingInvoices: Array<{ invoice_number: string }>
): string {
  return generateNextInvoiceNumber(INVOICE_PREFIXES.CONTRACTOR, existingInvoices);
}

export function generateVendorInvoiceNumber(
  existingInvoices: Array<{ invoice_number: string }>
): string {
  return generateNextInvoiceNumber(INVOICE_PREFIXES.VENDOR, existingInvoices);
}

/**
 * Validate invoice number format
 * GST requires specific format for audit purposes
 */
export function isValidInvoiceNumber(invoiceNumber: string): boolean {
  const parsed = parseInvoiceNumber(invoiceNumber);
  if (!parsed) return false;
  
  // Check prefix is valid
  const validPrefixes = Object.values(INVOICE_PREFIXES);
  if (!validPrefixes.includes(parsed.prefix as InvoicePrefix)) {
    return false;
  }
  
  // Check sequence is positive
  if (parsed.sequence <= 0) {
    return false;
  }
  
  // Check FY format
  const fyMatch = parsed.financialYear.match(/^\d{4}-\d{2}$/);
  if (!fyMatch) return false;
  
  return true;
}

/**
 * Get invoice metadata from number
 */
export function getInvoiceMetadata(invoiceNumber: string): {
  type: 'client' | 'freelancer' | 'contractor' | 'vendor' | 'unknown';
  financialYear: string;
  sequence: number;
} {
  const parsed = parseInvoiceNumber(invoiceNumber);
  
  if (!parsed) {
    return { type: 'unknown', financialYear: '', sequence: 0 };
  }
  
  const typeMap: Record<string, 'client' | 'freelancer' | 'contractor' | 'vendor'> = {
    [INVOICE_PREFIXES.CLIENT]: 'client',
    [INVOICE_PREFIXES.FREELANCER]: 'freelancer',
    [INVOICE_PREFIXES.CONTRACTOR]: 'contractor',
    [INVOICE_PREFIXES.VENDOR]: 'vendor',
  };
  
  return {
    type: typeMap[parsed.prefix] || 'unknown',
    financialYear: parsed.financialYear,
    sequence: parsed.sequence,
  };
}

/**
 * SQL for production DB sequence table (PostgreSQL/Supabase)
 * Run this in your database migration:
 * 
 * CREATE TABLE IF NOT EXISTS invoice_sequences (
 *   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
 *   prefix VARCHAR(10) NOT NULL,
 *   financial_year VARCHAR(7) NOT NULL, -- Format: YYYY-YY
 *   last_number INTEGER NOT NULL DEFAULT 0,
 *   updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
 *   UNIQUE(prefix, financial_year)
 * );
 * 
 * -- Create index for fast lookup
 * CREATE INDEX idx_invoice_sequences_lookup 
 * ON invoice_sequences(prefix, financial_year);
 * 
 * -- Function to atomically get next invoice number
 * CREATE OR REPLACE FUNCTION get_next_invoice_number(
 *   p_prefix VARCHAR,
 *   p_financial_year VARCHAR
 * ) RETURNS TEXT AS $$
 * DECLARE
 *   v_next_number INTEGER;
 * BEGIN
 *   -- Insert row if doesn't exist
 *   INSERT INTO invoice_sequences (prefix, financial_year, last_number)
 *   VALUES (p_prefix, p_financial_year, 0)
 *   ON CONFLICT (prefix, financial_year) DO NOTHING;
 *   
 *   -- Atomically increment and return
 *   UPDATE invoice_sequences
 *   SET last_number = last_number + 1,
 *       updated_at = NOW()
 *   WHERE prefix = p_prefix AND financial_year = p_financial_year
 *   RETURNING last_number INTO v_next_number;
 *   
 *   RETURN p_prefix || '/' || p_financial_year || '/' || LPAD(v_next_number::TEXT, 5, '0');
 * END;
 * $$ LANGUAGE plpgsql;
 */

/**
 * Mock function for atomic DB increment
 * In production, this calls the PostgreSQL function above via Supabase RPC
 */
export async function getNextInvoiceNumberFromDB(
  prefix: InvoicePrefix,
  supabase?: any
): Promise<string> {
  const financialYear = getFinancialYear();
  
  // If Supabase is available, use atomic DB function
  if (supabase) {
    // In production:
    // const { data, error } = await supabase.rpc('get_next_invoice_number', {
    //   p_prefix: prefix,
    //   p_financial_year: financialYear
    // });
    // if (error) throw error;
    // return data;
    
    // For now, fallback to client-side generation
    console.warn('DB atomic increment not connected, using client-side generation');
  }
  
  // Client-side fallback (not safe for concurrent access in production)
  const existingInvoices: Array<{ invoice_number: string }> = []; // Would come from DB
  return generateNextInvoiceNumber(prefix, existingInvoices);
}

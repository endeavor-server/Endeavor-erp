// GST Calculation Utilities for Indian Tax Compliance

export interface GSTCalculationInput {
  taxableValue: number;
  gstRate: number;
  stateCode: string; // Client's state code (e.g., '27' for Maharashtra)
  companyStateCode: string; // Endeavor's state code
  isIntraState: boolean; // true = CGST+SGST, false = IGST
}

export interface GSTCalculationResult {
  taxableValue: number;
  cgstRate: number;
  sgstRate: number;
  igstRate: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  totalGST: number;
  totalAmount: number;
  gstType: 'cgst_sgst' | 'igst';
}

// Standard GST Rates in India
export const GST_RATES = [0, 5, 12, 18, 28] as const;

// HSN Codes for common services
export const COMMON_HSN_CODES: Record<string, string> = {
  'e_learning': '9992',
  'software_development': '998314',
  'consulting': '998311',
  'training': '999293',
  'content_development': '998313',
  'graphic_design': '998391',
  'video_production': '998362',
  'technical_writing': '998393',
  'project_management': '998311',
  'data_entry': '998314',
};

/**
 * Round amount to nearest rupee (as per GST rules)
 */
export function roundToRupees(amount: number): number {
  return Math.round(amount);
}

/**
 * Round amount to nearest paise (for tax calculations)
 */
export function roundToPaise(amount: number): number {
  return Math.round(amount * 100) / 100;
}

/**
 * Calculate GST for an invoice line item
 */
export function calculateGST(
  taxableValue: number,
  gstRate: number,
  isIntraState: boolean
): GSTCalculationResult {
  const cgstRate = isIntraState ? gstRate / 2 : 0;
  const sgstRate = isIntraState ? gstRate / 2 : 0;
  const igstRate = isIntraState ? 0 : gstRate;

  // Round tax amounts to nearest paise (2 decimal places)
  const cgstAmount = roundToPaise((taxableValue * cgstRate) / 100);
  const sgstAmount = roundToPaise((taxableValue * sgstRate) / 100);
  const igstAmount = roundToPaise((taxableValue * igstRate) / 100);
  
  // For intra-state, ensure CGST = SGST (adjust rounding if needed)
  let adjustedCgstAmount = cgstAmount;
  let adjustedSgstAmount = sgstAmount;
  if (isIntraState && cgstAmount !== sgstAmount) {
    // Use the larger amount for both to ensure we don't undercharge
    const commonAmount = Math.max(cgstAmount, sgstAmount);
    adjustedCgstAmount = commonAmount;
    adjustedSgstAmount = commonAmount;
  }
  
  const totalGST = roundToPaise(adjustedCgstAmount + adjustedSgstAmount + igstAmount);
  const totalAmount = roundToRupees(taxableValue + totalGST);

  return {
    taxableValue,
    cgstRate,
    sgstRate,
    igstRate,
    cgstAmount: adjustedCgstAmount,
    sgstAmount: adjustedSgstAmount,
    igstAmount: igstAmount,
    totalGST,
    totalAmount,
    gstType: isIntraState ? 'cgst_sgst' : 'igst',
  };
}

/**
 * Determine if transaction is intra-state based on state codes
 */
export function isIntraStateTransaction(
  clientStateCode: string,
  companyStateCode: string = '27' // Default Maharashtra
): boolean {
  return clientStateCode === companyStateCode;
}

/**
 * State codes for GST (first 2 digits of GSTIN)
 */
export const STATE_CODES: Record<string, string> = {
  '01': 'Jammu and Kashmir',
  '02': 'Himachal Pradesh',
  '03': 'Punjab',
  '04': 'Chandigarh',
  '05': 'Uttarakhand',
  '06': 'Haryana',
  '07': 'Delhi',
  '08': 'Rajasthan',
  '09': 'Uttar Pradesh',
  '10': 'Bihar',
  '11': 'Sikkim',
  '12': 'Arunachal Pradesh',
  '13': 'Nagaland',
  '14': 'Manipur',
  '15': 'Mizoram',
  '16': 'Tripura',
  '17': 'Meghalaya',
  '18': 'Assam',
  '19': 'West Bengal',
  '20': 'Jharkhand',
  '21': 'Odisha',
  '22': 'Chhattisgarh',
  '23': 'Madhya Pradesh',
  '24': 'Gujarat',
  '26': 'Dadra and Nagar Haveli and Daman and Diu',
  '27': 'Maharashtra',
  '28': 'Andhra Pradesh',
  '29': 'Karnataka',
  '30': 'Goa',
  '31': 'Lakshadweep',
  '32': 'Kerala',
  '33': 'Tamil Nadu',
  '34': 'Puducherry',
  '35': 'Andaman and Nicobar Islands',
  '36': 'Telangana',
  '37': 'Andhra Pradesh',
  '97': 'Other Territory',
};

/**
 * Extract state code from GSTIN
 */
export function getStateCodeFromGSTIN(gstin: string): string | null {
  if (!gstin || gstin.length !== 15) return null;
  return gstin.substring(0, 2);
}

/**
 * Validate GSTIN format
 */
export function isValidGSTIN(gstin: string): boolean {
  if (!gstin) return false;
  // GSTIN format: 2 digits (state) + 10 chars (PAN) + 1 char (entity) + 1 char (check) + 1 char (Z)
  const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  return gstinRegex.test(gstin.toUpperCase());
}

/**
 * Calculate GST for entire invoice
 */
export function calculateInvoiceGST(
  lineItems: Array<{
    taxableValue: number;
    gstRate: number;
  }>,
  clientStateCode: string,
  companyStateCode: string = '27'
): {
  taxableValue: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  totalGST: number;
  totalAmount: number;
  gstType: 'cgst_sgst' | 'igst';
} {
  const isIntraState = isIntraStateTransaction(clientStateCode, companyStateCode);
  
  let totalTaxable = 0;
  let totalCGST = 0;
  let totalSGST = 0;
  let totalIGST = 0;

  for (const item of lineItems) {
    const calculation = calculateGST(item.taxableValue, item.gstRate, isIntraState);
    totalTaxable += item.taxableValue;
    totalCGST += calculation.cgstAmount;
    totalSGST += calculation.sgstAmount;
    totalIGST += calculation.igstAmount;
  }

  const totalGST = totalCGST + totalSGST + totalIGST;

  return {
    taxableValue: totalTaxable,
    cgstAmount: totalCGST,
    sgstAmount: totalSGST,
    igstAmount: totalIGST,
    totalGST,
    totalAmount: totalTaxable + totalGST,
    gstType: isIntraState ? 'cgst_sgst' : 'igst',
  };
}

/**
 * Generate GSTR-1 summary
 */
export function generateGSTR1Summary(
  invoices: Array<{
    invoiceNumber: string;
    invoiceDate: string;
    gstin?: string;
    taxableValue: number;
    cgst: number;
    sgst: number;
    igst: number;
    stateCode: string;
  }>
): {
  b2b: any[];
  b2cs: any[];
  hsn: any[];
  totalTaxable: number;
  totalCGST: number;
  totalSGST: number;
  totalIGST: number;
} {
  const b2b = []; // Business to Business
  const b2cs = []; // Business to Consumer (Small)
  const hsnSummary: Record<string, { hsn: string; taxable: number; igst: number; cgst: number; sgst: number }> = {};
  
  let totalTaxable = 0;
  let totalCGST = 0;
  let totalSGST = 0;
  let totalIGST = 0;

  for (const inv of invoices) {
    const isB2B = inv.gstin && inv.gstin.length === 15;
    
    if (isB2B) {
      b2b.push({
        ctin: inv.gstin,
        inv: [{
          inum: inv.invoiceNumber,
          idt: inv.invoiceDate,
          val: inv.taxableValue + inv.cgst + inv.sgst + inv.igst,
          itms: [{
            num: 1,
            itm_det: {
              txval: inv.taxableValue,
              rt: inv.igst > 0 ? (inv.igst / inv.taxableValue) * 100 : (inv.cgst / inv.taxableValue) * 200,
              iamt: inv.igst,
              camt: inv.cgst,
              samt: inv.sgst,
            }
          }]
        }]
      });
    } else {
      b2cs.push({
        sply_ty: inv.igst > 0 ? 'INTER' : 'INTRA',
        pos: inv.stateCode || '27',
        typ: 'OE',
        hsn_sc: '9983',
        txval: inv.taxableValue,
        rt: inv.igst > 0 ? (inv.igst / inv.taxableValue) * 100 : (inv.cgst / inv.taxableValue) * 200,
        iamt: inv.igst,
        camt: inv.cgst,
        samt: inv.sgst,
      });
    }

    totalTaxable += inv.taxableValue;
    totalCGST += inv.cgst;
    totalSGST += inv.sgst;
    totalIGST += inv.igst;
  }

  return {
    b2b,
    b2cs,
    hsn: Object.values(hsnSummary),
    totalTaxable,
    totalCGST,
    totalSGST,
    totalIGST,
  };
}

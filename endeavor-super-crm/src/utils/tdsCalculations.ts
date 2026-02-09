// TDS (Tax Deducted at Source) Calculation Utilities for India

export const TDS_SECTIONS = {
  // Section 194C - Payment to contractors/sub-contractors
  '194C': {
    description: 'Payment to Contractors',
    individualRate: 1.0, // 1% for individuals/HUF
    companyRate: 2.0,    // 2% for others
    threshold: 30000,    // Per contract threshold
    aggregateThreshold: 100000, // Annual threshold
  },
  // Section 194J - Professional/Technical services
  '194J': {
    description: 'Professional/Technical Services',
    professionalRate: 10.0,   // For professionals
    technicalRate: 2.0,       // For technical services (reduced from 10%)
    callCenterRate: 2.0,      // For call centers
    threshold: 30000,
  },
  // Section 194H - Commission or brokerage
  '194H': {
    description: 'Commission or Brokerage',
    rate: 5.0,
    threshold: 15000,
  },
  // Section 194I - Rent
  '194I': {
    description: 'Rent',
    plantMachineryRate: 2.0,  // For plant, machinery, equipment
    landBuildingRate: 10.0,   // For land, building, furniture
    threshold: 240000,
  },
  // Section 194A - Interest other than banks
  '194A': {
    description: 'Interest other than from Banks',
    rate: 10.0,
    threshold: 5000, // For others
    seniorCitizenThreshold: 50000,
  },
} as const;

export interface TDSCalculationInput {
  amount: number;
  section: keyof typeof TDS_SECTIONS;
  partyType?: 'individual' | 'company' | 'huf' | ' partnership' | 'llp' | 'aop';
  isProfessional?: boolean;
  isTechnical?: boolean;
  cumulativeAmount?: number; // For threshold calculation
  hasPAN?: boolean;
}

export interface TDSCalculationResult {
  amount: number;
  tdsRate: number;
  tdsAmount: number;
  netAmount: number;
  section: string;
  sectionDescription: string;
  isThresholdMet: boolean;
  panRequired: boolean;
  higherRateApplied: boolean;
}

/**
 * Calculate TDS for a payment
 */
export function calculateTDS(input: TDSCalculationInput): TDSCalculationResult {
  const { 
    amount, 
    section, 
    partyType = 'individual',
    isProfessional = false,
    isTechnical = false,
    cumulativeAmount = 0,
    hasPAN = true 
  } = input;

  const sectionData = TDS_SECTIONS[section];
  let tdsRate: number;
  let threshold: number;

  // Determine rate based on section and party type
  switch (section) {
    case '194C': {
      const data194C = sectionData as typeof TDS_SECTIONS['194C'];
      tdsRate = (partyType === 'individual' || partyType === 'huf') 
        ? data194C.individualRate 
        : data194C.companyRate;
      threshold = data194C.threshold;
      break;
    }
    
    case '194J': {
      const data194J = sectionData as typeof TDS_SECTIONS['194J'];
      if (isProfessional) {
        tdsRate = data194J.professionalRate;
      } else if (isTechnical) {
        tdsRate = data194J.technicalRate;
      } else {
        tdsRate = data194J.professionalRate;
      }
      threshold = data194J.threshold;
      break;
    }
    
    case '194H': {
      const data194H = sectionData as typeof TDS_SECTIONS['194H'];
      tdsRate = data194H.rate;
      threshold = data194H.threshold;
      break;
    }
    
    case '194I': {
      const data194I = sectionData as typeof TDS_SECTIONS['194I'];
      // Default to land/building rate
      tdsRate = data194I.landBuildingRate;
      threshold = data194I.threshold;
      break;
    }
    
    case '194A': {
      const data194A = sectionData as typeof TDS_SECTIONS['194A'];
      tdsRate = data194A.rate;
      threshold = data194A.threshold;
      break;
    }
    
    default:
      tdsRate = 10;
      threshold = 30000;
  }

  // Apply higher rate if PAN not provided
  let higherRateApplied = false;
  if (!hasPAN) {
    tdsRate = 20;
    higherRateApplied = true;
  }

  // Check threshold
  const isThresholdMet = amount >= threshold || (cumulativeAmount + amount) >= threshold;
  
  let tdsAmount = 0;
  if (isThresholdMet) {
    tdsAmount = (amount * tdsRate) / 100;
  }

  return {
    amount,
    tdsRate,
    tdsAmount,
    netAmount: amount - tdsAmount,
    section,
    sectionDescription: sectionData.description,
    isThresholdMet,
    panRequired: !hasPAN,
    higherRateApplied,
  };
}

/**
 * Determine TDS section based on vendor/freelancer details
 */
export function determineTDSSection(
  paymentType: 'contractor' | 'freelancer' | 'vendor' | 'consultant' | 'rent' | 'commission',
  vendorType?: string,
  isCompany?: boolean
): keyof typeof TDS_SECTIONS {
  switch (paymentType) {
    case 'contractor':
      return '194C';
    
    case 'freelancer':
    case 'consultant':
      // Freelancers usually fall under 194J
      return '194J';
    
    case 'vendor':
      // Check if it's a goods supplier or service provider
      if (vendorType === 'supplier') {
        return '194C'; // For supplying goods
      }
      return '194J'; // For services
    
    case 'rent':
      return '194I';
    
    case 'commission':
      return '194H';
    
    default:
      return '194C';
  }
}

/**
 * Get applicable TDS rate for contractors/freelancers (> Rs. 30,000 threshold)
 * As per requirement: Contractors/Freelancers: 10% if > ₹30K
 */
export function getFreelancerTDSRate(
  amount: number,
  hasPAN: boolean = true,
  isCompany: boolean = false
): { rate: number; tdsAmount: number; netAmount: number } {
  const threshold = 30000;
  
  if (amount < threshold) {
    return { rate: 0, tdsAmount: 0, netAmount: amount };
  }

  // If no PAN, 20% TDS
  let rate = hasPAN ? 10 : 20;
  
  const tdsAmount = (amount * rate) / 100;
  return {
    rate,
    tdsAmount,
    netAmount: amount - tdsAmount,
  };
}

/**
 * Get TDS rate for vendors
 * Vendors 194C: 2% (individual) / 5% (company)
 * Vendors 194J: 10% professional fees
 */
export function getVendorTDSRate(
  amount: number,
  section: '194C' | '194J',
  isCompany: boolean = false,
  hasPAN: boolean = true
): { rate: number; tdsAmount: number; netAmount: number } {
  if (amount < 30000) {
    return { rate: 0, tdsAmount: 0, netAmount: amount };
  }

  let rate: number;
  
  if (!hasPAN) {
    rate = 20;
  } else if (section === '194C') {
    rate = isCompany ? 2 : 1;
  } else if (section === '194J') {
    rate = 10;
  } else {
    rate = 10;
  }

  const tdsAmount = (amount * rate) / 100;
  return {
    rate,
    tdsAmount,
    netAmount: amount - tdsAmount,
  };
}

/**
 * Calculate TDS for an invoice
 */
export function calculateInvoiceTDS(
  invoice: {
    invoice_type: string;
    subtotal: number;
    freelancer_id?: string;
    contractor_id?: string;
    vendor_id?: string;
  },
  partyDetails?: {
    isCompany?: boolean;
    hasPAN?: boolean;
    tds_section?: string;
  }
): {
  tdsApplicable: boolean;
  tdsSection?: string;
  tdsRate: number;
  tdsAmount: number;
  amountAfterTDS: number;
} {
  const amount = invoice.subtotal;
  let tdsApplicable = false;
  let tdsSection = '';
  let tdsRate = 0;
  let tdsAmount = 0;

  const hasPAN = partyDetails?.hasPAN !== false;
  const isCompany = partyDetails?.isCompany || false;

  switch (invoice.invoice_type) {
    case 'freelancer':
      if (amount >= 30000) {
        tdsApplicable = true;
        tdsSection = '194J';
        tdsRate = hasPAN ? 10 : 20;
        tdsAmount = (amount * tdsRate) / 100;
      }
      break;

    case 'contractor':
      if (amount >= 30000) {
        tdsApplicable = true;
        tdsSection = '194C';
        tdsRate = hasPAN ? (isCompany ? 2 : 1) : 20;
        tdsAmount = (amount * tdsRate) / 100;
      }
      break;

    case 'vendor':
      const section = (partyDetails?.tds_section as '194C' | '194J') || '194C';
      if (amount >= 30000) {
        tdsApplicable = true;
        tdsSection = section;
        if (section === '194C') {
          tdsRate = hasPAN ? (isCompany ? 2 : 1) : 20;
        } else {
          tdsRate = hasPAN ? 10 : 20;
        }
        tdsAmount = (amount * tdsRate) / 100;
      }
      break;
  }

  return {
    tdsApplicable,
    tdsSection,
    tdsRate,
    tdsAmount,
    amountAfterTDS: amount - tdsAmount,
  };
}

/**
 * Generate Form 16A data for a financial year
 */
export function generateForm16A(
  partyId: string,
  partyName: string,
  panNumber: string,
  financialYear: string,
  quarterlyData: Array<{
    quarter: string;
    paymentAmount: number;
    tdsDeducted: number;
    tdsDeposited: number;
  }>
) {
  return {
    deductorName: 'Endeavor Academy Pvt Ltd',
    deductorTAN: 'MUM12345A', // Sample TAN
    deductorAddress: 'Mumbai, Maharashtra',
    partyName,
    panNumber,
    financialYear,
    quarterlySummary: quarterlyData,
    totalPayment: quarterlyData.reduce((sum, q) => sum + q.paymentAmount, 0),
    totalTDSDeducted: quarterlyData.reduce((sum, q) => sum + q.tdsDeducted, 0),
    totalTDSDeposited: quarterlyData.reduce((sum, q) => sum + q.tdsDeposited, 0),
  };
}

/**
 * Get financial year from date
 */
export function getFinancialYear(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1; // 1-12
  
  if (month >= 4) {
    return `${year}-${year + 1}`;
  } else {
    return `${year - 1}-${year}`;
  }
}

/**
 * Get current quarter
 */
export function getCurrentQuarter(date: Date = new Date()): string {
  const month = date.getMonth() + 1;
  
  if (month >= 4 && month <= 6) return 'Q1';
  if (month >= 7 && month <= 9) return 'Q2';
  if (month >= 10 && month <= 12) return 'Q3';
  return 'Q4';
}

/**
 * Get quarter from month for FY (April-March)
 */
export function getQuarterFromMonth(month: number): string {
  // Month is 1-12 (Jan-Dec)
  if (month >= 4 && month <= 6) return 'Q1';
  if (month >= 7 && month <= 9) return 'Q2';
  if (month >= 10 && month <= 12) return 'Q3';
  return 'Q4';
}

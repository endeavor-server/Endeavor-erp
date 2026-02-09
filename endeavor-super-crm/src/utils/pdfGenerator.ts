import jsPDF from 'jspdf';
import 'jspdf-autotable';
import type { Invoice, InvoiceLineItem, Freelancer, Contact, Contractor, Vendor } from '../types';

// Extend jsPDF type for autotable
interface jsPDFWithAutoTable extends jsPDF {
  autoTable: any;
  lastAutoTable: any;
}

// Company Details
const COMPANY_DETAILS = {
  name: 'Endeavor Academy Pvt Ltd',
  address: '123 Business Center, Andheri East',
  city: 'Mumbai',
  state: 'Maharashtra',
  pincode: '400069',
  country: 'India',
  phone: '+91 22 1234 5678',
  email: 'accounts@endeavoracademy.us',
  website: 'https://www.endeavoracademy.us',
  gstin: '27AABCE1234A1Z5',
  pan: 'AABCE1234A',
  cin: 'U80904MH2015PTC123456',
  logoColor: '#1e3a5f',
};

/**
 * Format currency to INR
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format date to DD/MM/YYYY
 */
export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/**
 * Number to words for amount
 */
function numberToWords(num: number): string {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  
  function convert(n: number): string {
    if (n === 0) return '';
    if (n < 10) return ones[n];
    if (n < 20) return teens[n - 10];
    if (n < 100) return tens[Math.floor(n / 10)] + ' ' + ones[n % 10];
    if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred ' + convert(n % 100);
    if (n < 100000) return convert(Math.floor(n / 1000)) + ' Thousand ' + convert(n % 1000);
    if (n < 10000000) return convert(Math.floor(n / 100000)) + ' Lakh ' + convert(n % 100000);
    return convert(Math.floor(n / 10000000)) + ' Crore ' + convert(n % 10000000);
  }
  
  const rupees = Math.floor(num);
  const paise = Math.round((num - rupees) * 100);
  
  let result = convert(rupees) + ' Rupees';
  if (paise > 0) {
    result += ' and ' + convert(paise) + ' Paise';
  }
  return result + ' Only';
}

/**
 * Generate Client Invoice PDF
 */
export function generateClientInvoicePDF(
  invoice: Invoice & { line_items: InvoiceLineItem[] },
  contact: Contact
): jsPDF {
  const doc = new jsPDF() as jsPDFWithAutoTable;
  let yPos = 20;

  // Header with Logo placeholder
  doc.setFillColor(30, 58, 95); // #1e3a5f
  doc.rect(0, 0, 210, 35, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(COMPANY_DETAILS.name, 14, 15);
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text([
    `${COMPANY_DETAILS.address}, ${COMPANY_DETAILS.city}`,
    `${COMPANY_DETAILS.state} - ${COMPANY_DETAILS.pincode}`,
    `GSTIN: ${COMPANY_DETAILS.gstin} | PAN: ${COMPANY_DETAILS.pan}`,
    `Email: ${COMPANY_DETAILS.email} | ${COMPANY_DETAILS.website}`,
  ], 14, 22);

  // Invoice Title
  yPos = 45;
  doc.setTextColor(30, 58, 95);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('TAX INVOICE', 14, yPos);

  // Invoice Details Box
  yPos = 55;
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  
  const invoiceDetails = [
    ['Invoice No:', invoice.invoice_number],
    ['Invoice Date:', formatDate(invoice.invoice_date)],
    ['Due Date:', formatDate(invoice.due_date)],
    ['Place of Supply:', contact.state || 'Maharashtra'],
  ];
  
  doc.autoTable({
    startY: yPos,
    margin: { left: 14 },
    body: invoiceDetails,
    theme: 'plain',
    styles: { fontSize: 10, cellPadding: 2 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 40 },
      1: { cellWidth: 60 },
    },
  });

  // Bill To Section
  yPos = (doc as any).lastAutoTable.finalY + 10;
  doc.setFillColor(240, 240, 240);
  doc.rect(14, yPos - 5, 182, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.text('Bill To:', 14, yPos);
  
  yPos += 8;
  doc.setFont('helvetica', 'normal');
  const billToLines = [
    contact.company_name || `${contact.first_name} ${contact.last_name}`,
    contact.address || '',
    contact.city ? `${contact.city}, ${contact.state || ''} - ${contact.pincode || ''}` : '',
    contact.gst_number ? `GSTIN: ${contact.gst_number}` : '',
    contact.pan_number ? `PAN: ${contact.pan_number}` : '',
    contact.email || '',
    contact.phone || '',
  ].filter(Boolean);
  
  doc.text(billToLines, 14, yPos);

  // Line Items Table
  yPos += billToLines.length * 6 + 10;
  
  const tableHeaders = [
    'S.No', 'Description', 'HSN/SAC', 'Qty', 'Unit', 'Rate', 'Disc', 'Taxable', 'GST%', 'Amount'
  ];
  
  const tableData = invoice.line_items.map((item, index) => [
    (index + 1).toString(),
    item.item_description.slice(0, 50),
    item.hsn_sac_code || '',
    item.quantity.toString(),
    item.unit || 'Nos',
    formatCurrency(item.unit_price).replace('₹', ''),
    item.discount_percent > 0 ? `${item.discount_percent}%` : '-',
    formatCurrency(item.taxable_value).replace('₹', ''),
    `${item.gst_rate}%`,
    formatCurrency(item.total_amount).replace('₹', ''),
  ]);

  doc.autoTable({
    startY: yPos,
    head: [tableHeaders],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [30, 58, 95],
      textColor: [255, 255, 255],
      fontSize: 8,
      cellPadding: 3,
    },
    styles: {
      fontSize: 8,
      cellPadding: 3,
    },
    columnStyles: {
      0: { cellWidth: 12 },
      1: { cellWidth: 50 },
      2: { cellWidth: 20 },
      3: { cellWidth: 12 },
      4: { cellWidth: 15 },
      5: { cellWidth: 20, halign: 'right' },
      6: { cellWidth: 15 },
      7: { cellWidth: 20, halign: 'right' },
      8: { cellWidth: 12 },
      9: { cellWidth: 20, halign: 'right' },
    },
  });

  // Summary Section
  yPos = (doc as any).lastAutoTable.finalY + 10;
  
  const summaryStartX = 120;
  const summaryLines = [
    ['Subtotal:', formatCurrency(invoice.subtotal)],
    invoice.discount_amount > 0 ? ['Discount:', `- ${formatCurrency(invoice.discount_amount)}`] : null,
    ['Taxable Amount:', formatCurrency(invoice.taxable_amount)],
  ].filter(Boolean);
  
  if (invoice.gst_type === 'cgst_sgst') {
    summaryLines.push(
      [`CGST (${invoice.cgst_rate}%):`, formatCurrency(invoice.cgst_amount)],
      [`SGST (${invoice.sgst_rate}%):`, formatCurrency(invoice.sgst_amount)]
    );
  } else {
    summaryLines.push([`IGST (${invoice.igst_rate}%):`, formatCurrency(invoice.igst_amount)]);
  }
  
  if (invoice.tds_applicable && invoice.tds_amount > 0) {
    summaryLines.push([`TDS (${invoice.tds_section} @${invoice.tds_rate}%):`, `- ${formatCurrency(invoice.tds_amount)}`]);
  }
  
  summaryLines.push(['Total Amount:', formatCurrency(invoice.total_amount)]);

  (doc as any).autoTable({
    startY: yPos,
    margin: { left: summaryStartX },
    body: summaryLines,
    theme: 'plain',
    styles: {
      fontSize: 10,
      cellPadding: 3,
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 50, halign: 'right' },
      1: { cellWidth: 40, halign: 'right' },
    },
  });

  // Amount in Words
  yPos = (doc as any).lastAutoTable.finalY + 8;
  doc.setFont('helvetica', 'bold');
  doc.text('Amount in Words:', 14, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(numberToWords(invoice.total_amount), 14, yPos + 6);

  // Terms & Conditions
  yPos += 25;
  if (yPos > 250) {
    doc.addPage();
    yPos = 20;
  }
  
  doc.setFillColor(240, 240, 240);
  doc.rect(14, yPos - 5, 182, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.text('Terms & Conditions:', 14, yPos);
  
  yPos += 8;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  const terms = invoice.terms?.split('\n') || [
    '1. Payment due within 30 days of invoice date.',
    '2. Late payments subject to 18% p.a. interest.',
    '3. All disputes subject to Mumbai jurisdiction.',
    '4. GST reverse charge applicable where applicable.',
  ];
  doc.text(terms, 14, yPos);

  // Bank Details
  yPos += terms.length * 5 + 10;
  doc.setFont('helvetica', 'bold');
  doc.text('Bank Details:', 14, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text([
    'Bank Name: HDFC Bank Ltd.',
    'Account Number: 12345678901234',
    'IFSC Code: HDFC0000123',
    'Branch: Andheri East, Mumbai',
  ], 14, yPos + 5);

  // Signature Section
  yPos += 35;
  doc.setDrawColor(0, 0, 0);
  doc.line(140, yPos, 195, yPos);
  doc.setFont('helvetica', 'bold');
  doc.text('Authorised Signatory', 145, yPos + 5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('For Endeavor Academy Pvt Ltd', 140, yPos + 10);

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.text(
    'This is a computer generated invoice and does not require signature.',
    105,
    290,
    { align: 'center' }
  );

  return doc;
}

/**
 * Generate Freelancer Payment Voucher PDF
 */
export function generateFreelancerPaymentPDF(
  invoice: Invoice & { line_items: InvoiceLineItem[] },
  freelancer: Freelancer
): jsPDF {
  const doc = new jsPDF() as jsPDFWithAutoTable;
  
  // Header
  doc.setFillColor(30, 58, 95);
  doc.rect(0, 0, 210, 30, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('PAYMENT VOUCHER', 14, 18);
  
  // Voucher Details
  let yPos = 40;
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  
  const details = [
    ['Voucher No:', invoice.invoice_number],
    ['Date:', formatDate(invoice.invoice_date)],
    ['Payment Type:', 'Freelancer Payment'],
  ];
  
  doc.autoTable({
    startY: yPos,
    margin: { left: 14 },
    body: details,
    theme: 'plain',
    styles: { fontSize: 10 },
  });

  // Payee Details
  yPos = (doc as any).lastAutoTable.finalY + 15;
  doc.setFillColor(240, 240, 240);
  doc.rect(14, yPos - 5, 182, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.text('Payment To:', 14, yPos);
  
  yPos += 8;
  doc.setFont('helvetica', 'normal');
  doc.text([
    `Name: ${freelancer.first_name} ${freelancer.last_name}`,
    `PAN: ${freelancer.pan_number || 'N/A'}`,
    `Bank: ${freelancer.bank_name || 'N/A'}`,
    `Account: ${freelancer.bank_account_number || 'N/A'}`,
    `IFSC: ${freelancer.bank_ifsc_code || 'N/A'}`,
  ], 14, yPos);

  // Payment Summary
  yPos += 40;
  doc.autoTable({
    startY: yPos,
    head: [['Description', 'Amount (₹)']],
    body: [
      ['Gross Amount', formatCurrency(invoice.subtotal).replace('₹', '')],
      invoice.tds_applicable && invoice.tds_amount > 0 
        ? [`TDS (${invoice.tds_section} @${invoice.tds_rate}%)`, `- ${formatCurrency(invoice.tds_amount).replace('₹', '')}`]
        : ['TDS', '0.00'],
      ['Net Payable', formatCurrency(invoice.total_amount).replace('₹', '')],
    ],
    theme: 'grid',
    headStyles: { fillColor: [30, 58, 95] },
  });

  // Approval Section
  yPos = (doc as any).lastAutoTable.finalY + 30;
  doc.setFont('helvetica', 'bold');
  doc.text('Authorizations:', 14, yPos);
  yPos += 15;
  
  doc.line(14, yPos, 70, yPos);
  doc.line(80, yPos, 136, yPos);
  doc.line(146, yPos, 196, yPos);
  
  yPos += 5;
  doc.setFontSize(9);
  doc.text('Prepared By', 14, yPos);
  doc.text('Verified By', 80, yPos);
  doc.text('Approved By', 146, yPos);

  return doc;
}

/**
 * Download PDF
 */
export function downloadPDF(doc: jsPDF, filename: string): void {
  doc.save(`${filename}.pdf`);
}

/**
 * Get PDF as blob
 */
export function getPDFBlob(doc: jsPDF): Blob {
  return doc.output('blob');
}

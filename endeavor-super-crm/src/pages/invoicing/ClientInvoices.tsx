import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Plus,
  Search,
  Download,
  Send,
  Eye,
  MoreHorizontal,
  CheckCircle,
  Clock,
  AlertCircle,
  FileText,
  Printer,
  MessageSquare,
} from 'lucide-react';
import { db } from '../../lib/supabase';
import type { Invoice, InvoiceLineItem, Contact } from '../../types';

/**
 * Format date to DD-MM-YYYY (GST compliant format)
 */
function formatDateDDMMYYYY(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}
import { calculateInvoiceGST, isValidGSTIN } from '../../utils/gstCalculations';
import { getFreelancerTDSRate, getVendorTDSRate } from '../../utils/tdsCalculations';
import { 
  generateClientInvoiceNumber, 
  parseInvoiceNumber,
  getFinancialYear,
  INVOICE_PREFIXES,
  isValidInvoiceNumber
} from '../../utils/invoiceNumbering';
import { generateClientInvoicePDF } from '../../utils/pdfGenerator';

const INVOICE_STATUS = [
  { value: 'draft', label: 'Draft', color: 'badge-gray' },
  { value: 'sent', label: 'Sent', color: 'badge-blue' },
  { value: 'viewed', label: 'Viewed', color: 'badge-purple' },
  { value: 'paid', label: 'Paid', color: 'badge-green' },
  { value: 'partial', label: 'Partial', color: 'badge-yellow' },
  { value: 'overdue', label: 'Overdue', color: 'badge-red' },
  { value: 'cancelled', label: 'Cancelled', color: 'badge-gray' },
];

export default function ClientInvoices() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);

  useEffect(() => {
    loadInvoices();
  }, []);

  async function loadInvoices() {
    try {
      setLoading(true);
      const { data, error } = await db.invoices.getByType('client');
      if (error) throw error;
      setInvoices(data || []);
    } catch (error) {
      console.error('Error loading invoices:', error);
    } finally {
      setLoading(false);
    }
  }

  /**
   * Generate GST-compliant invoice number: INV/YYYY-YY/XXXXX
   * Example: INV/2024-25/00001
   * 
   * This function ensures:
   * - Financial year based (April-March)
   * - Sequential numbering
   * - Unique per FY (resets on FY change)
   */
  function generateInvoiceNumber(existingInvoices: any[]): string {
    return generateClientInvoiceNumber(existingInvoices);
  }

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      searchQuery === '' ||
      inv.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.contacts?.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.contacts?.first_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  function handleDownloadPDF(invoice: any) {
    const doc = generateClientInvoicePDF(invoice, invoice.contacts);
    doc.save(`${invoice.invoice_number}.pdf`);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Client Invoices</h1>
          <p className="text-gray-500 dark:text-gray-400">Manage GST-compliant invoices for clients</p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="btn-primary">
          <Plus className="h-4 w-4 mr-2" />
          Create Invoice
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="card p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Invoices</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{invoices.length}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Paid</p>
          <p className="text-2xl font-bold text-green-600">{invoices.filter((i) => i.status === 'paid').length}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Pending</p>
          <p className="text-2xl font-bold text-blue-600">
            {invoices.filter((i) => ['sent', 'viewed', 'partial'].includes(i.status)).length}
          </p>
        </div>
        <div className="card p-4 border-red-100">
          <p className="text-sm text-gray-500 dark:text-gray-400">Overdue</p>
          <p className="text-2xl font-bold text-red-600">{invoices.filter((i) => i.status === 'overdue').length}</p>
        </div>
        <div className="card p-4 bg-primary-50">
          <p className="text-sm text-gray-600">Total Value</p>
          <p className="text-2xl font-bold text-primary-700">
            ₹{(invoices.reduce((sum, i) => sum + i.total_amount, 0) / 100000).toFixed(1)}L
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search invoices by number, client..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-10"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input md:w-40"
          >
            <option value="all">All Status</option>
            {INVOICE_STATUS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="card overflow-hidden">
        <table className="data-table">
          <thead>
            <tr>
              <th>Invoice #</th>
              <th>Client</th>
              <th>Date</th>
              <th>Due Date</th>
              <th>Amount</th>
              <th>GST</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {loading ? (
              <tr>
                <td colSpan={8} className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-700 mx-auto"></div>
                </td>
              </tr>
            ) : filteredInvoices.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-8 text-gray-500">
                  No invoices found. Create your first invoice!
                </td>
              </tr>
            ) : (
              filteredInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="font-medium text-gray-900 dark:text-white">{inv.invoice_number}</td>
                  <td className="text-gray-500">{inv.contacts?.company_name || `${inv.contacts?.first_name} ${inv.contacts?.last_name}`}</td>
                  <td>{formatDateDDMMYYYY(inv.invoice_date)}</td>
                  <td>{formatDateDDMMYYYY(inv.due_date)}</td>
                  <td className="font-medium">₹{inv.total_amount.toLocaleString('en-IN')}</td>
                  <td className="text-sm">
                    {inv.gst_type === 'cgst_sgst' ? (
                      <span className="text-gray-500">CGST+SGST</span>
                    ) : (
                      <span className="text-gray-500">IGST</span>
                    )}
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        INVOICE_STATUS.find((s) => s.value === inv.status)?.color || 'badge-gray'
                      }`}
                    >
                      {INVOICE_STATUS.find((s) => s.value === inv.status)?.label}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDownloadPDF(inv)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                        title="Download PDF"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setSelectedInvoice(inv)}
                        className="p-1 text-gray-400 hover:text-primary-700"
                        title="View"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        className="p-1 text-gray-400 hover:text-green-600"
                        title="Send via WhatsApp"
                      >
                        <MessageSquare className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create Invoice Modal */}
      {showCreateModal && (
        <CreateInvoiceModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            loadInvoices();
          }}
        />
      )}
    </div>
  );
}

function CreateInvoiceModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [lineItems, setLineItems] = useState<Partial<InvoiceLineItem>[]>([
    { item_description: '', quantity: 1, unit_price: 0, gst_rate: 18 },
  ]);
  const [invoiceData, setInvoiceData] = useState<Partial<Invoice>>({
    invoice_date: new Date().toISOString().split('T')[0],
    due_date: '',
    notes: '',
    terms: 'Payment due within 30 days.',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadContacts();
  }, []);

  async function loadContacts() {
    const { data } = await db.contacts.getAll();
    setContacts(data || []);
  }

  const subtotal = lineItems.reduce((sum, item) => {
    const qty = item.quantity || 0;
    const price = item.unit_price || 0;
    const discAmount = item.discount_amount || 0;
    return sum + qty * price - discAmount;
  }, 0);

  const clientStateCode = selectedContact?.state ? getStateCode(selectedContact.state) : '27';
  const companyStateCode = '27'; // Maharashtra
  const isIntraState = clientStateCode === companyStateCode;

  const gstCalculation = calculateInvoiceGST(
    lineItems.map((item) => ({
      taxableValue: (item.quantity || 0) * (item.unit_price || 0) - (item.discount_amount || 0),
      gstRate: item.gst_rate || 18,
    })),
    clientStateCode,
    companyStateCode
  );

  function getStateCode(state: string): string {
    const stateMap: Record<string, string> = {
      'Maharashtra': '27',
      'Gujarat': '24',
      'Karnataka': '29',
      'Tamil Nadu': '33',
      'Telangana': '36',
      'Delhi': '07',
      'Haryana': '06',
      'Rajasthan': '08',
      'Uttar Pradesh': '09',
      'West Bengal': '19',
    };
    return stateMap[state] || '27';
  }

  function addLineItem() {
    setLineItems([...lineItems, { item_description: '', quantity: 1, unit_price: 0, gst_rate: 18 }]);
  }

  function updateLineItem(index: number, field: string, value: any) {
    const newItems = [...lineItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setLineItems(newItems);
  }

  function removeLineItem(index: number) {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((_, i) => i !== index));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedContact) {
      alert('Please select a client');
      return;
    }

    try {
      setSaving(true);
      // Generate GST-compliant invoice number: INV/YYYY-YY/XXXXX
      const invoiceNumber = generateClientInvoiceNumber(invoices);

      const { data: invoice, error: invError } = await db.invoices.create({
        invoice_number: invoiceNumber,
        invoice_type: 'client',
        contact_id: selectedContact.id,
        invoice_date: invoiceData.invoice_date,
        due_date: invoiceData.due_date,
        subtotal: subtotal,
        discount_amount: 0,
        taxable_amount: gstCalculation.taxableValue,
        is_gst_applicable: true,
        gst_type: gstCalculation.gstType,
        cgst_rate: isIntraState ? 9 : 0,
        sgst_rate: isIntraState ? 9 : 0,
        igst_rate: isIntraState ? 0 : 18,
        cgst_amount: gstCalculation.cgstAmount,
        sgst_amount: gstCalculation.sgstAmount,
        igst_amount: gstCalculation.igstAmount,
        gstin: selectedContact.gst_number,
        tds_applicable: false,
        total_amount: gstCalculation.totalAmount,
        amount_due: gstCalculation.totalAmount,
        amount_paid: 0,
        status: 'draft',
        notes: invoiceData.notes,
        terms: invoiceData.terms,
      });

      if (invError) throw invError;

      // Create line items
      const lineItemData = lineItems.map((item, index) => ({
        invoice_id: invoice!.id,
        item_description: item.item_description,
        quantity: item.quantity,
        unit: item.unit || 'Nos',
        unit_price: item.unit_price,
        discount_percent: item.discount_percent || 0,
        discount_amount: item.discount_amount || 0,
        taxable_value: (item.quantity || 0) * (item.unit_price || 0) - (item.discount_amount || 0),
        gst_rate: item.gst_rate || 18,
        gst_amount: ((item.quantity || 0) * (item.unit_price || 0) - (item.discount_amount || 0)) * ((item.gst_rate || 18) / 100),
        total_amount: ((item.quantity || 0) * (item.unit_price || 0) - (item.discount_amount || 0)) * (1 + ((item.gst_rate || 18) / 100)),
        sort_order: index,
      }));

      await db.invoiceLineItems.create(lineItemData);

      onSuccess();
    } catch (error) {
      console.error('Error creating invoice:', error);
      alert('Failed to create invoice');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-gray-900/50" onClick={onClose} />
        <div className="relative bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Create Client Invoice</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Client Selection */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Client *</label>
                  <select
                    required
                    onChange={(e) => setSelectedContact(contacts.find((c) => c.id === e.target.value) || null)}
                    className="input"
                  >
                    <option value="">Select client...</option>
                    {contacts.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.company_name || `${c.first_name} ${c.last_name}`}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">GSTIN</label>
                  <input
                    type="text"
                    value={selectedContact?.gst_number || ''}
                    disabled
                    className="input bg-gray-50"
                  />
                </div>
              </div>

              {selectedContact && (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    Place of Supply: <strong>{selectedContact.state || 'Maharashtra'}</strong> | 
                    GST Type: <strong>{isIntraState ? 'CGST + SGST' : 'IGST'}</strong>
                  </p>
                </div>
              )}

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Invoice Date</label>
                  <input
                    type="date"
                    required
                    value={invoiceData.invoice_date}
                    onChange={(e) => setInvoiceData({ ...invoiceData, invoice_date: e.target.value })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Due Date</label>
                  <input
                    type="date"
                    required
                    value={invoiceData.due_date}
                    onChange={(e) => setInvoiceData({ ...invoiceData, due_date: e.target.value })}
                    className="input"
                  />
                </div>
              </div>

              {/* Line Items */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="label mb-0">Line Items</label>
                  <button type="button" onClick={addLineItem} className="text-sm text-primary-700 hover:text-primary-800">
                    + Add Item
                  </button>
                </div>
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-3 py-2 text-left">Description</th>
                      <th className="px-3 py-2 text-left w-20">Qty</th>
                      <th className="px-3 py-2 text-left w-28">Rate</th>
                      <th className="px-3 py-2 text-left w-20">GST%</th>
                      <th className="px-3 py-2 text-right w-28">Amount</th>
                      <th className="px-3 py-2 w-10"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {lineItems.map((item, index) => (
                      <tr key={index} className="border-b dark:border-gray-700">
                        <td className="p-2">
                          <input
                            type="text"
                            placeholder="Item description"
                            value={item.item_description}
                            onChange={(e) => updateLineItem(index, 'item_description', e.target.value)}
                            className="input w-full"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateLineItem(index, 'quantity', Number(e.target.value))}
                            className="input w-full"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            value={item.unit_price}
                            onChange={(e) => updateLineItem(index, 'unit_price', Number(e.target.value))}
                            className="input w-full"
                          />
                        </td>
                        <td className="p-2">
                          <select
                            value={item.gst_rate}
                            onChange={(e) => updateLineItem(index, 'gst_rate', Number(e.target.value))}
                            className="input w-full"
                          >
                            <option value={0}>0%</option>
                            <option value={5}>5%</option>
                            <option value={12}>12%</option>
                            <option value={18}>18%</option>
                            <option value={28}>28%</option>
                          </select>
                        </td>
                        <td className="p-2 text-right">
                          ₹{((item.quantity || 0) * (item.unit_price || 0)).toLocaleString('en-IN')}
                        </td>
                        <td className="p-2">
                          <button type="button" onClick={() => removeLineItem(index)} className="text-red-500 hover:text-red-700">
                            ×
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary */}
              <div className="flex justify-end">
                <div className="w-72 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal:</span>
                    <span>₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  {isIntraState ? (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">CGST (9%):</span>
                        <span>₹{gstCalculation.cgstAmount.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">SGST (9%):</span>
                        <span>₹{gstCalculation.sgstAmount.toLocaleString('en-IN')}</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">IGST (18%):</span>
                      <span>₹{gstCalculation.igstAmount.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold pt-2 border-t">
                    <span>Total:</span>
                    <span>₹{gstCalculation.totalAmount.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {/* Notes & Terms */}
              <div>
                <label className="label">Terms & Conditions</label>
                <textarea
                  rows={3}
                  value={invoiceData.terms}
                  onChange={(e) => setInvoiceData({ ...invoiceData, terms: e.target.value })}
                  className="input"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button type="button" onClick={onClose} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="btn-primary">
                  {saving ? 'Creating...' : 'Create Invoice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

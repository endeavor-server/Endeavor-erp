import { useState } from 'react';
import { 
  FileText, Receipt, Calculator, CheckCircle, AlertTriangle, Clock, Download, 
  TrendingUp, TrendingDown, Search, Plus, Filter, MoreVertical, IndianRupee,
  Calendar, Wallet, ArrowUpRight, ArrowDownRight, ChevronRight, FileSpreadsheet,
  FileJson, History, Shield
} from 'lucide-react';

type FinanceTab = 'invoices' | 'gst' | 'tds' | 'compliance';

// Invoices Data
const clientInvoices = [
  { id: 'INV-2024-001', client: 'Tech Solutions', date: '2024-12-01', amount: 1250000, gst: 225000, tds: 12500, status: 'paid', dueDate: '2025-01-01' },
  { id: 'INV-2024-002', client: 'EduLearn Academy', date: '2024-12-05', amount: 850000, gst: 153000, tds: 8500, status: 'pending', dueDate: '2025-01-05' },
  { id: 'INV-2024-003', client: 'HealthPlus Medical', date: '2024-12-10', amount: 2100000, gst: 378000, tds: 21000, status: 'overdue', dueDate: '2025-01-10' },
  { id: 'INV-2024-004', client: 'FinCorp Solutions', date: '2024-12-15', amount: 3200000, gst: 576000, tds: 32000, status: 'paid', dueDate: '2025-01-15' },
];

const freelancerInvoices = [
  { id: 'FL-INV-001', freelancer: 'Alex Chen', hours: 120, rate: 2500, amount: 300000, tds: 30000, status: 'paid', month: 'Dec 2024' },
  { id: 'FL-INV-002', freelancer: 'Maria Garcia', hours: 80, rate: 3500, amount: 280000, tds: 28000, status: 'pending', month: 'Dec 2024' },
  { id: 'FL-INV-003', freelancer: 'James Wilson', hours: 150, rate: 2200, amount: 330000, tds: 33000, status: 'approved', month: 'Dec 2024' },
];

// GST Data
const gstMonthlyData = [
  { month: 'Nov 2024', gstr1: 'filed', gstr3b: 'filed', taxable: 6850000, igst: 685000, cgst: 411000, sgst: 411000 },
  { month: 'Dec 2024', gstr1: 'pending', gstr3b: 'pending', taxable: 7200000, igst: 720000, cgst: 432000, sgst: 432000 },
];

const gstReconciliation = [
  { source: 'GSTR-2A', amount: 4520000, matched: true },
  { source: 'GSTR-2B', amount: 4518000, matched: true },
  { source: 'Purchase Register', amount: 4525000, matched: false, diff: 5000 },
];

// TDS Data
const tdsSummary = [
  { section: '192', desc: 'Salary', rate: 'As per slab', amount: 285000, deposited: true, quarter: 'Q3 FY24' },
  { section: '194C', desc: 'Contractor Payment', rate: '2%', amount: 45000, deposited: true, quarter: 'Q3 FY24' },
  { section: '194J', desc: 'Professional Fees', rate: '10%', amount: 125000, deposited: true, quarter: 'Q3 FY24' },
  { section: '194H', desc: 'Commission', rate: '5%', amount: 8500, deposited: false, quarter: 'Q3 FY24' },
];

// Compliance Calendar
const complianceItems = [
  { type: 'GSTR-1', dueDate: '2025-01-11', status: 'pending', daysRemaining: 2 },
  { type: 'GSTR-3B', dueDate: '2025-01-20', status: 'pending', daysRemaining: 11 },
  { type: 'TDS Return', dueDate: '2025-01-07', status: 'overdue', daysRemaining: -2 },
  { type: 'Advance Tax', dueDate: '2025-03-15', status: 'upcoming', daysRemaining: 65 },
];

const invoiceStats = {
  client: { paid: 24, pending: 8, overdue: 3, total: 8450000 },
  freelancer: { paid: 156, pending: 42, approved: 38, total: 2450000 },
  contractor: { paid: 12, pending: 5, total: 4500000 },
  vendor: { paid: 89, pending: 23, total: 3200000 },
};

function StatCard({ label, value, trend, icon: Icon, trendValue }: { 
  label: string; value: string; trend: 'up' | 'down' | 'neutral'; icon: any; trendValue: string 
}) {
  return (
    <div className="card p-5 surface-hover">
      <div className="flex items-start justify-between mb-4">
        <div className="p-2.5 bg-[var(--surface-hover)] rounded-lg">
          <Icon className="w-5 h-5 text-[var(--text-secondary)]" />
        </div>
        <div className={`flex items-center gap-1 text-xs font-medium ${
          trend === 'up' ? 'text-[var(--success)]' : trend === 'down' ? 'text-[var(--error)]' : 'text-[var(--text-muted)]'
        }`}>
          {trendValue}
        </div>
      </div>
      <p className="text-2xl font-bold text-[var(--text-primary)] mb-1">{value}</p>
      <p className="text-sm text-[var(--text-muted)]">{label}</p>
    </div>
  );
}

export function FinanceModule() {
  const [activeTab, setActiveTab] = useState<FinanceTab>('invoices');
  const [invoiceType, setInvoiceType] = useState<'client' | 'freelancer' | 'contractor' | 'vendor'>('client');

  const tabs = [
    { id: 'invoices' as const, label: 'Invoices', icon: Receipt },
    { id: 'gst' as const, label: 'GST', icon: Calculator },
    { id: 'tds' as const, label: 'TDS', icon: IndianRupee },
    { id: 'compliance' as const, label: 'Compliance', icon: Shield },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-[var(--success-light)] text-[var(--success)]';
      case 'pending': return 'bg-[var(--warning-light)] text-[var(--warning)]';
      case 'approved': return 'bg-[var(--info-light)] text-[var(--info)]';
      case 'overdue': return 'bg-[var(--error-light)] text-[var(--error)]';
      default: return 'bg-[var(--surface-hover)] text-[var(--text-muted)]';
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Total Receivables" value="₹1.85Cr" trend="up" trendValue="+12%" icon={TrendingUp} />
        <StatCard label="Total Payables" value="₹98.5L" trend="down" trendValue="-5%" icon={TrendingDown} />
        <StatCard label="Pending GST" value="₹15.2L" trend="neutral" trendValue="Due Jan 20" icon={Calculator} />
        <StatCard label="TDS to Deposit" value="₹8,500" trend="up" trendValue="Due in 3 days" icon={AlertTriangle} />
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 bg-[var(--surface)] rounded-lg p-1 border border-[var(--border)]">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-[var(--primary)] text-white'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button className="btn btn-secondary text-sm px-4 py-2">
            <Download className="w-4 h-4" />
            Export
          </button>
          <button className="btn btn-primary text-sm px-4 py-2">
            <Plus className="w-4 h-4" />
            New Invoice
          </button>
        </div>
      </div>

      {/* Invoices Tab */}
      {activeTab === 'invoices' && (
        <div className="space-y-4">
          {/* Invoice Type Selector */}
          <div className="flex items-center gap-2">
            {(['client', 'freelancer', 'contractor', 'vendor'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setInvoiceType(type)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  invoiceType === type
                    ? 'bg-[var(--surface)] text-[var(--primary)] border border-[var(--primary)]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)} Invoices
              </button>
            ))}
          </div>

          {/* Invoice Stats */}
          <div className="grid grid-cols-4 gap-4">
            <div className="card p-4 bg-[var(--success-light)] border-[var(--success)]/20">
              <p className="text-xs text-[var(--success)] uppercase tracking-wider mb-1">Paid</p>
              <p className="text-xl font-bold text-[var(--text-primary)]">{invoiceStats[invoiceType].paid}</p>
            </div>
            <div className="card p-4 bg-[var(--warning-light)] border-[var(--warning)]/20">
              <p className="text-xs text-[var(--warning)] uppercase tracking-wider mb-1">Pending</p>
              <p className="text-xl font-bold text-[var(--text-primary)]">{invoiceStats[invoiceType].pending}</p>
            </div>
            {invoiceType === 'freelancer' && (
              <div className="card p-4 bg-[var(--info-light)] border-[var(--info)]/20">
                <p className="text-xs text-[var(--info)] uppercase tracking-wider mb-1">Approved</p>
                <p className="text-xl font-bold text-[var(--text-primary)]">{invoiceStats[invoiceType].approved}</p>
              </div>
            )}
            <div className="card p-4 bg-[var(--surface-hover)]">
              <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-1">Total Value</p>
              <p className="text-xl font-bold text-[var(--text-primary)]">₹{(invoiceStats[invoiceType].total / 100000).toFixed(1)}L</p>
            </div>
          </div>

          {/* Invoice Table */}
          <div className="card overflow-hidden">
            <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-[var(--surface-hover)] text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
              <div className="col-span-2">Invoice ID</div>
              <div className="col-span-2">{invoiceType === 'client' ? 'Client' : 'Vendor'}</div>
              <div className="col-span-2">Date</div>
              <div className="col-span-2 text-right">Amount</div>
              <div className="col-span-2 text-center">Status</div>
              <div className="col-span-2"></div>
            </div>
            {(invoiceType === 'client' ? clientInvoices : freelancerInvoices).map((inv, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-4 px-4 py-3 border-t border-[var(--border)] hover:bg-[var(--surface-hover)] transition-colors items-center">
                <div className="col-span-2 text-sm font-medium text-[var(--text-primary)]">{inv.id}</div>
                <div className="col-span-2 text-sm text-[var(--text-secondary)]">
                  {'client' in inv ? inv.client : inv.freelancer}
                </div>
                <div className="col-span-2 text-sm text-[var(--text-secondary)]">{inv.date || (inv as any).month}</div>
                <div className="col-span-2 text-right text-sm font-medium text-[var(--text-primary)]">₹{inv.amount.toLocaleString()}</div>
                <div className="col-span-2 text-center">
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(inv.status)}`}>
                    {inv.status}
                  </span>
                </div>
                <div className="col-span-2 flex justify-end gap-2">
                  <button className="btn btn-ghost p-1.5">
                    <FileText className="w-4 h-4" />
                  </button>
                  <button className="btn btn-ghost p-1.5">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* GST Tab */}
      {activeTab === 'gst' && (
        <div className="space-y-6">
          {/* GSTR Status Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-[var(--text-primary)]">GSTR-1</h3>
                  <p className="text-sm text-[var(--text-muted)]">Outward Supplies</p>
                </div>
                <span className="px-3 py-1 text-xs font-medium bg-[var(--warning-light)] text-[var(--warning)] rounded-full">
                  Pending
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[var(--text-secondary)]">Due Date</span>
                  <span className="text-[var(--text-primary)]">Jan 11, 2025</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[var(--text-secondary)]">Taxable Value</span>
                  <span className="text-[var(--text-primary)]">₹72,00,000</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[var(--text-secondary)]">Total Tax</span>
                  <span className="text-[var(--primary)]">₹15,84,000</span>
                </div>
              </div>
            </div>

            <div className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-[var(--text-primary)]">GSTR-3B</h3>
                  <p className="text-sm text-[var(--text-muted)]">Monthly Return</p>
                </div>
                <span className="px-3 py-1 text-xs font-medium bg-[var(--warning-light)] text-[var(--warning)] rounded-full">
                  Pending
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[var(--text-secondary)]">Due Date</span>
                  <span className="text-[var(--text-primary)]">Jan 20, 2025</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[var(--text-secondary)]">Tax Payable</span>
                  <span className="text-[var(--error)]">₹8,64,000</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[var(--text-secondary)]">ITC Available</span>
                  <span className="text-[var(--success)]">₹4,52,000</span>
                </div>
              </div>
            </div>
          </div>

          {/* Reconciliation */}
          <div className="card p-5">
            <h3 className="font-semibold text-[var(--text-primary)] mb-4">Input Tax Credit Reconciliation</h3>
            <div className="space-y-3">
              {gstReconciliation.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-[var(--surface-hover)] rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.matched ? 'bg-[var(--success-light)]' : 'bg-[var(--error-light)]'}`}>
                      {item.matched ? <CheckCircle className="w-4 h-4 text-[var(--success)]" /> : <AlertTriangle className="w-4 h-4 text-[var(--error)]" />}
                    </div>
                    <span className="text-sm font-medium text-[var(--text-primary)]">{item.source}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-[var(--text-primary)]">₹{item.amount.toLocaleString()}</span>
                    {!item.matched && item.diff && (
                      <span className="text-xs text-[var(--error)]">Diff: ₹{item.diff.toLocaleString()}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Export Actions */}
          <div className="flex items-center gap-3">
            <button className="btn btn-secondary px-4 py-2 text-sm">
              <FileJson className="w-4 h-4" />
              Export JSON (GSTR-1)
            </button>
            <button className="btn btn-secondary px-4 py-2 text-sm">
              <FileSpreadsheet className="w-4 h-4" />
              Export Excel
            </button>
          </div>
        </div>
      )}

      {/* TDS Tab */}
      {activeTab === 'tds' && (
        <div className="space-y-6">
          {/* TDS Summary Cards */}
          <div className="grid grid-cols-4 gap-4">
            <div className="card p-5">
              <h4 className="text-xs font-medium text-[var(--text-muted)] uppercase mb-2">Total TDS Deducted</h4>
              <p className="text-2xl font-bold text-[var(--text-primary)]">₹4.55L</p>
            </div>
            <div className="card p-5">
              <h4 className="text-xs font-medium text-[var(--text-muted)] uppercase mb-2">TDS Deposited</h4>
              <p className="text-2xl font-bold text-[var(--success)]">₹4.46L</p>
            </div>
            <div className="card p-5">
              <h4 className="text-xs font-medium text-[var(--text-muted)] uppercase mb-2">Pending Deposit</h4>
              <p className="text-2xl font-bold text-[var(--error)]">₹8,500</p>
            </div>
            <div className="card p-5">
              <h4 className="text-xs font-medium text-[var(--text-muted)] uppercase mb-2">Next Due Date</h4>
              <p className="text-2xl font-bold text-[var(--warning)]">Jan 7</p>
            </div>
          </div>

          {/* TDS Section Table */}
          <div className="card overflow-hidden">
            <div className="p-4 border-b border-[var(--border)]">
              <h3 className="font-semibold text-[var(--text-primary)]">TDS Summary by Section</h3>
            </div>
            <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-[var(--surface-hover)] text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
              <div className="col-span-1">Section</div>
              <div className="col-span-3">Description</div>
              <div className="col-span-2">Rate</div>
              <div className="col-span-2 text-right">Amount</div>
              <div className="col-span-2 text-center">Status</div>
              <div className="col-span-2">Quarter</div>
            </div>
            {tdsSummary.map((tds, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-4 px-4 py-3 border-t border-[var(--border)] hover:bg-[var(--surface-hover)] transition-colors items-center">
                <div className="col-span-1 text-sm font-mono text-[var(--primary)]">{tds.section}</div>
                <div className="col-span-3 text-sm text-[var(--text-primary)]">{tds.desc}</div>
                <div className="col-span-2 text-sm text-[var(--text-secondary)]">{tds.rate}</div>
                <div className="col-span-2 text-right text-sm font-medium text-[var(--text-primary)]">₹{tds.amount.toLocaleString()}</div>
                <div className="col-span-2 text-center">
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${tds.deposited ? 'bg-[var(--success-light)] text-[var(--success)]' : 'bg-[var(--error-light)] text-[var(--error)]'}`}>
                    {tds.deposited ? 'Deposited' : 'Pending'}
                  </span>
                </div>
                <div className="col-span-2 text-sm text-[var(--text-secondary)]">{tds.quarter}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Compliance Tab */}
      {activeTab === 'compliance' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            {/* Compliance Calendar */}
            <div className="card p-5">
              <h3 className="font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[var(--primary)]" />
                Filing Calendar
              </h3>
              <div className="space-y-3">
                {complianceItems.map((item, idx) => (
                  <div key={idx} className={`flex items-center justify-between p-3 rounded-lg border ${
                    item.status === 'overdue' ? 'bg-[var(--error-light)] border-[var(--error)]/20' :
                    item.status === 'pending' ? 'bg-[var(--warning-light)] border-[var(--warning)]/20' :
                    'bg-[var(--surface-hover)] border-[var(--border)]'
                  }`}>
                    <div>
                      <p className="font-medium text-[var(--text-primary)]">{item.type}</p>
                      <p className="text-xs text-[var(--text-muted)]">Due: {item.dueDate}</p>
                    </div>
                    <div className="text-right">
                      <span className={`text-sm font-medium ${
                        item.daysRemaining < 0 ? 'text-[var(--error)]' :
                        item.daysRemaining < 7 ? 'text-[var(--warning)]' :
                        'text-[var(--success)]'
                      }`}>
                        {item.daysRemaining < 0 ? `${Math.abs(item.daysRemaining)} days overdue` : `${item.daysRemaining} days left`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card p-5">
              <h3 className="font-semibold text-[var(--text-primary)] mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button className="w-full flex items-center justify-between p-3 bg-[var(--surface-hover)] rounded-lg hover:bg-[var(--surface-active)] transition-colors text-left">
                  <span className="text-sm text-[var(--text-primary)]">Prepare GSTR-1</span>
                  <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />
                </button>
                <button className="w-full flex items-center justify-between p-3 bg-[var(--surface-hover)] rounded-lg hover:bg-[var(--surface-active)] transition-colors text-left">
                  <span className="text-sm text-[var(--text-primary)]">File TDS Return</span>
                  <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />
                </button>
                <button className="w-full flex items-center justify-between p-3 bg-[var(--surface-hover)] rounded-lg hover:bg-[var(--surface-active)] transition-colors text-left">
                  <span className="text-sm text-[var(--text-primary)]">Generate Form 16</span>
                  <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />
                </button>
                <button className="w-full flex items-center justify-between p-3 bg-[var(--surface-hover)] rounded-lg hover:bg-[var(--surface-active)] transition-colors text-left">
                  <span className="text-sm text-[var(--text-primary)]">Reconcile GST</span>
                  <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

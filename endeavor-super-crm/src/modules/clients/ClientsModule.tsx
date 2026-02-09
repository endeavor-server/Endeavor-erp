import { useState } from 'react';
import { 
  Building2, Mail, Phone, MapPin, FileText, Briefcase, Receipt, TrendingUp, Plus, 
  Edit2, MoreVertical, CheckCircle, AlertCircle, IndianRupee, Calendar, Search,
  ArrowLeft, Star, Users, Clock, Shield, AlertTriangle, X
} from 'lucide-react';

// Mock clients data
interface Client {
  id: string;
  company_name: string;
  contact_name: string;
  email: string;
  phone: string;
  industry: string;
  city: string;
  state: string;
  gst_number: string;
  credit_limit: number;
  payment_behavior: 'excellent' | 'good' | 'average' | 'poor';
  sla_score: number;
  contracts_count: number;
  projects_count: number;
  invoices_count: number;
  status: 'active' | 'at-risk' | 'inactive';
  avatar: string;
  total_value: number;
}

const mockClients: Client[] = [
  {
    id: '1', company_name: 'Tech Solutions Pvt Ltd', contact_name: 'Rahul Sharma', 
    email: 'rahul@techsolutions.com', phone: '+91 98765 43210', industry: 'IT Services',
    city: 'Mumbai', state: 'Maharashtra', gst_number: '27AABCT1234C1Z5',
    credit_limit: 5000000, payment_behavior: 'excellent', sla_score: 95,
    contracts_count: 3, projects_count: 8, invoices_count: 24, status: 'active',
    avatar: 'TS', total_value: 24000000
  },
  {
    id: '2', company_name: 'EduLearn Academy', contact_name: 'Priya Verma',
    email: 'priya@edulearn.in', phone: '+91 98765 43211', industry: 'Education',
    city: 'Delhi', state: 'Delhi', gst_number: '07AABCE1234D1Z2',
    credit_limit: 2500000, payment_behavior: 'good', sla_score: 88,
    contracts_count: 2, projects_count: 5, invoices_count: 12, status: 'active',
    avatar: 'EA', total_value: 12500000
  },
  {
    id: '3', company_name: 'HealthPlus Medical', contact_name: 'Amit Patel',
    email: 'amit@healthplus.com', phone: '+91 98765 43212', industry: 'Healthcare',
    city: 'Ahmedabad', state: 'Gujarat', gst_number: '24AABCH1234E1Z8',
    credit_limit: 8000000, payment_behavior: 'average', sla_score: 72,
    contracts_count: 1, projects_count: 3, invoices_count: 6, status: 'at-risk',
    avatar: 'HM', total_value: 6800000
  },
  {
    id: '4', company_name: 'FinCorp Solutions', contact_name: 'Sunita Reddy',
    email: 'sunita@fincorp.in', phone: '+91 98765 43213', industry: 'Finance',
    city: 'Hyderabad', state: 'Telangana', gst_number: '36AABCF1234G1Z3',
    credit_limit: 15000000, payment_behavior: 'excellent', sla_score: 98,
    contracts_count: 5, projects_count: 12, invoices_count: 45, status: 'active',
    avatar: 'FS', total_value: 85000000
  },
  {
    id: '5', company_name: 'RetailMart India', contact_name: 'Vikram Gupta',
    email: 'vikram@retailmart.com', phone: '+91 98765 43214', industry: 'Retail',
    city: 'Bangalore', state: 'Karnataka', gst_number: '29AABCR1234H1Z9',
    credit_limit: 12000000, payment_behavior: 'good', sla_score: 85,
    contracts_count: 2, projects_count: 4, invoices_count: 8, status: 'active',
    avatar: 'RI', total_value: 18500000
  },
  {
    id: '6', company_name: 'InfraBuild Construction', contact_name: 'Rajesh Kumar',
    email: 'rajesh@infrabuild.com', phone: '+91 98765 43215', industry: 'Construction',
    city: 'Chennai', state: 'Tamil Nadu', gst_number: '33AABCI1234J1Z4',
    credit_limit: 3000000, payment_behavior: 'poor', sla_score: 58,
    contracts_count: 1, projects_count: 2, invoices_count: 4, status: 'at-risk',
    avatar: 'IC', total_value: 3200000
  },
];

const contracts = [
  { id: 1, name: 'Master Service Agreement 2024', startDate: '2024-01-01', endDate: '2025-12-31', value: 2500000, status: 'Active' },
  { id: 2, name: 'Content Development Addendum', startDate: '2024-06-01', endDate: '2024-12-31', value: 800000, status: 'Active' },
  { id: 3, name: 'AI Training Platform License', startDate: '2024-03-01', endDate: '2025-02-28', value: 1200000, status: 'Pending Renewal' },
];

const projects = [
  { id: 1, name: 'E-Learning Platform Redesign', status: 'In Progress', progress: 75, budget: 500000, spent: 375000 },
  { id: 2, name: 'Mobile App Development', status: 'Planning', progress: 20, budget: 800000, spent: 160000 },
  { id: 3, name: 'AI Content Generation', status: 'Completed', progress: 100, budget: 300000, spent: 295000 },
];

const invoices = [
  { id: 'INV-2024-001', date: '2024-11-01', amount: 250000, status: 'Paid', dueDate: '2024-12-01' },
  { id: 'INV-2024-002', date: '2024-11-15', amount: 180000, status: 'Paid', dueDate: '2024-12-15' },
  { id: 'INV-2024-003', date: '2024-12-01', amount: 320000, status: 'Pending', dueDate: '2025-01-01' },
];

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

export function ClientsModule() {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'contracts' | 'projects' | 'invoices'>('overview');
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredClients = mockClients.filter(c => 
    c.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.contact_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalClients = mockClients.length;
  const activeClients = mockClients.filter(c => c.status === 'active').length;
  const atRiskClients = mockClients.filter(c => c.status === 'at-risk').length;
  const avgDealSize = mockClients.reduce((acc, c) => acc + c.total_value, 0) / mockClients.length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-[var(--success-light)] text-[var(--success)]';
      case 'at-risk': return 'bg-[var(--error-light)] text-[var(--error)]';
      case 'inactive': return 'bg-[var(--surface-hover)] text-[var(--text-muted)]';
      default: return 'bg-[var(--surface-hover)] text-[var(--text-muted)]';
    }
  };

  const getPaymentBehaviorColor = (behavior: string) => {
    switch (behavior) {
      case 'excellent': return 'bg-[var(--success-light)] text-[var(--success)]';
      case 'good': return 'bg-[var(--primary-light)] text-[var(--primary)]';
      case 'average': return 'bg-[var(--warning-light)] text-[var(--warning)]';
      case 'poor': return 'bg-[var(--error-light)] text-[var(--error)]';
      default: return 'bg-[var(--surface-hover)] text-[var(--text-muted)]';
    }
  };

  return (
    <div className="space-y-6">
      {!selectedClient ? (
        <>
          {/* Stats */}
          <div className="grid grid-cols-4 gap-4">
            <StatCard label="Total Clients" value={totalClients.toString()} trend="up" trendValue="+12%" icon={Building2} />
            <StatCard label="Active" value={activeClients.toString()} trend="up" trendValue="+8%" icon={CheckCircle} />
            <StatCard label="At Risk" value={atRiskClients.toString()} trend="down" trendValue="-2" icon={AlertTriangle} />
            <StatCard label="Avg Deal Size" value={`₹${(avgDealSize / 100000).toFixed(1)}L`} trend="up" trendValue="+15%" icon={TrendingUp} />
          </div>

          {/* Header Actions */}
          <div className="flex items-center justify-between">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
              <input
                type="text"
                placeholder="Search clients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--primary)] focus:outline-none"
              />
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="btn btn-primary px-4 py-2 text-sm"
            >
              <Plus className="w-4 h-4" />
              Add Client
            </button>
          </div>

          {/* Client Directory Grid */}
          <div className="grid grid-cols-3 gap-4">
            {filteredClients.map((client) => (
              <div
                key={client.id}
                onClick={() => setSelectedClient(client)}
                className="card p-5 cursor-pointer hover:border-[var(--border-hover)] transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                    {client.avatar}
                  </div>
                  <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${getStatusColor(client.status)}`}>
                    {client.status}
                  </span>
                </div>
                
                <h3 className="font-semibold text-[var(--text-primary)] mb-1">{client.company_name}</h3>
                <p className="text-sm text-[var(--text-secondary)] mb-4">{client.industry} • {client.city}</p>
                
                <div className="grid grid-cols-2 gap-4 mb-4 py-4 border-y border-[var(--border)]">
                  <div>
                    <p className="text-xs text-[var(--text-muted)] mb-1">Credit Limit</p>
                    <p className="text-sm font-medium text-[var(--text-primary)]">₹{(client.credit_limit / 100000).toFixed(1)}L</p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--text-muted)] mb-1">Projects</p>
                    <p className="text-sm font-medium text-[var(--text-primary)]">{client.projects_count}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--text-muted)] mb-1">SLA Score</p>
                    <p className={`text-sm font-medium ${client.sla_score >= 90 ? 'text-[var(--success)]' : client.sla_score >= 75 ? 'text-[var(--primary)]' : 'text-[var(--warning)]'}`}>
                      {client.sla_score}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--text-muted)] mb-1">Total Value</p>
                    <p className="text-sm font-medium text-[var(--text-primary)]">₹{(client.total_value / 10000000).toFixed(1)}Cr</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getPaymentBehaviorColor(client.payment_behavior)}`}>
                    {client.payment_behavior}
                  </span>
                  <span className="text-xs text-[var(--text-muted)]">{client.contracts_count} contracts</span>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="space-y-6">
          {/* Client Header */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSelectedClient(null)}
              className="flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Directory
            </button>
            <div className="flex items-center gap-2">
              <button className="btn btn-secondary p-2">
                <Edit2 className="w-4 h-4" />
              </button>
              <button className="btn btn-secondary p-2">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Client Info Card */}
          <div className="card p-6">
            <div className="flex items-start gap-5">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-3xl font-bold">
                {selectedClient.avatar}
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h2 className="text-xl font-bold text-[var(--text-primary)]">{selectedClient.company_name}</h2>
                    <p className="text-[var(--text-secondary)]">{selectedClient.contact_name} • {selectedClient.industry}</p>
                  </div>
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedClient.status)}`}>
                    {selectedClient.status}
                  </span>
                </div>
                <div className="flex items-center gap-6 text-sm text-[var(--text-secondary)] mt-4">
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-4 h-4" /> {selectedClient.email}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-4 h-4" /> {selectedClient.phone}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" /> {selectedClient.city}, {selectedClient.state}
                  </span>
                </div>
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-4 gap-6 mt-6 pt-6 border-t border-[var(--border)]">
              <div>
                <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-1">Credit Limit</p>
                <p className="text-lg font-semibold text-[var(--text-primary)]">₹{(selectedClient.credit_limit / 100000).toFixed(1)}L</p>
              </div>
              <div>
                <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-1">Payment</p>
                <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getPaymentBehaviorColor(selectedClient.payment_behavior)}`}>
                  {selectedClient.payment_behavior}
                </span>
              </div>
              <div>
                <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-1">SLA Score</p>
                <p className={`text-lg font-semibold ${selectedClient.sla_score >= 90 ? 'text-[var(--success)]' : 'text-[var(--warning)]'}`}>
                  {selectedClient.sla_score}%
                </p>
              </div>
              <div>
                <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-1">GSTIN</p>
                <p className="text-sm font-mono text-[var(--text-primary)]">{selectedClient.gst_number}</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 border-b border-[var(--border)]">
            {(['overview', 'contracts', 'projects', 'invoices'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab
                    ? 'border-[var(--primary)] text-[var(--primary)]'
                    : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="card p-5">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-4 gap-4">
                  <div className="p-4 bg-[var(--surface-hover)] rounded-lg">
                    <Briefcase className="w-5 h-5 text-[var(--primary)] mb-3" />
                    <p className="text-2xl font-bold text-[var(--text-primary)]">{selectedClient.projects_count}</p>
                    <p className="text-sm text-[var(--text-muted)]">Active Projects</p>
                  </div>
                  <div className="p-4 bg-[var(--surface-hover)] rounded-lg">
                    <FileText className="w-5 h-5 text-[var(--success)] mb-3" />
                    <p className="text-2xl font-bold text-[var(--text-primary)]">{selectedClient.contracts_count}</p>
                    <p className="text-sm text-[var(--text-muted)]">Contracts</p>
                  </div>
                  <div className="p-4 bg-[var(--surface-hover)] rounded-lg">
                    <Receipt className="w-5 h-5 text-[var(--warning)] mb-3" />
                    <p className="text-2xl font-bold text-[var(--text-primary)]">{selectedClient.invoices_count}</p>
                    <p className="text-sm text-[var(--text-muted)]">Invoices</p>
                  </div>
                  <div className="p-4 bg-[var(--surface-hover)] rounded-lg">
                    <TrendingUp className="w-5 h-5 text-[var(--info)] mb-3" />
                    <p className="text-2xl font-bold text-[var(--text-primary)]">₹{(selectedClient.total_value / 10000000).toFixed(1)}Cr</p>
                    <p className="text-sm text-[var(--text-muted)]">Total Value</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Registered GSTINs</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-[var(--surface-hover)] rounded-lg border border-[var(--border)]">
                      <div className="flex items-center gap-3">
                        <Shield className="w-5 h-5 text-[var(--success)]" />
                        <span className="font-mono text-sm text-[var(--text-primary)]">{selectedClient.gst_number}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-[var(--text-secondary)]">{selectedClient.state} • Regular</span>
                        <span className="px-2 py-0.5 text-xs font-medium bg-[var(--success-light)] text-[var(--success)] rounded">Active</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'contracts' && (
              <div className="space-y-3">
                {contracts.map((contract) => (
                  <div key={contract.id} className="flex items-center justify-between p-4 bg-[var(--surface-hover)] rounded-lg border border-[var(--border)] hover:border-[var(--border-hover)] transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-[var(--surface)] rounded-lg">
                        <FileText className="w-5 h-5 text-[var(--primary)]" />
                      </div>
                      <div>
                        <p className="font-medium text-[var(--text-primary)]">{contract.name}</p>
                        <p className="text-sm text-[var(--text-muted)]">
                          {contract.startDate} - {contract.endDate} • ₹{(contract.value / 100000).toFixed(1)}L
                        </p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                      contract.status === 'Active' ? 'bg-[var(--success-light)] text-[var(--success)]' :
                      contract.status === 'Pending Renewal' ? 'bg-[var(--warning-light)] text-[var(--warning)]' :
                      'bg-[var(--surface)] text-[var(--text-muted)]'
                    }`}>
                      {contract.status}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'projects' && (
              <div className="space-y-4">
                {projects.map((project) => (
                  <div key={project.id} className="p-4 bg-[var(--surface-hover)] rounded-lg border border-[var(--border)]">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-[var(--surface)] rounded-lg">
                          <Briefcase className="w-5 h-5 text-[var(--primary)]" />
                        </div>
                        <p className="font-medium text-[var(--text-primary)]">{project.name}</p>
                      </div>
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                        project.status === 'Completed' ? 'bg-[var(--success-light)] text-[var(--success)]' :
                        project.status === 'In Progress' ? 'bg-[var(--primary-light)] text-[var(--primary)]' :
                        'bg-[var(--warning-light)] text-[var(--warning)]'
                      }`}>
                        {project.status}
                      </span>
                    </div>
                    <div className="ml-12">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-[var(--text-muted)]">Progress</span>
                        <span className="text-sm font-medium text-[var(--text-primary)]">{project.progress}%</span>
                      </div>
                      <div className="h-2 bg-[var(--surface)] rounded-full overflow-hidden">
                        <div className="h-full bg-[var(--primary)] rounded-full" style={{ width: `${project.progress}%` }} />
                      </div>
                      <p className="mt-2 text-xs text-[var(--text-muted)]">
                        Budget: ₹{(project.budget / 100000).toFixed(1)}L • Spent: ₹{(project.spent / 100000).toFixed(1)}L
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'invoices' && (
              <div className="space-y-3">
                {invoices.map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between p-4 bg-[var(--surface-hover)] rounded-lg border border-[var(--border)] hover:border-[var(--border-hover)] transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-[var(--surface)] rounded-lg">
                        <Receipt className="w-5 h-5 text-[var(--warning)]" />
                      </div>
                      <div>
                        <p className="font-medium text-[var(--text-primary)]">{invoice.id}</p>
                        <p className="text-sm text-[var(--text-muted)]">
                          {invoice.date} • Due: {invoice.dueDate}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-medium text-[var(--text-primary)]">₹{invoice.amount.toLocaleString()}</span>
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                        invoice.status === 'Paid' ? 'bg-[var(--success-light)] text-[var(--success)]' :
                        invoice.status === 'Pending' ? 'bg-[var(--warning-light)] text-[var(--warning)]' :
                        'bg-[var(--error-light)] text-[var(--error)]'
                      }`}>
                        {invoice.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Client Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="card w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-[var(--border)]">
              <h2 className="text-lg font-bold text-[var(--text-primary)]">Add New Client</h2>
              <button onClick={() => setShowAddModal(false)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Company Name *</label>
                  <input type="text" className="w-full px-3 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-lg text-sm text-[var(--text-primary)] focus:border-[var(--primary)] focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Industry</label>
                  <select className="w-full px-3 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-lg text-sm text-[var(--text-primary)] focus:border-[var(--primary)] focus:outline-none">
                    <option>Select Industry</option>
                    <option>IT Services</option>
                    <option>Education</option>
                    <option>Healthcare</option>
                    <option>Finance</option>
                    <option>Retail</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Contact Name *</label>
                  <input type="text" className="w-full px-3 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-lg text-sm text-[var(--text-primary)] focus:border-[var(--primary)] focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Designation</label>
                  <input type="text" className="w-full px-3 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-lg text-sm text-[var(--text-primary)] focus:border-[var(--primary)] focus:outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Email *</label>
                  <input type="email" className="w-full px-3 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-lg text-sm text-[var(--text-primary)] focus:border-[var(--primary)] focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Phone</label>
                  <input type="tel" className="w-full px-3 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-lg text-sm text-[var(--text-primary)] focus:border-[var(--primary)] focus:outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">GST Number</label>
                  <input type="text" placeholder="27AABCT1234C1Z5" className="w-full px-3 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-lg text-sm text-[var(--text-primary)] focus:border-[var(--primary)] focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">PAN Number</label>
                  <input type="text" placeholder="AABCT1234C" className="w-full px-3 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-lg text-sm text-[var(--text-primary)] focus:border-[var(--primary)] focus:outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">City</label>
                  <input type="text" className="w-full px-3 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-lg text-sm text-[var(--text-primary)] focus:border-[var(--primary)] focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">State</label>
                  <input type="text" className="w-full px-3 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-lg text-sm text-[var(--text-primary)] focus:border-[var(--primary)] focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Credit Limit (₹)</label>
                  <input type="number" className="w-full px-3 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-lg text-sm text-[var(--text-primary)] focus:border-[var(--primary)] focus:outline-none" />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border)]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn btn-secondary px-4 py-2 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary px-4 py-2 text-sm"
                >
                  Create Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

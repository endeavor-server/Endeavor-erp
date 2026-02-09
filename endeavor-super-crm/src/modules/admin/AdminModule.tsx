import { useState } from 'react';
import { 
  Users, Shield, Key, FileText, History, CheckCircle, XCircle, AlertCircle,
  ChevronDown, Search, Plus, Edit2, Trash2, MoreVertical, Clock, Mail,
  Building2, CreditCard, Lock, Eye, EyeOff, CheckSquare, XSquare,
  Settings, Save, RefreshCw
} from 'lucide-react';

type AdminTab = 'roles' | 'gstin' | 'workflows' | 'audit';

// Roles & Permissions Data
const roles = [
  { 
    id: '1', 
    name: 'Super Admin', 
    description: 'Full system access', 
    users: 2,
    permissions: ['all'],
    color: 'bg-[var(--error-light)] text-[var(--error)]'
  },
  { 
    id: '2', 
    name: 'Finance Manager', 
    description: 'Manage invoices, GST, and payments', 
    users: 4,
    permissions: ['finance', 'reports', 'vendors'],
    color: 'bg-[var(--primary-light)] text-[var(--primary)]'
  },
  { 
    id: '3', 
    name: 'Project Manager', 
    description: 'Manage projects and freelancers', 
    users: 8,
    permissions: ['projects', 'freelancers', 'timesheets'],
    color: 'bg-[var(--success-light)] text-[var(--success)]'
  },
  { 
    id: '4', 
    name: 'Sales Executive', 
    description: 'Lead management and proposals', 
    users: 6,
    permissions: ['leads', 'contacts', 'proposals'],
    color: 'bg-[var(--warning-light)] text-[var(--warning)]'
  },
  { 
    id: '5', 
    name: 'HR Manager', 
    description: 'Employee and contractor management', 
    users: 3,
    permissions: ['employees', 'contractors', 'payroll'],
    color: 'bg-[var(--info-light)] text-[var(--info)]'
  },
];

// GSTIN Settings Data
const gstinSettings = [
  { 
    gstin: '27AABCE1234F1Z5', 
    legalName: 'Endeavor Academy Pvt Ltd',
    tradeName: 'Endeavor Academy',
    state: 'Maharashtra',
    registrationDate: '01/04/2020',
    filingFrequency: 'Monthly',
    status: 'Active',
    isPrimary: true
  },
  { 
    gstin: '07AABCE1234F1Z3', 
    legalName: 'Endeavor Academy Pvt Ltd',
    tradeName: 'Endeavor Academy - Delhi',
    state: 'Delhi',
    registrationDate: '15/08/2022',
    filingFrequency: 'Monthly',
    status: 'Active',
    isPrimary: false
  },
  { 
    gstin: '36AABCE1234F1Z9', 
    legalName: 'Endeavor Academy Pvt Ltd',
    tradeName: 'Endeavor Academy - Hyderabad',
    state: 'Telangana',
    registrationDate: '01/01/2023',
    filingFrequency: 'Quarterly',
    status: 'Suspended',
    isPrimary: false
  },
];

// Approval Workflows
const approvalWorkflows = [
  { 
    id: '1',
    name: 'Invoice Approval',
    description: 'Client invoices above ₹1L require approval',
    conditions: [{ field: 'amount', operator: 'greater_than', value: '100000' }],
    approvers: ['Finance Manager', 'Director'],
    currentStep: 'Finance Manager',
    isActive: true
  },
  { 
    id: '2',
    name: 'Freelancer Payout',
    description: 'Payouts above ₹50K require verification',
    conditions: [{ field: 'payout_amount', operator: 'greater_than', value: '50000' }],
    approvers: ['Project Manager', 'Finance Manager'],
    currentStep: 'Project Manager',
    isActive: true
  },
  { 
    id: '3',
    name: 'Vendor Payment',
    description: 'Payment above ₹2L requires dual approval',
    conditions: [{ field: 'amount', operator: 'greater_than', value: '200000' }],
    approvers: ['Finance Manager', 'Director', 'CFO'],
    currentStep: 'Finance Manager',
    isActive: true
  },
  { 
    id: '4',
    name: 'Discount Authorization',
    description: 'Discounts above 10% require approval',
    conditions: [{ field: 'discount_percent', operator: 'greater_than', value: '10' }],
    approvers: ['Sales Manager', 'Director'],
    currentStep: 'Sales Manager',
    isActive: false
  },
];

// Audit Logs
const auditLogs = [
  { id: '1', action: 'Invoice Created', module: 'Finance', user: 'Rahul Sharma', timestamp: '2024-12-15 10:30:45', ip: '192.168.1.45', status: 'success' },
  { id: '2', action: 'Payment Processed', module: 'Finance', user: 'Priya Patel', timestamp: '2024-12-15 10:25:12', ip: '192.168.1.46', status: 'success' },
  { id: '3', action: 'GST Return Filed', module: 'Compliance', user: 'Amit Kumar', timestamp: '2024-12-15 09:45:30', ip: '192.168.1.47', status: 'success' },
  { id: '4', action: 'Freelancer Onboarded', module: 'People', user: 'Sneha Reddy', timestamp: '2024-12-15 09:30:15', ip: '192.168.1.48', status: 'success' },
  { id: '5', action: 'Lead Deleted', module: 'Sales', user: 'Vikram Iyer', timestamp: '2024-12-15 09:15:22', ip: '192.168.1.49', status: 'error', details: 'Insufficient permissions' },
  { id: '6', action: 'Settings Updated', module: 'Admin', user: 'Nikhil Shah', timestamp: '2024-12-15 09:00:05', ip: '192.168.1.50', status: 'success' },
];

function getStatusColor(status: string) {
  switch (status.toLowerCase()) {
    case 'success': return 'bg-[var(--success-light)] text-[var(--success)]';
    case 'error': return 'bg-[var(--error-light)] text-[var(--error)]';
    case 'warning': return 'bg-[var(--warning-light)] text-[var(--warning)]';
    default: return 'bg-[var(--surface-hover)] text-[var(--text-muted)]';
  }
}

export function AdminModule() {
  const [activeTab, setActiveTab] = useState<AdminTab>('roles');
  const [showPassword, setShowPassword] = useState(false);

  const tabs = [
    { id: 'roles' as const, label: 'Roles & Permissions', icon: Users },
    { id: 'gstin' as const, label: 'GSTIN Settings', icon: Building2 },
    { id: 'workflows' as const, label: 'Approval Workflows', icon: CheckSquare },
    { id: 'audit' as const, label: 'Audit Logs', icon: History },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
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
          {activeTab === 'roles' && (
            <button className="btn btn-primary text-sm px-4 py-2">
              <Plus className="w-4 h-4" />
              Add Role
            </button>
          )}
          {activeTab === 'gstin' && (
            <button className="btn btn-primary text-sm px-4 py-2">
              <Plus className="w-4 h-4" />
              Add GSTIN
            </button>
          )}
          {activeTab === 'workflows' && (
            <button className="btn btn-primary text-sm px-4 py-2">
              <Plus className="w-4 h-4" />
              New Workflow
            </button>
          )}
        </div>
      </div>

      {/* Roles & Permissions Tab */}
      {activeTab === 'roles' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {roles.map((role) => (
              <div key={role.id} className="card p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 ${role.color} rounded-xl flex items-center justify-center`}>
                      <Shield className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[var(--text-primary)]">{role.name}</h3>
                      <p className="text-xs text-[var(--text-muted)]">{role.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button className="btn btn-ghost p-1.5">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button className="btn btn-ghost p-1.5 text-[var(--error)]">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between py-3 border-t border-[var(--border)]">
                  <span className="text-sm text-[var(--text-muted)]">{role.users} users</span>
                  <button className="text-xs text-[var(--primary)] hover:underline">
                    Manage Permissions
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 mt-3">
                  {role.permissions.slice(0, 4).map((perm, idx) => (
                    <span key={idx} className="px-2 py-0.5 text-xs bg-[var(--surface-hover)] text-[var(--text-secondary)] rounded">
                      {perm === 'all' ? 'All Permissions' : perm}
                    </span>
                  ))}
                  {role.permissions.length > 4 && (
                    <span className="px-2 py-0.5 text-xs bg-[var(--surface-hover)] text-[var(--text-muted)] rounded">
                      +{role.permissions.length - 4} more
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* GSTIN Settings Tab */}
      {activeTab === 'gstin' && (
        <div className="space-y-4">
          {gstinSettings.map((gstin, idx) => (
            <div key={idx} className="card p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 ${gstin.isPrimary ? 'bg-[var(--primary-light)]' : 'bg-[var(--surface-hover)]'} rounded-xl flex items-center justify-center`}>
                    <Building2 className={`w-7 h-7 ${gstin.isPrimary ? 'text-[var(--primary)]' : 'text-[var(--text-muted)]'}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-[var(--text-primary)]">{gstin.gstin}</h3>
                      {gstin.isPrimary && (
                        <span className="px-2 py-0.5 text-xs bg-[var(--primary-light)] text-[var(--primary)] rounded-full">
                          Primary
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-[var(--text-secondary)]">{gstin.legalName}</p>
                    <p className="text-xs text-[var(--text-muted)]">{gstin.tradeName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                    gstin.status === 'Active' ? 'bg-[var(--success-light)] text-[var(--success)]' : 'bg-[var(--error-light)] text-[var(--error)]'
                  }`}>
                    {gstin.status}
                  </span>
                  <button className="btn btn-ghost p-1.5">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4 py-4 border-t border-b border-[var(--border)]">
                <div>
                  <p className="text-xs text-[var(--text-muted)] uppercase mb-1">State</p>
                  <p className="text-sm font-medium text-[var(--text-primary)]">{gstin.state}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--text-muted)] uppercase mb-1">Registration</p>
                  <p className="text-sm font-medium text-[var(--text-primary)]">{gstin.registrationDate}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--text-muted)] uppercase mb-1">Filing</p>
                  <p className="text-sm font-medium text-[var(--text-primary)]">{gstin.filingFrequency}</p>
                </div>
                <div className="flex items-end">
                  <button className="btn btn-secondary text-xs px-3 py-1.5">
                    <Edit2 className="w-3.5 h-3.5" />
                    Edit
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Approval Workflows Tab */}
      {activeTab === 'workflows' && (
        <div className="space-y-4">
          {approvalWorkflows.map((workflow) => (
            <div key={workflow.id} className="card p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 ${workflow.isActive ? 'bg-[var(--success-light)]' : 'bg-[var(--surface-hover)]'} rounded-xl flex items-center justify-center`}>
                    <CheckSquare className={`w-6 h-6 ${workflow.isActive ? 'text-[var(--success)]' : 'text-[var(--text-muted)]'}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[var(--text-primary)]">{workflow.name}</h3>
                    <p className="text-sm text-[var(--text-secondary)]">{workflow.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                    workflow.isActive ? 'bg-[var(--success-light)] text-[var(--success)]' : 'bg-[var(--surface-hover)] text-[var(--text-muted)]'
                  }`}>
                    {workflow.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <button className="btn btn-ghost p-1.5">
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="bg-[var(--surface-hover)] rounded-lg p-4">
                <p className="text-xs text-[var(--text-muted)] uppercase mb-3">Approval Chain</p>
                <div className="flex items-center gap-2">
                  {workflow.approvers.map((approver, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className={`px-3 py-1.5 text-sm font-medium rounded-lg ${
                        approver === workflow.currentStep ? 'bg-[var(--primary)] text-white' : 'bg-[var(--surface)] text-[var(--text-secondary)]'
                      }`}>
                        {approver}
                      </span>
                      {idx < workflow.approvers.length - 1 && (
                        <ChevronDown className="w-4 h-4 text-[var(--text-muted)] rotate-[-90deg]" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-6 mt-4 text-sm">
                <span className="text-[var(--text-muted)]">
                  <span className="font-medium text-[var(--text-secondary)]">Condition:</span> {workflow.conditions[0].field} {workflow.conditions[0].operator.replace(/_/g, ' ')} ₹{Number(workflow.conditions[0].value).toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Audit Logs Tab */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
              <input
                type="text"
                placeholder="Search logs..."
                className="w-full pl-10 pr-4 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--primary)] focus:outline-none"
              />
            </div>
            <select className="px-3 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-sm text-[var(--text-primary)]">
              <option>All Modules</option>
              <option>Finance</option>
              <option>People</option>
              <option>Sales</option>
              <option>Admin</option>
            </select>
            <select className="px-3 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-sm text-[var(--text-primary)]">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
              <option>Last 3 Months</option>
            </select>
            <button className="btn btn-secondary text-sm px-4 py-2">
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>

          {/* Audit Table */}
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-[var(--surface-hover)] text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                <div className="col-span-3">Action</div>
                <div className="col-span-2">Module</div>
                <div className="col-span-2">User</div>
                <div className="col-span-2">Timestamp</div>
                <div className="col-span-1">Status</div>
                <div className="col-span-2">IP Address</div>
              </div>
              {auditLogs.map((log) => (
                <div key={log.id} className="grid grid-cols-12 gap-4 px-4 py-3 border-t border-[var(--border)] hover:bg-[var(--surface-hover)] transition-colors items-center">
                  <div className="col-span-3 text-sm text-[var(--text-primary)]">{log.action}</div>
                  <div className="col-span-2 text-sm text-[var(--text-secondary)]">{log.module}</div>
                  <div className="col-span-2 text-sm text-[var(--text-secondary)]">{log.user}</div>
                  <div className="col-span-2 text-sm text-[var(--text-muted)] flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {log.timestamp}
                  </div>
                  <div className="col-span-1">
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(log.status)}`}>
                      {log.status === 'success' ? 'Success' : 'Error'}
                    </span>
                  </div>
                  <div className="col-span-2 text-sm text-[var(--text-muted)] font-mono">{log.ip}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Export Options */}
          <div className="flex items-center justify-end gap-2">
            <button className="btn btn-secondary text-sm px-4 py-2">
              Export CSV
            </button>
            <button className="btn btn-primary text-sm px-4 py-2">
              Export All Logs
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

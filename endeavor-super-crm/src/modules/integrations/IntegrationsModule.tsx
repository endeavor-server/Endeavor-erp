import { useState } from 'react';
import { 
  MessageCircle, FileSpreadsheet, Calculator, Banknote, Webhook, RefreshCw,
  CheckCircle, XCircle, AlertCircle, Clock, Settings, ChevronRight, Shield,
  ExternalLink, Zap, Plus, MoreVertical
} from 'lucide-react';

interface Integration {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: any;
  status: 'connected' | 'disconnected' | 'error' | 'syncing';
  lastSync?: string;
  features: string[];
  connectedAt?: string;
}

const integrations: Integration[] = [
  {
    id: 'whatsapp',
    name: 'WhatsApp Business',
    category: 'Communication',
    description: 'Send invoices, reminders and receive payments via WhatsApp',
    icon: MessageCircle,
    status: 'connected',
    lastSync: '2 min ago',
    connectedAt: '2024-01-15',
    features: ['Invoice Sharing', 'Payment Reminders', 'Chat Support', 'Document Sharing']
  },
  {
    id: 'sheets',
    name: 'Google Sheets',
    category: 'Data',
    description: 'Sync reports and financial data with Google Sheets',
    icon: FileSpreadsheet,
    status: 'connected',
    lastSync: '1 hour ago',
    connectedAt: '2024-02-20',
    features: ['Auto Export', 'Scheduled Sync', 'Custom Templates']
  },
  {
    id: 'tally',
    name: 'Tally Prime',
    category: 'Accounting',
    description: 'Export vouchers, ledgers and GST data to Tally',
    icon: Calculator,
    status: 'syncing',
    lastSync: 'In progress',
    connectedAt: '2024-03-01',
    features: ['Voucher Export', 'Ledger Sync', 'GST JSON', 'Masters Import']
  },
  {
    id: 'banking',
    name: 'HDFC Bank',
    category: 'Banking',
    description: 'Connect with HDFC Bank for auto reconciliation',
    icon: Banknote,
    status: 'connected',
    lastSync: '30 min ago',
    connectedAt: '2024-01-08',
    features: ['Auto Reconciliation', 'Payment Status', 'Statement Import']
  },
  {
    id: 'icici',
    name: 'ICICI Bank',
    category: 'Banking',
    description: 'Connect with ICICI Bank for auto reconciliation',
    icon: Banknote,
    status: 'disconnected',
    features: ['Auto Reconciliation', 'Payment Status', 'Statement Import']
  },
  {
    id: 'sbi',
    name: 'SBI Corporate',
    category: 'Banking',
    description: 'Connect with SBI for bulk payment processing',
    icon: Banknote,
    status: 'error',
    lastSync: 'Failed 2h ago',
    features: ['Bulk Payments', 'Auto Reconciliation', 'Statement Import']
  },
];

const availableIntegrations = [
  { id: 'razorpay', name: 'Razorpay', category: 'Payments', description: 'Accept online payments and automate reconciliation' },
  { id: 'stripe', name: 'Stripe', category: 'Payments', description: 'International payment processing and subscriptions' },
  { id: 'sendgrid', name: 'SendGrid', category: 'Communication', description: 'Email delivery and marketing campaigns' },
  { id: 'slack', name: 'Slack', category: 'Communication', description: 'Team notifications and alerts' },
  { id: 'zoho', name: 'Zoho Books', category: 'Accounting', description: 'Alternative accounting integration' },
];

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'connected':
      return (
        <span className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-[var(--success-light)] text-[var(--success)] rounded-full">
          <CheckCircle className="w-3.5 h-3.5" />
          Connected
        </span>
      );
    case 'syncing':
      return (
        <span className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-[var(--info-light)] text-[var(--info)] rounded-full">
          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          Syncing
        </span>
      );
    case 'error':
      return (
        <span className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-[var(--error-light)] text-[var(--error)] rounded-full">
          <AlertCircle className="w-3.5 h-3.5" />
          Error
        </span>
      );
    default:
      return (
        <span className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-[var(--surface-hover)] text-[var(--text-muted)] rounded-full">
          <XCircle className="w-3.5 h-3.5" />
          Disconnected
        </span>
      );
  }
}

export function IntegrationsModule() {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  const categories = [
    { id: 'all', label: 'All Integrations' },
    { id: 'Communication', label: 'Communication' },
    { id: 'Data', label: 'Data & Reports' },
    { id: 'Accounting', label: 'Accounting' },
    { id: 'Banking', label: 'Banking' },
  ];

  const filteredIntegrations = activeCategory === 'all' 
    ? integrations 
    : integrations.filter(i => i.category === activeCategory);

  const connectedCount = integrations.filter(i => i.status === 'connected' || i.status === 'syncing').length;
  const disconnectedCount = integrations.filter(i => i.status === 'disconnected').length;
  const errorCount = integrations.filter(i => i.status === 'error').length;

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card p-5 surface-hover">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[var(--success-light)] rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-[var(--success)]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--text-primary)]">{connectedCount}</p>
              <p className="text-sm text-[var(--text-muted)]">Connected</p>
            </div>
          </div>
        </div>
        <div className="card p-5 surface-hover">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[var(--surface-hover)] rounded-xl flex items-center justify-center">
              <Zap className="w-6 h-6 text-[var(--text-muted)]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--text-primary)]">{disconnectedCount}</p>
              <p className="text-sm text-[var(--text-muted)]">Available</p>
            </div>
          </div>
        </div>
        <div className="card p-5 surface-hover">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[var(--error-light)] rounded-xl flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-[var(--error)]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--text-primary)]">{errorCount}</p>
              <p className="text-sm text-[var(--text-muted)]">Needs Attention</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 bg-[var(--surface)] rounded-lg p-1 border border-[var(--border)]">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeCategory === cat.id
                  ? 'bg-[var(--primary)] text-white'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <button 
          onClick={() => setShowAddModal(true)}
          className="btn btn-primary text-sm px-4 py-2"
        >
          <Plus className="w-4 h-4" />
          Add Integration
        </button>
      </div>

      {/* Connected Integrations Grid */}
      <div className="grid grid-cols-2 gap-4">
        {filteredIntegrations.map((integration) => {
          const Icon = integration.icon;
          return (
            <div key={integration.id} className="card p-5 hover:border-[var(--border-hover)] transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-[var(--surface-hover)] rounded-xl flex items-center justify-center">
                    <Icon className="w-7 h-7 text-[var(--primary)]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[var(--text-primary)]">{integration.name}</h3>
                    <p className="text-xs text-[var(--text-muted)]">{integration.category}</p>
                  </div>
                </div>
                <StatusBadge status={integration.status} />
              </div>

              <p className="text-sm text-[var(--text-secondary)] mb-4">{integration.description}</p>

              {/* Features */}
              <div className="flex flex-wrap gap-2 mb-4">
                {integration.features.map((feature, idx) => (
                  <span 
                    key={idx} 
                    className="px-2 py-1 text-xs bg-[var(--surface-hover)] text-[var(--text-secondary)] rounded-md"
                  >
                    {feature}
                  </span>
                ))}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-[var(--border)]">
                <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                  <Clock className="w-3.5 h-3.5" />
                  {integration.lastSync || 'Never synced'}
                </div>
                <div className="flex items-center gap-2">
                  {integration.status === 'error' && (
                    <button className="btn btn-primary text-xs px-3 py-1.5">
                      Retry
                    </button>
                  )}
                  <button className="btn btn-secondary p-1.5">
                    <Settings className="w-4 h-4" />
                  </button>
                  <button className="btn btn-secondary p-1.5">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* API & Webhooks Section */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[var(--info-light)] rounded-lg">
              <Webhook className="w-5 h-5 text-[var(--info)]" />
            </div>
            <div>
              <h3 className="font-semibold text-[var(--text-primary)]">API & Webhooks</h3>
              <p className="text-sm text-[var(--text-muted)]">Manage your API keys and webhook configurations</p>
            </div>
          </div>
          <button className="btn btn-secondary text-sm px-4 py-2">
            <Settings className="w-4 h-4" />
            Configure
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-[var(--surface-hover)] rounded-lg">
            <p className="text-sm text-[var(--text-muted)] mb-1">API Calls Today</p>
            <p className="text-xl font-bold text-[var(--text-primary)]">24,583</p>
          </div>
          <div className="p-4 bg-[var(--surface-hover)] rounded-lg">
            <p className="text-sm text-[var(--text-muted)] mb-1">Active Webhooks</p>
            <p className="text-xl font-bold text-[var(--text-primary)]">8</p>
          </div>
          <div className="p-4 bg-[var(--surface-hover)] rounded-lg">
            <p className="text-sm text-[var(--text-muted)] mb-1">Success Rate</p>
            <p className="text-xl font-bold text-[var(--success)]">99.8%</p>
          </div>
        </div>
      </div>

      {/* Add Integration Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="card w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-[var(--border)]">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-[var(--text-primary)]">Add Integration</h2>
                  <p className="text-sm text-[var(--text-muted)]">Connect with your favorite tools</p>
                </div>
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-4">
                Available Integrations
              </h3>
              <div className="space-y-3">
                {availableIntegrations.map((integration) => (
                  <div 
                    key={integration.id}
                    className="flex items-center justify-between p-4 bg-[var(--surface-hover)] rounded-lg border border-[var(--border)] hover:border-[var(--primary)] transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[var(--surface)] rounded-xl flex items-center justify-center">
                        <Zap className="w-6 h-6 text-[var(--primary)]" />
                      </div>
                      <div>
                        <p className="font-medium text-[var(--text-primary)]">{integration.name}</p>
                        <p className="text-sm text-[var(--text-muted)]">{integration.description}</p>
                      </div>
                    </div>
                    <button className="btn btn-primary text-xs px-4 py-2">
                      Connect
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

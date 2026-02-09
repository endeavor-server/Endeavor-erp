import { useState } from 'react';
import { 
  TrendingUp, Users, Search, Plus, Phone, Mail, Calendar, MoreVertical, 
  Filter, Star, ArrowRight, Target, DollarSign, Bot, CheckCircle, X,
  Clock, MapPin, Building2, Tag, Sparkles, ThumbsUp, ThumbsDown, Edit2
} from 'lucide-react';

interface Lead {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  source: string;
  value: number;
  stage: 'new' | 'contacted' | 'qualified' | 'proposal' | 'closed_won' | 'closed_lost';
  lastActivity: string;
  aiScore: number;
  tags: string[];
}

const leads: Lead[] = [
  { id: '1', name: 'Rajesh Kapoor', company: 'Global Tech Solutions', email: 'rajesh@gts.com', phone: '+91 98765 43210', source: 'Website', value: 2500000, stage: 'qualified', lastActivity: '2h ago', aiScore: 85, tags: ['enterprise', 'hot'] },
  { id: '2', name: 'Priya Malhotra', company: 'EduTech Innovations', email: 'priya@edutech.in', phone: '+91 98765 43211', source: 'Referral', value: 1200000, stage: 'proposal', lastActivity: '4h ago', aiScore: 92, tags: ['edtech', 'decision-maker'] },
  { id: '3', name: 'Arun Nair', company: 'HealthCare Plus', email: 'arun@hcp.in', phone: '+91 98765 43212', source: 'LinkedIn', value: 3500000, stage: 'contacted', lastActivity: '1d ago', aiScore: 72, tags: ['healthcare', 'nurture'] },
  { id: '4', name: 'Sunita Gupta', company: 'FinCorp India', email: 'sunita@fincorp.in', phone: '+91 98765 43213', source: 'Cold Call', value: 5000000, stage: 'new', lastActivity: 'Just now', aiScore: 68, tags: ['finance', 'research'] },
  { id: '5', name: 'Vikram Shah', company: 'RetailMart', email: 'vikram@retailmart.com', phone: '+91 98765 43214', source: 'Event', value: 1800000, stage: 'closed_won', lastActivity: '2d ago', aiScore: 95, tags: ['retail', 'closed'] },
  { id: '6', name: 'Meera Patel', company: 'InfraBuild Co', email: 'meera@infrabuild.com', phone: '+91 98765 43215', source: 'Email', value: 4200000, stage: 'qualified', lastActivity: '6h ago', aiScore: 78, tags: ['infrastructure', 'mid-funnel'] },
];

const contacts = [
  { id: '1', name: 'Anil Sharma', company: 'Tech Solutions Inc', title: 'CTO', email: 'anil@techsol.com', phone: '+91 98765 43220', city: 'Mumbai', type: 'customer', lastContact: '3 days ago' },
  { id: '2', name: 'Deepa Krishnan', company: 'Global Consulting', title: 'VP Engineering', email: 'deepa@global.com', phone: '+91 98765 43221', city: 'Bangalore', type: 'prospect', lastContact: '1 week ago' },
  { id: '3', name: 'Karan Mehta', company: 'Innovation Labs', title: 'Product Head', email: 'karan@innovation.in', phone: '+91 98765 43222', city: 'Delhi', type: 'partner', lastContact: '2 days ago' },
];

const aiSuggestions = [
  { id: 1, type: 'email', leadId: '1', leadName: 'Rajesh Kapoor', suggestion: 'Send case study on similar enterprise project', confidence: 92, reason: 'High engagement with enterprise content' },
  { id: 2, type: 'followup', leadId: '2', leadName: 'Priya Malhotra', suggestion: 'Schedule demo call this week', confidence: 88, reason: 'Proposal reviewed 3 times in 24h' },
  { id: 3, type: 'pricing', leadId: '6', leadName: 'Meera Patel', suggestion: 'Offer 10% early-bird discount', confidence: 76, reason: 'Budget discussion in previous call' },
];

const pipelineStages = [
  { id: 'new', label: 'New', color: 'bg-[var(--surface-hover)]', count: 12, value: 8500000 },
  { id: 'contacted', label: 'Contacted', color: 'bg-[var(--primary-light)]', count: 8, value: 6200000 },
  { id: 'qualified', label: 'Qualified', color: 'bg-[var(--info-light)]', count: 15, value: 12800000 },
  { id: 'proposal', label: 'Proposal', color: 'bg-[var(--warning-light)]', count: 6, value: 8500000 },
  { id: 'closed_won', label: 'Closed Won', color: 'bg-[var(--success-light)]', count: 4, value: 6800000 },
  { id: 'closed_lost', label: 'Closed Lost', color: 'bg-[var(--error-light)]', count: 3, value: 4200000 },
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

export function SalesModule() {
  const [activeView, setActiveView] = useState<'pipeline' | 'contacts' | 'deals'>('pipeline');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAiModal, setShowAiModal] = useState(false);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Pipeline Value" value="₹46.8Cr" trend="up" trendValue="+18%" icon={TrendingUp} />
        <StatCard label="Active Leads" value="54" trend="up" trendValue="+12" icon={Users} />
        <StatCard label="Win Rate" value="42%" trend="up" trendValue="+5%" icon={Target} />
        <StatCard label="Avg Deal Size" value="₹42.5L" trend="down" trendValue="-3%" icon={DollarSign} />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 bg-[var(--surface)] rounded-lg p-1 border border-[var(--border)]">
          <button
            onClick={() => setActiveView('pipeline')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeView === 'pipeline'
                ? 'bg-[var(--primary)] text-white'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            Pipeline
          </button>
          <button
            onClick={() => setActiveView('contacts')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeView === 'contacts'
                ? 'bg-[var(--primary)] text-white'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]'
            }`}
          >
            <Users className="w-4 h-4" />
            Contacts
          </button>
          <button
            onClick={() => setActiveView('deals')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeView === 'deals'
                ? 'bg-[var(--primary)] text-white'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            Deals
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowAiModal(true)}
            className="btn btn-secondary text-sm px-4 py-2 text-[var(--info)]"
          >
            <Sparkles className="w-4 h-4" />
            AI Suggestions (3)
          </button>
          <button className="btn btn-primary text-sm px-4 py-2">
            <Plus className="w-4 h-4" />
            Add Lead
          </button>
        </div>
      </div>

      {/* Pipeline View */}
      {activeView === 'pipeline' && (
        <div className="space-y-4">
          {/* Pipeline Summary */}
          <div className="grid grid-cols-6 gap-3">
            {pipelineStages.map((stage) => (
              <div key={stage.id} className={`${stage.color} p-4 rounded-lg border border-[var(--border)]`}>
                <p className="text-xs text-[var(--text-muted)] uppercase mb-1">{stage.label}</p>
                <p className="text-2xl font-bold text-[var(--text-primary)]">{stage.count}</p>
                <p className="text-sm text-[var(--text-secondary)]">₹{(stage.value / 100000).toFixed(1)}L</p>
              </div>
            ))}
          </div>

          {/* Kanban Board */}
          <div className="grid grid-cols-6 gap-4">
            {pipelineStages.map((stage) => (
              <div key={stage.id} className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <span className="text-sm font-medium text-[var(--text-primary)]">{stage.label}</span>
                  <span className="text-xs bg-[var(--surface)] px-2 py-0.5 rounded text-[var(--text-secondary)]">
                    {leads.filter(l => l.stage === stage.id).length}
                  </span>
                </div>
                <div className="space-y-2">
                  {leads.filter(l => l.stage === stage.id).map((lead) => (
                    <div key={lead.id} className="card p-3 cursor-pointer hover:border-[var(--border-hover)] transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <span className={`px-1.5 py-0.5 text-[10px] font-medium rounded ${
                          lead.aiScore >= 90 ? 'bg-[var(--success-light)] text-[var(--success)]' :
                          lead.aiScore >= 70 ? 'bg-[var(--info-light)] text-[var(--info)]' :
                          'bg-[var(--surface-hover)] text-[var(--text-muted)]'
                        }`}>
                          AI {lead.aiScore}%
                        </span>
                        <button className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                      <h4 className="font-medium text-[var(--text-primary)] text-sm mb-1">{lead.name}</h4>
                      <p className="text-xs text-[var(--text-secondary)] mb-3">{lead.company}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-[var(--primary)]">₹{(lead.value / 100000).toFixed(1)}L</span>
                        <span className="text-xs text-[var(--text-muted)]">{lead.lastActivity}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="w-full py-2 border border-dashed border-[var(--border)] rounded-lg text-[var(--text-muted)] hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors text-sm">
                  + Add Lead
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Contacts View */}
      {activeView === 'contacts' && (
        <div className="card overflow-hidden">
          <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-[var(--surface-hover)] text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
            <div className="col-span-3">Contact</div>
            <div className="col-span-2">Company</div>
            <div className="col-span-2">Location</div>
            <div className="col-span-2">Type</div>
            <div className="col-span-2">Last Contact</div>
            <div className="col-span-1"></div>
          </div>
          {contacts.map((contact) => (
            <div key={contact.id} className="grid grid-cols-12 gap-4 px-4 py-4 border-t border-[var(--border)] hover:bg-[var(--surface-hover)] transition-colors items-center">
              <div className="col-span-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[var(--primary-light)] rounded-lg flex items-center justify-center font-semibold text-sm text-[var(--primary)]">
                    {contact.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="font-medium text-[var(--text-primary)] text-sm">{contact.name}</p>
                    <p className="text-xs text-[var(--text-muted)]">{contact.title}</p>
                  </div>
                </div>
              </div>
              <div className="col-span-2 text-sm text-[var(--text-secondary)]">{contact.company}</div>
              <div className="col-span-2 text-sm text-[var(--text-secondary)] flex items-center gap-1">
                <MapPin className="w-3 h-3" /> {contact.city}
              </div>
              <div className="col-span-2">
                <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                  contact.type === 'customer' ? 'bg-[var(--success-light)] text-[var(--success)]' :
                  contact.type === 'partner' ? 'bg-[var(--info-light)] text-[var(--info)]' :
                  'bg-[var(--warning-light)] text-[var(--warning)]'
                }`}>
                  {contact.type}
                </span>
              </div>
              <div className="col-span-2 text-sm text-[var(--text-muted)]">{contact.lastContact}</div>
              <div className="col-span-1 flex justify-end gap-1">
                <button className="btn btn-ghost p-1.5">
                  <Phone className="w-4 h-4" />
                </button>
                <button className="btn btn-ghost p-1.5">
                  <Mail className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Deals View */}
      {activeView === 'deals' && (
        <div className="grid grid-cols-2 gap-4">
          {leads.slice(0, 4).map((lead) => (
            <div key={lead.id} className="card p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold">
                    {lead.company.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-[var(--text-primary)]">{lead.company}</h3>
                    <p className="text-sm text-[var(--text-secondary)]">{lead.name}</p>
                  </div>
                </div>
                <span className="text-xl font-bold text-[var(--primary)]">₹{(lead.value / 100000).toFixed(1)}L</span>
              </div>
              
              <div className="flex items-center gap-2 mb-4">
                {lead.tags.map((tag, i) => (
                  <span key={i} className="px-2 py-0.5 text-xs bg-[var(--surface-hover)] text-[var(--text-secondary)] rounded">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-[var(--border)]">
                <div className="flex items-center gap-4 text-sm text-[var(--text-muted)]">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" /> {lead.lastActivity}
                  </span>
                  <span>Source: {lead.source}</span>
                </div>
                <button className="btn btn-primary text-xs px-3 py-1.5">
                  View Deal
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* AI Suggestions Modal */}
      {showAiModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="card w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-[var(--border)]">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[var(--info-light)] rounded-lg">
                  <Sparkles className="w-5 h-5 text-[var(--info)]" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[var(--text-primary)]">AI Suggestions</h2>
                  <p className="text-sm text-[var(--text-muted)]">3 recommendations based on lead behavior</p>
                </div>
              </div>
              <button onClick={() => setShowAiModal(false)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              {aiSuggestions.map((suggestion) => (
                <div key={suggestion.id} className="p-4 bg-[var(--surface-hover)] rounded-lg border border-[var(--border)]">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        suggestion.confidence >= 90 ? 'bg-[var(--success-light)]' : 
                        suggestion.confidence >= 80 ? 'bg-[var(--info-light)]' : 'bg-[var(--warning-light)]'
                      }`}>
                        <Bot className={`w-5 h-5 ${
                          suggestion.confidence >= 90 ? 'text-[var(--success)]' : 
                          suggestion.confidence >= 80 ? 'text-[var(--info)]' : 'text-[var(--warning)]'
                        }`} />
                      </div>
                      <div>
                        <p className="font-medium text-[var(--text-primary)]">{suggestion.leadName}</p>
                        <p className="text-xs text-[var(--text-muted)]">{suggestion.type.charAt(0).toUpperCase() + suggestion.type.slice(1)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-[var(--primary)]">{suggestion.confidence}%</p>
                      <p className="text-xs text-[var(--text-muted)]">confidence</p>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-sm text-[var(--text-primary)] mb-1">
                      <span className="font-medium">Suggestion:</span> {suggestion.suggestion}
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">{suggestion.reason}</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button className="btn btn-primary text-xs px-4 py-1.5 flex-1">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Apply
                    </button>
                    <button className="btn btn-secondary text-xs px-3 py-1.5">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button className="btn btn-ghost text-xs px-3 py-1.5 text-[var(--error)]">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

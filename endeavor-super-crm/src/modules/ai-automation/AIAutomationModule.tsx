import { useState } from 'react';
import { 
  Bot, TrendingUp, Clock, DollarSign, BarChart3, Code, MessageSquare, 
  FileText, Search, Filter, Download, Zap, Cpu, Brain, AlertTriangle,
  CheckCircle, X, ChevronRight, Clock8, Target, Users, Sparkles
} from 'lucide-react';

type AITab = 'usage' | 'effort' | 'logs' | 'rules';

// AI Usage by Project
const projectUsage = [
  { name: 'AI Learning Engine', token: 4500000, cost: 12500, humanHours: 1240, aiHours: 680, efficiency: 94 },
  { name: 'Mobile App v2', token: 1200000, cost: 3400, humanHours: 980, aiHours: 220, efficiency: 78 },
  { name: 'Leadership Platform', token: 2800000, cost: 7800, humanHours: 850, aiHours: 520, efficiency: 88 },
  { name: 'Security Audit', token: 450000, cost: 1250, humanHours: 420, aiHours: 80, efficiency: 65 },
];

// Prompt Logs
const promptLogs = [
  { id: 1, project: 'AI Learning Engine', type: 'Code Generation', prompt: 'Generate React component for...', tokens: 1250, cost: 0.025, user: 'Alex Chen', time: '2m ago', status: 'success' },
  { id: 2, project: 'Mobile App v2', type: 'Documentation', prompt: 'Write API documentation for...', tokens: 890, cost: 0.018, user: 'Sarah Miller', time: '15m ago', status: 'success' },
  { id: 3, project: 'Leadership Platform', type: 'Content', prompt: 'Create leadership training module...', tokens: 2100, cost: 0.042, user: 'James Wilson', time: '32m ago', status: 'success' },
  { id: 4, project: 'AI Learning Engine', type: 'Testing', prompt: 'Generate unit tests for...', tokens: 560, cost: 0.011, user: 'Bot-AI', time: '45m ago', status: 'cached' },
  { id: 5, project: 'Security Audit', type: 'Analysis', prompt: 'Analyze security vulnerabilities...', tokens: 3400, cost: 0.068, user: 'Priya Shah', time: '1h ago', status: 'error' },
  { id: 6, project: 'Mobile App v2', type: 'Code Review', prompt: 'Review this component for...', tokens: 780, cost: 0.016, user: 'Raj Kumar', time: '1.5h ago', status: 'success' },
];

// Client AI Rules
const clientRules = [
  { client: 'Tech Solutions', codeGen: true, docGen: true, testGen: true, maxTokens: 500000, costCap: 50000, allowedModels: ['gpt-4', 'claude-3'] },
  { client: 'EduLearn Academy', codeGen: true, docGen: true, testGen: false, maxTokens: 250000, costCap: 25000, allowedModels: ['gpt-4'] },
  { client: 'HealthPlus Medical', codeGen: false, docGen: true, testGen: false, maxTokens: 100000, costCap: 10000, allowedModels: ['claude-3'] },
  { client: 'FinCorp Solutions', codeGen: true, docGen: true, testGen: true, maxTokens: 1000000, costCap: 100000, allowedModels: ['gpt-4', 'claude-3', 'gemini'] },
];

// Human vs AI Metrics
const effortMetrics = {
  totalProjects: 24,
  humanHours: 12680,
  aiHours: 5240,
  costSavings: 1250000,
  timeReduction: 35,
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

export function AIAutomationModule() {
  const [activeTab, setActiveTab] = useState<AITab>('usage');

  const tabs = [
    { id: 'usage' as const, label: 'Usage by Project', icon: BarChart3 },
    { id: 'effort' as const, label: 'Human vs AI Effort', icon: Users },
    { id: 'logs' as const, label: 'Prompt Logs', icon: Clock8 },
    { id: 'rules' as const, label: 'Client AI Rules', icon: Target },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-[var(--success-light)] text-[var(--success)]';
      case 'cached': return 'bg-[var(--info-light)] text-[var(--info)]';
      case 'error': return 'bg-[var(--error-light)] text-[var(--error)]';
      default: return 'bg-[var(--surface-hover)] text-[var(--text-muted)]';
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Total Tokens" value="89.5M" trend="up" trendValue="+24%" icon={Zap} />
        <StatCard label="AI Savings" value="₹12.5L" trend="up" trendValue="+32%" icon={DollarSign} />
        <StatCard label="Time Reduction" value="35%" trend="up" trendValue="+8%" icon={Clock} />
        <StatCard label="Efficiency" value="94%" trend="up" trendValue="+5%" icon={TrendingUp} />
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
            Export Report
          </button>
        </div>
      </div>

      {/* Usage by Project Tab */}
      {activeTab === 'usage' && (
        <div className="space-y-6">
          {/* Monthly Trend */}
          <div className="card p-5">
            <h3 className="font-semibold text-[var(--text-primary)] mb-6">AI Usage Trends</h3>
            <div className="space-y-4">
              {projectUsage.map((project, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-[var(--text-primary)]">{project.name}</span>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-[var(--text-muted)]">{(project.token / 1000000).toFixed(1)}M tokens</span>
                      <span className="text-[var(--text-primary)]">₹{project.cost.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="h-2 bg-[var(--surface-hover)] rounded-full overflow-hidden flex">
                    <div className="h-full bg-[var(--primary)]" style={{ width: `${(project.humanHours / (project.humanHours + project.aiHours)) * 100}%` }} />
                    <div className="h-full bg-[var(--info)]" style={{ width: `${(project.aiHours / (project.humanHours + project.aiHours)) * 100}%` }} />
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[var(--text-muted)]">Human: {project.humanHours}h</span>
                    <span className="text-[var(--text-muted)]">AI: {project.aiHours}h</span>
                    <span className="text-[var(--success)]">Efficiency: {project.efficiency}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Project Cards */}
          <div className="grid grid-cols-2 gap-4">
            {projectUsage.map((project, idx) => (
              <div key={idx} className="card p-5">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-[var(--text-primary)]">{project.name}</h4>
                  <span className="px-2 py-0.5 text-xs font-medium bg-[var(--success-light)] text-[var(--success)] rounded">
                    {project.efficiency}% Efficient
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center p-3 bg-[var(--surface-hover)] rounded-lg">
                    <p className="text-lg font-bold text-[var(--text-primary)]">{(project.token / 1000000).toFixed(1)}M</p>
                    <p className="text-xs text-[var(--text-muted)]">Tokens</p>
                  </div>
                  <div className="text-center p-3 bg-[var(--surface-hover)] rounded-lg">
                    <p className="text-lg font-bold text-[var(--primary)]">₹{project.cost.toLocaleString()}</p>
                    <p className="text-xs text-[var(--text-muted)]">Cost</p>
                  </div>
                  <div className="text-center p-3 bg-[var(--surface-hover)] rounded-lg">
                    <p className="text-lg font-bold text-[var(--info)]">{project.aiHours}h</p>
                    <p className="text-xs text-[var(--text-muted)]">AI Hours</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs text-[var(--text-muted)]">
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" /> {project.humanHours}h human
                  </span>
                  <span className="flex items-center gap-1">
                    <Bot className="w-3.5 h-3.5" /> {project.aiHours}h AI
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Human vs AI Effort Tab */}
      {activeTab === 'effort' && (
        <div className="space-y-6">
          {/* Overview Cards */}
          <div className="grid grid-cols-4 gap-4">
            <div className="card p-5 text-center">
              <div className="w-12 h-12 mx-auto mb-3 bg-[var(--primary-light)] rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-[var(--primary)]" />
              </div>
              <p className="text-3xl font-bold text-[var(--text-primary)]">{effortMetrics.humanHours.toLocaleString()}</p>
              <p className="text-sm text-[var(--text-muted)]">Human Hours</p>
            </div>
            <div className="card p-5 text-center">
              <div className="w-12 h-12 mx-auto mb-3 bg-[var(--info-light)] rounded-full flex items-center justify-center">
                <Bot className="w-6 h-6 text-[var(--info)]" />
              </div>
              <p className="text-3xl font-bold text-[var(--text-primary)]">{effortMetrics.aiHours.toLocaleString()}</p>
              <p className="text-sm text-[var(--text-muted)]">AI Hours</p>
            </div>
            <div className="card p-5 text-center">
              <div className="w-12 h-12 mx-auto mb-3 bg-[var(--success-light)] rounded-full flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-[var(--success)]" />
              </div>
              <p className="text-3xl font-bold text-[var(--success)]">₹{(effortMetrics.costSavings / 100000).toFixed(1)}L</p>
              <p className="text-sm text-[var(--text-muted)]">Cost Savings</p>
            </div>
            <div className="card p-5 text-center">
              <div className="w-12 h-12 mx-auto mb-3 bg-[var(--warning-light)] rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-[var(--warning)]" />
              </div>
              <p className="text-3xl font-bold text-[var(--warning)]">{effortMetrics.timeReduction}%</p>
              <p className="text-sm text-[var(--text-muted)]">Time Reduction</p>
            </div>
          </div>

          {/* Ratio Display */}
          <div className="card p-6">
            <h3 className="font-semibold text-[var(--text-primary)] mb-6">Human vs AI Ratio</h3>
            <div className="flex items-center gap-6 mb-6">
              <div className="flex-1">
                <div className="h-8 rounded-lg overflow-hidden flex">
                  <div 
                    className="h-full bg-[var(--primary)] flex items-center justify-center text-white text-sm font-medium"
                    style={{ width: `${(effortMetrics.humanHours / (effortMetrics.humanHours + effortMetrics.aiHours)) * 100}%` }}
                  >
                    {((effortMetrics.humanHours / (effortMetrics.humanHours + effortMetrics.aiHours)) * 100).toFixed(0)}%
                  </div>
                  <div 
                    className="h-full bg-[var(--info)] flex items-center justify-center text-white text-sm font-medium"
                    style={{ width: `${(effortMetrics.aiHours / (effortMetrics.humanHours + effortMetrics.aiHours)) * 100}%` }}
                  >
                    {((effortMetrics.aiHours / (effortMetrics.humanHours + effortMetrics.aiHours)) * 100).toFixed(0)}%
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center gap-8">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[var(--primary)]" />
                <span className="text-sm text-[var(--text-secondary)]">Human Effort (71%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[var(--info)]" />
                <span className="text-sm text-[var(--text-secondary)]">AI Effort (29%)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Prompt Logs Tab */}
      {activeTab === 'logs' && (
        <div className="card overflow-hidden">
          <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
            <h3 className="font-semibold text-[var(--text-primary)]">Recent Prompt Activity</h3>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                <input
                  type="text"
                  placeholder="Search logs..."
                  className="pl-10 pr-4 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-lg text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--primary)] focus:outline-none"
                />
              </div>
              <button className="btn btn-secondary p-2">
                <Filter className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-[var(--surface-hover)] text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
              <div className="col-span-2">Time</div>
              <div className="col-span-2">Project</div>
              <div className="col-span-3">Type</div>
              <div className="col-span-1 text-right">Tokens</div>
              <div className="col-span-1 text-right">Cost</div>
              <div className="col-span-1 text-center">Status</div>
              <div className="col-span-2">User</div>
            </div>
            {promptLogs.map((log) => (
              <div key={log.id} className="grid grid-cols-12 gap-4 px-4 py-3 border-t border-[var(--border)] hover:bg-[var(--surface-hover)] transition-colors items-center">
                <div className="col-span-2 text-sm text-[var(--text-muted)] flex items-center gap-1">
                  <Clock8 className="w-3.5 h-3.5" /> {log.time}
                </div>
                <div className="col-span-2 text-sm text-[var(--text-primary)]">{log.project}</div>
                <div className="col-span-3 text-sm text-[var(--text-secondary)] truncate" title={log.prompt}>
                  {log.type}
                </div>
                <div className="col-span-1 text-right text-sm text-[var(--text-muted)]">{log.tokens.toLocaleString()}</div>
                <div className="col-span-1 text-right text-sm text-[var(--primary)]">${log.cost.toFixed(3)}</div>
                <div className="col-span-1 text-center">
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(log.status)}`}>
                    {log.status}
                  </span>
                </div>
                <div className="col-span-2 text-sm text-[var(--text-secondary)]">{log.user}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Client AI Rules Tab */}
      {activeTab === 'rules' && (
        <div className="space-y-4">
          {clientRules.map((rule, idx) => (
            <div key={idx} className="card p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white font-bold">
                    {rule.client.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-semibold text-[var(--text-primary)]">{rule.client}</h4>
                    <p className="text-sm text-[var(--text-muted)]">AI Rules Configuration</p>
                  </div>
                </div>
                <button className="btn btn-secondary text-xs px-3 py-1.5">
                  Edit Rules
                </button>
              </div>
              
              <div className="grid grid-cols-4 gap-4 mb-4">
                <div className="p-3 bg-[var(--surface-hover)] rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Code className="w-4 h-4 text-[var(--primary)]" />
                    <span className="text-sm font-medium text-[var(--text-primary)]">Code</span>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded ${rule.codeGen ? 'bg-[var(--success-light)] text-[var(--success)]' : 'bg-[var(--surface)] text-[var(--text-muted)]'}`}>
                    {rule.codeGen ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <div className="p-3 bg-[var(--surface-hover)] rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4 text-[var(--info)]" />
                    <span className="text-sm font-medium text-[var(--text-primary)]">Docs</span>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded ${rule.docGen ? 'bg-[var(--success-light)] text-[var(--success)]' : 'bg-[var(--surface)] text-[var(--text-muted)]'}`}>
                    {rule.docGen ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <div className="p-3 bg-[var(--surface-hover)] rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-4 h-4 text-[var(--warning)]" />
                    <span className="text-sm font-medium text-[var(--text-primary)]">Tests</span>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded ${rule.testGen ? 'bg-[var(--success-light)] text-[var(--success)]' : 'bg-[var(--surface)] text-[var(--text-muted)]'}`}>
                    {rule.testGen ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <div className="p-3 bg-[var(--surface-hover)] rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-[var(--success)]" />
                    <span className="text-sm font-medium text-[var(--text-primary)]">Models</span>
                  </div>
                  <span className="text-xs text-[var(--text-muted)]">
                    {rule.allowedModels.join(', ')}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-6 text-xs text-[var(--text-muted)] pt-4 border-t border-[var(--border)]">
                <span>Max Tokens: {(rule.maxTokens / 1000).toFixed(0)}K</span>
                <span>Cost Cap: ₹{rule.costCap.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

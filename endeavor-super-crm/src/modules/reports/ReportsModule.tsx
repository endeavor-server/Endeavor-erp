import { useState } from 'react';
import { 
  FileText, Download, Calendar, Filter, BarChart3, TrendingUp, Clock, 
  FileSpreadsheet, FileJson, File as FilePdf, MoreVertical, ChevronRight,
  CheckCircle, AlertCircle, RefreshCw, Send, Mail, Users, Building2, 
  DollarSign, Briefcase
} from 'lucide-react';

interface Report {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: any;
  lastGenerated?: string;
  schedule?: 'daily' | 'weekly' | 'monthly' | 'custom';
  nextRun?: string;
  formats: string[];
  isFavorite: boolean;
}

const reports: Report[] = [
  {
    id: '1',
    name: 'Client Profitability Analysis',
    category: 'Financial',
    description: 'Revenue, costs and margins by client with trend analysis',
    icon: TrendingUp,
    lastGenerated: '2024-12-15 10:30 AM',
    schedule: 'monthly',
    nextRun: '2025-01-15',
    formats: ['PDF', 'Excel', 'Tally'],
    isFavorite: true
  },
  {
    id: '2',
    name: 'Revenue Per Employee',
    category: 'HR & People',
    description: 'Productivity metrics and revenue contribution by team member',
    icon: Users,
    lastGenerated: '2024-12-14 09:00 AM',
    schedule: 'monthly',
    nextRun: '2025-01-14',
    formats: ['PDF', 'Excel'],
    isFavorite: true
  },
  {
    id: '3',
    name: 'Freelancer Performance Dashboard',
    category: 'Workforce',
    description: 'Quality scores, on-time delivery and utilization rates',
    icon: Briefcase,
    lastGenerated: '2024-12-13 06:00 PM',
    schedule: 'weekly',
    nextRun: '2024-12-20',
    formats: ['PDF', 'Excel'],
    isFavorite: false
  },
  {
    id: '4',
    name: 'GST Summary Report',
    category: 'Compliance',
    description: 'Complete GST input/output summary with reconciliation',
    icon: FileText,
    lastGenerated: '2024-12-10 11:45 AM',
    schedule: 'monthly',
    nextRun: '2025-01-10',
    formats: ['PDF', 'Excel', 'JSON'],
    isFavorite: true
  },
  {
    id: '5',
    name: 'TDS Compliance Report',
    category: 'Compliance',
    description: 'Section-wise TDS tracking with deposition status',
    icon: DollarSign,
    lastGenerated: '2024-12-05 08:30 AM',
    schedule: 'quarterly',
    nextRun: '2025-03-31',
    formats: ['PDF', 'Excel'],
    isFavorite: false
  },
  {
    id: '6',
    name: 'Client Aging Report',
    category: 'Financial',
    description: 'Outstanding receivables by client and aging buckets',
    icon: Building2,
    lastGenerated: '2024-12-15 04:00 PM',
    schedule: 'weekly',
    nextRun: '2024-12-22',
    formats: ['PDF', 'Excel', 'Tally'],
    isFavorite: false
  },
  {
    id: '7',
    name: 'Project Profitability',
    category: 'Projects',
    description: 'Budget vs actual with resource utilization metrics',
    icon: BarChart3,
    lastGenerated: '2024-12-12 02:15 PM',
    schedule: 'monthly',
    nextRun: '2025-01-12',
    formats: ['PDF', 'Excel'],
    isFavorite: true
  },
];

const reportHistory = [
  { id: 1, reportName: 'Client Profitability Analysis', generatedAt: '2024-12-15 10:30 AM', format: 'PDF', status: 'ready', size: '2.4 MB' },
  { id: 2, reportName: 'Revenue Per Employee', generatedAt: '2024-12-14 09:00 AM', format: 'Excel', status: 'ready', size: '1.8 MB' },
  { id: 3, reportName: 'GST Summary Report', generatedAt: '2024-12-10 11:45 AM', format: 'PDF', status: 'ready', size: '3.2 MB' },
  { id: 4, reportName: 'Freelancer Performance Dashboard', generatedAt: '2024-12-13 06:00 PM', format: 'Excel', status: 'processing', size: null },
];

function ScheduleBadge({ schedule }: { schedule?: string }) {
  if (!schedule) return null;
  
  const colors = {
    daily: 'bg-[var(--info-light)] text-[var(--info)]',
    weekly: 'bg-[var(--warning-light)] text-[var(--warning)]',
    monthly: 'bg-[var(--success-light)] text-[var(--success)]',
    quarterly: 'bg-[var(--primary-light)] text-[var(--primary)]',
    custom: 'bg-[var(--surface-hover)] text-[var(--text-muted)]'
  };

  return (
    <span className={`px-2 py-0.5 text-xs font-medium rounded ${colors[schedule as keyof typeof colors] || colors.custom}`}>
      <Clock className="w-3 h-3 inline mr-1" />
      {schedule.charAt(0).toUpperCase() + schedule.slice(1)}
    </span>
  );
}

function FormatIcon({ format }: { format: string }) {
  switch (format.toLowerCase()) {
    case 'pdf': return <FilePdf className="w-4 h-4 text-[var(--error)]" />;
    case 'excel': return <FileSpreadsheet className="w-4 h-4 text-[var(--success)]" />;
    case 'json': return <FileJson className="w-4 h-4 text-[var(--info)]" />;
    case 'tally': return <BarChart3 className="w-4 h-4 text-[var(--primary)]" />;
    default: return <FileText className="w-4 h-4 text-[var(--text-muted)]" />;
  }
}

export function ReportsModule() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeView, setActiveView] = useState<'reports' | 'history' | 'scheduled'>('reports');

  const categories = [
    { id: 'all', label: 'All Reports' },
    { id: 'Financial', label: 'Financial' },
    { id: 'HR & People', label: 'HR & People' },
    { id: 'Compliance', label: 'Compliance' },
    { id: 'Workforce', label: 'Workforce' },
    { id: 'Projects', label: 'Projects' },
  ];

  const filteredReports = activeCategory === 'all' 
    ? reports 
    : reports.filter(r => r.category === activeCategory);

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="card p-5 surface-hover">
          <div className="flex items-start justify-between mb-2">
            <FileText className="w-5 h-5 text-[var(--primary)]" />
            <span className="text-xs text-[var(--success)] bg-[var(--success-light)] px-2 py-0.5 rounded-full">+3 this week</span>
          </div>
          <p className="text-2xl font-bold text-[var(--text-primary)]">{reports.length}</p>
          <p className="text-sm text-[var(--text-muted)]">Total Reports</p>
        </div>
        <div className="card p-5 surface-hover">
          <div className="flex items-start justify-between mb-2">
            <Clock className="w-5 h-5 text-[var(--info)]" />
          </div>
          <p className="text-2xl font-bold text-[var(--text-primary)]">5</p>
          <p className="text-sm text-[var(--text-muted)]">Scheduled</p>
        </div>
        <div className="card p-5 surface-hover">
          <div className="flex items-start justify-between mb-2">
            <Download className="w-5 h-5 text-[var(--success)]" />
          </div>
          <p className="text-2xl font-bold text-[var(--text-primary)]">48</p>
          <p className="text-sm text-[var(--text-muted)]">Downloads this month</p>
        </div>
        <div className="card p-5 surface-hover">
          <div className="flex items-start justify-between mb-2">
            <Star className="w-5 h-5 text-[var(--warning)]" />
          </div>
          <p className="text-2xl font-bold text-[var(--text-primary)]">4</p>
          <p className="text-sm text-[var(--text-muted)]">Favorites</p>
        </div>
      </div>

      {/* View Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 bg-[var(--surface)] rounded-lg p-1 border border-[var(--border)]">
          {[
            { id: 'reports', label: 'Reports Library' },
            { id: 'history', label: 'Recent Exports' },
            { id: 'scheduled', label: 'Scheduled Reports' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id as any)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeView === tab.id
                  ? 'bg-[var(--primary)] text-white'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeView === 'reports' && (
          <div className="flex items-center gap-1 bg-[var(--surface)] rounded-lg p-1 border border-[var(--border)]">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                  activeCategory === cat.id
                    ? 'bg-[var(--surface-hover)] text-[var(--text-primary)]'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Reports Library */}
      {activeView === 'reports' && (
        <div className="grid grid-cols-2 gap-4">
          {filteredReports.map((report) => {
            const Icon = report.icon;
            return (
              <div key={report.id} className="card p-5 hover:border-[var(--border-hover)] transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[var(--primary-light)] rounded-xl flex items-center justify-center">
                      <Icon className="w-6 h-6 text-[var(--primary)]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[var(--text-primary)]">{report.name}</h3>
                      <p className="text-xs text-[var(--text-muted)]">{report.category}</p>
                    </div>
                  </div>
                  <button className="text-[var(--text-muted)] hover:text-[var(--warning)]">
                    <Star className={`w-5 h-5 ${report.isFavorite ? 'fill-[var(--warning)] text-[var(--warning)]' : ''}`} />
                  </button>
                </div>

                <p className="text-sm text-[var(--text-secondary)] mb-4">{report.description}</p>

                {/* Schedule Info */}
                {report.schedule && (
                  <div className="flex items-center gap-2 mb-4">
                    <ScheduleBadge schedule={report.schedule} />
                    {report.nextRun && (
                      <span className="text-xs text-[var(--text-muted)]">Next: {report.nextRun}</span>
                    )}
                  </div>
                )}

                {/* Export Formats */}
                <div className="flex items-center justify-between pt-4 border-t border-[var(--border)]">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[var(--text-muted)]">Export:</span>
                    <div className="flex items-center gap-1">
                      {report.formats.map((format, idx) => (
                        <button 
                          key={idx}
                          className="p-1.5 rounded hover:bg-[var(--surface-hover)] transition-colors"
                          title={format}
                        >
                          <FormatIcon format={format} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="btn btn-secondary text-xs px-3 py-1.5">
                      Preview
                    </button>
                    <button className="btn btn-primary text-xs px-3 py-1.5">
                      Export
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Recent Exports */}
      {activeView === 'history' && (
        <div className="card overflow-hidden">
          <div className="p-4 border-b border-[var(--border)]">
            <h3 className="font-semibold text-[var(--text-primary)]">Recent Exports</h3>
          </div>
          <div className="overflow-x-auto">
            <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-[var(--surface-hover)] text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
              <div className="col-span-4">Report</div>
              <div className="col-span-2">Generated</div>
              <div className="col-span-1">Format</div>
              <div className="col-span-1">Size</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2"></div>
            </div>
            {reportHistory.map((item) => (
              <div key={item.id} className="grid grid-cols-12 gap-4 px-4 py-3 border-t border-[var(--border)] hover:bg-[var(--surface-hover)] transition-colors items-center">
                <div className="col-span-4">
                  <div className="flex items-center gap-2">
                    <FormatIcon format={item.format} />
                    <span className="text-sm text-[var(--text-primary)]">{item.reportName}</span>
                  </div>
                </div>
                <div className="col-span-2 text-sm text-[var(--text-muted)]">{item.generatedAt}</div>
                <div className="col-span-1 text-sm text-[var(--text-secondary)]">{item.format}</div>
                <div className="col-span-1 text-sm text-[var(--text-muted)]">{item.size || '-'}</div>
                <div className="col-span-2">
                  {item.status === 'ready' ? (
                    <span className="flex items-center gap-1 text-xs text-[var(--success)]">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Ready
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs text-[var(--info)]">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Processing
                    </span>
                  )}
                </div>
                <div className="col-span-2 flex justify-end gap-2">
                  <button className="btn btn-ghost p-1.5" title="Email">
                    <Mail className="w-4 h-4" />
                  </button>
                  <button className="btn btn-ghost p-1.5" title="Download">
                    <Download className="w-4 h-4" />
                  </button>
                  <button className="btn btn-ghost p-1.5" title="More">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Scheduled Reports */}
      {activeView === 'scheduled' && (
        <div className="space-y-4">
          {reports.filter(r => r.schedule).map((report) => {
            const Icon = report.icon;
            return (
              <div key={report.id} className="card p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[var(--primary-light)] rounded-xl flex items-center justify-center">
                      <Icon className="w-6 h-6 text-[var(--primary)]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[var(--text-primary)]">{report.name}</h3>
                      <p className="text-xs text-[var(--text-muted)]">
                        Next run: {report.nextRun} • Last: {report.lastGenerated}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <ScheduleBadge schedule={report.schedule} />
                    <button className="btn btn-secondary text-xs px-3 py-1.5">
                      Edit Schedule
                    </button>
                    <button className="btn btn-ghost p-1.5 text-[var(--error)]">
                      <AlertCircle className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Star component for favorites
function Star(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

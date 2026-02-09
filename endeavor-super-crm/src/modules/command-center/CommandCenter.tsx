import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, DollarSign, Users, Package, Clock, ArrowUpRight } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: React.ElementType;
}

function StatCard({ label, value, change, trend, icon: Icon }: StatCardProps) {
  return (
    <div className="card p-5 surface-hover">
      <div className="flex items-start justify-between mb-4">
        <div className="p-2.5 bg-[var(--surface-hover)] rounded-lg">
          <Icon className="w-5 h-5 text-[var(--text-secondary)]" />
        </div>
        <div className={`flex items-center gap-1 text-xs font-medium ${trend === 'up' ? 'text-[var(--success)]' : 'text-[var(--error)]'}`}>
          {trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {change}
        </div>
      </div>
      <p className="text-2xl font-bold text-[var(--text-primary)] mb-1">{value}</p>
      <p className="text-sm text-[var(--text-muted)]">{label}</p>
    </div>
  );
}

interface RiskItemProps {
  level: 'high' | 'medium' | 'low';
  message: string;
  action: string;
}

function RiskItem({ level, message, action }: RiskItemProps) {
  const levelStyles = {
    high: 'bg-[var(--error-light)] text-[var(--error)] border-[var(--error)]/20',
    medium: 'bg-[var(--warning-light)] text-[var(--warning)] border-[var(--warning)]/20',
    low: 'bg-[var(--success-light)] text-[var(--success)] border-[var(--success)]/20',
  };

  return (
    <div className="flex items-center justify-between p-4 bg-[var(--surface-hover)] rounded-lg border border-[var(--border)] hover:border-[var(--border-hover)] transition-colors">
      <div className="flex items-center gap-3">
        <span className={`w-2 h-2 rounded-full ${level === 'high' ? 'bg-[var(--error)]' : level === 'medium' ? 'bg-[var(--warning)]' : 'bg-[var(--success)]'}`}></span>
        <span className="text-sm text-[var(--text-primary)]">{message}</span>
      </div>
      <button className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors ${levelStyles[level]}`}>
        {action}
      </button>
    </div>
  );
}

interface ActionItemProps {
  icon: string;
  title: string;
  subtitle: string;
  priority: 'high' | 'medium' | 'low';
  time: string;
}

function ActionItem({ icon, title, subtitle, priority, time }: ActionItemProps) {
  const priorityStyles = {
    high: 'bg-[var(--error)]/10 text-[var(--error)] border-[var(--error)]/20',
    medium: 'bg-[var(--warning)]/10 text-[var(--warning)] border-[var(--warning)]/20',
    low: 'bg-[var(--success)]/10 text-[var(--success)] border-[var(--success)]/20',
  };

  return (
    <div className="flex items-start gap-4 p-4 bg-[var(--surface-hover)] rounded-lg border border-[var(--border)] hover:border-[var(--border-hover)] transition-all cursor-pointer group">
      <span className="text-2xl">{icon}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-[var(--text-primary)] truncate">{title}</span>
          <span className={`px-2 py-0.5 text-[10px] font-semibold rounded border ${priorityStyles[priority]}`}>
            {priority}
          </span>
        </div>
        <p className="text-sm text-[var(--text-muted)]">{subtitle}</p>
      </div>
      <span className="text-xs text-[var(--text-muted)] whitespace-nowrap">{time}</span>
      <ArrowUpRight className="w-4 h-4 text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
}

export function CommandCenter() {
  const stats = [
    { label: 'Revenue MTD', value: '₹42.5L', change: '+12%', trend: 'up' as const, icon: DollarSign },
    { label: 'Gross Margin', value: '38.5%', change: '+2.3%', trend: 'up' as const, icon: TrendingUp },
    { label: 'Utilization', value: '84%', change: '-3%', trend: 'down' as const, icon: Users },
    { label: 'On-time Delivery', value: '94%', change: '+4%', trend: 'up' as const, icon: Package },
  ];

  const risks: RiskItemProps[] = [
    { level: 'high', message: '3 delayed invoices pending ₹8.5L', action: 'Review' },
    { level: 'medium', message: 'Client XYZ scope exceeded by 18%', action: 'Renegotiate' },
    { level: 'high', message: 'GST filing due in 4 days', action: 'Prepare' },
    { level: 'low', message: '2 freelancers idle >5 days', action: 'Reassign' },
  ];

  const actions: ActionItemProps[] = [
    { icon: '💰', title: '3 freelancers pending payout', subtitle: '₹1.2L - Approve by EOD', priority: 'high', time: '2h ago' },
    { icon: '📧', title: 'Client proposal pending approval', subtitle: 'EdTech project - ₹25L', priority: 'medium', time: '4h ago' },
    { icon: '⚠️', title: 'Timesheet approval overdue', subtitle: '12 freelancers', priority: 'high', time: '1d ago' },
    { icon: '✅', title: 'New client onboarded', subtitle: 'Global Solutions - ₹50L', priority: 'low', time: '2d ago' },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <section>
        <div className="grid grid-cols-4 gap-4">
          {stats.map((stat, idx) => (
            <StatCard key={idx} {...stat} />
          ))}
        </div>
      </section>

      {/* Two Column Layout */}
      <div className="grid grid-cols-2 gap-6">
        {/* Risk Radar */}
        <section className="card p-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[var(--warning)]" />
              Risk Radar
            </h2>
            <button className="text-xs text-[var(--primary)] hover:underline">View All</button>
          </div>
          <div className="space-y-3">
            {risks.map((risk, idx) => (
              <RiskItem key={idx} {...risk} />
            ))}
          </div>
        </section>

        {/* Action Feed */}
        <section className="card p-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-[var(--success)]" />
              Action Feed
            </h2>
            <button className="text-xs text-[var(--primary)] hover:underline">Mark All Read</button>
          </div>
          <div className="space-y-3">
            {actions.map((action, idx) => (
              <ActionItem key={idx} {...action} />
            ))}
          </div>
        </section>
      </div>

      {/* Cash Flow Preview */}
      <section className="bg-gradient-to-r from-blue-600/20 via-blue-500/10 to-purple-600/20 rounded-xl p-6 border border-[var(--border)]">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-1 flex items-center gap-2">
              <Clock className="w-4 h-4 text-[var(--primary)]" />
              Cash Flow Forecast
            </h2>
            <p className="text-xs text-[var(--text-muted)]">Next 30 days projection</p>
          </div>
          <div className="flex gap-12">
            <div>
              <p className="text-xs text-[var(--text-muted)] mb-1">Cash In</p>
              <p className="text-xl font-bold text-[var(--success)]">₹68.5L</p>
            </div>
            <div>
              <p className="text-xs text-[var(--text-muted)] mb-1">Cash Out</p>
              <p className="text-xl font-bold text-[var(--error)]">₹45.2L</p>
            </div>
            <div>
              <p className="text-xs text-[var(--text-muted)] mb-1">Net Position</p>
              <p className="text-xl font-bold text-[var(--primary)]">+₹23.3L</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

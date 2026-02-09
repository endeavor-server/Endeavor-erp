import type { ModuleType } from '../../types';
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  Briefcase, 
  Wallet, 
  TrendingUp, 
  Bot, 
  Plug, 
  BarChart3, 
  Settings 
} from 'lucide-react';

interface SidebarProps {
  currentModule: ModuleType;
  onModuleChange: (module: ModuleType) => void;
}

interface NavItem {
  id: ModuleType;
  label: string;
  icon: React.ElementType;
  section?: string;
  badge?: string;
}

const navItems: NavItem[] = [
  { id: 'command-center', label: 'Command Center', icon: LayoutDashboard, section: 'Home', badge: 'LIVE' },
  { id: 'clients', label: 'Clients', icon: Users, section: 'Business' },
  { id: 'work-delivery', label: 'Work & Delivery', icon: Package },
  { id: 'people', label: 'People', icon: Briefcase },
  { id: 'finance', label: 'Finance & Compliance', icon: Wallet, section: 'Operations' },
  { id: 'sales', label: 'Sales & Growth', icon: TrendingUp },
  { id: 'ai-automation', label: 'AI & Automation', icon: Bot, section: 'Intelligence' },
  { id: 'integrations', label: 'Integrations', icon: Plug },
  { id: 'reports', label: 'Reports', icon: BarChart3, section: 'Analytics' },
  { id: 'admin', label: 'System Admin', icon: Settings },
];

export function Sidebar({ currentModule, onModuleChange }: SidebarProps) {
  const groupedItems = navItems.reduce((acc, item) => {
    const section = item.section || 'Other';
    if (!acc[section]) acc[section] = [];
    acc[section].push(item);
    return acc;
  }, {} as Record<string, NavItem[]>);

  return (
    <aside className="w-64 bg-[var(--surface)] border-r border-[var(--border)] fixed h-full flex flex-col">
      {/* Logo */}
      <div className="p-5 border-b border-[var(--border)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-xl">🚀</span>
          </div>
          <div>
            <h1 className="font-bold text-[var(--text-primary)] text-lg tracking-tight">Endeavor</h1>
            <p className="text-xs text-[var(--text-muted)]">Business OS</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3">
        {Object.entries(groupedItems).map(([section, items]) => (
          <div key={section} className="mb-6">
            <h3 className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2 px-3">
              {section}
            </h3>
            {items.map((item) => {
              const Icon = item.icon;
              const isActive = currentModule === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => onModuleChange(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-[var(--primary-light)] text-[var(--primary)]'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <Icon className="w-[18px] h-[18px]" strokeWidth={isActive ? 2.5 : 2} />
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.badge && (
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-[var(--success)] rounded-full animate-pulse"></span>
                      <span className="text-[10px] text-[var(--success)] font-semibold">{item.badge}</span>
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-[var(--border)]">
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-[var(--surface-hover)] transition-colors cursor-pointer">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center font-semibold text-sm">
            NA
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[var(--text-primary)] truncate">Nikhil Admin</p>
            <p className="text-xs text-[var(--text-muted)]">Super Admin</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

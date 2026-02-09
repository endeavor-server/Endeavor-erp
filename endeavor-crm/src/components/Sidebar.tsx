import { 
  LayoutDashboard, 
  Users, 
  Target, 
  Briefcase, 
  CheckSquare, 
  Calendar, 
  BarChart3,
  Settings,
  LogOut
} from 'lucide-react';
import type { ViewType } from '../types';

interface SidebarProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}

const menuItems: { id: ViewType; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'contacts', label: 'Contacts', icon: Users },
  { id: 'leads', label: 'Leads', icon: Target },
  { id: 'deals', label: 'Deals', icon: Briefcase },
  { id: 'tasks', label: 'Tasks', icon: CheckSquare },
  { id: 'calendar', label: 'Calendar', icon: Calendar },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
];

export function Sidebar({ currentView, onViewChange }: SidebarProps) {
  return (
    <aside className="w-64 bg-primary-950 text-white h-screen flex flex-col fixed left-0 top-0">
      {/* Logo */}
      <div className="p-6 border-b border-primary-900">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
            <Briefcase className="w-6 h-6 text-primary-950" />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight">Endeavor</h1>
            <p className="text-xs text-primary-300">Academy CRM</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`sidebar-link w-full text-left ${
                  isActive 
                    ? 'active' 
                    : 'text-primary-100 hover:bg-primary-900 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-primary-900 space-y-1">
        <button className="sidebar-link w-full text-left text-primary-100 hover:bg-primary-900 hover:text-white">
          <Settings className="w-5 h-5" />
          <span>Settings</span>
        </button>
        <button className="sidebar-link w-full text-left text-primary-100 hover:bg-primary-900 hover:text-white">
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

// Layout Component - Updated for Auth & RBAC
// WCAG 2.1 AA Compliant with Skip Links and Keyboard Navigation

import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  FileText,
  Calculator,
  BarChart3,
  Settings,
  Menu,
  X,
  ChevronDown,
  Bell,
  Search,
  Sun,
  Moon,
  LogOut,
  Command,
  Bot,
  Plug,
  Shield,
  BookOpen,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import type { UserRole } from '../types/auth';
import { SkipLinks } from './a11y/SkipLink';
import { ScreenReaderOnly } from './a11y/ScreenReaderOnly';
import { keyboard, announce } from '../utils/accessibility';

// Navigation configuration with role-based access
interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  allowedRoles: UserRole[];
  children?: { name: string; href: string; allowedRoles?: UserRole[] }[];
}

const navigation: NavItem[] = [
  { 
    name: 'Dashboard', 
    href: '/dashboard', 
    icon: LayoutDashboard,
    allowedRoles: ['admin', 'endeavor_ops', 'client', 'freelancer', 'contractor', 'vendor']
  },
  {
    name: 'Command Center',
    href: '/command-center',
    icon: Command,
    allowedRoles: ['admin', 'endeavor_ops'],
  },
  {
    name: 'Clients',
    href: '/clients',
    icon: BookOpen,
    allowedRoles: ['admin', 'endeavor_ops', 'client'],
  },
  {
    name: 'Work & Delivery',
    href: '/work-delivery',
    icon: Briefcase,
    allowedRoles: ['admin', 'endeavor_ops', 'client', 'freelancer', 'contractor'],
  },
  {
    name: 'People',
    href: '/people',
    icon: Users,
    allowedRoles: ['admin', 'endeavor_ops', 'vendor'],
  },
  {
    name: 'Finance',
    href: '/finance',
    icon: Calculator,
    allowedRoles: ['admin', 'endeavor_ops', 'client', 'freelancer', 'contractor', 'vendor'],
    children: [
      { name: 'Overview', href: '/finance', allowedRoles: ['admin', 'endeavor_ops', 'client', 'freelancer', 'contractor', 'vendor'] },
      { name: 'Client Invoices', href: '/invoicing/client-invoices', allowedRoles: ['admin', 'endeavor_ops', 'client'] },
      { name: 'Invoice Center', href: '/invoicing/center', allowedRoles: ['admin', 'endeavor_ops'] },
    ],
  },
  {
    name: 'Sales',
    href: '/sales',
    icon: FileText,
    allowedRoles: ['admin', 'endeavor_ops'],
  },
  {
    name: 'AI Automation',
    href: '/ai-automation',
    icon: Bot,
    allowedRoles: ['admin', 'endeavor_ops'],
  },
  {
    name: 'Integrations',
    href: '/integrations',
    icon: Plug,
    allowedRoles: ['admin', 'endeavor_ops'],
  },
  {
    name: 'Reports',
    href: '/reports',
    icon: BarChart3,
    allowedRoles: ['admin', 'endeavor_ops', 'client'],
  },
  {
    name: 'Admin',
    href: '/admin',
    icon: Shield,
    allowedRoles: ['admin'],
  },
];

export function Layout() {
  const { user, logout, isAdmin, isOps } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['/finance']);
  const location = useLocation();

  // Filter navigation based on user role
  const filteredNavigation = navigation.filter(item => 
    user && item.allowedRoles.includes(user.role)
  ).map(item => {
    // Filter children based on role
    if (item.children) {
      return {
        ...item,
        children: item.children.filter(child => 
          !child.allowedRoles || (user && child.allowedRoles.includes(user.role))
        )
      };
    }
    return item;
  });

  const toggleMenu = (href: string) => {
    setExpandedMenus((prev) =>
      prev.includes(href) ? prev.filter((h) => h !== href) : [...prev, href]
    );
  };

  // Get user initials
  const getInitials = () => {
    if (!user) return '??';
    return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  };

  // Get role label
  const getRoleLabel = () => {
    if (!user) return 'Unknown';
    const labels: Record<UserRole, string> = {
      admin: 'Super Admin',
      endeavor_ops: 'Operations',
      client: 'Client',
      freelancer: 'Freelancer',
      contractor: 'Contractor',
      vendor: 'Vendor',
    };
    return labels[user.role];
  };

  const handleLogout = async () => {
    announce.message('Signing out...');
    await logout();
  };

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {/* Skip Links for keyboard navigation */}
      <SkipLinks 
        links={[
          { targetId: 'main-content', label: 'Skip to main content' },
          { targetId: 'main-navigation', label: 'Skip to navigation' },
          { targetId: 'global-search', label: 'Skip to search' },
        ]}
      />

      {/* Mobile sidebar */}
      <div 
        className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation menu"
      >
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm" 
          onClick={() => setSidebarOpen(false)} 
          aria-hidden="true"
        />
        <div className="fixed inset-y-0 left-0 w-72 bg-[var(--surface)] border-r border-[var(--border)]">
          <div className="flex h-16 items-center justify-between px-4 border-b border-[var(--border)]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[var(--primary)] rounded-lg flex items-center justify-center" aria-hidden="true">
                <span className="text-white font-bold text-sm">E</span>
              </div>
              <span className="text-lg font-bold text-[var(--text-primary)]">
                Endeavor
              </span>
            </div>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded-lg text-[var(--text-muted)] hover:bg-[var(--surface-hover)]"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
          <nav className="p-3 space-y-1" role="navigation" aria-label="Main navigation">
            {renderNavigation(filteredNavigation, location.pathname, expandedMenus, toggleMenu)}
          </nav>
        </div>
      </div>

      <div className="flex h-screen">
        {/* Desktop sidebar */}
        <aside 
          id="main-navigation"
          className="hidden lg:flex w-64 flex-col bg-[var(--surface)] border-r border-[var(--border)]"
          aria-label="Main navigation"
        >
          <div className="flex h-16 items-center px-4 border-b border-[var(--border)]">
            <a href="/dashboard" className="flex items-center gap-3" aria-label="Endeavor SUPER CRM Home">
              <div className="w-8 h-8 bg-gradient-to-br from-[var(--primary)] to-purple-600 rounded-lg flex items-center justify-center" aria-hidden="true">
                <span className="text-white font-bold text-sm">E</span>
              </div>
              <div>
                <span className="text-lg font-bold text-[var(--text-primary)] block leading-tight">
                  Endeavor
                </span>
                <span className="text-xs text-[var(--text-muted)]">SUPER CRM</span>
              </div>
            </a>
          </div>
          <nav className="flex-1 overflow-y-auto p-3 space-y-1" aria-label="Main menu">
            {renderNavigation(filteredNavigation, location.pathname, expandedMenus, toggleMenu)}
          </nav>
          <div className="p-3 border-t border-[var(--border)]">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-3 py-2 rounded-lg text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
            >
              <LogOut className="h-5 w-5 mr-3" aria-hidden="true" />
              Sign Out
            </button>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top header */}
          <header className="h-16 bg-[var(--surface)] border-b border-[var(--border)] flex items-center justify-between px-4 lg:px-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg text-[var(--text-muted)] hover:bg-[var(--surface-hover)]"
                aria-label="Open navigation menu"
                aria-expanded={sidebarOpen}
                aria-controls="mobile-menu"
              >
                <Menu className="h-5 w-5" aria-hidden="true" />
              </button>
              <div id="global-search" className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" aria-hidden="true" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 w-64 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
                  aria-label="Global search"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button 
                className="relative p-2 rounded-lg text-[var(--text-muted)] hover:bg-[var(--surface-hover)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
                aria-label="Notifications (3 unread)"
              >
                <Bell className="h-5 w-5" aria-hidden="true" />
                <span 
                  className="absolute top-1.5 right-1.5 h-2 w-2 bg-[var(--error)] rounded-full" 
                  aria-hidden="true"
                />
                <ScreenReaderOnly>3 unread notifications</ScreenReaderOnly>
              </button>
              <div 
                className="flex items-center gap-3 pl-3 border-l border-[var(--border)]"
                role="region"
                aria-label="User menu"
              >
                <div className="text-right hidden md:block">
                  <p className="text-sm font-medium text-[var(--text-primary)]">
                    {user ? `${user.firstName} ${user.lastName}` : 'Loading...'}
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">{getRoleLabel()}</p>
                </div>
                <div 
                  className="h-9 w-9 rounded-full bg-[var(--primary)] flex items-center justify-center text-white font-medium"
                  aria-hidden="true"
                >
                  {getInitials()}
                </div>
              </div>
            </div>
          </header>

          {/* Page content - Main content area */}
          <main 
            id="main-content" 
            className="flex-1 overflow-y-auto p-4 lg:p-6"
            tabIndex={-1}
            role="main"
            aria-label="Main content"
          >
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}

function renderNavigation(
  items: NavItem[],
  currentPath: string,
  expandedMenus: string[],
  toggleMenu: (href: string) => void
) {
  return items.map((item) => {
    const isExpanded = expandedMenus.includes(item.href);
    const hasChildren = item.children && item.children.length > 0;
    const isActive = currentPath === item.href || currentPath.startsWith(item.href + '/');

    return (
      <div key={item.name}>
        <NavLink
          to={item.href}
          onClick={(e) => {
            if (hasChildren) {
              e.preventDefault();
              toggleMenu(item.href);
            }
          }}
          className={({ isActive: navActive }) =>
            `flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
              navActive || isActive
                ? 'bg-[var(--primary)] text-white'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]'
            }`
          }
          aria-current={isActive ? 'page' : undefined}
          aria-expanded={hasChildren ? isExpanded : undefined}
          aria-haspopup={hasChildren ? 'menu' : undefined}
        >
          <item.icon className="h-5 w-5 mr-3 flex-shrink-0" aria-hidden="true" />
          <span className="flex-1">{item.name}</span>
          {hasChildren && (
            <ChevronDown
              className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              aria-hidden="true"
            />
          )}
        </NavLink>

        {hasChildren && isExpanded && (
          <div 
            className="ml-8 mt-1 space-y-1"
            role="region"
            aria-label={`${item.name} submenu`}
          >
            {item.children.map((child) => (
              <NavLink
                key={child.name}
                to={child.href}
                className={({ isActive }) =>
                  `block px-4 py-2 text-sm rounded-lg transition-colors ${
                    isActive
                      ? 'bg-[var(--primary-light)] text-[var(--primary)]'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]'
                  }`
                }
                aria-current={currentPath === child.href ? 'page' : undefined}
              >
                {child.name}
              </NavLink>
            ))}
          </div>
        )}
      </div>
    );
  });
}

import { Bell, Search, Command, Building2, ChevronDown } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  return (
    <header className="h-16 bg-[var(--bg)] border-b border-[var(--border)] flex items-center justify-between px-6 sticky top-0 z-20">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        <button className="flex items-center gap-2 px-3 py-1.5 bg-[var(--surface)] border border-[var(--border)] rounded-lg hover:border-[var(--border-hover)] transition-colors">
          <Building2 className="w-4 h-4 text-[var(--text-secondary)]" />
          <span className="text-sm text-[var(--text-primary)]">Endeavor Academy Pvt Ltd</span>
          <ChevronDown className="w-3 h-3 text-[var(--text-muted)]" />
        </button>
        
        <div className="h-6 w-px bg-[var(--border)]"></div>
        
        <div>
          <h1 className="text-[15px] font-semibold text-[var(--text-primary)]">{title}</h1>
          <p className="text-xs text-[var(--text-muted)]">{subtitle}</p>
        </div>
      </div>

      {/* Center - Global Search */}
      <div className="flex-1 max-w-md mx-8">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] group-focus-within:text-[var(--primary)] transition-colors" />
          <input
            type="text"
            placeholder="Search anything..."
            className="w-full pl-10 pr-4 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--primary)] focus:outline-none transition-all"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[var(--text-muted)]">
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-[var(--surface-hover)] rounded">⌘</kbd>
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-[var(--surface-hover)] rounded">K</kbd>
          </div>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <button className="relative p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface)] rounded-lg transition-colors">
          <Bell className="w-[18px] h-[18px]" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[var(--error)] rounded-full ring-2 ring-[var(--bg)]"></span>
        </button>

        {/* Command Menu */}
        <button className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface)] rounded-lg transition-colors">
          <Command className="w-[18px] h-[18px]" />
        </button>

        {/* Density Toggle */}
        <div className="flex items-center gap-1 ml-2 p-1 bg-[var(--surface)] border border-[var(--border)] rounded-lg">
          <button className="px-2 py-1 text-xs font-medium text-[var(--text-primary)] bg-[var(--primary)] rounded">C</button>
          <button className="px-2 py-1 text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)]">D</button>
        </div>
      </div>
    </header>
  );
}

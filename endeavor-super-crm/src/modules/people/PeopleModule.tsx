import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Users, UserCircle, Briefcase, Truck, Store, Search, Plus, Star,
  IndianRupee, Clock8, MoreVertical, Filter, ChevronLeft, ChevronRight,
  Loader2, RefreshCw, Download
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { api, optimizedAPI } from '@/services/api';
import { 
  encodeCursor, 
  decodeCursor, 
  toCursorPaginatedResult,
  selectFields,
  debounce,
  type PaginatedResult 
} from '@/utils/pagination';
import { useRenderPerformance } from '@/hooks/usePerformance';
import { VirtualizedList } from '@/components/virtualized';

// ============================================
// Types
// ============================================

type PeopleTab = 'employees' | 'freelancers' | 'contractors' | 'vendors';

interface Freelancer {
  id: string;
  freelancer_code: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  skills: string[];
  primary_skill?: string;
  hourly_rate?: number;
  availability: 'available' | 'busy' | 'unavailable';
  rating: number;
  total_projects: number;
  total_hours: number;
  city?: string;
  status: string;
  created_at: string;
}

interface Employee {
  id: string;
  employee_code: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  department?: string;
  designation?: string;
  base_salary?: number;
  status: string;
  created_at: string;
}

// ============================================
// Stats Component
// ============================================

function StatCard({ label, value, trend, icon: Icon, trendValue, loading }: { 
  label: string; value: string; trend: 'up' | 'down' | 'neutral'; icon: any; trendValue: string; loading?: boolean;
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
      <p className="text-2xl font-bold text-[var(--text-primary)] mb-1">
        {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : value}
      </p>
      <p className="text-sm text-[var(--text-muted)]">{label}</p>
    </div>
  );
}

// ============================================
// Freelancer Card Component (for Virtualized List)
// ============================================

function FreelancerCard({ 
  freelancer, 
  style, 
  onClick 
}: { 
  freelancer: Freelancer; 
  style: React.CSSProperties;
  onClick?: () => void;
}) {
  const name = `${freelancer.first_name} ${freelancer.last_name}`;
  const initials = name.split(' ').map(n => n[0]).join('');
  const availability = freelancer.availability;

  return (
    <div 
      className="card p-4 m-2 hover:shadow-md transition-shadow"
      style={style}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white font-bold text-sm">
          {initials}
        </div>
        <div className="flex items-center gap-1 px-2 py-1 bg-[var(--surface-hover)] rounded-lg">
          <Star className="w-3.5 h-3.5 text-[var(--warning)] fill-[var(--warning)]" />
          <span className="text-sm font-medium text-[var(--text-primary)]">{freelancer.rating.toFixed(1)}</span>
        </div>
      </div>
      
      <h3 className="font-semibold text-[var(--text-primary)] mb-1 truncate">{name}</h3>
      <p className="text-sm text-[var(--primary)] mb-2 truncate">{freelancer.primary_skill || freelancer.skills?.[0] || 'General'}</p>
      
      <div className="flex flex-wrap gap-1 mb-3">
        {freelancer.skills?.slice(0, 3).map((skill, i) => (
          <span key={i} className="px-2 py-0.5 text-xs bg-[var(--surface-hover)] text-[var(--text-secondary)] rounded truncate max-w-[80px]">
            {skill}
          </span>
        ))}
      </div>
      
      <div className="grid grid-cols-2 gap-3 py-2 border-t border-b border-[var(--border)] mb-3 text-xs">
        <div>
          <p className="text-[var(--text-muted)] mb-0.5">Projects</p>
          <p className="font-medium text-[var(--text-primary)]">{freelancer.total_projects}</p>
        </div>
        <div>
          <p className="text-[var(--text-muted)] mb-0.5">Hours</p>
          <p className="font-medium text-[var(--text-primary)]">{freelancer.total_hours}</p>
        </div>
        <div>
          <p className="text-[var(--text-muted)] mb-0.5">Rate</p>
          <p className="font-medium text-[var(--text-primary)]">₹{freelancer.hourly_rate || 0}/hr</p>
        </div>
        <div>
          <p className="text-[var(--text-muted)] mb-0.5">Location</p>
          <p className="font-medium text-[var(--text-primary)] truncate">{freelancer.city || 'Remote'}</p>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
          availability === 'available' ? 'bg-[var(--success-light)] text-[var(--success)]' :
          availability === 'busy' ? 'bg-[var(--warning-light)] text-[var(--warning)]' :
          'bg-[var(--surface-hover)] text-[var(--text-muted)]'
        }`}>
          {availability === 'available' ? 'Available' : availability === 'busy' ? 'Busy' : 'Unavailable'}
        </span>
        <button className="btn btn-primary text-xs px-2 py-1">
          Assign
        </button>
      </div>
    </div>
  );
}

// ============================================
// Main Component
// ============================================

const PAGE_SIZE = 24;
const DEBOUNCE_DELAY = 300;

export function PeopleModule() {
  // Performance tracking
  const perfMetrics = useRenderPerformance('PeopleModule');
  
  // State
  const [activeTab, setActiveTab] = useState<PeopleTab>('employees');
  const [searchTerm, setSearchTerm] = useState('');
  const [skillFilter, setSkillFilter] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination state
  const [freelancers, setFreelancers] = useState<Freelancer[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  
  // Stats
  const [stats, setStats] = useState({
    totalWorkforce: '760',
    activeFreelancers: '584',
    monthlyPayroll: '₹68.5L',
    avgTimeToBill: '4.2 days',
  });

  const tabs = [
    { id: 'employees' as const, label: 'Employees', icon: UserCircle, count: 78 },
    { id: 'freelancers' as const, label: 'Freelancers', icon: Briefcase, count: 642 },
    { id: 'contractors' as const, label: 'Contractors', icon: Truck, count: 12 },
    { id: 'vendors' as const, label: 'Vendors', icon: Store, count: 28 },
  ];

  // ============================================
  // Data Fetching
  // ============================================

  const fetchFreelancers = useCallback(async (reset: boolean = false) => {
    if (isLoading) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Build query with optimized field selection
      const fields = selectFields('freelancers', ['list']);
      
      let query = supabase
        .from('freelancers')
        .select(fields, { count: 'exact' })
        .eq('status', 'active')
        .limit(PAGE_SIZE + 1); // +1 to check for more
      
      // Apply search filter
      if (searchTerm) {
        query = query.or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
      }
      
      // Apply skill filter
      if (skillFilter) {
        query = query.contains('skills', [skillFilter]);
      }
      
      // Apply cursor pagination
      if (!reset && cursor) {
        const decoded = decodeCursor(cursor);
        if (decoded) {
          query = query.lt('created_at', decoded.timestamp)
            .or(`created_at.eq.${decoded.timestamp},id.lt.${decoded.id}`);
        }
      }
      
      // Always sort by created_at DESC, then id for stable ordering
      query = query.order('created_at', { ascending: false })
        .order('id', { ascending: false });
      
      const { data, error: queryError, count } = await query;
      
      if (queryError) throw queryError;
      
      const result = toCursorPaginatedResult<Freelancer>(data || [], PAGE_SIZE);
      
      setFreelancers(prev => reset ? result.data : [...prev, ...result.data]);
      setCursor(result.nextCursor);
      setHasMore(result.hasMore);
      if (count !== null) setTotalCount(count);
      
    } catch (err) {
      console.error('Error fetching freelancers:', err);
      setError('Failed to load freelancers. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [cursor, searchTerm, skillFilter, isLoading]);

  // Debounced search
  const debouncedFetch = useRef(
    debounce((reset: boolean) => fetchFreelancers(reset), DEBOUNCE_DELAY)
  ).current;

  // Initial load
  useEffect(() => {
    if (activeTab === 'freelancers') {
      setFreelancers([]);
      setCursor(null);
      setHasMore(true);
      fetchFreelancers(true);
    }
  }, [activeTab, skillFilter]);

  // Search handling
  useEffect(() => {
    if (activeTab === 'freelancers') {
      setFreelancers([]);
      setCursor(null);
      setHasMore(true);
      debouncedFetch(true);
    }
  }, [searchTerm]);

  // Load more on scroll
  const handleScroll = useCallback((scrollTop: number, scrollHeight: number, clientHeight: number) => {
    const scrollBottom = scrollTop + clientHeight;
    const threshold = scrollHeight * 0.8; // Load more at 80% scroll
    
    if (scrollBottom >= threshold && hasMore && !isLoading) {
      fetchFreelancers();
    }
  }, [hasMore, isLoading, fetchFreelancers]);

  // Reset filters
  const handleReset = () => {
    setSearchTerm('');
    setSkillFilter('');
    setFreelancers([]);
    setCursor(null);
    setHasMore(true);
  };

  // ============================================
  // Render Helpers
  // ============================================

  const renderFreelancerItem = (item: Freelancer, index: number, style: React.CSSProperties) => (
    <FreelancerCard 
      key={item.id} 
      freelancer={item} 
      style={style}
      onClick={() => console.log('Clicked:', item.id)}
    />
  );

  const allSkills = ['React', 'TypeScript', 'Node.js', 'Python', 'AI/ML', 'UI/UX', 'Figma', 
    'Content Writing', 'SEO', 'Marketing', 'DevOps', 'AWS', 'Docker'];

  return (
    <div className="space-y-6">
      {/* Performance Debug (dev mode only) */}
      {import.meta.env.DEV && (
        <div className="text-xs text-[var(--text-muted)] bg-[var(--surface-hover)] p-2 rounded">
          Render count: {perfMetrics.updateCount} | 
          Avg render: {perfMetrics.averageRenderTime.toFixed(1)}ms | 
          Freelancers loaded: {freelancers.length}/{totalCount}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Total Workforce" value={stats.totalWorkforce} trend="up" trendValue="+24" icon={Users} />
        <StatCard label="Active Freelancers" value={stats.activeFreelancers} trend="up" trendValue="+12%" icon={Briefcase} />
        <StatCard label="Monthly Payroll" value={stats.monthlyPayroll} trend="up" trendValue="+8%" icon={IndianRupee} />
        <StatCard label="Avg Time to Bill" value={stats.avgTimeToBill} trend="down" trendValue="-0.5d" icon={Clock8} />
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
              <span className={`px-1.5 py-0.5 text-xs rounded ${
                activeTab === tab.id ? 'bg-white/20' : 'bg-[var(--surface-hover)]'
              }`}>
                {activeTab === tab.id && isLoading ? '...' : tab.count}
              </span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={handleReset}
            className="btn btn-ghost p-2"
            title="Reset filters"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button className="btn btn-secondary p-2">
            <Download className="w-4 h-4" />
          </button>
          <button className="btn btn-primary px-4 py-2 text-sm">
            <Plus className="w-4 h-4" />
            Add {activeTab === 'employees' ? 'Employee' : activeTab.slice(0, -1)}
          </button>
        </div>
      </div>

      {/* Freelancers Tab with Backend Pagination */}
      {activeTab === 'freelancers' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
              <input
                type="text"
                placeholder="Search freelancers by name, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--primary)] focus:outline-none w-full"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
              <select
                value={skillFilter}
                onChange={(e) => setSkillFilter(e.target.value)}
                className="pl-10 pr-8 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-sm text-[var(--text-primary)] min-w-[160px] appearance-none"
              >
                <option value="">All Skills</option>
                {allSkills.map(skill => (
                  <option key={skill} value={skill}>{skill}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Results info */}
          <div className="flex items-center justify-between text-sm text-[var(--text-muted)]">
            <span>
              {isLoading && freelancers.length === 0 ? 'Loading...' : 
                `${freelancers.length} of ${totalCount} freelancers loaded`}
            </span>
            {hasMore && (
              <span className="text-[var(--primary)]">
                Scroll to load more
              </span>
            )}
          </div>

          {/* Error State */}
          {error && (
            <div className="p-4 bg-[var(--error-light)] text-[var(--error)] rounded-lg text-center">
              {error}
              <button 
                onClick={() => fetchFreelancers(true)}
                className="ml-2 underline hover:no-underline"
              >
                Retry
              </button>
            </div>
          )}

          {/* Virtualized Freelancer Cards */}
          <div className="card overflow-hidden">
            {freelancers.length > 0 ? (
              <VirtualizedList
                items={freelancers}
                itemHeight={280}
                containerHeight={600}
                overscan={3}
                renderItem={renderFreelancerItem}
                onScroll={(scrollTop) => {
                  // Load more when near bottom
                  const container = document.querySelector('.virtualized-list');
                  if (container) {
                    handleScroll(scrollTop, container.scrollHeight, container.clientHeight);
                  }
                }}
              />
            ) : !isLoading ? (
              <div className="p-12 text-center text-[var(--text-muted)]">
                <Briefcase className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">No freelancers found</p>
                <p className="text-sm">Try adjusting your search or filters</p>
              </div>
            ) : null}
          </div>

          {/* Loading indicator */}
          {isLoading && freelancers.length > 0 && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-6 h-6 animate-spin text-[var(--primary)]" />
              <span className="ml-2 text-sm text-[var(--text-muted)]">Loading more...</span>
            </div>
          )}
        </div>
      )}

      {/* Other tabs placeholder */}
      {activeTab === 'employees' && (
        <div className="card p-12 text-center text-[var(--text-muted)]">
          <UserCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">Employee directory</p>
          <p className="text-sm mt-2">Backend pagination and virtualization ready</p>
        </div>
      )}

      {activeTab === 'contractors' && (
        <div className="card p-12 text-center text-[var(--text-muted)]">
          <Truck className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">Contractor management</p>
          <p className="text-sm mt-2">Backend pagination and virtualization ready</p>
        </div>
      )}

      {activeTab === 'vendors' && (
        <div className="card p-12 text-center text-[var(--text-muted)]">
          <Store className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">Vendor directory</p>
          <p className="text-sm mt-2">Backend pagination and virtualization ready</p>
        </div>
      )}
    </div>
  );
}

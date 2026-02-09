import { useEffect, useState } from 'react';
import {
  Users,
  Briefcase,
  FileText,
  DollarSign,
  Clock,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { db, supabase } from '../lib/supabase';
import type { DashboardStats, MonthlyRevenue, PipelineStage } from '../types';

const COLORS = ['#1e3a5f', '#3d7eb0', '#5a9bc8', '#8ab8d8', '#b3d0e6'];

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    totalInvoices: 0,
    totalContacts: 0,
    totalDeals: 0,
    activeFreelancers: 0,
    activeProjects: 0,
    pendingApprovals: 0,
    overdueInvoices: 0,
    monthlyRevenue: 0,
    revenueGrowth: 0,
  });
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState<MonthlyRevenue[]>([]);
  const [pipelineData, setPipelineData] = useState<PipelineStage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    try {
      setLoading(true);

      // Fetch all data in parallel
      const [
        { data: invoices },
        { data: contacts },
        { data: deals },
        { data: freelancers },
        { data: timesheets },
      ] = await Promise.all([
        db.invoices.getAll(),
        db.contacts.getAll(),
        db.deals.getByStage(''),
        db.freelancers.getAll(),
        db.timesheets.getPending(),
      ]);

      // Calculate stats
      const totalRevenue = invoices?.reduce((sum: number, inv: any) => sum + (inv.total_amount || 0), 0) || 0;
      const pendingTimesheets = timesheets?.length || 0;
      const overdueCount = invoices?.filter((inv: any) => inv.status === 'overdue').length || 0;
      const activeFreelancersCount = freelancers?.filter((f: any) => f.status === 'active').length || 0;
      const activeDealsCount = deals?.filter((d: any) => !['closed_won', 'closed_lost'].includes(d.stage)).length || 0;

      // Mock monthly revenue data (would come from aggregated queries)
      const mockMonthlyData = [
        { month: 'Jan', revenue: 450000, expenses: 320000 },
        { month: 'Feb', revenue: 520000, expenses: 350000 },
        { month: 'Mar', revenue: 480000, expenses: 310000 },
        { month: 'Apr', revenue: 610000, expenses: 380000 },
        { month: 'May', revenue: 580000, expenses: 360000 },
        { month: 'Jun', revenue: 720000, expenses: 420000 },
      ];

      // Calculate pipeline data
      const stageCounts: Record<string, { count: number; value: number }> = {};
      deals?.forEach((deal: any) => {
        if (!stageCounts[deal.stage]) {
          stageCounts[deal.stage] = { count: 0, value: 0 };
        }
        stageCounts[deal.stage].count++;
        stageCounts[deal.stage].value += deal.value || 0;
      });

      const pipelineStages = Object.entries(stageCounts).map(([stage, data]) => ({
        stage: stage.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
        count: data.count,
        value: data.value,
      }));

      setStats({
        totalRevenue,
        totalInvoices: invoices?.length || 0,
        totalContacts: contacts?.length || 0,
        totalDeals: deals?.length || 0,
        activeFreelancers: activeFreelancersCount,
        activeProjects: activeDealsCount,
        pendingApprovals: pendingTimesheets,
        overdueInvoices: overdueCount,
        monthlyRevenue: totalRevenue / 12,
        revenueGrowth: 12.5,
      });

      setMonthlyRevenue(mockMonthlyData);
      setPipelineData(pipelineStages);

      // Generate mock recent activities
      setRecentActivities([
        { id: '1', type: 'invoice', description: 'Invoice #INV-001 sent to ABC Corp', timestamp: '2 hours ago', user: 'System' },
        { id: '2', type: 'deal', description: 'New deal created: Web Development Project', timestamp: '4 hours ago', user: 'John Doe' },
        { id: '3', type: 'contact', description: 'Contact added: XYZ Solutions Ltd', timestamp: '6 hours ago', user: 'Jane Smith' },
        { id: '4', type: 'payment', description: 'Payment received: ₹2,50,000 from ABC Corp', timestamp: '1 day ago', user: 'System' },
        { id: '5', type: 'freelancer', description: 'Timesheet approved: Rahul Kumar', timestamp: '1 day ago', user: 'Manager' },
      ]);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-700"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400">Welcome back! Here's what's happening with your business.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Revenue"
          value={`₹${(stats.totalRevenue / 100000).toFixed(2)}L`}
          change={+12.5}
          icon={DollarSign}
          color="blue"
        />
        <StatCard
          title="Active Freelancers"
          value={stats.activeFreelancers.toString()}
          change={+8.2}
          icon={Users}
          color="green"
        />
        <StatCard
          title="Active Deals"
          value={stats.activeProjects.toString()}
          change={-2.4}
          icon={Briefcase}
          color="purple"
        />
        <StatCard
          title="Pending Approvals"
          value={stats.pendingApprovals.toString()}
          change={+15.3}
          icon={Clock}
          color="orange"
          alert={stats.pendingApprovals > 0}
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-4 flex items-center gap-4">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Invoices</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalInvoices}</p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-4">
          <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
            <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Contacts</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalContacts}</p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-4 border-red-100 dark:border-red-900/50">
          <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
            <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Overdue Invoices</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.overdueInvoices}</p>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Revenue Overview</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyRevenue}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1e3a5f" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#1e3a5f" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" tickFormatter={(val) => `₹${val / 1000}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                  formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, '']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#1e3a5f" fillOpacity={1} fill="url(#colorRevenue)" name="Revenue" />
                <Area type="monotone" dataKey="expenses" stroke="#ef4444" fillOpacity={1} fill="url(#colorExpenses)" name="Expenses" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pipeline Chart */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Sales Pipeline</h3>
          <div className="h-72">
            {pipelineData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pipelineData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis type="number" stroke="#6b7280" tickFormatter={(val) => `₹${val / 100000}L`} />
                  <YAxis type="category" dataKey="stage" stroke="#6b7280" width={100} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                    formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, 'Value']}
                  />
                  <Bar dataKey="value" fill="#1e3a5f" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                No deals in pipeline yet
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activities */}
        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activities</h3>
            <button className="text-sm text-primary-700 hover:text-primary-800">View All</button>
          </div>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <div className={`p-2 rounded-lg ${getActivityColor(activity.type)}`}>
                  <Activity className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 dark:text-white">{activity.description}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{activity.timestamp} • {activity.user}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full p-3 text-left rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-primary-700" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Create Invoice</p>
                  <p className="text-xs text-gray-500">Generate a new client invoice</p>
                </div>
              </div>
            </button>
            <button className="w-full p-3 text-left rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Add Contact</p>
                  <p className="text-xs text-gray-500">Add a new lead or customer</p>
                </div>
              </div>
            </button>
            <button className="w-full p-3 text-left rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Approve Timesheets</p>
                  <p className="text-xs text-gray-500">{stats.pendingApprovals} pending approvals</p>
                </div>
              </div>
            </button>
            <button className="w-full p-3 text-left rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Send Reminders</p>
                  <p className="text-xs text-gray-500">{stats.overdueInvoices} overdue invoices</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  change,
  icon: Icon,
  color,
  alert = false,
}: {
  title: string;
  value: string;
  change: number;
  icon: any;
  color: string;
  alert?: boolean;
}) {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    green: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
    purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
    orange: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
  };

  return (
    <div className={`card p-6 ${alert ? 'border-red-200 dark:border-red-800' : ''}`}>
      <div className="flex items-center justify-between">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div className={`flex items-center gap-1 text-sm ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {change >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
          <span>{Math.abs(change)}%</span>
        </div>
      </div>
      <div className="mt-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
        <p className={`text-2xl font-bold ${alert ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
          {value}
        </p>
      </div>
    </div>
  );
}

function getActivityColor(type: string): string {
  const colors: Record<string, string> = {
    invoice: 'bg-blue-100 text-blue-600',
    deal: 'bg-green-100 text-green-600',
    contact: 'bg-purple-100 text-purple-600',
    payment: 'bg-yellow-100 text-yellow-600',
    freelancer: 'bg-orange-100 text-orange-600',
  };
  return colors[type] || 'bg-gray-100 text-gray-600';
}

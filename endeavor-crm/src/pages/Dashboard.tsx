import { useEffect, useState } from 'react';
import { 
  Users, 
  Target, 
  Briefcase, 
  DollarSign, 
  CheckSquare, 
  AlertCircle,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { calculateDashboardStats, mockDeals, mockLeads, mockActivities } from '../data/mockData';
import type { DashboardStats } from '../types';

const COLORS = ['#1e3a5f', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe'];

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    setStats(calculateDashboardStats());
  }, []);

  const dealStageData = [
    { name: 'Pending', value: mockDeals.filter(d => d.status === 'pending').length },
    { name: 'In Progress', value: mockDeals.filter(d => d.status === 'in_progress').length },
    { name: 'Won', value: mockDeals.filter(d => d.status === 'won').length },
    { name: 'Lost', value: mockDeals.filter(d => d.status === 'lost').length },
  ];

  const leadSourceData = [
    { name: 'Website', value: mockLeads.filter(l => l.source === 'Website').length },
    { name: 'LinkedIn', value: mockLeads.filter(l => l.source === 'LinkedIn').length },
    { name: 'Referral', value: mockLeads.filter(l => l.source === 'Referral').length },
    { name: 'Conference', value: mockLeads.filter(l => l.source === 'Conference').length },
    { name: 'Cold Email', value: mockLeads.filter(l => l.source === 'Cold Email').length },
  ];

  const revenueData = [
    { month: 'Jan', revenue: 12000, target: 15000 },
    { month: 'Feb', revenue: 25000, target: 20000 },
    { month: 'Mar', revenue: 15000, target: 25000 },
    { month: 'Apr', revenue: 30000, target: 28000 },
    { month: 'May', revenue: 45000, target: 35000 },
    { month: 'Jun', revenue: 38000, target: 40000 },
  ];

  const statCards = [
    { 
      title: 'Total Contacts', 
      value: stats?.totalContacts || 0, 
      icon: Users, 
      trend: '+12%',
      trendUp: true,
      color: 'blue'
    },
    { 
      title: 'Active Leads', 
      value: stats?.totalLeads || 0, 
      icon: Target, 
      trend: '+5%',
      trendUp: true,
      color: 'green'
    },
    { 
      title: 'Active Deals', 
      value: stats?.activeDeals || 0, 
      icon: Briefcase, 
      trend: '+8%',
      trendUp: true,
      color: 'purple'
    },
    { 
      title: 'Total Revenue', 
      value: `$${(stats?.totalRevenue || 0).toLocaleString()}`, 
      icon: DollarSign, 
      trend: '+15%',
      trendUp: true,
      color: 'emerald'
    },
  ];

  if (!stats) return null;

  return (
    <div className="p-8 space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="card p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500">{card.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{card.value}</p>
                  <div className="flex items-center gap-1 mt-2">
                    {card.trendUp ? (
                      <TrendingUp className="w-4 h-4 text-green-500" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-500" />
                    )}
                    <span className={`text-sm ${card.trendUp ? 'text-green-600' : 'text-red-600'}`}>
                      {card.trend}
                    </span>
                    <span className="text-sm text-gray-400">vs last month</span>
                  </div>
                </div>
                <div className={`p-3 rounded-lg bg-${card.color}-50`}>
                  <Icon className={`w-6 h-6 text-${card.color}-600`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Overview</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="revenue" fill="#1e3a5f" radius={[4, 4, 0, 0]} />
                <Bar dataKey="target" fill="#bfdbfe" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Deal Stages */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Deal Pipeline</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dealStageData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {dealStageData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-4 justify-center mt-4">
            {dealStageData.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-sm text-gray-600">{entry.name} ({entry.value})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lead Sources */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Lead Sources</h3>
          <div className="space-y-4">
            {leadSourceData.map((source) => (
              <div key={source.name}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">{source.name}</span>
                  <span className="font-medium">{source.value}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div 
                    className="bg-primary-950 h-2 rounded-full transition-all"
                    style={{ width: `${(source.value / 3) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {mockActivities.slice(0, 5).map((activity) => (
              <div key={activity.id} className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  activity.type === 'call' ? 'bg-blue-100 text-blue-600' :
                  activity.type === 'email' ? 'bg-green-100 text-green-600' :
                  activity.type === 'meeting' ? 'bg-purple-100 text-purple-600' :
                  activity.type === 'note' ? 'bg-yellow-100 text-yellow-600' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {activity.type === 'call' && <span className="text-lg">📞</span>}
                  {activity.type === 'email' && <span className="text-lg">✉️</span>}
                  {activity.type === 'meeting' && <span className="text-lg">🤝</span>}
                  {activity.type === 'note' && <span className="text-lg">📝</span>}
                  {activity.type === 'task' && <span className="text-lg">✅</span>}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {activity.related_to ? `Related to: ${activity.related_to.name}` : 'General'}
                    {' • '}
                    {new Date(activity.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

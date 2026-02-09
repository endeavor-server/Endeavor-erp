import { useEffect, useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { TrendingUp, Users, DollarSign, Target, Calendar, Download } from 'lucide-react';
import { mockDeals, mockLeads, mockContacts, calculateDashboardStats } from '../data/mockData';

const COLORS = ['#1e3a5f', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe'];

export function Reports() {
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  // Revenue by month data
  const revenueByMonth = [
    { month: 'Jan', revenue: 45000, deals: 3 },
    { month: 'Feb', revenue: 52000, deals: 4 },
    { month: 'Mar', revenue: 38000, deals: 3 },
    { month: 'Apr', revenue: 61000, deals: 5 },
    { month: 'May', revenue: 58000, deals: 4 },
    { month: 'Jun', revenue: 72000, deals: 6 },
  ];

  // Conversion funnel data
  const funnelData = [
    { stage: 'Leads', count: mockLeads.length, percentage: 100 },
    { stage: 'Contacted', count: mockLeads.filter(l => ['contacted', 'qualified', 'proposal', 'negotiation', 'closed_won'].includes(l.status)).length, percentage: 80 },
    { stage: 'Qualified', count: mockLeads.filter(l => ['qualified', 'proposal', 'negotiation', 'closed_won'].includes(l.status)).length, percentage: 60 },
    { stage: 'Proposal', count: mockLeads.filter(l => ['proposal', 'negotiation', 'closed_won'].includes(l.status)).length, percentage: 40 },
    { stage: 'Won', count: mockDeals.filter(d => d.status === 'won').length, percentage: 20 },
  ];

  // Lead source breakdown
  const sourceData = [
    { name: 'Website', value: mockLeads.filter(l => l.source === 'Website').length },
    { name: 'LinkedIn', value: mockLeads.filter(l => l.source === 'LinkedIn').length },
    { name: 'Referral', value: mockLeads.filter(l => l.source === 'Referral').length },
    { name: 'Conference', value: mockLeads.filter(l => l.source === 'Conference').length },
    { name: 'Cold Email', value: mockLeads.filter(l => l.source === 'Cold Email').length },
  ].filter(d => d.value > 0);

  // Deal performance by status
  const dealStatusData = [
    { status: 'Pending', count: mockDeals.filter(d => d.status === 'pending').length, value: mockDeals.filter(d => d.status === 'pending').reduce((s, d) => s + d.value, 0) },
    { status: 'In Progress', count: mockDeals.filter(d => d.status === 'in_progress').length, value: mockDeals.filter(d => d.status === 'in_progress').reduce((s, d) => s + d.value, 0) },
    { status: 'Won', count: mockDeals.filter(d => d.status === 'won').length, value: mockDeals.filter(d => d.status === 'won').reduce((s, d) => s + d.value, 0) },
    { status: 'Lost', count: mockDeals.filter(d => d.status === 'lost').length, value: mockDeals.filter(d => d.status === 'lost').reduce((s, d) => s + d.value, 0) },
  ];

  // Top deals
  const topDeals = [...mockDeals]
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const stats = calculateDashboardStats();

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-500 mt-1">Comprehensive insights into your sales performance</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as any)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <button className="btn-secondary flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Revenue</p>
              <p className="text-3xl font-bold text-gray-900">${stats.totalRevenue.toLocaleString()}</p>
              <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                +15% vs last period
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Leads</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalLeads}</p>
              <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                +8% vs last period
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Conversion Rate</p>
              <p className="text-3xl font-bold text-gray-900">
                {Math.round((mockDeals.filter(d => d.status === 'won').length / mockLeads.length) * 100)}%
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Won / Total Leads
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Target className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Avg Deal Value</p>
              <p className="text-3xl font-bold text-gray-900">
                ${Math.round(mockDeals.reduce((s, d) => s + d.value, 0) / mockDeals.length).toLocaleString()}
              </p>
              <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                +5% vs last period
              </p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueByMonth}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1e3a5f" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#1e3a5f" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#1e3a5f" 
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Lead Sources */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Lead Sources</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sourceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {sourceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-4 justify-center mt-4">
            {sourceData.map((entry, index) => (
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

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Conversion Funnel */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Conversion Funnel</h3>
          <div className="space-y-4">
            {funnelData.map((stage, index) => (
              <div key={stage.stage} className="relative">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">{stage.stage}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500">{stage.count} leads</span>
                    <span className="text-sm font-medium text-primary-600">{stage.percentage}%</span>
                  </div>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-8 overflow-hidden">
                  <div 
                    className="bg-primary-950 h-full rounded-full flex items-center justify-end pr-3 transition-all duration-500"
                    style={{ width: `${stage.percentage}%` }}
                  >
                    <span className="text-white text-sm font-medium"></span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Deals */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Deals</h3>
          <div className="space-y-4">
            {topDeals.map((deal, index) => (
              <div key={deal.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center font-semibold text-primary-950">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{deal.title}</p>
                    <p className="text-sm text-gray-500">
                      {deal.lead?.contact?.first_name} {deal.lead?.contact?.last_name}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">${deal.value.toLocaleString()}</p>
                  <p className={`text-xs ${
                    deal.status === 'won' ? 'text-green-600' :
                    deal.status === 'in_progress' ? 'text-blue-600' :
                    'text-yellow-600'
                  }`}>
                    {deal.status.replace('_', ' ').toUpperCase()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Deal Status Breakdown */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Deal Status Breakdown</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Status</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Count</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Total Value</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">% of Pipeline</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {dealStatusData.map((row) => {
                const totalValue = mockDeals.reduce((s, d) => s + d.value, 0);
                return (
                  <tr key={row.status}>
                    <td className="px-6 py-4 font-medium text-gray-900">{row.status}</td>
                    <td className="px-6 py-4 text-gray-600">{row.count}</td>
                    <td className="px-6 py-4 text-gray-900">${row.value.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-primary-950 h-2 rounded-full"
                            style={{ width: `${(row.value / totalValue) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600">
                          {Math.round((row.value / totalValue) * 100)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

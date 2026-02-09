import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Briefcase,
  GitBranch,
  Truck,
  TrendingUp,
  Clock,
  Star,
  DollarSign,
} from 'lucide-react';
import { db } from '../../lib/supabase';

const workforceCards = [
  {
    title: 'Employees',
    description: 'Manage full-time employees, payroll, and benefits',
    icon: Users,
    color: 'bg-blue-500',
    href: '/workforce/employees',
    count: 0,
    key: 'employees',
  },
  {
    title: 'Contractors',
    description: 'Fixed-term contractors and milestone tracking',
    icon: Briefcase,
    color: 'bg-green-500',
    href: '/workforce/contractors',
    count: 0,
    key: 'contractors',
  },
  {
    title: 'Freelancers',
    description: '600+ freelancers marketplace with skill tracking',
    icon: GitBranch,
    color: 'bg-purple-500',
    href: '/workforce/freelancers',
    count: 0,
    key: 'freelancers',
  },
  {
    title: 'Vendors',
    description: 'Suppliers, service providers, and PO management',
    icon: Truck,
    color: 'bg-orange-500',
    href: '/workforce/vendors',
    count: 0,
    key: 'vendors',
  },
];

export default function WorkforceHub() {
  const [stats, setStats] = useState({
    employees: 0,
    contractors: 0,
    freelancers: 0,
    vendors: 0,
    activeFreelancers: 0,
    pendingTimesheets: 0,
    totalMonthlyCost: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWorkforceStats();
  }, []);

  async function loadWorkforceStats() {
    try {
      const [
        { data: employees },
        { data: contractors },
        { data: freelancers },
        { data: vendors },
        { data: pendingTimesheets },
      ] = await Promise.all([
        db.employees.getAll(),
        db.contractors.getAll(),
        db.freelancers.getAll(),
        db.vendors.getAll(),
        db.timesheets.getPending(),
      ]);

      const activeFreelancers = freelancers?.filter((f: any) => f.status === 'active').length || 0;

      setStats({
        employees: employees?.length || 0,
        contractors: contractors?.length || 0,
        freelancers: freelancers?.length || 0,
        vendors: vendors?.length || 0,
        activeFreelancers,
        pendingTimesheets: pendingTimesheets?.length || 0,
        totalMonthlyCost: 1250000, // Mock data
      });
    } catch (error) {
      console.error('Error loading workforce stats:', error);
    } finally {
      setLoading(false);
    }
  }

  const updatedCards = workforceCards.map((card) => ({
    ...card,
    count: stats[card.key as keyof typeof stats] || 0,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Workforce Hub</h1>
        <p className="text-gray-500 dark:text-gray-400">Manage your 900+ workforce across all categories</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200">
          <div className="flex items-center gap-3">
            <Users className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Workforce</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.employees + stats.contractors + stats.freelancers + stats.vendors}
              </p>
            </div>
          </div>
        </div>
        <div className="card p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200">
          <div className="flex items-center gap-3">
            <Star className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active Freelancers</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.activeFreelancers}</p>
            </div>
          </div>
        </div>
        <div className="card p-4 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200">
          <div className="flex items-center gap-3">
            <Clock className="h-8 w-8 text-orange-600" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Pending Timesheets</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pendingTimesheets}</p>
            </div>
          </div>
        </div>
        <div className="card p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200">
          <div className="flex items-center gap-3">
            <DollarSign className="h-8 w-8 text-purple-600" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Monthly Cost</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">₹{(stats.totalMonthlyCost / 100000).toFixed(1)}L</p>
            </div>
          </div>
        </div>
      </div>

      {/* Workforce Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {updatedCards.map((card) => (
          <Link
            key={card.title}
            to={card.href}
            className="card p-6 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-start justify-between">
              <div className={`p-3 rounded-lg ${card.color} bg-opacity-10 group-hover:bg-opacity-20 transition-colors`}>
                <card.icon className={`h-6 w-6 ${card.color.replace('bg-', 'text-')}`} />
              </div>
              <span className="text-3xl font-bold text-gray-900 dark:text-white">{card.count}</span>
            </div>
            <div className="mt-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{card.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{card.description}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <button className="btn-primary">
            <Users className="h-4 w-4 mr-2" />
            Add Employee
          </button>
          <button className="btn-primary">
            <GitBranch className="h-4 w-4 mr-2" />
            Onboard Freelancer
          </button>
          <button className="btn-secondary">
            <Briefcase className="h-4 w-4 mr-2" />
            Add Contractor
          </button>
          <button className="btn-secondary">
            <Truck className="h-4 w-4 mr-2" />
            Add Vendor
          </button>
        </div>
      </div>
    </div>
  );
}

import { Link } from 'react-router-dom';
import { Calculator, FileText, Receipt, TrendingUp, IndianRupee, FileSpreadsheet } from 'lucide-react';

const accountingModules = [
  {
    title: 'GST Compliance',
    description: 'GSTR-1, GSTR-3B preparation and filing',
    icon: FileText,
    color: 'bg-blue-500',
    href: '/accounting/gst',
  },
  {
    title: 'TDS Management',
    description: 'Track TDS deductions and generate Form 16A',
    icon: Receipt,
    color: 'bg-green-500',
    href: '/accounting/tds',
  },
  {
    title: 'Expenses',
    description: 'Employee reimbursements and expense tracking',
    icon: IndianRupee,
    color: 'bg-orange-500',
    href: '/accounting/expenses',
  },
];

export default function Accounting() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Accounting</h1>
        <p className="text-gray-500 dark:text-gray-400">GST, TDS, and financial management</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {accountingModules.map((module) => (
          <Link
            key={module.title}
            to={module.href}
            className="card p-6 hover:shadow-md transition-shadow"
          >
            <div className={`p-3 rounded-lg ${module.color} bg-opacity-10 inline-block`}>
              <module.icon className={`h-6 w-6 ${module.color.replace('bg-', 'text-')}`} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-4">{module.title}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{module.description}</p>
          </Link>
        ))}
      </div>

      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Stats</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-sm text-gray-500">Monthly GST Collected</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">₹2,85,400</p>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-sm text-gray-500">TDS Deducted (This Month)</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">₹45,200</p>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-sm text-gray-500">Pending Expense Claims</p>
            <p className="text-xl font-bold text-yellow-600">12</p>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-sm text-gray-500">Next GSTR-1 Due</p>
            <p className="text-xl font-bold text-blue-600">11th Feb</p>
          </div>
        </div>
      </div>
    </div>
  );
}

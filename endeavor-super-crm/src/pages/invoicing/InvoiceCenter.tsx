import { Link } from 'react-router-dom';
import {
  FileText,
  Users,
  GitBranch,
  Truck,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

const invoiceTypes = [
  {
    title: 'Client Invoices',
    description: 'GST-compliant invoices for customers with CGST/SGST or IGST',
    icon: FileText,
    color: 'bg-blue-500',
    href: '/invoices/clients',
    count: 0,
  },
  {
    title: 'Freelancer Invoices',
    description: 'Payment vouchers with TDS calculation for freelancers',
    icon: Users,
    color: 'bg-green-500',
    href: '/invoices/freelancers',
    count: 0,
  },
  {
    title: 'Contractor Invoices',
    description: 'Milestone and retention-based contractor payments',
    icon: GitBranch,
    color: 'bg-purple-500',
    href: '/invoices/contractors',
    count: 0,
  },
  {
    title: 'Vendor Invoices',
    description: '3-way matched invoices with PO and GRN verification',
    icon: Truck,
    color: 'bg-orange-500',
    href: '/invoices/vendors',
    count: 0,
  },
];

export default function InvoiceCenter() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Invoice Center</h1>
        <p className="text-gray-500 dark:text-gray-400">Manage all invoice types with GST compliance</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200">
          <div className="flex items-center gap-3">
            <FileText className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Invoices</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">0</p>
            </div>
          </div>
        </div>
        <div className="card p-4 bg-green-50 dark:bg-green-900/20 border-green-200">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Paid</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">0</p>
            </div>
          </div>
        </div>
        <div className="card p-4 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200">
          <div className="flex items-center gap-3">
            <Clock className="h-8 w-8 text-yellow-600" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">0</p>
            </div>
          </div>
        </div>
        <div className="card p-4 bg-red-50 dark:bg-red-900/20 border-red-200">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-8 w-8 text-red-600" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Overdue</p>
              <p className="text-2xl font-bold text-red-600">0</p>
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Types Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {invoiceTypes.map((type) => (
          <Link
            key={type.title}
            to={type.href}
            className="card p-6 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-start justify-between">
              <div className={`p-3 rounded-lg ${type.color} bg-opacity-10 group-hover:bg-opacity-20 transition-colors`}>
                <type.icon className={`h-6 w-6 ${type.color.replace('bg-', 'text-')}`} />
              </div>
              <span className="text-3xl font-bold text-gray-900 dark:text-white">{type.count}</span>
            </div>
            <div className="mt-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{type.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{type.description}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* GST Compliance Info */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">GST Compliance Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Auto GST Calculation</h4>
            <p className="text-sm text-gray-500">Automatic CGST/SGST or IGST based on place of supply</p>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">HSN Codes</h4>
            <p className="text-sm text-gray-500">Proper HSN/SAC code management for all services</p>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">GSTR-1 Export</h4>
            <p className="text-sm text-gray-500">Export invoice data for GSTR-1 filing</p>
          </div>
        </div>
      </div>
    </div>
  );
}

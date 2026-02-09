import { useState } from 'react';
import { FileText, Download, Upload, Calendar, CheckCircle, AlertCircle } from 'lucide-react';

const GST_RETURNS = [
  { type: 'GSTR-1', description: 'Monthly return of outward supplies', frequency: 'Monthly', dueDate: '11th of next month' },
  { type: 'GSTR-3B', description: 'Summary return', frequency: 'Monthly', dueDate: '20th of next month' },
  { type: 'GSTR-9', description: 'Annual return', frequency: 'Annual', dueDate: '31st December' },
];

export default function GSTCompliance() {
  const [selectedPeriod, setSelectedPeriod] = useState('2024-01');

  const mockGSTData = {
    totalTaxable: 2500000,
    cgst: 225000,
    sgst: 225000,
    igst: 150000,
    totalGST: 600000,
    b2bCount: 12,
    b2cCount: 45,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">GST Compliance</h1>
          <p className="text-gray-500 dark:text-gray-400">Manage GST returns and compliance</p>
        </div>
        <select
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
          className="input w-auto"
        >
          <option value="2024-01">January 2024</option>
          <option value="2024-02">February 2024</option>
          <option value="2024-03">March 2024</option>
          <option value="2024-04">April 2024</option>
          <option value="2024-05">May 2024</option>
          <option value="2024-06">June 2024</option>
        </select>
      </div>

      {/* GST Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-4 bg-blue-50 border-blue-200">
          <p className="text-sm text-gray-600">Total Taxable Value</p>
          <p className="text-xl font-bold text-gray-900">₹{(mockGSTData.totalTaxable / 100000).toFixed(2)}L</p>
        </div>
        <div className="card p-4 bg-green-50 border-green-200">
          <p className="text-sm text-gray-600">CGST</p>
          <p className="text-xl font-bold text-green-700">₹{(mockGSTData.cgst / 1000).toFixed(0)}k</p>
        </div>
        <div className="card p-4 bg-green-50 border-green-200">
          <p className="text-sm text-gray-600">SGST</p>
          <p className="text-xl font-bold text-green-700">₹{(mockGSTData.sgst / 1000).toFixed(0)}k</p>
        </div>
        <div className="card p-4 bg-purple-50 border-purple-200">
          <p className="text-sm text-gray-600">IGST</p>
          <p className="text-xl font-bold text-purple-700">₹{(mockGSTData.igst / 1000).toFixed(0)}k</p>
        </div>
      </div>

      {/* GST Returns Table */}
      <div className="card overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">GST Returns</h3>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Return Type</th>
              <th>Description</th>
              <th>Frequency</th>
              <th>Due Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {GST_RETURNS.map((ret) => (
              <tr key={ret.type}>
                <td className="font-medium">{ret.type}</td>
                <td className="text-gray-500">{ret.description}</td>
                <td>{ret.frequency}</td>
                <td>{ret.dueDate}</td>
                <td>
                  <span className="badge badge-yellow">Pending</span>
                </td>
                <td>
                  <div className="flex gap-2">
                    <button className="btn-secondary text-sm py-1">
                      <Download className="h-3 w-3 mr-1" />
                      JSON
                    </button>
                    <button className="btn-primary text-sm py-1">
                      Prepare
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* GST Settings */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Company GST Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">GSTIN</label>
            <input type="text" value="27AABCE1234A1Z5" className="input" readOnly />
          </div>
          <div>
            <label className="label">Company Name (as per GST)</label>
            <input type="text" value="Endeavor Academy Pvt Ltd" className="input" readOnly />
          </div>
          <div>
            <label className="label">State</label>
            <input type="text" value="Maharashtra" className="input" readOnly />
          </div>
          <div>
            <label className="label">State Code</label>
            <input type="text" value="27" className="input" readOnly />
          </div>
        </div>
      </div>
    </div>
  );
}

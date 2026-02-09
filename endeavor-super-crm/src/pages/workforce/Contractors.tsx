import { useState, useEffect } from 'react';
import { Plus, Search, Briefcase, Calendar, DollarSign, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { db } from '../../lib/supabase';
import type { Contractor } from '../../types';

export default function Contractors() {
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadContractors();
  }, []);

  async function loadContractors() {
    try {
      setLoading(true);
      const { data, error } = await db.contractors.getAll();
      if (error) throw error;
      setContractors(data || []);
    } catch (error) {
      console.error('Error loading contractors:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredContractors = contractors.filter((c) =>
    searchQuery === '' ||
    c.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.contractor_code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Contractors</h1>
          <p className="text-gray-500 dark:text-gray-400">Fixed-term contractors and milestone tracking</p>
        </div>
        <button className="btn-primary">
          <Plus className="h-4 w-4 mr-2" />
          Add Contractor
        </button>
      </div>

      <div className="card p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search contractors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-10 w-full md:w-96"
          />
        </div>
      </div>

      <div className="card overflow-hidden">
        <table className="data-table">
          <thead>
            <tr>
              <th>Contractor Code</th>
              <th>Name</th>
              <th>Company</th>
              <th>Contract Value</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {loading ? (
              <tr>
                <td colSpan={8} className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-700 mx-auto"></div>
                </td>
              </tr>
            ) : filteredContractors.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-8 text-gray-500">
                  No contractors found.
                </td>
              </tr>
            ) : (
              filteredContractors.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="font-medium">{c.contractor_code}</td>
                  <td className="text-gray-900 dark:text-white">{c.first_name} {c.last_name}</td>
                  <td className="text-gray-500">{c.company_name || '-'}</td>
                  <td className="font-medium">₹{c.contract_value?.toLocaleString('en-IN') || 0}</td>
                  <td className="text-gray-500">{new Date(c.contract_start_date).toLocaleDateString('en-IN')}</td>
                  <td className="text-gray-500">{c.contract_end_date ? new Date(c.contract_end_date).toLocaleDateString('en-IN') : '-'}</td>
                  <td>
                    <span className={`badge ${c.status === 'active' ? 'badge-green' : c.status === 'completed' ? 'badge-blue' : 'badge-gray'}`}>
                      {c.status}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <button className="p-1 text-gray-400 hover:text-gray-600">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="p-1 text-gray-400 hover:text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

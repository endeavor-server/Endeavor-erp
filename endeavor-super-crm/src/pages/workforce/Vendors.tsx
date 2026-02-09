import { useState, useEffect } from 'react';
import { Plus, Search, Truck, Star, DollarSign, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { db } from '../../lib/supabase';
import type { Vendor } from '../../types';

export default function Vendors() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadVendors();
  }, []);

  async function loadVendors() {
    try {
      setLoading(true);
      const { data, error } = await db.vendors.getAll();
      if (error) throw error;
      setVendors(data || []);
    } catch (error) {
      console.error('Error loading vendors:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredVendors = vendors.filter((v) =>
    searchQuery === '' ||
    v.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.vendor_code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Vendors</h1>
          <p className="text-gray-500 dark:text-gray-400">Manage suppliers, service providers, and POs</p>
        </div>
        <button className="btn-primary">
          <Plus className="h-4 w-4 mr-2" />
          Add Vendor
        </button>
      </div>

      <div className="card p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search vendors..."
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
              <th>Vendor Code</th>
              <th>Company Name</th>
              <th>Contact Person</th>
              <th>GST Number</th>
              <th>Type</th>
              <th>Rating</th>
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
            ) : filteredVendors.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-8 text-gray-500">
                  No vendors found.
                </td>
              </tr>
            ) : (
              filteredVendors.map((v) => (
                <tr key={v.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="font-medium">{v.vendor_code}</td>
                  <td className="text-gray-900 dark:text-white">{v.company_name}</td>
                  <td className="text-gray-500">{v.contact_person || '-'}</td>
                  <td className="text-gray-500 font-mono text-sm">{v.gst_number || '-'}</td>
                  <td className="text-gray-500 capitalize">{v.vendor_type || 'supplier'}</td>
                  <td>
                    {v.performance_rating ? (
                      <span className="flex items-center text-yellow-500">
                        <Star className="h-4 w-4 mr-1 fill-current" />
                        {v.performance_rating}
                      </span>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td>
                    <span className={`badge ${v.status === 'active' ? 'badge-green' : v.status === 'inactive' ? 'badge-yellow' : 'badge-red'}`}>
                      {v.status}
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

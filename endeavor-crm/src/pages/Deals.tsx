import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, X, Calendar, DollarSign, Target, Briefcase, User } from 'lucide-react';
import { mockDeals, STORAGE_KEYS } from '../data/mockData';
import type { Deal } from '../types';

interface DealFormData {
  title: string;
  lead_id: string;
  value: string;
  status: 'pending' | 'in_progress' | 'won' | 'lost';
  probability: string;
  expected_close_date: string;
  notes: string;
}

const initialFormData: DealFormData = {
  title: '',
  lead_id: '',
  value: '',
  status: 'pending',
  probability: '25',
  expected_close_date: '',
  notes: '',
};

const statusOptions = [
  { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'in_progress', label: 'In Progress', color: 'bg-blue-100 text-blue-800' },
  { value: 'won', label: 'Won', color: 'bg-green-100 text-green-800' },
  { value: 'lost', label: 'Lost', color: 'bg-red-100 text-red-800' },
];

export function Deals() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
  const [formData, setFormData] = useState<DealFormData>(initialFormData);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.deals);
    if (stored) {
      setDeals(JSON.parse(stored));
    } else {
      setDeals(mockDeals);
      localStorage.setItem(STORAGE_KEYS.deals, JSON.stringify(mockDeals));
    }
  }, []);

  const filteredDeals = deals.filter(deal => {
    const matchesSearch = deal.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || deal.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalValue = filteredDeals.reduce((sum, d) => sum + (d.value || 0), 0);
  const weightedValue = filteredDeals.reduce((sum, d) => sum + (d.value * (d.probability || 0) / 100), 0);

  const handleSave = () => {
    if (editingDeal) {
      const updated = deals.map(d => 
        d.id === editingDeal.id 
          ? { 
              ...d, 
              ...formData, 
              value: parseFloat(formData.value) || 0,
              probability: parseInt(formData.probability) || 0,
              updated_at: new Date().toISOString()
            }
          : d
      );
      setDeals(updated);
      localStorage.setItem(STORAGE_KEYS.deals, JSON.stringify(updated));
    } else {
      const newDeal: Deal = {
        id: Date.now().toString(),
        lead_id: formData.lead_id,
        title: formData.title,
        value: parseFloat(formData.value) || 0,
        status: formData.status,
        probability: parseInt(formData.probability) || 0,
        expected_close_date: formData.expected_close_date,
        notes: formData.notes,
        assigned_to: 'User',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      const updated = [newDeal, ...deals];
      setDeals(updated);
      localStorage.setItem(STORAGE_KEYS.deals, JSON.stringify(updated));
    }
    closeModal();
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this deal?')) {
      const updated = deals.filter(d => d.id !== id);
      setDeals(updated);
      localStorage.setItem(STORAGE_KEYS.deals, JSON.stringify(updated));
    }
  };

  const openModal = (deal?: Deal) => {
    if (deal) {
      setEditingDeal(deal);
      setFormData({
        title: deal.title,
        lead_id: deal.lead_id,
        value: deal.value.toString(),
        status: deal.status,
        probability: deal.probability.toString(),
        expected_close_date: deal.expected_close_date,
        notes: deal.notes || '',
      });
    } else {
      setEditingDeal(null);
      setFormData(initialFormData);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingDeal(null);
    setFormData(initialFormData);
  };

  const getStatusColor = (status: string) => {
    const option = statusOptions.find(o => o.value === status);
    return option?.color || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="p-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Deal Value</p>
              <p className="text-2xl font-bold text-gray-900">${totalValue.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-primary-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-primary-950" />
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Weighted Value</p>
              <p className="text-2xl font-bold text-gray-900">${Math.round(weightedValue).toLocaleString()}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Deals</p>
              <p className="text-2xl font-bold text-gray-900">
                {deals.filter(d => d.status === 'in_progress' || d.status === 'pending').length}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Briefcase className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex gap-4 flex-1 w-full sm:w-auto">
          <div className="relative flex-1 max-w-md">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search deals..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 w-full"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="won">Won</option>
            <option value="lost">Lost</option>
          </select>
        </div>
        <button 
          onClick={() => openModal()}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Deal
        </button>
      </div>

      {/* Deals List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredDeals.map((deal) => {
          const contact = deal.lead?.contact;
          return (
            <div key={deal.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900">{deal.title}</h3>
                  {contact && (
                    <p className="text-sm text-gray-500 mt-1">
                      {contact.first_name} {contact.last_name} • {contact.company}
                    </p>
                  )}
                </div>
                <div className="flex gap-1">
                  <button 
                    onClick={() => openModal(deal)}
                    className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(deal.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Value</p>
                    <p className="font-medium text-gray-900">${deal.value.toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Expected Close</p>
                    <p className="font-medium text-gray-900">
                      {new Date(deal.expected_close_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(deal.status)}`}>
                  {statusOptions.find(o => o.value === deal.status)?.label}
                </span>
                
                {/* Probability Bar */}
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500">{deal.probability}%</span>
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all ${
                        deal.probability >= 75 ? 'bg-green-500' :
                        deal.probability >= 50 ? 'bg-blue-500' :
                        deal.probability >= 25 ? 'bg-yellow-500' : 'bg-gray-400'
                      }`}
                      style={{ width: `${deal.probability}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredDeals.length === 0 && (
        <div className="text-center py-12">
          <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No deals found</p>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingDeal ? 'Edit Deal' : 'Add New Deal'}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deal Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="input-field"
                  placeholder="Enterprise Package for TechCorp"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Value ($)</label>
                  <input
                    type="number"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    className="input-field"
                    placeholder="50000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Probability (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.probability}
                    onChange={(e) => setFormData({ ...formData, probability: e.target.value })}
                    className="input-field"
                    placeholder="50"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="input-field"
                  >
                    {statusOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expected Close</label>
                  <input
                    type="date"
                    value={formData.expected_close_date}
                    onChange={(e) => setFormData({ ...formData, expected_close_date: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="input-field h-24 resize-none"
                  placeholder="Add deal notes..."
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
              <button onClick={closeModal} className="btn-secondary">Cancel</button>
              <button onClick={handleSave} className="btn-primary">
                {editingDeal ? 'Save Changes' : 'Create Deal'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  DollarSign,
  Calendar,
  User,
  TrendingUp,
  CheckCircle,
  XCircle,
  ChevronRight,
} from 'lucide-react';
import { db } from '../../lib/supabase';
import type { Deal, Contact } from '../../types';

const PIPELINE_STAGES = [
  { id: 'new', name: 'New', color: 'bg-gray-200', textColor: 'text-gray-700' },
  { id: 'contacted', name: 'Contacted', color: 'bg-blue-100', textColor: 'text-blue-700' },
  { id: 'qualified', name: 'Qualified', color: 'bg-purple-100', textColor: 'text-purple-700' },
  { id: 'proposal', name: 'Proposal', color: 'bg-yellow-100', textColor: 'text-yellow-700' },
  { id: 'negotiation', name: 'Negotiation', color: 'bg-orange-100', textColor: 'text-orange-700' },
  { id: 'closed_won', name: 'Won', color: 'bg-green-100', textColor: 'text-green-700' },
  { id: 'closed_lost', name: 'Lost', color: 'bg-red-100', textColor: 'text-red-700' },
];

export default function Deals() {
  const [deals, setDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'pipeline' | 'list'>('pipeline');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<any>(null);

  useEffect(() => {
    loadDeals();
  }, []);

  async function loadDeals() {
    try {
      setLoading(true);
      const { data, error } = await db.deals.getAll();
      if (error) throw error;
      setDeals(data || []);
    } catch (error) {
      console.error('Error loading deals:', error);
    } finally {
      setLoading(false);
    }
  }

  const pipelineData = PIPELINE_STAGES.map((stage) => ({
    ...stage,
    deals: deals.filter((d) => d.stage === stage.id),
    totalValue: deals
      .filter((d) => d.stage === stage.id)
      .reduce((sum, d) => sum + (d.value || 0), 0),
  }));

  async function updateDealStage(dealId: string, newStage: string) {
    try {
      await db.deals.update(dealId, { stage: newStage });
      loadDeals();
    } catch (error) {
      console.error('Error updating deal:', error);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Deals Pipeline</h1>
          <p className="text-gray-500 dark:text-gray-400">Track your sales opportunities</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('pipeline')}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                viewMode === 'pipeline'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              Pipeline
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              List
            </button>
          </div>
          <button onClick={() => setShowAddModal(true)} className="btn-primary">
            <Plus className="h-4 w-4 mr-2" />
            Add Deal
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Pipeline Value</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            ₹{(deals.reduce((sum, d) => sum + (d.value || 0), 0) / 100000).toFixed(1)}L
          </p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Active Deals</p>
          <p className="text-2xl font-bold text-primary-700">
            {deals.filter((d) => !['closed_won', 'closed_lost'].includes(d.stage)).length}
          </p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Won</p>
          <p className="text-2xl font-bold text-green-600">
            {deals.filter((d) => d.stage === 'closed_won').length}
          </p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Win Rate</p>
          <p className="text-2xl font-bold text-purple-600">
            {deals.length > 0
              ? Math.round(
                  (deals.filter((d) => d.stage === 'closed_won').length /
                    deals.filter((d) => ['closed_won', 'closed_lost'].includes(d.stage)).length || 1) *
                    100
                )
              : 0}
            %
          </p>
        </div>
      </div>

      {/* Pipeline View */}
      {viewMode === 'pipeline' ? (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {pipelineData.map((stage) => (
            <div key={stage.id} className="flex-shrink-0 w-72">
              <div className={`${stage.color} rounded-lg p-3`}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className={`font-semibold ${stage.textColor}`}>{stage.name}</h3>
                  <span className={`text-sm ${stage.textColor}`}>{stage.deals.length}</span>
                </div>
                <p className={`text-sm ${stage.textColor} opacity-75`}>
                  ₹{(stage.totalValue / 100000).toFixed(1)}L
                </p>
              </div>
              <div className="mt-3 space-y-3">
                {stage.deals.map((deal: any) => (
                  <div
                    key={deal.id}
                    className="card p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setSelectedDeal(deal)}
                  >
                    <h4 className="font-medium text-gray-900 dark:text-white">{deal.deal_name}</h4>
                    {deal.contacts && (
                      <p className="text-sm text-gray-500 mt-1">
                        {deal.contacts.company_name || `${deal.contacts.first_name} ${deal.contacts.last_name}`}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-3">
                      <span className="font-semibold text-primary-700">
                        ₹{(deal.value / 100000).toFixed(1)}L
                      </span>
                      <span className="text-xs text-gray-500">{deal.probability}% probability</span>
                    </div>
                    {deal.expected_close_date && (
                      <p className="text-xs text-gray-400 mt-2">
                        Expected close: {new Date(deal.expected_close_date).toLocaleDateString('en-IN')}
                      </p>
                    )}
                  </div>
                ))}
                {stage.deals.length === 0 && (
                  <div className="text-center py-8 text-gray-400 text-sm">
                    No deals in this stage
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="data-table">
            <thead>
              <tr>
                <th>Deal Name</th>
                <th>Contact</th>
                <th>Stage</th>
                <th>Value</th>
                <th>Probability</th>
                <th>Expected Close</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {deals.map((deal) => (
                <tr
                  key={deal.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                  onClick={() => setSelectedDeal(deal)}
                >
                  <td className="font-medium text-gray-900 dark:text-white">{deal.deal_name}</td>
                  <td className="text-gray-500">
                    {deal.contacts?.company_name || `${deal.contacts?.first_name} ${deal.contacts?.last_name}`}
                  </td>
                  <td>
                    <span className="badge badge-blue">
                      {PIPELINE_STAGES.find((s) => s.id === deal.stage)?.name}
                    </span>
                  </td>
                  <td className="font-medium">₹{(deal.value / 100000).toFixed(1)}L</td>
                  <td>{deal.probability}%</td>
                  <td className="text-gray-500">
                    {deal.expected_close_date
                      ? new Date(deal.expected_close_date).toLocaleDateString('en-IN')
                      : '-'}
                  </td>
                  <td>
                    <select
                      value={deal.stage}
                      onChange={(e) => {
                        e.stopPropagation();
                        updateDealStage(deal.id, e.target.value);
                      }}
                      className="input text-sm py-1"
                    >
                      {PIPELINE_STAGES.map((s) => (
                        <option key={s.id} value={s.id}>
                          Move to {s.name}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Deal Modal */}
      {showAddModal && (
        <AddDealModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            loadDeals();
          }}
        />
      )}

      {/* Deal Detail Modal */}
      {selectedDeal && (
        <DealDetailModal
          deal={selectedDeal}
          onClose={() => setSelectedDeal(null)}
          onUpdate={() => {
            setSelectedDeal(null);
            loadDeals();
          }}
        />
      )}
    </div>
  );
}

function AddDealModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState<Partial<Deal>>({
    deal_name: '',
    contact_id: '',
    value: 0,
    stage: 'new',
    probability: 20,
    expected_close_date: '',
    priority: 'medium',
  });
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadContacts();
  }, []);

  async function loadContacts() {
    const { data } = await db.contacts.getAll();
    setContacts(data || []);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      setSaving(true);
      await db.deals.create(formData);
      onSuccess();
    } catch (error) {
      console.error('Error creating deal:', error);
      alert('Failed to create deal');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-gray-900/50" onClick={onClose} />
        <div className="relative bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-lg w-full p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Add New Deal</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Deal Name *</label>
              <input
                required
                type="text"
                value={formData.deal_name}
                onChange={(e) => setFormData({ ...formData, deal_name: e.target.value })}
                className="input"
              />
            </div>
            <div>
              <label className="label">Contact *</label>
              <select
                required
                value={formData.contact_id}
                onChange={(e) => setFormData({ ...formData, contact_id: e.target.value })}
                className="input"
              >
                <option value="">Select contact...</option>
                {contacts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.company_name || `${c.first_name} ${c.last_name}`}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Value (₹)</label>
                <input
                  type="number"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
                  className="input"
                />
              </div>
              <div>
                <label className="label">Probability (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.probability}
                  onChange={(e) => setFormData({ ...formData, probability: Number(e.target.value) })}
                  className="input"
                />
              </div>
            </div>
            <div>
              <label className="label">Expected Close Date</label>
              <input
                type="date"
                value={formData.expected_close_date}
                onChange={(e) => setFormData({ ...formData, expected_close_date: e.target.value })}
                className="input"
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button type="button" onClick={onClose} className="btn-secondary">
                Cancel
              </button>
              <button type="submit" disabled={saving} className="btn-primary">
                {saving ? 'Saving...' : 'Create Deal'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function DealDetailModal({
  deal,
  onClose,
  onUpdate,
}: {
  deal: any;
  onClose: () => void;
  onUpdate: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-gray-900/50" onClick={onClose} />
        <div className="relative bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-2xl w-full p-6">
          <div className="flex items-start justify-between pb-4 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{deal.deal_name}</h2>
              <p className="text-gray-500">{deal.contacts?.company_name}</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              ✕
            </button>
          </div>
          <div className="py-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-500">Value</p>
                <p className="text-xl font-bold text-primary-700">₹{(deal.value / 100000).toFixed(1)}L</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-500">Probability</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{deal.probability}%</p>
              </div>
            </div>
            <div>
              <label className="label">Update Stage</label>
              <div className="flex flex-wrap gap-2">
                {PIPELINE_STAGES.map((stage) => (
                  <button
                    key={stage.id}
                    onClick={() => {
                      db.deals.update(deal.id, { stage: stage.id });
                      onUpdate();
                    }}
                    className={`px-3 py-1 rounded-full text-sm ${
                      deal.stage === stage.id
                        ? `${stage.color} ${stage.textColor}`
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {stage.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button className="btn-secondary">Create Invoice</button>
            <button className="btn-primary">Edit Deal</button>
          </div>
        </div>
      </div>
    </div>
  );
}

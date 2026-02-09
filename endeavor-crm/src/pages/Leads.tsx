import { useState, useEffect } from 'react';
import { Plus, Search, Filter, MoreVertical, DollarSign, Calendar, User, X, Edit2, Trash2 } from 'lucide-react';
import { mockLeads, mockContacts, STORAGE_KEYS } from '../data/mockData';
import type { Lead, Contact } from '../types';

type LeadStatus = 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';

const columns: { id: LeadStatus; label: string; color: string }[] = [
  { id: 'new', label: 'New', color: 'bg-gray-100' },
  { id: 'contacted', label: 'Contacted', color: 'bg-blue-100' },
  { id: 'qualified', label: 'Qualified', color: 'bg-yellow-100' },
  { id: 'proposal', label: 'Proposal', color: 'bg-purple-100' },
  { id: 'negotiation', label: 'Negotiation', color: 'bg-orange-100' },
  { id: 'closed_won', label: 'Closed Won', color: 'bg-green-100' },
  { id: 'closed_lost', label: 'Closed Lost', color: 'bg-red-100' },
];

interface LeadFormData {
  contact_id: string;
  status: LeadStatus;
  priority: 'low' | 'medium' | 'high';
  value: string;
  source: string;
  expected_close_date: string;
  notes: string;
}

const initialFormData: LeadFormData = {
  contact_id: '',
  status: 'new',
  priority: 'medium',
  value: '',
  source: '',
  expected_close_date: '',
  notes: '',
};

export function Leads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [formData, setFormData] = useState<LeadFormData>(initialFormData);

  useEffect(() => {
    const storedLeads = localStorage.getItem(STORAGE_KEYS.leads);
    const storedContacts = localStorage.getItem(STORAGE_KEYS.contacts);
    
    if (storedLeads) {
      setLeads(JSON.parse(storedLeads));
    } else {
      setLeads(mockLeads);
      localStorage.setItem(STORAGE_KEYS.leads, JSON.stringify(mockLeads));
    }
    
    if (storedContacts) {
      setContacts(JSON.parse(storedContacts));
    } else {
      setContacts(mockContacts);
    }
  }, []);

  const getContact = (contactId: string) => contacts.find(c => c.id === contactId);

  const filteredLeads = leads.filter(lead => {
    const contact = getContact(lead.contact_id);
    const matchesSearch = 
      contact?.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact?.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact?.company?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const handleStatusChange = (leadId: string, newStatus: LeadStatus) => {
    const updated = leads.map(l => 
      l.id === leadId 
        ? { ...l, status: newStatus, updated_at: new Date().toISOString() }
        : l
    );
    setLeads(updated);
    localStorage.setItem(STORAGE_KEYS.leads, JSON.stringify(updated));
  };

  const handleSave = () => {
    if (editingLead) {
      const updated = leads.map(l => 
        l.id === editingLead.id 
          ? { 
              ...l, 
              ...formData, 
              value: parseFloat(formData.value) || 0,
              updated_at: new Date().toISOString() 
            }
          : l
      );
      setLeads(updated);
      localStorage.setItem(STORAGE_KEYS.leads, JSON.stringify(updated));
    } else {
      const newLead: Lead = {
        id: Date.now().toString(),
        contact_id: formData.contact_id,
        status: formData.status,
        priority: formData.priority,
        value: parseFloat(formData.value) || 0,
        source: formData.source,
        expected_close_date: formData.expected_close_date,
        notes: formData.notes,
        assigned_to: 'User',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      const updated = [newLead, ...leads];
      setLeads(updated);
      localStorage.setItem(STORAGE_KEYS.leads, JSON.stringify(updated));
    }
    closeModal();
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this lead?')) {
      const updated = leads.filter(l => l.id !== id);
      setLeads(updated);
      localStorage.setItem(STORAGE_KEYS.leads, JSON.stringify(updated));
    }
  };

  const openModal = (lead?: Lead) => {
    if (lead) {
      setEditingLead(lead);
      setFormData({
        contact_id: lead.contact_id,
        status: lead.status,
        priority: lead.priority,
        value: lead.value?.toString() || '',
        source: lead.source,
        expected_close_date: lead.expected_close_date || '',
        notes: lead.notes || '',
      });
    } else {
      setEditingLead(null);
      setFormData(initialFormData);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingLead(null);
    setFormData(initialFormData);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex gap-4 flex-1 w-full sm:w-auto">
          <div className="relative flex-1 max-w-md">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search leads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 w-full"
            />
          </div>
        </div>
        <div className="flex gap-3">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'kanban' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
              }`}
            >
              Kanban
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
              }`}
            >
              List
            </button>
          </div>
          <button 
            onClick={() => openModal()}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Lead
          </button>
        </div>
      </div>

      {viewMode === 'kanban' ? (
        /* Kanban View */
        <div className="flex gap-4 overflow-x-auto pb-4">
          {columns.map(column => {
            const columnLeads = filteredLeads.filter(l => l.status === column.id);
            return (
              <div key={column.id} className="min-w-[300px] w-[300px] flex-shrink-0">
                <div className={`${column.color} rounded-t-lg px-4 py-3 flex items-center justify-between`}>
                  <span className="font-semibold text-gray-700">{column.label}</span>
                  <span className="bg-white px-2 py-0.5 rounded-full text-sm font-medium text-gray-600">
                    {columnLeads.length}
                  </span>
                </div>
                <div className="bg-gray-100 rounded-b-lg p-3 space-y-3 min-h-[400px]">
                  {columnLeads.map(lead => {
                    const contact = getContact(lead.contact_id);
                    return (
                      <div key={lead.id} className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                              <span className="text-primary-950 text-sm font-semibold">
                                {contact?.first_name[0]}{contact?.last_name[0]}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 text-sm">
                                {contact?.first_name} {contact?.last_name}
                              </p>
                              <p className="text-xs text-gray-500">{contact?.company}</p>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <button 
                              onClick={() => openModal(lead)}
                              className="p-1 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button 
                              onClick={() => handleDelete(lead.id)}
                              className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          {lead.value > 0 && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <DollarSign className="w-4 h-4" />
                              <span>${lead.value.toLocaleString()}</span>
                            </div>
                          )}
                          {lead.expected_close_date && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Calendar className="w-4 h-4" />
                              <span>{new Date(lead.expected_close_date).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>
                        {lead.priority && (
                          <span className={`inline-block mt-3 px-2 py-1 rounded text-xs font-medium ${getPriorityColor(lead.priority)}`}>
                            {lead.priority}
                          </span>
                        )}
                        {/* Status changer */}
                        <select
                          value={lead.status}
                          onChange={(e) => handleStatusChange(lead.id, e.target.value as LeadStatus)}
                          className="mt-3 w-full text-xs border border-gray-200 rounded px-2 py-1"
                        >
                          {columns.map(col => (
                            <option key={col.id} value={col.id}>{col.label}</option>
                          ))}
                        </select>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Contact</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Status</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Priority</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Value</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Expected Close</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Source</th>
                  <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredLeads.map((lead) => {
                  const contact = getContact(lead.contact_id);
                  const column = columns.find(c => c.id === lead.status);
                  return (
                    <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                            <span className="text-primary-950 font-semibold">
                              {contact?.first_name[0]}{contact?.last_name[0]}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{contact?.first_name} {contact?.last_name}</p>
                            <p className="text-sm text-gray-500">{contact?.company}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${column?.color.replace('bg-', 'bg-opacity-50 bg-')}`}>
                          {column?.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(lead.priority)}`}>
                          {lead.priority.charAt(0).toUpperCase() + lead.priority.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {lead.value ? `$${lead.value.toLocaleString()}` : '-'}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {lead.expected_close_date 
                          ? new Date(lead.expected_close_date).toLocaleDateString() 
                          : '-'}
                      </td>
                      <td className="px-6 py-4 text-gray-600">{lead.source}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => openModal(lead)}
                            className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(lead.id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingLead ? 'Edit Lead' : 'Add New Lead'}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact</label>
                <select
                  value={formData.contact_id}
                  onChange={(e) => setFormData({ ...formData, contact_id: e.target.value })}
                  className="input-field"
                >
                  <option value="">Select Contact</option>
                  {contacts.map(contact => (
                    <option key={contact.id} value={contact.id}>
                      {contact.first_name} {contact.last_name} - {contact.company}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as LeadStatus })}
                    className="input-field"
                  >
                    {columns.map(col => (
                      <option key={col.id} value={col.id}>{col.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                    className="input-field"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Value ($)</label>
                  <input
                    type="number"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    className="input-field"
                    placeholder="25000"
                  />
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
                <select
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                  className="input-field"
                >
                  <option value="">Select Source</option>
                  <option value="Website">Website</option>
                  <option value="LinkedIn">LinkedIn</option>
                  <option value="Referral">Referral</option>
                  <option value="Conference">Conference</option>
                  <option value="Cold Email">Cold Email</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="input-field h-24 resize-none"
                  placeholder="Add notes..."
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
              <button onClick={closeModal} className="btn-secondary">Cancel</button>
              <button onClick={handleSave} className="btn-primary">
                {editingLead ? 'Save Changes' : 'Create Lead'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

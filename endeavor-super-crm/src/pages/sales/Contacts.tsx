import { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Filter,
  Mail,
  Phone,
  Building2,
  MapPin,
  Edit,
  Trash2,
  MoreHorizontal,
  User,
  Briefcase,
  Tag,
} from 'lucide-react';
import { db } from '../../lib/supabase';
import type { Contact } from '../../types';

const STATUS_OPTIONS = [
  { value: 'new', label: 'New', color: 'badge-gray' },
  { value: 'contacted', label: 'Contacted', color: 'badge-blue' },
  { value: 'qualified', label: 'Qualified', color: 'badge-purple' },
  { value: 'proposal', label: 'Proposal', color: 'badge-yellow' },
  { value: 'negotiation', label: 'Negotiation', color: 'badge-orange' },
  { value: 'closed_won', label: 'Won', color: 'badge-green' },
  { value: 'closed_lost', label: 'Lost', color: 'badge-red' },
];

const TYPE_OPTIONS = [
  { value: 'lead', label: 'Lead' },
  { value: 'prospect', label: 'Prospect' },
  { value: 'customer', label: 'Customer' },
  { value: 'partner', label: 'Partner' },
];

export default function Contacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  useEffect(() => {
    loadContacts();
  }, []);

  async function loadContacts() {
    try {
      setLoading(true);
      const { data, error } = await db.contacts.getAll();
      if (error) throw error;
      setContacts(data || []);
    } catch (error) {
      console.error('Error loading contacts:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredContacts = contacts.filter((contact) => {
    const matchesSearch =
      searchQuery === '' ||
      contact.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.company_name?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || contact.status === statusFilter;
    const matchesType = typeFilter === 'all' || contact.contact_type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  async function handleDelete(contactId: string) {
    if (!confirm('Are you sure you want to delete this contact?')) return;
    try {
      await db.contacts.delete(contactId);
      loadContacts();
    } catch (error) {
      console.error('Error deleting contact:', error);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Contacts & Leads</h1>
          <p className="text-gray-500 dark:text-gray-400">Manage your customers, leads, and prospects</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="btn-primary">
          <Plus className="h-4 w-4 mr-2" />
          Add Contact
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {TYPE_OPTIONS.map((type) => (
          <div key={type.value} className="card p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">{type.label}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {contacts.filter((c) => c.contact_type === type.value).length}
            </p>
          </div>
        ))}
        <div className="card p-4 bg-primary-50 dark:bg-primary-900/20">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
          <p className="text-2xl font-bold text-primary-700">{contacts.length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search contacts by name, email, company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-10"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="input md:w-40"
          >
            <option value="all">All Types</option>
            {TYPE_OPTIONS.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input md:w-40"
          >
            <option value="all">All Status</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Contacts Table */}
      <div className="card overflow-hidden">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Company</th>
                <th>Type</th>
                <th>Status</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-700 mx-auto"></div>
                  </td>
                </tr>
              ) : filteredContacts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-500">
                    No contacts found. Add your first contact!
                  </td>
                </tr>
              ) : (
                filteredContacts.map((contact) => (
                  <tr
                    key={contact.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                    onClick={() => setSelectedContact(contact)}
                  >
                    <td>
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mr-3">
                          <span className="text-sm font-medium text-primary-700 dark:text-primary-400">
                            {contact.first_name[0]}{contact.last_name[0]}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {contact.first_name} {contact.last_name}
                          </div>
                          {contact.job_title && (
                            <div className="text-xs text-gray-500">{contact.job_title}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="text-gray-500">{contact.company_name || '-'}</td>
                    <td>
                      <span className="badge badge-blue capitalize">{contact.contact_type}</span>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          STATUS_OPTIONS.find((s) => s.value === contact.status)?.color || 'badge-gray'
                        }`}
                      >
                        {STATUS_OPTIONS.find((s) => s.value === contact.status)?.label || contact.status}
                      </span>
                    </td>
                    <td className="text-gray-500">{contact.email || '-'}</td>
                    <td className="text-gray-500">{contact.phone || '-'}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(`mailto:${contact.email}`);
                          }}
                          className="p-1 text-gray-400 hover:text-gray-600"
                        >
                          <Mail className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(contact.id);
                          }}
                          className="p-1 text-gray-400 hover:text-red-600"
                        >
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

      {/* Add Contact Modal */}
      {showAddModal && (
        <AddContactModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            loadContacts();
          }}
        />
      )}

      {/* Contact Detail Modal */}
      {selectedContact && (
        <ContactDetailModal
          contact={selectedContact}
          onClose={() => setSelectedContact(null)}
          onUpdate={() => {
            setSelectedContact(null);
            loadContacts();
          }}
        />
      )}
    </div>
  );
}

function AddContactModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState<Partial<Contact>>({
    contact_type: 'lead',
    status: 'new',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    company_name: '',
    job_title: '',
    industry: '',
    city: '',
    state: '',
    gst_number: '',
  });
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      setSaving(true);
      await db.contacts.create(formData);
      onSuccess();
    } catch (error) {
      console.error('Error creating contact:', error);
      alert('Failed to create contact. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-gray-900/50" onClick={onClose} />
        <div className="relative bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Add New Contact</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Type</label>
                  <select
                    value={formData.contact_type}
                    onChange={(e) => setFormData({ ...formData, contact_type: e.target.value as any })}
                    className="input"
                  >
                    {TYPE_OPTIONS.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="input"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">First Name *</label>
                  <input
                    required
                    type="text"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Last Name *</label>
                  <input
                    required
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    className="input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Company</label>
                  <input
                    type="text"
                    value={formData.company_name}
                    onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Job Title</label>
                  <input
                    type="text"
                    value={formData.job_title}
                    onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                    className="input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">State</label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="input"
                  />
                </div>
              </div>

              <div>
                <label className="label">GST Number</label>
                <input
                  type="text"
                  value={formData.gst_number}
                  onChange={(e) => setFormData({ ...formData, gst_number: e.target.value })}
                  className="input"
                  placeholder="27AABCU9603R1ZX"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={onClose} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="btn-primary">
                  {saving ? 'Saving...' : 'Create Contact'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

function ContactDetailModal({
  contact,
  onClose,
  onUpdate,
}: {
  contact: Contact;
  onClose: () => void;
  onUpdate: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-gray-900/50" onClick={onClose} />
        <div className="relative bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-start justify-between pb-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary-700 dark:text-primary-400">
                    {contact.first_name[0]}{contact.last_name[0]}
                  </span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {contact.first_name} {contact.last_name}
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="badge badge-blue capitalize">{contact.contact_type}</span>
                    <span
                      className={`badge ${
                        STATUS_OPTIONS.find((s) => s.value === contact.status)?.color || 'badge-gray'
                      }`}
                    >
                      {STATUS_OPTIONS.find((s) => s.value === contact.status)?.label}
                    </span>
                  </div>
                </div>
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>

            <div className="py-6 space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Contact Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span>{contact.email || 'Not provided'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span>{contact.phone || 'Not provided'}</span>
                  </div>
                </div>
              </div>

              {contact.company_name && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Company</h3>
                  <p className="text-gray-700 dark:text-gray-300">{contact.company_name}</p>
                  {contact.job_title && <p className="text-sm text-gray-500">{contact.job_title}</p>}
                </div>
              )}

              {(contact.city || contact.state) && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Location</h3>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span>
                      {contact.city}
                      {contact.city && contact.state ? ', ' : ''}
                      {contact.state}
                    </span>
                  </div>
                </div>
              )}

              {contact.gst_number && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">GST</h3>
                  <p className="text-gray-700 dark:text-gray-300 font-mono">{contact.gst_number}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button className="btn-secondary">Create Deal</button>
              <button className="btn-secondary">Send Email</button>
              <button className="btn-primary">
                <Edit className="h-4 w-4 mr-2" />
                Edit Contact
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Filter,
  Star,
  Clock,
  Briefcase,
  DollarSign,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  Mail,
  Phone,
  MapPin,
  Edit,
  Trash2,
  FileText,
  ExternalLink,
} from 'lucide-react';
import { db } from '../../lib/supabase';
import type { Freelancer } from '../../types';
import { format } from 'date-fns';

const SKILL_OPTIONS = [
  'E-Learning Development',
  'Instructional Design',
  'Content Writing',
  'Graphic Design',
  'Video Production',
  'Animation',
  'Voice Over',
  'Project Management',
  'Quality Assurance',
  'Translation',
  'Technical Writing',
  'LMS Administration',
  'Adobe Captivate',
  'Articulate Storyline',
  'Camtasia',
  'After Effects',
  'Illustrator',
  'Photoshop',
  'HTML/CSS',
  'JavaScript',
  'React',
  'Python',
];

export default function Freelancers() {
  const [freelancers, setFreelancers] = useState<Freelancer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [availabilityFilter, setAvailabilityFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedFreelancer, setSelectedFreelancer] = useState<Freelancer | null>(null);

  useEffect(() => {
    loadFreelancers();
  }, []);

  async function loadFreelancers() {
    try {
      setLoading(true);
      const { data, error } = await db.freelancers.getAll();
      if (error) throw error;
      setFreelancers(data || []);
    } catch (error) {
      console.error('Error loading freelancers:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredFreelancers = freelancers.filter((freelancer) => {
    const matchesSearch =
      searchQuery === '' ||
      freelancer.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      freelancer.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      freelancer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      freelancer.skills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesSkills =
      selectedSkills.length === 0 ||
      selectedSkills.some((skill) => freelancer.skills.includes(skill));

    const matchesAvailability =
      availabilityFilter === 'all' || freelancer.availability === availabilityFilter;

    return matchesSearch && matchesSkills && matchesAvailability;
  });

  const skillOptions = Array.from(new Set(freelancers.flatMap((f) => f.skills)));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Freelancers</h1>
          <p className="text-gray-500 dark:text-gray-400">Manage your 600+ freelancer workforce</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary"
        >
          <Plus className="h-4 w-4 mr-2" />
          Onboard Freelancer
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Freelancers</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{freelancers.length}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Available</p>
          <p className="text-2xl font-bold text-green-600">{freelancers.filter((f) => f.availability === 'available').length}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Busy</p>
          <p className="text-2xl font-bold text-orange-600">{freelancers.filter((f) => f.availability === 'busy').length}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Avg Rating</p>
          <p className="text-2xl font-bold text-primary-700">
            {(freelancers.reduce((sum, f) => sum + f.rating, 0) / (freelancers.length || 1)).toFixed(1)} ★
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search freelancers by name, email, or skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-10"
            />
          </div>
          <select
            value={availabilityFilter}
            onChange={(e) => setAvailabilityFilter(e.target.value)}
            className="input md:w-48"
          >
            <option value="all">All Availability</option>
            <option value="available">Available</option>
            <option value="busy">Busy</option>
            <option value="unavailable">Unavailable</option>
          </select>
        </div>

        {/* Skills Filter */}
        <div className="mt-4">
          <p className="text-sm text-gray-500 mb-2">Filter by Skills:</p>
          <div className="flex flex-wrap gap-2">
            {SKILL_OPTIONS.slice(0, 10).map((skill) => (
              <button
                key={skill}
                onClick={() =>
                  setSelectedSkills((prev) =>
                    prev.includes(skill)
                      ? prev.filter((s) => s !== skill)
                      : [...prev, skill]
                  )
                }
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  selectedSkills.includes(skill)
                    ? 'bg-primary-700 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'
                }`}
              >
                {skill}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Freelancers Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-700"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFreelancers.map((freelancer) => (
            <div
              key={freelancer.id}
              className="card p-5 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setSelectedFreelancer(freelancer)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                    <span className="text-lg font-bold text-primary-700 dark:text-primary-400">
                      {freelancer.first_name[0]}{freelancer.last_name[0]}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {freelancer.first_name} {freelancer.last_name}
                    </h3>
                    <p className="text-sm text-gray-500">{freelancer.email}</p>
                  </div>
                </div>
                <span
                  className={`badge ${
                    freelancer.availability === 'available'
                      ? 'badge-green'
                      : freelancer.availability === 'busy'
                      ? 'badge-orange'
                      : 'badge-gray'
                  }`}
                >
                  {freelancer.availability}
                </span>
              </div>

              {/* Skills */}
              <div className="mt-4 flex flex-wrap gap-1">
                {freelancer.skills.slice(0, 3).map((skill) => (
                  <span
                    key={skill}
                    className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs rounded"
                  >
                    {skill}
                  </span>
                ))}
                {freelancer.skills.length > 3 && (
                  <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs rounded">
                    +{freelancer.skills.length - 3}
                  </span>
                )}
              </div>

              {/* Stats */}
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-xs text-gray-500">Rating</p>
                  <p className="font-semibold text-yellow-600">{freelancer.rating} ★</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Projects</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{freelancer.total_projects}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Rate/hr</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    ₹{freelancer.hourly_rate || 0}
                  </p>
                </div>
              </div>

              {/* Onboarding Status */}
              <div className="mt-4 flex items-center gap-2 text-sm">
                {freelancer.nda_signed ? (
                  <span className="flex items-center text-green-600">
                    <CheckCircle className="h-4 w-4 mr-1" /> NDA
                  </span>
                ) : (
                  <span className="flex items-center text-red-600">
                    <XCircle className="h-4 w-4 mr-1" /> NDA
                  </span>
                )}
                {freelancer.contract_signed ? (
                  <span className="flex items-center text-green-600">
                    <CheckCircle className="h-4 w-4 mr-1" /> Contract
                  </span>
                ) : (
                  <span className="flex items-center text-red-600">
                    <XCircle className="h-4 w-4 mr-1" /> Contract
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Freelancer Modal */}
      {showAddModal && (
        <AddFreelancerModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            loadFreelancers();
          }}
        />
      )}

      {/* Freelancer Detail Modal */}
      {selectedFreelancer && (
        <FreelancerDetailModal
          freelancer={selectedFreelancer}
          onClose={() => setSelectedFreelancer(null)}
          onUpdate={() => {
            setSelectedFreelancer(null);
            loadFreelancers();
          }}
        />
      )}
    </div>
  );
}

function AddFreelancerModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState<Partial<Freelancer>>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    skills: [],
    hourly_rate: 0,
    availability: 'available',
    city: '',
    state: '',
  });
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      setSaving(true);
      const code = `FL-${Date.now().toString().slice(-6)}`;
      await db.freelancers.create({
        ...formData,
        freelancer_code: code,
        skills: formData.skills || [],
      });
      onSuccess();
    } catch (error) {
      console.error('Error creating freelancer:', error);
      alert('Failed to create freelancer. Please try again.');
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
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Onboard New Freelancer</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">First Name</label>
                  <input
                    required
                    type="text"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Last Name</label>
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
                    required
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

              <div>
                <label className="label">Skills</label>
                <select
                  multiple
                  value={formData.skills}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      skills: Array.from(e.target.selectedOptions, (o) => o.value),
                    })
                  }
                  className="input h-32"
                >
                  {SKILL_OPTIONS.map((skill) => (
                    <option key={skill} value={skill}>
                      {skill}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple</p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="label">Hourly Rate</label>
                  <input
                    type="number"
                    value={formData.hourly_rate}
                    onChange={(e) => setFormData({ ...formData, hourly_rate: Number(e.target.value) })}
                    className="input"
                  />
                </div>
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

              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={onClose} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="btn-primary">
                  {saving ? 'Saving...' : 'Create Freelancer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

function FreelancerDetailModal({
  freelancer,
  onClose,
  onUpdate,
}: {
  freelancer: Freelancer;
  onClose: () => void;
  onUpdate: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-gray-900/50" onClick={onClose} />
        <div className="relative bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary-700 dark:text-primary-400">
                    {freelancer.first_name[0]}{freelancer.last_name[0]}
                  </span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {freelancer.first_name} {freelancer.last_name}
                  </h2>
                  <p className="text-gray-500">{freelancer.freelancer_code}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    <span className="text-sm">{freelancer.rating} / 5.0</span>
                    <span className="text-gray-300">|</span>
                    <span
                      className={`badge ${
                        freelancer.availability === 'available'
                          ? 'badge-green'
                          : freelancer.availability === 'busy'
                          ? 'badge-orange'
                          : 'badge-gray'
                      }`}
                    >
                      {freelancer.availability}
                    </span>
                  </div>
                </div>
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="py-6 space-y-6">
              {/* Contact Info */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Contact Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span>{freelancer.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span>{freelancer.phone || 'Not provided'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span>{freelancer.city || 'Not provided'}, {freelancer.state || 'Not provided'}</span>
                  </div>
                </div>
              </div>

              {/* Skills */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {freelancer.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Rates & Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm text-gray-500">Hourly Rate</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">₹{freelancer.hourly_rate || 0}</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm text-gray-500">Total Projects</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{freelancer.total_projects}</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm text-gray-500">Total Hours</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{freelancer.total_hours}</p>
                </div>
              </div>

              {/* Documents Status */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Documents & Compliance</h3>
                <div className="flex gap-4">
                  <div
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                      freelancer.nda_signed ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                    }`}
                  >
                    {freelancer.nda_signed ? <CheckCircle className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                    <span>NDA {freelancer.nda_signed ? 'Signed' : 'Pending'}</span>
                  </div>
                  <div
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                      freelancer.contract_signed ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                    }`}
                  >
                    {freelancer.contract_signed ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <XCircle className="h-5 w-5" />
                    )}
                    <span>Contract {freelancer.contract_signed ? 'Signed' : 'Pending'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button className="btn-secondary">
                <Clock className="h-4 w-4 mr-2" />
                View Timesheets
              </button>
              <button className="btn-secondary">
                <FileText className="h-4 w-4 mr-2" />
                Create Invoice
              </button>
              <button className="btn-primary">
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, X, CheckCircle2, Circle, Clock, AlertCircle, Calendar } from 'lucide-react';
import { mockTasks, STORAGE_KEYS } from '../data/mockData';
import type { Task } from '../types';

interface TaskFormData {
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  due_date: string;
}

const initialFormData: TaskFormData = {
  title: '',
  description: '',
  status: 'pending',
  priority: 'medium',
  due_date: '',
};

const statusOptions = [
  { value: 'pending', label: 'Pending', icon: Circle },
  { value: 'in_progress', label: 'In Progress', icon: Clock },
  { value: 'completed', label: 'Completed', icon: CheckCircle2 },
  { value: 'cancelled', label: 'Cancelled', icon: AlertCircle },
];

export function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [formData, setFormData] = useState<TaskFormData>(initialFormData);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.tasks);
    if (stored) {
      setTasks(JSON.parse(stored));
    } else {
      setTasks(mockTasks);
      localStorage.setItem(STORAGE_KEYS.tasks, JSON.stringify(mockTasks));
    }
  }, []);

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingTasks = tasks.filter(t => t.status === 'pending').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const overdueTasks = tasks.filter(t => 
    t.status !== 'completed' && 
    t.status !== 'cancelled' &&
    t.due_date &&
    new Date(t.due_date) < new Date()
  ).length;

  const handleStatusToggle = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      const newStatus = task.status === 'completed' ? 'pending' : 'completed';
      const updated = tasks.map(t => 
        t.id === taskId 
          ? { ...t, status: newStatus, updated_at: new Date().toISOString() }
          : t
      );
      setTasks(updated);
      localStorage.setItem(STORAGE_KEYS.tasks, JSON.stringify(updated));
    }
  };

  const handleSave = () => {
    if (editingTask) {
      const updated = tasks.map(t => 
        t.id === editingTask.id 
          ? { 
              ...t, 
              ...formData,
              due_date: formData.due_date ? new Date(formData.due_date).toISOString() : undefined,
              updated_at: new Date().toISOString()
            }
          : t
      );
      setTasks(updated);
      localStorage.setItem(STORAGE_KEYS.tasks, JSON.stringify(updated));
    } else {
      const newTask: Task = {
        id: Date.now().toString(),
        title: formData.title,
        description: formData.description,
        status: formData.status,
        priority: formData.priority,
        due_date: formData.due_date ? new Date(formData.due_date).toISOString() : undefined,
        assigned_to: 'User',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      const updated = [newTask, ...tasks];
      setTasks(updated);
      localStorage.setItem(STORAGE_KEYS.tasks, JSON.stringify(updated));
    }
    closeModal();
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      const updated = tasks.filter(t => t.id !== id);
      setTasks(updated);
      localStorage.setItem(STORAGE_KEYS.tasks, JSON.stringify(updated));
    }
  };

  const openModal = (task?: Task) => {
    if (task) {
      setEditingTask(task);
      setFormData({
        title: task.title,
        description: task.description || '',
        status: task.status,
        priority: task.priority,
        due_date: task.due_date ? new Date(task.due_date).toISOString().split('T')[0] : '',
      });
    } else {
      setEditingTask(null);
      setFormData(initialFormData);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
    setFormData(initialFormData);
  };

  const isOverdue = (task: Task) => {
    return task.status !== 'completed' && 
           task.status !== 'cancelled' &&
           task.due_date &&
           new Date(task.due_date) < new Date();
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="p-8">
      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="card p-4">
          <p className="text-sm text-gray-500">Pending</p>
          <p className="text-2xl font-bold text-gray-900">{pendingTasks}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-500">In Progress</p>
          <p className="text-2xl font-bold text-blue-600">{inProgressTasks}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-500">Completed</p>
          <p className="text-2xl font-bold text-green-600">{completedTasks}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-500">Overdue</p>
          <p className="text-2xl font-bold text-red-600">{overdueTasks}</p>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex gap-4 flex-1 w-full sm:w-auto">
          <div className="relative flex-1 max-w-md">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search tasks..."
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
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <button 
          onClick={() => openModal()}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Task
        </button>
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        {filteredTasks.map((task) => {
          const StatusIcon = statusOptions.find(o => o.value === task.status)?.icon || Circle;
          const overdue = isOverdue(task);
          
          return (
            <div 
              key={task.id} 
              className={`card p-4 flex items-start gap-4 hover:shadow-md transition-shadow ${
                task.status === 'completed' ? 'opacity-60' : ''
              } ${overdue ? 'border-red-200 bg-red-50/50' : ''}`}
            >
              <button 
                onClick={() => handleStatusToggle(task.id)}
                className={`mt-1 transition-colors ${
                  task.status === 'completed' ? 'text-green-500' : 'text-gray-400 hover:text-primary-500'
                }`}
              >
                {task.status === 'completed' ? (
                  <CheckCircle2 className="w-6 h-6" />
                ) : (
                  <Circle className="w-6 h-6" />
                )}
              </button>
              
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className={`font-medium ${task.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                      {task.title}
                    </h3>
                    {task.description && (
                      <p className="text-sm text-gray-500 mt-1">{task.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                    <button 
                      onClick={() => openModal(task)}
                      className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(task.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center gap-1.5 text-sm">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className={overdue ? 'text-red-600 font-medium' : 'text-gray-500'}>
                      {task.due_date 
                        ? new Date(task.due_date).toLocaleDateString() 
                        : 'No due date'}
                      {overdue && ' (Overdue)'}
                    </span>
                  </div>
                  <span className={`flex items-center gap-1 text-sm ${
                    task.status === 'completed' ? 'text-green-600' :
                    task.status === 'in_progress' ? 'text-blue-600' :
                    task.status === 'cancelled' ? 'text-gray-500' :
                    'text-yellow-600'
                  }`}>
                    <StatusIcon className="w-4 h-4" />
                    {statusOptions.find(o => o.value === task.status)?.label}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredTasks.length === 0 && (
        <div className="text-center py-12">
          <CheckCircle2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No tasks found</p>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingTask ? 'Edit Task' : 'Add New Task'}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="input-field"
                  placeholder="Follow up with client"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-field h-24 resize-none"
                  placeholder="Add task details..."
                />
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                <input
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  className="input-field"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
              <button onClick={closeModal} className="btn-secondary">Cancel</button>
              <button onClick={handleSave} className="btn-primary">
                {editingTask ? 'Save Changes' : 'Create Task'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

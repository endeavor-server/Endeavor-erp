export interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  company?: string;
  position?: string;
  status: 'active' | 'inactive' | 'lead';
  source?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Lead {
  id: string;
  contact_id: string;
  contact?: Contact;
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';
  priority: 'low' | 'medium' | 'high';
  value?: number;
  source: string;
  assigned_to?: string;
  expected_close_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Deal {
  id: string;
  lead_id: string;
  lead?: Lead;
  title: string;
  value: number;
  status: 'pending' | 'in_progress' | 'won' | 'lost';
  probability: number;
  expected_close_date: string;
  actual_close_date?: string;
  assigned_to?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  due_date?: string;
  assigned_to?: string;
  related_to?: {
    type: 'contact' | 'lead' | 'deal';
    id: string;
  };
  created_at: string;
  updated_at: string;
}

export interface Activity {
  id: string;
  type: 'call' | 'email' | 'meeting' | 'note' | 'task';
  description: string;
  related_to?: {
    type: 'contact' | 'lead' | 'deal';
    id: string;
    name: string;
  };
  created_by: string;
  created_at: string;
}

export interface DashboardStats {
  totalContacts: number;
  totalLeads: number;
  totalDeals: number;
  totalRevenue: number;
  activeDeals: number;
  wonDealsThisMonth: number;
  tasksPending: number;
  tasksOverdue: number;
}

export type ViewType = 'dashboard' | 'contacts' | 'leads' | 'deals' | 'tasks' | 'calendar' | 'reports';

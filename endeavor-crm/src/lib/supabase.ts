import { createClient } from '@supabase/supabase-js';
import type { Contact, Lead, Deal, Task, Activity } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Database schema for reference:
/*
-- Contacts table
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  company TEXT,
  position TEXT,
  status TEXT DEFAULT 'lead' CHECK (status IN ('active', 'inactive', 'lead')),
  source TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Leads table
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  value DECIMAL(10,2),
  source TEXT,
  assigned_to TEXT,
  expected_close_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Deals table
CREATE TABLE deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  value DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'won', 'lost')),
  probability INTEGER DEFAULT 0 CHECK (probability >= 0 AND probability <= 100),
  expected_close_date DATE,
  actual_close_date DATE,
  assigned_to TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tasks table
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  due_date TIMESTAMP WITH TIME ZONE,
  assigned_to TEXT,
  related_type TEXT CHECK (related_type IN ('contact', 'lead', 'deal')),
  related_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activities table
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT CHECK (type IN ('call', 'email', 'meeting', 'note', 'task')),
  description TEXT NOT NULL,
  related_type TEXT CHECK (related_type IN ('contact', 'lead', 'deal')),
  related_id UUID,
  created_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX idx_contacts_email ON contacts(email);
CREATE INDEX idx_contacts_status ON contacts(status);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_contact_id ON leads(contact_id);
CREATE INDEX idx_deals_status ON deals(status);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);

-- Row Level Security (RLS) policies
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all access for authenticated users" ON contacts
  FOR ALL USING (auth.role() = 'authenticated');
  
CREATE POLICY "Enable all access for authenticated users" ON leads
  FOR ALL USING (auth.role() = 'authenticated');
  
CREATE POLICY "Enable all access for authenticated users" ON deals
  FOR ALL USING (auth.role() = 'authenticated');
  
CREATE POLICY "Enable all access for authenticated users" ON tasks
  FOR ALL USING (auth.role() = 'authenticated');
*/

// API functions
export const contactsApi = {
  getAll: async () => {
    const { data, error } = await supabase.from('contacts').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data as Contact[];
  },
  
  getById: async (id: string) => {
    const { data, error } = await supabase.from('contacts').select('*').eq('id', id).single();
    if (error) throw error;
    return data as Contact;
  },
  
  create: async (contact: Omit<Contact, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase.from('contacts').insert(contact).select().single();
    if (error) throw error;
    return data as Contact;
  },
  
  update: async (id: string, contact: Partial<Contact>) => {
    const { data, error } = await supabase.from('contacts').update(contact).eq('id', id).select().single();
    if (error) throw error;
    return data as Contact;
  },
  
  delete: async (id: string) => {
    const { error } = await supabase.from('contacts').delete().eq('id', id);
    if (error) throw error;
  }
};

export const leadsApi = {
  getAll: async () => {
    const { data, error } = await supabase.from('leads').select('*, contact:contacts(*)').order('created_at', { ascending: false });
    if (error) throw error;
    return data as Lead[];
  },
  
  create: async (lead: Omit<Lead, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase.from('leads').insert(lead).select().single();
    if (error) throw error;
    return data as Lead;
  },
  
  update: async (id: string, lead: Partial<Lead>) => {
    const { data, error } = await supabase.from('leads').update(lead).eq('id', id).select().single();
    if (error) throw error;
    return data as Lead;
  },
  
  delete: async (id: string) => {
    const { error } = await supabase.from('leads').delete().eq('id', id);
    if (error) throw error;
  }
};

export const dealsApi = {
  getAll: async () => {
    const { data, error } = await supabase.from('deals').select('*, lead:leads(*, contact:contacts(*))').order('created_at', { ascending: false });
    if (error) throw error;
    return data as Deal[];
  },
  
  create: async (deal: Omit<Deal, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase.from('deals').insert(deal).select().single();
    if (error) throw error;
    return data as Deal;
  },
  
  update: async (id: string, deal: Partial<Deal>) => {
    const { data, error } = await supabase.from('deals').update(deal).eq('id', id).select().single();
    if (error) throw error;
    return data as Deal;
  },
  
  delete: async (id: string) => {
    const { error } = await supabase.from('deals').delete().eq('id', id);
    if (error) throw error;
  }
};

export const tasksApi = {
  getAll: async () => {
    const { data, error } = await supabase.from('tasks').select('*').order('due_date', { ascending: true });
    if (error) throw error;
    return data as Task[];
  },
  
  create: async (task: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase.from('tasks').insert(task).select().single();
    if (error) throw error;
    return data as Task;
  },
  
  update: async (id: string, task: Partial<Task>) => {
    const { data, error } = await supabase.from('tasks').update(task).eq('id', id).select().single();
    if (error) throw error;
    return data as Task;
  },
  
  delete: async (id: string) => {
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (error) throw error;
  }
};

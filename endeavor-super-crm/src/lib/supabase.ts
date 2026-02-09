import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-supabase-url.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);

// Auth helpers
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
}

export async function signUp(email: string, password: string, userData: any) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: userData,
    },
  });
  return { data, error };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  return { user, error };
}

export async function getSession() {
  const { data: { session }, error } = await supabase.auth.getSession();
  return { session, error };
}

// Database query helpers
export const db = {
  // Employees
  employees: {
    getAll: () => supabase.from('employees').select('*').order('created_at', { ascending: false }),
    getById: (id: string) => supabase.from('employees').select('*').eq('id', id).single(),
    create: (data: any) => supabase.from('employees').insert(data).select().single(),
    update: (id: string, data: any) => supabase.from('employees').update(data).eq('id', id).select().single(),
    delete: (id: string) => supabase.from('employees').delete().eq('id', id),
  },

  // Contractors
  contractors: {
    getAll: () => supabase.from('contractors').select('*').order('created_at', { ascending: false }),
    getById: (id: string) => supabase.from('contractors').select('*').eq('id', id).single(),
    create: (data: any) => supabase.from('contractors').insert(data).select().single(),
    update: (id: string, data: any) => supabase.from('contractors').update(data).eq('id', id).select().single(),
    delete: (id: string) => supabase.from('contractors').delete().eq('id', id),
  },

  // Freelancers
  freelancers: {
    getAll: () => supabase.from('freelancers').select('*').order('created_at', { ascending: false }),
    getById: (id: string) => supabase.from('freelancers').select('*').eq('id', id).single(),
    create: (data: any) => supabase.from('freelancers').insert(data).select().single(),
    update: (id: string, data: any) => supabase.from('freelancers').update(data).eq('id', id).select().single(),
    delete: (id: string) => supabase.from('freelancers').delete().eq('id', id),
    getBySkills: (skills: string[]) => supabase
      .from('freelancers')
      .select('*')
      .contains('skills', skills)
      .eq('status', 'active'),
  },

  // Vendors
  vendors: {
    getAll: () => supabase.from('vendors').select('*').order('created_at', { ascending: false }),
    getById: (id: string) => supabase.from('vendors').select('*').eq('id', id).single(),
    create: (data: any) => supabase.from('vendors').insert(data).select().single(),
    update: (id: string, data: any) => supabase.from('vendors').update(data).eq('id', id).select().single(),
    delete: (id: string) => supabase.from('vendors').delete().eq('id', id),
  },

  // Contacts
  contacts: {
    getAll: () => supabase.from('contacts').select('*').order('created_at', { ascending: false }),
    getById: (id: string) => supabase.from('contacts').select('*').eq('id', id).single(),
    create: (data: any) => supabase.from('contacts').insert(data).select().single(),
    update: (id: string, data: any) => supabase.from('contacts').update(data).eq('id', id).select().single(),
    delete: (id: string) => supabase.from('contacts').delete().eq('id', id),
    getByType: (type: string) => supabase.from('contacts').select('*').eq('contact_type', type),
  },

  // Deals
  deals: {
    getAll: () => supabase.from('deals').select('*, contacts(*)').order('created_at', { ascending: false }),
    getById: (id: string) => supabase.from('deals').select('*, contacts(*)').eq('id', id).single(),
    create: (data: any) => supabase.from('deals').insert(data).select().single(),
    update: (id: string, data: any) => supabase.from('deals').update(data).eq('id', id).select().single(),
    delete: (id: string) => supabase.from('deals').delete().eq('id', id),
    getByStage: (stage: string) => supabase.from('deals').select('*, contacts(*)').eq('stage', stage),
  },

  // Activities
  activities: {
    getAll: () => supabase.from('activities').select('*, contacts(*), deals(*)').order('created_at', { ascending: false }),
    getByContact: (contactId: string) => supabase.from('activities').select('*').eq('contact_id', contactId),
    getByDeal: (dealId: string) => supabase.from('activities').select('*').eq('deal_id', dealId),
    create: (data: any) => supabase.from('activities').insert(data).select().single(),
    update: (id: string, data: any) => supabase.from('activities').update(data).eq('id', id).select().single(),
    delete: (id: string) => supabase.from('activities').delete().eq('id', id),
  },

  // Invoices
  invoices: {
    getAll: () => supabase.from('invoices').select('*, line_items:invoice_line_items(*), contacts(*), freelancers(*), contractors(*), vendors(*)').order('created_at', { ascending: false }),
    getById: (id: string) => supabase.from('invoices').select('*, line_items:invoice_line_items(*), contacts(*), freelancers(*), contractors(*), vendors(*)').eq('id', id).single(),
    create: (data: any) => supabase.from('invoices').insert(data).select().single(),
    update: (id: string, data: any) => supabase.from('invoices').update(data).eq('id', id).select().single(),
    delete: (id: string) => supabase.from('invoices').delete().eq('id', id),
    getByType: (type: string) => supabase.from('invoices').select('*, line_items:invoice_line_items(*)').eq('invoice_type', type),
    getPending: () => supabase.from('invoices').select('*').in('status', ['sent', 'viewed', 'partial']),
    getOverdue: () => supabase.from('invoices').select('*').eq('status', 'overdue'),
  },

  // Invoice Line Items
  invoiceLineItems: {
    create: (data: any) => supabase.from('invoice_line_items').insert(data).select(),
    update: (id: string, data: any) => supabase.from('invoice_line_items').update(data).eq('id', id).select().single(),
    delete: (id: string) => supabase.from('invoice_line_items').delete().eq('id', id),
    deleteByInvoice: (invoiceId: string) => supabase.from('invoice_line_items').delete().eq('invoice_id', invoiceId),
  },

  // Payments
  payments: {
    getAll: () => supabase.from('payments').select('*, invoices(*)').order('created_at', { ascending: false }),
    getByInvoice: (invoiceId: string) => supabase.from('payments').select('*').eq('invoice_id', invoiceId),
    create: (data: any) => supabase.from('payments').insert(data).select().single(),
    delete: (id: string) => supabase.from('payments').delete().eq('id', id),
  },

  // Timesheets
  timesheets: {
    getAll: () => supabase.from('timesheets').select('*, freelancers(*), deals(*)').order('created_at', { ascending: false }),
    getByFreelancer: (freelancerId: string) => supabase.from('timesheets').select('*').eq('freelancer_id', freelancerId),
    getPending: () => supabase.from('timesheets').select('*, freelancers(*)').eq('status', 'pending'),
    create: (data: any) => supabase.from('timesheets').insert(data).select().single(),
    update: (id: string, data: any) => supabase.from('timesheets').update(data).eq('id', id).select().single(),
    delete: (id: string) => supabase.from('timesheets').delete().eq('id', id),
  },

  // Purchase Orders
  purchaseOrders: {
    getAll: () => supabase.from('purchase_orders').select('*, vendors(*), line_items:po_line_items(*)').order('created_at', { ascending: false }),
    getById: (id: string) => supabase.from('purchase_orders').select('*, vendors(*), line_items:po_line_items(*)').eq('id', id).single(),
    create: (data: any) => supabase.from('purchase_orders').insert(data).select().single(),
    update: (id: string, data: any) => supabase.from('purchase_orders').update(data).eq('id', id).select().single(),
    delete: (id: string) => supabase.from('purchase_orders').delete().eq('id', id),
  },

  // GST Returns
  gstReturns: {
    getAll: () => supabase.from('gst_returns').select('*').order('created_at', { ascending: false }),
    create: (data: any) => supabase.from('gst_returns').insert(data).select().single(),
    update: (id: string, data: any) => supabase.from('gst_returns').update(data).eq('id', id).select().single(),
  },

  // AI Generated Content
  aiContent: {
    getAll: () => supabase.from('ai_generated_content').select('*').order('created_at', { ascending: false }),
    create: (data: any) => supabase.from('ai_generated_content').insert(data).select().single(),
    markAsUsed: (id: string) => supabase.from('ai_generated_content').update({ is_used: true }).eq('id', id),
  },
};

// Real-time subscriptions
export function subscribeToTable(table: string, callback: (payload: any) => void) {
  return supabase
    .channel(`${table}_changes`)
    .on('postgres_changes', { event: '*', schema: 'public', table }, callback)
    .subscribe();
}

export function subscribeToInvoices(callback: (payload: any) => void) {
  return subscribeToTable('invoices', callback);
}

export function subscribeToDeals(callback: (payload: any) => void) {
  return subscribeToTable('deals', callback);
}

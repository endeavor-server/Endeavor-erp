export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      employees: {
        Row: {
          id: string
          employee_code: string
          first_name: string
          last_name: string
          email: string
          phone: string | null
          date_of_joining: string
          department: string | null
          designation: string | null
          reporting_manager_id: string | null
          pan_number: string | null
          aadhaar_number: string | null
          bank_account_number: string | null
          bank_ifsc_code: string | null
          bank_name: string | null
          base_salary: number | null
          hra: number | null
          special_allowance: number | null
          pf_number: string | null
          esi_number: string | null
          uan: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          address: string | null
          city: string | null
          state: string | null
          pincode: string | null
          status: 'active' | 'inactive' | 'terminated'
          documents: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          employee_code: string
          first_name: string
          last_name: string
          email: string
          phone?: string | null
          date_of_joining: string
          department?: string | null
          designation?: string | null
          reporting_manager_id?: string | null
          pan_number?: string | null
          aadhaar_number?: string | null
          bank_account_number?: string | null
          bank_ifsc_code?: string | null
          bank_name?: string | null
          base_salary?: number | null
          hra?: number | null
          special_allowance?: number | null
          pf_number?: string | null
          esi_number?: string | null
          uan?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          pincode?: string | null
          status?: 'active' | 'inactive' | 'terminated'
          documents?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          employee_code?: string
          first_name?: string
          last_name?: string
          email?: string
          phone?: string | null
          date_of_joining?: string
          department?: string | null
          designation?: string | null
          reporting_manager_id?: string | null
          pan_number?: string | null
          aadhaar_number?: string | null
          bank_account_number?: string | null
          bank_ifsc_code?: string | null
          bank_name?: string | null
          base_salary?: number | null
          hra?: number | null
          special_allowance?: number | null
          pf_number?: string | null
          esi_number?: string | null
          uan?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          pincode?: string | null
          status?: 'active' | 'inactive' | 'terminated'
          documents?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      freelancers: {
        Row: {
          id: string
          freelancer_code: string
          first_name: string
          last_name: string
          email: string
          phone: string | null
          skills: string[]
          primary_skill: string | null
          experience_years: number | null
          hourly_rate: number | null
          daily_rate: number | null
          monthly_rate: number | null
          availability: 'available' | 'busy' | 'unavailable'
          rating: number
          total_projects: number
          total_hours: number
          gst_number: string | null
          pan_number: string | null
          bank_account_number: string | null
          bank_ifsc_code: string | null
          bank_name: string | null
          address: string | null
          city: string | null
          state: string | null
          country: string
          nda_signed: boolean
          nda_signed_date: string | null
          contract_signed: boolean
          onboarding_completed: boolean
          linkedin_url: string | null
          portfolio_url: string | null
          resume_url: string | null
          bio: string | null
          status: 'active' | 'inactive' | 'blacklisted'
          tds_rate: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          freelancer_code: string
          first_name: string
          last_name: string
          email: string
          phone?: string | null
          skills?: string[]
          primary_skill?: string | null
          experience_years?: number | null
          hourly_rate?: number | null
          daily_rate?: number | null
          monthly_rate?: number | null
          availability?: 'available' | 'busy' | 'unavailable'
          rating?: number
          total_projects?: number
          total_hours?: number
          gst_number?: string | null
          pan_number?: string | null
          bank_account_number?: string | null
          bank_ifsc_code?: string | null
          bank_name?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          country?: string
          nda_signed?: boolean
          nda_signed_date?: string | null
          contract_signed?: boolean
          onboarding_completed?: boolean
          linkedin_url?: string | null
          portfolio_url?: string | null
          resume_url?: string | null
          bio?: string | null
          status?: 'active' | 'inactive' | 'blacklisted'
          tds_rate?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          freelancer_code?: string
          first_name?: string
          last_name?: string
          email?: string
          phone?: string | null
          skills?: string[]
          primary_skill?: string | null
          experience_years?: number | null
          hourly_rate?: number | null
          daily_rate?: number | null
          monthly_rate?: number | null
          availability?: 'available' | 'busy' | 'unavailable'
          rating?: number
          total_projects?: number
          total_hours?: number
          gst_number?: string | null
          pan_number?: string | null
          bank_account_number?: string | null
          bank_ifsc_code?: string | null
          bank_name?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          country?: string
          nda_signed?: boolean
          nda_signed_date?: string | null
          contract_signed?: boolean
          onboarding_completed?: boolean
          linkedin_url?: string | null
          portfolio_url?: string | null
          resume_url?: string | null
          bio?: string | null
          status?: 'active' | 'inactive' | 'blacklisted'
          tds_rate?: number
          created_at?: string
          updated_at?: string
        }
      }
      contractors: {
        Row: {
          id: string
          contractor_code: string
          company_name: string | null
          first_name: string
          last_name: string
          email: string
          phone: string | null
          contract_start_date: string
          contract_end_date: string | null
          contract_value: number | null
          payment_terms: string | null
          gst_number: string | null
          pan_number: string | null
          bank_account_number: string | null
          bank_ifsc_code: string | null
          bank_name: string | null
          address: string | null
          city: string | null
          state: string | null
          pincode: string | null
          scope_of_work: string | null
          milestones: Json | null
          status: 'active' | 'completed' | 'terminated'
          tds_rate: number
          documents: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          contractor_code: string
          company_name?: string | null
          first_name: string
          last_name: string
          email: string
          phone?: string | null
          contract_start_date: string
          contract_end_date?: string | null
          contract_value?: number | null
          payment_terms?: string | null
          gst_number?: string | null
          pan_number?: string | null
          bank_account_number?: string | null
          bank_ifsc_code?: string | null
          bank_name?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          pincode?: string | null
          scope_of_work?: string | null
          milestones?: Json | null
          status?: 'active' | 'completed' | 'terminated'
          tds_rate?: number
          documents?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          contractor_code?: string
          company_name?: string | null
          first_name?: string
          last_name?: string
          email?: string
          phone?: string | null
          contract_start_date?: string
          contract_end_date?: string | null
          contract_value?: number | null
          payment_terms?: string | null
          gst_number?: string | null
          pan_number?: string | null
          bank_account_number?: string | null
          bank_ifsc_code?: string | null
          bank_name?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          pincode?: string | null
          scope_of_work?: string | null
          milestones?: Json | null
          status?: 'active' | 'completed' | 'terminated'
          tds_rate?: number
          documents?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      vendors: {
        Row: {
          id: string
          vendor_code: string
          company_name: string
          contact_person: string | null
          email: string
          phone: string | null
          gst_number: string | null
          pan_number: string | null
          vendor_type: string | null
          bank_account_number: string | null
          bank_ifsc_code: string | null
          bank_name: string | null
          address: string | null
          city: string | null
          state: string | null
          pincode: string | null
          credit_limit: number | null
          payment_terms: number
          msme_registered: boolean
          tds_section: string
          tds_rate: number
          performance_rating: number | null
          total_purchases: number
          status: 'active' | 'inactive' | 'blacklisted'
          documents: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          vendor_code: string
          company_name: string
          contact_person?: string | null
          email: string
          phone?: string | null
          gst_number?: string | null
          pan_number?: string | null
          vendor_type?: string | null
          bank_account_number?: string | null
          bank_ifsc_code?: string | null
          bank_name?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          pincode?: string | null
          credit_limit?: number | null
          payment_terms?: number
          msme_registered?: boolean
          tds_section?: string
          tds_rate?: number
          performance_rating?: number | null
          total_purchases?: number
          status?: 'active' | 'inactive' | 'blacklisted'
          documents?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          vendor_code?: string
          company_name?: string
          contact_person?: string | null
          email?: string
          phone?: string | null
          gst_number?: string | null
          pan_number?: string | null
          vendor_type?: string | null
          bank_account_number?: string | null
          bank_ifsc_code?: string | null
          bank_name?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          pincode?: string | null
          credit_limit?: number | null
          payment_terms?: number
          msme_registered?: boolean
          tds_section?: string
          tds_rate?: number
          performance_rating?: number | null
          total_purchases?: number
          status?: 'active' | 'inactive' | 'blacklisted'
          documents?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      contacts: {
        Row: {
          id: string
          contact_type: 'lead' | 'prospect' | 'customer' | 'partner'
          first_name: string
          last_name: string
          email: string | null
          phone: string | null
          company_name: string | null
          job_title: string | null
          industry: string | null
          company_size: string | null
          website: string | null
          linkedin_url: string | null
          source: string | null
          status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost'
          assigned_to: string | null
          estimated_value: number | null
          expected_close_date: string | null
          notes: string | null
          address: string | null
          city: string | null
          state: string | null
          country: string
          gst_number: string | null
          pan_number: string | null
          billing_address: string | null
          shipping_address: string | null
          tags: string[]
          last_activity_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          contact_type?: 'lead' | 'prospect' | 'customer' | 'partner'
          first_name: string
          last_name: string
          email?: string | null
          phone?: string | null
          company_name?: string | null
          job_title?: string | null
          industry?: string | null
          company_size?: string | null
          website?: string | null
          linkedin_url?: string | null
          source?: string | null
          status?: 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost'
          assigned_to?: string | null
          estimated_value?: number | null
          expected_close_date?: string | null
          notes?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          country?: string
          gst_number?: string | null
          pan_number?: string | null
          billing_address?: string | null
          shipping_address?: string | null
          tags?: string[]
          last_activity_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          contact_type?: 'lead' | 'prospect' | 'customer' | 'partner'
          first_name?: string
          last_name?: string
          email?: string | null
          phone?: string | null
          company_name?: string | null
          job_title?: string | null
          industry?: string | null
          company_size?: string | null
          website?: string | null
          linkedin_url?: string | null
          source?: string | null
          status?: 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost'
          assigned_to?: string | null
          estimated_value?: number | null
          expected_close_date?: string | null
          notes?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          country?: string
          gst_number?: string | null
          pan_number?: string | null
          billing_address?: string | null
          shipping_address?: string | null
          tags?: string[]
          last_activity_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      deals: {
        Row: {
          id: string
          deal_name: string
          contact_id: string
          stage: 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost'
          value: number
          currency: string
          probability: number
          expected_close_date: string | null
          actual_close_date: string | null
          assigned_to: string | null
          description: string | null
          source: string | null
          competitors: string | null
          loss_reason: string | null
          priority: 'low' | 'medium' | 'high'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          deal_name: string
          contact_id: string
          stage?: 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost'
          value: number
          currency?: string
          probability?: number
          expected_close_date?: string | null
          actual_close_date?: string | null
          assigned_to?: string | null
          description?: string | null
          source?: string | null
          competitors?: string | null
          loss_reason?: string | null
          priority?: 'low' | 'medium' | 'high'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          deal_name?: string
          contact_id?: string
          stage?: 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost'
          value?: number
          currency?: string
          probability?: number
          expected_close_date?: string | null
          actual_close_date?: string | null
          assigned_to?: string | null
          description?: string | null
          source?: string | null
          competitors?: string | null
          loss_reason?: string | null
          priority?: 'low' | 'medium' | 'high'
          created_at?: string
          updated_at?: string
        }
      }
      invoices: {
        Row: {
          id: string
          invoice_number: string
          invoice_type: 'client' | 'freelancer' | 'contractor' | 'vendor'
          contact_id: string | null
          freelancer_id: string | null
          contractor_id: string | null
          vendor_id: string | null
          purchase_order_id: string | null
          invoice_date: string
          due_date: string
          subtotal: number
          discount_amount: number
          taxable_amount: number
          is_gst_applicable: boolean
          gst_type: 'cgst_sgst' | 'igst' | null
          cgst_rate: number
          sgst_rate: number
          igst_rate: number
          cgst_amount: number
          sgst_amount: number
          igst_amount: number
          gstin: string | null
          tds_applicable: boolean
          tds_section: string | null
          tds_rate: number
          tds_amount: number
          total_amount: number
          amount_due: number
          amount_paid: number
          status: 'draft' | 'sent' | 'viewed' | 'paid' | 'partial' | 'overdue' | 'cancelled'
          notes: string | null
          terms: string | null
          timesheet_ids: string[]
          milestone_id: string | null
          sent_at: string | null
          paid_at: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          invoice_number: string
          invoice_type: 'client' | 'freelancer' | 'contractor' | 'vendor'
          contact_id?: string | null
          freelancer_id?: string | null
          contractor_id?: string | null
          vendor_id?: string | null
          purchase_order_id?: string | null
          invoice_date: string
          due_date: string
          subtotal?: number
          discount_amount?: number
          taxable_amount?: number
          is_gst_applicable?: boolean
          gst_type?: 'cgst_sgst' | 'igst' | null
          cgst_rate?: number
          sgst_rate?: number
          igst_rate?: number
          cgst_amount?: number
          sgst_amount?: number
          igst_amount?: number
          gstin?: string | null
          tds_applicable?: boolean
          tds_section?: string | null
          tds_rate?: number
          tds_amount?: number
          total_amount?: number
          amount_due?: number
          amount_paid?: number
          status?: 'draft' | 'sent' | 'viewed' | 'paid' | 'partial' | 'overdue' | 'cancelled'
          notes?: string | null
          terms?: string | null
          timesheet_ids?: string[]
          milestone_id?: string | null
          sent_at?: string | null
          paid_at?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          invoice_number?: string
          invoice_type?: 'client' | 'freelancer' | 'contractor' | 'vendor'
          contact_id?: string | null
          freelancer_id?: string | null
          contractor_id?: string | null
          vendor_id?: string | null
          purchase_order_id?: string | null
          invoice_date?: string
          due_date?: string
          subtotal?: number
          discount_amount?: number
          taxable_amount?: number
          is_gst_applicable?: boolean
          gst_type?: 'cgst_sgst' | 'igst' | null
          cgst_rate?: number
          sgst_rate?: number
          igst_rate?: number
          cgst_amount?: number
          sgst_amount?: number
          igst_amount?: number
          gstin?: string | null
          tds_applicable?: boolean
          tds_section?: string | null
          tds_rate?: number
          tds_amount?: number
          total_amount?: number
          amount_due?: number
          amount_paid?: number
          status?: 'draft' | 'sent' | 'viewed' | 'paid' | 'partial' | 'overdue' | 'cancelled'
          notes?: string | null
          terms?: string | null
          timesheet_ids?: string[]
          milestone_id?: string | null
          sent_at?: string | null
          paid_at?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

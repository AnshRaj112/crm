export interface Database {
  public: {
    Tables: {
      leads: {
        Row: {
          id: string
          user_id: string
          business_name: string
          contact_name: string
          email: string
          phone: string
          source: string
          status: 'new' | 'contacted' | 'interested' | 'on_hold' | 'declined' | 'converted'
          created_at: string
          updated_at: string
          form_id?: string
          is_manual: boolean
        }
        Insert: {
          id?: string
          user_id: string
          business_name: string
          contact_name: string
          email: string
          phone: string
          source: string
          status?: 'new' | 'contacted' | 'interested' | 'on_hold' | 'declined' | 'converted'
          created_at?: string
          updated_at?: string
          form_id?: string
          is_manual?: boolean
        }
        Update: {
          id?: string
          user_id?: string
          business_name?: string
          contact_name?: string
          email?: string
          phone?: string
          source?: string
          status?: 'new' | 'contacted' | 'interested' | 'on_hold' | 'declined' | 'converted'
          created_at?: string
          updated_at?: string
          form_id?: string
          is_manual?: boolean
        }
      }
      lead_forms: {
        Row: {
          id: string
          user_id: string
          name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

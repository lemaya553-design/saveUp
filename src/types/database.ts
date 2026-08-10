export interface Database {
  public: {
    Tables: {
      budget_settings: {
        Row: {
          user_id: string
          monthly_income: number
          updated_at: string
        }
        Insert: {
          user_id: string
          monthly_income?: number
          updated_at?: string
        }
        Update: {
          user_id?: string
          monthly_income?: number
          updated_at?: string
        }
        Relationships: []
      }
      fixed_expenses: {
        Row: {
          id: string
          user_id: string
          name: string
          amount: number
          category: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          amount: number
          category?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          amount?: number
          category?: string
          created_at?: string
        }
        Relationships: []
      }
      expenses: {
        Row: {
          id: string
          user_id: string
          description: string
          amount: number
          category: string
          spent_at: string
        }
        Insert: {
          id?: string
          user_id: string
          description: string
          amount: number
          category?: string
          spent_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          description?: string
          amount?: number
          category?: string
          spent_at?: string
        }
        Relationships: []
      }
      // Legacy, superseded by savings_goals — left untouched (no user_id,
      // no longer referenced anywhere in the app).
      savings_goal: {
        Row: {
          id: number
          name: string
          target_amount: number
          current_amount: number
          target_date: string | null
          updated_at: string
        }
        Insert: {
          id?: number
          name?: string
          target_amount?: number
          current_amount?: number
          target_date?: string | null
          updated_at?: string
        }
        Update: {
          id?: number
          name?: string
          target_amount?: number
          current_amount?: number
          target_date?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      savings_goals: {
        Row: {
          id: string
          user_id: string
          name: string
          target_amount: number
          current_amount: number
          target_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          target_amount?: number
          current_amount?: number
          target_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          target_amount?: number
          current_amount?: number
          target_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      savings_contributions: {
        Row: {
          id: string
          user_id: string
          amount: number
          goal_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          goal_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          goal_id?: string | null
          created_at?: string
        }
        Relationships: []
      }
      financial_health_snapshots: {
        Row: {
          user_id: string
          score_date: string
          score: number
          created_at: string
        }
        Insert: {
          user_id: string
          score_date: string
          score: number
          created_at?: string
        }
        Update: {
          user_id?: string
          score_date?: string
          score?: number
          created_at?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          id: string
          user_id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          created_at?: string
        }
        Relationships: []
      }
      investment_balance: {
        Row: {
          user_id: string
          current_amount: number
          updated_at: string
        }
        Insert: {
          user_id: string
          current_amount?: number
          updated_at?: string
        }
        Update: {
          user_id?: string
          current_amount?: number
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
  }
}

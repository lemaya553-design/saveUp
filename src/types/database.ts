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
          account: string | null
        }
        Insert: {
          id?: string
          user_id: string
          description: string
          amount: number
          category?: string
          spent_at?: string
          account?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          description?: string
          amount?: number
          category?: string
          spent_at?: string
          account?: string | null
        }
        Relationships: []
      }
      accounts: {
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
      custom_category_keywords: {
        Row: {
          id: string
          user_id: string
          keyword: string
          category: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          keyword: string
          category: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          keyword?: string
          category?: string
          created_at?: string
        }
        Relationships: []
      }
      claimed_badges: {
        Row: {
          id: string
          user_id: string
          tier_id: string
          claimed_at: string
        }
        Insert: {
          id?: string
          user_id: string
          tier_id: string
          claimed_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          tier_id?: string
          claimed_at?: string
        }
        Relationships: []
      }
      login_activity: {
        Row: {
          id: string
          user_id: string
          activity_date: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          activity_date: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          activity_date?: string
          created_at?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          user_id: string
          plan: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          status: string | null
          current_period_end: string | null
          updated_at: string
        }
        Insert: {
          user_id: string
          plan?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          status?: string | null
          current_period_end?: string | null
          updated_at?: string
        }
        Update: {
          user_id?: string
          plan?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          status?: string | null
          current_period_end?: string | null
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
          monthly_budget: number | null
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          created_at?: string
          monthly_budget?: number | null
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          created_at?: string
          monthly_budget?: number | null
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

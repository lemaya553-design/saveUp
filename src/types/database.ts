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
      wishlist_items: {
        Row: {
          id: string
          user_id: string
          name: string
          price: number
          goal_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          price?: number
          goal_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          price?: number
          goal_id?: string | null
          created_at?: string
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          user_id: string
          accent_color: string
          theme: string
          avatar_emoji: string | null
          onboarding_main_goal: string | null
          onboarding_tried_other_app: boolean | null
          onboarding_frequency: string | null
          csv_import_count: number
          updated_at: string
        }
        Insert: {
          user_id: string
          accent_color?: string
          theme?: string
          avatar_emoji?: string | null
          onboarding_main_goal?: string | null
          onboarding_tried_other_app?: boolean | null
          onboarding_frequency?: string | null
          csv_import_count?: number
          updated_at?: string
        }
        Update: {
          user_id?: string
          accent_color?: string
          theme?: string
          avatar_emoji?: string | null
          onboarding_main_goal?: string | null
          onboarding_tried_other_app?: boolean | null
          onboarding_frequency?: string | null
          csv_import_count?: number
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
          photo_path: string | null
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
          photo_path?: string | null
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
          photo_path?: string | null
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
      trial_windows: {
        Row: {
          user_id: string
          trial_started_at: string
        }
        Insert: {
          user_id: string
          trial_started_at?: string
        }
        Update: {
          user_id?: string
          trial_started_at?: string
        }
        Relationships: []
      }
      savings_duels: {
        Row: {
          id: string
          status: string
          duration_days: number
          invite_token: string
          invite_expires_at: string
          started_at: string | null
          ends_at: string | null
          ended_reason: string | null
          ended_by: string | null
          created_by: string
          created_at: string
          updated_at: string
        }
        // No insert/update grant for `authenticated` — every write goes
        // through the security-definer functions below, never a direct
        // `.from('savings_duels')` call. These shapes exist only so the
        // generic Database type stays well-formed; nothing in this app
        // should ever construct one.
        Insert: {
          id?: string
          status?: string
          duration_days: number
          invite_token?: string
          invite_expires_at: string
          started_at?: string | null
          ends_at?: string | null
          ended_reason?: string | null
          ended_by?: string | null
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          status?: string
          duration_days?: number
          invite_token?: string
          invite_expires_at?: string
          started_at?: string | null
          ends_at?: string | null
          ended_reason?: string | null
          ended_by?: string | null
          created_by?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      savings_duel_participants: {
        Row: {
          id: string
          duel_id: string
          user_id: string
          display_name: string
          share_goal_name: boolean
          goal_name: string | null
          progress_pct: number
          joined_at: string
        }
        // Same "no direct write" note as savings_duels above.
        Insert: {
          id?: string
          duel_id: string
          user_id: string
          display_name: string
          share_goal_name?: boolean
          goal_name?: string | null
          progress_pct?: number
          joined_at?: string
        }
        Update: {
          id?: string
          duel_id?: string
          user_id?: string
          display_name?: string
          share_goal_name?: boolean
          goal_name?: string | null
          progress_pct?: number
          joined_at?: string
        }
        Relationships: []
      }
      savings_duel_entries: {
        Row: {
          duel_id: string
          user_id: string
          goal_id: string
          starting_amount: number
        }
        // Same "no direct write" note as savings_duels above.
        Insert: {
          duel_id: string
          user_id: string
          goal_id: string
          starting_amount: number
        }
        Update: {
          duel_id?: string
          user_id?: string
          goal_id?: string
          starting_amount?: number
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: {
      create_duel: {
        Args: { p_goal_id: string; p_duration_days: number; p_display_name: string }
        Returns: { duel_id: string; invite_token: string }[]
      }
      get_duel_invite_preview: {
        Args: { p_token: string }
        Returns: {
          duel_id: string
          creator_display_name: string
          duration_days: number
          invite_expires_at: string
        }[]
      }
      accept_duel_invite: {
        Args: {
          p_token: string
          p_goal_id: string
          p_display_name: string
          p_share_goal_name?: boolean
        }
        Returns: { duel_id: string }[]
      }
      abandon_duel: {
        Args: { p_duel_id: string }
        Returns: undefined
      }
      finalize_duel_if_ended: {
        Args: { p_duel_id: string }
        Returns: undefined
      }
    }
  }
}

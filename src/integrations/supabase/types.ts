export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      ad_spy_ads: {
        Row: {
          ad_copy: string | null
          ad_library_url: string | null
          created_at: string
          id: string
          image_url: string | null
          platform: string
          search_id: string
          video_url: string | null
        }
        Insert: {
          ad_copy?: string | null
          ad_library_url?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          platform?: string
          search_id: string
          video_url?: string | null
        }
        Update: {
          ad_copy?: string | null
          ad_library_url?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          platform?: string
          search_id?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ad_spy_ads_search_id_fkey"
            columns: ["search_id"]
            isOneToOne: false
            referencedRelation: "ad_spy_searches"
            referencedColumns: ["id"]
          },
        ]
      }
      ad_spy_analysis: {
        Row: {
          ad_id: string
          angle: string | null
          created_at: string
          cta: string | null
          emotion: string | null
          hook: string | null
          id: string
          script_summary: string | null
          why_it_works: string | null
        }
        Insert: {
          ad_id: string
          angle?: string | null
          created_at?: string
          cta?: string | null
          emotion?: string | null
          hook?: string | null
          id?: string
          script_summary?: string | null
          why_it_works?: string | null
        }
        Update: {
          ad_id?: string
          angle?: string | null
          created_at?: string
          cta?: string | null
          emotion?: string | null
          hook?: string | null
          id?: string
          script_summary?: string | null
          why_it_works?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ad_spy_analysis_ad_id_fkey"
            columns: ["ad_id"]
            isOneToOne: false
            referencedRelation: "ad_spy_ads"
            referencedColumns: ["id"]
          },
        ]
      }
      ad_spy_recreations: {
        Row: {
          ad_id: string
          created_at: string
          id: string
          recreated_script: string | null
          status: string
          user_id: string
        }
        Insert: {
          ad_id: string
          created_at?: string
          id?: string
          recreated_script?: string | null
          status?: string
          user_id: string
        }
        Update: {
          ad_id?: string
          created_at?: string
          id?: string
          recreated_script?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ad_spy_recreations_ad_id_fkey"
            columns: ["ad_id"]
            isOneToOne: false
            referencedRelation: "ad_spy_ads"
            referencedColumns: ["id"]
          },
        ]
      }
      ad_spy_runs: {
        Row: {
          completed_at: string | null
          created_at: string
          error_message: string | null
          id: string
          started_at: string | null
          status: string
          time_window_days: number
          trigger_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          started_at?: string | null
          status?: string
          time_window_days?: number
          trigger_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          started_at?: string | null
          status?: string
          time_window_days?: number
          trigger_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ad_spy_schedules: {
        Row: {
          created_at: string
          day_of_week: number
          id: string
          is_active: boolean
          last_executed_at: string | null
          next_execution_at: string | null
          time_of_day: string
          time_window_days: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          day_of_week: number
          id?: string
          is_active?: boolean
          last_executed_at?: string | null
          next_execution_at?: string | null
          time_of_day: string
          time_window_days?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          day_of_week?: number
          id?: string
          is_active?: boolean
          last_executed_at?: string | null
          next_execution_at?: string | null
          time_of_day?: string
          time_window_days?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ad_spy_script_iterations: {
        Row: {
          created_at: string
          id: string
          iteration_rationale: string
          new_cta: string
          new_hooks: Json
          new_script: string
          original_cta: string
          original_hooks: Json
          original_script: string
          top_performer_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          iteration_rationale: string
          new_cta: string
          new_hooks: Json
          new_script: string
          original_cta: string
          original_hooks: Json
          original_script: string
          top_performer_id: string
        }
        Update: {
          created_at?: string
          id?: string
          iteration_rationale?: string
          new_cta?: string
          new_hooks?: Json
          new_script?: string
          original_cta?: string
          original_hooks?: Json
          original_script?: string
          top_performer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ad_spy_script_iterations_top_performer_id_fkey"
            columns: ["top_performer_id"]
            isOneToOne: false
            referencedRelation: "ad_spy_top_performers"
            referencedColumns: ["id"]
          },
        ]
      }
      ad_spy_searches: {
        Row: {
          created_at: string
          id: string
          search_query: string
          search_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          search_query: string
          search_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          search_query?: string
          search_type?: string
          user_id?: string
        }
        Relationships: []
      }
      ad_spy_top_performers: {
        Row: {
          ad_account_id: string
          ad_id: string
          ad_name: string
          created_at: string
          id: string
          performance_metrics: Json
          rank: number
          run_id: string
          thumbnail_url: string | null
          video_url: string | null
        }
        Insert: {
          ad_account_id: string
          ad_id: string
          ad_name: string
          created_at?: string
          id?: string
          performance_metrics: Json
          rank: number
          run_id: string
          thumbnail_url?: string | null
          video_url?: string | null
        }
        Update: {
          ad_account_id?: string
          ad_id?: string
          ad_name?: string
          created_at?: string
          id?: string
          performance_metrics?: Json
          rank?: number
          run_id?: string
          thumbnail_url?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ad_spy_top_performers_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "ad_spy_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      facebook_ad_accounts: {
        Row: {
          access_token_encrypted: string
          account_id: string
          account_name: string
          created_at: string
          id: string
          is_active: boolean
          last_synced_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token_encrypted: string
          account_id: string
          account_name: string
          created_at?: string
          id?: string
          is_active?: boolean
          last_synced_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token_encrypted?: string
          account_id?: string
          account_name?: string
          created_at?: string
          id?: string
          is_active?: boolean
          last_synced_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      google_sheets_connections: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          last_accessed_at: string | null
          service_account_email: string
          spreadsheet_id: string
          spreadsheet_name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          last_accessed_at?: string | null
          service_account_email: string
          spreadsheet_id: string
          spreadsheet_name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          last_accessed_at?: string | null
          service_account_email?: string
          spreadsheet_id?: string
          spreadsheet_name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      market_research_reports: {
        Row: {
          client_avatar_description: string
          company_name: string
          company_website: string
          competitor_links: Json
          created_at: string
          error_message: string | null
          id: string
          processing_completed_at: string | null
          processing_started_at: string | null
          product_description: string
          report_content: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          client_avatar_description: string
          company_name: string
          company_website: string
          competitor_links: Json
          created_at?: string
          error_message?: string | null
          id?: string
          processing_completed_at?: string | null
          processing_started_at?: string | null
          product_description: string
          report_content?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          client_avatar_description?: string
          company_name?: string
          company_website?: string
          competitor_links?: Json
          created_at?: string
          error_message?: string | null
          id?: string
          processing_completed_at?: string | null
          processing_started_at?: string | null
          product_description?: string
          report_content?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_and_trigger_scheduled_runs: { Args: never; Returns: undefined }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

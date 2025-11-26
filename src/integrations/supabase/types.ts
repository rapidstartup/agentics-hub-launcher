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
      admin_tasks: {
        Row: {
          assigned_to: string | null
          client: string | null
          created_at: string
          department: string | null
          due_date: string | null
          id: string
          name: string
          priority: string
          status: string
          user_id: string
        }
        Insert: {
          assigned_to?: string | null
          client?: string | null
          created_at?: string
          department?: string | null
          due_date?: string | null
          id?: string
          name: string
          priority: string
          status: string
          user_id: string
        }
        Update: {
          assigned_to?: string | null
          client?: string | null
          created_at?: string
          department?: string | null
          due_date?: string | null
          id?: string
          name?: string
          priority?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      agent_configs: {
        Row: {
          agent_key: string
          area: string
          avatar_url: string | null
          client_id: string | null
          connection_id: string | null
          created_at: string
          description: string | null
          display_name: string | null
          display_role: string | null
          execution_mode: string | null
          id: string
          input_mapping: Json | null
          input_schema: Json | null
          is_predefined: boolean
          output_behavior: string | null
          output_mapping: Json | null
          scope: string
          updated_at: string
          user_id: string | null
          webhook_url: string | null
          workflow_id: string
        }
        Insert: {
          agent_key: string
          area: string
          avatar_url?: string | null
          client_id?: string | null
          connection_id?: string | null
          created_at?: string
          description?: string | null
          display_name?: string | null
          display_role?: string | null
          execution_mode?: string | null
          id?: string
          input_mapping?: Json | null
          input_schema?: Json | null
          is_predefined?: boolean
          output_behavior?: string | null
          output_mapping?: Json | null
          scope?: string
          updated_at?: string
          user_id?: string | null
          webhook_url?: string | null
          workflow_id: string
        }
        Update: {
          agent_key?: string
          area?: string
          avatar_url?: string | null
          client_id?: string | null
          connection_id?: string | null
          created_at?: string
          description?: string | null
          display_name?: string | null
          display_role?: string | null
          execution_mode?: string | null
          id?: string
          input_mapping?: Json | null
          input_schema?: Json | null
          is_predefined?: boolean
          output_behavior?: string | null
          output_mapping?: Json | null
          scope?: string
          updated_at?: string
          user_id?: string | null
          webhook_url?: string | null
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_configs_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "n8n_connections"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_messages: {
        Row: {
          agent_config_id: string
          client_id: string | null
          content: string
          created_at: string
          id: string
          metadata: Json
          mirrored_to_chat: boolean
          mirrored_to_kb: boolean
          role: string
          source: string
          user_id: string
        }
        Insert: {
          agent_config_id: string
          client_id?: string | null
          content: string
          created_at?: string
          id?: string
          metadata?: Json
          mirrored_to_chat?: boolean
          mirrored_to_kb?: boolean
          role: string
          source?: string
          user_id: string
        }
        Update: {
          agent_config_id?: string
          client_id?: string | null
          content?: string
          created_at?: string
          id?: string
          metadata?: Json
          mirrored_to_chat?: boolean
          mirrored_to_kb?: boolean
          role?: string
          source?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_messages_agent_config_id_fkey"
            columns: ["agent_config_id"]
            isOneToOne: false
            referencedRelation: "agent_configs"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          created_at: string
          ctr: number | null
          id: string
          impressions: number | null
          name: string
          project: string | null
          roas: number | null
          spend: number | null
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          ctr?: number | null
          id?: string
          impressions?: number | null
          name: string
          project?: string | null
          roas?: number | null
          spend?: number | null
          status: string
          user_id: string
        }
        Update: {
          created_at?: string
          ctr?: number | null
          id?: string
          impressions?: number | null
          name?: string
          project?: string | null
          roas?: number | null
          spend?: number | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      department_agents: {
        Row: {
          avatar_url: string | null
          created_at: string
          department: string
          id: string
          metrics: Json | null
          name: string
          role: string | null
          status: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          department: string
          id?: string
          metrics?: Json | null
          name: string
          role?: string | null
          status: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          department?: string
          id?: string
          metrics?: Json | null
          name?: string
          role?: string | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      department_kpis: {
        Row: {
          created_at: string
          department: string
          id: string
          label: string
          trend: string | null
          user_id: string
          value: string
        }
        Insert: {
          created_at?: string
          department: string
          id?: string
          label: string
          trend?: string | null
          user_id: string
          value: string
        }
        Update: {
          created_at?: string
          department?: string
          id?: string
          label?: string
          trend?: string | null
          user_id?: string
          value?: string
        }
        Relationships: []
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
      knowledge_base_collections: {
        Row: {
          client_id: string | null
          color: string | null
          created_at: string
          description: string | null
          icon: string | null
          id: string
          name: string
          scope: Database["public"]["Enums"]["kb_scope"]
          updated_at: string
          user_id: string
        }
        Insert: {
          client_id?: string | null
          color?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          scope?: Database["public"]["Enums"]["kb_scope"]
          updated_at?: string
          user_id: string
        }
        Update: {
          client_id?: string | null
          color?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          scope?: Database["public"]["Enums"]["kb_scope"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      knowledge_base_item_collections: {
        Row: {
          added_at: string
          collection_id: string
          id: string
          item_id: string
        }
        Insert: {
          added_at?: string
          collection_id: string
          id?: string
          item_id: string
        }
        Update: {
          added_at?: string
          collection_id?: string
          id?: string
          item_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_base_item_collections_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "knowledge_base_collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "knowledge_base_item_collections_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "knowledge_base_items"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_base_items: {
        Row: {
          category: Database["public"]["Enums"]["kb_category"]
          client_id: string | null
          created_at: string
          description: string | null
          external_url: string | null
          file_name: string | null
          file_path: string | null
          file_size: number | null
          id: string
          is_archived: boolean
          is_pinned: boolean
          metadata: Json
          mime_type: string | null
          project_id: string | null
          scope: Database["public"]["Enums"]["kb_scope"]
          source_department: string
          tags: string[] | null
          task_id: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: Database["public"]["Enums"]["kb_category"]
          client_id?: string | null
          created_at?: string
          description?: string | null
          external_url?: string | null
          file_name?: string | null
          file_path?: string | null
          file_size?: number | null
          id?: string
          is_archived?: boolean
          is_pinned?: boolean
          metadata?: Json
          mime_type?: string | null
          project_id?: string | null
          scope?: Database["public"]["Enums"]["kb_scope"]
          source_department: string
          tags?: string[] | null
          task_id?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: Database["public"]["Enums"]["kb_category"]
          client_id?: string | null
          created_at?: string
          description?: string | null
          external_url?: string | null
          file_name?: string | null
          file_path?: string | null
          file_size?: number | null
          id?: string
          is_archived?: boolean
          is_pinned?: boolean
          metadata?: Json
          mime_type?: string | null
          project_id?: string | null
          scope?: Database["public"]["Enums"]["kb_scope"]
          source_department?: string
          tags?: string[] | null
          task_id?: string | null
          title?: string
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
      n8n_connections: {
        Row: {
          api_key_encrypted: string
          base_url: string
          client_id: string | null
          created_at: string
          id: string
          is_active: boolean
          label: string | null
          scope: string
          updated_at: string
          user_id: string
        }
        Insert: {
          api_key_encrypted: string
          base_url: string
          client_id?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          label?: string | null
          scope: string
          updated_at?: string
          user_id: string
        }
        Update: {
          api_key_encrypted?: string
          base_url?: string
          client_id?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          label?: string | null
          scope?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      project_agents: {
        Row: {
          agent_config_id: string | null
          agent_name: string
          agent_role: string | null
          agent_type: string
          can_approve: boolean | null
          can_edit: boolean | null
          created_at: string
          id: string
          project_id: string
          user_id: string
        }
        Insert: {
          agent_config_id?: string | null
          agent_name: string
          agent_role?: string | null
          agent_type: string
          can_approve?: boolean | null
          can_edit?: boolean | null
          created_at?: string
          id?: string
          project_id: string
          user_id: string
        }
        Update: {
          agent_config_id?: string | null
          agent_name?: string
          agent_role?: string | null
          agent_type?: string
          can_approve?: boolean | null
          can_edit?: boolean | null
          created_at?: string
          id?: string
          project_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_agents_agent_config_id_fkey"
            columns: ["agent_config_id"]
            isOneToOne: false
            referencedRelation: "agent_configs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_agents_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_asset_statuses: {
        Row: {
          client_id: string | null
          color: string | null
          created_at: string
          id: string
          is_default: boolean
          is_final: boolean
          name: string
          sort_order: number
          user_id: string
        }
        Insert: {
          client_id?: string | null
          color?: string | null
          created_at?: string
          id?: string
          is_default?: boolean
          is_final?: boolean
          name: string
          sort_order?: number
          user_id: string
        }
        Update: {
          client_id?: string | null
          color?: string | null
          created_at?: string
          id?: string
          is_default?: boolean
          is_final?: boolean
          name?: string
          sort_order?: number
          user_id?: string
        }
        Relationships: []
      }
      project_assets: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          asset_type: string
          content: string | null
          created_at: string
          file_path: string | null
          file_url: string | null
          id: string
          metadata: Json | null
          owner_id: string | null
          project_id: string
          reviewer_id: string | null
          source_agent_config_id: string | null
          source_kb_item_id: string | null
          status_id: string | null
          status_name: string | null
          thumbnail_url: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          asset_type: string
          content?: string | null
          created_at?: string
          file_path?: string | null
          file_url?: string | null
          id?: string
          metadata?: Json | null
          owner_id?: string | null
          project_id: string
          reviewer_id?: string | null
          source_agent_config_id?: string | null
          source_kb_item_id?: string | null
          status_id?: string | null
          status_name?: string | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          asset_type?: string
          content?: string | null
          created_at?: string
          file_path?: string | null
          file_url?: string | null
          id?: string
          metadata?: Json | null
          owner_id?: string | null
          project_id?: string
          reviewer_id?: string | null
          source_agent_config_id?: string | null
          source_kb_item_id?: string | null
          status_id?: string | null
          status_name?: string | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_assets_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_assets_source_agent_config_id_fkey"
            columns: ["source_agent_config_id"]
            isOneToOne: false
            referencedRelation: "agent_configs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_assets_status_id_fkey"
            columns: ["status_id"]
            isOneToOne: false
            referencedRelation: "project_asset_statuses"
            referencedColumns: ["id"]
          },
        ]
      }
      project_comments: {
        Row: {
          author_name: string | null
          content: string
          created_at: string
          id: string
          project_id: string
          related_asset_id: string | null
          related_task_id: string | null
          user_id: string
        }
        Insert: {
          author_name?: string | null
          content: string
          created_at?: string
          id?: string
          project_id: string
          related_asset_id?: string | null
          related_task_id?: string | null
          user_id: string
        }
        Update: {
          author_name?: string | null
          content?: string
          created_at?: string
          id?: string
          project_id?: string
          related_asset_id?: string | null
          related_task_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_comments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_comments_related_asset_id_fkey"
            columns: ["related_asset_id"]
            isOneToOne: false
            referencedRelation: "project_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_comments_related_task_id_fkey"
            columns: ["related_task_id"]
            isOneToOne: false
            referencedRelation: "project_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      project_tasks: {
        Row: {
          assignee: string | null
          completed_at: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          priority: string | null
          project_id: string
          related_asset_id: string | null
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          assignee?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string | null
          project_id: string
          related_asset_id?: string | null
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          assignee?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string | null
          project_id?: string
          related_asset_id?: string | null
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_tasks_related_asset_id_fkey"
            columns: ["related_asset_id"]
            isOneToOne: false
            referencedRelation: "project_assets"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          client_id: string
          completed_at: string | null
          cover_image_url: string | null
          created_at: string
          department_id: string
          description: string | null
          due_date: string | null
          id: string
          metadata: Json | null
          owner: string | null
          progress: number
          started_at: string | null
          status: string
          tags: string[] | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          client_id: string
          completed_at?: string | null
          cover_image_url?: string | null
          created_at?: string
          department_id: string
          description?: string | null
          due_date?: string | null
          id?: string
          metadata?: Json | null
          owner?: string | null
          progress?: number
          started_at?: string | null
          status?: string
          tags?: string[] | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          client_id?: string
          completed_at?: string | null
          cover_image_url?: string | null
          created_at?: string
          department_id?: string
          description?: string | null
          due_date?: string | null
          id?: string
          metadata?: Json | null
          owner?: string | null
          progress?: number
          started_at?: string | null
          status?: string
          tags?: string[] | null
          title?: string
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
      seed_demo_data_for_user: {
        Args: { p_user_id: string }
        Returns: undefined
      }
    }
    Enums: {
      execution_mode: "n8n" | "internal"
      kb_category:
        | "document"
        | "image"
        | "video"
        | "audio"
        | "template"
        | "script"
        | "brand_asset"
        | "winning_ad"
        | "research"
        | "playbook"
        | "faq"
        | "offer"
      kb_scope: "agency" | "client" | "project" | "task"
      n8n_scope: "agency" | "client"
      output_behavior: "chat_stream" | "modal_display" | "field_populate"
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
    Enums: {
      execution_mode: ["n8n", "internal"],
      kb_category: [
        "document",
        "image",
        "video",
        "audio",
        "template",
        "script",
        "brand_asset",
        "winning_ad",
        "research",
        "playbook",
        "faq",
        "offer",
      ],
      kb_scope: ["agency", "client", "project", "task"],
      n8n_scope: ["agency", "client"],
      output_behavior: ["chat_stream", "modal_display", "field_populate"],
    },
  },
} as const

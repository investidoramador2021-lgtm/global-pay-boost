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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      blog_posts: {
        Row: {
          author_bio: string
          author_credentials: string
          author_name: string
          author_role: string
          category: string
          content: string
          created_at: string
          excerpt: string
          id: string
          is_published: boolean
          meta_description: string
          meta_title: string
          published_at: string
          read_time: string
          slug: string
          tags: string[]
          title: string
          updated_at: string
        }
        Insert: {
          author_bio: string
          author_credentials?: string
          author_name: string
          author_role: string
          category?: string
          content: string
          created_at?: string
          excerpt: string
          id?: string
          is_published?: boolean
          meta_description: string
          meta_title: string
          published_at?: string
          read_time?: string
          slug: string
          tags?: string[]
          title: string
          updated_at?: string
        }
        Update: {
          author_bio?: string
          author_credentials?: string
          author_name?: string
          author_role?: string
          category?: string
          content?: string
          created_at?: string
          excerpt?: string
          id?: string
          is_published?: boolean
          meta_description?: string
          meta_title?: string
          published_at?: string
          read_time?: string
          slug?: string
          tags?: string[]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      competitors: {
        Row: {
          avg_speed: string
          created_at: string
          fees: string
          id: string
          kyc_policy: string
          min_swap_usd: string
          mrc_advantage: string
          name: string
          primary_weakness: string
          slug: string
          updated_at: string
        }
        Insert: {
          avg_speed?: string
          created_at?: string
          fees?: string
          id?: string
          kyc_policy?: string
          min_swap_usd?: string
          mrc_advantage?: string
          name: string
          primary_weakness?: string
          slug: string
          updated_at?: string
        }
        Update: {
          avg_speed?: string
          created_at?: string
          fees?: string
          id?: string
          kyc_policy?: string
          min_swap_usd?: string
          mrc_advantage?: string
          name?: string
          primary_weakness?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      customers: {
        Row: {
          created_at: string
          email: string
          id: string
          latest_from_currency: string | null
          latest_payment_method: string | null
          latest_to_currency: string | null
          latest_trade_direction: string | null
          metadata: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          latest_from_currency?: string | null
          latest_payment_method?: string | null
          latest_to_currency?: string | null
          latest_trade_direction?: string | null
          metadata?: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          latest_from_currency?: string | null
          latest_payment_method?: string | null
          latest_to_currency?: string | null
          latest_trade_direction?: string | null
          metadata?: Json
          updated_at?: string
        }
        Relationships: []
      }
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      partner_profiles: {
        Row: {
          btc_wallet: string
          created_at: string
          first_name: string
          id: string
          last_name: string
          referral_code: string
          updated_at: string
          user_id: string
        }
        Insert: {
          btc_wallet: string
          created_at?: string
          first_name: string
          id?: string
          last_name: string
          referral_code: string
          updated_at?: string
          user_id: string
        }
        Update: {
          btc_wallet?: string
          created_at?: string
          first_name?: string
          id?: string
          last_name?: string
          referral_code?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      partner_transactions: {
        Row: {
          asset: string
          commission_btc: number
          completed_at: string
          created_at: string
          id: string
          is_paid: boolean
          paid_at: string | null
          partner_id: string
          volume: number
        }
        Insert: {
          asset: string
          commission_btc?: number
          completed_at?: string
          created_at?: string
          id?: string
          is_paid?: boolean
          paid_at?: string | null
          partner_id: string
          volume?: number
        }
        Update: {
          asset?: string
          commission_btc?: number
          completed_at?: string
          created_at?: string
          id?: string
          is_paid?: boolean
          paid_at?: string | null
          partner_id?: string
          volume?: number
        }
        Relationships: [
          {
            foreignKeyName: "partner_transactions_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partner_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_update_tokens: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          purpose: string
          token: string
          used_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          purpose?: string
          token: string
          used_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          purpose?: string
          token?: string
          used_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth_key: string
          created_at: string
          endpoint: string
          id: string
          p256dh: string
          transaction_id: string | null
        }
        Insert: {
          auth_key: string
          created_at?: string
          endpoint: string
          id?: string
          p256dh: string
          transaction_id?: string | null
        }
        Update: {
          auth_key?: string
          created_at?: string
          endpoint?: string
          id?: string
          p256dh?: string
          transaction_id?: string | null
        }
        Relationships: []
      }
      support_chat_logs: {
        Row: {
          ai_response: string
          created_at: string
          id: string
          page_url: string | null
          persona_name: string
          session_id: string
          user_message: string
        }
        Insert: {
          ai_response: string
          created_at?: string
          id?: string
          page_url?: string | null
          persona_name: string
          session_id: string
          user_message: string
        }
        Update: {
          ai_response?: string
          created_at?: string
          id?: string
          page_url?: string | null
          persona_name?: string
          session_id?: string
          user_message?: string
        }
        Relationships: []
      }
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
        }
        Relationships: []
      }
      swap_transactions: {
        Row: {
          amount: number
          created_at: string
          from_currency: string
          id: string
          payin_address: string
          recipient_address: string
          ref_code: string | null
          to_currency: string
          transaction_id: string
        }
        Insert: {
          amount?: number
          created_at?: string
          from_currency: string
          id?: string
          payin_address?: string
          recipient_address: string
          ref_code?: string | null
          to_currency: string
          transaction_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          from_currency?: string
          id?: string
          payin_address?: string
          recipient_address?: string
          ref_code?: string | null
          to_currency?: string
          transaction_id?: string
        }
        Relationships: []
      }
      transfer_email_subscriptions: {
        Row: {
          created_at: string
          email: string
          id: string
          transaction_id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          transaction_id: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          transaction_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      x_bot_logs: {
        Row: {
          author_username: string
          created_at: string
          id: string
          match_type: string
          matched_token: string
          reply_tweet_id: string | null
          tweet_id: string
        }
        Insert: {
          author_username: string
          created_at?: string
          id?: string
          match_type?: string
          matched_token: string
          reply_tweet_id?: string | null
          tweet_id: string
        }
        Update: {
          author_username?: string
          created_at?: string
          id?: string
          match_type?: string
          matched_token?: string
          reply_tweet_id?: string | null
          tweet_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
      }
      upsert_customer_capture: {
        Args: {
          p_email: string
          p_latest_from_currency?: string
          p_latest_payment_method?: string
          p_latest_to_currency?: string
          p_latest_trade_direction?: string
          p_metadata?: Json
        }
        Returns: {
          created_at: string
          email: string
          id: string
          latest_from_currency: string | null
          latest_payment_method: string | null
          latest_to_currency: string | null
          latest_trade_direction: string | null
          metadata: Json
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "customers"
          isOneToOne: true
          isSetofReturn: false
        }
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const

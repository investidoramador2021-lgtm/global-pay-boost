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
      audit_access_logs: {
        Row: {
          accessed_at: string
          accessed_by: string
          audit_link_id: string
          id: string
          ip_address: string | null
          user_agent: string | null
        }
        Insert: {
          accessed_at?: string
          accessed_by: string
          audit_link_id: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
        }
        Update: {
          accessed_at?: string
          accessed_by?: string
          audit_link_id?: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_access_logs_audit_link_id_fkey"
            columns: ["audit_link_id"]
            isOneToOne: false
            referencedRelation: "audit_links"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_links: {
        Row: {
          alert_id: string
          created_at: string
          created_by: string
          expires_at: string
          id: string
          token: string
        }
        Insert: {
          alert_id: string
          created_at?: string
          created_by: string
          expires_at?: string
          id?: string
          token?: string
        }
        Update: {
          alert_id?: string
          created_at?: string
          created_by?: string
          expires_at?: string
          id?: string
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_links_alert_id_fkey"
            columns: ["alert_id"]
            isOneToOne: false
            referencedRelation: "compliance_alerts"
            referencedColumns: ["id"]
          },
        ]
      }
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
      compliance_alerts: {
        Row: {
          alert_type: string
          amount: number
          created_at: string
          destination_wallet: string
          exchange_rate: number
          from_currency: string
          id: string
          msb_reference: string
          notes: string | null
          partner_email: string
          partner_id: string | null
          partner_legal_name: string
          source_wallet: string
          status: string
          to_currency: string
          transaction_ref: string
          updated_at: string
        }
        Insert: {
          alert_type?: string
          amount?: number
          created_at?: string
          destination_wallet?: string
          exchange_rate?: number
          from_currency?: string
          id?: string
          msb_reference?: string
          notes?: string | null
          partner_email?: string
          partner_id?: string | null
          partner_legal_name?: string
          source_wallet?: string
          status?: string
          to_currency?: string
          transaction_ref: string
          updated_at?: string
        }
        Update: {
          alert_type?: string
          amount?: number
          created_at?: string
          destination_wallet?: string
          exchange_rate?: number
          from_currency?: string
          id?: string
          msb_reference?: string
          notes?: string | null
          partner_email?: string
          partner_id?: string | null
          partner_legal_name?: string
          source_wallet?: string
          status?: string
          to_currency?: string
          transaction_ref?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "compliance_alerts_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partner_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      compliance_documents: {
        Row: {
          created_at: string
          file_name: string
          file_url: string
          hold_id: string
          id: string
          metadata: Json | null
          uploaded_by: string
        }
        Insert: {
          created_at?: string
          file_name: string
          file_url?: string
          hold_id: string
          id?: string
          metadata?: Json | null
          uploaded_by?: string
        }
        Update: {
          created_at?: string
          file_name?: string
          file_url?: string
          hold_id?: string
          id?: string
          metadata?: Json | null
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "compliance_documents_hold_id_fkey"
            columns: ["hold_id"]
            isOneToOne: false
            referencedRelation: "compliance_holds"
            referencedColumns: ["id"]
          },
        ]
      }
      compliance_holds: {
        Row: {
          admin_notes: string | null
          created_at: string
          hold_type: string
          id: string
          partner_id: string
          partner_notified_at: string | null
          partner_transaction_id: string | null
          provider_case_id: string | null
          resolved_at: string | null
          status: string
          updated_at: string
          upload_token: string | null
          upload_token_expires_at: string | null
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          hold_type?: string
          id?: string
          partner_id: string
          partner_notified_at?: string | null
          partner_transaction_id?: string | null
          provider_case_id?: string | null
          resolved_at?: string | null
          status?: string
          updated_at?: string
          upload_token?: string | null
          upload_token_expires_at?: string | null
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          hold_type?: string
          id?: string
          partner_id?: string
          partner_notified_at?: string | null
          partner_transaction_id?: string | null
          provider_case_id?: string | null
          resolved_at?: string | null
          status?: string
          updated_at?: string
          upload_token?: string | null
          upload_token_expires_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "compliance_holds_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partner_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compliance_holds_partner_transaction_id_fkey"
            columns: ["partner_transaction_id"]
            isOneToOne: false
            referencedRelation: "partner_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      compliance_logs: {
        Row: {
          actor: string
          created_at: string
          details: string | null
          event_type: string
          hold_id: string
          id: string
          metadata: Json | null
        }
        Insert: {
          actor?: string
          created_at?: string
          details?: string | null
          event_type?: string
          hold_id: string
          id?: string
          metadata?: Json | null
        }
        Update: {
          actor?: string
          created_at?: string
          details?: string | null
          event_type?: string
          hold_id?: string
          id?: string
          metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "compliance_logs_hold_id_fkey"
            columns: ["hold_id"]
            isOneToOne: false
            referencedRelation: "compliance_holds"
            referencedColumns: ["id"]
          },
        ]
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
      developer_profiles: {
        Row: {
          created_at: string
          id: string
          partner_id: string
          tier: string
          totp_configured: boolean
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          partner_id: string
          tier?: string
          totp_configured?: boolean
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          partner_id?: string
          tier?: string
          totp_configured?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "developer_profiles_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: true
            referencedRelation: "partner_profiles"
            referencedColumns: ["id"]
          },
        ]
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
      exchange_assets: {
        Row: {
          created_at: string
          has_external_id: boolean
          id: string
          image_url: string
          is_active: boolean
          is_featured: boolean
          is_stable: boolean
          name: string
          network: string
          supports_fixed_rate: boolean
          ticker: string
          tier: number
          token_contract: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          has_external_id?: boolean
          id?: string
          image_url?: string
          is_active?: boolean
          is_featured?: boolean
          is_stable?: boolean
          name: string
          network?: string
          supports_fixed_rate?: boolean
          ticker: string
          tier?: number
          token_contract?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          has_external_id?: boolean
          id?: string
          image_url?: string
          is_active?: boolean
          is_featured?: boolean
          is_stable?: boolean
          name?: string
          network?: string
          supports_fixed_rate?: boolean
          ticker?: string
          tier?: number
          token_contract?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      invoices: {
        Row: {
          created_at: string
          crypto_amount: number
          crypto_ticker: string
          expires_at: string
          fiat_amount: number
          fiat_currency: string
          id: string
          invoice_id: string
          language: string
          net_crypto_amount: number
          payer_email: string
          payer_name: string
          rate_locked_at: string
          requester_email: string
          requester_name: string
          service_fee_amount: number
          service_fee_percent: number
          status: string
          token: string
          updated_at: string
          wallet_address: string
        }
        Insert: {
          created_at?: string
          crypto_amount: number
          crypto_ticker: string
          expires_at?: string
          fiat_amount: number
          fiat_currency?: string
          id?: string
          invoice_id: string
          language?: string
          net_crypto_amount?: number
          payer_email: string
          payer_name: string
          rate_locked_at?: string
          requester_email: string
          requester_name: string
          service_fee_amount?: number
          service_fee_percent?: number
          status?: string
          token?: string
          updated_at?: string
          wallet_address: string
        }
        Update: {
          created_at?: string
          crypto_amount?: number
          crypto_ticker?: string
          expires_at?: string
          fiat_amount?: number
          fiat_currency?: string
          id?: string
          invoice_id?: string
          language?: string
          net_crypto_amount?: number
          payer_email?: string
          payer_name?: string
          rate_locked_at?: string
          requester_email?: string
          requester_name?: string
          service_fee_amount?: number
          service_fee_percent?: number
          status?: string
          token?: string
          updated_at?: string
          wallet_address?: string
        }
        Relationships: []
      }
      lend_earn_transactions: {
        Row: {
          amount: number
          apy_percent: number | null
          created_at: string
          currency: string
          deposit_address: string | null
          email: string
          external_tx_id: string | null
          id: string
          language: string
          loan_amount: number | null
          loan_currency: string | null
          ltv_percent: number | null
          phone: string | null
          status: string
          tx_type: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          amount?: number
          apy_percent?: number | null
          created_at?: string
          currency: string
          deposit_address?: string | null
          email: string
          external_tx_id?: string | null
          id?: string
          language?: string
          loan_amount?: number | null
          loan_currency?: string | null
          ltv_percent?: number | null
          phone?: string | null
          status?: string
          tx_type: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          apy_percent?: number | null
          created_at?: string
          currency?: string
          deposit_address?: string | null
          email?: string
          external_tx_id?: string | null
          id?: string
          language?: string
          loan_amount?: number | null
          loan_currency?: string | null
          ltv_percent?: number | null
          phone?: string | null
          status?: string
          tx_type?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      partner_api_keys: {
        Row: {
          api_secret_hash: string
          created_at: string
          id: string
          ip_whitelist: string[] | null
          is_active: boolean
          key_id: string
          last_used_at: string | null
          partner_id: string
          updated_at: string
          webhook_url: string | null
        }
        Insert: {
          api_secret_hash: string
          created_at?: string
          id?: string
          ip_whitelist?: string[] | null
          is_active?: boolean
          key_id?: string
          last_used_at?: string | null
          partner_id: string
          updated_at?: string
          webhook_url?: string | null
        }
        Update: {
          api_secret_hash?: string
          created_at?: string
          id?: string
          ip_whitelist?: string[] | null
          is_active?: boolean
          key_id?: string
          last_used_at?: string | null
          partner_id?: string
          updated_at?: string
          webhook_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "partner_api_keys_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partner_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_balances: {
        Row: {
          available_btc: number
          created_at: string
          id: string
          last_credited_at: string | null
          partner_id: string
          pending_btc: number
          total_earned_btc: number
          updated_at: string
        }
        Insert: {
          available_btc?: number
          created_at?: string
          id?: string
          last_credited_at?: string | null
          partner_id: string
          pending_btc?: number
          total_earned_btc?: number
          updated_at?: string
        }
        Update: {
          available_btc?: number
          created_at?: string
          id?: string
          last_credited_at?: string | null
          partner_id?: string
          pending_btc?: number
          total_earned_btc?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_balances_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: true
            referencedRelation: "partner_profiles"
            referencedColumns: ["id"]
          },
        ]
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
          verification_expires_at: string | null
          verification_status: string
          verification_token: string | null
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
          verification_expires_at?: string | null
          verification_status?: string
          verification_token?: string | null
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
          verification_expires_at?: string | null
          verification_status?: string
          verification_token?: string | null
        }
        Relationships: []
      }
      partner_totp_secrets: {
        Row: {
          backup_codes: string[] | null
          created_at: string
          encrypted_secret: string
          id: string
          is_verified: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          backup_codes?: string[] | null
          created_at?: string
          encrypted_secret: string
          id?: string
          is_verified?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          backup_codes?: string[] | null
          created_at?: string
          encrypted_secret?: string
          id?: string
          is_verified?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      partner_transactions: {
        Row: {
          asset: string
          changenow_order_id: string | null
          commission_btc: number
          completed_at: string
          created_at: string
          id: string
          is_paid: boolean
          mrc_transaction_id: string | null
          paid_at: string | null
          partner_id: string
          provider_response: Json | null
          request_payload: Json | null
          source: string
          status: string
          volume: number
        }
        Insert: {
          asset: string
          changenow_order_id?: string | null
          commission_btc?: number
          completed_at?: string
          created_at?: string
          id?: string
          is_paid?: boolean
          mrc_transaction_id?: string | null
          paid_at?: string | null
          partner_id: string
          provider_response?: Json | null
          request_payload?: Json | null
          source?: string
          status?: string
          volume?: number
        }
        Update: {
          asset?: string
          changenow_order_id?: string | null
          commission_btc?: number
          completed_at?: string
          created_at?: string
          id?: string
          is_paid?: boolean
          mrc_transaction_id?: string | null
          paid_at?: string | null
          partner_id?: string
          provider_response?: Json | null
          request_payload?: Json | null
          source?: string
          status?: string
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
      payout_requests: {
        Row: {
          admin_notes: string | null
          amount_btc: number
          created_at: string
          id: string
          partner_id: string
          payout_txid: string | null
          processed_at: string | null
          requested_at: string
          status: string
          updated_at: string
          wallet_address: string
        }
        Insert: {
          admin_notes?: string | null
          amount_btc?: number
          created_at?: string
          id?: string
          partner_id: string
          payout_txid?: string | null
          processed_at?: string | null
          requested_at?: string
          status?: string
          updated_at?: string
          wallet_address?: string
        }
        Update: {
          admin_notes?: string | null
          amount_btc?: number
          created_at?: string
          id?: string
          partner_id?: string
          payout_txid?: string | null
          processed_at?: string | null
          requested_at?: string
          status?: string
          updated_at?: string
          wallet_address?: string
        }
        Relationships: [
          {
            foreignKeyName: "payout_requests_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partner_profiles"
            referencedColumns: ["id"]
          },
        ]
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
      webhook_deliveries: {
        Row: {
          attempts: number
          created_at: string
          error_message: string | null
          id: string
          last_attempt_at: string | null
          max_attempts: number
          mrc_transaction_id: string
          next_retry_at: string | null
          partner_id: string
          payload: Json
          response_code: number | null
          status: string
          updated_at: string
          webhook_url: string
        }
        Insert: {
          attempts?: number
          created_at?: string
          error_message?: string | null
          id?: string
          last_attempt_at?: string | null
          max_attempts?: number
          mrc_transaction_id: string
          next_retry_at?: string | null
          partner_id: string
          payload?: Json
          response_code?: number | null
          status?: string
          updated_at?: string
          webhook_url: string
        }
        Update: {
          attempts?: number
          created_at?: string
          error_message?: string | null
          id?: string
          last_attempt_at?: string | null
          max_attempts?: number
          mrc_transaction_id?: string
          next_retry_at?: string | null
          partner_id?: string
          payload?: Json
          response_code?: number | null
          status?: string
          updated_at?: string
          webhook_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhook_deliveries_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partner_profiles"
            referencedColumns: ["id"]
          },
        ]
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
      get_invoice_by_token: {
        Args: { p_token: string }
        Returns: {
          created_at: string
          crypto_amount: number
          crypto_ticker: string
          expires_at: string
          fiat_amount: number
          fiat_currency: string
          id: string
          invoice_id: string
          language: string
          net_crypto_amount: number
          payer_email: string
          payer_name: string
          rate_locked_at: string
          requester_email: string
          requester_name: string
          service_fee_amount: number
          service_fee_percent: number
          status: string
          token: string
          updated_at: string
          wallet_address: string
        }[]
        SetofOptions: {
          from: "*"
          to: "invoices"
          isOneToOne: false
          isSetofReturn: true
        }
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

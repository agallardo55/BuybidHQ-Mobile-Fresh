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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      accounts: {
        Row: {
          billing_status: string | null
          created_at: string | null
          feature_group_enabled: boolean
          id: string
          name: string
          plan: string
          seat_limit: number
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string | null
        }
        Insert: {
          billing_status?: string | null
          created_at?: string | null
          feature_group_enabled?: boolean
          id?: string
          name: string
          plan?: string
          seat_limit?: number
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string | null
        }
        Update: {
          billing_status?: string | null
          created_at?: string | null
          feature_group_enabled?: boolean
          id?: string
          name?: string
          plan?: string
          seat_limit?: number
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      bid_request_access: {
        Row: {
          access_level: string
          bid_request_id: string | null
          created_at: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          access_level: string
          bid_request_id?: string | null
          created_at?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          access_level?: string
          bid_request_id?: string | null
          created_at?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bid_request_access_bid_request_id_fkey"
            columns: ["bid_request_id"]
            isOneToOne: false
            referencedRelation: "bid_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      bid_request_access_cache: {
        Row: {
          bid_request_id: string | null
          can_update: boolean
          can_view: boolean
          id: string
          last_updated: string | null
          user_id: string | null
        }
        Insert: {
          bid_request_id?: string | null
          can_update?: boolean
          can_view?: boolean
          id?: string
          last_updated?: string | null
          user_id?: string | null
        }
        Update: {
          bid_request_id?: string | null
          can_update?: boolean
          can_view?: boolean
          id?: string
          last_updated?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bid_request_access_cache_bid_request_id_fkey"
            columns: ["bid_request_id"]
            isOneToOne: false
            referencedRelation: "bid_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      bid_requests: {
        Row: {
          account_id: string | null
          contacts: string | null
          created_at: string
          id: string
          images_id: string | null
          recon: string | null
          status: Database["public"]["Enums"]["bid_status"] | null
          user_id: string | null
          vehicle_id: string | null
        }
        Insert: {
          account_id?: string | null
          contacts?: string | null
          created_at?: string
          id?: string
          images_id?: string | null
          recon?: string | null
          status?: Database["public"]["Enums"]["bid_status"] | null
          user_id?: string | null
          vehicle_id?: string | null
        }
        Update: {
          account_id?: string | null
          contacts?: string | null
          created_at?: string
          id?: string
          images_id?: string | null
          recon?: string | null
          status?: Database["public"]["Enums"]["bid_status"] | null
          user_id?: string | null
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bid_requests_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bid_requests_contacts_fkey"
            columns: ["contacts"]
            isOneToOne: false
            referencedRelation: "buyers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bid_requests_images_id_fkey"
            columns: ["images_id"]
            isOneToOne: false
            referencedRelation: "images"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bid_requests_recon_fkey"
            columns: ["recon"]
            isOneToOne: false
            referencedRelation: "reconditioning"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bid_requests_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_bid_request_user"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "buybidhq_users"
            referencedColumns: ["id"]
          },
        ]
      }
      bid_responses: {
        Row: {
          bid_request_id: string
          buyer_id: string
          created_at: string
          id: string
          notes: string | null
          offer_amount: number
          status: string
          updated_at: string
        }
        Insert: {
          bid_request_id: string
          buyer_id: string
          created_at?: string
          id?: string
          notes?: string | null
          offer_amount: number
          status?: string
          updated_at?: string
        }
        Update: {
          bid_request_id?: string
          buyer_id?: string
          created_at?: string
          id?: string
          notes?: string | null
          offer_amount?: number
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bid_responses_bid_request_id_fkey"
            columns: ["bid_request_id"]
            isOneToOne: false
            referencedRelation: "bid_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bid_responses_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "buyers"
            referencedColumns: ["id"]
          },
        ]
      }
      bid_submission_tokens: {
        Row: {
          bid_request_id: string
          buyer_id: string
          created_at: string | null
          expires_at: string
          id: string
          is_used: boolean | null
          token: string
          used_at: string | null
        }
        Insert: {
          bid_request_id: string
          buyer_id: string
          created_at?: string | null
          expires_at: string
          id?: string
          is_used?: boolean | null
          token: string
          used_at?: string | null
        }
        Update: {
          bid_request_id?: string
          buyer_id?: string
          created_at?: string | null
          expires_at?: string
          id?: string
          is_used?: boolean | null
          token?: string
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bid_submission_tokens_bid_request_id_fkey"
            columns: ["bid_request_id"]
            isOneToOne: false
            referencedRelation: "bid_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bid_submission_tokens_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "buyers"
            referencedColumns: ["id"]
          },
        ]
      }
      bid_usage: {
        Row: {
          amount: number | null
          bid_request_id: string | null
          billed_at: string | null
          billing_status: string | null
          created_at: string | null
          id: string
          stripe_invoice_item_id: string | null
          subscription_id: string | null
          user_id: string
        }
        Insert: {
          amount?: number | null
          bid_request_id?: string | null
          billed_at?: string | null
          billing_status?: string | null
          created_at?: string | null
          id?: string
          stripe_invoice_item_id?: string | null
          subscription_id?: string | null
          user_id: string
        }
        Update: {
          amount?: number | null
          bid_request_id?: string | null
          billed_at?: string | null
          billing_status?: string | null
          created_at?: string | null
          id?: string
          stripe_invoice_item_id?: string | null
          subscription_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bid_usage_bid_request_id_fkey"
            columns: ["bid_request_id"]
            isOneToOne: false
            referencedRelation: "bid_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bid_usage_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bid_usage_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "buybidhq_users"
            referencedColumns: ["id"]
          },
        ]
      }
      bookValues: {
        Row: {
          blackbook: string | null
          created_at: string
          id: number
          jd_power: string | null
          kelly_bluebook: string | null
          manheim: string | null
          vehicle_id: string | null
        }
        Insert: {
          blackbook?: string | null
          created_at?: string
          id?: number
          jd_power?: string | null
          kelly_bluebook?: string | null
          manheim?: string | null
          vehicle_id?: string | null
        }
        Update: {
          blackbook?: string | null
          created_at?: string
          id?: number
          jd_power?: string | null
          kelly_bluebook?: string | null
          manheim?: string | null
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_values_vehicle"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      buybidhq_users: {
        Row: {
          account_id: string | null
          address: string | null
          agreed_at: string | null
          app_role: string
          bid_request_email_enabled: boolean | null
          bid_request_sms_enabled: boolean | null
          buyers: string | null
          city: string | null
          company: string | null
          created_at: string
          dealership_id: string | null
          deleted_at: string | null
          email: string
          full_name: string | null
          id: string
          is_active: boolean | null
          mobile_number: string | null
          password_hash: string | null
          phone_carrier: string | null
          phone_type: Database["public"]["Enums"]["phone_number_type"] | null
          phone_validated: boolean | null
          phone_validation_date: string | null
          profile_photo: string | null
          role: Database["public"]["Enums"]["user_role"]
          sms_consent: boolean | null
          state: string | null
          status: string | null
          updated_at: string | null
          website: string | null
          zip_code: string | null
        }
        Insert: {
          account_id?: string | null
          address?: string | null
          agreed_at?: string | null
          app_role?: string
          bid_request_email_enabled?: boolean | null
          bid_request_sms_enabled?: boolean | null
          buyers?: string | null
          city?: string | null
          company?: string | null
          created_at?: string
          dealership_id?: string | null
          deleted_at?: string | null
          email: string
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          mobile_number?: string | null
          password_hash?: string | null
          phone_carrier?: string | null
          phone_type?: Database["public"]["Enums"]["phone_number_type"] | null
          phone_validated?: boolean | null
          phone_validation_date?: string | null
          profile_photo?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          sms_consent?: boolean | null
          state?: string | null
          status?: string | null
          updated_at?: string | null
          website?: string | null
          zip_code?: string | null
        }
        Update: {
          account_id?: string | null
          address?: string | null
          agreed_at?: string | null
          app_role?: string
          bid_request_email_enabled?: boolean | null
          bid_request_sms_enabled?: boolean | null
          buyers?: string | null
          city?: string | null
          company?: string | null
          created_at?: string
          dealership_id?: string | null
          deleted_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          mobile_number?: string | null
          password_hash?: string | null
          phone_carrier?: string | null
          phone_type?: Database["public"]["Enums"]["phone_number_type"] | null
          phone_validated?: boolean | null
          phone_validation_date?: string | null
          profile_photo?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          sms_consent?: boolean | null
          state?: string | null
          status?: string | null
          updated_at?: string | null
          website?: string | null
          zip_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "buybidhq_users_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "buybidhq_users_dealership_id_fkey"
            columns: ["dealership_id"]
            isOneToOne: false
            referencedRelation: "dealerships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "users_contacts_fkey"
            columns: ["buyers"]
            isOneToOne: false
            referencedRelation: "buyers"
            referencedColumns: ["id"]
          },
        ]
      }
      buyers: {
        Row: {
          accepted_bids: number | null
          account_id: string | null
          address: string | null
          buyer_mobile: string | null
          buyer_name: string | null
          buyer_phone: string | null
          city: string | null
          created_at: string
          dealer_id: string | null
          dealer_name: string | null
          declined_bids: number | null
          email: string
          id: string
          last_validated_at: string | null
          owner_user_id: string | null
          pending_bids: number | null
          phone_carrier: string | null
          phone_validation_status:
            | Database["public"]["Enums"]["buyer_phone_validation_status"]
            | null
          standardized_phone: string | null
          state: string | null
          updated_at: string | null
          user_id: string | null
          zip_code: string | null
        }
        Insert: {
          accepted_bids?: number | null
          account_id?: string | null
          address?: string | null
          buyer_mobile?: string | null
          buyer_name?: string | null
          buyer_phone?: string | null
          city?: string | null
          created_at?: string
          dealer_id?: string | null
          dealer_name?: string | null
          declined_bids?: number | null
          email: string
          id?: string
          last_validated_at?: string | null
          owner_user_id?: string | null
          pending_bids?: number | null
          phone_carrier?: string | null
          phone_validation_status?:
            | Database["public"]["Enums"]["buyer_phone_validation_status"]
            | null
          standardized_phone?: string | null
          state?: string | null
          updated_at?: string | null
          user_id?: string | null
          zip_code?: string | null
        }
        Update: {
          accepted_bids?: number | null
          account_id?: string | null
          address?: string | null
          buyer_mobile?: string | null
          buyer_name?: string | null
          buyer_phone?: string | null
          city?: string | null
          created_at?: string
          dealer_id?: string | null
          dealer_name?: string | null
          declined_bids?: number | null
          email?: string
          id?: string
          last_validated_at?: string | null
          owner_user_id?: string | null
          pending_bids?: number | null
          phone_carrier?: string | null
          phone_validation_status?:
            | Database["public"]["Enums"]["buyer_phone_validation_status"]
            | null
          standardized_phone?: string | null
          state?: string | null
          updated_at?: string | null
          user_id?: string | null
          zip_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "buyers_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "buyers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "buybidhq_users"
            referencedColumns: ["id"]
          },
        ]
      }
      buyers_access_cache: {
        Row: {
          access_level: string
          buyer_id: string
          id: string
          last_updated: string | null
          user_id: string
        }
        Insert: {
          access_level: string
          buyer_id: string
          id?: string
          last_updated?: string | null
          user_id: string
        }
        Update: {
          access_level?: string
          buyer_id?: string
          id?: string
          last_updated?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "buyers_access_cache_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "buyers"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_submissions: {
        Row: {
          created_at: string | null
          email: string
          id: string
          inquiry_type: string | null
          message: string
          name: string
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          inquiry_type?: string | null
          message: string
          name: string
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          inquiry_type?: string | null
          message?: string
          name?: string
        }
        Relationships: []
      }
      dealership_access_cache: {
        Row: {
          access_level: string
          dealership_id: string | null
          id: string
          last_updated: string | null
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          access_level: string
          dealership_id?: string | null
          id?: string
          last_updated?: string | null
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          access_level?: string
          dealership_id?: string | null
          id?: string
          last_updated?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dealership_access_cache_dealership_id_fkey"
            columns: ["dealership_id"]
            isOneToOne: false
            referencedRelation: "dealerships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dealership_access_cache_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "buybidhq_users"
            referencedColumns: ["id"]
          },
        ]
      }
      dealerships: {
        Row: {
          address: string | null
          business_email: string
          business_phone: string
          city: string | null
          created_at: string
          dealer_id: string | null
          dealer_name: string
          dealer_type: Database["public"]["Enums"]["dealer_type"]
          id: string
          is_active: boolean | null
          last_updated_at: string | null
          last_updated_by: string | null
          license_number: string | null
          notes: string | null
          primary_assigned_at: string | null
          primary_dealer_email: string | null
          primary_dealer_name: string | null
          primary_dealer_phone: string | null
          primary_user_id: string | null
          state: string | null
          website: string | null
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          business_email: string
          business_phone: string
          city?: string | null
          created_at?: string
          dealer_id?: string | null
          dealer_name: string
          dealer_type?: Database["public"]["Enums"]["dealer_type"]
          id?: string
          is_active?: boolean | null
          last_updated_at?: string | null
          last_updated_by?: string | null
          license_number?: string | null
          notes?: string | null
          primary_assigned_at?: string | null
          primary_dealer_email?: string | null
          primary_dealer_name?: string | null
          primary_dealer_phone?: string | null
          primary_user_id?: string | null
          state?: string | null
          website?: string | null
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          business_email?: string
          business_phone?: string
          city?: string | null
          created_at?: string
          dealer_id?: string | null
          dealer_name?: string
          dealer_type?: Database["public"]["Enums"]["dealer_type"]
          id?: string
          is_active?: boolean | null
          last_updated_at?: string | null
          last_updated_by?: string | null
          license_number?: string | null
          notes?: string | null
          primary_assigned_at?: string | null
          primary_dealer_email?: string | null
          primary_dealer_name?: string | null
          primary_dealer_phone?: string | null
          primary_user_id?: string | null
          state?: string | null
          website?: string | null
          zip_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dealerships_last_updated_by_fkey"
            columns: ["last_updated_by"]
            isOneToOne: false
            referencedRelation: "buybidhq_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dealerships_primary_user_id_fkey"
            columns: ["primary_user_id"]
            isOneToOne: false
            referencedRelation: "buybidhq_users"
            referencedColumns: ["id"]
          },
        ]
      }
      deleted_users: {
        Row: {
          address: string | null
          city: string | null
          created_at: string
          dealership_id: string | null
          deleted_at: string
          deleted_by: string | null
          deletion_reason: string | null
          email: string
          full_name: string | null
          id: string
          is_active: boolean | null
          mobile_number: string | null
          original_created_at: string | null
          role: Database["public"]["Enums"]["user_role"]
          state: string | null
          status: string | null
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string
          dealership_id?: string | null
          deleted_at?: string
          deleted_by?: string | null
          deletion_reason?: string | null
          email: string
          full_name?: string | null
          id: string
          is_active?: boolean | null
          mobile_number?: string | null
          original_created_at?: string | null
          role: Database["public"]["Enums"]["user_role"]
          state?: string | null
          status?: string | null
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string
          dealership_id?: string | null
          deleted_at?: string
          deleted_by?: string | null
          deletion_reason?: string | null
          email?: string
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          mobile_number?: string | null
          original_created_at?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          state?: string | null
          status?: string | null
          zip_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deleted_users_dealership_id_fkey"
            columns: ["dealership_id"]
            isOneToOne: false
            referencedRelation: "dealerships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deleted_users_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "buybidhq_users"
            referencedColumns: ["id"]
          },
        ]
      }
      images: {
        Row: {
          bid_request_id: string | null
          created_at: string
          id: string
          image_url: string | null
          sequence_order: number | null
        }
        Insert: {
          bid_request_id?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          sequence_order?: number | null
        }
        Update: {
          bid_request_id?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          sequence_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "images_bid_request_id_fkey"
            columns: ["bid_request_id"]
            isOneToOne: false
            referencedRelation: "bid_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      individual_dealers: {
        Row: {
          address: string | null
          business_email: string
          business_name: string
          business_phone: string | null
          city: string | null
          created_at: string | null
          id: string
          license_number: string | null
          state: string | null
          updated_at: string | null
          user_id: string
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          business_email: string
          business_name: string
          business_phone?: string | null
          city?: string | null
          created_at?: string | null
          id?: string
          license_number?: string | null
          state?: string | null
          updated_at?: string | null
          user_id: string
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          business_email?: string
          business_name?: string
          business_phone?: string | null
          city?: string | null
          created_at?: string | null
          id?: string
          license_number?: string | null
          state?: string | null
          updated_at?: string | null
          user_id?: string
          zip_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_user"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "buybidhq_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "individual_dealers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "buybidhq_users"
            referencedColumns: ["id"]
          },
        ]
      }
      mfa_settings: {
        Row: {
          created_at: string | null
          id: string
          last_verified: string | null
          method: Database["public"]["Enums"]["mfa_method"]
          status: Database["public"]["Enums"]["mfa_status"]
          trusted_devices: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_verified?: string | null
          method?: Database["public"]["Enums"]["mfa_method"]
          status?: Database["public"]["Enums"]["mfa_status"]
          trusted_devices?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          last_verified?: string | null
          method?: Database["public"]["Enums"]["mfa_method"]
          status?: Database["public"]["Enums"]["mfa_status"]
          trusted_devices?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      mfa_verifications: {
        Row: {
          attempts: number | null
          created_at: string | null
          expires_at: string
          id: string
          method: Database["public"]["Enums"]["mfa_method"]
          user_id: string
          verification_code: string
          verified_at: string | null
        }
        Insert: {
          attempts?: number | null
          created_at?: string | null
          expires_at: string
          id?: string
          method: Database["public"]["Enums"]["mfa_method"]
          user_id: string
          verification_code: string
          verified_at?: string | null
        }
        Update: {
          attempts?: number | null
          created_at?: string | null
          expires_at?: string
          id?: string
          method?: Database["public"]["Enums"]["mfa_method"]
          user_id?: string
          verification_code?: string
          verified_at?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          cleared_at: string | null
          content: Json
          created_at: string
          id: string
          read_at: string | null
          reference_id: string | null
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Insert: {
          cleared_at?: string | null
          content: Json
          created_at?: string
          id?: string
          read_at?: string | null
          reference_id?: string | null
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Update: {
          cleared_at?: string | null
          content?: Json
          created_at?: string
          id?: string
          read_at?: string | null
          reference_id?: string | null
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "buybidhq_users"
            referencedColumns: ["id"]
          },
        ]
      }
      password_reset_attempts: {
        Row: {
          attempts: number | null
          created_at: string | null
          email: string
          id: string
          last_attempt: string | null
          reset_at: string | null
        }
        Insert: {
          attempts?: number | null
          created_at?: string | null
          email: string
          id?: string
          last_attempt?: string | null
          reset_at?: string | null
        }
        Update: {
          attempts?: number | null
          created_at?: string | null
          email?: string
          id?: string
          last_attempt?: string | null
          reset_at?: string | null
        }
        Relationships: []
      }
      phone_validation_batch_results: {
        Row: {
          area_code: string | null
          batch_id: string | null
          carrier: string | null
          formatted_number: string | null
          id: string
          is_mobile: boolean | null
          is_valid: boolean | null
          number_type: string | null
          original_number: string | null
          status: string | null
          user_id: string | null
          validation_date: string | null
          validation_details: Json | null
          validation_error: string | null
        }
        Insert: {
          area_code?: string | null
          batch_id?: string | null
          carrier?: string | null
          formatted_number?: string | null
          id?: string
          is_mobile?: boolean | null
          is_valid?: boolean | null
          number_type?: string | null
          original_number?: string | null
          status?: string | null
          user_id?: string | null
          validation_date?: string | null
          validation_details?: Json | null
          validation_error?: string | null
        }
        Update: {
          area_code?: string | null
          batch_id?: string | null
          carrier?: string | null
          formatted_number?: string | null
          id?: string
          is_mobile?: boolean | null
          is_valid?: boolean | null
          number_type?: string | null
          original_number?: string | null
          status?: string | null
          user_id?: string | null
          validation_date?: string | null
          validation_details?: Json | null
          validation_error?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "phone_validation_batch_results_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "buybidhq_users"
            referencedColumns: ["id"]
          },
        ]
      }
      reconditioning: {
        Row: {
          brakes: string | null
          created_at: string
          engine_light: string | null
          id: string
          maintenance: string | null
          recon_details: string | null
          recon_estimate: string | null
          tires: string | null
          vehicle_id: string | null
          windshield: string | null
        }
        Insert: {
          brakes?: string | null
          created_at?: string
          engine_light?: string | null
          id?: string
          maintenance?: string | null
          recon_details?: string | null
          recon_estimate?: string | null
          tires?: string | null
          vehicle_id?: string | null
          windshield?: string | null
        }
        Update: {
          brakes?: string | null
          created_at?: string
          engine_light?: string | null
          id?: string
          maintenance?: string | null
          recon_details?: string | null
          recon_estimate?: string | null
          tires?: string | null
          vehicle_id?: string | null
          windshield?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_reconditioning_vehicle"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          billing_cycle_anchor: string | null
          created_at: string
          current_period_end: string | null
          id: string
          is_trial: boolean | null
          last_billing_date: string | null
          next_billing_date: string | null
          plan_type: string
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          trial_ends_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          billing_cycle_anchor?: string | null
          created_at?: string
          current_period_end?: string | null
          id?: string
          is_trial?: boolean | null
          last_billing_date?: string | null
          next_billing_date?: string | null
          plan_type: string
          status: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          trial_ends_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          billing_cycle_anchor?: string | null
          created_at?: string
          current_period_end?: string | null
          id?: string
          is_trial?: boolean | null
          last_billing_date?: string | null
          next_billing_date?: string | null
          plan_type?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          trial_ends_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      superadmin: {
        Row: {
          created_at: string | null
          email: string
          full_name: string
          id: number
          mobile_number: string | null
          password_hash: string
          role: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          full_name: string
          id?: number
          mobile_number?: string | null
          password_hash: string
          role: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          full_name?: string
          id?: number
          mobile_number?: string | null
          password_hash?: string
          role?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_access_cache: {
        Row: {
          dealership_id: string | null
          id: string
          is_active: boolean | null
          last_updated: string | null
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          dealership_id?: string | null
          id?: string
          is_active?: boolean | null
          last_updated?: string | null
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          dealership_id?: string | null
          id?: string
          is_active?: boolean | null
          last_updated?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_access_cache_dealership_id_fkey"
            columns: ["dealership_id"]
            isOneToOne: false
            referencedRelation: "dealerships"
            referencedColumns: ["id"]
          },
        ]
      }
      user_permissions: {
        Row: {
          created_at: string | null
          id: string
          permission: string
          resource_id: string
          resource_type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          permission: string
          resource_id: string
          resource_type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          permission?: string
          resource_id?: string
          resource_type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_role_cache: {
        Row: {
          cached_at: string
          is_admin: boolean
          user_id: string
        }
        Insert: {
          cached_at?: string
          is_admin?: boolean
          user_id: string
        }
        Update: {
          cached_at?: string
          is_admin?: boolean
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_role_cache_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "buybidhq_users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_security_events: {
        Row: {
          created_at: string | null
          details: Json | null
          event_type: string
          id: string
          ip_address: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          details?: Json | null
          event_type: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          details?: Json | null
          event_type?: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_sessions: {
        Row: {
          created_at: string | null
          device_info: Json | null
          expires_at: string | null
          id: string
          ip_address: string | null
          is_active: boolean | null
          last_activity: string | null
          session_token: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          device_info?: Json | null
          expires_at?: string | null
          id?: string
          ip_address?: string | null
          is_active?: boolean | null
          last_activity?: string | null
          session_token: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          device_info?: Json | null
          expires_at?: string | null
          id?: string
          ip_address?: string | null
          is_active?: boolean | null
          last_activity?: string | null
          session_token?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      vehicle_history: {
        Row: {
          autocheck_report: string | null
          carfax_report: string | null
          created_at: string | null
          history_id: string
          updated_at: string | null
          vehicle_id: string
        }
        Insert: {
          autocheck_report?: string | null
          carfax_report?: string | null
          created_at?: string | null
          history_id?: string
          updated_at?: string | null
          vehicle_id: string
        }
        Update: {
          autocheck_report?: string | null
          carfax_report?: string | null
          created_at?: string | null
          history_id?: string
          updated_at?: string | null
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_history_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicles: {
        Row: {
          created_at: string
          drivetrain: string | null
          engine: string | null
          exterior: string | null
          id: string
          interior: string | null
          make: string | null
          mileage: string | null
          model: string | null
          options: string | null
          transmission: string | null
          trim: string | null
          vin: string | null
          year: string | null
        }
        Insert: {
          created_at?: string
          drivetrain?: string | null
          engine?: string | null
          exterior?: string | null
          id?: string
          interior?: string | null
          make?: string | null
          mileage?: string | null
          model?: string | null
          options?: string | null
          transmission?: string | null
          trim?: string | null
          vin?: string | null
          year?: string | null
        }
        Update: {
          created_at?: string
          drivetrain?: string | null
          engine?: string | null
          exterior?: string | null
          id?: string
          interior?: string | null
          make?: string | null
          mileage?: string | null
          model?: string | null
          options?: string | null
          transmission?: string | null
          trim?: string | null
          vin?: string | null
          year?: string | null
        }
        Relationships: []
      }
      waitlist: {
        Row: {
          created_at: string | null
          email: string
          id: string
          name: string | null
          source: string | null
          status: Database["public"]["Enums"]["waitlist_status"] | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          name?: string | null
          source?: string | null
          status?: Database["public"]["Enums"]["waitlist_status"] | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          name?: string | null
          source?: string | null
          status?: Database["public"]["Enums"]["waitlist_status"] | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      batch_process_carrier_detection: {
        Args: Record<PropertyKey, never>
        Returns: {
          carriers_detected: number
          total_processed: number
        }[]
      }
      can_access_bid_request: {
        Args: { checking_user_id: string; request_id: string }
        Returns: boolean
      }
      can_access_buyer: {
        Args: { checking_user_id: string; target_buyer_id: string }
        Returns: boolean
      }
      can_access_dealership: {
        Args: { checking_user_id: string }
        Returns: boolean
      }
      can_create_bid_request: {
        Args: { user_id: string }
        Returns: Json
      }
      can_manage_user: {
        Args: { manager_id: string; target_user_id: string }
        Returns: boolean
      }
      check_admin_status: {
        Args: { checking_user_id: string }
        Returns: boolean
      }
      check_password_reset_rate_limit: {
        Args: { p_email: string }
        Returns: boolean
      }
      check_user_role: {
        Args: { required_role: string; user_id: string }
        Returns: boolean
      }
      check_user_role_no_rls: {
        Args: {
          required_role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Returns: boolean
      }
      cleanup_phone_numbers: {
        Args: Record<PropertyKey, never>
        Returns: {
          duplicates: number
          invalid: number
          standardized: number
          total_processed: number
        }[]
      }
      clear_notifications: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_complete_bid_request: {
        Args: {
          buyer_ids: string[]
          creator_id: string
          image_urls: string[]
          recon_data: Json
          vehicle_data: Json
        }
        Returns: string
      }
      create_mfa_verification: {
        Args: {
          p_method: Database["public"]["Enums"]["mfa_method"]
          p_user_id: string
        }
        Returns: {
          code: string
          expires_at: string
          verification_id: string
        }[]
      }
      current_user_account_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      current_user_in_account: {
        Args: { a_id: string }
        Returns: boolean
      }
      current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_bid_submission_token: {
        Args: { p_bid_request_id: string; p_buyer_id: string }
        Returns: string
      }
      generate_verification_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_bid_notification_details: {
        Args: { p_bid_response_id: string }
        Returns: {
          buyer_name: string
          creator_phone: string
          offer_amount: number
          vehicle_make: string
          vehicle_model: string
          vehicle_year: string
        }[]
      }
      get_bid_request_details: {
        Args: { p_request_id: string }
        Returns: {
          accessories: string
          brakes: string
          created_at: string
          drivetrain: string
          engine_cylinders: string
          engine_lights: string
          exterior_color: string
          interior_color: string
          maintenance: string
          make: string
          mileage: string
          model: string
          recon_details: string
          recon_estimate: string
          request_id: string
          status: string
          tire: string
          transmission: string
          trim_level: string
          user_full_name: string
          vin: string
          windshield: string
          year: string
        }[]
      }
      get_bid_response_details: {
        Args: { bid_response_id: string }
        Returns: {
          accessories: string
          brakes: string
          dealership: string
          drivetrain: string
          engine_cylinders: string
          engine_lights: string
          exterior_color: string
          interior_color: string
          maintenance: string
          make: string
          mileage: string
          mobile_number: string
          model: string
          offer_amount: number
          recon_details: string
          recon_estimate: string
          request_id: string
          response_id: string
          status: string
          tire: string
          transmission: string
          trim_level: string
          user_full_name: string
          vin: string
          windshield: string
          year: string
        }[]
      }
      get_buyer_user_roles: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          role: Database["public"]["Enums"]["user_role"]
        }[]
      }
      get_carrier_for_validated_number: {
        Args: { p_phone_number: string; p_user_id: string }
        Returns: {
          area_code: string
          carrier: string
          is_valid: boolean
          number_type: Database["public"]["Enums"]["phone_number_type"]
        }[]
      }
      get_public_bid_request_details: {
        Args: { p_token: string }
        Returns: {
          buyer_dealership: string
          buyer_mobile: string
          buyer_name: string
          created_at: string
          notes: string
          request_id: string
          status: string
          vehicle_drivetrain: string
          vehicle_engine: string
          vehicle_make: string
          vehicle_mileage: string
          vehicle_model: string
          vehicle_transmission: string
          vehicle_trim: string
          vehicle_vin: string
          vehicle_year: string
        }[]
      }
      get_sms_gateway_email: {
        Args: { carrier: string; phone_number: string }
        Returns: string
      }
      get_unified_dealer_info: {
        Args: Record<PropertyKey, never>
        Returns: {
          address: string
          business_email: string
          business_name: string
          business_phone: string
          city: string
          dealer_type: Database["public"]["Enums"]["dealer_type"]
          id: string
          license_number: string
          state: string
          user_id: string
          zip_code: string
        }[]
      }
      get_user_dealership: {
        Args: { user_id: string }
        Returns: string
      }
      get_user_profile: {
        Args: { user_id: string }
        Returns: Database["public"]["CompositeTypes"]["user_profile_type"]
      }
      get_user_role: {
        Args: { user_id: string }
        Returns: string
      }
      get_user_with_dealership: {
        Args: { user_id: string }
        Returns: {
          address: string
          business_email: string
          business_phone: string
          city: string
          dealer_name: string
          dealership_id: string
          email: string
          full_name: string
          id: string
          mobile_number: string
          phone_carrier: string
          role: Database["public"]["Enums"]["user_role"]
          state: string
          zip_code: string
        }[]
      }
      handle_user_deletion: {
        Args: {
          deleted_by_id: string
          deletion_reason?: string
          user_id: string
        }
        Returns: undefined
      }
      has_admin_access: {
        Args: { user_id: string }
        Returns: boolean
      }
      has_dealership_access: {
        Args: { target_dealership_id: string; user_id: string }
        Returns: boolean
      }
      has_permission: {
        Args: {
          p_resource_id: string
          p_resource_type: string
          p_user_id: string
        }
        Returns: boolean
      }
      is_admin: {
        Args: { checking_user_id: string }
        Returns: boolean
      }
      is_basic_or_individual: {
        Args: { checking_user_id: string }
        Returns: boolean
      }
      is_dealer: {
        Args: { checking_user_id: string }
        Returns: boolean
      }
      is_primary_dealer: {
        Args: { checking_user_id: string; dealership_id: string }
        Returns: boolean
      }
      is_superadmin: {
        Args: { user_email: string }
        Returns: boolean
      }
      log_security_event: {
        Args: {
          p_details?: Json
          p_event_type: string
          p_ip_address?: string
          p_user_agent?: string
          p_user_id: string
        }
        Returns: undefined
      }
      mark_notifications_as_read: {
        Args: { notification_ids: string[] }
        Returns: string[]
      }
      migrate_individual_dealers: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      process_carrier_detection_batch: {
        Args: Record<PropertyKey, never>
        Returns: {
          carriers_detected: number
          total_processed: number
        }[]
      }
      process_phone_validation_batch: {
        Args: Record<PropertyKey, never>
        Returns: {
          failed: number
          successful: number
          total_processed: number
        }[]
      }
      reset_password_attempts: {
        Args: { p_email: string }
        Returns: undefined
      }
      standardize_buyer_phone: {
        Args: { phone_input: string }
        Returns: string
      }
      standardize_carrier_name: {
        Args: { carrier: string }
        Returns: string
      }
      standardize_phone_number: {
        Args: { phone_input: string }
        Returns: string
      }
      transfer_primary_dealer: {
        Args: {
          current_primary_id: string
          new_primary_id: string
          target_dealership_id: string
        }
        Returns: boolean
      }
      validate_bid_submission_token: {
        Args: { p_token: string }
        Returns: {
          bid_request_id: string
          buyer_id: string
          existing_bid_amount: number
          has_existing_bid: boolean
          is_valid: boolean
        }[]
      }
      validate_phone_with_twilio: {
        Args: { phone_input: string }
        Returns: Json
      }
      verify_mfa_code: {
        Args: { p_user_id: string; p_verification_code: string }
        Returns: {
          attempts_remaining: number
          error_message: string
          is_valid: boolean
        }[]
      }
    }
    Enums: {
      bid_status: "Pending" | "Approved" | "Declined"
      buyer_phone_validation_status:
        | "pending"
        | "valid"
        | "invalid"
        | "processing"
      dealer_type: "individual" | "multi_user"
      mfa_method: "email" | "sms"
      mfa_status: "enabled" | "disabled" | "pending"
      notification_type:
        | "bid_request"
        | "bid_response"
        | "bid_accepted"
        | "bid_declined"
      phone_number_type:
        | "mobile"
        | "landline"
        | "voip"
        | "toll_free"
        | "unknown"
      phone_validation_status: "pending" | "valid" | "invalid"
      subscription_plan_type: "beta-access" | "pay-per-bid" | "individual"
      user_role: "basic" | "individual" | "dealer" | "associate" | "admin"
      user_role_old: "admin" | "dealer" | "associate"
      waitlist_status: "pending" | "approved" | "rejected"
    }
    CompositeTypes: {
      user_profile_type: {
        id: string | null
        email: string | null
        role: Database["public"]["Enums"]["user_role"] | null
        status: string | null
        full_name: string | null
        mobile_number: string | null
        address: string | null
        city: string | null
        state: string | null
        zip_code: string | null
        company: string | null
        dealership_id: string | null
        is_active: boolean | null
        created_at: string | null
        updated_at: string | null
        deleted_at: string | null
      }
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
      bid_status: ["Pending", "Approved", "Declined"],
      buyer_phone_validation_status: [
        "pending",
        "valid",
        "invalid",
        "processing",
      ],
      dealer_type: ["individual", "multi_user"],
      mfa_method: ["email", "sms"],
      mfa_status: ["enabled", "disabled", "pending"],
      notification_type: [
        "bid_request",
        "bid_response",
        "bid_accepted",
        "bid_declined",
      ],
      phone_number_type: ["mobile", "landline", "voip", "toll_free", "unknown"],
      phone_validation_status: ["pending", "valid", "invalid"],
      subscription_plan_type: ["beta-access", "pay-per-bid", "individual"],
      user_role: ["basic", "individual", "dealer", "associate", "admin"],
      user_role_old: ["admin", "dealer", "associate"],
      waitlist_status: ["pending", "approved", "rejected"],
    },
  },
} as const

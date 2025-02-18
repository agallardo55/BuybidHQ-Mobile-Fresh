export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
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
          {
            foreignKeyName: "fk_bid_request_user"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "buyers_user_roles_view"
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
          address: string | null
          agreed_at: string | null
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
          state: string | null
          status: string | null
          updated_at: string | null
          website: string | null
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          agreed_at?: string | null
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
          state?: string | null
          status?: string | null
          updated_at?: string | null
          website?: string | null
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          agreed_at?: string | null
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
          state?: string | null
          status?: string | null
          updated_at?: string | null
          website?: string | null
          zip_code?: string | null
        }
        Relationships: [
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
          address: string | null
          buyer_mobile: string | null
          buyer_name: string | null
          buyer_phone: string | null
          city: string | null
          created_at: string
          dealer_name: string | null
          declined_bids: number | null
          email: string
          id: string
          last_validated_at: string | null
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
          address?: string | null
          buyer_mobile?: string | null
          buyer_name?: string | null
          buyer_phone?: string | null
          city?: string | null
          created_at?: string
          dealer_name?: string | null
          declined_bids?: number | null
          email: string
          id?: string
          last_validated_at?: string | null
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
          address?: string | null
          buyer_mobile?: string | null
          buyer_name?: string | null
          buyer_phone?: string | null
          city?: string | null
          created_at?: string
          dealer_name?: string | null
          declined_bids?: number | null
          email?: string
          id?: string
          last_validated_at?: string | null
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
            foreignKeyName: "buyers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "buybidhq_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "buyers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "buyers_user_roles_view"
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
          {
            foreignKeyName: "dealership_access_cache_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "buyers_user_roles_view"
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
            foreignKeyName: "dealerships_last_updated_by_fkey"
            columns: ["last_updated_by"]
            isOneToOne: false
            referencedRelation: "buyers_user_roles_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dealerships_primary_user_id_fkey"
            columns: ["primary_user_id"]
            isOneToOne: false
            referencedRelation: "buybidhq_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dealerships_primary_user_id_fkey"
            columns: ["primary_user_id"]
            isOneToOne: false
            referencedRelation: "buyers_user_roles_view"
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
          {
            foreignKeyName: "deleted_users_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "buyers_user_roles_view"
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
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "buyers_user_roles_view"
            referencedColumns: ["id"]
          },
        ]
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
          {
            foreignKeyName: "phone_validation_batch_results_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "buyers_user_roles_view"
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
          created_at: string
          current_period_end: string | null
          id: string
          plan_type: string
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_period_end?: string | null
          id?: string
          plan_type: string
          status: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_period_end?: string | null
          id?: string
          plan_type?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
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
    }
    Views: {
      buyers_user_roles_view: {
        Row: {
          id: string | null
          role: Database["public"]["Enums"]["user_role"] | null
        }
        Insert: {
          id?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
        }
        Update: {
          id?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
        }
        Relationships: []
      }
    }
    Functions: {
      batch_process_carrier_detection: {
        Args: Record<PropertyKey, never>
        Returns: {
          total_processed: number
          carriers_detected: number
          carriers_by_type: Json
        }[]
      }
      can_access_bid_request: {
        Args: {
          checking_user_id: string
          request_id: string
        }
        Returns: boolean
      }
      can_access_buyer: {
        Args: {
          checking_user_id: string
          target_buyer_id: string
        }
        Returns: boolean
      }
      can_manage_user: {
        Args: {
          manager_id: string
          target_user_id: string
        }
        Returns: boolean
      }
      check_admin_status: {
        Args: {
          checking_user_id: string
        }
        Returns: boolean
      }
      check_user_role: {
        Args: {
          user_id: string
          required_role: string
        }
        Returns: boolean
      }
      check_user_role_no_rls: {
        Args: {
          user_id: string
          required_role: Database["public"]["Enums"]["user_role"]
        }
        Returns: boolean
      }
      cleanup_phone_numbers: {
        Args: Record<PropertyKey, never>
        Returns: {
          total_processed: number
          standardized: number
          invalid: number
          duplicates: number
        }[]
      }
      clear_notifications: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_complete_bid_request: {
        Args: {
          vehicle_data: Json
          recon_data: Json
          image_urls: string[]
          buyer_ids: string[]
          creator_id: string
        }
        Returns: string
      }
      create_mfa_verification: {
        Args: {
          p_user_id: string
          p_method: Database["public"]["Enums"]["mfa_method"]
        }
        Returns: {
          verification_id: string
          code: string
          expires_at: string
        }[]
      }
      generate_bid_submission_token: {
        Args: {
          p_bid_request_id: string
          p_buyer_id: string
        }
        Returns: string
      }
      generate_verification_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_bid_request_details: {
        Args: {
          p_request_id: string
        }
        Returns: {
          request_id: string
          created_at: string
          status: string
          year: string
          make: string
          model: string
          trim_level: string
          vin: string
          mileage: string
          user_full_name: string
          engine_cylinders: string
          transmission: string
          drivetrain: string
          exterior_color: string
          interior_color: string
          accessories: string
          windshield: string
          engine_lights: string
          brakes: string
          tire: string
          maintenance: string
          recon_estimate: string
          recon_details: string
        }[]
      }
      get_bid_response_details: {
        Args: {
          bid_response_id: string
        }
        Returns: {
          response_id: string
          request_id: string
          year: string
          make: string
          model: string
          trim_level: string
          vin: string
          mileage: string
          exterior_color: string
          interior_color: string
          windshield: string
          engine_lights: string
          brakes: string
          tire: string
          maintenance: string
          recon_estimate: string
          recon_details: string
          accessories: string
          transmission: string
          engine_cylinders: string
          drivetrain: string
          user_full_name: string
          dealership: string
          mobile_number: string
          offer_amount: number
          status: string
        }[]
      }
      get_carrier_for_validated_number: {
        Args: {
          p_user_id: string
          p_phone_number: string
        }
        Returns: {
          carrier: string
          number_type: Database["public"]["Enums"]["phone_number_type"]
          area_code: string
          is_valid: boolean
        }[]
      }
      get_sms_gateway_email: {
        Args: {
          phone_number: string
          carrier: string
        }
        Returns: string
      }
      get_user_dealership: {
        Args: {
          user_id: string
        }
        Returns: string
      }
      get_user_profile: {
        Args: {
          user_id: string
        }
        Returns: Database["public"]["CompositeTypes"]["user_profile_type"]
      }
      get_user_role: {
        Args: {
          user_id: string
        }
        Returns: string
      }
      get_user_with_dealership: {
        Args: {
          user_id: string
        }
        Returns: {
          id: string
          email: string
          role: Database["public"]["Enums"]["user_role"]
          full_name: string
          mobile_number: string
          address: string
          city: string
          state: string
          zip_code: string
          dealership_id: string
          dealer_name: string
          business_phone: string
          business_email: string
          phone_carrier: string
        }[]
      }
      handle_user_deletion: {
        Args: {
          user_id: string
          deleted_by_id: string
          deletion_reason?: string
        }
        Returns: undefined
      }
      has_admin_access: {
        Args: {
          user_id: string
        }
        Returns: boolean
      }
      has_dealership_access: {
        Args: {
          user_id: string
          target_dealership_id: string
        }
        Returns: boolean
      }
      has_permission: {
        Args: {
          p_user_id: string
          p_resource_type: string
          p_resource_id: string
        }
        Returns: boolean
      }
      is_admin: {
        Args: {
          checking_user_id: string
        }
        Returns: boolean
      }
      is_basic_or_individual: {
        Args: {
          checking_user_id: string
        }
        Returns: boolean
      }
      is_dealer: {
        Args: {
          checking_user_id: string
        }
        Returns: boolean
      }
      is_primary_dealer: {
        Args: {
          checking_user_id: string
          dealership_id: string
        }
        Returns: boolean
      }
      is_superadmin: {
        Args: {
          user_email: string
        }
        Returns: boolean
      }
      mark_notifications_as_read: {
        Args: {
          notification_ids: string[]
        }
        Returns: string[]
      }
      process_carrier_detection_batch: {
        Args: Record<PropertyKey, never>
        Returns: {
          total_processed: number
          carriers_detected: number
        }[]
      }
      process_phone_validation_batch: {
        Args: Record<PropertyKey, never>
        Returns: {
          total_processed: number
          successful: number
          failed: number
        }[]
      }
      standardize_buyer_phone: {
        Args: {
          phone_input: string
        }
        Returns: string
      }
      standardize_carrier_name: {
        Args: {
          carrier: string
        }
        Returns: string
      }
      standardize_phone_number: {
        Args: {
          phone_input: string
        }
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
        Args: {
          p_token: string
        }
        Returns: {
          is_valid: boolean
          bid_request_id: string
          buyer_id: string
          existing_bid_amount: number
          has_existing_bid: boolean
        }[]
      }
      validate_phone_with_twilio: {
        Args: {
          phone_input: string
        }
        Returns: Json
      }
      verify_mfa_code: {
        Args: {
          p_user_id: string
          p_verification_code: string
        }
        Returns: {
          is_valid: boolean
          attempts_remaining: number
          error_message: string
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
      user_role: "basic" | "individual" | "dealer" | "associate" | "admin"
      user_role_old: "admin" | "dealer" | "associate"
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

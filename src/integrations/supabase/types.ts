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
          dealer_number: string | null
          declined_bids: number | null
          email: string
          id: string
          pending_bids: number | null
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
          dealer_number?: string | null
          declined_bids?: number | null
          email: string
          id?: string
          pending_bids?: number | null
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
          dealer_number?: string | null
          declined_bids?: number | null
          email?: string
          id?: string
          pending_bids?: number | null
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
          state: string | null
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
          state?: string | null
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
          state?: string | null
          zip_code?: string | null
        }
        Relationships: []
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
        }
        Insert: {
          bid_request_id?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
        }
        Update: {
          bid_request_id?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
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
      reconditioning: {
        Row: {
          brakes: string | null
          created_at: string
          engine_light: string | null
          id: string
          maintenance: string | null
          recod_details: string | null
          recon_est: string | null
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
          recod_details?: string | null
          recon_est?: string | null
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
          recod_details?: string | null
          recon_est?: string | null
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
      [_ in never]: never
    }
    Functions: {
      can_manage_user: {
        Args: {
          manager_id: string
          target_user_id: string
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
      get_bid_request_details: {
        Args: {
          p_request_id: string
        }
        Returns: {
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
      get_user_dealership: {
        Args: {
          user_id: string
        }
        Returns: string
      }
      get_user_role: {
        Args: {
          user_id: string
        }
        Returns: string
      }
      handle_user_deletion: {
        Args: {
          user_id: string
          deleted_by_id: string
          deletion_reason?: string
        }
        Returns: undefined
      }
    }
    Enums: {
      bid_status: "Pending" | "Approved" | "Declined"
      user_role: "basic" | "individual" | "dealer" | "associate" | "admin"
      user_role_old: "admin" | "dealer" | "associate"
    }
    CompositeTypes: {
      [_ in never]: never
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

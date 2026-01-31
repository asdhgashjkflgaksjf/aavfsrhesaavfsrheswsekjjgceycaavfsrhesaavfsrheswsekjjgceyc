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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      gold_prices: {
        Row: {
          created_at: string
          id: string
          previous_price: number | null
          price: number
          price_date: string
          updated_at: string
          weight: string
        }
        Insert: {
          created_at?: string
          id?: string
          previous_price?: number | null
          price: number
          price_date?: string
          updated_at?: string
          weight: string
        }
        Update: {
          created_at?: string
          id?: string
          previous_price?: number | null
          price?: number
          price_date?: string
          updated_at?: string
          weight?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          confirmation_code: string | null
          created_at: string
          customer_address: string
          customer_email: string
          customer_name: string
          customer_phone: string
          id: string
          order_number: string
          payment_proof_url: string | null
          product_name: string
          product_price: number
          product_weight: string
          quantity: number
          shipping_method: string
          status: string
          total_price: number
          updated_at: string
        }
        Insert: {
          confirmation_code?: string | null
          created_at?: string
          customer_address: string
          customer_email: string
          customer_name: string
          customer_phone: string
          id?: string
          order_number: string
          payment_proof_url?: string | null
          product_name: string
          product_price: number
          product_weight: string
          quantity?: number
          shipping_method: string
          status?: string
          total_price: number
          updated_at?: string
        }
        Update: {
          confirmation_code?: string | null
          created_at?: string
          customer_address?: string
          customer_email?: string
          customer_name?: string
          customer_phone?: string
          id?: string
          order_number?: string
          payment_proof_url?: string | null
          product_name?: string
          product_price?: number
          product_weight?: string
          quantity?: number
          shipping_method?: string
          status?: string
          total_price?: number
          updated_at?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          created_at: string
          description: string | null
          discount: number
          discounted_price: number
          id: string
          image_url: string | null
          is_active: boolean
          is_best_seller: boolean
          name: string
          original_price: number
          sold: number
          sort_order: number
          updated_at: string
          weight: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          discount?: number
          discounted_price: number
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_best_seller?: boolean
          name: string
          original_price: number
          sold?: number
          sort_order?: number
          updated_at?: string
          weight: string
        }
        Update: {
          created_at?: string
          description?: string | null
          discount?: number
          discounted_price?: number
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_best_seller?: boolean
          name?: string
          original_price?: number
          sold?: number
          sort_order?: number
          updated_at?: string
          weight?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      settings: {
        Row: {
          created_at: string
          id: string
          key: string
          updated_at: string
          value: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          key: string
          updated_at?: string
          value?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          key?: string
          updated_at?: string
          value?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_order_with_payment_proof: {
        Args: {
          p_customer_address: string
          p_customer_email: string
          p_customer_name: string
          p_customer_phone: string
          p_order_number: string
          p_payment_proof_url: string
          p_product_name: string
          p_product_price: number
          p_product_weight: string
          p_quantity: number
          p_shipping_method: string
          p_total_price: number
        }
        Returns: {
          confirmation_code: string
          id: string
        }[]
      }
      generate_confirmation_code: { Args: never; Returns: string }
      get_order_by_credentials: {
        Args: { p_confirmation_code: string; p_order_number: string }
        Returns: {
          created_at: string
          id: string
          order_number: string
          payment_proof_url: string
          product_name: string
          product_price: number
          product_weight: string
          quantity: number
          shipping_method: string
          status: string
          total_price: number
          updated_at: string
        }[]
      }
      get_order_by_order_number:
        | {
            Args: { p_order_number: string }
            Returns: {
              confirmation_code: string
              created_at: string
              customer_address: string
              customer_email: string
              customer_name: string
              customer_phone: string
              id: string
              order_number: string
              payment_proof_url: string
              product_name: string
              product_price: number
              product_weight: string
              quantity: number
              shipping_method: string
              status: string
              total_price: number
              updated_at: string
            }[]
          }
        | {
            Args: { p_confirmation_code?: string; p_order_number: string }
            Returns: {
              confirmation_code: string
              created_at: string
              customer_address: string
              customer_email: string
              customer_name: string
              customer_phone: string
              id: string
              order_number: string
              payment_proof_url: string
              product_name: string
              product_price: number
              product_weight: string
              quantity: number
              shipping_method: string
              status: string
              total_price: number
              updated_at: string
            }[]
          }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      update_payment_proof: {
        Args: {
          p_confirmation_code: string
          p_order_number: string
          p_payment_proof_url: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const

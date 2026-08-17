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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      addresses: {
        Row: {
          cep: string
          city: string
          complement: string | null
          created_at: string
          id: string
          is_default: boolean
          label: string | null
          neighborhood: string
          number: string
          recipient: string | null
          state: string
          street: string
          updated_at: string
          user_id: string
        }
        Insert: {
          cep: string
          city: string
          complement?: string | null
          created_at?: string
          id?: string
          is_default?: boolean
          label?: string | null
          neighborhood: string
          number: string
          recipient?: string | null
          state: string
          street: string
          updated_at?: string
          user_id: string
        }
        Update: {
          cep?: string
          city?: string
          complement?: string | null
          created_at?: string
          id?: string
          is_default?: boolean
          label?: string | null
          neighborhood?: string
          number?: string
          recipient?: string | null
          state?: string
          street?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      art_approval_events: {
        Row: {
          art_approval_id: string
          created_at: string
          description: string | null
          event_type: string
          id: string
          responsible: string
          title: string
        }
        Insert: {
          art_approval_id: string
          created_at?: string
          description?: string | null
          event_type: string
          id?: string
          responsible?: string
          title: string
        }
        Update: {
          art_approval_id?: string
          created_at?: string
          description?: string | null
          event_type?: string
          id?: string
          responsible?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "art_approval_events_art_approval_id_fkey"
            columns: ["art_approval_id"]
            isOneToOne: false
            referencedRelation: "art_approvals"
            referencedColumns: ["id"]
          },
        ]
      }
      art_approval_feedback: {
        Row: {
          art_approval_id: string
          created_at: string
          id: string
          message: string
          reference_file_url: string | null
          user_id: string
        }
        Insert: {
          art_approval_id: string
          created_at?: string
          id?: string
          message: string
          reference_file_url?: string | null
          user_id: string
        }
        Update: {
          art_approval_id?: string
          created_at?: string
          id?: string
          message?: string
          reference_file_url?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "art_approval_feedback_art_approval_id_fkey"
            columns: ["art_approval_id"]
            isOneToOne: false
            referencedRelation: "art_approvals"
            referencedColumns: ["id"]
          },
        ]
      }
      art_approval_versions: {
        Row: {
          art_approval_id: string
          created_at: string
          download_url: string | null
          id: string
          preview_image_url: string | null
          team_notes: string | null
          version_number: number
        }
        Insert: {
          art_approval_id: string
          created_at?: string
          download_url?: string | null
          id?: string
          preview_image_url?: string | null
          team_notes?: string | null
          version_number?: number
        }
        Update: {
          art_approval_id?: string
          created_at?: string
          download_url?: string | null
          id?: string
          preview_image_url?: string | null
          team_notes?: string | null
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "art_approval_versions_art_approval_id_fkey"
            columns: ["art_approval_id"]
            isOneToOne: false
            referencedRelation: "art_approvals"
            referencedColumns: ["id"]
          },
        ]
      }
      art_approvals: {
        Row: {
          approval_deadline: string | null
          approved_at: string | null
          created_at: string
          download_url: string | null
          id: string
          order_id: string | null
          preview_image_url: string | null
          product_id: string | null
          product_name: string | null
          project_name: string
          status: Database["public"]["Enums"]["art_status"]
          team_notes: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          approval_deadline?: string | null
          approved_at?: string | null
          created_at?: string
          download_url?: string | null
          id?: string
          order_id?: string | null
          preview_image_url?: string | null
          product_id?: string | null
          product_name?: string | null
          project_name: string
          status?: Database["public"]["Enums"]["art_status"]
          team_notes?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          approval_deadline?: string | null
          approved_at?: string | null
          created_at?: string
          download_url?: string | null
          id?: string
          order_id?: string | null
          preview_image_url?: string | null
          product_id?: string | null
          product_name?: string | null
          project_name?: string
          status?: Database["public"]["Enums"]["art_status"]
          team_notes?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "art_approvals_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "art_approvals_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          display_order: number
          featured: boolean
          id: string
          image_url: string | null
          name: string
          parent_id: string | null
          slug: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number
          featured?: boolean
          id?: string
          image_url?: string | null
          name: string
          parent_id?: string | null
          slug: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number
          featured?: boolean
          id?: string
          image_url?: string | null
          name?: string
          parent_id?: string | null
          slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories_tree"
            referencedColumns: ["id"]
          },
        ]
      }
      favorites: {
        Row: {
          created_at: string
          id: string
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      help_topics: {
        Row: {
          active: boolean
          content: string
          created_at: string
          display_order: number
          id: string
          title: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          content: string
          created_at?: string
          display_order?: number
          id?: string
          title: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          content?: string
          created_at?: string
          display_order?: number
          id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          amount_due: number | null
          amount_paid: number
          created_at: string
          customer_name: string
          customer_phone: string | null
          delivery_type: string
          id: string
          items: Json
          notes: string | null
          paid_at: string | null
          payment_confirmed_by: string | null
          payment_notes: string | null
          payment_status: string
          status: Database["public"]["Enums"]["order_status"]
          total: number
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_due?: number | null
          amount_paid?: number
          created_at?: string
          customer_name: string
          customer_phone?: string | null
          delivery_type?: string
          id?: string
          items?: Json
          notes?: string | null
          paid_at?: string | null
          payment_confirmed_by?: string | null
          payment_notes?: string | null
          payment_status?: string
          status?: Database["public"]["Enums"]["order_status"]
          total?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_due?: number | null
          amount_paid?: number
          created_at?: string
          customer_name?: string
          customer_phone?: string | null
          delivery_type?: string
          id?: string
          items?: Json
          notes?: string | null
          paid_at?: string | null
          payment_confirmed_by?: string | null
          payment_notes?: string | null
          payment_status?: string
          status?: Database["public"]["Enums"]["order_status"]
          total?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      product_upsells: {
        Row: {
          created_at: string
          display_order: number
          id: string
          product_id: string
          upsell_product_id: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          id?: string
          product_id: string
          upsell_product_id: string
        }
        Update: {
          created_at?: string
          display_order?: number
          id?: string
          product_id?: string
          upsell_product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_upsells_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_upsells_upsell_product_id_fkey"
            columns: ["upsell_product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          active: boolean
          category_id: string | null
          created_at: string
          description: string | null
          featured: boolean
          id: string
          image_url: string | null
          images: Json
          kind: Database["public"]["Enums"]["product_kind"]
          price: number
          slug: string
          title: string
          updated_at: string
          variations: Json
        }
        Insert: {
          active?: boolean
          category_id?: string | null
          created_at?: string
          description?: string | null
          featured?: boolean
          id?: string
          image_url?: string | null
          images?: Json
          kind?: Database["public"]["Enums"]["product_kind"]
          price: number
          slug: string
          title: string
          updated_at?: string
          variations?: Json
        }
        Update: {
          active?: boolean
          category_id?: string | null
          created_at?: string
          description?: string | null
          featured?: boolean
          id?: string
          image_url?: string | null
          images?: Json
          kind?: Database["public"]["Enums"]["product_kind"]
          price?: number
          slug?: string
          title?: string
          updated_at?: string
          variations?: Json
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories_tree"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          cpf: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          whatsapp_opt_in: boolean
          whatsapp_opt_in_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          cpf?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          whatsapp_opt_in?: boolean
          whatsapp_opt_in_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          cpf?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          whatsapp_opt_in?: boolean
          whatsapp_opt_in_at?: string | null
        }
        Relationships: []
      }
      settings: {
        Row: {
          key: string
          updated_at: string
          value: string | null
        }
        Insert: {
          key: string
          updated_at?: string
          value?: string | null
        }
        Update: {
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
      categories_tree: {
        Row: {
          display_order: number | null
          featured: boolean | null
          id: string | null
          image_url: string | null
          name: string | null
          parent_id: string | null
          parent_name: string | null
          parent_slug: string | null
          slug: string | null
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories_tree"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "customer"
      art_status:
        | "waiting"
        | "adjustment_requested"
        | "new_version"
        | "approved"
        | "expired"
        | "cancelled"
      order_status:
        | "pending"
        | "in_production"
        | "shipped"
        | "completed"
        | "cancelled"
      product_kind: "ready" | "custom"
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
      app_role: ["admin", "customer"],
      art_status: [
        "waiting",
        "adjustment_requested",
        "new_version",
        "approved",
        "expired",
        "cancelled",
      ],
      order_status: [
        "pending",
        "in_production",
        "shipped",
        "completed",
        "cancelled",
      ],
      product_kind: ["ready", "custom"],
    },
  },
} as const

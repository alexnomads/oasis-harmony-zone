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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      companion_pets: {
        Row: {
          accessories: Json | null
          created_at: string | null
          evolution_stage: number
          experience_points: number
          id: string
          level: number
          pet_name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          accessories?: Json | null
          created_at?: string | null
          evolution_stage?: number
          experience_points?: number
          id?: string
          level?: number
          pet_name?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          accessories?: Json | null
          created_at?: string | null
          evolution_stage?: number
          experience_points?: number
          id?: string
          level?: number
          pet_name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      fitness_sessions: {
        Row: {
          created_at: string
          duration: number
          id: string
          points_earned: number
          proof_url: string | null
          reps_completed: number
          updated_at: string
          user_id: string
          verified: boolean
          workout_type: string
        }
        Insert: {
          created_at?: string
          duration?: number
          id?: string
          points_earned?: number
          proof_url?: string | null
          reps_completed?: number
          updated_at?: string
          user_id: string
          verified?: boolean
          workout_type: string
        }
        Update: {
          created_at?: string
          duration?: number
          id?: string
          points_earned?: number
          proof_url?: string | null
          reps_completed?: number
          updated_at?: string
          user_id?: string
          verified?: boolean
          workout_type?: string
        }
        Relationships: []
      }
      meditation_sessions: {
        Row: {
          completed_at: string | null
          created_at: string
          duration: number
          id: string
          points_earned: number
          status: Database["public"]["Enums"]["meditation_status"]
          type: string
          user_id: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          duration?: number
          id?: string
          points_earned?: number
          status?: Database["public"]["Enums"]["meditation_status"]
          type: string
          user_id?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          duration?: number
          id?: string
          points_earned?: number
          status?: Database["public"]["Enums"]["meditation_status"]
          type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      mood_logs: {
        Row: {
          created_at: string | null
          date: string
          energy_level: number
          id: string
          mood_score: number
          stress_level: number
          symptoms: string[] | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          date?: string
          energy_level: number
          id?: string
          mood_score: number
          stress_level: number
          symptoms?: string[] | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          date?: string
          energy_level?: number
          id?: string
          mood_score?: number
          stress_level?: number
          symptoms?: string[] | null
          user_id?: string
        }
        Relationships: []
      }
      pet_achievements: {
        Row: {
          achievement_type: string
          description: string
          id: string
          unlocked_at: string | null
          user_id: string
        }
        Insert: {
          achievement_type: string
          description: string
          id?: string
          unlocked_at?: string | null
          user_id: string
        }
        Update: {
          achievement_type?: string
          description?: string
          id?: string
          unlocked_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      roj_currency: {
        Row: {
          created_at: string | null
          roj_points: number
          stars: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          roj_points?: number
          stars?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          roj_points?: number
          stars?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_points: {
        Row: {
          created_at: string
          fitness_points: number | null
          fitness_streak: number | null
          last_fitness_date: string | null
          last_meditation_date: string | null
          meditation_streak: number
          total_points: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          fitness_points?: number | null
          fitness_streak?: number | null
          last_fitness_date?: string | null
          last_meditation_date?: string | null
          meditation_streak?: number
          total_points?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          fitness_points?: number | null
          fitness_streak?: number | null
          last_fitness_date?: string | null
          last_meditation_date?: string | null
          meditation_streak?: number
          total_points?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      global_leaderboard: {
        Row: {
          active_streak: number | null
          display_name: string | null
          email: string | null
          fitness_streak: number | null
          last_fitness_date: string | null
          last_meditation_date: string | null
          meditation_streak: number | null
          total_fitness_sessions: number | null
          total_fitness_time: number | null
          total_meditation_time: number | null
          total_points: number | null
          total_sessions: number | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      add_shared_column_if_not_exists: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_all_completed_sessions: {
        Args: Record<PropertyKey, never>
        Returns: {
          completed_at: string | null
          created_at: string
          duration: number
          id: string
          points_earned: number
          status: Database["public"]["Enums"]["meditation_status"]
          type: string
          user_id: string | null
        }[]
      }
      get_all_meditation_users: {
        Args: Record<PropertyKey, never>
        Returns: {
          user_id: string
        }[]
      }
      get_filtered_completed_sessions: {
        Args: { start_date: string }
        Returns: {
          completed_at: string | null
          created_at: string
          duration: number
          id: string
          points_earned: number
          status: Database["public"]["Enums"]["meditation_status"]
          type: string
          user_id: string | null
        }[]
      }
      get_users_by_meditation_period: {
        Args: { start_date: string }
        Returns: {
          user_id: string
        }[]
      }
      increment_meditation_time: {
        Args: { seconds_param: number; user_id_param: string }
        Returns: undefined
      }
      initialize_existing_user_pets: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      reload_types: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      meditation_status: "in_progress" | "completed" | "cancelled"
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
      meditation_status: ["in_progress", "completed", "cancelled"],
    },
  },
} as const

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      watchlist: {
        Row: {
          id: string;
          user_id: string;
          tmdb_id: number;
          media_type: "movie" | "tv";
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          tmdb_id: number;
          media_type: "movie" | "tv";
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          tmdb_id?: number;
          media_type?: "movie" | "tv";
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "watchlist_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      recommendations: {
        Row: {
          id: string;
          user_id: string;
          mood: "happy" | "reflective" | "excited";
          story: "action" | "comedy" | "romance";
          setting: "past" | "present" | "future";
          tmdb_id: number;
          media_type: "movie" | "tv";
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          mood: "happy" | "reflective" | "excited";
          story: "action" | "comedy" | "romance";
          setting: "past" | "present" | "future";
          tmdb_id: number;
          media_type: "movie" | "tv";
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          mood?: "happy" | "reflective" | "excited";
          story?: "action" | "comedy" | "romance";
          setting?: "past" | "present" | "future";
          tmdb_id?: number;
          media_type?: "movie" | "tv";
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "recommendations_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      recommendation_quotas: {
        Row: {
          user_id: string;
          free_limit: number;
          free_used: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          free_limit?: number;
          free_used?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          free_limit?: number;
          free_used?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      claim_free_recommendation: {
        Args: Record<PropertyKey, never>;
        Returns: Array<{ allowed: boolean; remaining: number }>;
      };
      release_free_recommendation: {
        Args: { p_user_id: string };
        Returns: number;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

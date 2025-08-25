import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Expo environment variables (prefix with EXPO_PUBLIC_ for client-side access)
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://your-project-ref.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';

// Custom storage adapter for React Native
const customStorage = {
  getItem: (key) => AsyncStorage.getItem(key),
  setItem: (key, value) => AsyncStorage.setItem(key, value),
  removeItem: (key) => AsyncStorage.removeItem(key),
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: customStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Database types for TypeScript support
export type Database = {
  public: {
    Tables: {
      habits: {
        Row: {
          id: string;
          name: string;
          icon: string;
          category: string;
          current_streak: number;
          best_streak: number;
          completed_this_week: number;
          total_completions: number;
          created_at: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          id?: string;
          name: string;
          icon: string;
          category?: string;
          current_streak?: number;
          best_streak?: number;
          completed_this_week?: number;
          total_completions?: number;
          created_at?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          id?: string;
          name?: string;
          icon?: string;
          category?: string;
          current_streak?: number;
          best_streak?: number;
          completed_this_week?: number;
          total_completions?: number;
          updated_at?: string;
        };
      };
      progress: {
        Row: {
          id: string;
          habit_id: string;
          completion_date: string;
          completed: boolean;
          note: string | null;
          created_at: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          id?: string;
          habit_id: string;
          completion_date: string;
          completed: boolean;
          note?: string | null;
          created_at?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          id?: string;
          habit_id?: string;
          completion_date?: string;
          completed?: boolean;
          note?: string | null;
          updated_at?: string;
        };
      };
    };
  };
};

import { create } from 'zustand';
import { supabaseAuth, authHelpers } from './supabaseAuth';
import { supabase } from '../supabase';
import * as SecureStore from 'expo-secure-store';

const AUTH_STORAGE_KEY = 'supabase-auth-session';

/**
 * Supabase Auth Store
 * Kullanıcı authentication state'ini yönetir
 */
export const useSupabaseAuthStore = create((set, get) => ({
  // State
  user: null,
  session: null,
  isLoading: true,
  isAuthenticated: false,
  initialized: false,

  // Actions
  setSession: (session) => {
    const user = session?.user || null;
    set({ 
      session, 
      user, 
      isAuthenticated: !!session,
      isLoading: false 
    });

    // Session'ı secure storage'a kaydet
    if (session) {
      SecureStore.setItemAsync(AUTH_STORAGE_KEY, JSON.stringify(session));
    } else {
      SecureStore.deleteItemAsync(AUTH_STORAGE_KEY);
    }
  },

  setLoading: (isLoading) => set({ isLoading }),

  // Initialize auth state
  initialize: async () => {
    try {
      set({ isLoading: true });

      // Önce mevcut session'ı kontrol et
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Session check error:', error);
        set({ 
          session: null, 
          user: null, 
          isAuthenticated: false, 
          isLoading: false,
          initialized: true 
        });
        return;
      }

      // Session varsa state'i güncelle
      if (session) {
        const user = session.user;
        set({ 
          session, 
          user, 
          isAuthenticated: true, 
          isLoading: false,
          initialized: true 
        });
      } else {
        set({ 
          session: null, 
          user: null, 
          isAuthenticated: false, 
          isLoading: false,
          initialized: true 
        });
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      set({ 
        session: null, 
        user: null, 
        isAuthenticated: false, 
        isLoading: false,
        initialized: true 
      });
    }
  },

  // Sign up
  signUp: async (email, password, userData = {}) => {
    set({ isLoading: true });
    const result = await supabaseAuth.signUp(email, password, userData);
    
    if (result.success) {
      get().setSession(result.session);
    } else {
      set({ isLoading: false });
    }
    
    return result;
  },

  // Sign in
  signIn: async (email, password) => {
    set({ isLoading: true });
    const result = await supabaseAuth.signIn(email, password);
    
    if (result.success) {
      get().setSession(result.session);
    } else {
      set({ isLoading: false });
    }
    
    return result;
  },

  // Sign out
  signOut: async () => {
    set({ isLoading: true });
    const result = await supabaseAuth.signOut();
    
    // Başarılı olsun olmasın state'i temizle
    get().setSession(null);
    
    return result;
  },

  // Password reset
  resetPassword: async (email) => {
    return await supabaseAuth.resetPassword(email);
  },

  // Update password
  updatePassword: async (newPassword) => {
    return await supabaseAuth.updatePassword(newPassword);
  },

  // Update email
  updateEmail: async (newEmail) => {
    return await supabaseAuth.updateEmail(newEmail);
  },

  // Refresh session
  refreshSession: async () => {
    const result = await supabaseAuth.refreshSession();
    if (result.success) {
      get().setSession(result.session);
    }
    return result;
  },
}));

// Auth state listener'ı kur
let authListener = null;

export const setupAuthListener = () => {
  if (authListener) return authListener;

  authListener = supabase.auth.onAuthStateChange((event, session) => {
    console.log('Auth state changed:', event, session?.user?.email);
    
    const store = useSupabaseAuthStore.getState();
    
    switch (event) {
      case 'INITIAL_SESSION':
      case 'SIGNED_IN':
        store.setSession(session);
        break;
      case 'SIGNED_OUT':
        store.setSession(null);
        break;
      case 'TOKEN_REFRESHED':
        store.setSession(session);
        break;
      case 'USER_UPDATED':
        if (session) {
          store.setSession(session);
        }
        break;
      default:
        break;
    }
  });

  return authListener;
};

// Auth listener'ı temizle
export const cleanupAuthListener = () => {
  if (authListener) {
    authListener.data.subscription.unsubscribe();
    authListener = null;
  }
};

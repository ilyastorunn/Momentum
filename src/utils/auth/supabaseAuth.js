import { supabase } from '../supabase';
import * as SecureStore from 'expo-secure-store';
import { Alert } from 'react-native';

export const supabaseAuth = {
  // Email/Password ile kayıt
  async signUp(email, password, userData = {}) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData, // Ek kullanıcı verileri
        },
      });

      if (error) throw error;

      return {
        success: true,
        user: data.user,
        session: data.session,
        message: 'Kayıt başarılı! Email adresinizi kontrol edin.',
      };
    } catch (error) {
      console.error('SignUp error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  },

  // Email/Password ile giriş
  async signIn(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      return {
        success: true,
        user: data.user,
        session: data.session,
      };
    } catch (error) {
      console.error('SignIn error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  },

  // Çıkış yap
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('SignOut error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  },

  // Mevcut kullanıcıyı getir
  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;

      return {
        success: true,
        user,
      };
    } catch (error) {
      console.error('GetCurrentUser error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  },

  // Şifre sıfırlama
  async resetPassword(email) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'your-app://reset-password', // Deep link
      });

      if (error) throw error;

      return {
        success: true,
        message: 'Şifre sıfırlama emaili gönderildi.',
      };
    } catch (error) {
      console.error('ResetPassword error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  },

  // Şifre güncelleme
  async updatePassword(newPassword) {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      return {
        success: true,
        message: 'Şifre başarıyla güncellendi.',
      };
    } catch (error) {
      console.error('UpdatePassword error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  },

  // Email güncelleme
  async updateEmail(newEmail) {
    try {
      const { error } = await supabase.auth.updateUser({
        email: newEmail,
      });

      if (error) throw error;

      return {
        success: true,
        message: 'Email güncelleme linki gönderildi.',
      };
    } catch (error) {
      console.error('UpdateEmail error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  },

  // Auth state değişikliklerini dinle
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(event, session);
    });
  },

  // Session refresh
  async refreshSession() {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) throw error;

      return {
        success: true,
        session: data.session,
      };
    } catch (error) {
      console.error('RefreshSession error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  },
};

// Helper functions
export const authHelpers = {
  // Kullanıcı oturum açmış mı kontrol et
  isAuthenticated() {
    return supabase.auth.getSession().then(({ data: { session } }) => {
      return !!session;
    });
  },

  // Access token al
  async getAccessToken() {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token;
  },

  // Kullanıcı ID'si al
  async getUserId() {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id;
  },
};

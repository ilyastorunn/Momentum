import { useEffect } from 'react';
import { useSupabaseAuthStore, setupAuthListener, cleanupAuthListener } from './supabaseAuthStore';
import { Alert } from 'react-native';

/**
 * Supabase Auth Hook
 * Authentication işlemlerini yönetmek için kullanılır
 */
export const useSupabaseAuth = () => {
  const {
    user,
    session,
    isLoading,
    isAuthenticated,
    initialized,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    updateEmail,
    refreshSession,
    initialize,
  } = useSupabaseAuthStore();

  // Component mount olduğunda auth'u initialize et
  useEffect(() => {
    if (!initialized) {
      initialize();
    }

    // Auth listener'ı kur
    const listener = setupAuthListener();

    // Cleanup function
    return () => {
      cleanupAuthListener();
    };
  }, [initialized, initialize]);

  // Helper functions
  const signUpWithAlert = async (email, password, userData = {}) => {
    const result = await signUp(email, password, userData);
    
    if (result.success) {
      Alert.alert('Başarılı', result.message || 'Kayıt başarılı!');
    } else {
      Alert.alert('Hata', result.error || 'Kayıt sırasında hata oluştu.');
    }
    
    return result;
  };

  const signInWithAlert = async (email, password) => {
    const result = await signIn(email, password);
    
    if (result.success) {
      Alert.alert('Başarılı', 'Giriş başarılı!');
    } else {
      Alert.alert('Hata', result.error || 'Giriş sırasında hata oluştu.');
    }
    
    return result;
  };

  const signOutWithAlert = async () => {
    const result = await signOut();
    
    if (result.success) {
      Alert.alert('Başarılı', 'Çıkış yapıldı.');
    } else {
      Alert.alert('Hata', result.error || 'Çıkış sırasında hata oluştu.');
    }
    
    return result;
  };

  const resetPasswordWithAlert = async (email) => {
    const result = await resetPassword(email);
    
    if (result.success) {
      Alert.alert('Başarılı', result.message || 'Şifre sıfırlama emaili gönderildi.');
    } else {
      Alert.alert('Hata', result.error || 'Email gönderilirken hata oluştu.');
    }
    
    return result;
  };

  return {
    // State
    user,
    session,
    isLoading,
    isAuthenticated,
    initialized,

    // Raw actions (Alert'siz)
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    updateEmail,
    refreshSession,

    // Alert'li actions
    signUpWithAlert,
    signInWithAlert,
    signOutWithAlert,
    resetPasswordWithAlert,

    // Helper properties
    userId: user?.id,
    userEmail: user?.email,
    userMetadata: user?.user_metadata,
  };
};

/**
 * Authentication gerektiren sayfalar için hook
 * Kullanıcı giriş yapmamışsa authentication modal'ı açar
 */
export const useRequireSupabaseAuth = (redirectToAuth = true) => {
  const { isAuthenticated, initialized, isLoading } = useSupabaseAuth();

  useEffect(() => {
    if (initialized && !isLoading && !isAuthenticated && redirectToAuth) {
      // Burada authentication modal'ını açabilir veya login sayfasına yönlendirebilirsiniz
      console.log('User not authenticated, should redirect to auth');
    }
  }, [isAuthenticated, initialized, isLoading, redirectToAuth]);

  return {
    isAuthenticated,
    isLoading: isLoading || !initialized,
    shouldShowAuth: initialized && !isLoading && !isAuthenticated,
  };
};

export default useSupabaseAuth;

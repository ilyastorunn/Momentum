import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useSupabaseAuth } from '../../utils/auth/useSupabaseAuth';
import { AuthModal } from '../../components/auth/AuthModal';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [currentTheme, setCurrentTheme] = useState('dark'); // Theme state
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const { 
    user, 
    isAuthenticated, 
    isLoading, 
    initialized,
    signOutWithAlert 
  } = useSupabaseAuth();

  // User data - either from Supabase or mock
  const userData = user ? {
    name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
    email: user.email,
    joinedDate: user.created_at,
    totalHabits: 4, // This would come from your habits query
    totalStreaks: 28,
    longestStreak: 25,
    completionRate: 78,
  } : {
    name: 'Guest User',
    joinedDate: new Date().toISOString(),
    totalHabits: 0,
    totalStreaks: 0,
    longestStreak: 0,
    completionRate: 0,
  };

  const handleSettingsPress = (setting) => {
    Haptics.selectionAsync();
    
    // Navigate to specific settings pages
    switch (setting) {
      case 'Notifications':
        router.push('/profile/notifications');
        break;
      case 'Data & Privacy':
        Alert.alert(setting, `${setting} settings coming soon`);
        break;
      case 'Backup & Sync':
        Alert.alert(setting, `${setting} settings coming soon`);
        break;
      case 'Theme':
        Alert.alert(setting, `Theme settings are available in the profile card above`);
        break;
      case 'Help & Support':
        Alert.alert(setting, `${setting} settings coming soon`);
        break;
      case 'About':
        Alert.alert(setting, `${setting} settings coming soon`);
        break;
      default:
        Alert.alert(setting, `${setting} settings would open here`);
    }
  };

  const handleThemeChange = (theme) => {
    Haptics.selectionAsync();
    setCurrentTheme(theme);
    // TODO: Implement actual theme persistence and application
  };

  const handleAuthPress = () => {
    if (isAuthenticated) {
      // Show sign out confirmation
      Alert.alert(
        'Çıkış Yap',
        'Hesabınızdan çıkış yapmak istediğinizden emin misiniz?',
        [
          { text: 'İptal', style: 'cancel' },
          { text: 'Çıkış Yap', style: 'destructive', onPress: signOutWithAlert },
        ]
      );
    } else {
      setShowAuthModal(true);
    }
  };

  if (!fontsLoaded) {
    return null;
  }

  const memberSince = new Date(userData.joinedDate).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <View style={{ flex: 1, backgroundColor: '#000000' }}>
      <StatusBar style="light" />
      
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{ 
          paddingTop: insets.top + 20,
          paddingHorizontal: 20,
          marginBottom: 30,
        }}>
          <Text style={{
            fontFamily: 'Inter_700Bold',
            fontSize: 32,
            color: '#FFFFFF',
            marginBottom: 4,
          }}>
            Profile
          </Text>
          <Text style={{
            fontFamily: 'Inter_400Regular',
            fontSize: 16,
            color: '#8E8E93',
          }}>
            Manage your account
          </Text>
        </View>

        {/* User Info Card */}
        <View style={{
          marginHorizontal: 20,
          marginBottom: 30,
          backgroundColor: '#1C1C1E',
          borderRadius: 20,
          padding: 24,
          alignItems: 'center',
        }}>
          {/* Avatar */}
          <View style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: '#4EFF95',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16,
          }}>
            <Text style={{
              fontFamily: 'Inter_700Bold',
              fontSize: 32,
              color: '#000000',
            }}>
              {userData.name.charAt(0)}
            </Text>
          </View>

          {/* Name */}
          <Text style={{
            fontFamily: 'Inter_700Bold',
            fontSize: 24,
            color: '#FFFFFF',
            marginBottom: 8,
          }}>
            {userData.name}
          </Text>

          {/* Auth Status & Member Info */}
          {isAuthenticated ? (
            <Text style={{
              fontFamily: 'Inter_400Regular',
              fontSize: 16,
              color: '#8E8E93',
              marginBottom: 20,
            }}>
              Member since {memberSince}
            </Text>
          ) : (
            <View style={{ alignItems: 'center', marginBottom: 20 }}>
              <Text style={{
                fontFamily: 'Inter_400Regular',
                fontSize: 14,
                color: '#8E8E93',
                textAlign: 'center',
                marginBottom: 12,
              }}>
                Sign in to sync your habits across devices
              </Text>
              <Pressable
                onPress={() => setShowAuthModal(true)}
                style={{
                  backgroundColor: '#4EFF95',
                  borderRadius: 12,
                  paddingHorizontal: 20,
                  paddingVertical: 10,
                }}
              >
                <Text style={{
                  fontFamily: 'Inter_600SemiBold',
                  fontSize: 14,
                  color: '#000000',
                }}>
                  Sign In
                </Text>
              </Pressable>
            </View>
          )}

          {/* Quick Stats */}
          <View style={{
            flexDirection: 'row',
            gap: 24,
          }}>
            <View style={{ alignItems: 'center' }}>
              <Text style={{
                fontFamily: 'Inter_700Bold',
                fontSize: 20,
                color: '#4EFF95',
                marginBottom: 4,
              }}>
                {userData.totalHabits}
              </Text>
              <Text style={{
                fontFamily: 'Inter_400Regular',
                fontSize: 12,
                color: '#8E8E93',
              }}>
                Habits
              </Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={{
                fontFamily: 'Inter_700Bold',
                fontSize: 20,
                color: '#FF6B35',
                marginBottom: 4,
              }}>
                {userData.longestStreak}
              </Text>
              <Text style={{
                fontFamily: 'Inter_400Regular',
                fontSize: 12,
                color: '#8E8E93',
              }}>
                Best Streak
              </Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={{
                fontFamily: 'Inter_700Bold',
                fontSize: 20,
                color: '#FFD700',
                marginBottom: 4,
              }}>
                {userData.completionRate}%
              </Text>
              <Text style={{
                fontFamily: 'Inter_400Regular',
                fontSize: 12,
                color: '#8E8E93',
              }}>
                Success Rate
              </Text>
            </View>
          </View>

          {/* Theme Selector */}
          <View style={{
            marginTop: 24,
            paddingTop: 20,
            borderTopWidth: 1,
            borderTopColor: '#2C2C2E',
          }}>
            <Text style={{
              fontFamily: 'Inter_600SemiBold',
              fontSize: 14,
              color: '#8E8E93',
              textAlign: 'center',
              marginBottom: 12,
            }}>
              Theme
            </Text>
            <View style={{
              flexDirection: 'row',
              justifyContent: 'center',
              gap: 16,
            }}>
              <ThemeButton
                theme="dark"
                label="Dark"
                isActive={currentTheme === 'dark'}
                onPress={() => handleThemeChange('dark')}
              />
              <ThemeButton
                theme="light"
                label="Light"
                isActive={currentTheme === 'light'}
                onPress={() => handleThemeChange('light')}
              />
              <ThemeButton
                theme="system"
                label="System"
                isActive={currentTheme === 'system'}
                onPress={() => handleThemeChange('system')}
              />
            </View>
          </View>
        </View>

        {/* Settings Options */}
        <View style={{ paddingHorizontal: 20 }}>
          <Text style={{
            fontFamily: 'Inter_600SemiBold',
            fontSize: 18,
            color: '#FFFFFF',
            marginBottom: 16,
          }}>
            Settings
          </Text>

          <SettingsOption
            title="Notifications"
            subtitle="Manage reminder settings"
            icon="notifications"
            color="#4EFF95"
            onPress={() => handleSettingsPress('Notifications')}
          />

          <SettingsOption
            title="Data & Privacy"
            subtitle="Control your data"
            icon="shield-checkmark"
            color="#007AFF"
            onPress={() => handleSettingsPress('Data & Privacy')}
          />

          <SettingsOption
            title="Backup & Sync"
            subtitle="Keep your habits safe"
            icon="cloud"
            color="#34C759"
            onPress={() => handleSettingsPress('Backup & Sync')}
          />

          <SettingsOption
            title="Theme"
            subtitle="Customize appearance"
            icon="color-palette"
            color="#FF6B35"
            onPress={() => handleSettingsPress('Theme')}
          />

          <SettingsOption
            title="Help & Support"
            subtitle="Get help and contact us"
            icon="help-circle"
            color="#8E8E93"
            onPress={() => handleSettingsPress('Help & Support')}
          />

          <SettingsOption
            title="About"
            subtitle="Version and app info"
            icon="information-circle"
            color="#8E8E93"
            onPress={() => handleSettingsPress('About')}
          />

          {/* Sign Out Button - only show if authenticated */}
          {isAuthenticated && (
            <SettingsOption
              title="Sign Out"
              subtitle="Log out of your account"
              icon="log-out"
              color="#FF3B30"
              onPress={handleAuthPress}
            />
          )}
        </View>

        {/* App Info */}
        <View style={{
          paddingHorizontal: 20,
          paddingTop: 30,
          alignItems: 'center',
        }}>
          <Text style={{
            fontFamily: 'Inter_600SemiBold',
            fontSize: 16,
            color: '#FFFFFF',
            marginBottom: 4,
          }}>
            Momentum
          </Text>
          <Text style={{
            fontFamily: 'Inter_400Regular',
            fontSize: 14,
            color: '#8E8E93',
          }}>
            Version 1.0.0
          </Text>
        </View>
      </ScrollView>

      {/* Auth Modal */}
      <AuthModal
        visible={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode="login"
      />
    </View>
  );
}

function SettingsOption({ title, subtitle, icon, color, onPress }) {
  const scale = useSharedValue(1);

  const handlePress = () => {
    scale.value = withSpring(0.95, { duration: 100 }, () => {
      scale.value = withSpring(1, { duration: 100 });
    });
    onPress();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[animatedStyle, { marginBottom: 12 }]}>
      <Pressable
        onPress={handlePress}
        style={{
          backgroundColor: '#1C1C1E',
          borderRadius: 16,
          padding: 20,
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <View style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: color,
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 16,
        }}>
          <Ionicons name={icon} size={20} color="#FFFFFF" />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={{
            fontFamily: 'Inter_600SemiBold',
            fontSize: 16,
            color: '#FFFFFF',
            marginBottom: 2,
          }}>
            {title}
          </Text>
          <Text style={{
            fontFamily: 'Inter_400Regular',
            fontSize: 14,
            color: '#8E8E93',
          }}>
            {subtitle}
          </Text>
        </View>

        <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
      </Pressable>
    </Animated.View>
  );
}

function ThemeButton({ theme, label, isActive, onPress }) {
  const scale = useSharedValue(1);

  const handlePress = () => {
    scale.value = withSpring(0.9, { duration: 100 }, () => {
      scale.value = withSpring(1, { duration: 100 });
    });
    onPress();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const getThemeIcon = () => {
    switch (theme) {
      case 'dark':
        return 'moon';
      case 'light':
        return 'sunny';
      case 'system':
        return 'phone-portrait';
      default:
        return 'moon';
    }
  };

  const getThemeColors = () => {
    if (isActive) {
      return {
        background: '#4EFF95',
        iconColor: '#000000',
        textColor: '#000000',
      };
    }
    
    switch (theme) {
      case 'dark':
        return {
          background: '#2C2C2E',
          iconColor: '#8E8E93',
          textColor: '#8E8E93',
        };
      case 'light':
        return {
          background: '#2C2C2E',
          iconColor: '#8E8E93',
          textColor: '#8E8E93',
        };
      case 'system':
        return {
          background: '#2C2C2E',
          iconColor: '#8E8E93',
          textColor: '#8E8E93',
        };
      default:
        return {
          background: '#2C2C2E',
          iconColor: '#8E8E93',
          textColor: '#8E8E93',
        };
    }
  };

  const colors = getThemeColors();

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPress={handlePress}
        style={{
          alignItems: 'center',
          gap: 8,
        }}
      >
        <View style={{
          width: 48,
          height: 48,
          borderRadius: 24,
          backgroundColor: colors.background,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: isActive ? 2 : 1,
          borderColor: isActive ? '#4EFF95' : '#3A3A3C',
        }}>
          <Ionicons
            name={getThemeIcon()}
            size={20}
            color={colors.iconColor}
          />
        </View>
        <Text style={{
          fontFamily: 'Inter_500Medium',
          fontSize: 12,
          color: colors.textColor,
        }}>
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}
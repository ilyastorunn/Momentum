import React from 'react';
import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  // Mock user data
  const userData = {
    name: 'Alex Johnson',
    joinedDate: '2024-01-15',
    totalHabits: 4,
    totalStreaks: 28,
    longestStreak: 25,
    completionRate: 78,
  };

  const handleSettingsPress = (setting) => {
    Haptics.selectionAsync();
    Alert.alert(setting, `${setting} settings would open here`);
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

          {/* Member since */}
          <Text style={{
            fontFamily: 'Inter_400Regular',
            fontSize: 16,
            color: '#8E8E93',
            marginBottom: 20,
          }}>
            Member since {memberSince}
          </Text>

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
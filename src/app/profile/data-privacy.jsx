import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

export default function DataPrivacyScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  // Preferences
  const [preferences, setPreferences] = useState({
    analytics: true,
    crashReports: true,
    personalizedTips: false,
  });

  const togglePref = (key) => {
    Haptics.selectionAsync();
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleExportData = () => {
    Haptics.selectionAsync();
    Alert.alert('Export Data', 'A data export link will be prepared.');
  };

  const handleClearLocal = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Clear Local Data',
      'This will remove cached data on this device. Your account data remains safe.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', style: 'destructive', onPress: () => {} },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert(
      'Delete Account',
      'This action is irreversible and will permanently delete your account and all data. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => {} },
      ]
    );
  };

  if (!fontsLoaded) return null;

  return (
    <View style={{ flex: 1, backgroundColor: '#000000' }}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={{
        paddingTop: insets.top + 20,
        paddingHorizontal: 20,
        marginBottom: 30,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
      }}>
        <Pressable
          onPress={() => {
            Haptics.selectionAsync();
            router.back();
          }}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: '#1C1C1E',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name="chevron-back" size={20} color="#FFFFFF" />
        </Pressable>

        <View style={{ flex: 1 }}>
          <Text style={{
            fontFamily: 'Inter_700Bold',
            fontSize: 28,
            color: '#FFFFFF',
            marginBottom: 4,
          }}>
            Data & Privacy
          </Text>
          <Text style={{
            fontFamily: 'Inter_400Regular',
            fontSize: 16,
            color: '#8E8E93',
          }}>
            Control your data and privacy preferences
          </Text>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Preferences */}
        <Section title="Preferences">
          <ToggleRow
            title="Usage Analytics"
            subtitle="Help us improve the app with anonymous usage data"
            icon="stats-chart"
            color="#007AFF"
            value={preferences.analytics}
            onToggle={() => togglePref('analytics')}
          />
          <ToggleRow
            title="Crash Reports"
            subtitle="Send crash logs to diagnose issues"
            icon="bug"
            color="#FF6B35"
            value={preferences.crashReports}
            onToggle={() => togglePref('crashReports')}
          />
          <ToggleRow
            title="Personalized Tips"
            subtitle="Allow insights for better habit suggestions"
            icon="sparkles"
            color="#34C759"
            value={preferences.personalizedTips}
            onToggle={() => togglePref('personalizedTips')}
          />
        </Section>

        {/* Data Management */}
        <Section title="Data Management">
          <ActionRow
            title="Export Data"
            subtitle="Get a copy of your data via email"
            icon="download"
            color="#4EFF95"
            onPress={handleExportData}
          />
          <ActionRow
            title="Clear Local Cache"
            subtitle="Remove cached data on this device"
            icon="trash"
            color="#8E8E93"
            onPress={handleClearLocal}
          />
        </Section>

        {/* Account */}
        <Section title="Account">
          <ActionRow
            title="Connected Services"
            subtitle="Manage integrations (coming soon)"
            icon="link"
            color="#8E8E93"
            onPress={() => Alert.alert('Connected Services', 'Coming soon')}
          />
          <DangerRow
            title="Delete Account"
            subtitle="Permanently remove your account and data"
            icon="warning"
            onPress={handleDeleteAccount}
          />
        </Section>

        {/* Legal */}
        <Section title="Legal">
          <ExternalRow
            title="Privacy Policy"
            subtitle="Learn how we handle your data"
            icon="shield-checkmark"
            onPress={() => Alert.alert('Privacy Policy', 'Link to policy (coming soon)')}
          />
          <ExternalRow
            title="Terms of Service"
            subtitle="Our terms and conditions"
            icon="document-text"
            onPress={() => Alert.alert('Terms of Service', 'Link to terms (coming soon)')}
          />
        </Section>
      </ScrollView>
    </View>
  );
}

function Section({ title, children }) {
  return (
    <View style={{ paddingHorizontal: 20, marginBottom: 32 }}>
      <Text style={{
        fontFamily: 'Inter_600SemiBold',
        fontSize: 18,
        color: '#FFFFFF',
        marginBottom: 16,
      }}>
        {title}
      </Text>
      {children}
    </View>
  );
}

function ToggleRow({ title, subtitle, icon, color, value, onToggle }) {
  const scale = useSharedValue(1);

  const handleToggle = () => {
    scale.value = withSpring(0.98, { duration: 100 }, () => {
      scale.value = withSpring(1, { duration: 100 });
    });
    onToggle();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[animatedStyle, { marginBottom: 12 }]}>
      <View style={{
        backgroundColor: '#1C1C1E',
        borderRadius: 16,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
      }}>
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

        {/* Custom pill toggle */}
        <Pressable
          onPress={handleToggle}
          style={{
            width: 52,
            height: 30,
            borderRadius: 16,
            backgroundColor: value ? '#4EFF95' : '#3A3A3C',
            padding: 2,
            justifyContent: 'center',
          }}
        >
          <View style={{
            width: 26,
            height: 26,
            borderRadius: 13,
            backgroundColor: '#FFFFFF',
            transform: [{ translateX: value ? 22 : 0 }],
          }} />
        </Pressable>
      </View>
    </Animated.View>
  );
}

function ActionRow({ title, subtitle, icon, color, onPress }) {
  const scale = useSharedValue(1);

  const handlePress = () => {
    scale.value = withSpring(0.98, { duration: 100 }, () => {
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

function DangerRow({ title, subtitle, icon, onPress }) {
  const scale = useSharedValue(1);

  const handlePress = () => {
    scale.value = withSpring(0.98, { duration: 100 }, () => {
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
          backgroundColor: '#FF3B30',
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

function ExternalRow({ title, subtitle, icon, onPress }) {
  const scale = useSharedValue(1);

  const handlePress = () => {
    scale.value = withSpring(0.98, { duration: 100 }, () => {
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
          backgroundColor: '#8E8E93',
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

        <Ionicons name="open-outline" size={20} color="#8E8E93" />
      </Pressable>
    </Animated.View>
  );
}



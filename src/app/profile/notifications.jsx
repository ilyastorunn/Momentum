import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Switch } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  
  // Notification settings state
  const [settings, setSettings] = useState({
    habitReminders: true,
    motivationalMessages: true,
    streakCelebrations: true,
    weeklyProgress: false,
    goalAchievements: true,
    habitSuggestions: false,
  });

  // Time settings state
  const [reminderTime, setReminderTime] = useState('09:00');
  const [motivationFrequency, setMotivationFrequency] = useState('daily');

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const toggleSetting = (key) => {
    Haptics.selectionAsync();
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleTimePress = () => {
    Haptics.selectionAsync();
    // TODO: Implement time picker
  };

  const handleFrequencyPress = () => {
    Haptics.selectionAsync();
    // TODO: Implement frequency selector
  };

  if (!fontsLoaded) {
    return null;
  }

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
            Notifications
          </Text>
          <Text style={{
            fontFamily: 'Inter_400Regular',
            fontSize: 16,
            color: '#8E8E93',
          }}>
            Manage your reminder settings
          </Text>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Notification Types */}
        <View style={{ paddingHorizontal: 20, marginBottom: 32 }}>
          <Text style={{
            fontFamily: 'Inter_600SemiBold',
            fontSize: 18,
            color: '#FFFFFF',
            marginBottom: 16,
          }}>
            Notification Types
          </Text>

          <NotificationOption
            title="Habit Reminders"
            subtitle="Daily reminders for your habits"
            icon="alarm"
            color="#4EFF95"
            isEnabled={settings.habitReminders}
            onToggle={() => toggleSetting('habitReminders')}
          />

          <NotificationOption
            title="Motivational Messages"
            subtitle="Inspiring quotes and tips"
            icon="heart"
            color="#FF6B35"
            isEnabled={settings.motivationalMessages}
            onToggle={() => toggleSetting('motivationalMessages')}
          />

          <NotificationOption
            title="Streak Celebrations"
            subtitle="Celebrate your achievements"
            icon="flame"
            color="#FFD700"
            isEnabled={settings.streakCelebrations}
            onToggle={() => toggleSetting('streakCelebrations')}
          />

          <NotificationOption
            title="Weekly Progress"
            subtitle="Summary of your week"
            icon="bar-chart"
            color="#007AFF"
            isEnabled={settings.weeklyProgress}
            onToggle={() => toggleSetting('weeklyProgress')}
          />

          <NotificationOption
            title="Goal Achievements"
            subtitle="When you reach milestones"
            icon="trophy"
            color="#FF9500"
            isEnabled={settings.goalAchievements}
            onToggle={() => toggleSetting('goalAchievements')}
          />

          <NotificationOption
            title="Habit Suggestions"
            subtitle="Personalized habit recommendations"
            icon="bulb"
            color="#34C759"
            isEnabled={settings.habitSuggestions}
            onToggle={() => toggleSetting('habitSuggestions')}
          />
        </View>

        {/* Timing Settings */}
        <View style={{ paddingHorizontal: 20, marginBottom: 32 }}>
          <Text style={{
            fontFamily: 'Inter_600SemiBold',
            fontSize: 18,
            color: '#FFFFFF',
            marginBottom: 16,
          }}>
            Timing Settings
          </Text>

          <SettingsCard
            title="Reminder Time"
            subtitle="When to send daily reminders"
            value={reminderTime}
            onPress={handleTimePress}
            icon="time"
          />

          <SettingsCard
            title="Motivation Frequency"
            subtitle="How often to send motivational messages"
            value={motivationFrequency === 'daily' ? 'Daily' : motivationFrequency === 'weekly' ? 'Weekly' : 'Never'}
            onPress={handleFrequencyPress}
            icon="refresh"
          />
        </View>

        {/* Quick Actions */}
        <View style={{ paddingHorizontal: 20 }}>
          <Text style={{
            fontFamily: 'Inter_600SemiBold',
            fontSize: 18,
            color: '#FFFFFF',
            marginBottom: 16,
          }}>
            Quick Actions
          </Text>

          <ActionButton
            title="Test Notification"
            subtitle="Send a test notification now"
            icon="notifications"
            color="#4EFF95"
            onPress={() => {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              // TODO: Implement test notification
            }}
          />

          <ActionButton
            title="Notification Permissions"
            subtitle="Check notification settings"
            icon="settings"
            color="#8E8E93"
            onPress={() => {
              Haptics.selectionAsync();
              // TODO: Open device notification settings
            }}
          />
        </View>
      </ScrollView>
    </View>
  );
}

function NotificationOption({ title, subtitle, icon, color, isEnabled, onToggle }) {
  const scale = useSharedValue(1);

  const handlePress = () => {
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

        <Switch
          value={isEnabled}
          onValueChange={handlePress}
          trackColor={{ 
            false: '#3A3A3C', 
            true: '#4EFF95' 
          }}
          thumbColor="#FFFFFF"
          style={{ transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }] }}
        />
      </View>
    </Animated.View>
  );
}

function SettingsCard({ title, subtitle, value, onPress, icon }) {
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
          backgroundColor: '#007AFF',
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

        <View style={{ alignItems: 'flex-end' }}>
          <Text style={{
            fontFamily: 'Inter_600SemiBold',
            fontSize: 16,
            color: '#4EFF95',
            marginBottom: 2,
          }}>
            {value}
          </Text>
          <Ionicons name="chevron-forward" size={16} color="#8E8E93" />
        </View>
      </Pressable>
    </Animated.View>
  );
}

function ActionButton({ title, subtitle, icon, color, onPress }) {
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

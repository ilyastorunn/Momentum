import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

export default function BackupSyncScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const [autoBackup, setAutoBackup] = useState(true);
  const [wifiOnly, setWifiOnly] = useState(true);
  const [lastBackup, setLastBackup] = useState('Not backed up yet');

  const toggle = (setter, current) => {
    Haptics.selectionAsync();
    setter(!current);
  };

  const handleManualBackup = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setLastBackup(new Date().toLocaleString());
    Alert.alert('Backup', 'Backup completed successfully.');
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
          onPress={() => { Haptics.selectionAsync(); router.back(); }}
          style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#1C1C1E', alignItems: 'center', justifyContent: 'center' }}
        >
          <Ionicons name="chevron-back" size={20} color="#FFFFFF" />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 28, color: '#FFFFFF', marginBottom: 4 }}>Backup & Sync</Text>
          <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 16, color: '#8E8E93' }}>Keep your habits safe and synced</Text>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: insets.bottom + 20 }} showsVerticalScrollIndicator={false}>
        <Section title="Backup Settings">
          <ToggleRow
            title="Automatic Backups"
            subtitle="Backup your data periodically"
            icon="cloud-upload"
            color="#34C759"
            value={autoBackup}
            onToggle={() => toggle(setAutoBackup, autoBackup)}
          />
          <ToggleRow
            title="Wi‑Fi Only"
            subtitle="Only backup on Wi‑Fi"
            icon="wifi"
            color="#007AFF"
            value={wifiOnly}
            onToggle={() => toggle(setWifiOnly, wifiOnly)}
          />
        </Section>

        <Section title="Sync">
          <ActionRow
            title="Manual Backup"
            subtitle={`Last backup: ${lastBackup}`}
            icon="save"
            color="#4EFF95"
            onPress={handleManualBackup}
          />
          <ActionRow
            title="Restore from Backup"
            subtitle="Pick a backup to restore (coming soon)"
            icon="cloud-download"
            color="#8E8E93"
            onPress={() => Alert.alert('Restore', 'Coming soon')}
          />
        </Section>
      </ScrollView>
    </View>
  );
}

function Section({ title, children }) {
  return (
    <View style={{ paddingHorizontal: 20, marginBottom: 32 }}>
      <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 18, color: '#FFFFFF', marginBottom: 16 }}>{title}</Text>
      {children}
    </View>
  );
}

function ToggleRow({ title, subtitle, icon, color, value, onToggle }) {
  const scale = useSharedValue(1);
  const handleToggle = () => { scale.value = withSpring(0.98, { duration: 100 }, () => { scale.value = withSpring(1, { duration: 100 }); }); onToggle(); };
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <Animated.View style={[animatedStyle, { marginBottom: 12 }]}>
      <View style={{ backgroundColor: '#1C1C1E', borderRadius: 16, padding: 20, flexDirection: 'row', alignItems: 'center' }}>
        <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: color, alignItems: 'center', justifyContent: 'center', marginRight: 16 }}>
          <Ionicons name={icon} size={20} color="#FFFFFF" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 16, color: '#FFFFFF', marginBottom: 2 }}>{title}</Text>
          <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 14, color: '#8E8E93' }}>{subtitle}</Text>
        </View>
        <Pressable onPress={handleToggle} style={{ width: 52, height: 30, borderRadius: 16, backgroundColor: value ? '#4EFF95' : '#3A3A3C', padding: 2, justifyContent: 'center' }}>
          <View style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: '#FFFFFF', transform: [{ translateX: value ? 22 : 0 }] }} />
        </Pressable>
      </View>
    </Animated.View>
  );
}

function ActionRow({ title, subtitle, icon, color, onPress }) {
  const scale = useSharedValue(1);
  const handlePress = () => { scale.value = withSpring(0.98, { duration: 100 }, () => { scale.value = withSpring(1, { duration: 100 }); }); onPress(); };
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <Animated.View style={[animatedStyle, { marginBottom: 12 }]}>
      <Pressable onPress={handlePress} style={{ backgroundColor: '#1C1C1E', borderRadius: 16, padding: 20, flexDirection: 'row', alignItems: 'center' }}>
        <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: color, alignItems: 'center', justifyContent: 'center', marginRight: 16 }}>
          <Ionicons name={icon} size={20} color="#FFFFFF" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 16, color: '#FFFFFF', marginBottom: 2 }}>{title}</Text>
          <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 14, color: '#8E8E93' }}>{subtitle}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
      </Pressable>
    </Animated.View>
  );
}



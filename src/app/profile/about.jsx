import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';

export default function AboutScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  if (!fontsLoaded) return null;

  return (
    <View style={{ flex: 1, backgroundColor: '#000000' }}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={{ paddingTop: insets.top + 20, paddingHorizontal: 20, marginBottom: 30, flexDirection: 'row', alignItems: 'center', gap: 16 }}>
        <Pressable onPress={() => { Haptics.selectionAsync(); router.back(); }} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#1C1C1E', alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="chevron-back" size={20} color="#FFFFFF" />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 28, color: '#FFFFFF', marginBottom: 4 }}>About</Text>
          <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 16, color: '#8E8E93' }}>Version and app info</Text>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: insets.bottom + 20 }} showsVerticalScrollIndicator={false}>
        <View style={{ paddingHorizontal: 20, gap: 12 }}>
          <InfoRow label="App" value="Momentum" />
          <InfoRow label="Version" value="1.0.0" />
          <InfoRow label="Build" value="100" />
          <InfoRow label="Made with" value="Expo, React Native" />
        </View>

        <View style={{ paddingHorizontal: 20, marginTop: 32 }}>
          <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 18, color: '#FFFFFF', marginBottom: 12 }}>Credits</Text>
          <View style={{ backgroundColor: '#1C1C1E', borderRadius: 16, padding: 16 }}>
            <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 14, color: '#8E8E93' }}>
              Designed and built with care for better habits.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function InfoRow({ label, value }) {
  return (
    <View style={{ backgroundColor: '#1C1C1E', borderRadius: 16, padding: 16 }}>
      <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 14, color: '#8E8E93', marginBottom: 4 }}>{label}</Text>
      <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 16, color: '#FFFFFF' }}>{value}</Text>
    </View>
  );
}



import React from 'react';
import { View, Text, ScrollView, Pressable, Alert, Linking } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

export default function HelpSupportScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  if (!fontsLoaded) return null;

  const openMail = () => {
    const mailto = 'mailto:support@momentum.app?subject=Momentum%20Support&body=Describe%20your%20issue...';
    Linking.openURL(mailto).catch(() => Alert.alert('Error', 'Could not open mail app'));
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#000000' }}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={{ paddingTop: insets.top + 20, paddingHorizontal: 20, marginBottom: 30, flexDirection: 'row', alignItems: 'center', gap: 16 }}>
        <Pressable onPress={() => { Haptics.selectionAsync(); router.back(); }} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#1C1C1E', alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="chevron-back" size={20} color="#FFFFFF" />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 28, color: '#FFFFFF', marginBottom: 4 }}>Help & Support</Text>
          <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 16, color: '#8E8E93' }}>Get help and contact us</Text>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: insets.bottom + 20 }} showsVerticalScrollIndicator={false}>
        <Section title="FAQ">
          <ExternalRow title="How to create a habit?" subtitle="Step-by-step guide" icon="help-circle" onPress={() => Alert.alert('FAQ', 'Coming soon')} />
          <ExternalRow title="How to track streaks?" subtitle="Keep your momentum" icon="flame" onPress={() => Alert.alert('FAQ', 'Coming soon')} />
          <ExternalRow title="How to backup data?" subtitle="Keep your data safe" icon="cloud" onPress={() => Alert.alert('FAQ', 'Coming soon')} />
        </Section>

        <Section title="Contact">
          <ActionRow title="Contact Support" subtitle="Email our support team" icon="mail" color="#4EFF95" onPress={openMail} />
          <ActionRow title="Report a Bug" subtitle="Tell us what went wrong" icon="bug" color="#FF6B35" onPress={openMail} />
          <ActionRow title="Request a Feature" subtitle="Share your idea" icon="sparkles" color="#FFD700" onPress={openMail} />
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

function ExternalRow({ title, subtitle, icon, onPress }) {
  const scale = useSharedValue(1);
  const handlePress = () => { scale.value = withSpring(0.98, { duration: 100 }, () => { scale.value = withSpring(1, { duration: 100 }); }); onPress(); };
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <Animated.View style={[animatedStyle, { marginBottom: 12 }]}>
      <Pressable onPress={handlePress} style={{ backgroundColor: '#1C1C1E', borderRadius: 16, padding: 20, flexDirection: 'row', alignItems: 'center' }}>
        <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#8E8E93', alignItems: 'center', justifyContent: 'center', marginRight: 16 }}>
          <Ionicons name={icon} size={20} color="#FFFFFF" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 16, color: '#FFFFFF', marginBottom: 2 }}>{title}</Text>
          <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 14, color: '#8E8E93' }}>{subtitle}</Text>
        </View>
        <Ionicons name="open-outline" size={20} color="#8E8E93" />
      </Pressable>
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



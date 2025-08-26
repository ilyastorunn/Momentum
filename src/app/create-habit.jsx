import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { unifiedHabitsService } from '@/utils/unifiedService';
import { useSupabaseAuth } from '@/utils/auth/useSupabaseAuth';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';

// Habit icons
const HABIT_ICONS = [
  { name: 'water', icon: 'water' },
  { name: 'fitness', icon: 'fitness' },
  { name: 'book', icon: 'book' },
  { name: 'leaf', icon: 'leaf' },
  { name: 'moon', icon: 'moon' },
  { name: 'sunny', icon: 'sunny' },
  { name: 'restaurant', icon: 'restaurant' },
  { name: 'medical', icon: 'medical' },
  { name: 'heart', icon: 'heart' },
  { name: 'checkmark-circle', icon: 'checkmark-circle' },
  { name: 'time', icon: 'time' },
  { name: 'trophy', icon: 'trophy' },
];

// Categories
const CATEGORIES = [
  'Health',
  'Fitness',
  'Learning',
  'Productivity',
  'Mindfulness',
  'Social',
  'Creative',
  'Custom',
];

export default function CreateHabitScreen() {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useSupabaseAuth();
  
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const [habitName, setHabitName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('checkmark-circle');
  const [selectedCategory, setSelectedCategory] = useState('Custom');

  // Create habit mutation
  const createHabitMutation = useMutation({
    mutationFn: async (habitData) => {
      return await unifiedHabitsService.create(habitData, isAuthenticated);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      queryClient.invalidateQueries({ queryKey: ['progress'] });
      router.back();
      Alert.alert('Success!', 'Habit created successfully');
    },
    onError: (error) => {
      console.error('Create habit error:', error);
      Alert.alert('Error', 'Failed to create habit. Please try again.');
    },
  });

  const handleCreateHabit = async () => {
    if (!habitName.trim()) {
      Alert.alert('Error', 'Please enter a habit name');
      return;
    }

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const habitData = {
      name: habitName.trim(),
      icon: selectedIcon,
      category: selectedCategory,
    };

    createHabitMutation.mutate(habitData);
  };

  const handleIconSelect = (iconName) => {
    Haptics.selectionAsync();
    setSelectedIcon(iconName);
  };

  const handleCategorySelect = (category) => {
    Haptics.selectionAsync();
    setSelectedCategory(category);
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Create New Habit</Text>
        
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
      >
        {/* Habit Name */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Habit Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter habit name..."
            placeholderTextColor="#8E8E93"
            value={habitName}
            onChangeText={setHabitName}
            maxLength={50}
            autoFocus
          />
        </View>

        {/* Icon Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Choose an Icon</Text>
          <View style={styles.iconGrid}>
            {HABIT_ICONS.map((item) => (
              <TouchableOpacity
                key={item.name}
                style={[
                  styles.iconButton,
                  selectedIcon === item.name && styles.iconButtonSelected,
                ]}
                onPress={() => handleIconSelect(item.name)}
              >
                <Ionicons 
                  name={item.icon} 
                  size={24} 
                  color={selectedIcon === item.name ? '#000000' : '#FFFFFF'} 
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Category Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Category</Text>
          <View style={styles.categoryGrid}>
            {CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryButton,
                  selectedCategory === category && styles.categoryButtonSelected,
                ]}
                onPress={() => handleCategorySelect(category)}
              >
                <Text 
                  style={[
                    styles.categoryText,
                    selectedCategory === category && styles.categoryTextSelected,
                  ]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Create Button */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
        <TouchableOpacity
          style={[
            styles.createButton,
            (!habitName.trim() || createHabitMutation.isPending) && styles.createButtonDisabled,
          ]}
          onPress={handleCreateHabit}
          disabled={!habitName.trim() || createHabitMutation.isPending}
        >
          {createHabitMutation.isPending ? (
            <ActivityIndicator color="#000000" />
          ) : (
            <Text style={styles.createButtonText}>Create Habit</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontFamily: 'Inter_700Bold',
    fontSize: 24,
    color: '#FFFFFF',
    textAlign: 'center',
    marginRight: 40, // Account for back button
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  iconButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1C1C1E',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#2C2C2E',
  },
  iconButtonSelected: {
    backgroundColor: '#4EFF95',
    borderColor: '#4EFF95',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: '#1C1C1E',
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  categoryButtonSelected: {
    backgroundColor: '#4EFF95',
    borderColor: '#4EFF95',
  },
  categoryText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: '#FFFFFF',
  },
  categoryTextSelected: {
    color: '#000000',
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    backgroundColor: '#000000',
    borderTopWidth: 1,
    borderTopColor: '#1C1C1E',
  },
  createButton: {
    backgroundColor: '#4EFF95',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 54,
  },
  createButtonDisabled: {
    backgroundColor: '#2C2C2E',
  },
  createButtonText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    color: '#000000',
  },
});

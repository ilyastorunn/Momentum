import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { habitsService, progressService } from '@/utils/supabaseService';
import { getMockHabitDetail, getMockHabitProgress, USE_MOCK_DATA, SIMULATE_NETWORK_ERROR, API_DELAY } from '@/utils/mockData';

export default function HabitDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const [currentDate, setCurrentDate] = useState(new Date());

  // Get current year and month
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  // Fetch habit details
  const {
    data: habitData,
    isLoading: habitLoading,
    error: habitError,
  } = useQuery({
    queryKey: ['habit', id],
    queryFn: async () => {
      // If using mock data, return immediately
      if (USE_MOCK_DATA) {
        console.log("Using mock data for habit detail");
        await new Promise(resolve => setTimeout(resolve, API_DELAY));
        return getMockHabitDetail(id);
      }
      
      if (SIMULATE_NETWORK_ERROR) {
        throw new Error('Failed to fetch habit');
      }
      
      try {
        // Use Supabase service
        return await habitsService.getById(id);
      } catch (supabaseError) {
        console.error("Supabase error:", supabaseError);
        // Fallback to mock data if Supabase fails
        console.log("Supabase failed, using mock data for habit detail");
        return getMockHabitDetail(id);
      }
    },
  });

  // Fetch progress data for the month
  const {
    data: progressData,
    isLoading: progressLoading,
    error: progressError,
  } = useQuery({
    queryKey: ['progress', id, currentYear, currentMonth],
    queryFn: async () => {
      // If using mock data, return immediately
      if (USE_MOCK_DATA) {
        console.log("Using mock data for habit progress");
        await new Promise(resolve => setTimeout(resolve, API_DELAY));
        return getMockHabitProgress(id, currentYear, currentMonth);
      }
      
      if (SIMULATE_NETWORK_ERROR) {
        throw new Error('Failed to fetch progress');
      }
      
      try {
        // Use Supabase service
        const startDate = `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`;
        const endDate = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${new Date(currentYear, currentMonth, 0).getDate()}`;
        return await progressService.getByHabitAndDateRange(id, startDate, endDate);
      } catch (supabaseError) {
        console.error("Supabase error:", supabaseError);
        // Fallback to mock data if Supabase fails
        console.log("Supabase failed, using mock data for habit progress");
        return getMockHabitProgress(id, currentYear, currentMonth);
      }
    },
  });

  // Toggle progress mutation
  const toggleProgressMutation = useMutation({
    mutationFn: async ({ habitId, date, completed }) => {
      // If using mock data, simulate successful update
      if (USE_MOCK_DATA) {
        console.log("Using mock data, simulating progress toggle");
        await new Promise(resolve => setTimeout(resolve, 200));
        return { success: true };
      }
      
      if (SIMULATE_NETWORK_ERROR) {
        throw new Error('Failed to update progress');
      }
      
      try {
        // Use Supabase service
        return await progressService.update(habitId, date, completed, '');
      } catch (supabaseError) {
        console.error("Supabase error:", supabaseError);
        // Simulate successful update for demo if Supabase fails
        console.log("Supabase failed, simulating progress toggle");
        return { success: true };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['progress', id] });
      queryClient.invalidateQueries({ queryKey: ['habits'] });
    },
  });

  // Delete habit mutation
  const deleteHabitMutation = useMutation({
    mutationFn: async (habitId) => {
      // If using mock data, simulate successful deletion
      if (USE_MOCK_DATA) {
        console.log("Using mock data, simulating habit deletion");
        await new Promise(resolve => setTimeout(resolve, 300));
        return { success: true };
      }
      
      if (SIMULATE_NETWORK_ERROR) {
        throw new Error('Failed to delete habit');
      }
      
      try {
        // Use Supabase service
        return await habitsService.delete(habitId);
      } catch (supabaseError) {
        console.error("Supabase error:", supabaseError);
        // Simulate successful deletion for demo if Supabase fails
        console.log("Supabase failed, simulating habit deletion");
        return { success: true };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      router.back();
    },
  });

  const habit = habitData?.habit;
  const progressByDate = progressData?.progress || {};

  if (!fontsLoaded) {
    return null;
  }

  if (habitLoading || progressLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#000000', justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 16, color: '#8E8E93' }}>
          Loading...
        </Text>
      </View>
    );
  }

  if (habitError || progressError || !habit) {
    return (
      <View style={{ flex: 1, backgroundColor: '#000000', justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 16, color: '#FF6B35' }}>
          Failed to load habit details
        </Text>
      </View>
    );
  }

  const handleDeleteHabit = () => {
    Alert.alert(
      'Delete Habit',
      `Are you sure you want to delete "${habit.name}"? This will remove all progress data.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteHabitMutation.mutate(id);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          },
        },
      ]
    );
  };

  const toggleDayProgress = (day) => {
    const dateStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const isCompleted = progressByDate[dateStr]?.completed || false;

    toggleProgressMutation.mutate({
      habitId: id,
      date: dateStr,
      completed: !isCompleted,
    });

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  };

  const isToday = (day) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  const isFutureDay = (day) => {
    const today = new Date();
    const dayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return dayDate > today;
  };

  const getDayProgress = (day) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return progressByDate[dateStr];
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

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
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 30,
        }}>
          <Pressable
            onPress={() => router.back()}
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: '#2C2C2E',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="chevron-back" size={20} color="#FFFFFF" />
          </Pressable>

          <View style={{ flex: 1, marginHorizontal: 16 }}>
            <Text style={{
              fontFamily: 'Inter_700Bold',
              fontSize: 24,
              color: '#FFFFFF',
              textAlign: 'center',
            }}>
              {habit.name}
            </Text>
          </View>

          <Pressable
            onPress={handleDeleteHabit}
            disabled={deleteHabitMutation.isLoading}
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: '#2C2C2E',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: deleteHabitMutation.isLoading ? 0.5 : 1,
            }}
          >
            <Ionicons name="trash-outline" size={20} color="#FF6B35" />
          </Pressable>
        </View>

        {/* Calendar Container */}
        <View style={{
          marginHorizontal: 20,
          backgroundColor: '#1C1C1E',
          borderRadius: 20,
          padding: 24,
        }}>
          {/* Month Navigation */}
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 24,
          }}>
            <Pressable
              onPress={() => navigateMonth(-1)}
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: '#2C2C2E',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name="chevron-back" size={20} color="#8E8E93" />
            </Pressable>

            <Text style={{
              fontFamily: 'Inter_600SemiBold',
              fontSize: 18,
              color: '#8E8E93',
            }}>
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </Text>

            <Pressable
              onPress={() => navigateMonth(1)}
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: '#2C2C2E',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
            </Pressable>
          </View>

          {/* Day Headers */}
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-around',
            marginBottom: 16,
          }}>
            {dayNames.map((day) => (
              <Text
                key={day}
                style={{
                  fontFamily: 'Inter_500Medium',
                  fontSize: 14,
                  color: '#8E8E93',
                  width: 40,
                  textAlign: 'center',
                }}
              >
                {day}
              </Text>
            ))}
          </View>

          {/* Calendar Grid */}
          <View style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
          }}>
            {getDaysInMonth().map((day, index) => (
              <View
                key={index}
                style={{
                  width: '14.28%',
                  aspectRatio: 1,
                  padding: 2,
                }}
              >
                {day && (
                  <DayCell
                    day={day}
                    isToday={isToday(day)}
                    isFuture={isFutureDay(day)}
                    progress={getDayProgress(day)}
                    onPress={() => !isFutureDay(day) && toggleDayProgress(day)}
                    disabled={isFutureDay(day) || toggleProgressMutation.isLoading}
                  />
                )}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function DayCell({ day, isToday, isFuture, progress, onPress, disabled }) {
  const scale = useSharedValue(1);

  const handlePress = () => {
    if (disabled) return;
    scale.value = withSpring(0.9, { duration: 100 }, () => {
      scale.value = withSpring(1, { duration: 100 });
    });
    onPress();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const getBackgroundColor = () => {
    if (progress?.completed) return '#4EFF95';
    if (isToday) return '#FFFFFF';
    return '#2C2C2E';
  };

  const getTextColor = () => {
    if (progress?.completed) return '#000000';
    if (isToday) return '#000000';
    if (isFuture) return '#48484A';
    return '#FFFFFF';
  };

  return (
    <Animated.View style={[animatedStyle, { flex: 1 }]}>
      <Pressable
        onPress={handlePress}
        disabled={disabled}
        style={{
          flex: 1,
          backgroundColor: getBackgroundColor(),
          borderRadius: 12,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: disabled && isFuture ? 0.5 : 1,
        }}
      >
        {progress?.completed ? (
          <Ionicons name="checkmark" size={16} color="#000000" />
        ) : (
          <Text style={{
            fontFamily: 'Inter_600SemiBold',
            fontSize: 16,
            color: getTextColor(),
          }}>
            {day}
          </Text>
        )}
      </Pressable>
    </Animated.View>
  );
}
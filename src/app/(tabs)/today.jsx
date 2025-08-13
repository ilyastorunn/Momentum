import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Haptics from "expo-haptics";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { mockApiResponses, USE_MOCK_DATA, SIMULATE_NETWORK_ERROR, API_DELAY } from "@/utils/mockData";

export default function TodayScreen() {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const [expandedNotes, setExpandedNotes] = useState(new Set());
  const progressScale = useSharedValue(1);

  const today = new Date().toISOString().split("T")[0];

  // Fetch today's progress
  const {
    data: progressData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["progress", today],
    queryFn: async () => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, API_DELAY));
      
      // If using mock data, return immediately
      if (USE_MOCK_DATA) {
        console.log("Using mock data for progress");
        return mockApiResponses.progress;
      }
      
      if (SIMULATE_NETWORK_ERROR) {
        throw new Error("Failed to fetch progress");
      }
      
      try {
        const response = await fetch(`/api/progress?date=${today}`);
        if (!response.ok) {
          // Fallback to mock data if API fails
          console.log("API failed, using mock data for progress");
          return mockApiResponses.progress;
        }
        return response.json();
      } catch (apiError) {
        // If API is not available, use mock data
        console.log("API not available, using mock data for progress");
        return mockApiResponses.progress;
      }
    },
  });

  // Update progress mutation
  const updateProgressMutation = useMutation({
    mutationFn: async ({ habit_id, completed, note }) => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // If using mock data, simulate successful update
      if (USE_MOCK_DATA) {
        console.log("Using mock data, simulating progress update");
        return { success: true };
      }
      
      if (SIMULATE_NETWORK_ERROR) {
        throw new Error("Failed to update progress");
      }
      
      try {
        const response = await fetch("/api/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            habit_id,
            date: today,
            completed,
            note,
          }),
        });
        if (!response.ok) {
          // Simulate successful update for demo
          console.log("API failed, simulating progress update");
          return { success: true };
        }
        return response.json();
      } catch (apiError) {
        // If API is not available, simulate successful update
        console.log("API not available, simulating progress update");
        return { success: true };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["progress", today] });
    },
    onError: (error) => {
      console.error("Error updating progress:", error);
      Alert.alert("Error", "Failed to update habit progress");
    },
  });

  const habits = progressData?.progress || [];
  const completedCount = habits.filter((habit) => habit.completed).length;
  const totalCount = habits.length;
  const progressPercentage = totalCount > 0 ? completedCount / totalCount : 0;

  const toggleHabit = async (habit_id, currentCompleted, currentNote) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    updateProgressMutation.mutate({
      habit_id,
      completed: !currentCompleted,
      note: currentNote || "",
    });

    // Animate progress ring
    progressScale.value = withSpring(1.1, { duration: 200 }, () => {
      progressScale.value = withSpring(1, { duration: 200 });
    });
  };

  const updateNote = (habit_id, note, currentCompleted) => {
    updateProgressMutation.mutate({
      habit_id,
      completed: currentCompleted,
      note,
    });
  };

  const toggleNoteExpansion = (habit_id) => {
    const newExpanded = new Set(expandedNotes);
    if (newExpanded.has(habit_id)) {
      newExpanded.delete(habit_id);
    } else {
      newExpanded.add(habit_id);
    }
    setExpandedNotes(newExpanded);
  };

  const progressAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: progressScale.value }],
  }));

  if (!fontsLoaded) {
    return null;
  }

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#000000",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <View
          style={{
            alignItems: "center",
            backgroundColor: "#1C1C1E",
            borderRadius: 16,
            padding: 24,
          }}
        >
          <Ionicons name="time-outline" size={48} color="#4EFF95" />
          <Text
            style={{
              fontFamily: "Inter_600SemiBold",
              fontSize: 18,
              color: "#FFFFFF",
              textAlign: "center",
              marginTop: 16,
            }}
          >
            Alışkanlıklar Yükleniyor...
          </Text>
          <Text
            style={{
              fontFamily: "Inter_400Regular",
              fontSize: 14,
              color: "#8E8E93",
              textAlign: "center",
              marginTop: 8,
            }}
          >
            Lütfen bekleyin
          </Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#000000",
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 20,
        }}
      >
        <View
          style={{
            alignItems: "center",
            backgroundColor: "#1C1C1E",
            borderRadius: 16,
            padding: 24,
          }}
        >
          <Ionicons name="warning-outline" size={48} color="#FF6B35" />
          <Text
            style={{
              fontFamily: "Inter_600SemiBold",
              fontSize: 18,
              color: "#FFFFFF",
              textAlign: "center",
              marginTop: 16,
              marginBottom: 8,
            }}
          >
            Bağlantı Sorunu
          </Text>
          <Text
            style={{
              fontFamily: "Inter_400Regular",
              fontSize: 14,
              color: "#8E8E93",
              textAlign: "center",
              marginBottom: 20,
            }}
          >
            Alışkanlıklar yüklenemiyor. İnternet bağlantınızı kontrol edin.
          </Text>
          <Pressable
            onPress={() => queryClient.invalidateQueries({ queryKey: ["progress", today] })}
            style={{
              backgroundColor: "#4EFF95",
              paddingHorizontal: 24,
              paddingVertical: 12,
              borderRadius: 12,
            }}
          >
            <Text
              style={{
                fontFamily: "Inter_600SemiBold",
                fontSize: 14,
                color: "#000000",
              }}
            >
              Yeniden Dene
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <View style={{ flex: 1, backgroundColor: "#000000" }}>
      <StatusBar style="light" />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View
          style={{
            paddingTop: insets.top + 20,
            paddingHorizontal: 20,
            marginBottom: 20,
          }}
        >
          <Text
            style={{
              fontFamily: "Inter_700Bold",
              fontSize: 32,
              color: "#FFFFFF",
              marginBottom: 4,
            }}
          >
            Today
          </Text>
          <Text
            style={{
              fontFamily: "Inter_400Regular",
              fontSize: 16,
              color: "#8E8E93",
            }}
          >
            {currentDate}
          </Text>
        </View>

        {/* Progress Summary */}
        <View
          style={{
            marginHorizontal: 20,
            marginBottom: 30,
            backgroundColor: "#1C1C1E",
            borderRadius: 20,
            padding: 20,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontFamily: "Inter_600SemiBold",
                fontSize: 20,
                color: "#FFFFFF",
                marginBottom: 4,
              }}
            >
              {completedCount} of {totalCount} completed
            </Text>
            <Text
              style={{
                fontFamily: "Inter_400Regular",
                fontSize: 14,
                color: "#8E8E93",
              }}
            >
              {Math.round(progressPercentage * 100)}% daily progress
            </Text>
          </View>

          <Animated.View
            style={[
              progressAnimatedStyle,
              { alignItems: "center", justifyContent: "center" },
            ]}
          >
            <View
              style={{
                width: 60,
                height: 60,
                borderRadius: 30,
                backgroundColor: "#2C2C2E",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
              }}
            >
              {/* Progress Ring */}
              <View
                style={{
                  position: "absolute",
                  width: 56,
                  height: 56,
                  borderRadius: 28,
                  borderWidth: 3,
                  borderColor: "#4EFF95",
                  borderTopColor:
                    progressPercentage > 0.75 ? "#4EFF95" : "#2C2C2E",
                  borderRightColor:
                    progressPercentage > 0.5 ? "#4EFF95" : "#2C2C2E",
                  borderBottomColor:
                    progressPercentage > 0.25 ? "#4EFF95" : "#2C2C2E",
                  borderLeftColor:
                    progressPercentage > 0 ? "#4EFF95" : "#2C2C2E",
                }}
              />
              <Text
                style={{
                  fontFamily: "Inter_700Bold",
                  fontSize: 16,
                  color: "#4EFF95",
                }}
              >
                {Math.round(progressPercentage * 100)}%
              </Text>
            </View>
          </Animated.View>
        </View>

        {/* Habits List */}
        <View style={{ paddingHorizontal: 20 }}>
          {habits.length === 0 ? (
            <View style={{ alignItems: "center", paddingVertical: 40 }}>
              <Text
                style={{
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 18,
                  color: "#FFFFFF",
                  marginBottom: 8,
                }}
              >
                No habits yet
              </Text>
              <Text
                style={{
                  fontFamily: "Inter_400Regular",
                  fontSize: 14,
                  color: "#8E8E93",
                  textAlign: "center",
                }}
              >
                Go to the Habits tab to create your first habit
              </Text>
            </View>
          ) : (
            habits.map((habit) => (
              <HabitItem
                key={habit.habit_id}
                habit={habit}
                isNoteExpanded={expandedNotes.has(habit.habit_id)}
                onToggle={() =>
                  toggleHabit(habit.habit_id, habit.completed, habit.note)
                }
                onToggleNote={() => toggleNoteExpansion(habit.habit_id)}
                onUpdateNote={(note) =>
                  updateNote(habit.habit_id, note, habit.completed)
                }
                isUpdating={updateProgressMutation.isLoading}
              />
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function HabitItem({
  habit,
  isNoteExpanded,
  onToggle,
  onToggleNote,
  onUpdateNote,
  isUpdating,
}) {
  const scale = useSharedValue(1);

  const handlePress = async () => {
    if (isUpdating) return;

    await Haptics.selectionAsync();
    scale.value = withSpring(0.95, { duration: 100 }, () => {
      scale.value = withSpring(1, { duration: 100 });
    });
    onToggle();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[animatedStyle, { marginBottom: 16 }]}>
      <View
        style={{
          backgroundColor: "#1C1C1E",
          borderRadius: 16,
          overflow: "hidden",
          opacity: isUpdating ? 0.7 : 1,
        }}
      >
        {/* Main Habit Row */}
        <Pressable
          onPress={handlePress}
          disabled={isUpdating}
          style={{
            flexDirection: "row",
            alignItems: "center",
            padding: 20,
          }}
        >
          {/* Icon */}
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: habit.completed ? "#4EFF95" : "#2C2C2E",
              alignItems: "center",
              justifyContent: "center",
              marginRight: 16,
            }}
          >
            <Ionicons
              name={habit.icon}
              size={20}
              color={habit.completed ? "#000000" : "#8E8E93"}
            />
          </View>

          {/* Habit Info */}
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontFamily: "Inter_600SemiBold",
                fontSize: 16,
                color: habit.completed ? "#8E8E93" : "#FFFFFF",
                textDecorationLine: habit.completed ? "line-through" : "none",
                marginBottom: 2,
              }}
            >
              {habit.name}
            </Text>
            <Text
              style={{
                fontFamily: "Inter_400Regular",
                fontSize: 14,
                color: "#8E8E93",
              }}
            >
              {habit.streak} day streak
            </Text>
          </View>

          {/* Completion Checkbox */}
          <View
            style={{
              width: 24,
              height: 24,
              borderRadius: 6,
              backgroundColor: habit.completed ? "#4EFF95" : "transparent",
              borderWidth: 2,
              borderColor: habit.completed ? "#4EFF95" : "#8E8E93",
              alignItems: "center",
              justifyContent: "center",
              marginRight: 12,
            }}
          >
            {habit.completed && (
              <Ionicons name="checkmark" size={16} color="#000000" />
            )}
          </View>

          {/* Note Toggle */}
          <Pressable onPress={onToggleNote}>
            <Ionicons
              name={isNoteExpanded ? "chevron-up" : "chevron-down"}
              size={20}
              color="#8E8E93"
            />
          </Pressable>
        </Pressable>

        {/* Note Section */}
        {isNoteExpanded && (
          <View
            style={{
              paddingHorizontal: 20,
              paddingBottom: 20,
              borderTopWidth: 1,
              borderTopColor: "#2C2C2E",
            }}
          >
            <TextInput
              style={{
                backgroundColor: "#2C2C2E",
                borderRadius: 12,
                padding: 12,
                marginTop: 16,
                fontFamily: "Inter_400Regular",
                fontSize: 14,
                color: "#FFFFFF",
                minHeight: 60,
                textAlignVertical: "top",
              }}
              placeholder="Add a note about this habit..."
              placeholderTextColor="#8E8E93"
              value={habit.note}
              onChangeText={onUpdateNote}
              multiline
            />
          </View>
        )}
      </View>
    </Animated.View>
  );
}

import React from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
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
import { habitsService } from "@/utils/supabaseService";
import { mockApiResponses, USE_MOCK_DATA, SIMULATE_NETWORK_ERROR, API_DELAY } from "@/utils/mockData";

export default function HabitsScreen() {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const router = useRouter();
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  // Fetch habits
  const {
    data: habitsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["habits"],
    queryFn: async () => {
      // If using mock data, return immediately
      if (USE_MOCK_DATA) {
        console.log("Using mock data for habits");
        await new Promise(resolve => setTimeout(resolve, API_DELAY));
        return mockApiResponses.habits;
      }
      
      if (SIMULATE_NETWORK_ERROR) {
        throw new Error("Failed to fetch habits");
      }
      
      try {
        // Use Supabase service
        return await habitsService.getAll();
      } catch (supabaseError) {
        console.error("Supabase error:", supabaseError);
        // Fallback to mock data if Supabase fails
        console.log("Supabase failed, using mock data for habits");
        return mockApiResponses.habits;
      }
    },
  });

  // Delete habit mutation
  const deleteHabitMutation = useMutation({
    mutationFn: async (habitId) => {
      if (USE_MOCK_DATA) {
        console.log("Using mock data, simulating habit deletion");
        await new Promise(resolve => setTimeout(resolve, 300));
        return { success: true };
      }
      
      try {
        // Use Supabase service
        return await habitsService.delete(habitId);
      } catch (supabaseError) {
        console.error("Supabase error:", supabaseError);
        throw new Error("Failed to delete habit");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habits"] });
      queryClient.invalidateQueries({ queryKey: ["progress"] });
    },
    onError: (error) => {
      console.error("Error deleting habit:", error);
      Alert.alert("Error", "Failed to delete habit");
    },
  });

  const habits = habitsData?.habits || [];

  const deleteHabit = (id) => {
    Alert.alert(
      "Delete Habit",
      "Are you sure you want to delete this habit? This will also delete all associated progress data.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteHabitMutation.mutate(id);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          },
        },
      ],
    );
  };

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
        <Text
          style={{
            fontFamily: "Inter_400Regular",
            fontSize: 16,
            color: "#8E8E93",
          }}
        >
          Loading habits...
        </Text>
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
            onPress={() => queryClient.invalidateQueries({ queryKey: ["habits"] })}
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

  const activeStreaks = habits.filter((h) => h.current_streak > 0).length;
  const thisWeekTotal = habits.reduce(
    (sum, h) => sum + h.completed_this_week,
    0,
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#000000" }}>
      <StatusBar style="light" />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
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
            Habits
          </Text>
          <Text
            style={{
              fontFamily: "Inter_400Regular",
              fontSize: 16,
              color: "#8E8E93",
            }}
          >
            {habits.length} habits tracked
          </Text>
        </View>

        {/* Statistics Cards */}
        {habits.length > 0 && (
          <View
            style={{
              flexDirection: "row",
              paddingHorizontal: 20,
              marginBottom: 30,
              gap: 12,
            }}
          >
            <StatsCard
              title="Active Streaks"
              value={activeStreaks}
              icon="flame"
              color="#FF6B35"
            />
            <StatsCard
              title="This Week"
              value={thisWeekTotal}
              icon="calendar"
              color="#4EFF95"
            />
          </View>
        )}

        {/* Habits Grid */}
        <View style={{ paddingHorizontal: 20 }}>
          <Text
            style={{
              fontFamily: "Inter_600SemiBold",
              fontSize: 18,
              color: "#FFFFFF",
              marginBottom: 16,
            }}
          >
            Your Habits
          </Text>

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
                Tap the + button to create your first habit
              </Text>
            </View>
          ) : (
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 12,
              }}
            >
              {habits.map((habit) => (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  onDelete={() => deleteHabit(habit.id)}
                  isDeleting={deleteHabitMutation.isLoading}
                  router={router}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function StatsCard({ title, value, icon, color }) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#1C1C1E",
        borderRadius: 16,
        padding: 16,
        alignItems: "center",
      }}
    >
      <View
        style={{
          width: 32,
          height: 32,
          borderRadius: 16,
          backgroundColor: color,
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 8,
        }}
      >
        <Ionicons name={icon} size={16} color="#FFFFFF" />
      </View>
      <Text
        style={{
          fontFamily: "Inter_700Bold",
          fontSize: 20,
          color: "#FFFFFF",
          marginBottom: 4,
        }}
      >
        {value}
      </Text>
      <Text
        style={{
          fontFamily: "Inter_400Regular",
          fontSize: 12,
          color: "#8E8E93",
          textAlign: "center",
        }}
      >
        {title}
      </Text>
    </View>
  );
}

function HabitCard({ habit, onDelete, isDeleting, router }) {
  const scale = useSharedValue(1);

  const handleLongPress = async () => {
    if (isDeleting) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    onDelete();
  };

  const handlePress = () => {
    scale.value = withSpring(0.95, { duration: 100 }, () => {
      scale.value = withSpring(1, { duration: 100 });
    });
    router.push(`/habit/${habit.id}`);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[animatedStyle, { width: "48%", marginBottom: 12 }]}>
      <Pressable
        onPress={handlePress}
        onLongPress={handleLongPress}
        disabled={isDeleting}
        style={{
          backgroundColor: "#1C1C1E",
          borderRadius: 16,
          padding: 16,
          alignItems: "center",
          opacity: isDeleting ? 0.5 : 1,
        }}
      >
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: "#4EFF95",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 12,
          }}
        >
          <Ionicons name={habit.icon} size={24} color="#000000" />
        </View>

        <Text
          style={{
            fontFamily: "Inter_600SemiBold",
            fontSize: 14,
            color: "#FFFFFF",
            textAlign: "center",
            marginBottom: 8,
          }}
        >
          {habit.name}
        </Text>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 4,
          }}
        >
          <Ionicons name="flame" size={12} color="#FF6B35" />
          <Text
            style={{
              fontFamily: "Inter_600SemiBold",
              fontSize: 12,
              color: "#FF6B35",
              marginLeft: 4,
            }}
          >
            {habit.current_streak} days
          </Text>
        </View>

        <Text
          style={{
            fontFamily: "Inter_400Regular",
            fontSize: 11,
            color: "#8E8E93",
            textAlign: "center",
          }}
        >
          Best: {habit.best_streak} days
        </Text>

        <Text
          style={{
            fontFamily: "Inter_400Regular",
            fontSize: 11,
            color: "#8E8E93",
            textAlign: "center",
          }}
        >
          This week: {habit.completed_this_week}/7
        </Text>
      </Pressable>
    </Animated.View>
  );
}
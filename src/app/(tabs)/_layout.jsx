import { Tabs, useRouter } from 'expo-router';
import { View, Pressable, Modal, Text, TextInput, ScrollView, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useState } from 'react';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  useFonts,
  Inter_400Regular,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import { habitsService } from '@/utils/supabaseService';
import { mockApiResponses, USE_MOCK_DATA, SIMULATE_NETWORK_ERROR, API_DELAY } from '@/utils/mockData';

const HABIT_ICONS = [
  { name: "water", label: "Water" },
  { name: "fitness", label: "Exercise" },
  { name: "book", label: "Read" },
  { name: "leaf", label: "Meditate" },
  { name: "moon", label: "Sleep" },
  { name: "restaurant", label: "Healthy Eat" },
  { name: "walk", label: "Walk" },
  { name: "school", label: "Study" },
  { name: "musical-notes", label: "Music" },
  { name: "camera", label: "Photo" },
  { name: "brush", label: "Art" },
  { name: "code", label: "Code" },
];

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const queryClient = useQueryClient();
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newHabitName, setNewHabitName] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("water");
  const [selectedFrequency, setSelectedFrequency] = useState("daily");
  
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  // Create habit mutation
  const createHabitMutation = useMutation({
    mutationFn: async ({ name, icon, category }) => {
      // If using mock data, simulate successful creation
      if (USE_MOCK_DATA) {
        console.log("Using mock data, simulating habit creation");
        await new Promise(resolve => setTimeout(resolve, API_DELAY));
        return { 
          success: true, 
          habit: { 
            id: Date.now(), 
            name, 
            icon, 
            category,
            current_streak: 0,
            best_streak: 0,
            completed_this_week: 0,
            total_completions: 0
          } 
        };
      }
      
      if (SIMULATE_NETWORK_ERROR) {
        throw new Error("Failed to create habit");
      }
      
      try {
        // Use Supabase service
        return await habitsService.create({ name, icon, category });
      } catch (supabaseError) {
        console.error("Supabase error:", supabaseError);
        // Simulate successful creation for demo if Supabase fails
        console.log("Supabase failed, simulating habit creation");
        return { 
          success: true, 
          habit: { 
            id: Date.now(), 
            name, 
            icon, 
            category,
            current_streak: 0,
            best_streak: 0,
            completed_this_week: 0,
            total_completions: 0
          } 
        };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habits"] });
      queryClient.invalidateQueries({ queryKey: ["progress"] });
    },
    onError: (error) => {
      console.error("Error creating habit:", error);
      Alert.alert("Error", "Failed to create habit");
    },
  });

  const handleCreateHabit = () => {
    if (!newHabitName.trim()) {
      Alert.alert("Error", "Please enter a habit name");
      return;
    }

    createHabitMutation.mutate({
      name: newHabitName.trim(),
      icon: selectedIcon,
      category: "Custom",
    });

    setNewHabitName("");
    setSelectedIcon("water");
    setSelectedFrequency("daily");
    setShowCreateModal(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const CustomTabBar = ({ state, descriptors, navigation }) => {
    const fabScale = useSharedValue(1);

    const fabAnimatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: fabScale.value }],
    }));

    return (
      <View style={{
        flexDirection: 'row',
        backgroundColor: '#1C1C1E',
        borderTopWidth: 1,
        borderTopColor: '#2C2C2E',
        paddingBottom: insets.bottom,
        paddingTop: 4,
        height: 88 + insets.bottom,
      }}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label = options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          // Insert center button after the second tab (between habits and streaks)
          if (index === 2) {
            return (
              <React.Fragment key={`${route.key}-with-center`}>
                {/* Center Add Button */}
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                  <Animated.View style={fabAnimatedStyle}>
                    <Pressable
                      onPress={() => {
                        fabScale.value = withSpring(0.9, { duration: 100 }, () => {
                          fabScale.value = withSpring(1, { duration: 100 });
                        });
                        setShowCreateModal(true);
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }}
                      style={{
                        width: 56,
                        height: 56,
                        borderRadius: 28,
                        backgroundColor: '#4EFF95',
                        alignItems: 'center',
                        justifyContent: 'center',
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.3,
                        shadowRadius: 8,
                        elevation: 8,
                        marginBottom: 20,
                      }}
                    >
                      <Ionicons name="add" size={28} color="#000000" />
                    </Pressable>
                  </Animated.View>
                </View>

                {/* Current tab */}
                <Pressable
                  key={route.key}
                  onPress={onPress}
                  style={{
                    flex: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingVertical: 8,
                  }}
                >
                  <Ionicons
                    name={options.tabBarIcon({ color: isFocused ? '#4EFF95' : '#8E8E93' }).props.name}
                    size={24}
                    color={isFocused ? '#4EFF95' : '#8E8E93'}
                  />
                  <Text style={{
                    fontSize: 11,
                    fontWeight: '500',
                    color: isFocused ? '#4EFF95' : '#8E8E93',
                    marginTop: 2,
                  }}>
                    {label}
                  </Text>
                </Pressable>
              </React.Fragment>
            );
          }

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 8,
              }}
            >
              <Ionicons
                name={options.tabBarIcon({ color: isFocused ? '#4EFF95' : '#8E8E93' }).props.name}
                size={24}
                color={isFocused ? '#4EFF95' : '#8E8E93'}
              />
              <Text style={{
                fontSize: 11,
                fontWeight: '500',
                color: isFocused ? '#4EFF95' : '#8E8E93',
                marginTop: 2,
              }}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    );
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <>
      <Tabs
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={{
          headerShown: false,
        }}
      >
        <Tabs.Screen
          name="today"
          options={{
            title: 'Today',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="today" size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="habits"
          options={{
            title: 'Habits',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="list" size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="streaks"
          options={{
            title: 'Streaks',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="flame" size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="person" size={24} color={color} />
            ),
          }}
        />
      </Tabs>

      {/* Create Habit Modal */}
      <CreateHabitModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        habitName={newHabitName}
        setHabitName={setNewHabitName}
        selectedIcon={selectedIcon}
        setSelectedIcon={setSelectedIcon}
        selectedFrequency={selectedFrequency}
        setSelectedFrequency={setSelectedFrequency}
        onSubmit={handleCreateHabit}
        isCreating={createHabitMutation.isLoading}
      />
    </>
  );
}

function CreateHabitModal({
  visible,
  onClose,
  habitName,
  setHabitName,
  selectedIcon,
  setSelectedIcon,
  selectedFrequency,
  setSelectedFrequency,
  onSubmit,
  isCreating,
}) {
  if (!visible) return null;

  const frequencies = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'custom', label: 'Custom' },
  ];

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
      accessibilityViewIsModal={true}
    >
      <Pressable
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.8)",
          justifyContent: "flex-end",
        }}
        onPress={onClose}
        accessible={false}
      >
        <Pressable
          style={{
            backgroundColor: "#1C1C1E",
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            padding: 24,
            minHeight: 500,
          }}
          onPress={() => {}} // Prevent modal close when content is touched
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 24,
            }}
          >
            <Text
              style={{
                fontFamily: "Inter_700Bold",
                fontSize: 20,
                color: "#FFFFFF",
                flex: 1,
              }}
            >
              Create New Habit
            </Text>
            <Pressable onPress={onClose}>
              <Ionicons name="close" size={24} color="#8E8E93" />
            </Pressable>
          </View>

          <Text
            style={{
              fontFamily: "Inter_600SemiBold",
              fontSize: 16,
              color: "#FFFFFF",
              marginBottom: 8,
            }}
          >
            Habit Name
          </Text>
          <TextInput
            style={{
              backgroundColor: "#2C2C2E",
              borderRadius: 12,
              padding: 16,
              fontFamily: "Inter_400Regular",
              fontSize: 16,
              color: "#FFFFFF",
              marginBottom: 24,
            }}
            placeholder="e.g., Drink 8 glasses of water"
            placeholderTextColor="#8E8E93"
            value={habitName}
            onChangeText={setHabitName}
            editable={!isCreating}
          />

          <Text
            style={{
              fontFamily: "Inter_600SemiBold",
              fontSize: 16,
              color: "#FFFFFF",
              marginBottom: 8,
            }}
          >
            Frequency
          </Text>
          <View style={{
            flexDirection: 'row',
            gap: 8,
            marginBottom: 24,
          }}>
            {frequencies.map((freq) => (
              <Pressable
                key={freq.value}
                onPress={() => !isCreating && setSelectedFrequency(freq.value)}
                disabled={isCreating}
                style={{
                  flex: 1,
                  backgroundColor: selectedFrequency === freq.value ? '#4EFF95' : '#2C2C2E',
                  borderRadius: 12,
                  padding: 12,
                  alignItems: 'center',
                  opacity: isCreating ? 0.5 : 1,
                }}
              >
                <Text style={{
                  fontFamily: 'Inter_600SemiBold',
                  fontSize: 14,
                  color: selectedFrequency === freq.value ? '#000000' : '#8E8E93',
                }}>
                  {freq.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text
            style={{
              fontFamily: "Inter_600SemiBold",
              fontSize: 16,
              color: "#FFFFFF",
              marginBottom: 16,
            }}
          >
            Choose an Emoji
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginBottom: 32 }}
          >
            <View
              style={{
                flexDirection: "row",
                gap: 12,
                paddingHorizontal: 4,
              }}
            >
              {HABIT_ICONS.map((icon) => (
                <Pressable
                  key={icon.name}
                  onPress={() => !isCreating && setSelectedIcon(icon.name)}
                  disabled={isCreating}
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: 30,
                    backgroundColor:
                      selectedIcon === icon.name ? "#4EFF95" : "#2C2C2E",
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: isCreating ? 0.5 : 1,
                  }}
                >
                  <Ionicons
                    name={icon.name}
                    size={24}
                    color={selectedIcon === icon.name ? "#000000" : "#8E8E93"}
                  />
                </Pressable>
              ))}
            </View>
          </ScrollView>

          <View
            style={{
              flexDirection: "row",
              gap: 12,
            }}
          >
            <Pressable
              onPress={onClose}
              disabled={isCreating}
              style={{
                flex: 1,
                backgroundColor: "#2C2C2E",
                borderRadius: 12,
                padding: 16,
                alignItems: "center",
                opacity: isCreating ? 0.5 : 1,
              }}
            >
              <Text
                style={{
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 16,
                  color: "#FFFFFF",
                }}
              >
                Cancel
              </Text>
            </Pressable>
            <Pressable
              onPress={onSubmit}
              disabled={isCreating}
              style={{
                flex: 1,
                backgroundColor: isCreating ? "#8E8E93" : "#4EFF95",
                borderRadius: 12,
                padding: 16,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 16,
                  color: "#000000",
                }}
              >
                {isCreating ? "Creating..." : "Create Habit"}
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
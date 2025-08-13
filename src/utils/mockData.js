// Mock data for development when API is not available

export const mockHabits = [
  {
    id: 1,
    name: "Su İçmek",
    icon: "water",
    category: "Sağlık",
    current_streak: 5,
    best_streak: 12,
    completed_this_week: 4,
    total_completions: 45,
    created_at: "2024-01-01"
  },
  {
    id: 2,
    name: "Egzersiz Yapmak",
    icon: "fitness",
    category: "Fitness",
    current_streak: 3,
    best_streak: 8,
    completed_this_week: 3,
    total_completions: 28,
    created_at: "2024-01-05"
  },
  {
    id: 3,
    name: "Kitap Okumak",
    icon: "book",
    category: "Eğitim",
    current_streak: 7,
    best_streak: 15,
    completed_this_week: 6,
    total_completions: 35,
    created_at: "2024-01-03"
  },
  {
    id: 4,
    name: "Meditasyon",
    icon: "leaf",
    category: "Mental Sağlık",
    current_streak: 2,
    best_streak: 10,
    completed_this_week: 2,
    total_completions: 22,
    created_at: "2024-01-10"
  }
];

export const mockTodayProgress = [
  {
    habit_id: 1,
    name: "Su İçmek",
    icon: "water",
    completed: true,
    note: "8 bardak su içtim",
    streak: 5
  },
  {
    habit_id: 2,
    name: "Egzersiz Yapmak",
    icon: "fitness",
    completed: false,
    note: "",
    streak: 3
  },
  {
    habit_id: 3,
    name: "Kitap Okumak",
    icon: "book",
    completed: true,
    note: "30 sayfa okudum",
    streak: 7
  },
  {
    habit_id: 4,
    name: "Meditasyon",
    icon: "leaf",
    completed: false,
    note: "",
    streak: 2
  }
];

export const mockCalendarData = () => {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  
  const calendarData = [];
  
  // Empty cells for days before the first day of the month
  for (let i = 0; i < firstDay; i++) {
    calendarData.push(null);
  }
  
  // Generate mock data for each day
  for (let day = 1; day <= daysInMonth; day++) {
    const completions = Math.floor(Math.random() * 5); // 0-4 completions
    const isToday = day === currentDate.getDate();
    
    calendarData.push({
      day,
      completions,
      is_today: isToday
    });
  }
  
  return calendarData;
};

export const mockStats = {
  active_days: 18,
  total_completions: 130
};

// Mock habit detail data
export const getMockHabitDetail = (habitId) => {
  const habit = mockHabits.find(h => h.id == habitId);
  if (!habit) return null;
  
  return {
    habit: habit
  };
};

// Mock progress data for habit detail calendar
export const getMockHabitProgress = (habitId, year, month) => {
  const daysInMonth = new Date(year, month, 0).getDate();
  const progress = {};
  
  // Generate random progress data for the month
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const completed = Math.random() > 0.4; // 60% chance of completion
    
    if (completed || Math.random() > 0.8) { // Include some incomplete days
      progress[dateStr] = {
        completed,
        note: completed ? "Başarıyla tamamlandı" : ""
      };
    }
  }
  
  return { progress };
};

// API response formatında mock data
export const mockApiResponses = {
  habits: { habits: mockHabits },
  progress: { progress: mockTodayProgress },
  calendar: { 
    calendarData: mockCalendarData(),
    stats: mockStats 
  }
};

// Development modunda API'ler mevcut olmadığı için mock data kullan
export const USE_MOCK_DATA = true;

// Network error simülasyonu için flag (mock data aktifken kullanılmaz)
export const SIMULATE_NETWORK_ERROR = false;

// Mock API delay
export const API_DELAY = 300; // ms

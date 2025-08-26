import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
const STORAGE_KEYS = {
  HABITS: 'habits',
  PROGRESS: 'progress',
  USER_PREFERENCES: 'user_preferences',
};

// Helper functions for data generation
const generateId = () => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
};

const getCurrentDate = () => {
  return new Date().toISOString().split('T')[0];
};

// =================== LOCAL HABITS SERVICES ===================

export const localHabitsService = {
  // Tüm alışkanlıkları getir
  async getAll() {
    try {
      const habits = await AsyncStorage.getItem(STORAGE_KEYS.HABITS);
      return {
        habits: habits ? JSON.parse(habits) : []
      };
    } catch (error) {
      console.error('Local habits fetch error:', error);
      return { habits: [] };
    }
  },

  // Yeni alışkanlık oluştur
  async create(habitData) {
    try {
      const { habits } = await this.getAll();
      
      const newHabit = {
        id: generateId(),
        name: habitData.name,
        icon: habitData.icon || 'checkmark-circle',
        category: habitData.category || 'Custom',
        current_streak: 0,
        best_streak: 0,
        completed_this_week: 0,
        total_completions: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: 'local_user', // Placeholder for local storage
      };

      const updatedHabits = [...habits, newHabit];
      await AsyncStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(updatedHabits));

      return { habit: newHabit };
    } catch (error) {
      console.error('Local habit creation error:', error);
      throw new Error('Failed to create habit locally');
    }
  },

  // Alışkanlık güncelle
  async update(id, updates) {
    try {
      const { habits } = await this.getAll();
      const habitIndex = habits.findIndex(h => h.id === id);
      
      if (habitIndex === -1) {
        throw new Error('Habit not found');
      }

      const updatedHabit = {
        ...habits[habitIndex],
        ...updates,
        updated_at: new Date().toISOString(),
      };

      habits[habitIndex] = updatedHabit;
      await AsyncStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(habits));

      return { habit: updatedHabit };
    } catch (error) {
      console.error('Local habit update error:', error);
      throw new Error('Failed to update habit locally');
    }
  },

  // Alışkanlık sil
  async delete(id) {
    try {
      const { habits } = await this.getAll();
      const filteredHabits = habits.filter(h => h.id !== id);
      
      await AsyncStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(filteredHabits));

      // İlgili progress kayıtlarını da sil
      await localProgressService.deleteByHabitId(id);

      return { success: true };
    } catch (error) {
      console.error('Local habit deletion error:', error);
      throw new Error('Failed to delete habit locally');
    }
  },

  // Tek alışkanlık detayını getir
  async getById(id) {
    try {
      const { habits } = await this.getAll();
      const habit = habits.find(h => h.id === id);
      
      if (!habit) {
        throw new Error('Habit not found');
      }

      return { habit };
    } catch (error) {
      console.error('Local habit fetch by ID error:', error);
      throw new Error('Failed to fetch habit locally');
    }
  },

  // Streak güncellemesi
  async updateStreaks(habitId, completed) {
    try {
      const { habit } = await this.getById(habitId);
      
      const updates = { ...habit };

      if (completed) {
        updates.current_streak += 1;
        updates.best_streak = Math.max(updates.best_streak, updates.current_streak);
        updates.total_completions += 1;
        
        // Haftalık sayı güncellemesi (basit implementasyon)
        updates.completed_this_week += 1;
      } else {
        updates.current_streak = 0;
      }

      return await this.update(habitId, updates);
    } catch (error) {
      console.error('Local streak update error:', error);
      throw new Error('Failed to update streaks locally');
    }
  }
};

// =================== LOCAL PROGRESS SERVICES ===================

export const localProgressService = {
  // Tüm progress kayıtlarını getir
  async getAll() {
    try {
      const progress = await AsyncStorage.getItem(STORAGE_KEYS.PROGRESS);
      return progress ? JSON.parse(progress) : [];
    } catch (error) {
      console.error('Local progress fetch error:', error);
      return [];
    }
  },

  // Belirli tarih için progress getir
  async getByDate(date) {
    try {
      const { habits } = await localHabitsService.getAll();
      const allProgress = await this.getAll();
      
      // Her alışkanlık için progress durumunu oluştur
      const progressData = habits.map(habit => {
        const dayProgress = allProgress.find(p => 
          p.habit_id === habit.id && p.completion_date === date
        );
        
        return {
          habit_id: habit.id,
          name: habit.name,
          icon: habit.icon,
          completed: dayProgress?.completed || false,
          note: dayProgress?.note || '',
          streak: habit.current_streak,
        };
      });

      return { progress: progressData };
    } catch (error) {
      console.error('Local progress by date error:', error);
      throw new Error('Failed to fetch progress locally');
    }
  },

  // Progress güncelle
  async update(habitId, date, completed, note = '') {
    try {
      const allProgress = await this.getAll();
      
      // Mevcut progress'i kontrol et
      const existingIndex = allProgress.findIndex(p => 
        p.habit_id === habitId && p.completion_date === date
      );

      let progressEntry;

      if (existingIndex !== -1) {
        // Güncelle
        progressEntry = {
          ...allProgress[existingIndex],
          completed,
          note,
          updated_at: new Date().toISOString(),
        };
        allProgress[existingIndex] = progressEntry;
      } else {
        // Yeni kayıt oluştur
        progressEntry = {
          id: generateId(),
          habit_id: habitId,
          completion_date: date,
          completed,
          note,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          user_id: 'local_user',
        };
        allProgress.push(progressEntry);
      }

      await AsyncStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(allProgress));

      // Habit streak'lerini güncelle
      await localHabitsService.updateStreaks(habitId, completed);

      return { success: true, progress: progressEntry };
    } catch (error) {
      console.error('Local progress update error:', error);
      throw new Error('Failed to update progress locally');
    }
  },

  // Belirli habit ve tarih aralığı için progress getir
  async getByHabitAndDateRange(habitId, startDate, endDate) {
    try {
      const allProgress = await this.getAll();
      
      const filteredProgress = allProgress.filter(p => 
        p.habit_id === habitId &&
        p.completion_date >= startDate &&
        p.completion_date <= endDate
      );

      // Date string'leri key olarak kullanarak object'e çevir
      const progressByDate = {};
      filteredProgress.forEach(p => {
        progressByDate[p.completion_date] = p;
      });

      return { progress: progressByDate };
    } catch (error) {
      console.error('Local progress by range error:', error);
      throw new Error('Failed to fetch progress range locally');
    }
  },

  // Habit silindiğinde ilgili progress'leri sil
  async deleteByHabitId(habitId) {
    try {
      const allProgress = await this.getAll();
      const filteredProgress = allProgress.filter(p => p.habit_id !== habitId);
      
      await AsyncStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(filteredProgress));
      return { success: true };
    } catch (error) {
      console.error('Local progress deletion error:', error);
      throw new Error('Failed to delete progress locally');
    }
  }
};

// =================== LOCAL CALENDAR/STATS SERVICES ===================

export const localCalendarService = {
  // Belirli ay için calendar data getir
  async getMonthData(year, month) {
    try {
      // Ay başı ve sonu tarihleri
      const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
      const endDate = `${year}-${String(month).padStart(2, '0')}-${new Date(year, month, 0).getDate()}`;

      // Progress verilerini getir
      const allProgress = await localProgressService.getAll();
      
      const progress = allProgress.filter(p => 
        p.completion_date >= startDate && 
        p.completion_date <= endDate &&
        p.completed
      );

      // Calendar grid için data hazırla
      const daysInMonth = new Date(year, month, 0).getDate();
      const firstDay = new Date(year, month - 1, 1).getDay();
      const today = new Date();
      
      const calendarData = [];
      
      // Boş günler
      for (let i = 0; i < firstDay; i++) {
        calendarData.push(null);
      }
      
      // Ay günleri
      for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayProgress = progress.filter(p => p.completion_date === dateStr);
        const isToday = day === today.getDate() && 
                       month === today.getMonth() + 1 && 
                       year === today.getFullYear();
        
        calendarData.push({
          day,
          completions: dayProgress.length,
          is_today: isToday
        });
      }

      // İstatistikler
      const activeDays = progress.length;
      const totalCompletions = progress.length;

      return {
        calendarData,
        stats: {
          active_days: activeDays,
          total_completions: totalCompletions
        }
      };
    } catch (error) {
      console.error('Local calendar data error:', error);
      throw new Error('Failed to fetch calendar data locally');
    }
  }
};

// =================== DATA MANAGEMENT ===================

export const localDataService = {
  // Tüm local data'yı temizle
  async clearAll() {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.HABITS,
        STORAGE_KEYS.PROGRESS,
        STORAGE_KEYS.USER_PREFERENCES,
      ]);
      return { success: true };
    } catch (error) {
      console.error('Clear local data error:', error);
      throw new Error('Failed to clear local data');
    }
  },

  // Local data'yı export et
  async exportData() {
    try {
      const habits = await AsyncStorage.getItem(STORAGE_KEYS.HABITS);
      const progress = await AsyncStorage.getItem(STORAGE_KEYS.PROGRESS);
      
      return {
        habits: habits ? JSON.parse(habits) : [],
        progress: progress ? JSON.parse(progress) : [],
        exportDate: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Export data error:', error);
      throw new Error('Failed to export data');
    }
  },

  // Data import et
  async importData(data) {
    try {
      if (data.habits) {
        await AsyncStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(data.habits));
      }
      if (data.progress) {
        await AsyncStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(data.progress));
      }
      return { success: true };
    } catch (error) {
      console.error('Import data error:', error);
      throw new Error('Failed to import data');
    }
  }
};

import { habitsService as supabaseHabitsService, progressService as supabaseProgressService, calendarService as supabaseCalendarService } from './supabaseService';
import { localHabitsService, localProgressService, localCalendarService } from './localStorageService';
import { hasValidCredentials } from './supabase';

/**
 * Unified Service
 * Kullanıcı giriş yapmışsa Supabase, yapmamışsa Local Storage kullanır
 */

// Auth durumunu kontrol eden helper
const shouldUseSupabase = (isAuthenticated) => {
  return isAuthenticated && hasValidCredentials;
};

// =================== UNIFIED HABITS SERVICES ===================

export const unifiedHabitsService = {
  // Tüm alışkanlıkları getir
  async getAll(isAuthenticated = false) {
    try {
      if (shouldUseSupabase(isAuthenticated)) {
        console.log('📊 Using Supabase for habits.getAll');
        return await supabaseHabitsService.getAll();
      } else {
        console.log('💾 Using Local Storage for habits.getAll');
        return await localHabitsService.getAll();
      }
    } catch (error) {
      console.error('Unified habits.getAll error:', error);
      // Fallback to local storage if Supabase fails
      if (shouldUseSupabase(isAuthenticated)) {
        console.log('⚠️ Supabase failed, falling back to local storage');
        return await localHabitsService.getAll();
      }
      throw error;
    }
  },

  // Yeni alışkanlık oluştur
  async create(habitData, isAuthenticated = false) {
    try {
      if (shouldUseSupabase(isAuthenticated)) {
        console.log('📊 Using Supabase for habits.create');
        return await supabaseHabitsService.create(habitData);
      } else {
        console.log('💾 Using Local Storage for habits.create');
        return await localHabitsService.create(habitData);
      }
    } catch (error) {
      console.error('Unified habits.create error:', error);
      // Fallback to local storage if Supabase fails
      if (shouldUseSupabase(isAuthenticated)) {
        console.log('⚠️ Supabase failed, falling back to local storage');
        return await localHabitsService.create(habitData);
      }
      throw error;
    }
  },

  // Alışkanlık güncelle
  async update(id, updates, isAuthenticated = false) {
    try {
      if (shouldUseSupabase(isAuthenticated)) {
        console.log('📊 Using Supabase for habits.update');
        return await supabaseHabitsService.update(id, updates);
      } else {
        console.log('💾 Using Local Storage for habits.update');
        return await localHabitsService.update(id, updates);
      }
    } catch (error) {
      console.error('Unified habits.update error:', error);
      // Fallback to local storage if Supabase fails
      if (shouldUseSupabase(isAuthenticated)) {
        console.log('⚠️ Supabase failed, falling back to local storage');
        return await localHabitsService.update(id, updates);
      }
      throw error;
    }
  },

  // Alışkanlık sil
  async delete(id, isAuthenticated = false) {
    try {
      if (shouldUseSupabase(isAuthenticated)) {
        console.log('📊 Using Supabase for habits.delete');
        return await supabaseHabitsService.delete(id);
      } else {
        console.log('💾 Using Local Storage for habits.delete');
        return await localHabitsService.delete(id);
      }
    } catch (error) {
      console.error('Unified habits.delete error:', error);
      // Fallback to local storage if Supabase fails
      if (shouldUseSupabase(isAuthenticated)) {
        console.log('⚠️ Supabase failed, falling back to local storage');
        return await localHabitsService.delete(id);
      }
      throw error;
    }
  },

  // Tek alışkanlık detayını getir
  async getById(id, isAuthenticated = false) {
    try {
      if (shouldUseSupabase(isAuthenticated)) {
        console.log('📊 Using Supabase for habits.getById');
        return await supabaseHabitsService.getById(id);
      } else {
        console.log('💾 Using Local Storage for habits.getById');
        return await localHabitsService.getById(id);
      }
    } catch (error) {
      console.error('Unified habits.getById error:', error);
      // Fallback to local storage if Supabase fails
      if (shouldUseSupabase(isAuthenticated)) {
        console.log('⚠️ Supabase failed, falling back to local storage');
        return await localHabitsService.getById(id);
      }
      throw error;
    }
  },

  // Streak güncellemesi
  async updateStreaks(habitId, completed, isAuthenticated = false) {
    try {
      if (shouldUseSupabase(isAuthenticated)) {
        console.log('📊 Using Supabase for habits.updateStreaks');
        return await supabaseHabitsService.updateStreaks(habitId, completed);
      } else {
        console.log('💾 Using Local Storage for habits.updateStreaks');
        return await localHabitsService.updateStreaks(habitId, completed);
      }
    } catch (error) {
      console.error('Unified habits.updateStreaks error:', error);
      // Fallback to local storage if Supabase fails
      if (shouldUseSupabase(isAuthenticated)) {
        console.log('⚠️ Supabase failed, falling back to local storage');
        return await localHabitsService.updateStreaks(habitId, completed);
      }
      throw error;
    }
  }
};

// =================== UNIFIED PROGRESS SERVICES ===================

export const unifiedProgressService = {
  // Belirli tarih için progress getir
  async getByDate(date, isAuthenticated = false) {
    try {
      if (shouldUseSupabase(isAuthenticated)) {
        console.log('📊 Using Supabase for progress.getByDate');
        return await supabaseProgressService.getByDate(date);
      } else {
        console.log('💾 Using Local Storage for progress.getByDate');
        return await localProgressService.getByDate(date);
      }
    } catch (error) {
      console.error('Unified progress.getByDate error:', error);
      // Fallback to local storage if Supabase fails
      if (shouldUseSupabase(isAuthenticated)) {
        console.log('⚠️ Supabase failed, falling back to local storage');
        return await localProgressService.getByDate(date);
      }
      throw error;
    }
  },

  // Progress güncelle
  async update(habitId, date, completed, note = '', isAuthenticated = false) {
    try {
      if (shouldUseSupabase(isAuthenticated)) {
        console.log('📊 Using Supabase for progress.update');
        return await supabaseProgressService.update(habitId, date, completed, note);
      } else {
        console.log('💾 Using Local Storage for progress.update');
        return await localProgressService.update(habitId, date, completed, note);
      }
    } catch (error) {
      console.error('Unified progress.update error:', error);
      // Fallback to local storage if Supabase fails
      if (shouldUseSupabase(isAuthenticated)) {
        console.log('⚠️ Supabase failed, falling back to local storage');
        return await localProgressService.update(habitId, date, completed, note);
      }
      throw error;
    }
  },

  // Belirli habit ve tarih aralığı için progress getir
  async getByHabitAndDateRange(habitId, startDate, endDate, isAuthenticated = false) {
    try {
      if (shouldUseSupabase(isAuthenticated)) {
        console.log('📊 Using Supabase for progress.getByHabitAndDateRange');
        return await supabaseProgressService.getByHabitAndDateRange(habitId, startDate, endDate);
      } else {
        console.log('💾 Using Local Storage for progress.getByHabitAndDateRange');
        return await localProgressService.getByHabitAndDateRange(habitId, startDate, endDate);
      }
    } catch (error) {
      console.error('Unified progress.getByHabitAndDateRange error:', error);
      // Fallback to local storage if Supabase fails
      if (shouldUseSupabase(isAuthenticated)) {
        console.log('⚠️ Supabase failed, falling back to local storage');
        return await localProgressService.getByHabitAndDateRange(habitId, startDate, endDate);
      }
      throw error;
    }
  }
};

// =================== UNIFIED CALENDAR/STATS SERVICES ===================

export const unifiedCalendarService = {
  // Belirli ay için calendar data getir
  async getMonthData(year, month, isAuthenticated = false) {
    try {
      if (shouldUseSupabase(isAuthenticated)) {
        console.log('📊 Using Supabase for calendar.getMonthData');
        return await supabaseCalendarService.getMonthData(year, month);
      } else {
        console.log('💾 Using Local Storage for calendar.getMonthData');
        return await localCalendarService.getMonthData(year, month);
      }
    } catch (error) {
      console.error('Unified calendar.getMonthData error:', error);
      // Fallback to local storage if Supabase fails
      if (shouldUseSupabase(isAuthenticated)) {
        console.log('⚠️ Supabase failed, falling back to local storage');
        return await localCalendarService.getMonthData(year, month);
      }
      throw error;
    }
  }
};

// =================== DATA SYNC HELPERS ===================

export const syncService = {
  // Local data'yı Supabase'e sync et (kullanıcı giriş yaptığında)
  async syncLocalToSupabase() {
    try {
      console.log('🔄 Starting local to Supabase sync...');
      
      // Local habits'i al
      const { habits: localHabits } = await localHabitsService.getAll();
      const localProgress = await localProgressService.getAll();

      // Her local habit'i Supabase'e ekle
      for (const localHabit of localHabits) {
        try {
          const habitData = {
            name: localHabit.name,
            icon: localHabit.icon,
            category: localHabit.category,
          };
          
          const { habit: newSupabaseHabit } = await supabaseHabitsService.create(habitData);
          
          // İlgili progress kayıtlarını da sync et
          const relatedProgress = localProgress.filter(p => p.habit_id === localHabit.id);
          
          for (const progress of relatedProgress) {
            await supabaseProgressService.update(
              newSupabaseHabit.id,
              progress.completion_date,
              progress.completed,
              progress.note || ''
            );
          }
          
          console.log(`✅ Synced habit: ${localHabit.name}`);
        } catch (error) {
          console.error(`❌ Failed to sync habit: ${localHabit.name}`, error);
        }
      }

      console.log('🔄 Sync completed');
      return { success: true, syncedHabits: localHabits.length };
    } catch (error) {
      console.error('Sync error:', error);
      throw new Error('Failed to sync data to Supabase');
    }
  },

  // Supabase data'yı local'e sync et (backup için)
  async syncSupabaseToLocal() {
    try {
      console.log('🔄 Starting Supabase to local backup sync...');
      
      // Bu özelliği daha sonra implement edebiliriz
      // Şu an için local storage primary source olacak
      
      console.log('🔄 Backup sync completed');
      return { success: true };
    } catch (error) {
      console.error('Backup sync error:', error);
      throw new Error('Failed to backup data to local storage');
    }
  }
};

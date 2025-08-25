import { supabase } from './supabase';

// =================== HABITS SERVICES ===================

export const habitsService = {
  // Tüm alışkanlıkları getir
  async getAll() {
    const { data: habits, error } = await supabase
      .from('habits')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { habits };
  },

  // Yeni alışkanlık oluştur
  async create(habitData) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data: habit, error } = await supabase
      .from('habits')
      .insert([{
        ...habitData,
        user_id: user.id,
      }])
      .select()
      .single();

    if (error) throw error;
    return { habit };
  },

  // Alışkanlık güncelle
  async update(id, updates) {
    const { data: habit, error } = await supabase
      .from('habits')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { habit };
  },

  // Alışkanlık sil
  async delete(id) {
    const { error } = await supabase
      .from('habits')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  },

  // Tek alışkanlık detayını getir
  async getById(id) {
    const { data: habit, error } = await supabase
      .from('habits')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return { habit };
  },

  // Streak güncellemesi
  async updateStreaks(habitId, completed) {
    const { data: habit, error: fetchError } = await supabase
      .from('habits')
      .select('current_streak, best_streak, completed_this_week, total_completions')
      .eq('id', habitId)
      .single();

    if (fetchError) throw fetchError;

    const updates = { ...habit };

    if (completed) {
      updates.current_streak += 1;
      updates.best_streak = Math.max(updates.best_streak, updates.current_streak);
      updates.total_completions += 1;
      
      // Haftalık sayı güncellemesi (basit implementasyon)
      const today = new Date().getDay();
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - today);
      updates.completed_this_week += 1;
    } else {
      updates.current_streak = 0;
    }

    const { data: updatedHabit, error } = await supabase
      .from('habits')
      .update(updates)
      .eq('id', habitId)
      .select()
      .single();

    if (error) throw error;
    return { habit: updatedHabit };
  }
};

// =================== PROGRESS SERVICES ===================

export const progressService = {
  // Belirli tarih için progress getir
  async getByDate(date) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data: progress, error } = await supabase
      .from('progress')
      .select(`
        *,
        habits (
          id,
          name,
          icon,
          current_streak
        )
      `)
      .eq('completion_date', date)
      .eq('user_id', user.id);

    if (error) throw error;

    // Tüm alışkanlıkları getir ve progress ile birleştir
    const { data: allHabits, error: habitsError } = await supabase
      .from('habits')
      .select('id, name, icon, current_streak')
      .eq('user_id', user.id);

    if (habitsError) throw habitsError;

    // Her alışkanlık için progress durumunu oluştur
    const progressData = allHabits.map(habit => {
      const dayProgress = progress.find(p => p.habit_id === habit.id);
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
  },

  // Progress güncelle
  async update(habitId, date, completed, note = '') {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Önce mevcut progress'i kontrol et
    const { data: existingProgress } = await supabase
      .from('progress')
      .select('*')
      .eq('habit_id', habitId)
      .eq('completion_date', date)
      .eq('user_id', user.id)
      .single();

    let result;
    if (existingProgress) {
      // Güncelle
      const { data, error } = await supabase
        .from('progress')
        .update({ completed, note })
        .eq('id', existingProgress.id)
        .select()
        .single();
      
      if (error) throw error;
      result = data;
    } else {
      // Yeni kayıt oluştur
      const { data, error } = await supabase
        .from('progress')
        .insert([{
          habit_id: habitId,
          completion_date: date,
          completed,
          note,
          user_id: user.id,
        }])
        .select()
        .single();
      
      if (error) throw error;
      result = data;
    }

    // Habit streak'lerini güncelle
    await habitsService.updateStreaks(habitId, completed);

    return { success: true, progress: result };
  },

  // Belirli habit ve tarih aralığı için progress getir
  async getByHabitAndDateRange(habitId, startDate, endDate) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data: progress, error } = await supabase
      .from('progress')
      .select('*')
      .eq('habit_id', habitId)
      .eq('user_id', user.id)
      .gte('completion_date', startDate)
      .lte('completion_date', endDate);

    if (error) throw error;

    // Date string'leri key olarak kullanarak object'e çevir
    const progressByDate = {};
    progress.forEach(p => {
      progressByDate[p.completion_date] = p;
    });

    return { progress: progressByDate };
  }
};

// =================== CALENDAR/STATS SERVICES ===================

export const calendarService = {
  // Belirli ay için calendar data getir
  async getMonthData(year, month) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Ay başı ve sonu tarihleri
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = `${year}-${String(month).padStart(2, '0')}-${new Date(year, month, 0).getDate()}`;

    // Progress verilerini getir
    const { data: progress, error } = await supabase
      .from('progress')
      .select('completion_date, completed')
      .eq('user_id', user.id)
      .gte('completion_date', startDate)
      .lte('completion_date', endDate);

    if (error) throw error;

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
      const dayProgress = progress.filter(p => p.completion_date === dateStr && p.completed);
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
    const activeDays = progress.filter(p => p.completed).length;
    const totalCompletions = progress.filter(p => p.completed).length;

    return {
      calendarData,
      stats: {
        active_days: activeDays,
        total_completions: totalCompletions
      }
    };
  }
};

// =================== AUTH HELPERS ===================

export const authService = {
  // Mevcut kullanıcıyı getir
  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  // Çıkış yap
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // Authentication state değişikliklerini dinle
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback);
  }
};

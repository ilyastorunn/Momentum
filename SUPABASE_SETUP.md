# 🚀 Supabase Setup Guide

Bu dosya, habit tracker uygulamasında Supabase entegrasyonunu tamamlamak için gerekli adımları içerir.

## 📋 Veritabanı Şeması

### 1. Habits Tablosu

```sql
-- Habits tablosu
CREATE TABLE IF NOT EXISTS habits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  category TEXT DEFAULT 'Custom',
  current_streak INTEGER DEFAULT 0,
  best_streak INTEGER DEFAULT 0,
  completed_this_week INTEGER DEFAULT 0,
  total_completions INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- RLS (Row Level Security) aktif et
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own habits" ON habits
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own habits" ON habits
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own habits" ON habits
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own habits" ON habits
  FOR DELETE USING (auth.uid() = user_id);
```

### 2. Progress Tablosu

```sql
-- Progress tablosu
CREATE TABLE IF NOT EXISTS progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  habit_id UUID REFERENCES habits(id) ON DELETE CASCADE,
  completion_date DATE NOT NULL,
  completed BOOLEAN DEFAULT false,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  UNIQUE(habit_id, completion_date, user_id)
);

-- RLS aktif et
ALTER TABLE progress ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own progress" ON progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress" ON progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress" ON progress
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own progress" ON progress
  FOR DELETE USING (auth.uid() = user_id);
```

### 3. Trigger Functions

```sql
-- Updated at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Updated at triggers
CREATE TRIGGER update_habits_updated_at BEFORE UPDATE ON habits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_progress_updated_at BEFORE UPDATE ON progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 4. Indexes (Performance için)

```sql
-- Performance indexes
CREATE INDEX idx_habits_user_id ON habits(user_id);
CREATE INDEX idx_habits_created_at ON habits(created_at DESC);

CREATE INDEX idx_progress_user_id ON progress(user_id);
CREATE INDEX idx_progress_habit_id ON progress(habit_id);
CREATE INDEX idx_progress_completion_date ON progress(completion_date DESC);
CREATE INDEX idx_progress_user_habit_date ON progress(user_id, habit_id, completion_date);
```

## ⚙️ Konfigürasyon

### 1. Environment Variables

Projenin root dizininde `.env` dosyası oluşturun:

```bash
# .env
EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
EXPO_PUBLIC_USE_MOCK_DATA=false
EXPO_PUBLIC_SIMULATE_NETWORK_ERROR=false
```

### 2. Supabase Proje Kurulumu

1. [Supabase Dashboard](https://app.supabase.com/) üzerinden yeni proje oluşturun
2. Yukarıdaki SQL komutlarını **SQL Editor**'de çalıştırın
3. Project Settings > API'den URL ve anon key'i alın
4. Environment variables'a ekleyin

### 3. Authentication Setup

```sql
-- Public profiles tablosu (opsiyonel)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS aktif et
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Trigger: Yeni kullanıcı kaydolduğunda profil oluştur
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'display_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

## 🔄 Migration İşlemleri

Uygulamada `USE_MOCK_DATA = false` yaptığınızda:

1. ✅ Tüm API çağrıları Supabase'e yönlendirilir
2. ✅ Gerçek kullanıcı authentication gerekli
3. ✅ Data persistence ve sync çalışır
4. ✅ Real-time updates mümkün

## 🧪 Test Etme

### Mock Data'dan Supabase'e Geçiş

```javascript
// src/utils/mockData.js
export const USE_MOCK_DATA = false; // Bunu false yapın

// veya environment variable ile
// .env dosyasında:
EXPO_PUBLIC_USE_MOCK_DATA=false
```

### Authentication Test

```javascript
import { supabase } from '@/utils/supabase';

// Test kullanıcısı oluşturma
const { data, error } = await supabase.auth.signUp({
  email: 'test@example.com',
  password: 'test123456'
});
```

## 🚨 Önemli Notlar

1. **RLS (Row Level Security)** aktif - kullanıcılar sadece kendi verilerini görebilir
2. **Authentication required** - API çağrıları için giriş yapmış kullanıcı gerekli
3. **Fallback mechanism** - Supabase hatası durumunda mock data'ya düşer
4. **Real-time ready** - Supabase real-time subscriptions için hazır

## 📱 Production Deploy

Production'a geçerken:

1. Environment variables'ı production değerleriyle güncelleyin
2. `USE_MOCK_DATA=false` yapın
3. Supabase URL ve keys'leri production environment'a ekleyin
4. RLS policies'leri test edin

---

Bu setup tamamlandığında uygulamanız tamamen fonksiyonel bir backend'e sahip olacak! 🎉

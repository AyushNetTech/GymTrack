import { AppState, Platform } from 'react-native'
import 'react-native-url-polyfill/auto'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl: string = 'https://mftvgiceccapzcgheaom.supabase.co'
const supabaseAnonKey: string =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1mdHZnaWNlY2NhcHpjZ2hlYW9tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM4MzAwNjEsImV4cCI6MjA3OTQwNjA2MX0.JYZX3i-lYcuCCyKSPlGbQFgAN2XG1AMntI3YNgfw780'

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    ...(Platform.OS !== 'web' ? { storage: AsyncStorage } : {}),
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})

// Auto-refresh auth when app comes to foreground
if (Platform.OS !== 'web') {
  const handleAppStateChange = (state: string) => {
    if (state === 'active') {
      supabase.auth.startAutoRefresh()
    } else {
      supabase.auth.stopAutoRefresh()
    }
  }
  AppState.addEventListener('change', handleAppStateChange)
}

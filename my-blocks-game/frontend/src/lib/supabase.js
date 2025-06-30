// supabase.js - Supabase設定ファイル
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Supabaseプロジェクトの設定
const supabaseUrl = 'https://oaaicpboljxhhkemjnbp.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9hYWljcGJvbGp4aGhrZW1qbmJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc2NzM1ODMsImV4cCI6MjA2MzI0OTU4M30.IGnBCPV9YyOiXgEpeLjbC6vyvhjorQ7YAEZQkNRdKd8'

// Supabaseクライアントを作成・エクスポート
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

console.log('本物のSupabaseクライアント初期化完了')
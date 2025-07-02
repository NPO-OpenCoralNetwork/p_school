import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://oaaicpboljxhhkemjnbp.supabase.co'; // 自分のURLに置き換える
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9hYWljcGJvbGp4aGhrZW1qbmJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc2NzM1ODMsImV4cCI6MjA2MzI0OTU4M30.IGnBCPV9YyOiXgEpeLjbC6vyvhjorQ7YAEZQkNRdKd8';          // 自分のKeyに置き換える

export const supabase = createClient(supabaseUrl, supabaseKey);

// ログイン or サインアップ関数
export async function signInOrSignUp(email, password, isLogin = true) {
  const { data, error } = isLogin
    ? await supabase.auth.signInWithPassword({ email, password })
    : await supabase.auth.signUp({ email, password });

  if (error) {
    throw error;
  }
  return data;

  
}

// ログイン状態確認
export async function getCurrentUser() {
  const { data } = await supabase.auth.getUser();
  return data.user;
}


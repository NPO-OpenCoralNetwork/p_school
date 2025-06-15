import { createClient } from '@supabase/supabase-js';

const supabase = createClient('https://oaaicpboljxhhkemjnbp.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9hYWljcGJvbGp4aGhrZW1qbmJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc2NzM1ODMsImV4cCI6MjA2MzI0OTU4M30.IGnBCPV9YyOiXgEpeLjbC6vyvhjorQ7YAEZQkNRdKd8');

async function checkUser() {
  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error) {
    console.error('ユーザー取得エラー:', error.message);
    return;
  }

  if (!user) {
    console.log('ログインしていません');
    return;
  }

  console.log('ログイン中のユーザーID:', user.id); // ← これが profiles.id に渡す値
}

checkUser();

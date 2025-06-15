// Supabase 初期化
const supabase = window.supabase.createClient(
  'https://oaaicpboljxhhkemjnbp.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9hYWljcGJvbGp4aGhrZW1qbmJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc2NzM1ODMsImV4cCI6MjA2MzI0OTU4M30.IGnBCPV9YyOiXgEpeLjbC6vyvhjorQ7YAEZQkNRdKd8'
);

  

// プロフィール登録関数
async function insertProfile() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  const status = document.getElementById('profileStatus');

  if (error || !user) {
    console.error('ユーザー情報の取得に失敗しました', error);
    alert('ログインしていません');
    if (status) status.textContent = 'ユーザー情報の取得に失敗しました';
    return;
  }

  const { error: insertError } = await supabase.from('profiles').insert({
    id: user.id,
    username: 'taro_yamada',
  });

  if (insertError) {
    console.error('プロフィール登録に失敗しました', insertError);
    alert('登録失敗: ' + insertError.message);
    if (status) status.textContent = 'プロフィール登録に失敗しました';
  } else {
    console.log('プロフィール登録に成功しました！');
    alert('プロフィール登録成功！');
    if (status) status.textContent = 'プロフィール登録に成功しました！';
  }
}

// グローバルスコープに公開
window.insertProfile = insertProfile;

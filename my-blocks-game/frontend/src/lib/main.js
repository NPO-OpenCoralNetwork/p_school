// 使用例
import { signUp, signIn, getProfile, updateExperience, addBadge } from './lib/auth.js'

// ユーザー登録
try {
  const user = await signUp('user@example.com', 'password123', 'player1', '太郎')
  console.log('登録成功:', user)
} catch (error) {
  console.error('登録エラー:', error.message)
}

// ログイン
try {
  const user = await signIn('user@example.com', 'password123')
  console.log('ログイン成功:', user)
} catch (error) {
  console.error('ログインエラー:', error.message)
}

// プロフィール取得
try {
  const profile = await getProfile()
  console.log('プロフィール:', profile)
} catch (error) {
  console.error('プロフィール取得エラー:', error.message)
}

// 経験値更新
try {
  await updateExperience(1500)
  console.log('経験値更新完了')
} catch (error) {
  console.error('経験値更新エラー:', error.message)
}

// バッジ追加
try {
  await addBadge('初回ログイン')
  console.log('バッジ追加完了')
} catch (error) {
  console.error('バッジ追加エラー:', error.message)
}
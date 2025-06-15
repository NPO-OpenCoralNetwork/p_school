// profile.js - プロフィール管理機能
import { supabase } from './supabase.js'

// ユーザーログイン
export const signIn = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (error) throw error
    return data
  } catch (error) {
    console.error('ログインエラー:', error)
    throw error
  }
}

// ユーザー登録（プロフィール作成部分を削除）
export const signUp = async (email, password, username, name) => {
  try {
    // Supabase Authでユーザー登録のみ
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username,
          name: name
        }
      }
    })
    
    if (error) throw error
    
    // プロフィール作成部分は削除（後でログイン時に作成）
    console.log('認証ユーザー作成成功、プロフィールはログイン時に作成します');
    
    return data
  } catch (error) {
    console.error('登録エラー:', error)
    throw error
  }
}

// ログアウト
export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  } catch (error) {
    console.error('ログアウトエラー:', error)
    throw error
  }
}

// 現在のユーザー取得
export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    return user
  } catch (error) {
    console.error('ユーザー取得エラー:', error)
    throw error
  }
}

// プロフィール取得
export const getProfile = async () => {
  try {
    const user = await getCurrentUser()
    
    if (user) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      
      if (error) throw error
      return data
    }
    return null
  } catch (error) {
    console.error('プロフィール取得エラー:', error)
    throw error
  }
}

// プロフィール更新
export const updateProfile = async (updates) => {
  try {
    const user = await getCurrentUser()
    
    if (user) {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
      
      if (error) throw error
      return data
    }
  } catch (error) {
    console.error('プロフィール更新エラー:', error)
    throw error
  }
}

// 経験値更新
export const updateExperience = async (points) => {
  try {
    const user = await getCurrentUser()
    
    if (user) {
      const { data, error } = await supabase
        .from('profiles')
        .update({ 
          experience_points: points,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
      
      if (error) throw error
      return data
    }
  } catch (error) {
    console.error('経験値更新エラー:', error)
    throw error
  }
}

// トロフィー数更新
export const updateTrophyCount = async (count) => {
  try {
    const user = await getCurrentUser()
    
    if (user) {
      const { data, error } = await supabase
        .from('profiles')
        .update({ 
          trophy_count: count,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
      
      if (error) throw error
      return data
    }
  } catch (error) {
    console.error('トロフィー更新エラー:', error)
    throw error
  }
}

// バッジ追加
export const addBadge = async (badgeName) => {
  try {
    const user = await getCurrentUser()
    
    if (user) {
      // 現在のプロフィールを取得
      const profile = await getProfile()
      
      if (profile) {
        // 既にバッジを持っているかチェック
        const currentBadges = profile.badges || []
        if (currentBadges.includes(badgeName)) {
          console.log('既にバッジを持っています:', badgeName)
          return [profile]
        }
        
        // 新しいバッジを追加
        const updatedBadges = [...currentBadges, badgeName]
        
        const { data, error } = await supabase
          .from('profiles')
          .update({ 
            badges: updatedBadges,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id)
          .select()
        
        if (error) throw error
        return data
      }
    }
  } catch (error) {
    console.error('バッジ追加エラー:', error)
    throw error
  }
}

// バッジ削除
export const removeBadge = async (badgeName) => {
  try {
    const user = await getCurrentUser()
    
    if (user) {
      const profile = await getProfile()
      
      if (profile) {
        const updatedBadges = (profile.badges || []).filter(badge => badge !== badgeName)
        
        const { data, error } = await supabase
          .from('profiles')
          .update({ 
            badges: updatedBadges,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id)
          .select()
        
        if (error) throw error
        return data
      }
    }
  } catch (error) {
    console.error('バッジ削除エラー:', error)
    throw error
  }
}

// セッション状態の監視
export const onAuthStateChange = (callback) => {
  return supabase.auth.onAuthStateChange(callback)
}
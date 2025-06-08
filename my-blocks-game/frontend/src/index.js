// index.js - メインアプリケーション
// index.js - メインアプリケーション
import { signIn, signUp, signOut, getProfile, updateExperience, addBadge } from './lib/profile.js'
import { GameEngine } from './lib/main.js'

// 以下はそのまま

// ログイン・プロフィール管理
class GameLoginManager {
  constructor() {
    this.currentProfile = null
    this.gameEngine = new GameEngine()
    this.setupEventListeners()
    this.initializeGame()
  }

  // ゲーム初期化
  initializeGame() {
    // ゲームエンジンを初期化
    setTimeout(() => {
      this.gameEngine.initialize()
    }, 100)
  }

  setupEventListeners() {
    // ログインボタン
    document.getElementById('loginButton').addEventListener('click', () => {
      this.handleLogin()
    })

    // 新規登録ボタン
    document.getElementById('signupButton').addEventListener('click', () => {
      this.handleSignup()
    })

    // ログアウトボタン
    document.getElementById('logoutButton').addEventListener('click', () => {
      this.handleLogout()
    })

    // プロフィール表示切り替え
    document.getElementById('profileToggle').addEventListener('click', () => {
      this.toggleProfile()
    })

    // フォーム切り替え
    document.getElementById('showSignupForm').addEventListener('click', () => {
      this.showSignupForm()
    })

    document.getElementById('showLoginForm').addEventListener('click', () => {
      this.showLoginForm()
    })

    // エンターキーでログイン
    document.getElementById('loginPassword').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.handleLogin()
      }
    })

    document.getElementById('signupPassword').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.handleSignup()
      }
    })
  }

  showSignupForm() {
    document.getElementById('loginForm').classList.remove('active')
    document.getElementById('signupForm').classList.add('active')
    this.clearMessages()
  }

  showLoginForm() {
    document.getElementById('signupForm').classList.remove('active')
    document.getElementById('loginForm').classList.add('active')
    this.clearMessages()
  }

  async handleLogin() {
    const email = document.getElementById('loginEmail').value
    const password = document.getElementById('loginPassword').value
    const button = document.getElementById('loginButton')

    if (!email || !password) {
      this.showError('メールアドレスとパスワードを入力してください')
      return
    }

    try {
      // ローディング表示
      button.disabled = true
      button.innerHTML = 'ログイン中... <div class="loading"></div>'

      // 実際のSupabase認証
      const user = await signIn(email, password)
      console.log('ログイン成功:', user)

      // プロフィール取得
      this.currentProfile = await getProfile()
      console.log('プロフィール取得:', this.currentProfile)

      this.showGameScreen()
      this.clearMessages()

    } catch (error) {
      console.error('ログインエラー:', error)
      this.showError('ログインに失敗しました: ' + error.message)
    } finally {
      button.disabled = false
      button.innerHTML = 'ログイン'
    }
  }

  async handleSignup() {
    const username = document.getElementById('signupUsername').value
    const name = document.getElementById('signupName').value
    const email = document.getElementById('signupEmail').value
    const password = document.getElementById('signupPassword').value
    const button = document.getElementById('signupButton')

    if (!username || !name || !email || !password) {
      this.showError('全ての項目を入力してください')
      return
    }

    if (password.length < 6) {
      this.showError('パスワードは6文字以上で入力してください')
      return
    }

    try {
      // ローディング表示
      button.disabled = true
      button.innerHTML = '登録中... <div class="loading"></div>'

      // 実際のSupabase新規登録
      const user = await signUp(email, password, username, name)
      console.log('新規登録成功:', user)

      this.showSuccess('登録が完了しました！メールを確認してアカウントを有効化してください。')
      
      // 少し待ってからログインフォームに切り替え
      setTimeout(() => {
        this.showLoginForm()
        document.getElementById('loginEmail').value = email
      }, 2000)

    } catch (error) {
      console.error('新規登録エラー:', error)
      this.showError('新規登録に失敗しました: ' + error.message)
    } finally {
      button.disabled = false
      button.innerHTML = '新規登録'
    }
  }

  async handleLogout() {
    try {
      await signOut()
      this.currentProfile = null
      document.getElementById('loginScreen').style.display = 'flex'
      document.getElementById('gameScreen').style.display = 'none'
      
      // フォームをクリア
      document.getElementById('loginEmail').value = ''
      document.getElementById('loginPassword').value = ''
      document.getElementById('signupUsername').value = ''
      document.getElementById('signupName').value = ''
      document.getElementById('signupEmail').value = ''
      document.getElementById('signupPassword').value = ''
      
      this.showLoginForm()
      this.clearMessages()
      
    } catch (error) {
      console.error('ログアウトエラー:', error)
    }
  }

  showGameScreen() {
    document.getElementById('loginScreen').style.display = 'none'
    document.getElementById('gameScreen').style.display = 'block'
    this.updateProfileDisplay()
    
    // ゲーム画面表示後にキャンバスを再初期化
    setTimeout(() => {
      this.gameEngine.initialize()
    }, 100)
  }

  showError(message) {
    const errorDiv = document.getElementById('authError')
    const successDiv = document.getElementById('authSuccess')
    successDiv.style.display = 'none'
    errorDiv.textContent = message
    errorDiv.style.display = 'block'
  }

  showSuccess(message) {
    const errorDiv = document.getElementById('authError')
    const successDiv = document.getElementById('authSuccess')
    errorDiv.style.display = 'none'
    successDiv.textContent = message
    successDiv.style.display = 'block'
  }

  clearMessages() {
    document.getElementById('authError').style.display = 'none'
    document.getElementById('authSuccess').style.display = 'none'
  }

  toggleProfile() {
    const content = document.getElementById('profileContent')
    const button = document.getElementById('profileToggle')
    
    if (content.classList.contains('visible')) {
      content.classList.remove('visible')
      button.textContent = '👤 プロフィール表示'
    } else {
      content.classList.add('visible')
      button.textContent = '👤 プロフィール非表示'
      this.updateProfileDisplay()
    }
  }

  updateProfileDisplay() {
    if (!this.currentProfile) return

    const currentLevel = Math.floor(this.currentProfile.experience_points / 100)
    const currentLevelExp = this.currentProfile.experience_points - (currentLevel * 100)
    const expToNext = 100 - currentLevelExp
    const expPercentage = (currentLevelExp / 100) * 100

    document.getElementById('profileName').textContent = this.currentProfile.name
    document.getElementById('profileLevel').textContent = `Lv.${currentLevel}`
    document.getElementById('profileExp').textContent = this.currentProfile.experience_points
    document.getElementById('profileTrophies').textContent = this.currentProfile.trophy_count
    document.getElementById('expToNext').textContent = `次のレベルまで: ${expToNext}`
    document.getElementById('expBar').style.width = `${expPercentage}%`

    // バッジ表示
    const badgesContainer = document.getElementById('profileBadges')
    badgesContainer.innerHTML = ''
    if (this.currentProfile.badges && this.currentProfile.badges.length > 0) {
      this.currentProfile.badges.forEach(badge => {
        const badgeElement = document.createElement('span')
        badgeElement.className = 'badge'
        badgeElement.textContent = badge
        badgesContainer.appendChild(badgeElement)
      })
    } else {
      badgesContainer.innerHTML = '<span style="color: #999; font-size: 12px;">まだバッジがありません</span>'
    }
  }

  // バトル勝利時の経験値追加
  async addExperience(points) {
    if (!this.currentProfile) return

    try {
      const oldLevel = Math.floor(this.currentProfile.experience_points / 100)
      const newExpPoints = this.currentProfile.experience_points + points
      
      // データベース更新
      const updatedProfile = await updateExperience(newExpPoints)
      
      if (updatedProfile && updatedProfile.length > 0) {
        this.currentProfile = updatedProfile[0]
        
        const newLevel = Math.floor(this.currentProfile.experience_points / 100)

        // レベルアップ処理
        if (newLevel > oldLevel) {
          await this.handleLevelUp(newLevel)
          this.showLevelUpEffect(newLevel)
        }

        this.updateProfileDisplay()
        return { levelUp: newLevel > oldLevel, newLevel, earnedExp: points }
      }
    } catch (error) {
      console.error('経験値更新エラー:', error)
    }
  }

  async handleLevelUp(newLevel) {
    try {
      // レベルアップバッジ
      const levelBadges = {
        5: 'レベル5達成',
        10: 'レベル10達成',
        20: 'レベル20達成',
        50: 'レベル50達成'
      }

      if (levelBadges[newLevel]) {
        const updatedProfile = await addBadge(levelBadges[newLevel])
        if (updatedProfile && updatedProfile.length > 0) {
          this.currentProfile = updatedProfile[0]
        }
      }
    } catch (error) {
      console.error('レベルアップバッジ追加エラー:', error)
    }
  }

  showLevelUpEffect(newLevel) {
    // レベルアップのポップアップ表示
    const popup = document.createElement('div')
    popup.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: linear-gradient(45deg, #FFD700, #FFA500);
      color: #333;
      padding: 30px;
      border-radius: 15px;
      font-size: 24px;
      font-weight: bold;
      text-align: center;
      z-index: 2000;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
      animation: levelUpPulse 2s ease-in-out;
    `;
    popup.innerHTML = `🎉<br>LEVEL UP!<br>Lv.${newLevel}`;

    // アニメーション CSS を追加
    const style = document.createElement('style');
    style.textContent = `
      @keyframes levelUpPulse {
        0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0; }
        50% { transform: translate(-50%, -50%) scale(1.1); opacity: 1; }
        100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
      }
    `;
    document.head.appendChild(style);

    document.body.appendChild(popup);

    setTimeout(() => {
      document.body.removeChild(popup);
      document.head.removeChild(style);
    }, 2000);
  }
}

// ゲーム初期化
window.gameLoginManager = new GameLoginManager();

// 既存のindex.jsから呼び出される関数（グローバルに公開）
window.addGameExperience = (points) => {
  return window.gameLoginManager.addExperience(points);
};

// ステージクリア時のバッジ追加関数も公開
window.addStageBadge = async (stageName) => {
  if (window.gameLoginManager.currentProfile) {
    try {
      const badgeName = `${stageName}初回クリア`;
      const updatedProfile = await addBadge(badgeName);
      if (updatedProfile && updatedProfile.length > 0) {
        window.gameLoginManager.currentProfile = updatedProfile[0];
        window.gameLoginManager.updateProfileDisplay();
      }
    } catch (error) {
      console.error('ステージバッジ追加エラー:', error);
    }
  }
};
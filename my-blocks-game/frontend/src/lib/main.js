// main.js - メインゲームロジック
import { GameDesign } from './basicDesign.js'

export class GameEngine {
  constructor() {
    this.gameDesign = new GameDesign()
    this.isRunning = false
    this.battleLog = []
    this.currentStage = 1
  }

  // ゲーム初期化
  initialize() {
    console.log('ゲームエンジン初期化開始')
    
    // キャンバス初期化
    if (!this.gameDesign.initCanvas()) {
      console.error('ゲーム初期化に失敗しました')
      return false
    }

    // 初期描画
    this.gameDesign.drawGame()
    
    // 実行ボタンのイベントリスナー設定
    this.setupRunButton()
    
    console.log('ゲームエンジン初期化完了')
    return true
  }

  // 実行ボタンの設定
  setupRunButton() {
    const runButton = document.getElementById('runButton')
    if (runButton) {
      runButton.addEventListener('click', () => {
        this.executeUserCode()
      })
    }
  }

  // ユーザーコード実行（Blocklyから生成されたコード）
  async executeUserCode() {
    if (this.isRunning) {
      console.log('既に実行中です')
      return
    }

    console.log('ユーザーコード実行開始')
    this.isRunning = true
    this.battleLog = []

    try {
      // 簡単なバトルシミュレーション
      await this.runBattleSimulation()
      
    } catch (error) {
      console.error('実行エラー:', error)
      this.logBattle('エラーが発生しました: ' + error.message)
    } finally {
      this.isRunning = false
    }
  }

  // バトルシミュレーション
  async runBattleSimulation() {
    this.logBattle('バトル開始！')
    
    let playerHP = 100
    let enemyHP = 50
    let turn = 1
    
    this.gameDesign.updateHP(playerHP, enemyHP)
    
    while (playerHP > 0 && enemyHP > 0 && turn <= 10) {
      this.logBattle(`--- ターン ${turn} ---`)
      
      // プレイヤーの攻撃
      await this.playerTurn(playerHP, enemyHP)
      enemyHP -= this.calculateDamage('player')
      enemyHP = Math.max(0, enemyHP)
      
      this.gameDesign.updateHP(playerHP, enemyHP)
      this.gameDesign.showAttackEffect(true)
      
      await this.sleep(1000)
      
      if (enemyHP <= 0) {
        this.logBattle('敵を倒しました！')
        this.gameDesign.showVictoryEffect()
        await this.handleVictory()
        break
      }
      
      // 敵の攻撃
      await this.enemyTurn(playerHP, enemyHP)
      playerHP -= this.calculateDamage('enemy')
      playerHP = Math.max(0, playerHP)
      
      this.gameDesign.updateHP(playerHP, enemyHP)
      this.gameDesign.showAttackEffect(false)
      
      await this.sleep(1000)
      
      if (playerHP <= 0) {
        this.logBattle('プレイヤーが倒されました...')
        this.gameDesign.showGameOverEffect()
        await this.handleGameOver()
        break
      }
      
      turn++
      await this.sleep(500)
    }
    
    if (turn > 10) {
      this.logBattle('制限ターンに達しました。引き分けです。')
    }
  }

  // プレイヤーターン
  async playerTurn(playerHP, enemyHP) {
    const actions = ['攻撃', 'スキル攻撃', '連続攻撃']
    const action = actions[Math.floor(Math.random() * actions.length)]
    
    this.logBattle(`プレイヤーは${action}を実行！`)
    
    // ここで実際のBlocklyコードが実行される予定
    await this.sleep(500)
  }

  // 敵ターン
  async enemyTurn(playerHP, enemyHP) {
    const actions = ['攻撃', '強撃', '防御']
    const action = actions[Math.floor(Math.random() * actions.length)]
    
    this.logBattle(`敵は${action}を実行！`)
    await this.sleep(500)
  }

  // ダメージ計算
  calculateDamage(attacker) {
    const baseDamage = attacker === 'player' ? 15 : 12
    const variation = Math.floor(Math.random() * 6) - 2 // -2〜+3のバリエーション
    return Math.max(1, baseDamage + variation)
  }

  // 勝利処理
  async handleVictory() {
    const expGained = 50 + (this.currentStage * 10)
    const scoreGained = 100 + (this.currentStage * 25)
    
    this.logBattle(`経験値 +${expGained}`)
    this.logBattle(`スコア +${scoreGained}`)
    
    // グローバル関数を呼び出して経験値を追加
    if (window.addGameExperience) {
      try {
        const result = await window.addGameExperience(expGained)
        if (result && result.levelUp) {
          this.logBattle(`レベルアップ！ Lv.${result.newLevel}`)
        }
      } catch (error) {
        console.error('経験値追加エラー:', error)
      }
    }
    
    // ステージクリアバッジ
    if (window.addStageBadge) {
      try {
        await window.addStageBadge(`ステージ${this.currentStage}`)
      } catch (error) {
        console.error('バッジ追加エラー:', error)
      }
    }
    
    this.currentStage++
    this.gameDesign.updateLevel(this.currentStage)
    this.gameDesign.updateScore(this.gameDesign.gameState.score + scoreGained)
  }

  // ゲームオーバー処理
  async handleGameOver() {
    this.logBattle('ゲームオーバー...')
    this.logBattle('リトライしてください！')
    
    // 少しの経験値は得られる
    const expGained = 10
    this.logBattle(`経験値 +${expGained}`)
    
    if (window.addGameExperience) {
      try {
        await window.addGameExperience(expGained)
      } catch (error) {
        console.error('経験値追加エラー:', error)
      }
    }
  }

  // バトルログ記録
  logBattle(message) {
    console.log(`[BATTLE] ${message}`)
    this.battleLog.push({
      timestamp: new Date().toLocaleTimeString(),
      message: message
    })
    
    // ログ表示エリアがあれば更新
    this.updateBattleLogDisplay()
  }

  // バトルログ表示更新
  updateBattleLogDisplay() {
    // 将来的にログ表示エリアを追加する場合
    const logElement = document.getElementById('battleLog')
    if (logElement) {
      const latestLogs = this.battleLog.slice(-5) // 最新5件のみ表示
      logElement.innerHTML = latestLogs
        .map(log => `<div class="log-entry">[${log.timestamp}] ${log.message}</div>`)
        .join('')
    }
  }

  // ゲームリセット
  resetGame() {
    this.currentStage = 1
    this.battleLog = []
    this.gameDesign.resetGame()
    this.logBattle('ゲームリセット完了')
  }

  // ユーティリティ: 待機
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // ゲーム状態取得
  getGameState() {
    return {
      ...this.gameDesign.gameState,
      currentStage: this.currentStage,
      isRunning: this.isRunning,
      battleLog: [...this.battleLog]
    }
  }

  // 特定のスキル実行（Blocklyから呼び出される予定）
  async executeSkill(skillName, target = 'enemy') {
    const skills = {
      'heal': {
        name: '回復',
        effect: () => {
          const healAmount = 20
          const newHP = Math.min(100, this.gameDesign.gameState.playerHP + healAmount)
          this.gameDesign.updateHP(newHP, this.gameDesign.gameState.enemyHP)
          this.logBattle(`${healAmount}HP回復しました！`)
          return healAmount
        }
      },
      'fireAttack': {
        name: '炎の攻撃',
        effect: () => {
          const damage = 25
          const newEnemyHP = Math.max(0, this.gameDesign.gameState.enemyHP - damage)
          this.gameDesign.updateHP(this.gameDesign.gameState.playerHP, newEnemyHP)
          this.gameDesign.showDamageEffect('enemy', damage)
          this.logBattle(`炎の攻撃で${damage}ダメージ！`)
          return damage
        }
      },
      'shield': {
        name: '防御',
        effect: () => {
          this.logBattle('防御態勢を取りました！次のダメージが半減されます。')
          return 0
        }
      }
    }
    
    const skill = skills[skillName]
    if (skill) {
      this.logBattle(`${skill.name}を実行！`)
      await this.sleep(300)
      return skill.effect()
    } else {
      this.logBattle(`不明なスキル: ${skillName}`)
      return 0
    }
  }
}
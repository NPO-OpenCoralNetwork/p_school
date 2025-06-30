// basicDesign.js - ゲーム基本デザイン・UI管理
export class GameDesign {
  constructor() {
    this.canvas = null
    this.ctx = null
    this.gameState = {
      playerHP: 100,
      enemyHP: 50,
      score: 0,
      level: 1
    }
  }

  // キャンバス初期化
  initCanvas() {
    this.canvas = document.getElementById('gameCanvas')
    this.ctx = this.canvas.getContext('2d')
    
    if (!this.canvas || !this.ctx) {
      console.error('キャンバスの取得に失敗しました')
      return false
    }
    
    // キャンバスのサイズ設定
    this.canvas.width = 800
    this.canvas.height = 600
    
    console.log('キャンバス初期化完了')
    return true
  }

  // ゲーム画面の描画
  drawGame() {
    if (!this.ctx) return

    // 背景をクリア
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    
    // 背景グラデーション
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height)
    gradient.addColorStop(0, '#87CEEB')
    gradient.addColorStop(1, '#98FB98')
    this.ctx.fillStyle = gradient
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

    // プレイヤーを描画
    this.drawPlayer()
    
    // 敵を描画
    this.drawEnemy()
    
    // UI要素を描画
    this.drawUI()
  }

  // プレイヤー描画
  drawPlayer() {
    this.ctx.save()
    
    // プレイヤーの位置
    const x = 100
    const y = this.canvas.height - 150
    
    // プレイヤー本体（青い四角）
    this.ctx.fillStyle = '#4169E1'
    this.ctx.fillRect(x, y, 60, 80)
    
    // プレイヤーの目
    this.ctx.fillStyle = '#FFFFFF'
    this.ctx.fillRect(x + 10, y + 15, 15, 15)
    this.ctx.fillRect(x + 35, y + 15, 15, 15)
    
    // 瞳
    this.ctx.fillStyle = '#000000'
    this.ctx.fillRect(x + 15, y + 20, 5, 5)
    this.ctx.fillRect(x + 40, y + 20, 5, 5)
    
    // 口
    this.ctx.fillStyle = '#000000'
    this.ctx.fillRect(x + 20, y + 45, 20, 5)
    
    this.ctx.restore()
  }

  // 敵描画
  drawEnemy() {
    this.ctx.save()
    
    // 敵の位置
    const x = this.canvas.width - 160
    const y = this.canvas.height - 150
    
    // 敵本体（赤い四角）
    this.ctx.fillStyle = '#DC143C'
    this.ctx.fillRect(x, y, 60, 80)
    
    // 敵の目（怒った表情）
    this.ctx.fillStyle = '#FFFFFF'
    this.ctx.fillRect(x + 10, y + 15, 15, 15)
    this.ctx.fillRect(x + 35, y + 15, 15, 15)
    
    // 瞳（怒り）
    this.ctx.fillStyle = '#FF0000'
    this.ctx.fillRect(x + 15, y + 20, 5, 5)
    this.ctx.fillRect(x + 40, y + 20, 5, 5)
    
    // 怒った口
    this.ctx.fillStyle = '#000000'
    this.ctx.fillRect(x + 15, y + 50, 30, 5)
    
    this.ctx.restore()
  }

  // UI描画
  drawUI() {
    this.ctx.save()
    
    // ゲーム情報表示
    this.ctx.fillStyle = '#333333'
    this.ctx.font = 'bold 20px Arial'
    this.ctx.fillText(`スコア: ${this.gameState.score}`, 20, 40)
    this.ctx.fillText(`レベル: ${this.gameState.level}`, 20, 70)
    
    // バトル中のメッセージ表示エリア
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
    this.ctx.fillRect(200, 50, 400, 100)
    this.ctx.strokeStyle = '#333333'
    this.ctx.lineWidth = 2
    this.ctx.strokeRect(200, 50, 400, 100)
    
    // メッセージテキスト
    this.ctx.fillStyle = '#333333'
    this.ctx.font = '16px Arial'
    this.ctx.textAlign = 'center'
    this.ctx.fillText('ブロックを組み合わせて戦闘プログラムを作成しよう！', 400, 85)
    this}}
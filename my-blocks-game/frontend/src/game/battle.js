import Phaser from 'phaser';

export class BattleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BattleScene' });
  }

  preload() {
    // バトル用アセットをロード
    this.load.image('battleBg', 'assets/images/battle_background.png');
    this.load.spritesheet('player', 'assets/images/player_sprite.png', { frameWidth: 64, frameHeight: 64 });
    this.load.spritesheet('enemy',  'assets/images/enemy_sprite.png',  { frameWidth: 64, frameHeight: 64 });
  }

  create() {
    // 背景
    this.add.image(400, 300, 'battleBg').setDisplaySize(800, 600);

    // プレイヤーと敵のスプライト
    this.playerSprite = this.add.sprite(200, 400, 'player', 0).setScale(2);
    this.enemySprite  = this.add.sprite(600, 200, 'enemy',  0).setScale(2);

    // HPバー表示
    this.playerHPText = this.add.text(50, 550, 'Player HP: 100', { font: '16px Arial', fill: '#fff' });
    this.enemyHPText  = this.add.text(650,  50,  'Enemy HP:  50',  { font: '16px Arial', fill: '#fff' });

    // コマンドログパネル（下部半透明）
    const panel = this.add.graphics();
    panel.fillStyle(0x000000, 0.5);
    panel.fillRect(0, 450, 800, 150);

    this.logLines = [];
  }

  addLog(message) {
    // 古いログは消去
    if (this.logLines.length >= 5) {
      this.logLines.forEach(t => t.destroy());
      this.logLines = [];
    }
    // 新しいログを追加
    const y = 455 + this.logLines.length *  Twenty; // 20px 行間
    const text = this.add.text(10, y, message, { font: '14px Arial', fill: '#fff' });
    this.logLines.push(text);
  }

  updateHP(playerHP, enemyHP) {
    this.playerHPText.setText(`Player HP: ${playerHP}`);
    this.enemyHPText.setText(`Enemy HP: ${enemyHP}`);
  }
}
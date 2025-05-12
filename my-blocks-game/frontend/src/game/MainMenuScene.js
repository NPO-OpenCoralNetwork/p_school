import Phaser from 'phaser';
import { BATTLE_STAGES } from './utils';

export class MainMenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainMenuScene' });
    this.particles = null;
    this.emitter = null;
  }

  preload() {
    // Load menu assets
    this.load.image('menuBg', 'assets/battle-background.png');
    this.load.image('buttonBg', 'assets/button.png');
    this.load.image('particle', 'assets/particle.png'); // 小さな光るパーティクル画像
    this.load.image('logo', 'assets/logo.png'); // タイトルロゴ画像（あれば）
    this.load.image('stageIcon', 'assets/stage-icon.png'); // ステージアイコン（あれば）
  }

  create() {
    // ブロックエディタを非表示に
    this.hideBlockEditor();
    
    // 背景エフェクト用レイヤー
    const bgEffects = this.add.graphics();
    
    // 背景のグラデーション効果（Phaserでのグラデーション実装）
    // 上部の濃い色
    bgEffects.fillStyle(0x051937, 1);
    bgEffects.fillRect(0, 0, 800, 300);
    
    // 下部の薄い色
    bgEffects.fillStyle(0x2c4270, 1);
    bgEffects.fillRect(0, 300, 800, 300);
    
    // グラデーション効果を出すための中間色の帯
    const steps = 20;
    const startColor = Phaser.Display.Color.ValueToColor(0x051937);
    const endColor = Phaser.Display.Color.ValueToColor(0x2c4270);
    
    for (let i = 0; i < steps; i++) {
      const fraction = i / steps;
      const color = Phaser.Display.Color.Interpolate.ColorWithColor(
        startColor, 
        endColor, 
        steps, 
        i
      );
      
      const colorInt = Phaser.Display.Color.GetColor(color.r, color.g, color.b);
      bgEffects.fillStyle(colorInt, 1);
      bgEffects.fillRect(0, 150 + i * 15, 800, 15);
    }
    
    // 背景画像をグラデーションの上に配置し、ブレンドモードで融合
    const bg = this.add.image(400, 300, 'menuBg')
      .setAlpha(0.3)
      .setBlendMode(Phaser.BlendModes.SCREEN);
    
    // パーティクルエフェクト - 背景に漂う光の粒子
    // パーティクル画像がなければエラーが発生するため、条件付きで作成
    try {
      this.particles = this.add.particles('particle');
      this.emitter = this.particles.createEmitter({
        x: { min: 0, max: 800 },
        y: { min: 0, max: 200 },
        scale: { start: 0.2, end: 0 },
        speed: { min: 20, max: 50 },
        angle: { min: 240, max: 300 },
        lifespan: { min: 4000, max: 6000 },
        blendMode: Phaser.BlendModes.ADD,
        frequency: 500,
        alpha: { start: 0.5, end: 0 }
      });
    } catch (e) {
      console.warn("パーティクル画像が見つかりません。パーティクルエフェクトは無効です。", e);
    }
    
    // 装飾的な光の線
    this.createLightLines();
    
    // タイトル用のコンテナ
    const titleContainer = this.add.container(400, 100);
    
    // タイトル背景グロー
    const titleGlow = this.add.graphics();
    titleGlow.fillStyle(0x4a6fff, 0.3);
    titleGlow.fillRoundedRect(-250, -40, 500, 80, 20);
    
    // タイトルテキスト
    const titleText = this.add.text(0, 0, 'ブロックバトルゲーム', {
      fontFamily: 'Verdana, "メイリオ", sans-serif',
      fontSize: '42px',
      fontStyle: 'bold',
      fill: '#ffffff',
      stroke: '#2f5ea3',
      strokeThickness: 6,
      shadow: { offsetX: 3, offsetY: 3, color: '#000', blur: 5, stroke: true, fill: true }
    }).setOrigin(0.5);
    
    // タイトルにアニメーションを適用
    this.tweens.add({
      targets: titleText,
      y: { from: -30, to: 0 },
      scale: { from: 0.8, to: 1 },
      ease: 'Back.easeOut',
      duration: 1000
    });
    
    // タイトルテキストに光るアニメーションを適用
    this.tweens.add({
      targets: titleText,
      alpha: { from: 0.7, to: 1 },
      yoyo: true,
      repeat: -1,
      duration: 2000,
      ease: 'Sine.easeInOut'
    });
    
    // タイトルコンテナに追加
    titleContainer.add([titleGlow, titleText]);
    
    // サブタイトル
    const subtitleText = this.add.text(400, 170, 'バトルシーンを選択してください', {
      fontFamily: 'Verdana, "メイリオ", sans-serif',
      fontSize: '24px',
      fill: '#a9d0ff',
      stroke: '#2a4a80',
      strokeThickness: 2,
      shadow: { offsetX: 1, offsetY: 1, color: '#000', blur: 3, fill: true }
    }).setOrigin(0.5);
    
    // サブタイトルをフェードイン
    subtitleText.setAlpha(0);
    this.tweens.add({
      targets: subtitleText,
      alpha: 1,
      delay: 500,
      duration: 800
    });
    
    // デコレーション要素
    this.createDecorations();
    
    // ステージボタンを作成
    this.createStageButtons();
  }

  createLightLines() {
    // 装飾的な光の線を描画
    const lines = this.add.graphics();
    lines.lineStyle(2, 0x4a6fff, 0.3);
    
    // 上部の装飾ライン
    lines.beginPath();
    lines.moveTo(0, 50);
    lines.lineTo(800, 50);
    lines.strokePath();
    
    // 下部の装飾ライン
    lines.beginPath();
    lines.moveTo(0, 550);
    lines.lineTo(800, 550);
    lines.strokePath();
    
    // 左右対称の輝く点を追加
    for (let i = 0; i < 5; i++) {
      const x1 = 150 + i * 100;
      const x2 = 650 - i * 100;
      
      const dot1 = this.add.graphics();
      dot1.fillStyle(0x4a6fff, 0.7);
      dot1.fillCircle(x1, 50, 3);
      
      const dot2 = this.add.graphics();
      dot2.fillStyle(0x4a6fff, 0.7);
      dot2.fillCircle(x2, 50, 3);
      
      // 脈動アニメーション
      this.tweens.add({
        targets: [dot1, dot2],
        alpha: { from: 0.7, to: 1 },
        scale: { from: 1, to: 1.5 },
        yoyo: true,
        repeat: -1,
        duration: 1500 + i * 300,
        ease: 'Sine.easeInOut'
      });
    }
  }

  createDecorations() {
    // 左右に装飾的なグラフィック
    const leftDecor = this.add.graphics();
    leftDecor.fillStyle(0x4a6fff, 0.2);
    leftDecor.fillTriangle(0, 300, 120, 150, 120, 450);
    
    const rightDecor = this.add.graphics();
    rightDecor.fillStyle(0x4a6fff, 0.2);
    rightDecor.fillTriangle(800, 300, 680, 150, 680, 450);
  }

  createStageButtons() {
    // ステージボタン用のコンテナ
    const stageContainer = this.add.container(400, 350);
    stageContainer.setAlpha(0);
    
    // アニメーションでフェードイン
    this.tweens.add({
      targets: stageContainer,
      alpha: 1,
      y: 330,
      delay: 800,
      duration: 800,
      ease: 'Back.easeOut'
    });
    
    // 利用可能なステージを取得
    const stages = BATTLE_STAGES;
    
    // ステージの配置方法を改善（垂直間隔を減らす）
    const verticalSpacing = 70; // 垂直方向の間隔を80から70に減らす
    
    // ステージごとにモダンなボタンを作成
    stages.forEach((stage, index) => {
      // ステージが多い場合は複数列に配置
      let x = 0;
      let y = 0;
      
      if (stages.length <= 3) {
        // 3つ以下なら縦に並べる
        y = index * verticalSpacing - (((stages.length - 1) * verticalSpacing) / 2);
      } else {
        // 4つ以上なら2列に
        const column = Math.floor(index / 2);
        const row = index % 2;
        x = row === 0 ? -160 : 160;
        y = column * verticalSpacing - 35;
      }
      
      // ボタンの背景パネル
      const buttonBg = this.add.graphics();
      buttonBg.fillStyle(0x000000, 0.6);
      buttonBg.fillRoundedRect(x - 150, y - 30, 300, 60, 15);
      buttonBg.lineStyle(3, 0x4a6fff, 0.8);
      buttonBg.strokeRoundedRect(x - 150, y - 30, 300, 60, 15);
      
      // 内側の光る線
      const innerGlow = this.add.graphics();
      innerGlow.lineStyle(1, 0x7a9fff, 0.6);
      innerGlow.strokeRoundedRect(x - 145, y - 25, 290, 50, 12);
      
      // ボタンテキスト
      const buttonText = this.add.text(x, y, stage.name, {
        fontFamily: 'Verdana, "メイリオ", sans-serif',
        fontSize: '26px',
        fontStyle: 'bold',
        fill: '#ffffff',
        stroke: '#2a4a80',
        strokeThickness: 2,
        shadow: { offsetX: 1, offsetY: 1, color: '#000', blur: 2, fill: true }
      }).setOrigin(0.5);
      
      // 難易度表示
      const difficultyText = this.add.text(x + 100, y, stage.difficulty, {
        fontFamily: 'Verdana, "メイリオ", sans-serif',
        fontSize: '16px',
        fill: this.getDifficultyColor(stage.difficulty)
      }).setOrigin(0.5);
      
      // クリック可能な領域
      const hitArea = this.add.graphics();
      hitArea.fillStyle(0xffffff, 0);
      hitArea.fillRect(x - 150, y - 30, 300, 60);
      hitArea.setInteractive(new Phaser.Geom.Rectangle(x - 150, y - 30, 300, 60), Phaser.Geom.Rectangle.Contains);
      
      // ボタンの相互作用
      hitArea.on('pointerover', () => {
        buttonBg.clear();
        buttonBg.fillStyle(0x2a4a80, 0.8);
        buttonBg.fillRoundedRect(x - 150, y - 30, 300, 60, 15);
        buttonBg.lineStyle(3, 0x7a9fff, 1);
        buttonBg.strokeRoundedRect(x - 150, y - 30, 300, 60, 15);
        
        // ボタンテキストを明るくする
        buttonText.setTint(0xaaffff);
        
        // ボタン上にフローティングパーティクル
        this.createButtonParticles(x, y);
      });
      
      hitArea.on('pointerout', () => {
        buttonBg.clear();
        buttonBg.fillStyle(0x000000, 0.6);
        buttonBg.fillRoundedRect(x - 150, y - 30, 300, 60, 15);
        buttonBg.lineStyle(3, 0x4a6fff, 0.8);
        buttonBg.strokeRoundedRect(x - 150, y - 30, 300, 60, 15);
        
        // ボタンテキストの色をリセット
        buttonText.clearTint();
        
        // パーティクルエミッターを停止/削除
        if (this.buttonEmitter) {
          this.buttonEmitter.stop();
          this.buttonEmitter = null;
        }
      });
      
      hitArea.on('pointerdown', () => {
        // クリックエフェクト - フラッシュとカメラシェイク
        this.cameras.main.flash(200, 255, 255, 255, true);
        this.cameras.main.shake(150, 0.005);
        
        // 遅延してバトルシーンに遷移
        this.time.delayedCall(300, () => {
          this.startBattle(stage.key, stage.params);
        });
      });
      
      // コンテナに追加
      stageContainer.add([buttonBg, innerGlow, buttonText, difficultyText, hitArea]);
    });
  }

  createButtonParticles(x, y) {
    // パーティクル機能がない場合は何もしない
    if (!this.particles) return;
    
    // ボタン上のパーティクルエフェクト
    if (this.buttonEmitter) {
      this.buttonEmitter.stop();
    }
    
    try {
      this.buttonEmitter = this.particles.createEmitter({
        x: x,
        y: y,
        speed: { min: -20, max: 20 },
        scale: { start: 0.1, end: 0 },
        lifespan: 1000,
        blendMode: Phaser.BlendModes.ADD,
        frequency: 100,
        alpha: { start: 0.6, end: 0 }
      });
    } catch (e) {
      console.warn("パーティクルエフェクトを作成できません", e);
    }
  }
  
  // 難易度に応じた色を返すメソッドを追加
  getDifficultyColor(difficulty) {
    switch(difficulty.toLowerCase()) {
      case 'easy':
        return '#4afa5e'; // 緑色 - 簡単
      case 'normal':
        return '#fae94a'; // 黄色 - 普通
      case 'hard':
        return '#fa4a4a'; // 赤色 - 難しい
      case 'expert':
        return '#ff00ff'; // マゼンタ - 専門家向け
      default:
        return '#ffffff'; // 白色 - 未定義
    }
  }
  
  startBattle(sceneKey, params) {
    console.log(`Starting battle: ${sceneKey}`, params);
    this.scene.start(sceneKey, params);
  }

  hideBlockEditor() {
    // ブロックエディタを非表示
    const blocklyDiv = document.getElementById('blocklyDiv');
    if (blocklyDiv) {
      blocklyDiv.style.display = 'none';
    }
    
    // 実行ボタンも非表示に
    const runButton = document.getElementById('runButton');
    if (runButton) {
      runButton.style.display = 'none';
    }
    
    // HPバーを非表示に
    const playerHP = document.getElementById('playerHP');
    const enemyHP = document.getElementById('enemyHP');
    if (playerHP) playerHP.style.display = 'none';
    if (enemyHP) enemyHP.style.display = 'none'; // playerHPではなくenemyHPを参照するように修正

    // HPコンテナも非表示に
    const hpContainer = document.getElementById('hpContainer');
    if (hpContainer) {
      hpContainer.style.display = 'none';
    }
  }
}
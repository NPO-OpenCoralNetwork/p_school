import Phaser from 'phaser';
import { Player } from "./player";
import { Enemy } from "./enemy";
import { UI } from "./ui";

export class BattleScene extends Phaser.Scene {
  constructor(config) {
    // 継承クラスからconfigが渡された場合はそれを使用し、なければデフォルトのkeyを設定
    const sceneConfig = config || { key: 'BattleScene' };
    super(sceneConfig);
    
    // 設定の初期値
    this.settings = {
      background: 'forest',
      enemy: 'goblin',
      scratchMode: false
    };
    
    // ゲーム変数の初期化
    this.player = null;
    this.enemy = null;
    this.ui = null;
  }

  init(data) {
    // データがあれば設定を更新
    this.settings = { ...this.settings, ...data };
    console.log('Battle initialized with settings:', this.settings);
  }

  preload() {
    // バトル用アセットをロード
    this.load.image('battleBg', 'assets/battle-background.png');
    this.load.image('player', 'assets/player.png');
    this.load.image('enemy', 'assets/enemy.png');
    
    // UI要素
    this.load.image('buttonBg', 'assets/button.png');
    this.load.image('hpBarFrame', 'assets/hp-bar-frame.png'); // HPバーのフレーム画像
    this.load.image('panelBg', 'assets/panel-bg.png'); // パネル背景
    
    // 魔法の書の画像をロード
    this.load.image('spellbook', 'assets/spellbook.png');
    
    // モダンなWebフォントの読み込み (Google Fontsなど外部フォントがある場合)
    // 注意: Google Fontsを使う場合はindex.htmlにフォントのリンクを追加する必要があります
    // このコードは、フォントがすでにロードされている前提です
  }

  create() {
    // ブロックエディタを表示
    this.showBlockEditor();
    
    // 背景
    this.add.image(400, 300, 'battleBg').setDisplaySize(800, 600);

    // プレイヤーと敵のスプライト
    this.playerSprite = this.add.sprite(200, 400, 'player').setScale(2);
    this.enemySprite = this.add.sprite(600, 200, 'enemy').setScale(2);
    
    // キャラクターに影をつける
    this.playerSprite.setAlpha(0.9);
    this.enemySprite.setAlpha(0.9);
    
    // プレイヤー名とレベル表示 - 位置を調整（キャラクターからより離す）
    // this.playerNameText = this.add.text(200, 320, 'PLAYER', { 
    //   fontFamily: 'Verdana, "メイリオ", sans-serif',
    //   fontSize: '24px', 
    //   fill: '#ffffff',
    //   stroke: '#000000',
    //   strokeThickness: 3,
    //   shadow: { offsetX: 2, offsetY: 2, color: '#000', blur: 2, stroke: true, fill: true }
    // }).setOrigin(0.5);
    
    // // 敵の名前表示 - 位置を調整（キャラクターからより離す）
    // const enemyName = this.settings.enemy.charAt(0).toUpperCase() + this.settings.enemy.slice(1);
    // this.enemyNameText = this.add.text(600, 90, enemyName, { 
    //   fontFamily: 'Verdana, "メイリオ", sans-serif',
    //   fontSize: '24px', 
    //   fill: '#ffffff',
    //   stroke: '#000000',
    //   strokeThickness: 3,
    //   shadow: { offsetX: 2, offsetY: 2, color: '#000', blur: 2, stroke: true, fill: true }
    // }).setOrigin(0.5);

    // HPバー表示用のスタイリッシュなコンテナを作成
    this.createHPBars();
    
    // コマンドログパネル（下部半透明、グラデーション効果付き）
    const logPanel = this.add.graphics();
    
    // グラデーション背景
    logPanel.fillStyle(0x000000, 0.7);
    logPanel.fillRect(0, 490, 800, 110);
    
    // パネル上部の装飾ライン
    logPanel.lineStyle(2, 0x4a6fff, 1);
    logPanel.lineBetween(0, 490, 800, 490);
    
    // UIとゲーム状態を初期化
    this.ui = new UI();
    
    // このテキストオブジェクトを UI のログエリアとして割り当てる
    this.ui.logArea = this.add.text(130, 505, '', { 
      fontFamily: 'Verdana, "メイリオ", sans-serif',
      fontSize: '16px', 
      fill: '#ffffff',
      wordWrap: { width: 580 },
      lineSpacing: 6,
      shadow: { offsetX: 1, offsetY: 1, color: '#000', blur: 3, fill: true }
    });
    
    // プレイヤーと敵を初期化
    this.player = new Player(this, this.ui);
    this.player.sprite = this.playerSprite;
    
    this.enemy = new Enemy(this, this.ui);
    this.enemy.sprite = this.enemySprite;
    
    // 魔法詠唱のヘルプテキストを表示
    this.addHelpText();
    
    // バトル開始のログメッセージ
    this.addLog(`バトルが始まりました！${this.settings.enemy}と対決します！`);
    
    // バトル開始演出
    this.cameras.main.flash(500, 255, 255, 255, true);
  }
  
  // HPバーを作成する新しいメソッド
  createHPBars() {
    // プレイヤーのHPバーコンテナ
    const playerHPContainer = this.add.graphics();
    playerHPContainer.fillStyle(0x000000, 0.7); // 背景
    playerHPContainer.fillRoundedRect(40, 440, 220, 30, 5);
    playerHPContainer.lineStyle(2, 0xffffff, 1);
    playerHPContainer.strokeRoundedRect(40, 440, 220, 30, 5);
    
    // プレイヤーHP表示
    this.playerHPText = this.add.text(50, 448, 'HP: 100/100', {
      fontFamily: 'Verdana, "メイリオ", sans-serif',
      fontSize: '16px',
      fill: '#ffffff',
      shadow: { offsetX: 1, offsetY: 1, color: '#000', blur: 1, fill: true }
    });
    
    // プレイヤーのHPバー（グラデーション効果）
    this.playerHPBar = this.add.graphics();
    this.drawPlayerHP(100); // 初期値100で描画
    
    // 敵のHPバーコンテナ
    const enemyHPContainer = this.add.graphics();
    enemyHPContainer.fillStyle(0x000000, 0.7); // 背景
    enemyHPContainer.fillRoundedRect(490, 100, 220, 30, 5);
    enemyHPContainer.lineStyle(2, 0xffffff, 1);
    enemyHPContainer.strokeRoundedRect(490, 100, 220, 30, 5);
    
    // 敵HP表示
    this.enemyHPText = this.add.text(500, 108, 'HP: 50/50', {
      fontFamily: 'Verdana, "メイリオ", sans-serif',
      fontSize: '16px',
      fill: '#ffffff',
      shadow: { offsetX: 1, offsetY: 1, color: '#000', blur: 1, fill: true }
    });
    
    // 敵のHPバー（グラデーション効果）
    this.enemyHPBar = this.add.graphics();
    this.drawEnemyHP(50); // 初期値50で描画
  }

  // プレイヤーのHPバーを描画（グラデーション効果付き）
  drawPlayerHP(hp) {
    const maxHP = 100;
    const percentage = Math.max(0, Math.min(1, hp / maxHP));
    const width = 200 * percentage;
    
    this.playerHPBar.clear();
    
    // グラデーションの色を決定（HPによって色が変化）
    let color1, color2;
    if (percentage > 0.6) {  // HP高
      color1 = 0x00ff00;  // 緑
      color2 = 0x99ff66;  // 薄い緑
    } else if (percentage > 0.3) {  // HP中
      color1 = 0xffcc00;  // オレンジ
      color2 = 0xffff66;  // 黄色
    } else {  // HP低
      color1 = 0xff0000;  // 赤
      color2 = 0xff6666;  // 薄い赤
    }
    
    // グラデーション風のHPバーを描画
    if (width > 0) {
      // メインのHPバー
      this.playerHPBar.fillStyle(color1, 1);
      this.playerHPBar.fillRoundedRect(50, 445, width, 20, 3);
      
      // 上部の光沢エフェクト
      this.playerHPBar.fillStyle(color2, 0.7);
      this.playerHPBar.fillRoundedRect(50, 445, width, 10, 3);
    }
  }
  
  // 敵のHPバーを描画（グラデーション効果付き）
  drawEnemyHP(hp) {
    const maxHP = 50;
    const percentage = Math.max(0, Math.min(1, hp / maxHP));
    const width = 200 * percentage;
    
    this.enemyHPBar.clear();
    
    // グラデーションの色を決定（HPによって色が変化）
    let color1, color2;
    if (percentage > 0.6) {  // HP高
      color1 = 0xff0000;  // 敵は赤をベースに
      color2 = 0xff6666;  // 薄い赤
    } else if (percentage > 0.3) {  // HP中
      color1 = 0xcc3300;  // 暗い赤
      color2 = 0xff9966;  // 薄いオレンジ
    } else {  // HP低
      color1 = 0x990000;  // 暗い赤
      color2 = 0xcc6666;  // くすんだ赤
    }
    
    // グラデーション風のHPバーを描画
    if (width > 0) {
      // メインのHPバー
      this.enemyHPBar.fillStyle(color1, 1);
      this.enemyHPBar.fillRoundedRect(500, 105, width, 20, 3);
      
      // 上部の光沢エフェクト
      this.enemyHPBar.fillStyle(color2, 0.7);
      this.enemyHPBar.fillRoundedRect(500, 105, width, 10, 3);
    }
  }
  
  // HPバー更新
  updateHP(playerHP, enemyHP) {
    // テキスト更新
    this.playerHPText.setText(`HP: ${playerHP}/100`);
    this.enemyHPText.setText(`HP: ${enemyHP}/50`);
    
    // HPバー更新
    this.drawPlayerHP(playerHP);
    this.drawEnemyHP(enemyHP);
    
    // HTML要素も更新
    const playerHPElement = document.getElementById('playerHP');
    const enemyHPElement = document.getElementById('enemyHP');
    
    if (playerHPElement) playerHPElement.textContent = `Player: ${playerHP}`;
    if (enemyHPElement) playerHPElement.textContent = `Enemy: ${enemyHP}`;
    
    // HPが低くなったら点滅エフェクト
    if (playerHP < 30) {
      this.playerHPText.setTint(0xff0000);
      this.tweens.add({
        targets: this.playerHPText,
        alpha: { from: 1, to: 0.5 },
        duration: 500,
        yoyo: true,
        repeat: -1
      });
    } else {
      this.playerHPText.clearTint();
      this.playerHPText.alpha = 1;
      this.tweens.killTweensOf(this.playerHPText);
    }
    
    if (enemyHP < 15) {
      this.enemyHPText.setTint(0xff0000);
      this.tweens.add({
        targets: this.enemyHPText,
        alpha: { from: 1, to: 0.5 },
        duration: 500,
        yoyo: true,
        repeat: -1
      });
    } else {
      this.enemyHPText.clearTint();
      this.enemyHPText.alpha = 1;
      this.tweens.killTweensOf(this.enemyHPText);
    }
  }

  addHelpText() {
    // 魔法の書をゲーム画面右上に配置
    const spellbook = this.add.image(750, 50, 'spellbook')
      .setScale(0.5)
      .setInteractive()
      .setOrigin(0.5);
    
    // 光るエフェクトを追加
    const glowFx = this.add.graphics();
    glowFx.fillStyle(0xffcc00, 0.3);
    glowFx.fillCircle(spellbook.x, spellbook.y, 30);
    
    // 輝くアニメーション
    this.tweens.add({
      targets: glowFx,
      alpha: { from: 0.3, to: 0.7 },
      scale: { from: 0.8, to: 1.2 },
      duration: 1500,
      yoyo: true,
      repeat: -1
    });
    
    // 魔法の書をクリック可能に設定
    spellbook.on('pointerdown', () => {
      this.showSpellPopup();
    });
    
    // マウスホバー時の効果
    spellbook.on('pointerover', () => {
      spellbook.setTint(0xffff99);  // 明るい黄色でハイライト
      
      // モダンなツールチップ
      const tooltip = this.add.container(spellbook.x, spellbook.y + 40);
      
      const bg = this.add.graphics();
      bg.fillStyle(0x333333, 0.9);
      bg.fillRoundedRect(-50, -15, 100, 30, 8);
      bg.lineStyle(2, 0xffcc00, 1);
      bg.strokeRoundedRect(-50, -15, 100, 30, 8);
      
      const text = this.add.text(0, 0, '魔法の書', { 
        fontFamily: 'Verdana, "メイリオ", sans-serif',
        fontSize: '14px', 
        fill: '#ffffff',
      }).setOrigin(0.5);
      
      tooltip.add([bg, text]);
      tooltip.setName('bookTooltip');
      
      // ポップイン効果
      tooltip.setScale(0);
      this.tweens.add({
        targets: tooltip,
        scale: 1,
        duration: 200,
        ease: 'Back.easeOut'
      });
    });
    
    spellbook.on('pointerout', () => {
      spellbook.clearTint();
      // ツールチップを削除
      const tooltip = this.children.getByName('bookTooltip');
      if (tooltip) {
        this.tweens.add({
          targets: tooltip,
          scale: 0,
          duration: 100,
          ease: 'Back.easeIn',
          onComplete: () => tooltip.destroy()
        });
      }
    });
  }
  
  // 魔法詠唱のポップアップを表示
  showSpellPopup() {
    // すでにポップアップがある場合は削除
    if (this.spellPopup) {
      this.hideSpellPopup();
      return;
    }
    
    // カメラをフラッシュさせる演出
    this.cameras.main.flash(200, 255, 240, 180, true);
    
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;
    
    // コンテナ作成
    const container = this.add.container(centerX, centerY);
    container.setScale(0);
    
    // ポップアップの背景
    const popupBg = this.add.graphics();
    popupBg.fillStyle(0x111122, 0.85);
    popupBg.fillRoundedRect(-220, -170, 440, 340, 15);
    
    // 装飾的な枠線
    popupBg.lineStyle(3, 0x4a6fff, 1);
    popupBg.strokeRoundedRect(-220, -170, 440, 340, 15);
    
    // 内側の光る装飾
    popupBg.lineStyle(1, 0x7a9fff, 0.5);
    popupBg.strokeRoundedRect(-210, -160, 420, 320, 12);
    
    // タイトル背景
    const titleBg = this.add.graphics();
    titleBg.fillStyle(0x4a6fff, 0.6);
    titleBg.fillRoundedRect(-180, -155, 360, 50, 10);
    
    // タイトル
    const title = this.add.text(0, -130, '魔法詠唱パターン', {
      fontFamily: 'Verdana, "メイリオ", sans-serif',
      fontSize: '28px',
      fontStyle: 'bold',
      fill: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3,
      shadow: { offsetX: 2, offsetY: 2, color: '#000', blur: 3, fill: true }
    }).setOrigin(0.5);
    
    // 魔法アイコン
    const fireIcon = this.add.graphics();
    fireIcon.fillStyle(0xff3300, 0.8);
    fireIcon.fillCircle(-150, -60, 15);
    
    const iceIcon = this.add.graphics();
    iceIcon.fillStyle(0x00ffff, 0.8);
    iceIcon.fillRect(-165, 0, 30, 30);
    
    const thunderIcon = this.add.graphics();
    thunderIcon.lineStyle(3, 0xffff00, 0.8);
    thunderIcon.lineBetween(-165, 80, -135, 60);
    thunderIcon.lineBetween(-135, 60, -155, 70);
    thunderIcon.lineBetween(-155, 70, -135, 90);
    
    // 魔法の説明テキスト
    const fireText = this.add.text(-120, -60, '炎の魔法: 右手→右手→左手', {
      fontFamily: 'Verdana, "メイリオ", sans-serif',
      fontSize: '18px',
      fill: '#ff9966',
      shadow: { offsetX: 1, offsetY: 1, color: '#000', blur: 1, fill: true }
    }).setOrigin(0, 0.5);
    
    const iceText = this.add.text(-120, 0, '氷の魔法: 左手', {
      fontFamily: 'Verdana, "メイリオ", sans-serif',
      fontSize: '18px',
      fill: '#99ffff',
      shadow: { offsetX: 1, offsetY: 1, color: '#000', blur: 1, fill: true }
    }).setOrigin(0, 0.5);
    
    const thunderText = this.add.text(-120, 75, '雷の魔法: 右手→左手→右手→左手', {
      fontFamily: 'Verdana, "メイリオ", sans-serif',
      fontSize: '18px',
      fill: '#ffff99',
      shadow: { offsetX: 1, offsetY: 1, color: '#000', blur: 1, fill: true }
    }).setOrigin(0, 0.5);
    
    // ボタン背景
    const buttonBg = this.add.graphics();
    buttonBg.fillStyle(0x880000, 1);
    buttonBg.fillRoundedRect(-60, 130, 120, 40, 10);
    buttonBg.lineStyle(2, 0xff0000, 1);
    buttonBg.strokeRoundedRect(-60, 130, 120, 40, 10);
    
    // 閉じるボタン
    const closeButton = this.add.text(0, 150, '閉じる', {
      fontFamily: 'Verdana, "メイリオ", sans-serif',
      fontSize: '20px',
      fontStyle: 'bold',
      fill: '#ffffff'
    }).setOrigin(0.5).setInteractive();
    
    // 全ての要素をコンテナに追加
    container.add([popupBg, titleBg, title, fireIcon, iceIcon, thunderIcon, 
                  fireText, iceText, thunderText, buttonBg, closeButton]);
    
    // ポップアップを表示するアニメーション
    this.tweens.add({
      targets: container,
      scale: 1,
      duration: 300,
      ease: 'Back.easeOut'
    });
    
    // ボタンのイベント
    closeButton.on('pointerdown', () => {
      this.hideSpellPopup();
    });
    
    // ホバーエフェクト
    closeButton.on('pointerover', () => {
      buttonBg.clear();
      buttonBg.fillStyle(0xaa0000, 1);
      buttonBg.fillRoundedRect(-60, 130, 120, 40, 10);
      buttonBg.lineStyle(2, 0xff3333, 1);
      buttonBg.strokeRoundedRect(-60, 130, 120, 40, 10);
      closeButton.setScale(1.05);
    });
    
    closeButton.on('pointerout', () => {
      buttonBg.clear();
      buttonBg.fillStyle(0x880000, 1);
      buttonBg.fillRoundedRect(-60, 130, 120, 40, 10);
      buttonBg.lineStyle(2, 0xff0000, 1);
      buttonBg.strokeRoundedRect(-60, 130, 120, 40, 10);
      closeButton.setScale(1);
    });
    
    // 参照を保存
    this.spellPopup = {
      container: container,
      bg: popupBg,
      title: title,
      button: closeButton
    };
  }
  
  // ポップアップを閉じる
  hideSpellPopup() {
    if (this.spellPopup) {
      const container = this.spellPopup.container;
      
      // 閉じるアニメーション
      this.tweens.add({
        targets: container,
        scale: 0,
        duration: 200,
        ease: 'Back.easeIn',
        onComplete: () => {
          container.destroy();
          this.spellPopup = null;
        }
      });
    }
  }

  // バトルログ追加
  addLog(message) {
    // UIのログに追加 - UIクラスのlogAreaを使用
    if (this.ui && this.ui.logArea) {
      this.ui.log(message);
    }
  }

  // アニメーション再生
  async playAnimation(animationType) {
    console.log(`Playing animation: ${animationType}`);
    
    // アニメーションタイプに応じた処理
    switch(animationType) {
      case 'playerAttack':
        // プレイヤーの攻撃アニメーション - より現代的なアニメーション
        const originalX = this.playerSprite.x;
        
        // プレイヤーが素早く動く
        this.tweens.add({
          targets: this.playerSprite,
          x: originalX + 80,
          angle: 5, // 少し傾く
          duration: 150,
          ease: 'Power2',
          yoyo: true,
          repeat: 0,
          onComplete: () => {
            // 斬撃エフェクト
            const slash = this.add.graphics();
            slash.lineStyle(4, 0xffffff, 1);
            
            // 斬撃線を描画
            for (let i = 0; i < 3; i++) {
              const offset = i * 10;
              slash.beginPath();
              slash.moveTo(this.enemySprite.x - 40 + offset, this.enemySprite.y - 30 + offset);
              slash.lineTo(this.enemySprite.x + 30 + offset, this.enemySprite.y + 20 + offset);
              slash.strokePath();
            }
            
            // 斬撃のフェードアウト
            this.tweens.add({
              targets: slash,
              alpha: 0,
              duration: 200,
              onComplete: () => slash.destroy()
            });
            
            // 敵のダメージ演出
            this.enemySprite.setTint(0xff0000);
            this.tweens.add({
              targets: this.enemySprite,
              x: this.enemySprite.x + 10,
              duration: 50,
              yoyo: true,
              repeat: 1,
              onComplete: () => this.enemySprite.clearTint()
            });
          }
        });
        
        // アニメーションの完了を待機
        await new Promise(resolve => setTimeout(resolve, 500));
        break;
        
      case 'magic_fire':
        // 火の魔法エフェクト - 爆発的な炎の演出
        
        // カメラシェイク効果
        this.cameras.main.shake(150, 0.005);
        
        // 魔法の詠唱エフェクト（プレイヤー周り）
        const castFx = this.add.graphics();
        castFx.fillStyle(0xff3300, 0.4);
        castFx.fillCircle(this.playerSprite.x, this.playerSprite.y, 40);
        
        // 詠唱エフェクトのアニメーション
        this.tweens.add({
          targets: castFx,
          alpha: 0,
          scale: 1.5,
          duration: 300,
          onComplete: () => castFx.destroy()
        });

        // 敵に向かって飛んでいく火の弾
        const fireball = this.add.graphics();
        fireball.fillStyle(0xff3300, 0.8);
        fireball.fillCircle(0, 0, 15);
        
        // 内側の明るい部分
        fireball.fillStyle(0xffff00, 0.9);
        fireball.fillCircle(0, 0, 8);
        
        // 火の粒子を追加
        const particles = [];
        for (let i = 0; i < 5; i++) {
          const particle = this.add.graphics();
          particle.fillStyle(0xff5500, 0.6);
          particle.fillCircle(0, 0, 5);
          particles.push(particle);
        }

        // 火の弾の軌道アニメーション
        const path = new Phaser.Curves.Path(this.playerSprite.x, this.playerSprite.y);
        path.cubicBezierTo(
          this.enemySprite.x, this.enemySprite.y, 
          this.playerSprite.x, this.playerSprite.y - 150,
          (this.playerSprite.x + this.enemySprite.x) / 2, this.playerSprite.y - 100
        );
        
        // 火の弾を移動
        this.tweens.add({
          targets: fireball,
          x: this.enemySprite.x,
          y: this.enemySprite.y,
          duration: 600,
          onUpdate: (tween, target) => {
            const position = path.getPoint(tween.progress);
            fireball.x = position.x;
            fireball.y = position.y;
            
            // 粒子もランダムに動かす
            particles.forEach((p, i) => {
              p.x = position.x + Math.sin(tween.progress * 10 + i) * 10;
              p.y = position.y + Math.cos(tween.progress * 10 + i) * 10;
            });
          },
          onComplete: () => {
            // 爆発エフェクト
            fireball.destroy();
            particles.forEach(p => p.destroy());
            
            // 大きな爆発を描画
            const explosion = this.add.graphics();
            explosion.fillStyle(0xff3300, 0.8);
            explosion.fillCircle(this.enemySprite.x, this.enemySprite.y, 60);
            
            // 内側の白熱部分
            explosion.fillStyle(0xffcc00, 0.9);
            explosion.fillCircle(this.enemySprite.x, this.enemySprite.y, 40);
            
            explosion.fillStyle(0xffff00, 1);
            explosion.fillCircle(this.enemySprite.x, this.enemySprite.y, 20);
            
            // 爆発によるカメラシェイク
            this.cameras.main.shake(300, 0.01);
            
            // 爆発のフェードアウト
            this.tweens.add({
              targets: explosion,
              alpha: 0,
              scale: 1.5,
              duration: 500,
              onComplete: () => explosion.destroy()
            });
            
            // 敵のダメージ演出
            this.enemySprite.setTint(0xff3300);
            setTimeout(() => this.enemySprite.clearTint(), 400);
          }
        });
        
        await new Promise(resolve => setTimeout(resolve, 1100));
        break;
        
      case 'magic_ice':
        // 氷の魔法エフェクト - より結晶的なアイスエフェクト
        
        // 魔法の詠唱エフェクト（プレイヤー周り）
        const iceCastFx = this.add.graphics();
        iceCastFx.fillStyle(0x00ffff, 0.4);
        iceCastFx.fillCircle(this.playerSprite.x, this.playerSprite.y, 40);
        
        this.tweens.add({
          targets: iceCastFx,
          alpha: 0,
          scale: 1.5,
          duration: 300,
          onComplete: () => iceCastFx.destroy()
        });

        // 氷の結晶を複数作成
        const iceShards = [];
        for (let i = 0; i < 6; i++) {
          const shard = this.add.graphics();
          
          // 六角形の結晶を描く
          shard.fillStyle(0x00ffff, 0.8);
          shard.fillCircle(0, 0, 10);
          
          // 内側の明るい部分
          shard.fillStyle(0xaaffff, 0.9);
          shard.fillCircle(0, 0, 5);
          
          // 初期位置設定
          shard.x = this.playerSprite.x;
          shard.y = this.playerSprite.y;
          
          // 飛んでいく先の位置をランダムに少しずらす
          const targetX = this.enemySprite.x + (Math.random() * 60 - 30);
          const targetY = this.enemySprite.y + (Math.random() * 60 - 30);
          
          // アニメーション
          this.tweens.add({
            targets: shard,
            x: targetX,
            y: targetY,
            scale: 1.5,
            duration: 400 + i * 50,
            ease: 'Cubic.easeOut',
            onComplete: function() {
              // 結晶が消える
              this.tweens.add({
                targets: shard,
                alpha: 0,
                scale: 0.5,
                duration: 200,
                onComplete: () => shard.destroy()
              });
            }.bind(this)
          });
          
          iceShards.push(shard);
        }
        
        // 氷結エフェクト
        setTimeout(() => {
          const freezeEffect = this.add.graphics();
          
          // 氷の結晶のパターン
          freezeEffect.fillStyle(0x00ffff, 0.6);
          freezeEffect.fillRect(this.enemySprite.x - 40, this.enemySprite.y - 40, 80, 80);
          
          freezeEffect.lineStyle(2, 0xaaffff, 0.8);
          
          // 結晶パターンを描く
          for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const length = 50;
            freezeEffect.lineBetween(
              this.enemySprite.x, 
              this.enemySprite.y, 
              this.enemySprite.x + Math.cos(angle) * length,
              this.enemySprite.y + Math.sin(angle) * length
            );
          }
          
          // 敵を青く染める
          this.enemySprite.setTint(0x00ffff);
          
          // 氷結エフェクトのアニメーション
          this.tweens.add({
            targets: freezeEffect,
            alpha: { from: 0.8, to: 0 },
            duration: 800,
            onComplete: () => {
              freezeEffect.destroy();
              this.enemySprite.clearTint();
            }
          });
        }, 400);
        
        await new Promise(resolve => setTimeout(resolve, 1200));
        break;
        
      case 'magic_thunder':
        // 雷の魔法エフェクト - よりダイナミックな稲妻
        
        // 魔法の詠唱エフェクト（プレイヤー周り）
        const thunderCastFx = this.add.graphics();
        thunderCastFx.fillStyle(0xffff00, 0.4);
        thunderCastFx.fillCircle(this.playerSprite.x, this.playerSprite.y, 40);
        
        this.tweens.add({
          targets: thunderCastFx,
          alpha: 0,
          scale: 1.5,
          duration: 300,
          onComplete: () => thunderCastFx.destroy()
        });
        
        // 天候を暗く
        const darkOverlay = this.add.graphics();
        darkOverlay.fillStyle(0x000033, 0.5);
        darkOverlay.fillRect(0, 0, 800, 600);
        
        // 雲が集まる演出
        const cloud = this.add.graphics();
        cloud.fillStyle(0x444466, 0.7);
        cloud.fillRect(this.enemySprite.x - 100, 0, 200, 100);
        
        // 雲のアニメーション
        this.tweens.add({
          targets: cloud,
          y: 60,
          alpha: 0.9,
          duration: 400
        });
        
        // 複数の稲妻を描画
        setTimeout(() => {
          // 閃光
          this.cameras.main.flash(100, 255, 255, 180);
          
          // 大きな稲妻
          const mainLightning = this.add.graphics();
          mainLightning.lineStyle(8, 0xffffff, 1);
          mainLightning.beginPath();
          
          // ジグザグの稲妻を描画 - より複雑なパターン
          let x = this.enemySprite.x;
          let y = 100;
          const segments = 6;
          mainLightning.moveTo(x, y);
          
          for (let i = 1; i <= segments; i++) {
            const progress = i / segments;
            const xOffset = (Math.random() * 60 - 30) * (1 - progress); // 下に行くほど収束
            x = this.enemySprite.x + xOffset;
            y = 100 + (this.enemySprite.y - 100) * progress;
            mainLightning.lineTo(x, y);
          }
          
          mainLightning.strokePath();
          
          // 中心の輝く部分
          const coreLightning = this.add.graphics();
          coreLightning.lineStyle(4, 0xffff99, 0.8);
          coreLightning.lineBetween(
            this.enemySprite.x, 100,
            this.enemySprite.x, this.enemySprite.y
          );
          
          // 分岐する小さな稲妻
          const branches = [];
          for (let i = 0; i < 4; i++) {
            const branch = this.add.graphics();
            branch.lineStyle(3, 0xffffff, 0.7);
            
            const startY = 100 + Math.random() * (this.enemySprite.y - 150);
            const length = 30 + Math.random() * 60;
            const angle = (Math.random() * Math.PI / 2) + Math.PI / 4;
            
            branch.beginPath();
            branch.moveTo(this.enemySprite.x, startY);
            branch.lineTo(
              this.enemySprite.x + Math.cos(angle) * length,
              startY + Math.sin(angle) * length
            );
            branch.strokePath();
            
            branches.push(branch);
          }
          
          // 衝撃波エフェクト
          const shockwave = this.add.graphics();
          shockwave.lineStyle(2, 0xffff99, 0.8);
          shockwave.strokeCircle(this.enemySprite.x, this.enemySprite.y, 30);
          
          // 衝撃波を拡大
          this.tweens.add({
            targets: shockwave,
            scale: 2,
            alpha: 0,
            duration: 400,
            onComplete: () => shockwave.destroy()
          });
          
          // カメラシェイク
          this.cameras.main.shake(300, 0.02);
          
          // 敵のダメージ演出
          this.enemySprite.setTint(0xffff00);
          
          // 稲妻のフェードアウト
          setTimeout(() => {
            this.tweens.add({
              targets: [mainLightning, coreLightning, ...branches],
              alpha: 0,
              duration: 200,
              onComplete: () => {
                mainLightning.destroy();
                coreLightning.destroy();
                branches.forEach(b => b.destroy());
              }
            });
            
            this.enemySprite.clearTint();
          }, 200);
          
          // 暗さのフェードアウト
          this.tweens.add({
            targets: [darkOverlay, cloud],
            alpha: 0,
            duration: 500,
            onComplete: () => {
              darkOverlay.destroy();
              cloud.destroy();
            }
          });
        }, 500);
        
        await new Promise(resolve => setTimeout(resolve, 1300));
        break;
        
      default:
        console.log(`未知のアニメーションタイプ: ${animationType}`);
        await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    return true;
  }
  
  // 敵へのダメージ処理
  dealDamageToEnemy(damage) {
    if (this.enemy) {
      this.enemy.hp = Math.max(0, this.enemy.hp - damage);
      this.updateHP(this.player.hp, this.enemy.hp);
      
      // 敵のHPが0になったら戦闘終了
      if (this.enemy.hp <= 0) {
        this.addLog("敵を倒した！プレイヤーの勝利！");
        this.gameOver(true); // true = プレイヤー勝利
        return false;
      }
      return true;
    }
    return false;
  }
  
  // バトル中のプレイヤーのHPを回復するメソッド
  healPlayer(amount) {
    // 現在のHPを取得し、回復量を加算（最大HPを超えないように）
    const currentHP = this.player.getHP();
    const maxHP = 100; // プレイヤーの最大HP
    
    // 回復量に基づいた新しいHP値を計算（最大HPを超えないように）
    const newHP = Math.min(currentHP + amount, maxHP);
    this.player.setHP(newHP);
    
    // HPバーを更新
    this.updateHP(newHP, this.enemy.getHP());
    
    // 回復エフェクトを表示
    this.showHealEffect();
    
    // ログに回復メッセージを追加
    this.addLog(`プレイヤーのHPが ${amount} 回復した！`);
  }

  // 回復エフェクトを表示する
  showHealEffect() {
    // プレイヤースプライトの位置を取得
    const x = this.playerSprite.x;
    const y = this.playerSprite.y;
    
    // 回復エフェクト用のパーティクルエミッター作成
    const particles = this.add.particles('healParticle');
    
    // パーティクルの画像がない場合は、シェイプを代用
    if (!this.textures.exists('healParticle')) {
      this.make.graphics({ x: 0, y: 0, add: false })
        .fillStyle(0x00ff00, 1)  // 緑色
        .fillCircle(8, 8, 8)     // 半径8のサークル
        .generateTexture('healParticle', 16, 16);
    }
    
    // エミッター設定
    const emitter = particles.createEmitter({
      x: x,
      y: y,
      speed: { min: 50, max: 100 },
      scale: { start: 0.5, end: 0 },
      alpha: { start: 0.8, end: 0 },
      tint: [0x00ff00, 0x99ff66, 0x66ff99], // 緑色のバリエーション
      lifespan: 1000,
      blendMode: 'ADD',
      frequency: 50,
      rotate: { min: 0, max: 360 },
      angle: { min: 0, max: 360 },
      radial: true,
      gravityY: -50
    });
    
    // 光のオーラエフェクト
    const glowCircle = this.add.graphics();
    glowCircle.fillStyle(0x00ff00, 0.3);
    glowCircle.fillCircle(x, y, 50);
    
    // プレイヤーを一時的に緑色に着色
    this.playerSprite.setTint(0x99ff99);
    
    // キラキラ効果アニメーション
    this.tweens.add({
      targets: glowCircle,
      alpha: { from: 0.3, to: 0 },
      scale: { from: 1, to: 2 },
      duration: 800,
      ease: 'Sine.easeOut',
      onComplete: () => {
        glowCircle.destroy();
      }
    });
    
    // 回復テキストの表示
    const healText = this.add.text(x, y - 50, 'Heal!', {
      fontFamily: 'Verdana, "メイリオ", sans-serif',
      fontSize: '28px',
      fontStyle: 'bold',
      fill: '#00ff00',
      stroke: '#004400',
      strokeThickness: 4,
      shadow: { offsetX: 2, offsetY: 2, color: '#000', blur: 2, fill: true }
    }).setOrigin(0.5);
    
    // テキストアニメーション
    this.tweens.add({
      targets: healText,
      y: y - 100,
      alpha: { from: 1, to: 0 },
      duration: 1000,
      ease: 'Power2',
      onComplete: () => {
        healText.destroy();
      }
    });
    
    // 一定時間後にエフェクトを停止して色を元に戻す
    this.time.delayedCall(1000, () => {
      emitter.stop();
      this.playerSprite.clearTint();
      
      // 少し遅れてパーティクルを破棄（残りのパーティクルが消えるのを待つ）
      this.time.delayedCall(500, () => {
        particles.destroy();
      });
    });
  }

  // ゲームオーバー処理
  gameOver(isVictory) {
    // 勝利か敗北かに応じて結果を表示
    const resultText = isVictory ? "勝利！" : "敗北...";
    
    // 大きな結果テキストを画面中央に表示
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;
    
    const resultDisplay = this.add.text(centerX, centerY, resultText, {
      fontSize: '64px',
      fill: isVictory ? '#00ff00' : '#ff0000',
      stroke: '#000',
      strokeThickness: 6,
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    // テキストに拡大縮小アニメーションを適用
    this.tweens.add({
      targets: resultDisplay,
      scale: { from: 0.5, to: 1 },
      duration: 500,
      ease: 'Bounce.Out'
    });
    
    // リスタートボタンを表示
    const restartButton = this.add.text(centerX, centerY + 80, 'もう一度戦う', {
      fontSize: '32px',
      fill: '#ffffff',
      backgroundColor: '#333333',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    
    // リスタートボタンのイベントリスナー
    restartButton.on('pointerdown', () => {
      this.scene.restart();
    });
    
    // ホバー効果
    restartButton.on('pointerover', () => {
      restartButton.setStyle({ fill: '#ffff00' });
    });
    
    restartButton.on('pointerout', () => {
      restartButton.setStyle({ fill: '#ffffff' });
    });
    
    // 入力を無効化して戦闘終了状態にする
    const runButton = document.getElementById("runButton");
    if (runButton) {
      runButton.disabled = true;
      
      // 2秒後に入力を再度有効化
      setTimeout(() => {
        runButton.disabled = false;
      }, 2000);
    }
  }

  // ブロックエディタを表示
  showBlockEditor() {
    // ブロックエディタを表示
    const blocklyDiv = document.getElementById('blocklyDiv');
    if (blocklyDiv) {
      blocklyDiv.style.display = 'block';
    }
    
    // 実行ボタンを表示
    const runButton = document.getElementById('runButton');
    if (runButton) {
      runButton.style.display = 'block';
    }
    
    // HPバーを表示
    const playerHP = document.getElementById('playerHP');
    const enemyHP = document.getElementById('enemyHP');
    if (playerHP) playerHP.style.display = 'block';
    if (enemyHP) playerHP.style.display = 'block';
  }
}
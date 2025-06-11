import Phaser from "phaser";
import { Enemy } from "./enemy";
import { Player } from "./player";
import { UI } from "./ui";
import { BattleScene } from "./battle";

/**
 * ステージ5「時間との勝負」のバトルシーン
 * 
 * 敵: タイムイーター（HP: 30、一定時間後に強化）
 * 使用可能ブロック: 攻撃、回復、魔法詠唱（炎、氷）、待機
 * 目標: 敵が強化される前に集中攻撃で倒す
 * 学習内容: タイミング制御、待機ブロックの活用
 */
export class BattleScene5 extends BattleScene {
  constructor() {
    super({ key: "Stage5Battle" });
      // ベースクラスの設定を上書き
    this.settings = {
      background: 'clock_bg',
      enemy: 'timeeater',
      scratchMode: true,
      stageNumber: 5
    };
    
    // タイムイーターの強化までの時間（ミリ秒）
    this.powerUpTime = 20000; // 20秒後に強化
    this.powerUpTriggered = false;
    this.powerUpWarningShown = false;
    this.warningTime = 5000; // 強化5秒前に警告
    
    // 戦闘の状態
    this.battleStarted = false;
    this.battleEnded = false;
  }
  preload() {
    // 親クラスのpreloadを呼び出し（基本アセット）
    super.preload();
    
    // ステージ5固有のアセットを読み込む
    this.load.image("timeeater", "assets/images/timeeater.png");
    this.load.image("timeeater_powered", "assets/images/timeeater_powered.png");
    this.load.image("clock_bg", "assets/images/clock_bg.png");
    this.load.image("time_particle", "assets/images/time_particle.png");
    this.load.image("clock", "assets/images/clock.png");
    
    // サウンドエフェクト
    this.load.audio("tick", "assets/sounds/tick.mp3");
    this.load.audio("powerup", "assets/sounds/powerup.mp3");
    this.load.audio("warning", "assets/sounds/warning.mp3");
  }  create() {
    try {
      console.log("BattleScene5 create method starting");
      
      // 初期化フラグ
      this.battleInitialized = false;
      
      // シーンがアクティブであることを確認
      console.log("Setting scene state as active");
      this.scene.setActive(true);
      this.scene.setVisible(true);
      
      // 親クラスのcreateメソッドを呼び出し
      super.create();
      
      // scratchModeがtrueなので、ブロックエディターが表示されているか確認
      console.log("BattleScene5 scratchMode:", this.settings.scratchMode);
      if (this.settings.scratchMode) {
        console.log("Ensuring block editor is visible in BattleScene5");
        // 少し遅延してから確実にブロックエディターを表示
        this.time.delayedCall(100, () => {
          this.showBlockEditor();
        });
      }
      
      // ステージ5固有のセットアップ
      this.setupStage5();
      
      // シーン準備完了のログ
      console.log("BattleScene5 creation complete, ready for commands");
      
      // メッセージ要素があれば更新
      const messageElement = document.getElementById('message');
      if (messageElement) {
        messageElement.textContent = 'ステージ5「時間との勝負」の準備完了！';
      }
      
    } catch (error) {
      console.error("Critical error in BattleScene5.create():", error);
      
      // エラーメッセージを表示
      const messageElement = document.getElementById('message');
      if (messageElement) {
        messageElement.innerHTML = 'ゲームの初期化中にエラーが発生しました。<br><button onclick="location.reload()">ページを再読み込み</button>';
      }
    }
  }
    setupStage5() {
    console.log("Setting up Stage5Battle scene");
    
    // 初期化ステータスを設定（シーンが活性化されていることを示す）
    window.gameStatus = window.gameStatus || {};
    window.gameStatus.activeBattleScene = 'Stage5Battle';
    
    try {
      // 時計のスプライトを作成（強化時間を視覚的に表すため）
      this.clock = this.add.image(400, 100, "clock").setScale(0.6);    
      this.clockHand = this.add.graphics();
      this.updateClockHand(0);
      
      // タイムパーティクルエフェクトの作成
      this.timeEmitter = this.add.particles(this.enemySprite.x, this.enemySprite.y, {
        key: 'time_particle',
        speed: { min: 20, max: 50 },
        scale: { start: 0.4, end: 0 },
        alpha: { start: 0.6, end: 0 },
        lifespan: 1000,
        quantity: 1,
        frequency: 200,
        blendMode: 'ADD',
        emitting: false
      });
      
      // エネミー設定を上書き - より堅牢な実装
      console.log("Setting up enemy in BattleScene5");
      this.enemy = Enemy.withStats(30, 10); // タイムイーターの初期HP30、攻撃力10
      
      // 参照の設定
      this.enemy.sprite = this.enemySprite;
      this.enemy.scene = this;
      
      // UIの状態を詳細にデバッグ出力
      console.log("Current UI state:", {
        uiExists: !!this.ui,
        uiType: this.ui ? typeof this.ui : "undefined",
        hasLogMethod: this.ui && typeof this.ui.log === 'function',
        uiInstanceId: this.ui ? this.ui._instanceId : "none"
      });
      
      // UIオブジェクトが有効か詳細にチェック
      if (this.ui && typeof this.ui === 'object') {
        console.log("UI object exists, checking log method");
        if (typeof this.ui.log === 'function') {
          console.log("UI log method exists, setting UI to enemy");
          // setUIメソッドを使用
          const success = this.enemy.setUI(this.ui);
          console.log("UI setup success:", success);
        } else {
          console.warn("UI exists but log method is not available");
          // UIオブジェクトを作り直す
          this.ui = new UI();
          console.log("Created new UI object with ID:", this.ui._instanceId);
          this.enemy.setUI(this.ui);
        }
      } else {
        console.warn("Warning: UI not available when setting up enemy");
        // UIオブジェクトが存在しない場合は新しく作成
        this.ui = new UI();
        console.log("Created new UI object with ID:", this.ui._instanceId);
        this.enemy.setUI(this.ui);
      }
      
      // 初期化完了フラグを設定
      this.battleInitialized = true;
      
      // グローバルに初期化ステータスを公開（デバッグ用）
      window.battleScene5 = this;
      
    } catch (error) {
      console.error("Error in setupStage5:", error);
      // エラーが発生しても続行できるよう復旧措置
      this.battleInitialized = false;
    }
    
    // タイムイーターの見た目を適用
    this.enemySprite.setTexture("timeeater").setScale(1.5);
    
    // HPバーを更新（親クラスのメソッドを使用）
    this.updateHP(this.player.getHP(), this.enemy.getHP());
    
    // // ヘルプテキストを表示（ステージ固有の情報）
    // this.helpText = this.add.text(400, 450, "⚠️ 一定時間後、敵は強化されます！急いで攻撃してください！", {
    //   fontSize: '18px',
    //   fontFamily: 'Arial',
    //   color: '#ffffff',
    //   stroke: '#000000',
    //   strokeThickness: 4,
    //   shadow: { offsetX: 2, offsetY: 2, color: '#000', blur: 2, fill: true },
    //   align: 'center'
    // }).setOrigin(0.5);
    
    // // 「待機ブロック」の使い方を説明するヒントテキスト
    // const hintText = this.add.text(400, 500, "ヒント: 待機ブロックを使って、敵の攻撃を回避することもできます", {
    //   fontSize: '16px',
    //   fontFamily: 'Arial',
    //   color: '#ffff00',
    //   stroke: '#000000',
    //   strokeThickness: 3,
    //   shadow: { offsetX: 1, offsetY: 1, color: '#000', blur: 1, stroke: true, fill: true },
    //   align: 'center'
    // }).setOrigin(0.5);
    
    // // フラッシュアニメーションを追加（ヒントを目立たせる）
    // this.tweens.add({
    //   targets: hintText,
    //   alpha: 0.5,
    //   duration: 1000,
    //   ease: 'Power2',
    //   yoyo: true,
    //   repeat: -1
    // });

    // 戦闘開始時のカウントダウンタイマーを設定
    this.time.delayedCall(1000, () => {
      this.battleStarted = true;
      
      // 強化タイマーを開始
      this.powerUpTimer = this.time.delayedCall(this.powerUpTime, this.powerUpEnemy, [], this);
      
      // 警告タイマーを設定
      this.warningTimer = this.time.delayedCall(this.powerUpTime - this.warningTime, this.showPowerUpWarning, [], this);
      
      // 定期的に時計の針を更新
      this.clockUpdateTimer = this.time.addEvent({
        delay: 100, // 100ミリ秒ごとに更新
        callback: () => {
          const elapsed = this.powerUpTimer.getElapsed();
          const progress = elapsed / this.powerUpTime;
          this.updateClockHand(progress);
        },
        loop: true
      });
      
      // 時計の音を定期的に鳴らす（存在しない場合はスキップ）
      try {
        if (this.sound && this.cache.audio.exists('tick')) {
          this.tickSound = this.sound.add('tick');
        }
      } catch (e) {
        console.warn('tick sound not available:', e);
      }
      this.tickTimer = this.time.addEvent({
        delay: 1000, // 1秒ごと
        callback: () => {
          if (!this.battleEnded && this.tickSound && typeof this.tickSound.play === 'function') {
            try {
              this.tickSound.play({ volume: 0.3 });
            } catch(playError) {
              console.warn('Error playing tick sound:', playError);
            }
          }
        },
        loop: true
      });
    });

    // ポップアップヘルプ機能
    // use addHelpText (inherited from base) instead of undefined createHelpButton
    if (typeof this.addHelpText === 'function') {
      this.addHelpText();
    }
      // バトル開始メッセージを更新 - エラーハンドリング追加
    try {
      this.addLog(`ステージ5「時間との勝負」が始まりました！時間操作を持つ${this.settings.enemy}と対決します！`);
    } catch (error) {
      console.error("Error adding log in setupStage5:", error);
    }
  }

  updateClockHand(progress) {
    // 時計の針を更新（時間経過に応じて回転）
    this.clockHand.clear();
    this.clockHand.lineStyle(4, 0xff0000);
    this.clockHand.beginPath();
    this.clockHand.moveTo(this.clock.x, this.clock.y);
    
    // 針の角度を計算（0から2πまで）
    const angle = progress * Math.PI * 2 - Math.PI / 2;
    const length = 30;
    const x = this.clock.x + Math.cos(angle) * length;
    const y = this.clock.y + Math.sin(angle) * length;
    
    this.clockHand.lineTo(x, y);
    this.clockHand.closePath();
    this.clockHand.strokePath();
  }

  showPowerUpWarning() {
    if (this.battleEnded) return;
    
    this.powerUpWarningShown = true;
    
    // 警告テキストを表示
    const warningText = this.add.text(400, 200, "⚠️ 警告: 敵が強化されます！ ⚠️", {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ff0000',
      stroke: '#ffffff',
      strokeThickness: 4,
      shadow: { offsetX: 2, offsetY: 2, color: '#000', blur: 2, stroke: true, fill: true }
    }).setOrigin(0.5);
    
    // 警告音を鳴らす
    this.sound.play("warning", { volume: 0.5 });
    
    // テキストを点滅させる
    this.tweens.add({
      targets: warningText,
      alpha: 0,
      duration: 500,
      ease: 'Power2',
      yoyo: true,
      repeat: 5,
      onComplete: () => {
        warningText.destroy();
      }
    });
    
    // 時計を赤く点滅
    this.tweens.add({
      targets: this.clock,
      tint: 0xff0000,
      duration: 500,
      ease: 'Power2',
      yoyo: true,
      repeat: 5
    });
  }

  powerUpEnemy() {
    if (this.battleEnded) return;
    
    this.powerUpTriggered = true;
    
    // 強化エフェクトを表示
    this.enemySprite.setTexture("timeeater_powered");
    this.tweens.add({
      targets: this.enemySprite,
      scale: 1.8,
      duration: 1000,
      ease: 'Bounce.Out'
    });      // パーティクルエフェクトを強化
    this.timeEmitter.setPosition(this.enemySprite.x, this.enemySprite.y);
    // 最新APIでの設定更新方法
    this.timeEmitter.setQuantity(3);
    this.timeEmitter.setSpeed({ min: 50, max: 100 });
    this.timeEmitter.start();
    
    // 強化音を鳴らす
    this.sound.play("powerup", { volume: 0.7 });
    
    // 敵のステータスを強化
    this.enemy.setPower(this.enemy.getPower() * 2); // 攻撃力を2倍に
    
    // テキスト表示
    const powerUpText = this.add.text(this.enemySprite.x, this.enemySprite.y - 80, "パワーアップ！", {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#ff0000',
      stroke: '#ffffff',
      strokeThickness: 3
    }).setOrigin(0.5);
    
    this.tweens.add({
      targets: powerUpText,
      y: this.enemySprite.y - 120,
      alpha: 0,
      duration: 2000,
      ease: 'Power2',
      onComplete: () => {
        powerUpText.destroy();
      }
    });
      // 敵の攻撃頻度を上げる
    this.enemy.setAttackSpeed(1.5);
    
    // 強化のメッセージをログに表示
    this.addLog("⚠️ 敵が強化されました！防御を固めて反撃のチャンスを狙いましょう！");
  }

  update() {
    if (!this.battleStarted || this.battleEnded) return;
    
    // 敵の行動パターン
    if (this.powerUpTriggered) {
      // 強化後は攻撃パターンが変化
      // ここでは単純に敵の攻撃回数や頻度が増える処理を実装
    }
  }

  /**
   * プレイヤーの行動を処理する
   * @param {string} action - 行動の種類
   * @param {Object} parameters - 追加パラメータ
   */
  handlePlayerAction(action, parameters = {}) {
    if (this.battleEnded) return;
    
    switch (action) {
      case "Attack":
        // 通常攻撃処理
        this.playerAttack();
        break;
        
      case "Heal":
        // 回復処理
        this.playerHeal();
        break;
        
      case "CastSpell":
        // 魔法詠唱処理
        const { spell, success } = parameters;
        if (success) {
          this.playerCastSpell(spell);
        } else {
          this.addLog("魔法の詠唱に失敗しました");
        }
        break;
          case "Wait":
        // 待機処理（タイミング調整用）
        const avoided = this.playerWait();
        // 回避成功時は敵のターンをスキップ
        if (avoided) {
          return; // 敵のターン処理をスキップ
        }
        break;
        
      default:
        console.warn("Unknown player action:", action);
    }
    
    // 敵のターン（プレイヤーの行動後）
    if (!this.battleEnded) {
      // 敵の行動を少し遅延させる
      this.time.delayedCall(1000, () => {
        if (!this.battleEnded) {
          this.enemyAction();
        }
      });
    }
  }
  playerAttack() {
    console.log("BattleScene5.playerAttack called");
    
    // プレイヤーの攻撃アニメーション
    this.tweens.add({
      targets: this.playerSprite,
      x: this.playerSprite.x + 50,
      duration: 200,
      ease: 'Power1',
      yoyo: true,
      onComplete: () => {
        // 攻撃エフェクト (斬撃エフェクト)
        const slash = this.add.graphics();
        slash.lineStyle(4, 0xffffff, 1);
        slash.beginPath();
        const startX = this.playerSprite.x + 30;
        const startY = this.playerSprite.y - 20;
        slash.moveTo(startX, startY);
        slash.lineTo(startX + 70, startY + 40);
        slash.strokePath();
        
        // 斬撃光沢エフェクト
        slash.lineStyle(2, 0x88ccff, 0.8);
        slash.beginPath();
        slash.moveTo(startX + 5, startY + 5);
        slash.lineTo(startX + 75, startY + 45);
        slash.strokePath();
        
        // エフェクトのアニメーション
        this.tweens.add({
          targets: slash,
          alpha: 0,
          duration: 300,
          onComplete: () => slash.destroy()
        });
        
        // 音エフェクト（用意されていれば）
        if (this.sound.get('sword_swing')) {
          this.sound.play('sword_swing', { volume: 0.5 });
        }
      }
    });
    
    // ダメージ計算
    const damage = this.player.calculateDamage(this.enemy);
    this.enemy.takeDamage(damage);
    
    // バトルログにメッセージを追加
    this.addLog(`プレイヤーの攻撃！敵に ${damage} のダメージ！`);
    
    // ダメージテキスト
    this.showDamageText(damage, this.enemySprite.x, this.enemySprite.y - 50);
    
    // 敵のダメージアニメーション
    this.tweens.add({
      targets: this.enemySprite,
      alpha: 0.5,
      duration: 100,
      ease: 'Power1',
      yoyo: true,
      onComplete: () => {
        // 敵にダメージエフェクト（赤く点滅）
        this.enemySprite.setTint(0xff0000);
        this.time.delayedCall(100, () => {
          this.enemySprite.clearTint();
        });
      }
    });
      
    // HPバーを更新
    this.updateHP(this.player.getHP(), this.enemy.getHP());
    
    // 敵を倒したか確認
    this.checkBattleEnd();
  }  playerHeal() {
    console.log("BattleScene5.playerHeal called");
    
    // Fixed healing amount
    const healAmount = 15;
    
    // Heal player's HP
    this.player.setHP(Math.min(100, this.player.getHP() + healAmount));
    
    // Add message to battle log
    this.addLog(`回復魔法！HPが ${healAmount} 回復しました！`);
    
    // Healing effect
    try {
      // Create heal particles using Phaser 3.60 API
      this.add.particles(this.playerSprite.x, this.playerSprite.y, {
        key: 'particle',
        speed: { min: 20, max: 40 },
        scale: { start: 0.2, end: 0 },
        alpha: { start: 0.8, end: 0 },
        tint: 0x00ff00,
        lifespan: 1000,
        blendMode: 'ADD',
        frequency: 50,
        quantity: 20,
        duration: 800,
        emitting: true
      });
    } catch (error) {
      console.error("Error creating heal effect:", error);
    }
      
    // Show healing text
    this.showHealText(healAmount, this.playerSprite.x, this.playerSprite.y - 50);
  }
  
  // Player.heal()メソッドから呼び出されるメソッド
  async healPlayer(amount) {
    console.log(`Healing player for ${amount} HP`);
    const currentHP = this.player.getHP();
    const newHP = Math.min(100, currentHP + amount);
    
    // HP設定
    this.player.setHP(newHP);
    
    // バトルログにメッセージを追加
    this.addLog(`回復魔法！HPが ${amount} 回復しました！（${currentHP}→${newHP}）`);
    
    // 回復エフェクト
    try {
      const healGraphics = this.add.graphics();
      healGraphics.fillStyle(0x00ff00, 0.3);
      healGraphics.fillCircle(this.playerSprite.x, this.playerSprite.y, 40);
      
      this.tweens.add({
        targets: healGraphics,
        alpha: 0,
        scale: 2,
        duration: 800,
        onComplete: () => healGraphics.destroy()
      });
      
      // キラキラエフェクト追加
      for (let i = 0; i < 5; i++) {
        const sparkle = this.add.graphics();
        sparkle.fillStyle(0x33ff33, 0.8);
        sparkle.fillCircle(
          this.playerSprite.x + (Math.random() * 60 - 30),
          this.playerSprite.y + (Math.random() * 60 - 30),
          3);
          
        this.tweens.add({
          targets: sparkle,
          alpha: 0,
          scale: 2,
          duration: 600 + Math.random() * 400,
          onComplete: () => sparkle.destroy()
        });
      }
    } catch (error) {
      console.error("Error creating healPlayer effect:", error);
    }
    
    // 回復テキスト表示
    this.showHealText(amount, this.playerSprite.x, this.playerSprite.y - 50);
    
    // HPバーを更新
    this.updateHP(this.player.getHP(), this.enemy.getHP());
  }
  playerCastSpell(spell) {
    console.log(`BattleScene5.playerCastSpell called with spell: ${spell}`);
    let damage = 0;
    let particleColor = 0xffffff;
    
    switch (spell) {
      case "FIRE":
        // 炎魔法の効果
        damage = 20; // 固定ダメージ値
        particleColor = 0xff5500;
        
        // バトルログにメッセージを追加
        this.addLog(`炎の魔法！敵に ${damage} のダメージ！`);
        
        this.castFireSpell(damage);
        break;
        
      case "ICE":
        // 氷魔法の効果
        damage = 15; // 固定ダメージ値
        particleColor = 0x88ccff;
        
        // バトルログにメッセージを追加
        this.addLog(`氷の魔法！敵に ${damage} のダメージ！`);
        
        this.castIceSpell(damage);
        break;
        
      default:
        console.warn("Unknown spell type:", spell);
        return;
    }
      
    // 画面上へのテキスト表示
    const spellText = this.add.text(
      this.playerSprite.x, 
      this.playerSprite.y - 80, 
      `${spell}魔法!`, 
      {
        fontSize: '20px',
        fontFamily: 'Arial',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 3,
        shadow: { offsetX: 2, offsetY: 2, color: '#000', blur: 2, fill: true }
      }
    ).setOrigin(0.5);
    
    this.tweens.add({
      targets: spellText,
      y: spellText.y - 30,
      alpha: 0,
      duration: 1000,
      onComplete: () => spellText.destroy()
    });
    
    // ダメージを与え、戦闘終了をチェック
    this.enemy.takeDamage(damage);
    this.updateHP(this.player.getHP(), this.enemy.getHP());
    this.checkBattleEnd();
  }  castFireSpell(damage) {
    // Create fire particle effect using Phaser 3.60 API
    const fireParticles = this.add.particles(this.playerSprite.x + 20, this.playerSprite.y, {
      key: 'fire',
      speed: { min: 200, max: 300 },
      scale: { start: 0.6, end: 0 },
      alpha: { start: 0.6, end: 0 },
      lifespan: 800,
      blendMode: 'ADD',
      quantity: 30,
      emitting: true,
      deathCallback: (particle) => {
        // Emit additional particles at the enemy position for explosion effect
        if (particle.x >= this.enemySprite.x - 10) {
          fireParticles.emitParticle(30);
        }
      }
    });
    
    // Move particle emitter towards enemy
    this.tweens.add({
      targets: fireParticles,
      x: this.enemySprite.x,
      y: this.enemySprite.y,
      duration: 600,
      ease: 'Power2',
      onComplete: () => {
        // Show damage text
        this.showDamageText(damage, this.enemySprite.x, this.enemySprite.y - 50, 0xff5500);
        
        // Cleanup particles after effect
        this.time.delayedCall(800, () => {
          fireParticles.destroy();
        });
      }
    });
  }  castIceSpell(damage) {
    // Create ice particle effect using Phaser 3.60 API
    const iceParticles = this.add.particles(this.playerSprite.x + 20, this.playerSprite.y, {
      key: 'ice',
      speed: { min: 180, max: 250 },
      scale: { start: 0.5, end: 0 },
      alpha: { start: 0.7, end: 0 },
      lifespan: 1000,
      blendMode: 'ADD',
      quantity: 30,
      emitting: true,
      deathCallback: (particle) => {
        // Emit additional particles at the enemy position for freeze effect
        if (particle.x >= this.enemySprite.x - 10) {
          iceParticles.emitParticle(25);
        }
      }
    });
    
    // Move particles towards enemy
    this.tweens.add({
      targets: iceParticles,
      x: this.enemySprite.x,
      y: this.enemySprite.y,
      duration: 800,
      ease: 'Cubic.Out',
      onComplete: () => {
        // Freeze effect (temporarily tint enemy blue)
        this.tweens.add({
          targets: this.enemySprite,
          tint: 0x88ccff,
          duration: 1000,
          ease: 'Power1',
          yoyo: true,
          onComplete: () => {
            this.enemySprite.clearTint();
          }
        });
        
        // Show damage text
        this.showDamageText(damage, this.enemySprite.x, this.enemySprite.y - 50, 0x88ccff);
        
        // Cleanup particles after effect
        this.time.delayedCall(1000, () => {
          iceParticles.destroy();
        });
      }
    });
  }  playerWait() {
    // 待機アクション（タイミング調整用）
    const waitText = this.add.text(this.playerSprite.x, this.playerSprite.y - 50, "待機...", {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);
    
    // 待機テキストを徐々にフェードアウト
    this.tweens.add({
      targets: waitText,
      alpha: 0,
      y: this.playerSprite.y - 70,
      duration: 1000,
      ease: 'Power1',
      onComplete: () => {
        waitText.destroy();
      }
    });
    
    // プレイヤーが待機したことで、タイムイーターの攻撃を回避する可能性がある
    // 回避率の計算
    let avoidanceChance = 0.3; // 通常時の回避率30%
    
    if (this.powerUpTriggered) {
      // 敵が強化済みの場合は回避率アップ (50%)
      avoidanceChance = 0.5;
    }
    
    // 時間の経過に応じて回避率が変化するエフェクト
    const timeElapsed = this.powerUpTimer ? this.powerUpTimer.getElapsed() : 0;
    const timeRatio = timeElapsed / this.powerUpTime;
    
    // 強化直前の方が回避しやすい（タイミングが重要なことを示す）
    if (timeRatio > 0.7 && timeRatio < 1.0) {
      avoidanceChance += 0.2; // 強化直前は+20%回避率      // 特別なエフェクト（タイミング良く待機した場合）
      const perfectTimingParticles = this.add.particles(this.playerSprite.x, this.playerSprite.y, {
        key: 'time_particle',
        speed: { min: 10, max: 30 },
        scale: { start: 0.2, end: 0 },
        alpha: { start: 1, end: 0 },
        tint: 0xffff00,
        lifespan: 1000,
        blendMode: 'ADD',
        quantity: 20,        duration: 1000,
        emitting: true
      });
      
      // Phaser 3.60の新しいAPI使用
      perfectTimingParticles.explode(20, this.playerSprite.x, this.playerSprite.y);
      
      // エフェクト終了後にパーティクルシステムを破棄
      this.time.delayedCall(1000, () => {
        perfectTimingParticles.destroy();
      });
    }
    
    // 回避判定
    if (Math.random() < avoidanceChance) {
      // 回避メッセージ
      this.addLog("敵の攻撃を回避した！");
      
      // 回避エフェクト
      this.tweens.add({
        targets: this.playerSprite,
        x: this.playerSprite.x - 30,
        yoyo: true,
        duration: 300,
        ease: 'Sine.easeInOut'
      });
      
      // 回避したので、敵のターンはスキップ
      return true;
    } else {
      this.addLog("回避に失敗した...");
      return false;
    }
  }
  enemyAction() {
    if (this.battleEnded) return;
    
    // 敵が適切に初期化されているか確認
    if (!this.enemy) {
      console.error("Enemy is not initialized in enemyAction");
      return;
    }
    
    // 敵の攻撃処理
    let damage;
    
    try {
      if (this.powerUpTriggered) {
        // 強化後は攻撃力アップ
        damage = this.enemy.calculateDamage(this.player);
        
        // 強化後は特殊攻撃を使用する確率が上がる
        if (Math.random() < 0.3) {
          this.enemySpecialAttack();
          return;
        }
      } else {
        // 通常攻撃
        damage = this.enemy.calculateDamage(this.player);
      }
    } catch (error) {
      console.error("Error in enemy attack calculation:", error);
      damage = 5; // エラー時のデフォルトダメージ
    }
    
    // 攻撃アニメーション
    this.tweens.add({
      targets: this.enemySprite,
      x: this.enemySprite.x - 50,
      duration: 200,
      ease: 'Power1',
      yoyo: true
    });
    
    // プレイヤーにダメージを与える
    this.player.takeDamage(damage);
    
    // ダメージテキスト
    this.showDamageText(damage, this.playerSprite.x, this.playerSprite.y - 50);
      // プレイヤーのダメージアニメーション
    this.tweens.add({
      targets: this.playerSprite,
      alpha: 0.5,
      duration: 100,
      ease: 'Power1',
      yoyo: true
    });
    
    // HPバーを更新
    this.updateHP(this.player.getHP(), this.enemy.getHP());
      // プレイヤーが倒れたか確認
    if (this.player.getHP() <= 0) {
      this.battleEnded = true;
      this.addLog("あなたは敗北しました...");
      
      // 親クラスのゲームオーバー処理を呼び出し
      this.gameOver(false);
    }
  }

  enemySpecialAttack() {
    // 特殊攻撃「時間歪曲」
    const specialAttackName = "時間歪曲";
    
    this.addLog(`敵の特殊攻撃: ${specialAttackName}！`);
      // 特殊攻撃のエフェクト（時間が歪むビジュアル）
    // 画面全体を歪ませる
    const cameraShake = this.cameras.main.shake(500, 0.01);
    
    // 時間パーティクル爆発 - Phaser 3.60の新しいAPI使用
    this.timeEmitter.explode(50, this.enemySprite.x, this.enemySprite.y);
    
    // 特殊攻撃のダメージ計算（通常より高め）
    const damage = Math.floor(this.enemy.getPower() * 1.5);
    
    // ダメージ適用
    this.player.takeDamage(damage);
    
    // ディレイをかけてダメージテキスト表示
    this.time.delayedCall(500, () => {
      this.showDamageText(damage, this.playerSprite.x, this.playerSprite.y - 50, 0xaa55ff);
      
      // HPバーを更新
      this.updateHP(this.player.getHP(), this.enemy.getHP());
      
      // プレイヤーが倒れたか確認
      if (this.player.getHP() <= 0) {
        this.battleEnded = true;
        this.addLog("あなたは敗北しました...");
        
        // 親クラスのゲームオーバー処理を呼び出し
        this.gameOver(false);
      }
    });
  }

  showDamageText(damage, x, y, color = 0xff0000) {
    const damageText = this.add.text(x, y, `-${damage}`, {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: color === 0xff0000 ? '#ff0000' : `#${color.toString(16).padStart(6, '0')}`,
      stroke: '#ffffff',
      strokeThickness: 2
    }).setOrigin(0.5);
    
    this.tweens.add({
      targets: damageText,
      y: y - 50,
      alpha: 0,
      duration: 1000,
      ease: 'Power1',
      onComplete: () => {
        damageText.destroy();
      }
    });
  }

  showHealText(amount, x, y) {
    const healText = this.add.text(x, y, `+${amount}`, {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#00ff00',
      stroke: '#ffffff',
      strokeThickness: 2
    }).setOrigin(0.5);
    
    this.tweens.add({
      targets: healText,
      y: y - 50,
      alpha: 0,
      duration: 1000,
      ease: 'Power1',
      onComplete: () => {
        healText.destroy();
      }
    });
  }  showMessage(message, duration = 2000) {
    // addLogメソッドを使用してバトルログにメッセージを表示
    this.addLog(message);
  }
  checkBattleEnd() {
    if (this.enemy.getHP() <= 0) {
      this.battleEnded = true;
      
      // 敵の倒れるアニメーション
      this.tweens.add({
        targets: this.enemySprite,
        alpha: 0,
        y: this.enemySprite.y + 100,
        rotation: 0.5,
        duration: 1000,
        ease: 'Power1'
      });
      
      // 勝利メッセージ
      this.addLog("敵を倒した！プレイヤーの勝利！");
      this.gameOver(true);  // 親クラスのgameOver処理を呼び出し
        // クリーンアップ
      if (this.clockUpdateTimer) this.clockUpdateTimer.remove();
      if (this.tickTimer) this.tickTimer.remove();
      if (this.warningTimer) this.warningTimer.remove();
      if (this.powerUpTimer) this.powerUpTimer.remove();
      
      // パーティクルエミッターも停止
      if (this.timeEmitter) this.timeEmitter.stop();

      return true;
    }
    return false;
  }
  // createHelpButton() {
  //   // ヘルプボタン
  //   const helpButton = this.add.text(750, 50, "?", {
  //     fontSize: '32px',
  //     fontFamily: 'Arial',
  //     color: '#ffffff',
  //     backgroundColor: '#000000',
  //     padding: { x: 15, y: 10 },
  //     borderRadius: 15
  //   }).setOrigin(0.5).setInteractive();
    
  //   // ボタンのホバー効果
  //   helpButton.on('pointerover', function () {
  //     this.setTint(0xcccccc);
  //   });
    
  //   helpButton.on('pointerout', function () {
  //     this.clearTint();
  //   });
    
  //   // クリックでヘルプポップアップを表示
  //   helpButton.on('pointerdown', () => {
  //     this.showHelpPopup();
  //   });
  // }
  // showHelpPopup() {
  //   // 半透明の背景
  //   const overlay = this.add.rectangle(400, 300, 800, 600, 0x000000, 0.8);
    
  //   // ポップアップウィンドウ
  //   const popup = this.add.rectangle(400, 300, 600, 400, 0x333333, 1);
  //   popup.setStrokeStyle(4, 0xffffff);
    
  //   // タイトル
  //   const title = this.add.text(400, 150, "ステージ5: 時間との勝負", {
  //     fontSize: '28px',
  //     fontFamily: 'Arial',
  //     color: '#ffffff',
  //     stroke: '#000000',
  //     strokeThickness: 2
  //   }).setOrigin(0.5);
    
  //   // ヘルプテキスト
  //   const helpTextContent = [
  //     "・敵「タイムイーター」は、20秒後にパワーアップします！",
  //     "・パワーアップ後は攻撃力が2倍になり、特殊攻撃を使うようになります。",
  //     "・急いで攻撃して、パワーアップ前に倒しましょう。",
  //     "・「待機」ブロックを使えば、敵の攻撃を回避できることがあります。",
  //     "・特に強化後の敵と戦う場合は、タイミングを見計らった「待機」が有効です。",
  //     "・魔法攻撃（炎・氷）も効果的です。"
  //   ];
    
  //   const helpText = this.add.text(400, 280, helpTextContent, {
  //     fontSize: '20px',
  //     fontFamily: 'Arial',
  //     color: '#ffffff',
  //     align: 'left',
  //     lineSpacing: 10
  //   }).setOrigin(0.5);
    
  //   // 閉じるボタン
  //   const closeButton = this.add.text(400, 430, "閉じる", {
  //     fontSize: '24px',
  //     fontFamily: 'Arial',
  //     color: '#ffffff',
  //     backgroundColor: '#222222',
  //     padding: { x: 20, y: 10 },
  //     stroke: '#ffffff',
  //     strokeThickness: 1
  //   }).setOrigin(0.5).setInteractive();
    
  //   closeButton.on('pointerover', function () {
  //     this.setBackgroundColor('#555555');
  //   });
    
  //   closeButton.on('pointerout', function () {
  //     this.setBackgroundColor('#222222');
  //   });
    
  //   closeButton.on('pointerdown', () => {
  //     // ポップアップを閉じる
  //     overlay.destroy();
  //     popup.destroy();
  //     title.destroy();
  //     helpText.destroy();
  //     closeButton.destroy();
  //   });
  // }

  // 魔法詠唱のポップアップを表示（Stage5用にカスタマイズ）
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
    const title = this.add.text(0, -130, '時間との勝負', {
      fontFamily: 'Verdana, "メイリオ", sans-serif',
      fontSize: '28px',
      fontStyle: 'bold',
      fill: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3,
      shadow: { offsetX: 2, offsetY: 2, color: '#000', blur: 3, fill: true }
    }).setOrigin(0.5);
    
    // コンテンツ要素
    
    // 魔法アイコン
    const fireIcon = this.add.graphics();
    fireIcon.fillStyle(0xff3300, 0.8);
    fireIcon.fillCircle(-150, -80, 15);
    
    const iceIcon = this.add.graphics();
    iceIcon.fillStyle(0x44aaff, 0.8);
    iceIcon.fillCircle(-150, -40, 15);
      const waitIcon = this.add.graphics();
    waitIcon.fillStyle(0xffcc00, 0.8);
    waitIcon.fillCircle(-150, 0, 15);
    
    // 魔法の説明テキスト
    const fireText = this.add.text(-120, -80, '炎の魔法: 右手→右手→左手', {
      fontFamily: 'Verdana, "メイリオ", sans-serif',
      fontSize: '18px',
      fill: '#ff9966',
      shadow: { offsetX: 1, offsetY: 1, color: '#000', blur: 1, fill: true }
    }).setOrigin(0, 0.5);
    
    const iceText = this.add.text(-120, -40, '氷の魔法: 左手→左手', {
      fontFamily: 'Verdana, "メイリオ", sans-serif',
      fontSize: '18px',
      fill: '#99ffff',
      shadow: { offsetX: 1, offsetY: 1, color: '#000', blur: 1, fill: true }
    }).setOrigin(0, 0.5);
    
    const waitText = this.add.text(-120, 0, '待機: 敵の攻撃を回避する可能性あり', {
      fontFamily: 'Verdana, "メイリオ", sans-serif',
      fontSize: '18px',
      fill: '#ffff99',
      shadow: { offsetX: 1, offsetY: 1, color: '#000', blur: 1, fill: true }
    }).setOrigin(0, 0.5);
    
    // 解説
    const stageInfo = this.add.text(0, 60, 'タイムイーターは強化されると攻撃が激化します！\n特に強化直前に「待機」ブロックを使うと回避率アップ！', {
      fontFamily: 'Verdana, "メイリオ", sans-serif',
      fontSize: '16px',
      fill: '#ffffff',
      align: 'center',
      wordWrap: { width: 380 }
    }).setOrigin(0.5);
    
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
    
    // 要素をコンテナに追加
    container.add([
      popupBg, titleBg, title, buttonBg, closeButton,
      fireIcon, fireText, iceIcon, iceText, waitIcon, waitText, stageInfo
    ]);
    
    // ポップアップアニメーション
    this.tweens.add({
      targets: container,
      scale: 1,
      duration: 300,
      ease: 'Back.easeOut'
    });
      // イベントリスナー
    closeButton.on('pointerdown', () => {
      this.hideSpellPopup();
    });
    
    // ホバー効果
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
  // ポップアップを隠す
  hideSpellPopup() {
    if (!this.spellPopup) return;
    
    // 閉じるアニメーション
    this.tweens.add({
      targets: this.spellPopup.container,
      scale: 0,
      duration: 200,
      ease: 'Back.easeIn',
      onComplete: () => {
        this.spellPopup.container.destroy();
        this.spellPopup = null;
      }
    });
  }
  // より堅牢なログ追加メソッドをオーバーライド
  addLog(message) {
    try {
      // コンソールには常に出力
      console.log(`BattleScene5 log: ${message}`);
      
      // UIが利用可能ならUIを使用
      if (this.ui && typeof this.ui.log === 'function') {
        this.ui.log(message);
      } else {
        console.warn("UI log method not available, attempting fallback");
        
        // UIがない場合は作成を試みる
        if (!this.ui || typeof this.ui !== 'object') {
          console.log("Creating new UI object");
          this.ui = new UI();
          
          // logAreaの設定もトライする
          const logElement = document.querySelector('#battleLog');
          if (logElement) {
            console.log("Setting logArea from DOM element");
            this.ui.logArea = logElement;
          }
          
          if (this.enemy) {
            console.log("Updating enemy UI reference");
            this.enemy.setUI(this.ui);
          }
        }
        
        // 改めてログ出力を試みる
        if (this.ui && typeof this.ui.log === 'function') {
          this.ui.log(message);
        } else {
          // 最後の手段として親クラスのメソッドを試す
          try {
            super.addLog(message);
          } catch (innerError) {
            console.error("Failed to use super.addLog:", innerError);
          }
        }
      }
    } catch (error) {
      console.error("Error in addLog method:", error);
      // エラーが発生してもクラッシュしないようにする
    }
  }

  // Player.attack()メソッドから呼び出されるメソッド
  async playAnimation(animationName) {
    console.log(`Playing animation: ${animationName}`);
    
    switch (animationName) {
      case 'playerAttack':
        // プレイヤーの攻撃アニメーション
        await new Promise(resolve => {
          this.tweens.add({
            targets: this.playerSprite,
            x: this.playerSprite.x + 50,
            duration: 200,
            ease: 'Power1',
            yoyo: true,
            onComplete: resolve
          });
        });
        break;
        
      case 'magic_fire':
        // 火の魔法アニメーション
        await new Promise(resolve => {
          // 魔法の詠唱エフェクト
          const magicCircle = this.add.graphics();
          magicCircle.fillStyle(0xff3300, 0.4);
          magicCircle.fillCircle(this.playerSprite.x + 30, this.playerSprite.y, 40);
          
          this.tweens.add({
            targets: magicCircle,
            alpha: 0,
            scale: 2,
            duration: 800,
            onComplete: () => {
              magicCircle.destroy();
              resolve();
            }
          });
        });
        break;
        
      case 'magic_ice':
        // 氷の魔法アニメーション
        await new Promise(resolve => {
          // 魔法の詠唱エフェクト
          const magicCircle = this.add.graphics();
          magicCircle.fillStyle(0x88ccff, 0.4);
          magicCircle.fillCircle(this.playerSprite.x + 30, this.playerSprite.y, 40);
          
          this.tweens.add({
            targets: magicCircle,
            alpha: 0,
            scale: 2,
            duration: 800,
            onComplete: () => {
              magicCircle.destroy();
              resolve();
            }
          });
        });
        break;
        
      default:
        // デフォルトのアニメーション（なにもしない）
        await new Promise(resolve => setTimeout(resolve, 300));
        break;
    }
  }
  
  // Player.attack()メソッドから呼び出されるメソッド
  dealDamageToEnemy(damage) {
    console.log(`Dealing ${damage} damage to enemy`);
    
    // ダメージ処理
    this.enemy.takeDamage(damage);
    
    // ダメージテキスト
    this.showDamageText(damage, this.enemySprite.x, this.enemySprite.y - 50);
    
    // 敵のダメージアニメーション
    this.tweens.add({
      targets: this.enemySprite,
      alpha: 0.5,
      duration: 100,
      ease: 'Power1',
      yoyo: true,
      onComplete: () => {
        // 敵にダメージエフェクト（赤く点滅）
        this.enemySprite.setTint(0xff0000);
        this.time.delayedCall(100, () => {
          this.enemySprite.clearTint();
        });
      }
    });
    
    // HPバーを更新
    this.updateHP(this.player.getHP(), this.enemy.getHP());
    
    // 敵を倒したか確認
    this.checkBattleEnd();
  }

  // BattleScene5専用のshowBlockEditor実装
  showBlockEditor() {
    // 親クラスのメソッドを呼び出す
    super.showBlockEditor();
    
    console.log("BattleScene5: showing block editor specifically for Stage 5");
    
    // Stage5で特別に必要な設定があれば追加
    const runButton = document.getElementById("runButton");
    if (runButton) {
      console.log("Ensuring run button is visible and enabled for Stage5Battle");
      runButton.style.display = 'block';
      runButton.disabled = false;
      
      // イベントリスナーが複数追加されないよう、一度クローンして置き換え
      const newRunButton = runButton.cloneNode(true);
      runButton.parentNode.replaceChild(newRunButton, runButton);
      
      // 改めてイベントリスナーを追加
      newRunButton.addEventListener("click", () => {
        console.log("Run button clicked directly in Stage5Battle");
        // Blocklyワークスペースの存在を確認
        const workspace = window.Blockly && window.Blockly.getMainWorkspace();
        if (workspace) {
          // カスタムイベントを発火させて、元のクリックハンドラを間接的に呼び出す
          const event = new CustomEvent("blockly-run");
          document.dispatchEvent(event);
        } else {
          console.error("Blockly workspace not found");
        }
      });
    }
  }
}

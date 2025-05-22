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
      scratchMode: false,
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
  }
  create() {
    // 親クラスのcreateメソッドを呼び出し
    super.create();
    
    // ステージ5固有のセットアップ
    this.setupStage5();
  }
  
  setupStage5() {
    // 時計のスプライトを作成（強化時間を視覚的に表すため）
    this.clock = this.add.image(400, 100, "clock").setScale(0.6);    
    this.clockHand = this.add.graphics();
    this.updateClockHand(0);
    
    // パーティクルシステムの設定 - Phaserの最新API対応版
    this.timeEmitter = this.add.particles(
      // エミッターの初期位置をスプライト位置に設定
      this.enemySprite.x,
      this.enemySprite.y,
      // 使用するパーティクルテクスチャキー
      'time_particle',
      {
        speed: { min: 20, max: 50 },
        scale: { start: 0.4, end: 0 },
        alpha: { start: 0.6, end: 0 },
        lifespan: 1000,
        quantity: 1,
        frequency: 200,
        blendMode: 'ADD',
        on: false
      }
    );
      // エネミー設定を上書き
    this.enemy = new Enemy(30, 10); // タイムイーターの初期HP30、攻撃力10
    this.enemy.sprite = this.enemySprite;
    
    // タイムイーターの見た目を適用
    this.enemySprite.setTexture("timeeater").setScale(1.5);
    
    // HPバーを更新（親クラスのメソッドを使用）
    this.updateHP(this.player.getHP(), this.enemy.getHP());
    
    // ヘルプテキストを表示（ステージ固有の情報）
    // this.helpText = this.add.text(400, 520, "⚠️ 一定時間後、敵は強化されます！急いで攻撃してください！", {
    //   fontSize: '18px',
    //   fontFamily: 'Arial',
    //   color: '#ffffff',
    //   stroke: '#000000',
    //   strokeThickness: 4,
    //   shadow: { offsetX: 2, offsetY: 2, color: '#000', blur: 2, stroke: true, fill: true },
    //   align: 'center'
    // }).setOrigin(0.5);
    
    // 「待機ブロック」の使い方を説明するヒントテキスト
    const hintText = this.add.text(400, 550, "ヒント: 待機ブロックを使って、敵の攻撃を回避することもできます", {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#ffff00',
      stroke: '#000000',
      strokeThickness: 3,
      shadow: { offsetX: 1, offsetY: 1, color: '#000', blur: 1, stroke: true, fill: true },
      align: 'center'
    }).setOrigin(0.5);
    
    // フラッシュアニメーションを追加（ヒントを目立たせる）
    this.tweens.add({
      targets: hintText,
      alpha: 0.5,
      duration: 1000,
      ease: 'Power2',
      yoyo: true,
      repeat: -1
    });

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
      
      // 時計の音を定期的に鳴らす
      this.tickSound = this.sound.add("tick");
      this.tickTimer = this.time.addEvent({
        delay: 1000, // 1秒ごと
        callback: () => {
          if (!this.battleEnded) {
            this.tickSound.play({ volume: 0.3 });
          }
        },
        loop: true
      });
    });

    // ポップアップヘルプ機能
    this.createHelpButton();
    
    // バトル開始メッセージを更新
    this.addLog(`ステージ5「時間との勝負」が始まりました！時間操作を持つ${this.settings.enemy}と対決します！`);
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
    // プレイヤーの攻撃アニメーション
    this.tweens.add({
      targets: this.playerSprite,
      x: this.playerSprite.x + 50,
      duration: 200,
      ease: 'Power1',
      yoyo: true
    });
    
    // ダメージ計算
    const damage = this.player.calculateDamage(this.enemy);
    this.enemy.takeDamage(damage);
    
    // ダメージテキスト
    this.showDamageText(damage, this.enemySprite.x, this.enemySprite.y - 50);
    
    // 敵のダメージアニメーション
    this.tweens.add({
      targets: this.enemySprite,
      alpha: 0.5,
      duration: 100,
      ease: 'Power1',
      yoyo: true
    });
      // HPバーを更新
    this.updateHP(this.player.getHP(), this.enemy.getHP());
    
    // 敵を倒したか確認
    this.checkBattleEnd();
  }
  playerHeal() {
    // 回復量の計算
    const healAmount = this.player.heal();    // 回復エフェクト
    const healParticles = this.add.particles('healthbar');
    const healEmitter = healParticles.addEmitter({
      x: this.playerSprite.x,
      y: this.playerSprite.y,
      speed: { min: 20, max: 40 },
      scale: { start: 0.2, end: 0 },
      alpha: { start: 0.6, end: 0 },
      tint: 0x00ff00,
      lifespan: 1000,
      blendMode: 'ADD',
      emitting: false
    });
    
    // エミッターを一回だけ爆発させる
    healEmitter.emitParticleAt(this.playerSprite.x, this.playerSprite.y, 20);
      // 回復テキスト表示
    this.showHealText(healAmount, this.playerSprite.x, this.playerSprite.y - 50);
    
    // HPバーを更新
    this.updateHP(this.player.getHP(), this.enemy.getHP());
  }

  playerCastSpell(spell) {
    let damage = 0;
    let particleColor = 0xffffff;
    
    switch (spell) {
      case "FIRE":
        // 炎魔法の効果
        damage = this.player.calculateSpellDamage("fire");
        particleColor = 0xff5500;
        this.castFireSpell(damage);
        break;
        
      case "ICE":
        // 氷魔法の効果
        damage = this.player.calculateSpellDamage("ice");
        particleColor = 0x88ccff;
        this.castIceSpell(damage);
        break;
        
      default:
        console.warn("Unknown spell type:", spell);
        return;
    }
      // ダメージを与え、戦闘終了をチェック
    this.enemy.takeDamage(damage);
    this.updateHP(this.player.getHP(), this.enemy.getHP());
    this.checkBattleEnd();
  }  castFireSpell(damage) {
    // 火のパーティクルエフェクト
    const fireParticles = this.add.particles('fire');
    const fireEmitter = fireParticles.addEmitter({
      x: this.playerSprite.x + 20,
      y: this.playerSprite.y,
      speed: { min: 200, max: 300 },
      scale: { start: 0.6, end: 0 },
      alpha: { start: 0.6, end: 0 },
      lifespan: 800,
      blendMode: 'ADD',
      emitting: true
    });
    
    // 炎を敵に向かって飛ばす（パーティクルの発生源を移動）
    this.tweens.add({
      targets: fireEmitter,
      x: this.enemySprite.x,
      y: this.enemySprite.y,
      duration: 600,
      ease: 'Power2',
      onComplete: () => {
        // 爆発効果
        fireEmitter.emitParticleAt(this.enemySprite.x, this.enemySprite.y, 30);
        
        // エフェクト終了後にパーティクルシステムを破棄
        this.time.delayedCall(800, () => {
          fireParticles.destroy();
        });
        
        // ダメージテキスト
        this.showDamageText(damage, this.enemySprite.x, this.enemySprite.y - 50, 0xff5500);
      }
    });
  }  castIceSpell(damage) {
    // 氷のパーティクルエフェクト
    const iceParticles = this.add.particles('ice');
    const iceEmitter = iceParticles.addEmitter({
      x: this.playerSprite.x + 20,
      y: this.playerSprite.y,
      speed: { min: 180, max: 250 },
      scale: { start: 0.5, end: 0 },
      alpha: { start: 0.7, end: 0 },
      lifespan: 1000,
      blendMode: 'ADD',
      emitting: true
    });
    
    // 氷を敵に向かって飛ばす
    this.tweens.add({
      targets: iceEmitter,
      x: this.enemySprite.x,
      y: this.enemySprite.y,
      duration: 800,
      ease: 'Cubic.Out',
      onComplete: () => {
        // 凍結効果
        iceEmitter.emitParticleAt(this.enemySprite.x, this.enemySprite.y, 25);
        
        // 凍結エフェクト（敵を一時的に青くする）
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
        
        // エフェクト終了後にパーティクルシステムを破棄
        this.time.delayedCall(1000, () => {
          iceParticles.destroy();
        });
        
        // ダメージテキスト
        this.showDamageText(damage, this.enemySprite.x, this.enemySprite.y - 50, 0x88ccff);
      }
    });
    
    // タイムイーターは氷には特に弱くないので、特別な効果はなし
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
      const perfectTimingParticles = this.add.particles('time_particle');
      const perfectEmitter = perfectTimingParticles.addEmitter({
        x: this.playerSprite.x,
        y: this.playerSprite.y,
        speed: { min: 10, max: 30 },
        scale: { start: 0.2, end: 0 },
        alpha: { start: 1, end: 0 },
        tint: 0xffff00,
        lifespan: 1000,
        blendMode: 'ADD',
        emitting: false
      });
        perfectEmitter.emitParticleAt(this.playerSprite.x, this.playerSprite.y, 20);
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
    
    // 敵の攻撃処理
    let damage;
    
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
    
    // 時間パーティクル爆発
    this.timeEmitter.emitParticleAt(this.enemySprite.x, this.enemySprite.y, 50);
    
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

  createHelpButton() {
    // ヘルプボタン
    const helpButton = this.add.text(750, 50, "?", {
      fontSize: '32px',
      fontFamily: 'Arial',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 15, y: 10 },
      borderRadius: 15
    }).setOrigin(0.5).setInteractive();
    
    // ボタンのホバー効果
    helpButton.on('pointerover', function () {
      this.setTint(0xcccccc);
    });
    
    helpButton.on('pointerout', function () {
      this.clearTint();
    });
    
    // クリックでヘルプポップアップを表示
    helpButton.on('pointerdown', () => {
      this.showHelpPopup();
    });
  }

  showHelpPopup() {
    // 半透明の背景
    const overlay = this.add.rectangle(400, 300, 800, 600, 0x000000, 0.8);
    
    // ポップアップウィンドウ
    const popup = this.add.rectangle(400, 300, 600, 400, 0x333333, 1);
    popup.setStrokeStyle(4, 0xffffff);
    
    // タイトル
    const title = this.add.text(400, 150, "ステージ5: 時間との勝負", {
      fontSize: '28px',
      fontFamily: 'Arial',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);
    
    // ヘルプテキスト
    const helpTextContent = [
      "・敵「タイムイーター」は、20秒後にパワーアップします！",
      "・パワーアップ後は攻撃力が2倍になり、特殊攻撃を使うようになります。",
      "・急いで攻撃して、パワーアップ前に倒しましょう。",
      "・「待機」ブロックを使えば、敵の攻撃を回避できることがあります。",
      "・特に強化後の敵と戦う場合は、タイミングを見計らった「待機」が有効です。",
      "・魔法攻撃（炎・氷）も効果的です。"
    ];
    
    const helpText = this.add.text(400, 280, helpTextContent, {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#ffffff',
      align: 'left',
      lineSpacing: 10
    }).setOrigin(0.5);
    
    // 閉じるボタン
    const closeButton = this.add.text(400, 430, "閉じる", {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffffff',
      backgroundColor: '#222222',
      padding: { x: 20, y: 10 },
      stroke: '#ffffff',
      strokeThickness: 1
    }).setOrigin(0.5).setInteractive();
    
    closeButton.on('pointerover', function () {
      this.setBackgroundColor('#555555');
    });
    
    closeButton.on('pointerout', function () {
      this.setBackgroundColor('#222222');
    });
    
    closeButton.on('pointerdown', () => {
      // ポップアップを閉じる
      overlay.destroy();
      popup.destroy();
      title.destroy();
      helpText.destroy();
      closeButton.destroy();
    });
  }

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
    waitIcon.fillRect(-165, 0, 30, 30);
    
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
    const stageInfo = this.add.text(0, 60, 'タイムイーターは時間経過で強化されます！\n強化前に倒すか、待機で攻撃を回避しながら戦おう。\n特に強化直前（70%～99%）の待機は回避率が高い！', {
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
      buttonBg.fillStyle(0xaa0000, 1);
      buttonBg.fillRoundedRect(-60, 130, 120, 40, 10);
    });
    
    closeButton.on('pointerout', () => {
      buttonBg.fillStyle(0x880000, 1);
      buttonBg.fillRoundedRect(-60, 130, 120, 40, 10);
    });
    
    // コンテナを保存（後で参照できるように）
    this.spellPopup = container;
  }

  // ポップアップを隠す
  hideSpellPopup() {
    if (!this.spellPopup) return;
    
    // 閉じるアニメーション
    this.tweens.add({
      targets: this.spellPopup,
      scale: 0,
      duration: 200,
      ease: 'Back.easeIn',
      onComplete: () => {
        this.spellPopup.destroy();
        this.spellPopup = null;
      }
    });
  }

}

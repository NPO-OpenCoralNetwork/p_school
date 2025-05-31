import Phaser from "phaser";
import { BattleScene } from "./battle";

/**
 * ステージ9「連続魔法攻撃」のバトルシーン
 * 
 * 敵: シャドウバット（HP: 40、素早い）
 * 特徴: 素早く移動し、回避能力が高い敵。同じ魔法を連続で使うことで対処する
 * 使用可能ブロック: すべての基本ブロック、繰り返し（3回）
 */
export class BattleScene9 extends BattleScene {
  constructor() {
    super({ key: "Stage9Battle" });
    
    this.settings = {
      background: 'cave',
      enemy: 'shadowbat',
      scratchMode: true,
      stageNumber: 9
    };

    this.batState = {
      speed: 'fast',
      evasion: 0.3, // 30% chance to evade attacks
      consecutiveHits: 0, // Track consecutive hits of same spell
      lastSpellType: null
    };

    this.battleEnded = false;
  }

  create() {
    try {
      super.create();
      this.setupStage9();
      console.log("BattleScene9 creation complete");
      
      const messageElement = document.getElementById('message');
      if (messageElement) {
        messageElement.textContent = 'ステージ9「連続魔法攻撃」の準備完了！';
      }
      
      if (this.settings.scratchMode) {
        this.time.delayedCall(100, () => {
          this.showBlockEditor();
        });
      }
    } catch (error) {
      console.error("Critical error in BattleScene9.create():", error);
    }
  }
  setupStage9() {
    // Dark cave atmosphere
    this.cameras.main.setBackgroundColor(0x1a1a2e);

    if (this.enemySprite) {
      // Set ShadowBat appearance - darker, more agile looking
      this.enemySprite.setTint(0x6a0dad);
      this.enemySprite.setScale(1.2);
      
      // Add floating movement to show bat's agility
      this.tweens.add({
        targets: this.enemySprite,
        y: this.enemySprite.y - 20,
        duration: 1500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
      
      // Add horizontal sway to show evasiveness
      this.tweens.add({
        targets: this.enemySprite,
        x: this.enemySprite.x + 30,
        duration: 2000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }

    // Set enemy HP to 40 as specified in the guide
    if (this.enemy) {
      this.enemy.maxHP = 40;
      this.enemy.currentHP = 40;
      this.updateEnemyHPDisplay();
    }

    this.createShadowEffect();
  }

  createShadowEffect() {
    // Create shadow particles around the bat
    this.shadowParticles = this.add.particles(this.enemySprite.x, this.enemySprite.y, {
      scale: { start: 0.3, end: 0 },
      speed: { min: 20, max: 40 },
      lifespan: 800,
      tint: 0x4a0e4e,
      alpha: { start: 0.8, end: 0 },
      quantity: 2,
      frequency: 200
    });
  }
  handlePlayerAction(action, parameters = {}) {
    if (this.battleEnded) return;
    
    console.log(`BattleScene9 handling player action: ${action}`, parameters);
    
    switch (action) {
      case "Attack":
        this.playerAttack();
        break;
        
      case "Heal":
        this.playerHeal(parameters.amount || 10);
        break;
        
      case "CastSpell":
        const { spell, success } = parameters;
        if (success) {
          this.playerCastSpell(spell);
        } else {
          this.ui.log("魔法の詠唱に失敗しました");
        }
        break;
        
      case "Wait":
        this.playerWait(parameters.seconds || 1);
        break;
        
      default:
        console.warn("Unknown player action:", action);
        this.ui.log("このステージではそのアクションは使用できません");
    }
    
    if (!this.battleEnded) {
      this.time.delayedCall(1000, () => {
        this.enemyAction();
      });
    }
  }

  playerAttack() {
    if (this.battleEnded) return;
    
    // Reset consecutive magic counter for physical attacks
    this.batState.consecutiveHits = 0;
    this.batState.lastSpellType = null;
    
    // ShadowBat has high evasion chance
    const evaded = Math.random() < this.batState.evasion;
    
    if (evaded) {
      this.ui.log("シャドウバットが素早く回避した！");
      this.createEvasionEffect();
      return;
    }
    
    this.ui.log("プレイヤーの攻撃！");
    
    this.tweens.add({
      targets: this.playerSprite,
      x: this.playerSprite.x + 50,
      duration: 200,
      ease: 'Power1',
      yoyo: true,
      onComplete: () => {
        let damage = 5;
        if (this.knightState.stance === 'normal') {
          damage *= 1.0;
        } else {
          damage *= 0.5;
        }
        
        if (this.enemy) {
          this.enemy.hp = Math.max(0, this.enemy.hp - damage);
          this.updateHP(this.player.hp, this.enemy.hp);
          this.showDamageText(damage, this.enemySprite.x, this.enemySprite.y - 50);
          
          if (this.enemy.hp <= 0) {
            this.battleEnded = true;
            this.ui.log("マジックナイトを倒した！");
            this.time.delayedCall(1000, () => {
              this.victory();
            });
          }
        }
      }
    });
  }
  playerCastSpell(spell) {
    if (this.battleEnded) return;
    
    let damage = 0;
    let effectiveness = 1.0;
    
    // Check for consecutive spell usage
    let consecutiveBonus = 1.0;
    if (this.batState.lastSpellType === spell) {
      this.batState.consecutiveHits++;
      consecutiveBonus = 1.0 + (this.batState.consecutiveHits * 0.3); // 30% bonus per consecutive hit
      
      if (this.batState.consecutiveHits >= 2) {
        this.ui.log(`${this.batState.consecutiveHits + 1}連続魔法攻撃！ダメージボーナス！`);
      }
    } else {
      this.batState.consecutiveHits = 0;
      this.batState.lastSpellType = spell;
    }
    
    // ShadowBat has lower evasion against repeated magic attacks
    const baseEvasion = this.batState.evasion;
    const reducedEvasion = Math.max(0.05, baseEvasion - (this.batState.consecutiveHits * 0.1));
    const evaded = Math.random() < reducedEvasion;
    
    if (evaded) {
      this.ui.log("シャドウバットが魔法を回避した！");
      this.createEvasionEffect();
      // Reset consecutive hits on evasion
      this.batState.consecutiveHits = 0;
      this.batState.lastSpellType = null;
      return;
    }
    
    switch (spell) {
      case "FIRE":
        damage = 12;
        this.ui.log("炎の魔法を詠唱！");
        this.createFireEffect();
        break;
      case "ICE":
        damage = 10;
        this.ui.log("氷の魔法を詠唱！");
        this.createIceEffect();
        break;
      case "THUNDER":
        damage = 14;
        this.ui.log("雷の魔法を詠唱！");
        this.createThunderEffect();
        break;
      case "HEAL":
        this.ui.log("回復魔法を詠唱！");
        this.createHealEffect();
        const healAmount = Math.floor((15 + (this.batState.consecutiveHits * 3)) * consecutiveBonus);
        this.player.hp = Math.min(this.player.maxHP, this.player.hp + healAmount);
        this.updateHP(this.player.hp, this.enemy.hp);
        this.showDamageText(`+${healAmount}`, this.playerSprite.x, this.playerSprite.y - 50, 0x00ff00);
        return;
    }
    
    const finalDamage = Math.floor(damage * consecutiveBonus);
    
    if (this.enemy) {
      this.enemy.hp = Math.max(0, this.enemy.hp - finalDamage);
      this.updateHP(this.player.hp, this.enemy.hp);
      this.showDamageText(finalDamage, this.enemySprite.x, this.enemySprite.y - 50);
      
      if (this.enemy.hp <= 0) {
        this.battleEnded = true;
        this.ui.log("シャドウバットを倒した！");
        this.time.delayedCall(1000, () => {
          this.victory();
        });
      }
    }
  }

  createFireEffect() {
    this.add.particles(this.enemySprite.x, this.enemySprite.y, {
      key: 'particle',
      speed: { min: 100, max: 200 },
      angle: { min: -120, max: -60 },
      scale: { start: 0.6, end: 0 },
      blendMode: 'ADD',
      tint: 0xff4400,
      lifespan: 1000,
      quantity: 20,
      emitting: true,
      duration: 1000
    });
  }

  createIceEffect() {
    this.add.particles(this.enemySprite.x, this.enemySprite.y, {
      key: 'particle',
      speed: { min: 80, max: 160 },
      angle: { min: -120, max: -60 },
      scale: { start: 0.5, end: 0 },
      blendMode: 'ADD',
      tint: 0x00ffff,
      lifespan: 1500,
      quantity: 15,
      emitting: true,
      duration: 1500
    });
  }

  createThunderEffect() {
    this.add.particles(this.enemySprite.x, this.enemySprite.y - 100, {
      key: 'particle',
      speedY: { min: 300, max: 500 },
      scale: { start: 0.5, end: 0 },
      blendMode: 'ADD',
      tint: 0xffff00,
      lifespan: 800,
      quantity: 25,
      emitting: true,
      duration: 800
    });
  }

  createHealEffect() {
    this.add.particles(this.playerSprite.x, this.playerSprite.y, {
      key: 'particle',
      speed: { min: 50, max: 100 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.4, end: 0 },
      blendMode: 'ADD',
      tint: 0x00ff00,
      lifespan: 1000,
      quantity: 10,
      emitting: true,
      duration: 1000
    });
  }

  playerWait(seconds = 1) {
    if (this.battleEnded) return;
    this.ui.log(`${seconds}秒待機します...`);
  }

  playerHeal(amount = 10) {
    if (this.battleEnded) return;
    
    if (this.player) {
      const oldHp = this.player.hp;
      this.player.hp = Math.min(this.player.maxHp, this.player.hp + amount);
      const healedAmount = this.player.hp - oldHp;
      
      this.updateHP(this.player.hp, this.enemy.hp);
      this.createHealEffect();
      
      if (healedAmount > 0) {
        this.ui.log(`${healedAmount}ポイント回復した！`);
        this.showDamageText(healedAmount, this.playerSprite.x, this.playerSprite.y - 50, 0x00ff00);
      } else {
        this.ui.log("これ以上回復できない！");
      }
    }
  }
  enemyAction() {
    if (this.battleEnded) return;
    
    // ShadowBat has faster, more aggressive actions
    const actions = ['swoop_attack', 'shadow_strike', 'evasive_maneuver'];
    const randomAction = actions[Math.floor(Math.random() * actions.length)];
    
    switch (randomAction) {
      case 'swoop_attack':
        this.batSwoopAttack();
        break;
      case 'shadow_strike':
        this.batShadowStrike();
        break;
      case 'evasive_maneuver':
        this.batEvasiveManeuver();
        break;
    }
  }

  batSwoopAttack() {
    this.ui.log("シャドウバットの急降下攻撃！");
    
    // Quick swoop animation
    this.tweens.add({
      targets: this.enemySprite,
      x: this.playerSprite.x - 50,
      y: this.playerSprite.y - 50,
      duration: 400,
      ease: 'Power2',
      onComplete: () => {
        const damage = 8;
        
        if (this.player) {
          this.player.hp = Math.max(0, this.player.hp - damage);
          this.updateHP(this.player.hp, this.enemy.hp);
          this.showDamageText(damage, this.playerSprite.x, this.playerSprite.y - 50);
          
          if (this.player.hp <= 0) {
            this.battleEnded = true;
            this.ui.log("プレイヤーは倒れた...");
            this.time.delayedCall(1000, () => {
              this.gameOver();
            });
          }
        }
        
        // Return to original position
        this.tweens.add({
          targets: this.enemySprite,
          x: 600,
          y: 200,
          duration: 300,
          ease: 'Power2'
        });
      }
    });
  }

  batShadowStrike() {
    this.ui.log("シャドウバットの影撃！");
    
    // Create shadow projectile effect
    this.add.particles(this.enemySprite.x, this.enemySprite.y, {
      scale: { start: 0.4, end: 0 },
      speed: { min: 200, max: 300 },
      angle: { min: 160, max: 200 },
      lifespan: 800,
      tint: 0x4a0e4e,
      alpha: { start: 1, end: 0 },
      quantity: 20,
      emitting: true,
      duration: 500
    });
    
    const damage = 6;
    if (this.player) {
      this.player.hp = Math.max(0, this.player.hp - damage);
      this.updateHP(this.player.hp, this.enemy.hp);
      this.showDamageText(damage, this.playerSprite.x, this.playerSprite.y - 50);
      
      if (this.player.hp <= 0) {
        this.battleEnded = true;
        this.ui.log("プレイヤーは倒れた...");
        this.time.delayedCall(1000, () => {
          this.gameOver();
        });
      }
    }
  }

  batEvasiveManeuver() {
    this.ui.log("シャドウバットが警戒している...");
    
    // Increase evasion temporarily
    this.batState.evasion = Math.min(0.5, this.batState.evasion + 0.1);
    
    // Visual effect showing increased evasion
    this.tweens.add({
      targets: this.enemySprite,
      alpha: 0.5,
      duration: 500,
      yoyo: true,
      ease: 'Sine.easeInOut'
    });
      // Reset evasion after some time
    this.time.delayedCall(3000, () => {
      this.batState.evasion = 0.3; // Reset to base evasion
    });
  }

  createEvasionEffect() {
    // Create a quick dash effect to show evasion
    this.tweens.add({
      targets: this.enemySprite,
      x: this.enemySprite.x + 100,
      duration: 200,
      yoyo: true,
      ease: 'Power2'
    });

    // Add evasion particles
    this.add.particles(this.enemySprite.x, this.enemySprite.y, {
      scale: { start: 0.3, end: 0 },
      speed: { min: 100, max: 200 },
      lifespan: 500,
      tint: 0x9932cc,
      alpha: { start: 0.8, end: 0 },
      quantity: 15,
      emitting: true,
      duration: 300
    });
  }

  showDamageText(damage, x, y, color = 0xff0000) {
    const text = this.add.text(x, y, damage.toString(), {
      fontSize: '24px',
      fill: '#' + color.toString(16).padStart(6, '0'),
      stroke: '#000000',
      strokeThickness: 4
    });
    
    this.tweens.add({
      targets: text,
      y: y - 50,
      alpha: 0,
      duration: 1000,
      onComplete: () => {
        text.destroy();
      }
    });
  }

  // 魔法詠唱のポップアップを表示（Stage9用にカスタマイズ）
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
    popupBg.fillRoundedRect(-250, -200, 500, 400, 15);

    // 装飾的な枠線
    popupBg.lineStyle(3, 0x6a0dad, 1);
    popupBg.strokeRoundedRect(-250, -200, 500, 400, 15);

    // 内側の光る装飾
    popupBg.lineStyle(1, 0x9932cc, 0.5);
    popupBg.strokeRoundedRect(-240, -190, 480, 380, 12);

    // タイトル背景
    const titleBg = this.add.graphics();
    titleBg.fillStyle(0x6a0dad, 0.6);
    titleBg.fillRoundedRect(-220, -185, 440, 50, 10);

    // タイトル
    const title = this.add.text(0, -160, '連続魔法攻撃のコツ', {
      fontFamily: 'Verdana, "メイリオ", sans-serif',
      fontSize: '28px',
      fontStyle: 'bold',
      fill: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3,
      shadow: { offsetX: 2, offsetY: 2, color: '#000', blur: 3, fill: true }
    }).setOrigin(0.5);

    // 連続攻撃のアイコン
    const repeatIcon = this.add.graphics();
    repeatIcon.fillStyle(0x9932cc, 0.8);
    repeatIcon.fillRect(-180, -100, 25, 25);
    repeatIcon.fillRect(-150, -100, 25, 25);
    repeatIcon.fillRect(-120, -100, 25, 25);

    // 魔法アイコン
    const fireIcon = this.add.graphics();
    fireIcon.fillStyle(0xff3300, 0.8);
    fireIcon.fillCircle(-180, -50, 15);

    const iceIcon = this.add.graphics();
    iceIcon.fillStyle(0x00ffff, 0.8);
    iceIcon.fillRect(-195, -10, 30, 30);

    const thunderIcon = this.add.graphics();
    thunderIcon.lineStyle(3, 0xffff00, 0.8);
    thunderIcon.lineBetween(-195, 40, -165, 20);
    thunderIcon.lineBetween(-165, 20, -185, 30);
    thunderIcon.lineBetween(-185, 30, -165, 50);

    // 説明テキスト
    const repeatText = this.add.text(-90, -100, '3回繰り返しブロック: 同じ魔法を3回連続で詠唱', {
      fontFamily: 'Verdana, "メイリオ", sans-serif',
      fontSize: '16px',
      fill: '#ff99ff',
      shadow: { offsetX: 1, offsetY: 1, color: '#000', blur: 1, fill: true }
    }).setOrigin(0, 0.5);

    const fireText = this.add.text(-150, -50, '炎の魔法: 右手→右手→左手 (ダメージ: 12)', {
      fontFamily: 'Verdana, "メイリオ", sans-serif',
      fontSize: '16px',
      fill: '#ff9966',
      shadow: { offsetX: 1, offsetY: 1, color: '#000', blur: 1, fill: true }
    }).setOrigin(0, 0.5);

    const iceText = this.add.text(-150, -10, '氷の魔法: 左手→左手 (ダメージ: 10)', {
      fontFamily: 'Verdana, "メイリオ", sans-serif',
      fontSize: '16px',
      fill: '#99ffff',
      shadow: { offsetX: 1, offsetY: 1, color: '#000', blur: 1, fill: true }
    }).setOrigin(0, 0.5);

    const thunderText = this.add.text(-150, 40, '雷の魔法: 右手→左手→右手→左手 (ダメージ: 14)', {
      fontFamily: 'Verdana, "メイリオ", sans-serif',
      fontSize: '16px',
      fill: '#ffff99',
      shadow: { offsetX: 1, offsetY: 1, color: '#000', blur: 1, fill: true }
    }).setOrigin(0, 0.5);

    // 戦略説明
    const stageInfo = this.add.text(0, 110, 'シャドウバットは素早く、攻撃を回避します。\n同じ魔法を連続で使うと:\n・ダメージボーナス（30%ずつ増加）\n・回避率低下（連続ヒットで10%ずつ減少）\n\n「3回繰り返し」ブロックを活用しよう！', {
      fontFamily: 'Verdana, "メイリオ", sans-serif',
      fontSize: '14px',
      fill: '#ffffff',
      align: 'center',
      wordWrap: { width: 450 }
    }).setOrigin(0.5);

    // ボタン背景
    const buttonBg = this.add.graphics();
    buttonBg.fillStyle(0x880000, 1);
    buttonBg.fillRoundedRect(-60, 160, 120, 40, 10);
    buttonBg.lineStyle(2, 0xff0000, 1);
    buttonBg.strokeRoundedRect(-60, 160, 120, 40, 10);

    // 閉じるボタン
    const closeButton = this.add.text(0, 180, '閉じる', {
      fontFamily: 'Verdana, "メイリオ", sans-serif',
      fontSize: '20px',
      fontStyle: 'bold',
      fill: '#ffffff'
    }).setOrigin(0.5).setInteractive();

    // コンテナに要素を追加
    container.add([
      popupBg, titleBg, title, buttonBg, closeButton,
      repeatIcon, fireIcon, iceIcon, thunderIcon,
      repeatText, fireText, iceText, thunderText, stageInfo
    ]);

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
      buttonBg.fillRoundedRect(-60, 160, 120, 40, 10);
      buttonBg.lineStyle(2, 0xff3333, 1);
      buttonBg.strokeRoundedRect(-60, 160, 120, 40, 10);
      closeButton.setScale(1.05);
    });

    closeButton.on('pointerout', () => {
      buttonBg.clear();
      buttonBg.fillStyle(0x880000, 1);
      buttonBg.fillRoundedRect(-60, 160, 120, 40, 10);
      buttonBg.lineStyle(2, 0xff0000, 1);
      buttonBg.strokeRoundedRect(-60, 160, 120, 40, 10);
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
}

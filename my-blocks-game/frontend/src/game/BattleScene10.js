import Phaser from "phaser";
import { BattleScene } from "./battle";
import { Enemy } from "./enemy";
import { Player } from "./player";

/**
 * ステージ10「初級ボス戦」のバトルシーン
 * 
 * 敵: ダークナイト（HP: 100、フェーズ変化あり）
 * 特徴: HPが一定値以下になるとフェーズが変わり、攻撃パターンが変化
 * 使用可能ブロック: すべての基本ブロック、繰り返し（3回）
 * 目標: ボスの弱点を見つけて攻略する
 * 学習内容: これまでの学習内容の総合的な応用
 */
export class BattleScene10 extends BattleScene {
  constructor() {
    super({ key: "Stage10Battle" });
    
    this.settings = {
      background: 'dark_castle',
      enemy: 'darkknight',
      scratchMode: true,
      stageNumber: 10
    };

    // ダークナイトのフェーズ情報
    this.knightPhase = {
      current: 1, // 現在のフェーズ（1-3）
      hp_thresholds: [70, 40], // フェーズ変化のHP閾値
      stance: 'defensive', // defensive, offensive, berserker
      shieldActive: true, // シールドの状態
      weakElement: 'FIRE', // 現在の弱点属性
      consecutiveAttacks: 0, // 連続攻撃カウンター
      phase_change_triggered: [false, false] // フェーズ変化が既に起こったか
    };

    this.battleEnded = false;
    this.bossDefeated = false;
  }

  preload() {
    // 親クラスのpreloadを呼び出し
    super.preload();
    
    // ステージ10固有のアセット
    this.load.image("darkknight", "assets/images/darkknight.png");
    this.load.image("darkknight_phase2", "assets/images/darkknight_phase2.png");
    this.load.image("darkknight_phase3", "assets/images/darkknight_phase3.png");
    this.load.image("dark_castle", "assets/images/dark_castle.png");
    this.load.image("dark_shield", "assets/images/dark_shield.png");
    this.load.image("dark_particle", "assets/images/dark_particle.png");
    this.load.image("boss_aura", "assets/images/boss_aura.png");
    
    // サウンドエフェクト
    this.load.audio("boss_roar", "assets/sounds/boss_roar.mp3");
    this.load.audio("phase_change", "assets/sounds/phase_change.mp3");
    this.load.audio("shield_break", "assets/sounds/shield_break.mp3");
    this.load.audio("dark_magic", "assets/sounds/dark_magic.mp3");
  }

  create() {
    try {
      super.create();
      this.setupStage10();
      console.log("BattleScene10 creation complete");
      
      const messageElement = document.getElementById('message');
      if (messageElement) {
        messageElement.textContent = 'ステージ10「初級ボス戦」の準備完了！';
      }
      
      if (this.settings.scratchMode) {
        this.time.delayedCall(100, () => {
          this.showBlockEditor();
        });
      }
    } catch (error) {
      console.error("Critical error in BattleScene10.create():", error);
    }
  }

  setupStage10() {
    console.log("Setting up Stage10Battle scene - Dark Knight Boss");
    
    // 背景設定（暗い城）
    if (this.textures.exists('dark_castle')) {
      const bg = this.add.image(400, 300, 'dark_castle');
      bg.setAlpha(0.8);
    } else {
      // フォールバック背景
      this.cameras.main.setBackgroundColor('#1a0d1a');
    }

    // ダークナイトの初期化
    this.enemy = Enemy.withStats(100, 15); // HP: 100, 攻撃力: 15
    this.enemy.sprite = this.enemySprite;
    this.enemy.scene = this;
    this.enemy.maxHp = 100;

    // プレイヤーの初期化
    this.player = new Player(this, this.ui);
    this.player.sprite = this.playerSprite;

    // ボスアニメーション設定
    this.setupBossAnimations();
    
    // ダークパーティクルエフェクト
    this.createDarkAura();
    
    // フェーズ変化のエフェクト準備
    this.setupPhaseEffects();

    // ボス戦BGM（あれば）
    if (this.sound.get('boss_music')) {
      this.sound.play('boss_music', { loop: true, volume: 0.5 });
    }

    // 初期メッセージ
    this.addLog("ダークナイトが立ちはだかる！");
    this.addLog("ボスは強力なシールドを展開している...");
    
    console.log("Stage10 setup complete - Dark Knight ready for battle");
  }

  setupBossAnimations() {
    // ダークナイトの浮遊アニメーション
    this.tweens.add({
      targets: this.enemySprite,
      y: this.enemySprite.y - 10,
      duration: 2000,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1
    });

    // シールドエフェクト（初期状態）
    if (this.knightPhase.shieldActive) {
      this.createShieldEffect();
    }
  }

  createDarkAura() {
    // Phaser 3.60 API使用 - ダークオーラエフェクト
    try {
      this.darkAura = this.add.particles(this.enemySprite.x, this.enemySprite.y, {
        key: 'dark_particle',
        speed: { min: 10, max: 30 },
        scale: { start: 0.3, end: 0 },
        alpha: { start: 0.8, end: 0 },
        tint: [0x4a0e4e, 0x2c1b47, 0x1a0d1a],
        lifespan: 2000,
        blendMode: 'ADD',
        frequency: 300,
        emitting: true
      });
    } catch (e) {
      console.warn("Could not create dark aura effect", e);
    }
  }

  createShieldEffect() {
    // シールドエフェクトの作成
    const shield = this.add.graphics();
    shield.lineStyle(3, 0x4444ff, 0.8);
    shield.strokeCircle(this.enemySprite.x, this.enemySprite.y, 60);
    
    // シールドの脈動エフェクト
    this.tweens.add({
      targets: shield,
      alpha: { from: 0.8, to: 0.3 },
      duration: 1000,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1
    });

    this.shieldGraphics = shield;
  }

  setupPhaseEffects() {
    // フェーズ変化時のエフェクト準備
    this.phaseChangeReady = true;
  }

  // プレイヤーの魔法詠唱
  playerCastSpell(spell) {
    if (this.battleEnded) return;

    console.log(`BattleScene10.playerCastSpell called with spell: ${spell}`);
    
    let damage = 0;
    let effectiveness = 1.0;

    // 基本ダメージ設定
    switch (spell) {
      case "FIRE":
        damage = 20;
        break;
      case "ICE":
        damage = 15;
        break;
      case "THUNDER":
        damage = 18;
        break;
      default:
        damage = 10;
    }

    // 弱点判定
    if (spell === this.knightPhase.weakElement) {
      effectiveness = 1.5;
      this.addLog(`弱点を突いた！ ${spell}魔法が効果的だ！`);
    }

    // シールド判定
    if (this.knightPhase.shieldActive) {
      effectiveness *= 0.5;
      this.addLog("シールドに阻まれてダメージが軽減された！");
    }

    const finalDamage = Math.floor(damage * effectiveness);

    // ダメージエフェクト
    this.showDamageText(finalDamage, this.enemySprite.x, this.enemySprite.y - 50, spell === this.knightPhase.weakElement ? 0xffff00 : 0xff5555);

    // 敵のHP減少
    const newHP = Math.max(0, this.enemy.getHP() - finalDamage);
    this.enemy.setHP(newHP);

    this.addLog(`${spell}の魔法！ダークナイトに ${finalDamage} のダメージ！`);

    // フェーズ変化チェック
    this.checkPhaseChange();

    // HP更新
    this.updateHP(this.player.getHP(), this.enemy.getHP());

    // 勝利判定
    if (this.enemy.getHP() <= 0) {
      this.playerWin();
      return;
    }

    // 敵のターン
    this.time.delayedCall(1000, () => {
      this.enemyAction();
    });
  }

  checkPhaseChange() {
    const currentHP = this.enemy.getHP();
    
    // フェーズ2への変化（HP 70以下）
    if (currentHP <= 70 && !this.knightPhase.phase_change_triggered[0]) {
      this.triggerPhaseChange(2);
      this.knightPhase.phase_change_triggered[0] = true;
    }
    // フェーズ3への変化（HP 40以下）
    else if (currentHP <= 40 && !this.knightPhase.phase_change_triggered[1]) {
      this.triggerPhaseChange(3);
      this.knightPhase.phase_change_triggered[1] = true;
    }
  }

  triggerPhaseChange(newPhase) {
    this.knightPhase.current = newPhase;
    
    // フェーズ変化のエフェクト
    this.cameras.main.flash(500, 50, 0, 100);
    this.cameras.main.shake(500, 0.02);

    // サウンドエフェクト
    if (this.sound.get('phase_change')) {
      this.sound.play('phase_change', { volume: 0.7 });
    }

    switch (newPhase) {
      case 2:
        this.addLog("ダークナイトがフェーズ2に移行！");
        this.addLog("シールドが破壊された！攻撃的な姿勢になった！");
        this.knightPhase.shieldActive = false;
        this.knightPhase.stance = 'offensive';
        this.knightPhase.weakElement = 'ICE';
        
        // シールド破壊エフェクト
        if (this.shieldGraphics) {
          this.shieldGraphics.destroy();
        }
        
        // 敵スプライト変更
        if (this.textures.exists('darkknight_phase2')) {
          this.enemySprite.setTexture('darkknight_phase2');
        }
        break;
        
      case 3:
        this.addLog("ダークナイトがフェーズ3に移行！");
        this.addLog("バーサーカー状態になった！雷魔法が弱点だ！");
        this.knightPhase.stance = 'berserker';
        this.knightPhase.weakElement = 'THUNDER';
        
        // 敵スプライト変更
        if (this.textures.exists('darkknight_phase3')) {
          this.enemySprite.setTexture('darkknight_phase3');
        }
        
        // バーサーカーオーラエフェクト
        this.createBerserkerAura();
        break;
    }
  }

  createBerserkerAura() {
    // バーサーカー状態の赤いオーラ
    try {
      this.berserkerAura = this.add.particles(this.enemySprite.x, this.enemySprite.y, {
        key: 'dark_particle',
        speed: { min: 20, max: 50 },
        scale: { start: 0.4, end: 0 },
        alpha: { start: 1, end: 0 },
        tint: [0xff0000, 0xff4444, 0x880000],
        lifespan: 1000,
        blendMode: 'ADD',
        frequency: 100,
        emitting: true
      });
    } catch (e) {
      console.warn("Could not create berserker aura effect", e);
    }
  }

  // 敵の行動
  enemyAction() {
    if (this.battleEnded) return;

    const actions = this.getPhaseActions();
    const action = actions[Math.floor(Math.random() * actions.length)];

    this.performEnemyAction(action);
  }

  getPhaseActions() {
    switch (this.knightPhase.current) {
      case 1:
        return ['shield_bash', 'dark_bolt', 'defensive_stance'];
      case 2:
        return ['sword_strike', 'dark_wave', 'combo_attack'];
      case 3:
        return ['berserker_rush', 'dark_explosion', 'fury_strikes'];
      default:
        return ['sword_strike'];
    }
  }

  performEnemyAction(action) {
    let damage = 0;

    switch (action) {
      case 'shield_bash':
        damage = 12;
        this.addLog("ダークナイトのシールドバッシュ！");
        break;
      case 'dark_bolt':
        damage = 15;
        this.addLog("ダークナイトのダークボルト！");
        this.createDarkBoltEffect();
        break;
      case 'defensive_stance':
        this.addLog("ダークナイトが防御態勢を取った！");
        this.knightPhase.shieldActive = true;
        return; // ダメージなし
      case 'sword_strike':
        damage = 18;
        this.addLog("ダークナイトの剣撃！");
        break;
      case 'dark_wave':
        damage = 20;
        this.addLog("ダークナイトのダークウェーブ！");
        this.createDarkWaveEffect();
        break;
      case 'combo_attack':
        damage = 25;
        this.addLog("ダークナイトの連続攻撃！");
        break;
      case 'berserker_rush':
        damage = 30;
        this.addLog("ダークナイトのバーサーカーラッシュ！");
        break;
      case 'dark_explosion':
        damage = 35;
        this.addLog("ダークナイトのダーク爆発！");
        this.createDarkExplosionEffect();
        break;
      case 'fury_strikes':
        damage = 28;
        this.addLog("ダークナイトの怒りの連撃！");
        break;
    }

    // プレイヤーにダメージ
    const newPlayerHP = Math.max(0, this.player.getHP() - damage);
    this.player.setHP(newPlayerHP);

    // HP更新
    this.updateHP(this.player.getHP(), this.enemy.getHP());

    // 敗北判定
    if (this.player.getHP() <= 0) {
      this.playerLose();
    }
  }

  createDarkBoltEffect() {
    // ダークボルトのエフェクト
    const bolt = this.add.graphics();
    bolt.lineStyle(5, 0x4a0e4e, 1);
    bolt.strokePoints([
      { x: this.enemySprite.x, y: this.enemySprite.y },
      { x: this.playerSprite.x, y: this.playerSprite.y }
    ]);

    this.tweens.add({
      targets: bolt,
      alpha: 0,
      duration: 500,
      onComplete: () => bolt.destroy()
    });
  }

  createDarkWaveEffect() {
    // ダークウェーブのエフェクト
    for (let i = 0; i < 3; i++) {
      const wave = this.add.graphics();
      wave.lineStyle(3, 0x4a0e4e, 0.7);
      wave.strokeCircle(this.enemySprite.x, this.enemySprite.y, 20);

      this.tweens.add({
        targets: wave,
        scaleX: 5 + i,
        scaleY: 5 + i,
        alpha: 0,
        duration: 1000 + i * 200,
        onComplete: () => wave.destroy()
      });
    }
  }

  createDarkExplosionEffect() {
    // ダーク爆発のエフェクト
    try {
      this.add.particles(this.enemySprite.x, this.enemySprite.y, {
        key: 'dark_particle',
        speed: { min: 100, max: 200 },
        scale: { start: 0.6, end: 0 },
        alpha: { start: 1, end: 0 },
        tint: [0x4a0e4e, 0x8800ff, 0x440088],
        lifespan: 800,
        blendMode: 'ADD',
        quantity: 50,
        emitting: true,
        duration: 300
      });
    } catch (e) {
      console.warn("Could not create dark explosion effect", e);
    }
  }

  playerWin() {
    if (this.battleEnded) return;
    
    this.battleEnded = true;
    this.bossDefeated = true;

    // 勝利エフェクト
    this.cameras.main.flash(1000, 255, 255, 0);
    
    if (this.sound.get('victory')) {
      this.sound.play('victory', { volume: 0.8 });
    }

    this.addLog("ダークナイトを倒した！");
    this.addLog("初級ボス戦クリア！おめでとう！");
    
    // パーティクルエフェクトを停止
    if (this.darkAura) this.darkAura.destroy();
    if (this.berserkerAura) this.berserkerAura.destroy();

    // 勝利メッセージ
    this.time.delayedCall(2000, () => {
      this.showVictoryMessage();
    });
  }

  showVictoryMessage() {
    const messageElement = document.getElementById('message');
    if (messageElement) {
      messageElement.innerHTML = `
        <div style="color: gold; font-weight: bold;">
          🏆 ステージ10クリア！ 🏆<br>
          初級ボス「ダークナイト」を倒しました！<br>
          <button onclick="location.reload()" style="margin-top: 10px;">次のステージへ</button>
        </div>
      `;
    }
  }

  // 魔法の書のポップアップ表示
  showSpellPopup() {
    const popup = this.add.container(400, 300);
    
    // 背景
    const bg = this.add.graphics();
    bg.fillStyle(0x000000, 0.9);
    bg.fillRoundedRect(-300, -200, 600, 400, 10);
    bg.lineStyle(3, 0xffd700);
    bg.strokeRoundedRect(-300, -200, 600, 400, 10);
    
    // タイトル
    const title = this.add.text(0, -170, '📖 ダークナイト攻略の書', {
      fontSize: '24px',
      fill: '#ffd700',
      fontFamily: 'serif',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    // 攻略内容
    const content = this.add.text(0, -50, `
ダークナイトボス攻略法

フェーズ1（HP: 100-71）
・シールドで守られている（ダメージ半減）
・弱点: 炎魔法
・防御態勢時は攻撃無効

フェーズ2（HP: 70-41）
・シールド破壊、攻撃的に
・弱点: 氷魔法
・連続攻撃に注意

フェーズ3（HP: 40-0）
・バーサーカー状態
・弱点: 雷魔法
・強力な攻撃を繰り出す

戦略のコツ:
• 各フェーズの弱点属性を覚える
• 繰り返しブロックで効率的に攻撃
• HPが減ったら回復を忘れずに
    `, {
      fontSize: '14px',
      fill: '#ffffff',
      fontFamily: 'serif',
      align: 'left',
      lineSpacing: 5
    }).setOrigin(0.5);
    
    // 閉じるボタン
    const closeButton = this.add.text(0, 150, '閉じる', {
      fontSize: '18px',
      fill: '#ffd700',
      backgroundColor: '#4a4a4a',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setInteractive();
    
    closeButton.on('pointerdown', () => {
      popup.destroy();
    });
    
    popup.add([bg, title, content, closeButton]);
    popup.setDepth(1000);
    
    return popup;
  }
}

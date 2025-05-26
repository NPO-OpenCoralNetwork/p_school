import Phaser from "phaser";
import { BattleScene } from "./battle";

/**
 * ステージ8「行動の繰り返し」のバトルシーン
 * 
 * 敵: ゴブリン部隊（HP: 各10、5体）
 * 使用可能ブロック: 攻撃、回復、魔法詠唱、待機、繰り返し（2回）
 */
export class BattleScene8 extends BattleScene {
  constructor() {
    super({ key: "Stage8Battle" });
    
    // ステージ8の設定を初期化
    this.settings = {
      background: 'camp',      // ゴブリンキャンプの背景
      enemy: 'goblins',        // ゴブリン部隊
      scratchMode: true,       // スクラッチブロックを有効にする
      stageNumber: 8
    };
    
    // ゴブリン部隊の状態管理
    this.goblins = [];         // 各ゴブリンの状態を管理する配列
    this.goblinCount = 5;      // ゴブリンの数
    this.goblinBaseHP = 10;    // 各ゴブリンの基本HP
    
    // UI要素
    this.goblinHPTexts = [];   // 各ゴブリンのHP表示
    this.goblinSprites = [];   // 各ゴブリンのスプライト
    
    // バトル状態管理
    this.battleEnded = false;
    this.isPlayerTurn = true;
  }

  create() {
    try {
      console.log("BattleScene8 create method starting");
      
      // シーンがアクティブであることを確認
      this.scene.setActive(true);
      this.scene.setVisible(true);
      
      // 親クラスのcreateメソッドを呼び出す
      super.create();
      
      // ブロックエディタの表示確認
      if (this.settings.scratchMode) {
        this.time.delayedCall(100, () => {
          this.showBlockEditor();
        });
      }
      
      // ステージ8特有の設定
      this.setupStage8();
      
      // シーン準備完了のログ
      console.log("BattleScene8 creation complete");
      
      // メッセージ表示
      const messageElement = document.getElementById('message');
      if (messageElement) {
        messageElement.textContent = 'ステージ8「行動の繰り返し」の準備完了！';
      }
    } catch (error) {
      console.error("Critical error in BattleScene8.create():", error);
      
      const messageElement = document.getElementById('message');
      if (messageElement) {
        messageElement.innerHTML = 'ゲームの初期化中にエラーが発生しました。<br><button onclick="location.reload()">ページを再読み込み</button>';
      }
    }
  }

  setupStage8() {
    // 背景色を設定（ゴブリンキャンプの雰囲気）
    this.cameras.main.setBackgroundColor(0x4a3f2f);
    
    // 既存の敵スプライトを非表示に
    if (this.enemySprite) {
      this.enemySprite.setVisible(false);
    }
    
    // ゴブリン部隊の初期化
    this.initializeGoblins();
    
    // UIの初期化
    this.initializeGoblinUI();
  }

  initializeGoblins() {
    // ゴブリンの配置位置を計算（円形に配置）
    const centerX = 600;
    const centerY = 250;
    const radius = 100;
    
    for (let i = 0; i < this.goblinCount; i++) {
      // 円周上の位置を計算
      const angle = (i / this.goblinCount) * Math.PI * 2;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      
      // ゴブリンスプライトを作成
      const goblin = this.add.sprite(x, y, 'enemy').setScale(1.5);
      goblin.setTint(0x7a6c5d); // ゴブリンらしい色に
      this.goblinSprites.push(goblin);
      
      // ゴブリンの状態を初期化
      this.goblins.push({
        hp: this.goblinBaseHP,
        maxHp: this.goblinBaseHP,
        isAlive: true,
        index: i
      });
      
      // HPテキスト表示
      const hpText = this.add.text(x, y + 40, `HP: ${this.goblinBaseHP}/${this.goblinBaseHP}`, {
        fontSize: '16px',
        fill: '#ffffff',
        stroke: '#000000',
        strokeThickness: 3
      }).setOrigin(0.5);
      
      this.goblinHPTexts.push(hpText);
    }
  }

  initializeGoblinUI() {
    // ゴブリン部隊の総数表示
    this.goblinCountText = this.add.text(600, 100, `残りゴブリン: ${this.getAliveGoblinCount()}体`, {
      fontSize: '20px',
      fill: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);
  }

  getAliveGoblinCount() {
    return this.goblins.filter(g => g.isAlive).length;
  }

  // プレイヤーの攻撃処理
  playerAttack() {
    if (this.battleEnded) return;
    
    this.ui.log("プレイヤーの攻撃！");
    
    // 攻撃アニメーション
    this.tweens.add({
      targets: this.playerSprite,
      x: this.playerSprite.x + 50,
      duration: 200,
      ease: 'Power1',
      yoyo: true,
      onComplete: () => {
        // 生存しているゴブリンからランダムに1体を選択
        const aliveGoblins = this.goblins.filter(g => g.isAlive);
        if (aliveGoblins.length > 0) {
          const targetIndex = Phaser.Math.RND.pick(aliveGoblins).index;
          this.damageGoblin(targetIndex, 5);  // 通常攻撃は5ダメージ
        }
      }
    });
  }

  // ゴブリンへのダメージ処理
  damageGoblin(index, amount) {
    const goblin = this.goblins[index];
    if (!goblin || !goblin.isAlive) return;
    
    // ダメージ計算
    goblin.hp = Math.max(0, goblin.hp - amount);
    
    // HPテキスト更新
    this.goblinHPTexts[index].setText(`HP: ${goblin.hp}/${goblin.maxHp}`);
    
    // ダメージエフェクト
    const sprite = this.goblinSprites[index];
    this.tweens.add({
      targets: sprite,
      alpha: 0.5,
      duration: 100,
      yoyo: true
    });
    
    // HPが0になった場合の処理
    if (goblin.hp <= 0) {
      goblin.isAlive = false;
      this.killGoblin(index);
    }
    
    // 残りゴブリン数の更新
    this.updateGoblinCount();
    
    // 全滅チェック
    if (this.getAliveGoblinCount() === 0) {
      this.battleEnded = true;
      this.ui.log("ゴブリン部隊を撃退した！");
      this.time.delayedCall(1000, () => {
        this.victory();
      });
    }
  }

  // ゴブリンの撃破処理
  killGoblin(index) {
    const sprite = this.goblinSprites[index];
    const hpText = this.goblinHPTexts[index];
    
    // 消滅アニメーション
    this.tweens.add({
      targets: [sprite, hpText],
      alpha: 0,
      y: '+=20',
      duration: 500,
      onComplete: () => {
        sprite.setVisible(false);
        hpText.setVisible(false);
      }
    });
  }

  // 残りゴブリン数の表示更新
  updateGoblinCount() {
    const count = this.getAliveGoblinCount();
    this.goblinCountText.setText(`残りゴブリン: ${count}体`);
  }

  // プレイヤーの回復処理
  playerHeal(amount = 10) {
    if (this.battleEnded) return;
    
    this.ui.log(`プレイヤーはHPを${amount}回復した！`);
    if (this.player) {
      this.player.heal(amount);
    }
    
    // 回復エフェクト
    this.createHealEffect(this.playerSprite.x, this.playerSprite.y);
  }

  // 魔法攻撃処理
  playerCastSpell(spell) {
    if (this.battleEnded) return;
    
    this.ui.log(`${spell}の魔法を唱えた！`);
    
    // 魔法の種類に応じたダメージと効果
    let damage = 0;
    switch (spell) {
      case "FIRE":
        damage = 8;
        this.createFireEffect();
        break;
      case "ICE":
        damage = 6;
        this.createIceEffect();
        break;
      case "THUNDER":
        damage = 10;
        this.createThunderEffect();
        break;
    }
    
    // 生存している全ゴブリンにダメージ
    this.goblins.forEach((goblin, index) => {
      if (goblin.isAlive) {
        this.damageGoblin(index, damage);
      }
    });
  }

  // 魔法エフェクト生成メソッド
  createFireEffect() {
    // 炎のパーティクルエフェクト
    const particles = this.add.particles('particle');
    particles.createEmitter({
      x: { min: 450, max: 750 },
      y: { min: 150, max: 350 },
      speed: { min: 200, max: 400 },
      angle: { min: 180, max: 360 },
      scale: { start: 0.6, end: 0 },
      blendMode: 'ADD',
      tint: 0xff6600,
      lifespan: 1000,
      quantity: 20
    });
    
    this.time.delayedCall(1000, () => {
      particles.destroy();
    });
  }

  createIceEffect() {
    // 氷のパーティクルエフェクト
    const particles = this.add.particles('particle');
    particles.createEmitter({
      x: { min: 450, max: 750 },
      y: { min: 150, max: 350 },
      speed: { min: 100, max: 200 },
      scale: { start: 0.4, end: 0 },
      blendMode: 'ADD',
      tint: 0x00ffff,
      lifespan: 1500,
      quantity: 15
    });
    
    this.time.delayedCall(1500, () => {
      particles.destroy();
    });
  }

  createThunderEffect() {
    // 雷のパーティクルエフェクト
    const particles = this.add.particles('particle');
    particles.createEmitter({
      x: { min: 450, max: 750 },
      y: { min: 50, max: 150 },
      speedY: { min: 300, max: 500 },
      scale: { start: 0.5, end: 0 },
      blendMode: 'ADD',
      tint: 0xffff00,
      lifespan: 800,
      quantity: 25
    });
    
    this.time.delayedCall(800, () => {
      particles.destroy();
    });
  }

  // 待機処理
  playerWait(seconds = 1) {
    if (this.battleEnded) return;
    this.ui.log("プレイヤーは様子を見ている...");
  }

  // プレイヤーの行動を受け付ける（engine.jsから呼ばれる）
  handlePlayerAction(action, parameters = {}) {
    if (this.battleEnded) return;
    
    console.log(`BattleScene8 handling player action: ${action}`, parameters);
    
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
        
      case "BrewAntidote":
      case "UsePotion":
        this.ui.log("このステージではそのアクションは使用できません");
        break;
        
      default:
        console.warn("Unknown player action:", action);
    }
    
    // プレイヤーの行動後、生存しているゴブリンが攻撃
    if (!this.battleEnded) {
      this.time.delayedCall(1000, () => {
        this.goblinAttack();
      });
    }
  }

  // ゴブリン部隊の攻撃
  goblinAttack() {
    if (this.battleEnded) return;
    
    // 生存しているゴブリンそれぞれが攻撃
    let totalDamage = 0;
    this.goblins.forEach((goblin, index) => {
      if (goblin.isAlive) {
        // 攻撃アニメーション
        const sprite = this.goblinSprites[index];
        this.tweens.add({
          targets: sprite,
          x: sprite.x - 30,
          duration: 200,
          ease: 'Power1',
          yoyo: true
        });
        
        totalDamage += 2;  // 各ゴブリンは2ダメージ
      }
    });
      if (totalDamage > 0) {      this.ui.log(`ゴブリン部隊の一斉攻撃！ ${totalDamage}のダメージ！`);
      if (this.player) {
        this.player.takeDamage(totalDamage);
        if (this.player.getHP() <= 0) {
          this.battleEnded = true;
          this.ui.log("プレイヤーは倒れてしまった...");
          this.gameOver(false);
        }
      }
    }
  }
}

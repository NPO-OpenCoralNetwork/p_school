import Phaser from "phaser";
import { Enemy } from "./enemy";
import { Player } from "./player";
import { UI } from "./ui";
import { BattleScene } from "./battle";

/**
 * ステージ7「雷の力」のバトルシーン
 * 
 * 敵: メタルスライム（HP: 20、高防御力）
 * 使用可能ブロック: 攻撃、回復、魔法詠唱（炎、氷、雷）
 * 目標: メタルスライムの防御を突破する
 */
export class BattleScene7 extends BattleScene {
  constructor() {
    super({ key: "Stage7Battle" });
    
    // ステージ7の設定を初期化
    this.settings = {
      background: 'metalcavern',   // 金属洞窟の背景
      enemy: 'metalslime',         // メタルスライム
      scratchMode: true,           // スクラッチブロックを有効にする
      stageNumber: 7
    };
    
    // メタルスライムの特殊状態管理
    this.armorMode = true;         // 装甲モード（防御力が高い）
    this.armorHealth = 3;          // 装甲の耐久度
    this.thunderWeakness = true;   // 雷に弱い
    
    // ダメージ計算用の係数
    this.normalAttackDamage = 2;   // 通常攻撃は大幅にダメージ減
    this.fireSpellDamage = 3;      // 炎魔法もダメージ減
    this.iceSpellDamage = 3;       // 氷魔法もダメージ減
    this.thunderSpellDamage = 15;  // 雷魔法は大ダメージ
    
    // UI要素
    this.armorStatusText = null;
    this.weaknessText = null;
    this.metalEffect = null;
    
    // バトル状態管理
    this.battleEnded = false;
    this.isPlayerTurn = true;
  }

  create() {
    try {
      console.log("BattleScene7 create method starting");
      
      // 初期化フラグ
      this.battleInitialized = false;
      
      // シーンがアクティブであることを確認
      console.log("Setting scene state as active");
      this.scene.setActive(true);
      this.scene.setVisible(true);
      
      // 親クラスのcreateメソッドを呼び出す
      super.create();
      
      // scratchModeがtrueなので、ブロックエディターが表示されているか確認
      console.log("BattleScene7 scratchMode:", this.settings.scratchMode);
      if (this.settings.scratchMode) {
        console.log("Ensuring block editor is visible in BattleScene7");
        // 少し遅延してから確実にブロックエディターを表示
        this.time.delayedCall(100, () => {
          this.showBlockEditor();
        });
      }
      
      console.log("BattleScene7 create() called");
      
      // ステージ7特有の設定
      this.setupStage7();
      
      // シーン準備完了のログ
      console.log("BattleScene7 creation complete, ready for commands");
        // メッセージ要素があれば更新
      const messageElement = document.getElementById('message');
      if (messageElement) {
        messageElement.textContent = 'ステージ7「雷の力」の準備完了！ 📖 魔法の書を参照して、詠唱パターンを確認しましょう';
      }
    } catch (error) {
      console.error("Critical error in BattleScene7.create():", error);
      
      // エラーメッセージを表示
      const messageElement = document.getElementById('message');
      if (messageElement) {
        messageElement.innerHTML = 'ゲームの初期化中にエラーが発生しました。<br><button onclick="location.reload()">ページを再読み込み</button>';
      }
    }
  }

  setupStage7() {
    console.log("Setting up Stage7Battle scene");
    
    // 敵キャラクターの設定を変更（BattleScene6のパターンを参考）
    if (this.enemy) {
      this.enemy.name = "メタルスライム";
      this.enemy.maxHp = 20;
      this.enemy.hp = 20;
      
      // UIオブジェクトが有効か詳細にチェック
      if (this.ui && typeof this.ui === 'object') {
        if (this.ui.log && typeof this.ui.log === 'function') {
          console.log("UI available, setting up enemy UI connection");
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
    }
    
    // 装甲状態表示
    this.armorStatusText = this.add.text(50, 100, "", {
      fontSize: "16px",
      fill: "#ffff00",
      fontFamily: "Arial"
    });
    
    // 弱点表示
    this.weaknessText = this.add.text(50, 130, "", {
      fontSize: "14px",
      fill: "#ff9999",
      fontFamily: "Arial"
    });
    
    // 金属エフェクト（装甲モード時に表示）
    this.metalEffect = this.add.circle(400, 300, 250, 0xc0c0c0, 0.2);
    this.metalEffect.setVisible(true);
    
    // 装甲エフェクトのアニメーション
    this.tweens.add({
      targets: this.metalEffect,
      alpha: { from: 0.2, to: 0.4 },
      duration: 2000,
      yoyo: true,
      repeat: -1
    });
    
    // 初期状態更新
    this.updateArmorDisplay();
    
    // 背景色を変更（金属的な色）
    this.cameras.main.setBackgroundColor(0x2c3e50);
    
    // 利用可能なブロックを設定
    this.setupAvailableBlocks();
    
    // 戦闘開始メッセージ
    if (this.ui && typeof this.ui.log === 'function') {
      try {
        this.ui.log("メタルスライムが現れた！");
        this.ui.log("硬い装甲で守られている！雷の魔法が効果的だ！");
        this.ui.log("雷の詠唱パターン: 右手→左手→右手→左手");
      } catch (error) {
        console.error("Error adding log in setupStage7:", error);
      }
    }
  }

  setupAvailableBlocks() {
    // ステージ7で利用できるブロックの種類を設定
    this.availableBlocks = [
      'attack',
      'cast_fire_magic',
      'cast_ice_magic',
      'cast_thunder_magic',
      'wave_left_hand',
      'wave_right_hand'
    ];
  }

  updateArmorDisplay() {
    if (!this.armorStatusText) return;
    
    let statusMsg = "";
    if (this.armorMode) {
      statusMsg = `🛡️ 装甲モード (耐久度: ${this.armorHealth})`;
      this.armorStatusText.setFill("#c0c0c0"); // シルバー色
      this.metalEffect.setVisible(true);
    } else {
      statusMsg = "⚠️ 装甲破損";
      this.armorStatusText.setFill("#ff6666"); // 赤色
      this.metalEffect.setVisible(false);
    }
    
    this.armorStatusText.setText(statusMsg);
    
    if (this.weaknessText) {
      this.weaknessText.setText("弱点: ⚡雷魔法 (右→左→右→左)");
    }
  }

  /**
   * プレイヤーの行動を処理する (engine.jsから呼ばれる)
   * @param {string} action - 行動の種類
   * @param {Object} parameters - 追加パラメータ
   */
  handlePlayerAction(action, parameters = {}) {
    if (this.battleEnded) return;
    
    console.log(`BattleScene7 handling player action: ${action}`, parameters);
    
    switch (action) {
      case "Attack":
        // 通常攻撃処理
        this.playerAttack();
        break;
        
      case "Heal":
        // 回復処理
        this.playerHeal(parameters.amount || 10);
        break;
        
      case "CastSpell":
        // 魔法詠唱処理
        const { spell, success } = parameters;
        if (success) {
          this.playerCastSpell(spell);
        } else {
          this.ui.log("魔法の詠唱に失敗しました");
        }
        break;
          case "Wait":
        // 待機処理
        this.playerWait(parameters.seconds || 1);
        break;
        
      case "BrewAntidote":
        // 解毒薬調合処理（Stage7では通常使用しないが、互換性のため）
        if (typeof this.brewAntidote === 'function') {
          this.brewAntidote();
        } else {
          this.ui.log("解毒薬調合はこのステージでは使用できません");
        }
        break;
        
      case "UsePotion":
        // ポーション使用処理（Stage7では通常使用しないが、互換性のため）
        const potionType = parameters.potion_type || parameters.potionType || "healing";
        if (typeof this.usePotion === 'function') {
          this.usePotion(potionType);
        } else {
          this.ui.log("ポーション使用はこのステージでは使用できません");
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
          this.handleEnemyTurn();
        }
      });
    }
  }

  // プレイヤーの攻撃処理
  playerAttack() {
    console.log("BattleScene7.playerAttack called");
    
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
        // 攻撃エフェクト
        const attackEffect = this.add.circle(this.enemy.x || this.enemySprite.x, this.enemy.y || this.enemySprite.y, 60, 0xffff00, 0.8);
        this.tweens.add({
          targets: attackEffect,
          scaleX: 1.5,
          scaleY: 1.5,
          alpha: 0,
          duration: 600,
          onComplete: () => attackEffect.destroy()
        });
      }
    });
    
    // ダメージ計算（装甲モードでは大幅減少）
    let damage = this.normalAttackDamage;
    if (this.armorMode) {
      this.ui.log("装甲に阻まれた！ダメージが大幅に軽減された！");
      
      // 装甲の耐久度を減らす
      this.armorHealth--;
      if (this.armorHealth <= 0) {
        this.armorMode = false;
        this.ui.log("装甲が破損した！");
        this.updateArmorDisplay();
      }
    } else {
      damage = 8; // 装甲破損後は通常ダメージ
    }
    
    this.dealDamageToEnemy(damage);
    this.ui.log(`${damage}ダメージ！`);
    
    // 敵撃破チェック
    if (this.enemy.hp <= 0) {
      this.ui.log(`${this.enemy.name || "敵"}を倒しました！`);
      this.ui.log("ステージ7クリア！雷の魔法をマスターしました！");
      this.battleEnded = true;
      
      // 勝利エフェクト
      const victoryEffect = this.add.circle(this.enemySprite.x, this.enemySprite.y, 100, 0x00ff00, 0.7);
      this.tweens.add({
        targets: victoryEffect,
        scaleX: 3,
        scaleY: 3,
        alpha: 0,
        duration: 2000,
        onComplete: () => victoryEffect.destroy()
      });
      
      this.time.delayedCall(3000, () => {
        this.scene.start("VictoryScene", { stage: 7 });
      });
      return;
    }
  }

  // プレイヤーの回復処理
  async playerHeal(amount = 10) {
    console.log(`BattleScene7.playerHeal called with amount: ${amount}`);
    
    if (this.battleEnded) return;
    
    this.ui.log(`回復！HPが${amount}回復します`);
    
    // 回復エフェクト
    const healEffect = this.add.circle(this.playerSprite.x, this.playerSprite.y, 40, 0x00ff00, 0.6);
    this.tweens.add({
      targets: healEffect,
      scaleX: 2,
      scaleY: 2,
      alpha: 0,
      duration: 1000,
      onComplete: () => healEffect.destroy()
    });
    
    // HP回復
    this.player.hp = Math.min(100, this.player.hp + amount);
    this.updateHP(this.player.hp, this.enemy.hp);
  }

  // プレイヤーの魔法詠唱処理
  playerCastSpell(spell) {
    console.log(`BattleScene7.playerCastSpell called with spell: ${spell}`);
    
    if (this.battleEnded) return;
    
    let damage = 0;
    let spellName = "";
    let effectColor = 0xffffff;
    
    switch (spell) {
      case "FIRE":
        damage = this.fireSpellDamage;
        spellName = "炎の魔法";
        effectColor = 0xff3300;
        if (this.armorMode) {
          this.ui.log("炎の魔法！しかし装甲に阻まれた！");
          this.armorHealth--;
        } else {
          this.ui.log("炎の魔法！");
          damage = 12; // 装甲破損後は通常ダメージ
        }
        break;
        
      case "ICE":
        damage = this.iceSpellDamage;
        spellName = "氷の魔法";
        effectColor = 0x44aaff;
        if (this.armorMode) {
          this.ui.log("氷の魔法！しかし装甲に阻まれた！");
          this.armorHealth--;
        } else {
          this.ui.log("氷の魔法！");
          damage = 10; // 装甲破損後は通常ダメージ
        }
        break;
        
      case "THUNDER":
        damage = this.thunderSpellDamage;
        spellName = "雷の魔法";
        effectColor = 0xffff00;
        this.ui.log("⚡雷の魔法！メタルスライムの弱点を突いた！");
        if (this.armorMode) {
          // 雷魔法は装甲を一気に破壊
          this.armorMode = false;
          this.ui.log("装甲が雷で破壊された！");
          this.updateArmorDisplay();
        }
        break;
        
      default:
        damage = 5;
        spellName = "魔法";
        effectColor = 0xffffff;
    }
    
    // 装甲の耐久度チェック
    if (this.armorMode && this.armorHealth <= 0 && spell !== "THUNDER") {
      this.armorMode = false;
      this.ui.log("装甲が破損した！");
      this.updateArmorDisplay();
    }
    
    // 魔法エフェクト
    const magicEffect = this.add.circle(this.enemySprite.x, this.enemySprite.y, 80, effectColor, 0.7);
    
    // 雷魔法の場合は特別なエフェクト
    if (spell === "THUNDER") {
      // 雷のジグザグエフェクト
      const lightning = this.add.graphics();
      lightning.lineStyle(4, 0xffff00, 1);
      lightning.beginPath();
      
      let startX = this.playerSprite.x;
      let startY = this.playerSprite.y;
      let endX = this.enemySprite.x;
      let endY = this.enemySprite.y;
      
      // ジグザグのライン
      lightning.moveTo(startX, startY);
      for (let i = 1; i <= 5; i++) {
        const x = startX + (endX - startX) * (i / 5) + (Math.random() - 0.5) * 30;
        const y = startY + (endY - startY) * (i / 5) + (Math.random() - 0.5) * 30;
        lightning.lineTo(x, y);
      }
      lightning.lineTo(endX, endY);
      lightning.strokePath();
      
      this.tweens.add({
        targets: lightning,
        alpha: 0,
        duration: 500,
        onComplete: () => lightning.destroy()
      });
    }
    
    this.tweens.add({
      targets: magicEffect,
      scaleX: 1.8,
      scaleY: 1.8,
      alpha: 0,
      duration: 1000,
      onComplete: () => magicEffect.destroy()
    });
    
    // ダメージ適用
    this.dealDamageToEnemy(damage);
    this.ui.log(`${damage}ダメージ！`);
    
    // 敵撃破チェック
    if (this.enemy.hp <= 0) {
      this.ui.log(`${this.enemy.name || "敵"}を倒しました！`);
      this.ui.log("ステージ7クリア！雷の魔法をマスターしました！");
      this.battleEnded = true;
      
      this.time.delayedCall(3000, () => {
        this.scene.start("VictoryScene", { stage: 7 });
      });
      return;
    }
  }

  // プレイヤーの待機処理
  playerWait(seconds = 1) {
    console.log(`BattleScene7.playerWait called with seconds: ${seconds}`);
    
    if (this.battleEnded) return;
    
    this.ui.log(`${seconds}秒間待機中...`);
    
    // 待機エフェクト
    const waitEffect = this.add.circle(this.playerSprite.x, this.playerSprite.y, 30, 0xffffff, 0.5);
    this.tweens.add({
      targets: waitEffect,
      scaleX: 1.5,
      scaleY: 1.5,
      alpha: 0,
      duration: seconds * 1000,
      onComplete: () => waitEffect.destroy()
    });
  }

  // 敵のターン処理（メタルスライム専用）
  async handleEnemyTurn() {
    if (!this.enemy || this.enemy.hp <= 0 || this.battleEnded) return;
    
    // メタルスライムの攻撃パターン
    const attackType = Math.random();
    
    if (attackType < 0.4) {
      // 体当たり攻撃（40%）
      this.ui.log(`${this.enemy.name || "敵"}の体当たり！`);
      
      const attackEffect = this.add.circle(400, 300, 80, 0xc0c0c0, 0.8);
      this.tweens.add({
        targets: attackEffect,
        scaleX: 1.5,
        scaleY: 1.5,
        alpha: 0,
        duration: 800,
        onComplete: () => attackEffect.destroy()
      });
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const damage = Math.floor(Math.random() * 8) + 6; // 6-13ダメージ
      this.player.hp = Math.max(0, this.player.hp - damage);
      this.ui.log(`${damage}ダメージを受けた！`);
      
    } else if (attackType < 0.7) {
      // 金属片攻撃（30%）
      this.ui.log(`${this.enemy.name || "敵"}の金属片攻撃！`);
      
      // 複数の金属片エフェクト
      for (let i = 0; i < 3; i++) {
        const shard = this.add.circle(
          this.enemySprite.x + (Math.random() - 0.5) * 100,
          this.enemySprite.y + (Math.random() - 0.5) * 100,
          5, 0xc0c0c0, 0.9
        );
        
        this.tweens.add({
          targets: shard,
          x: 200 + Math.random() * 100,
          y: 300 + Math.random() * 100,
          duration: 800 + i * 200,
          onComplete: () => shard.destroy()
        });
      }
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const damage = Math.floor(Math.random() * 6) + 4; // 4-9ダメージ
      this.player.hp = Math.max(0, this.player.hp - damage);
      this.ui.log(`${damage}ダメージを受けた！`);
      
    } else {
      // 装甲修復（30%、装甲破損時のみ）
      if (!this.armorMode) {
        this.ui.log(`${this.enemy.name || "敵"}が装甲を修復している！`);
        
        const repairEffect = this.add.circle(this.enemySprite.x, this.enemySprite.y, 100, 0x00ff00, 0.3);
        this.tweens.add({
          targets: repairEffect,
          scaleX: 2,
          scaleY: 2,
          alpha: 0,
          duration: 1500,
          onComplete: () => repairEffect.destroy()
        });
        
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        this.armorMode = true;
        this.armorHealth = 2; // 部分修復
        this.ui.log("装甲が部分的に修復された！");
        this.updateArmorDisplay();
      } else {
        // 装甲が健在なら通常攻撃
        this.ui.log(`${this.enemy.name || "敵"}の体当たり！`);
        const damage = Math.floor(Math.random() * 8) + 6;
        this.player.hp = Math.max(0, this.player.hp - damage);
        this.ui.log(`${damage}ダメージを受けた！`);
      }
    }
    
    this.updateHP(this.player.hp, this.enemy.hp);
    
    // 戦闘終了チェック
    if (this.player.hp <= 0) {
      this.battleEnded = true;
      this.ui.log("プレイヤーの敗北...");
      this.gameOver(false);
      return;
    }
    
    this.isPlayerTurn = true;
  }

  // 敵にダメージを与える処理
  dealDamageToEnemy(damage) {
    if (!this.enemy) return false;
    
    this.enemy.hp = Math.max(0, this.enemy.hp - damage);
    this.updateHP(this.player.hp, this.enemy.hp);
    
    // 敵のダメージエフェクト
    this.enemySprite.setTint(0xff0000);
    this.time.delayedCall(200, () => {
      this.enemySprite.clearTint();
    });
    
    return this.enemy.hp > 0;
  }

  // BattleScene7専用のshowBlockEditor実装
  showBlockEditor() {
    // 親クラスのメソッドを呼び出す
    super.showBlockEditor();
    
    console.log("BattleScene7: showing block editor specifically for Stage 7");
    
    // Stage7で特別に必要な設定があれば追加
    const runButton = document.getElementById("runButton");
    if (runButton) {
      console.log("Ensuring run button is visible and enabled for Stage7Battle");
      runButton.style.display = 'block';
      runButton.disabled = false;
      
      // イベントリスナーが複数追加されないよう、一度クローンして置き換え
      const newRunButton = runButton.cloneNode(true);
      runButton.parentNode.replaceChild(newRunButton, runButton);
      
      // 改めてイベントリスナーを追加
      newRunButton.addEventListener("click", () => {
        console.log("Run button clicked directly in Stage7Battle");
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

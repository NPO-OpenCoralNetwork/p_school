import Phaser from "phaser";
import { Enemy } from "./enemy";
import { Player } from "./player";
import { UI } from "./ui";
import { BattleScene } from "./battle";

/**
 * ステージ6「薬の調合」のバトルシーン
 * 
 * 敵: ポイズンコング（HP: 35、強力な毒攻撃）
 * 使用可能ブロック: 攻撃、解毒薬調合、薬使用、魔法詠唱（炎、氷）
 * 目標: 毒攻撃に対応しながら敵を倒す
 * 学習内容: 薬学、状態異常への対処、新機能の組み合わせ
 */
export class BattleScene6 extends BattleScene {
  constructor() {
    super({ key: "Stage6Battle" });
    
    // ステージ6の設定を初期化
    this.settings = {
      background: 'laboratory',  // 研究室の背景
      enemy: 'poisonkong',       // ポイズンコング
      scratchMode: true,         // スクラッチブロックを有効にする
      stageNumber: 6
    };
    
    // プレイヤーの毒状態管理
    this.playerPoisoned = false;
    this.poisonDamage = 3;
    this.poisonTurns = 0;
    
    // 薬の在庫管理
    this.antidotes = 0;
    this.healingPotions = 0;
    this.boostPotions = 0;
    
    // UI要素
    this.statusText = null;
    this.inventoryText = null;
    this.poisonEffect = null;
    
    // バトル状態管理
    this.battleEnded = false;
    this.isPlayerTurn = true;
  }
  create() {
    try {
      console.log("BattleScene6 create method starting");
      
      // 初期化フラグ
      this.battleInitialized = false;
      
      // シーンがアクティブであることを確認
      console.log("Setting scene state as active");
      this.scene.setActive(true);
      this.scene.setVisible(true);
      
      // 親クラスのcreateメソッドを呼び出す
      super.create();
      
      // scratchModeがtrueなので、ブロックエディターが表示されているか確認
      console.log("BattleScene6 scratchMode:", this.settings.scratchMode);
      if (this.settings.scratchMode) {
        console.log("Ensuring block editor is visible in BattleScene6");
        // 少し遅延してから確実にブロックエディターを表示
        this.time.delayedCall(100, () => {
          this.showBlockEditor();
        });
      }
      
      console.log("BattleScene6 create() called");
      
      // ステージ6特有の設定
      this.setupStage6();
      
      // シーン準備完了のログ
      console.log("BattleScene6 creation complete, ready for commands");
      
      // メッセージ要素があれば更新
      const messageElement = document.getElementById('message');
      if (messageElement) {
        messageElement.textContent = 'ステージ6「薬の調合」の準備完了！';
      }
        } catch (error) {
      console.error("Critical error in BattleScene6.create():", error);
      
      // エラーメッセージを表示
      const messageElement = document.getElementById('message');
      if (messageElement) {
        messageElement.innerHTML = 'ゲームの初期化中にエラーが発生しました。<br><button onclick="location.reload()">ページを再読み込み</button>';
      }
    }
  }
  setupStage6() {
    console.log("Setting up Stage6Battle scene");
    
    // 敵キャラクターの設定を変更（BattleScene5のパターンを参考）
    if (this.enemy) {
      this.enemy.name = "ポイズンコング";
      this.enemy.maxHp = 35;
      this.enemy.hp = 35;
      
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
    
    // プレイヤー状態表示
    this.statusText = this.add.text(50, 100, "", {
      fontSize: "16px",
      fill: "#ffff00",
      fontFamily: "Arial"
    });
    
    // 薬の在庫表示
    this.inventoryText = this.add.text(50, 150, "", {
      fontSize: "16px",
      fill: "#00ff00",
      fontFamily: "Arial"
    });
    
    // 毒エフェクト（非表示で初期化）
    this.poisonEffect = this.add.circle(400, 300, 300, 0x8e24aa, 0.3);
    this.poisonEffect.setVisible(false);
    
    // 初期状態更新
    this.updateStatusDisplay();
    this.updateInventoryDisplay();
    
    // 背景色を変更（毒々しい紫）
    this.cameras.main.setBackgroundColor(0x2d1b4e);
      // 利用可能なブロックを設定
    this.setupAvailableBlocks();
    
    // 戦闘開始メッセージ
    if (this.ui && typeof this.ui.log === 'function') {
      try {
        this.ui.log("ポイズンコングが現れた！");
        this.ui.log("毒攻撃に注意！解毒薬を調合して戦え！");
      } catch (error) {
        console.error("Error adding log in setupStage6:", error);
      }
    }
  }

  setupAvailableBlocks() {
    // ステージ6で利用できるブロックの種類を設定
    this.availableBlocks = [
      'attack',
      'brew_antidote',
      'use_potion',
      'cast_fire_magic',
      'cast_ice_magic',
      'wave_left_hand',
      'wave_right_hand'
    ];
  }

  updateStatusDisplay() {
    if (!this.statusText) return;
    
    let statusMsg = "";
    if (this.playerPoisoned) {
      statusMsg = `⚠️ 毒状態 (残り${this.poisonTurns}ターン)`;
      this.statusText.setFill("#ff00ff"); // マゼンタ色
    } else {
      statusMsg = "正常";
      this.statusText.setFill("#00ff00"); // 緑色
    }
    
    this.statusText.setText(`状態: ${statusMsg}`);
    
    // 毒エフェクトの表示切り替え
    if (this.poisonEffect) {
      this.poisonEffect.setVisible(this.playerPoisoned);
    }
  }

  updateInventoryDisplay() {
    if (!this.inventoryText) return;
    
    const inventoryMsg = `薬の在庫:\n解毒薬: ${this.antidotes}\n回復薬: ${this.healingPotions}\n強化薬: ${this.boostPotions}`;
    this.inventoryText.setText(inventoryMsg);
  }

  // 解毒薬調合アクション
  async brewAntidote() {
    this.ui.log("解毒薬を調合しています...");
    
    // 調合エフェクト
    const brewEffect = this.add.circle(400, 300, 50, 0x00ff00, 0.7);
    this.tweens.add({
      targets: brewEffect,
      scaleX: 2,
      scaleY: 2,
      alpha: 0,
      duration: 1000,
      onComplete: () => brewEffect.destroy()
    });
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    this.antidotes++;
    this.updateInventoryDisplay();
    this.ui.log("解毒薬を1個調合しました！");
  }

  // 薬使用アクション
  async usePotion(potionType) {
    let success = false;
    
    switch (potionType) {
      case "ANTIDOTE":
        if (this.antidotes > 0) {
          this.antidotes--;
          if (this.playerPoisoned) {
            this.playerPoisoned = false;
            this.poisonTurns = 0;
            this.ui.log("解毒薬を使用！毒が治りました！");
          } else {
            this.ui.log("解毒薬を使用しましたが、毒状態ではありません");
          }
          success = true;
        } else {
          this.ui.log("解毒薬が足りません！");
        }
        break;
        
      case "HEALING":
        if (this.healingPotions > 0) {
          this.healingPotions--;
          const healAmount = 25;
          await this.player.heal(healAmount);
          this.ui.log(`回復薬を使用！HPが${healAmount}回復しました！`);
          success = true;
        } else {
          this.ui.log("回復薬が足りません！");
        }
        break;
        
      case "BOOST":
        if (this.boostPotions > 0) {
          this.boostPotions--;
          this.ui.log("強化薬を使用！次の攻撃が強化されます！");
          // TODO: 実際の強化効果の実装
          success = true;
        } else {
          this.ui.log("強化薬が足りません！");
        }
        break;
        
      default:
        this.ui.log("不明な薬です");
    }
    
    if (success) {
      this.updateInventoryDisplay();
      this.updateStatusDisplay();
      
      // 使用エフェクト
      const useEffect = this.add.circle(400, 300, 30, 0x00ffff, 0.8);
      this.tweens.add({
        targets: useEffect,
        scaleX: 1.5,
        scaleY: 1.5,
        alpha: 0,
        duration: 800,
        onComplete: () => useEffect.destroy()
      });
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  // プレイヤーの攻撃処理（Stage6専用）- engine.jsから呼ばれる
  async handlePlayerAttack() {
    console.log("BattleScene6.handlePlayerAttack called");
    this.playerAttack();
  }
  // 敵のターン処理（毒攻撃専用）
  async handleEnemyTurn() {
    if (!this.enemy || this.enemy.hp <= 0 || this.battleEnded) return;
    
    // ランダムで毒攻撃か通常攻撃
    const poisonAttack = Math.random() < 0.6; // 60%の確率で毒攻撃
    
    if (poisonAttack) {
      this.ui.log(`${this.enemy.name || "敵"}の毒攻撃！`);
      
      // 毒攻撃エフェクト
      const poisonCloud = this.add.circle(400, 300, 100, 0x8e24aa, 0.6);
      this.tweens.add({
        targets: poisonCloud,
        scaleX: 2,
        scaleY: 2,
        alpha: 0,
        duration: 1500,
        onComplete: () => poisonCloud.destroy()
      });
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 通常ダメージ
      const damage = Math.floor(Math.random() * 8) + 5; // 5-12ダメージ
      this.player.hp = Math.max(0, this.player.hp - damage);
      this.ui.log(`${damage}ダメージを受けた！`);
      
      // 毒状態付与
      if (!this.playerPoisoned) {
        this.playerPoisoned = true;
        this.poisonTurns = 3;
        this.ui.log("毒に侵されました！毎ターン3ダメージを受けます！");
      } else {
        this.poisonTurns = Math.max(this.poisonTurns, 3); // 毒ターン数をリセット
        this.ui.log("毒が強化されました！");
      }
      
    } else {
      this.ui.log(`${this.enemy.name || "敵"}の体当たり攻撃！`);
      
      // 通常攻撃エフェクト
      const attackEffect = this.add.circle(400, 300, 80, 0xff0000, 0.7);
      this.tweens.add({
        targets: attackEffect,
        scaleX: 1.5,
        scaleY: 1.5,
        alpha: 0,
        duration: 800,
        onComplete: () => attackEffect.destroy()
      });
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const damage = Math.floor(Math.random() * 12) + 8; // 8-19ダメージ
      this.player.hp = Math.max(0, this.player.hp - damage);
      this.ui.log(`${damage}ダメージを受けた！`);
    }
    
    // 毒ダメージ処理
    if (this.playerPoisoned) {
      await new Promise(resolve => setTimeout(resolve, 500));
      this.ui.log(`毒により${this.poisonDamage}ダメージ！`);
      this.player.hp = Math.max(0, this.player.hp - this.poisonDamage);
      
      this.poisonTurns--;
      if (this.poisonTurns <= 0) {
        this.playerPoisoned = false;
        this.ui.log("毒の効果が切れました");
      }
    }
    
    this.updateStatusDisplay();
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

  /**
   * プレイヤーの行動を処理する (engine.jsから呼ばれる)
   * @param {string} action - 行動の種類
   * @param {Object} parameters - 追加パラメータ
   */
  handlePlayerAction(action, parameters = {}) {
    if (this.battleEnded) return;
    
    console.log(`BattleScene6 handling player action: ${action}`, parameters);
    
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
        // 解毒薬調合処理
        this.brewAntidote();
        break;
          case "UsePotion":
        // 薬使用処理
        const potionType = parameters.potion_type || parameters.potionType || "ANTIDOTE";
        this.usePotion(potionType);
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
    console.log("BattleScene6.playerAttack called");
    
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
    
    // ダメージ計算と適用
    const damage = Math.floor(Math.random() * 8) + 7; // 7-14ダメージ
    this.dealDamageToEnemy(damage);
    this.ui.log(`${damage}ダメージ！`);
    
    // 敵撃破チェック
    if (this.enemy.hp <= 0) {
      this.ui.log(`${this.enemy.name || "敵"}を倒しました！`);
      this.ui.log("ステージ6クリア！薬学をマスターしました！");
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
        this.scene.start("VictoryScene", { stage: 6 });
      });
      return;
    }
  }

  // プレイヤーの回復処理
  async playerHeal(amount = 10) {
    console.log(`BattleScene6.playerHeal called with amount: ${amount}`);
    
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
    console.log(`BattleScene6.playerCastSpell called with spell: ${spell}`);
    
    if (this.battleEnded) return;
    
    let damage = 0;
    let spellName = "";
    
    switch (spell) {
      case "FIRE":
        damage = 15;
        spellName = "炎の魔法";
        break;
      case "ICE":
        damage = 12;
        spellName = "氷の魔法";
        break;
      case "THUNDER":
        damage = 18;
        spellName = "雷の魔法";
        break;
      default:
        damage = 10;
        spellName = "魔法";
    }
    
    this.ui.log(`${spellName}が発動！${damage}ダメージ！`);
    
    // 魔法エフェクト
    const magicEffect = this.add.circle(this.enemySprite.x, this.enemySprite.y, 80, 
      spell === "FIRE" ? 0xff3300 : spell === "ICE" ? 0x44aaff : 0xffff00, 0.7);
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
    
    // 敵撃破チェック
    if (this.enemy.hp <= 0) {
      this.ui.log(`${this.enemy.name || "敵"}を倒しました！`);
      this.ui.log("ステージ6クリア！薬学をマスターしました！");
      this.battleEnded = true;
      
      this.time.delayedCall(3000, () => {
        this.scene.start("VictoryScene", { stage: 6 });
      });
      return;
    }
  }

  // プレイヤーの待機処理
  playerWait(seconds = 1) {
    console.log(`BattleScene6.playerWait called with seconds: ${seconds}`);
    
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

  // BattleScene6専用のshowBlockEditor実装
  showBlockEditor() {
    // 親クラスのメソッドを呼び出す
    super.showBlockEditor();
    
    console.log("BattleScene6: showing block editor specifically for Stage 6");
    
    // Stage6で特別に必要な設定があれば追加
    const runButton = document.getElementById("runButton");
    if (runButton) {
      console.log("Ensuring run button is visible and enabled for Stage6Battle");
      runButton.style.display = 'block';
      runButton.disabled = false;
      
      // イベントリスナーが複数追加されないよう、一度クローンして置き換え
      const newRunButton = runButton.cloneNode(true);
      runButton.parentNode.replaceChild(newRunButton, runButton);
      
      // 改めてイベントリスナーを追加
      newRunButton.addEventListener("click", () => {
        console.log("Run button clicked directly in Stage6Battle");
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

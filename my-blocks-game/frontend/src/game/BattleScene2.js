import Phaser from 'phaser';
import { BattleScene } from './battle';

// ステージ2「回復の魔法」用のバトルシーン
export class BattleScene2 extends BattleScene {
  constructor() {
    // キーを 'BattleScene2' から 'Stage2Battle' に変更して utils.js と一致させる
    super({ key: 'Stage2Battle' });
    
    // ステージ2の設定を初期化
    this.settings = {
      background: 'swamp',
      enemy: 'poisonmoth',
      stageNumber: 2
    };
  }

  create() {
    // 親クラスのcreateメソッドを呼び出し
    super.create();
    
    // ステージ2専用のセットアップ
    this.setupStage2();
    
    // バトル開始メッセージを更新
    this.addLog(`ステージ2「回復の魔法」が始まりました！毒を持つ${this.settings.enemy}と対決します！`);
  }

  setupStage2() {
    // ステージ2特有の背景に変更（沼地っぽい暗い緑色）
    this.cameras.main.setBackgroundColor(0x1a3300);
    
    // 敵の見た目を「ポイズンモス」に合わせる
    this.enemySprite.setTint(0x99ff66); // 緑色がかった色合い
    this.enemySprite.rotation = Math.PI / 6; // 少し傾ける
    
    // 敵のHPを15に設定（begginer.jsonに合わせる）
    if (this.enemy) {
      this.enemy.maxHp = 15;
      this.enemy.hp = 15;
    }
    
    // 敵のHP表示を更新
    this.enemyHPText.setText(`HP: 15/15`);
    this.drawEnemyHP(15);
    
    // 毒霧のエフェクトを追加
    this.createPoisonEffect();
    
    // 使用可能なブロックを設定（攻撃と回復）
    this.setupAvailableBlocks();
  }

  createPoisonEffect() {
    // 毒霧のエフェクトを作成
    const poisonFog = this.add.graphics();
    poisonFog.fillStyle(0x99ff66, 0.2);
    
    // 画面上部に霧を描画
    poisonFog.fillRect(0, 0, 800, 200);
    
    // 霧のアニメーション
    this.tweens.add({
      targets: poisonFog,
      alpha: { from: 0.2, to: 0.4 },
      duration: 2000,
      yoyo: true,
      repeat: -1
    });
    
    // 毒の粒子を追加
    for (let i = 0; i < 10; i++) {
      const x = Math.random() * 800;
      const y = Math.random() * 150;
      
      const particle = this.add.graphics();
      particle.fillStyle(0x99ff66, 0.6);
      particle.fillCircle(x, y, 3);
      
      // 粒子のアニメーション
      this.tweens.add({
        targets: particle,
        y: `+=${20 + Math.random() * 30}`,
        alpha: { from: 0.6, to: 0 },
        duration: 1500 + Math.random() * 1000,
        repeat: -1
      });
    }
  }
  setupAvailableBlocks() {
    // ブロックエディタで使用可能なブロックを設定する処理
    // 実際の実装はBlockly周りのコードに依存する
    
    // この実装はUI側で行われることを想定
    console.log("ステージ2で利用可能なブロック: 攻撃, 回復");
  }
  
  // 魔法詠唱のポップアップを表示（Stage2用にカスタマイズ）
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
    const title = this.add.text(0, -130, '回復魔法を習得', {
      fontFamily: 'Verdana, "メイリオ", sans-serif',
      fontSize: '28px',
      fontStyle: 'bold',
      fill: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3,
      shadow: { offsetX: 2, offsetY: 2, color: '#000', blur: 3, fill: true }
    }).setOrigin(0.5);
    
    // コンテンツ要素
    
    // 攻撃アイコン
    const attackIcon = this.add.graphics();
    attackIcon.fillStyle(0xff3300, 0.8);
    attackIcon.fillCircle(-150, -60, 15);
    
    // 攻撃コマンドの説明
    const attackText = this.add.text(-120, -60, '「攻撃」: 敵に基本攻撃を行います', {
      fontFamily: 'Verdana, "メイリオ", sans-serif',
      fontSize: '18px',
      fill: '#ff9966',
      shadow: { offsetX: 1, offsetY: 1, color: '#000', blur: 1, fill: true }
    }).setOrigin(0, 0.5);
    
    // 回復アイコン
    const healIcon = this.add.graphics();
    healIcon.fillStyle(0x00ff00, 0.8);
    healIcon.fillCircle(-150, 0, 15);
    
    // 回復コマンドの説明
    const healText = this.add.text(-120, 0, '「回復」: HPを10〜15回復します', {
      fontFamily: 'Verdana, "メイリオ", sans-serif',
      fontSize: '18px',
      fill: '#99ff99',
      shadow: { offsetX: 1, offsetY: 1, color: '#000', blur: 1, fill: true }
    }).setOrigin(0, 0.5);
    
    // 解説
    const stageInfo = this.add.text(0, 60, '長期戦では回復が重要です。\nHPが低くなったら回復魔法を使いましょう。\n\n毒モスの攻撃には注意が必要です！', {
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
    
    // コンテナに要素を追加
    container.add([popupBg, titleBg, title, buttonBg, closeButton, 
                  attackIcon, attackText, healIcon, healText, stageInfo]);
    
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

  // プレイヤーへの毒攻撃処理をオーバーライド
  async enemyTurn() {
    this.addLog("敵の番です...");
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // 毒攻撃の確率（40%）
    const usePoisonAttack = Math.random() < 0.4;
    
    if (usePoisonAttack) {
      // 毒攻撃
      this.addLog("ポイズンモスの毒の粉！");
      
      // 毒攻撃アニメーション
      const poisonCloud = this.add.graphics();
      poisonCloud.fillStyle(0x99ff66, 0.6);
      poisonCloud.fillCircle(this.enemySprite.x, this.enemySprite.y, 30);
      
      // 毒雲が広がるアニメーション
      this.tweens.add({
        targets: poisonCloud,
        scale: 3,
        alpha: 0,
        duration: 1000,
        onComplete: () => poisonCloud.destroy()
      });
      
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // プレイヤーに毒ダメージ（2〜4）
      const poisonDamage = 2 + Math.floor(Math.random() * 3);
      this.player.hp = Math.max(0, this.player.hp - poisonDamage);
      
      // プレイヤーの表示を一時的に緑色に
      this.playerSprite.setTint(0x99ff66);
      setTimeout(() => this.playerSprite.clearTint(), 500);
      
      this.addLog(`毒の粉で${poisonDamage}ダメージを受けた！`);
      
    } else {
      // 通常攻撃
      this.addLog("ポイズンモスの攻撃！");
      
      // 攻撃アニメーション
      this.enemySprite.x -= 20;
      await new Promise(resolve => setTimeout(resolve, 100));
      this.enemySprite.x += 20;
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // プレイヤーにダメージ（1〜3）
      const damage = 1 + Math.floor(Math.random() * 3);
      this.player.hp = Math.max(0, this.player.hp - damage);
      
      this.addLog(`${damage}ダメージを受けた！`);
    }
    
    // HP表示を更新
    this.updateHP(this.player.hp, this.enemy.hp);
    
    // プレイヤーのHPが0になったらゲームオーバー
    if (this.player.hp <= 0) {
      this.addLog("プレイヤーは倒れてしまった...");
      this.gameOver(false); // false = プレイヤー敗北
      return false;
    }
    
    return true;
  }
  // 回復魔法の実装
  async heal() {
    // 回復量（10〜15）
    const healAmount = 10 + Math.floor(Math.random() * 6);
    
    // 回復エフェクト
    const healEffect = this.add.graphics();
    healEffect.fillStyle(0x00ff00, 0.3);
    healEffect.fillCircle(this.playerSprite.x, this.playerSprite.y, 50);
    
    // 回復の光が上昇するアニメーション
    const particles = [];
    for (let i = 0; i < 8; i++) {
      const particle = this.add.graphics();
      particle.fillStyle(0xaaffaa, 0.8);
      particle.fillCircle(0, 0, 5);
      
      // 初期位置
      particle.x = this.playerSprite.x + (Math.random() * 50 - 25);
      particle.y = this.playerSprite.y;
      
      // アニメーション
      this.tweens.add({
        targets: particle,
        y: this.playerSprite.y - 80 - Math.random() * 30,
        alpha: 0,
        duration: 1000,
        onComplete: () => particle.destroy()
      });
      
      particles.push(particle);
    }
    
    // 回復エフェクトのアニメーション
    this.tweens.add({
      targets: healEffect,
      alpha: 0,
      scale: 1.5,
      duration: 800,
      onComplete: () => healEffect.destroy()
    });
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // HP回復（最大値を超えないように）
    this.player.hp = Math.min(100, this.player.hp + healAmount);
    this.addLog(`回復魔法を使った！HPが${healAmount}回復した！`);
    
    // HP表示を更新
    this.updateHP(this.player.hp, this.enemy.hp);
    
    return true;
  }
    // engine.jsから呼ばれる回復処理用メソッド
  async healPlayer(amount) {
    console.log(`BattleScene2 healPlayer called with amount: ${amount}`);
    // このシーン専用の回復処理を実行
    return await this.heal();
  }
  
  // BattleScene2専用のshowBlockEditor実装
  showBlockEditor() {
    // 親クラスのメソッドを呼び出す
    super.showBlockEditor();
    
    console.log("BattleScene2: showing block editor specifically for Stage 2");
    
    // Stage2で特別に必要な設定があれば追加
    const runButton = document.getElementById("runButton");
    if (runButton) {
      console.log("Ensuring run button is visible and enabled for Stage2Battle");
      runButton.style.display = 'block';
      runButton.disabled = false;
      
      // イベントリスナーが複数追加されないよう、一度クローンして置き換え
      const newRunButton = runButton.cloneNode(true);
      runButton.parentNode.replaceChild(newRunButton, runButton);
      
      // 改めてイベントリスナーを追加
      newRunButton.addEventListener("click", () => {
        console.log("Run button clicked directly in Stage2Battle");
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
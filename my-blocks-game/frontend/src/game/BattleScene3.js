import Phaser from 'phaser';
import { BattleScene } from './battle';

// ステージ3「魔法の詠唱」用のバトルシーン
export class BattleScene3 extends BattleScene {
  constructor() {
    // キーを 'Stage3Battle' に設定
    super({ key: 'Stage3Battle' });
    
    // ステージ3の設定を初期化
    this.settings = {
      background: 'volcano',  // 火山地帯の背景
      enemy: 'firegoblin',    // ファイアゴブリン
      stageNumber: 3
    };
    
    // 魔法詠唱の状態を追跡
    this.spellCastState = {
      sequence: [], // 詠唱シーケンス（右手、左手の順序を記録）
      isActive: false,
      requiredPattern: ['right', 'right', 'left'] // 炎の魔法のパターン: 右手→右手→左手
    };
  }

  create() {
    // 親クラスのcreateメソッドを呼び出し
    super.create();
    
    // ステージ3専用のセットアップ
    this.setupStage3();
    
    // バトル開始メッセージを更新
    this.addLog(`ステージ3「魔法の詠唱」が始まりました！炎を操る${this.settings.enemy}と対決します！`);

  }

  setupStage3() {
    // ステージ3特有の背景に変更（火山地帯の赤い背景）
    this.cameras.main.setBackgroundColor(0x661400);
    
    // 敵の見た目を「ファイアゴブリン」に合わせる
    this.enemySprite.setTint(0xff4400); // 赤っぽいオレンジ色
    
    // 敵のHPを20に設定（begginer.jsonに合わせる）
    if (this.enemy) {
      this.enemy.maxHp = 20;
      this.enemy.hp = 20;
    }
    
    // 敵のHP表示を更新
    this.enemyHPText.setText(`HP: 20/20`);
    this.drawEnemyHP(20);
    
    // // 炎のエフェクトを追加
    // this.createFireEffect();
    
    // 使用可能なブロックを設定（攻撃、回復、魔法詠唱（炎））
    this.setupAvailableBlocks();
  }
  createFireEffect() {
    // 炎のエフェクトを作成
    try {
      // 新しいPhaserバージョン用のパーティクル設定
      this.fireParticles = this.add.particles(0, 0, 'particle', {
        x: { min: 0, max: 800 },
        y: 550,
        scale: { start: 0.5, end: 0.1 },
        speed: { min: 50, max: 100 },
        angle: { min: 260, max: 280 },
        alpha: { start: 0.8, end: 0 },
        lifespan: { min: 800, max: 1500 },
        quantity: 2,
        tint: [ 0xff0000, 0xff7700, 0xff9900 ] // 赤からオレンジの色合い
      });
    } catch (e) {
      console.warn("新しいパーティクルシステムに対応していません。従来の方法でエフェクトを作成します", e);
      
      // 従来のパーティクル設定方法
      const emitter = this.add.particles('particle').createEmitter({
        x: 400,
        y: 550,
        speed: { min: 50, max: 100 },
        angle: { min: 260, max: 280 },
        scale: { start: 0.5, end: 0.1 },
        alpha: { start: 0.8, end: 0 },
        lifespan: { min: 800, max: 1500 },
        quantity: 2,
        tint: [ 0xff0000, 0xff7700, 0xff9900 ]
      });
      
      this.fireParticles = emitter;
    }
    
    // 地面からの熱気エフェクト
    this.heatDistortion = this.add.graphics();
    this.heatDistortion.fillStyle(0xff6600, 0.1);
    
    // 地面に熱波を描画
    this.heatDistortion.fillRect(0, 500, 800, 100);
    
    // 熱気のアニメーション
    this.tweens.add({
      targets: this.heatDistortion,
      alpha: { from: 0.1, to: 0.2 },
      duration: 1500,
      yoyo: true,
      repeat: -1
    });
  }
  setupAvailableBlocks() {
    // ブロックエディタで使用可能なブロックを設定する処理
    // 実際の実装はBlockly周りのコードに依存する
    
    // この実装はUI側で行われることを想定
    console.log("ステージ3で利用可能なブロック: 攻撃, 回復, 魔法詠唱（炎）");
  }
  
  // 魔法詠唱のポップアップを表示（Stage3用にカスタマイズ）
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
    
    // コンテンツ要素
    
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
    
    const iceText = this.add.text(-120, 0, '氷の魔法: 左手→左手', {
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
    
    // コンテナに要素を追加
    container.add([popupBg, titleBg, title, buttonBg, closeButton,
                  fireIcon, iceIcon, thunderIcon, fireText, iceText, thunderText]);
    
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
    
    // ヒント表示（現在の詠唱進行状況）
    if (this.spellCastState && this.spellCastState.sequence.length > 0) {
      const hintText = this.add.text(0, -95, `現在の詠唱: ${this.formatSpellSequence()}`, {
        fontFamily: 'Verdana, "メイリオ", sans-serif',
        fontSize: '16px',
        fill: '#ffcc00',
        align: 'center'
      }).setOrigin(0.5);
      
      container.add(hintText);
    }
    
    // 参照を保存
    this.spellPopup = {
      container: container,
      bg: popupBg,
      title: title,
      button: closeButton
    };
  }
  
  // 詠唱シーケンスをフォーマットして表示用のテキストを作成
  formatSpellSequence() {
    if (!this.spellCastState || !this.spellCastState.sequence) return '';
    
    return this.spellCastState.sequence.map(hand => {
      if (hand === 'right') return '右手';
      if (hand === 'left') return '左手';
      return '?';
    }).join(' → ');
  }

  // プレイヤーの行動：魔法詠唱（右手）
  async castSpellRightHand() {
    console.log("右手で魔法を詠唱...");
    this.addLog("右手で魔法を詠唱...");
    
    // 詠唱シーケンスに追加
    this.spellCastState.sequence.push('right');
    
    // 右手の詠唱エフェクト
    const rightHandEffect = this.add.graphics();
    rightHandEffect.fillStyle(0xff4400, 0.4);
    rightHandEffect.fillCircle(this.playerSprite.x + 30, this.playerSprite.y - 20, 15);
    
    // エフェクトのアニメーション
    this.tweens.add({
      targets: rightHandEffect,
      alpha: 0,
      scale: 2,
      duration: 600,
      onComplete: () => rightHandEffect.destroy()
    });
    
    // 詠唱パターンをチェック
    this.checkSpellPattern();
    
    await new Promise(resolve => setTimeout(resolve, 500));
    return true;
  }

  // プレイヤーの行動：魔法詠唱（左手）
  async castSpellLeftHand() {
    console.log("左手で魔法を詠唱...");
    this.addLog("左手で魔法を詠唱...");
    
    // 詠唱シーケンスに追加
    this.spellCastState.sequence.push('left');
    
    // 左手の詠唱エフェクト
    const leftHandEffect = this.add.graphics();
    leftHandEffect.fillStyle(0x44aaff, 0.4); // 青っぽい色
    leftHandEffect.fillCircle(this.playerSprite.x - 30, this.playerSprite.y - 20, 15);
    
    // エフェクトのアニメーション
    this.tweens.add({
      targets: leftHandEffect,
      alpha: 0,
      scale: 2,
      duration: 600,
      onComplete: () => leftHandEffect.destroy()
    });
    
    // 詠唱パターンをチェック
    this.checkSpellPattern();
    
    await new Promise(resolve => setTimeout(resolve, 500));
    return true;
  }

  // 詠唱パターンをチェックして魔法発動
  checkSpellPattern() {
    const sequence = this.spellCastState.sequence;
    const required = this.spellCastState.requiredPattern;
    
    // シーケンスが必要なパターンの長さに達したかチェック
    if (sequence.length >= required.length) {
      // 最新の詠唱シーケンスを取得（必要なパターンの長さ分だけ）
      const latestSequence = sequence.slice(-required.length);
      
      // パターンが一致するかチェック
      const isMatch = latestSequence.every((hand, index) => hand === required[index]);
      
      if (isMatch) {
        // パターンが一致したら炎の魔法を発動
        this.castFireSpell();
        
        // 詠唱シーケンスをリセット
        this.spellCastState.sequence = [];
      }
    }
  }

  // 炎の魔法の発動
  async castFireSpell() {
    console.log("炎の魔法が発動した！");
    this.addLog("炎の魔法が発動した！");
    
    // 炎のエフェクト
    const fireSpell = this.add.graphics();
    fireSpell.fillStyle(0xff2200, 0.6);
    fireSpell.fillCircle(this.playerSprite.x, this.playerSprite.y - 50, 30);
    
    // 火球が飛ぶアニメーション
    this.tweens.add({
      targets: fireSpell,
      x: this.enemySprite.x - this.playerSprite.x,
      y: -(this.playerSprite.y - this.enemySprite.y),
      scaleX: 0.5,
      scaleY: 0.5,
      duration: 500,
      ease: 'Sine.easeOut',
      onComplete: () => {
        // 敵に命中した際の爆発エフェクト
        const explosion = this.add.graphics();
        explosion.fillStyle(0xff5500, 0.8);
        explosion.fillCircle(this.enemySprite.x, this.enemySprite.y, 50);
        
        this.tweens.add({
          targets: explosion,
          alpha: 0,
          scale: 2,
          duration: 800,
          onComplete: () => explosion.destroy()
        });
        
        fireSpell.destroy();
        
        // 敵が炎に弱いので、追加ダメージ
        this.dealFireDamage();
      }
    });
    
    await new Promise(resolve => setTimeout(resolve, 800));
    return true;
  }

  // 炎属性のダメージ処理
  async dealFireDamage() {
    // 基本ダメージ + 炎属性の追加ダメージ（弱点を突く）
    const baseDamage = 5;
    const weaknessBonus = 3; // 弱点ボーナス
    const totalDamage = baseDamage + weaknessBonus;
    
    // 敵にダメージを与える
    this.enemy.hp = Math.max(0, this.enemy.hp - totalDamage);
    
    // 敵のスプライトを赤く点滅させる
    this.enemySprite.setTint(0xff0000);
    setTimeout(() => this.enemySprite.clearTint(), 200);
    
    this.addLog(`炎のダメージ！相手の弱点を突き、${totalDamage}ダメージ与えた！`);
    
    // HP表示を更新
    this.updateHP(this.player.hp, this.enemy.hp);
    
    // 敵のHPが0になったら勝利
    if (this.enemy.hp <= 0) {
      this.addLog(`${this.settings.enemy}を倒した！`);
      this.gameOver(true); // true = プレイヤー勝利
      return false;
    }
    
    return true;
  }

  // 敵の行動
  async enemyTurn() {
    this.addLog("敵の番です...");
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // 火の玉攻撃か通常攻撃をランダムで選択（40%で火の玉攻撃）
    const useFireballAttack = Math.random() < 0.4;
    
    if (useFireballAttack) {
      // 火の玉攻撃
      this.addLog("ファイアゴブリンの火の玉！");
      
      // 火の玉のエフェクト
      const fireball = this.add.graphics();
      fireball.fillStyle(0xff3300, 0.8);
      fireball.fillCircle(this.enemySprite.x, this.enemySprite.y, 15);
      
      // 火の玉が飛ぶアニメーション
      this.tweens.add({
        targets: fireball,
        x: this.playerSprite.x - this.enemySprite.x,
        y: this.playerSprite.y - this.enemySprite.y,
        scale: 1.5,
        duration: 700,
        onComplete: () => {
          // 爆発エフェクト
          const explosion = this.add.graphics();
          explosion.fillStyle(0xff6600, 0.6);
          explosion.fillCircle(this.playerSprite.x, this.playerSprite.y, 30);
          
          this.tweens.add({
            targets: explosion,
            alpha: 0,
            scale: 2,
            duration: 500,
            onComplete: () => explosion.destroy()
          });
          
          fireball.destroy();
        }
      });
      
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // プレイヤーにダメージ（4〜6）
      const fireballDamage = 4 + Math.floor(Math.random() * 3);
      this.player.hp = Math.max(0, this.player.hp - fireballDamage);
      
      this.addLog(`火の玉で${fireballDamage}ダメージを受けた！`);
      
    } else {
      // 通常攻撃
      this.addLog("ファイアゴブリンの攻撃！");
      
      // 攻撃アニメーション
      this.enemySprite.x += 30;
      await new Promise(resolve => setTimeout(resolve, 100));
      this.enemySprite.x -= 30;
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // プレイヤーにダメージ（2〜4）
      const damage = 2 + Math.floor(Math.random() * 3);
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

  // engine.jsから呼ばれる魔法詠唱処理用メソッド（右手）
  async castSpellRight() {
    console.log(`BattleScene3 castSpellRight called`);
    return await this.castSpellRightHand();
  }

  // engine.jsから呼ばれる魔法詠唱処理用メソッド（左手）
  async castSpellLeft() {
    console.log(`BattleScene3 castSpellLeft called`);
    return await this.castSpellLeftHand();
  }
  
  // 回復魔法のメソッドを継承（BattleScene2と同様）
  async healPlayer(amount) {
    console.log(`BattleScene3 healPlayer called with amount: ${amount}`);
    return await this.heal();
  }
    // BattleScene3専用のshowBlockEditor実装
  showBlockEditor() {
    // 親クラスのメソッドを呼び出す
    super.showBlockEditor();
    
    console.log("BattleScene3: showing block editor specifically for Stage 3");
    
    // Stage3で特別に必要な設定があれば追加
    const runButton = document.getElementById("runButton");
    if (runButton) {
      console.log("Ensuring run button is visible and enabled for Stage3Battle");
      runButton.style.display = 'block';
      runButton.disabled = false;
      
      // イベントリスナーが複数追加されないよう、一度クローンして置き換え
      const newRunButton = runButton.cloneNode(true);
      runButton.parentNode.replaceChild(newRunButton, runButton);
      
      // 改めてイベントリスナーを追加
      newRunButton.addEventListener("click", () => {
        console.log("Run button clicked directly in Stage3Battle");
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
  
  // ヒントテキストの表示
  showHint(text) {
    const hintContainer = document.getElementById('hintContainer');
    
    // hintContainerがなければ作成
    if (!hintContainer) {
      const container = document.createElement('div');
      container.id = 'hintContainer';
      container.style.position = 'absolute';
      container.style.bottom = '70px';
      container.style.left = '50%';
      container.style.transform = 'translateX(-50%)';
      container.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
      container.style.color = '#FFFF00';
      container.style.padding = '10px 15px';
      container.style.borderRadius = '5px';
      container.style.fontSize = '16px';
      container.style.fontWeight = 'bold';
      container.style.zIndex = '1000';
      container.textContent = text;
      
      document.body.appendChild(container);
    } else {
      hintContainer.textContent = text;
      hintContainer.style.display = 'block';
    }
  }
}

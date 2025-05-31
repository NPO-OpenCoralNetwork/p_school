import Phaser from 'phaser';
import { BattleScene } from './battle';

// ステージ4「氷の壁」用のバトルシーン
export class BattleScene4 extends BattleScene {
  constructor() {
    // キーを 'Stage4Battle' に設定
    super({ key: 'Stage4Battle' });
    
    // ステージ4の設定を初期化
    this.settings = {
      background: 'snow',     // 雪原の背景
      enemy: 'flamewolf',     // フレイムウルフ
      stageNumber: 4
    };
    
    // 魔法詠唱の状態を追跡
    this.spellCastState = {
      sequence: [],           // 詠唱シーケンス（左手、右手の順序を記録）
      isActive: false,
      requiredPattern: ['left', 'left'] // 氷の魔法のパターン: 左手→左手
    };
  }

  create() {
    // 親クラスのcreateメソッドを呼び出し
    super.create();
    
    // ステージ4専用のセットアップ
    this.setupStage4();
      // バトル開始メッセージを更新
    this.addLog(`ステージ4「氷の壁」が始まりました！灼熱の${this.settings.enemy}と対決します！`);
    this.addLog('📖 魔法の書を参照して、詠唱パターンを確認しましょう');
  }

  setupStage4() {
    // ステージ4特有の背景に変更（雪原の青白い背景）
    this.cameras.main.setBackgroundColor(0xd8e6ff);
    
    // 敵の見た目を「フレイムウルフ」に合わせる
    this.enemySprite.setTint(0xff6600); // オレンジ色
    
    // 敵のHPを25に設定（game-stages-guide.mdに合わせる）
    if (this.enemy) {
      this.enemy.maxHp = 25;
      this.enemy.hp = 25;
    }
    
    // 敵のHP表示を更新
    this.enemyHPText.setText(`HP: 25/25`);
    this.drawEnemyHP(25);
    
    // 炎のエフェクトを追加（フレイムウルフの周囲）
    this.createFlameEffect();
    
    // 使用可能なブロックを設定（攻撃、回復、魔法詠唱（炎、氷））
    this.setupAvailableBlocks();
  }
  createFlameEffect() {
    // Create a flame effect using Phaser 3.60 particle system
    this.flameParticles = this.add.particles(this.enemySprite.x, this.enemySprite.y, {
      key: 'particle',
      speed: { min: 30, max: 60 },
      scale: { start: 0.4, end: 0.1 },
      angle: { min: 0, max: 360 },
      alpha: { start: 0.6, end: 0 },
      lifespan: { min: 600, max: 1200 },
      quantity: 2,
      frequency: 120,
      tint: [ 0xff0000, 0xff6600, 0xff9900 ],
      emitting: true
    });
  }

  setupAvailableBlocks() {
    // ブロックエディタで使用可能なブロックを設定する処理
    // 実際の実装はBlockly周りのコードに依存する
    
    // この実装はUI側で行われることを想定
    console.log("ステージ4で利用可能なブロック: 攻撃, 回復, 魔法詠唱（炎, 氷）");
  }

  // プレイヤーの行動：魔法詠唱（左手）
  async castSpellLeftHand() {
    console.log("左手で魔法を詠唱...");
    this.addLog("左手で魔法を詠唱...");
    
    // 詠唱シーケンスに追加
    this.spellCastState.sequence.push('left');
    
    // 左手の詠唱エフェクト（青い色で氷魔法を示唆）
    const leftHandEffect = this.add.graphics();
    leftHandEffect.fillStyle(0x44aaff, 0.4); // 青色
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

  // プレイヤーの行動：魔法詠唱（右手）
  async castSpellRightHand() {
    console.log("右手で魔法を詠唱...");
    this.addLog("右手で魔法を詠唱...");
    
    // 詠唱シーケンスに追加
    this.spellCastState.sequence.push('right');
    
    // 右手の詠唱エフェクト
    const rightHandEffect = this.add.graphics();
    rightHandEffect.fillStyle(0xff4400, 0.4); // 赤色
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
        // パターンが一致したら氷の魔法を発動
        this.castIceSpell();
        
        // 詠唱シーケンスをリセット
        this.spellCastState.sequence = [];
      }
    }
  }

  // 氷の魔法の発動
  async castIceSpell() {
    console.log("氷の魔法が発動した！");
    this.addLog("氷の魔法が発動した！");
    
    // 氷のエフェクト
    const iceSpell = this.add.graphics();
    iceSpell.fillStyle(0x44aaff, 0.6); // 青色
    iceSpell.fillCircle(this.playerSprite.x, this.playerSprite.y - 50, 30);
    
    // 氷塊が飛ぶアニメーション
    this.tweens.add({
      targets: iceSpell,
      x: this.enemySprite.x - this.playerSprite.x,
      y: -(this.playerSprite.y - this.enemySprite.y),
      scaleX: 0.5,
      scaleY: 0.5,
      duration: 500,
      ease: 'Sine.easeOut',
      onComplete: () => {
        // 敵に命中した際の凍結エフェクト
        const freezeEffect = this.add.graphics();
        freezeEffect.fillStyle(0xaaddff, 0.5); // 薄い青色
        freezeEffect.fillCircle(this.enemySprite.x, this.enemySprite.y, 50);
        
        // 氷の結晶のような装飾を追加
        freezeEffect.fillStyle(0xffffff, 0.7);
        freezeEffect.fillRect(this.enemySprite.x - 50, this.enemySprite.y, 10, 10);
        freezeEffect.fillRect(this.enemySprite.x + 40, this.enemySprite.y - 20, 10, 10);
        freezeEffect.fillRect(this.enemySprite.x + 10, this.enemySprite.y + 30, 10, 10);
        freezeEffect.fillRect(this.enemySprite.x - 30, this.enemySprite.y - 40, 10, 10);
        
        this.tweens.add({
          targets: freezeEffect,
          alpha: 0,
          scale: 1.5,
          duration: 1200,
          onComplete: () => freezeEffect.destroy()
        });
        
        iceSpell.destroy();
        
        // 敵が氷に弱いので、追加ダメージ
        this.dealIceDamage();
      }
    });
    
    await new Promise(resolve => setTimeout(resolve, 800));
    return true;
  }

  // 氷属性のダメージ処理
  async dealIceDamage() {
    // 基本ダメージ + 氷属性の追加ダメージ（弱点を突く）
    const baseDamage = 6;
    const weaknessBonus = 4; // 弱点ボーナス
    const totalDamage = baseDamage + weaknessBonus;
    
    // 敵にダメージを与える
    this.enemy.hp = Math.max(0, this.enemy.hp - totalDamage);
    
    // 敵のスプライトを青く点滅させる
    this.enemySprite.setTint(0x44aaff);
    
    // フレイムパーティクルを一時的に停止
    if (this.flameParticles) {
      try {
        // 新しいPhaserバージョンの場合
        this.flameParticles.pause();
      } catch (e) {
        // 古いバージョンの場合
        if (this.flameParticles.emitters) {
          this.flameParticles.emitters.list.forEach(emitter => {
            emitter.on = false;
          });
        }
      }
    }
    
    setTimeout(() => {
      this.enemySprite.clearTint();
      
      // フレイムパーティクルを再開
      if (this.flameParticles) {
        try {
          // 新しいPhaserバージョンの場合
          this.flameParticles.resume();
        } catch (e) {
          // 古いバージョンの場合
          if (this.flameParticles.emitters) {
            this.flameParticles.emitters.list.forEach(emitter => {
              emitter.on = true;
            });
          }
        }
      }
    }, 1000);
    
    this.addLog(`氷のダメージ！相手の弱点を突き、${totalDamage}ダメージ与えた！`);
    
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
    
    // 炎の咆哮か通常攻撃をランダムで選択（50%で炎の咆哮）
    const useFireBreathAttack = Math.random() < 0.5;
    
    if (useFireBreathAttack) {
      // 炎の咆哮攻撃
      this.addLog("フレイムウルフの炎の咆哮！");
      
      // 炎の咆哮エフェクト
      const fireBreath = this.add.graphics();
      fireBreath.fillStyle(0xff3300, 0.6);
      
      // 扇形の炎を描画
      for (let i = 0; i < 10; i++) {
        const angle = -20 + i * 5; // -20度から+20度の範囲
        const radian = Phaser.Math.DegToRad(angle);
        const startX = this.enemySprite.x;
        const startY = this.enemySprite.y;
        const length = 200 + Math.random() * 50;
        
        const endX = startX + Math.cos(radian) * length;
        const endY = startY + Math.sin(radian) * length;
        
        // 炎の線を描画
        fireBreath.fillStyle(0xff3300, 0.6 - i * 0.05);
        fireBreath.fillRect(startX, startY, endX - startX, 5);
      }
      
      // 炎のアニメーション
      this.tweens.add({
        targets: fireBreath,
        alpha: 0,
        duration: 800,
        onComplete: () => fireBreath.destroy()
      });
      
      await new Promise(resolve => setTimeout(resolve, 600));
      
      // プレイヤーに強力なダメージ（5〜8）
      const fireDamage = 5 + Math.floor(Math.random() * 4);
      this.player.hp = Math.max(0, this.player.hp - fireDamage);
      
      // プレイヤーの表示を一時的に赤く
      this.playerSprite.setTint(0xff0000);
      setTimeout(() => this.playerSprite.clearTint(), 500);
      
      this.addLog(`炎の咆哮で${fireDamage}ダメージを受けた！`);
      
    } else {
      // 通常攻撃
      this.addLog("フレイムウルフの鋭い爪！");
      
      // 攻撃アニメーション
      this.enemySprite.x -= 20;
      await new Promise(resolve => setTimeout(resolve, 100));
      this.enemySprite.x += 20;
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // プレイヤーにダメージ（3〜5）
      const damage = 3 + Math.floor(Math.random() * 3);
      this.player.hp = Math.max(0, this.player.hp - damage);
      
      // プレイヤーの表示を一時的に赤く
      this.playerSprite.setTint(0xff0000);
      setTimeout(() => this.playerSprite.clearTint(), 300);
      
      this.addLog(`鋭い爪で${damage}ダメージを受けた！`);
    }
    
    // HP表示を更新
    this.updateHP(this.player.hp, this.enemy.hp);
    
    // プレイヤーのHPが0になったら敗北
    if (this.player.hp <= 0) {
      this.addLog("あなたは倒れた...");
      this.gameOver(false); // false = プレイヤー敗北
      return false;
    }
    
    return true;
  }
  
  // 魔法詠唱のポップアップを表示（Stage4用にカスタマイズ）
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
    const title = this.add.text(0, -130, '氷の魔法を習得', {
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
    iceIcon.fillStyle(0x44aaff, 0.8);
    iceIcon.fillRect(-165, 0, 30, 30);
    
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
    
    // 解説
    const stageInfo = this.add.text(0, 60, 'フレイムウルフは氷の魔法に弱い！\n左手を2回振って氷の魔法を詠唱しよう。\n炎の敵には冷たい氷で対抗しよう！', {
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
                  fireIcon, iceIcon, fireText, iceText, stageInfo]);
    
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
}

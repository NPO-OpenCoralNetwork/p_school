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
}
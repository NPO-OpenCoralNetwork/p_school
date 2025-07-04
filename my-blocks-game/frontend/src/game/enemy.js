export class Enemy {
    constructor(scene, ui) {
      this.scene = scene;
      this.ui = ui;
      this.hp = 50;
      this.maxHp = 50; // 最大HP値を追加
      this.sprite = null; // スプライト参照用
    }
  
    async takeTurn() {
      this.ui.log("敵のターン！");
      await delay(500);
      
      // シーンの直接メソッドではなくスプライトのアニメーションを使用
      if (this.sprite) {
        // Phaserのスプライトアニメーションを使用
        this.sprite.setTint(0xff0000); // 赤く点滅（攻撃エフェクト）
        await delay(200);
        this.sprite.clearTint();
      }
      
      const damage = Math.floor(Math.random() * 10) + 5;
      this.ui.log(`敵の攻撃！${damage}ダメージ！`);
      
      // プレイヤーのHPを減らす処理
      // ここではsceneからplayerを参照する必要がある
      if (this.scene.player) {
        this.scene.player.hp -= damage;
        this.ui.updateHP(this.scene.player.hp, this.hp);
        
        // プレイヤーのHPがゼロ以下になったかチェック
        if (this.scene.player.hp <= 0) {
          this.ui.log("プレイヤーは倒れた！敵の勝利！");
          await delay(1000);
          // ゲームオーバー状態に移行
          if (this.scene.gameOver) {
            this.scene.gameOver(false); // false = プレイヤー敗北
          }
          return false;
        }
      }
      
      await delay(1000);
      return true;
    }
    
    // HP取得メソッド
    getHP() {
      return this.hp;
    }
    
    // HP設定メソッド
    setHP(value) {
      this.hp = value;
    }
}

// delay関数をインポート
import { delay } from './utils';

export class Player {
    constructor(scene, ui) {
      this.scene = scene;
      this.ui = ui;
      this.hp = 100;
    }
  
    async attack() {
      await this.scene.playAnimation("playerAttack");
      this.ui.log("物理攻撃！");
      this.scene.dealDamageToEnemy(10);
      this.ui.updateHP(this.hp, this.scene.enemy.hp);
    }
  
    async castSpell(type) {
      await this.scene.playAnimation(`magic_${type.toLowerCase()}`);
      const dmg = { FIRE:15, ICE:12, THUNDER:18 }[type];
      this.ui.log(`${type}の魔法！ (${dmg}ダメージ)`);
      this.scene.dealDamageToEnemy(dmg);
      this.ui.updateHP(this.hp, this.scene.enemy.hp);
    }
  
    async heal(amount) {
      this.hp = Math.min(100, this.hp + amount);
      this.ui.log(`回復 ${amount} (HP: ${this.hp})`);
      this.ui.updateHP(this.hp, this.scene.enemy.hp);
    }
    
    // 回復魔法用のメソッド（シーンのhealPlayerメソッドがない場合のフォールバック）
    async healPlayer(amount) {
      console.log("Player's healPlayer method called with amount:", amount);
      // シーンに委譲を試みる
      if (this.scene && typeof this.scene.healPlayer === 'function') {
        return await this.scene.healPlayer(amount);
      }
      // シーンのメソッドがない場合は単に通常の回復を行う
      return await this.heal(amount);
    }
    
    // HP取得メソッド
    getHP() {
      return this.hp;
    }
      // HP設定メソッド
    setHP(value) {
      this.hp = value;
    }

    // ダメージを受けるメソッド
    takeDamage(amount) {
      const oldHP = this.hp;
      this.hp = Math.max(0, this.hp - amount);
      this.ui.updateHP(this.hp, this.scene.enemy.hp);
      return this.hp !== oldHP;
    }
  }
  
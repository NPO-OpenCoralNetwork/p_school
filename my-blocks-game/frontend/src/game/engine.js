import { delay } from "./utils";

// 魔法詠唱パターンの定義
const MAGIC_PATTERNS = {
  FIRE: ["right", "right", "left"],
  ICE: ["left"],
  THUNDER: ["right", "left", "right", "left"]
};

export async function runGameWithCommands(ast, game, ui) {
  // 詠唱パターンを格納する配列
  let currentIncantation = [];
  let currentSpell = null;
  
  // ASTからコマンドを生成
  const commands = [];
  
  for (const node of ast) {
    const { type, fields } = node;
    
    switch (type) {
      case "cast_magic":
        // 魔法詠唱開始（以前のパターンをリセット）
        currentIncantation = [];
        currentSpell = fields.SPELL;
        ui.log(`${fields.SPELL}の魔法を詠唱開始...`);
        break;
        
      case "wave_left_hand":
        if (currentSpell) {
          currentIncantation.push("left");
          ui.log("左手を振った！");
          // commands.push(() => delay(500)); // アニメーション待機
        }
        break;
        
      case "wave_right_hand":
        if (currentSpell) {
          currentIncantation.push("right");
          ui.log("右手を振った！");
          // commands.push(() => delay(500)); // アニメーション待機
        }
        break;
        
      case "attack":
        commands.push(() => game.player.attack());
        break;
        
      case "heal":
        const amount = parseInt(fields.AMOUNT) || 10;
        commands.push(() => game.player.heal(amount));
        break;
        
      case "wait_seconds":
        const seconds = parseInt(fields.SECONDS) || 1;
        commands.push(() => delay(seconds * 1000));
        break;
    }
  }
  
  // 詠唱が完了したら魔法を実行
  if (currentSpell) {
    const expectedPattern = MAGIC_PATTERNS[currentSpell];
    const isCorrect = JSON.stringify(currentIncantation) === JSON.stringify(expectedPattern);
    
    if (isCorrect) {
      commands.push(() => {
        ui.log(`${currentSpell}の魔法の詠唱成功！`);
        return game.player.castSpell(currentSpell);
      });
    } else {
      commands.push(() => {
        ui.log(`${currentSpell}の魔法の詠唱失敗...正しいパターンは ${expectedPattern.join(', ')} です`);
        return Promise.resolve();
      });
    }
  }
  
  // プレイヤーターン - コマンド実行
  for (const cmd of commands) {
    await cmd();
  }
  
  // 敵のターン
  await game.enemy.takeTurn();
}

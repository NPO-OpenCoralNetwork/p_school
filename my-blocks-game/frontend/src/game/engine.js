import { delay } from "./utils";
import { evaluateAst, evaluateMagicPattern, initWasm } from "../wasm/wasm-bridge";
import { BattleScene } from "./battle";
import { BattleScene2 } from "./BattleScene2";

// 初期化時にWASMをロード
(async function() {
  try {
    await initWasm();
    console.log("WASM engine initialized");
  } catch (e) {
    console.error("Failed to initialize WASM engine, falling back to JS implementation:", e);
  }
})();

// 魔法詠唱パターンの定義
const MAGIC_PATTERNS = {
  FIRE: ["right", "right", "left"],
  ICE: ["left"],
  THUNDER: ["right", "left", "right", "left"],
  HEALING: ["left", "right", "left", "right", "left", "right"] // ステージ2用の回復魔法パターン
};

export async function runGameWithCommands(ast, game, ui) {
  try {
    // 処理前にASTをチェック
    console.log("Original AST:", JSON.stringify(ast, null, 2));
    
    // 魔法詠唱ブロックとその子ブロックを確認
    const magicBlocks = ast.filter(node => node.type === "cast_magic");
    console.log("Magic blocks:", JSON.stringify(magicBlocks, null, 2));
    
    // 魔法詠唱ブロックの子ブロック処理を確認
    for (const magicBlock of magicBlocks) {
      console.log(`Magic block spell type: ${magicBlock.fields.SPELL}`);
      
      if (!magicBlock.children || magicBlock.children.length === 0) {
        console.warn(`Warning: Magic block has no children! This will cause evaluation to fail.`);
        
        // 簡易修正: もし手を振るブロックが別のトップレベルノードとして認識されている場合
        const handWaveBlocks = ast.filter(node => 
          node.type === "wave_left_hand" || node.type === "wave_right_hand");
          
        if (handWaveBlocks.length > 0) {
          console.log(`Found ${handWaveBlocks.length} disconnected hand wave blocks, attempting to associate...`);
          // それらを手動で子ブロックとして設定
          magicBlock.children = handWaveBlocks;
        }
      } else {
        console.log(`Magic block has ${magicBlock.children.length} children`);
      }
    }
    
    // Rustで実装されたAST評価器を使用する
    const parsedAst = { 
      nodes: ast.map(node => {
        // AST内のすべてのノードを適切な形式に変換する関数
        return convertNodeForWasm(node);
      }),
      is_valid: true,
      error_message: null
    };

    // ノードをWASM用に再帰的に変換する関数
    function convertNodeForWasm(node) {
      if (!node) return null;
    
      const convertedNode = {
        node_type: node.type,
        fields: node.fields || {},
        children: Array.isArray(node.children) 
          ? node.children.map(child => convertNodeForWasm(child)) 
          : []
      };
    
      return convertedNode;
    }
    
    console.log("Transformed AST for WASM:", JSON.stringify(parsedAst, null, 2));
    
    // WAMSで実装された関数で評価
    let actions = [];
    try {
      actions = await evaluateAst(parsedAst);
      // actionsが配列であることを確認
      if (!Array.isArray(actions)) {
        console.error("WASM evaluation returned non-array result:", actions);
        actions = [];
      }
    } catch (e) {
      console.error("WASM evaluation failed, falling back to JS implementation:", e);
      actions = evaluateAstJs(parsedAst);
      // フォールバック実装の結果も確認
      if (!Array.isArray(actions)) {
        console.error("JS fallback evaluation returned non-array result:", actions);
        actions = [];
      }
    }

    console.log("Generated actions:", JSON.stringify(actions, null, 2));

    // アクションの実行（actionsが空配列の場合は何も実行されない）
    for (const action of actions) {
      await executeGameAction(action, game, ui);
    }
    
    // 敵のターン
    await game.enemy.takeTurn();
  } catch (error) {
    console.error("Error running game commands:", error);
    ui.log("エラーが発生しました: " + error.message);
  }
}

// アクションを実行する関数
async function executeGameAction(action, game, ui) {
  const { action_type, parameters } = action;
  
  switch (action_type) {
    case "Attack":
      await game.player.attack();
      break;
      
    case "Heal":
      const healAmount = parameters.amount || 10;
      await game.player.heal(healAmount);
      break;
      
    case "Wait":
      const seconds = parameters.seconds || 1;
      ui.log(`${seconds}秒間待機中...`);
      await delay(seconds * 1000);
      break;
      
    case "StartIncantation":
      ui.log(`${parameters.spell}の魔法を詠唱開始...`);
      break;
      
    case "WaveLeftHand":
      ui.log("左手を振った！");
      await delay(500);
      break;
      
    case "WaveRightHand":
      ui.log("右手を振った！");
      await delay(500);
      break;
      
    case "CompleteIncantation":
      ui.log(`${parameters.spell}の魔法の詠唱成功！`);
      break;
      
    case "FailIncantation":
      ui.log(`${parameters.spell}の魔法の詠唱失敗...正しいパターンではありません`);
      break;
      
    case "CastMagic":
      await game.player.castSpell(parameters.spell);
      break;

    case "CastHealingMagic":
      const healPower = parameters.power || 30;
      ui.log(`回復魔法を発動！HPが${healPower}回復します`);
      await game.player.healPlayer(healPower);
      break;
      
    default:
      console.warn("Unknown action type:", action_type);
  }
}

// JavaScriptによるフォールバック実装（WAMSが利用できない場合に使用）
function evaluateAstJs(parsedAst) {
  const { nodes } = parsedAst;
  const actions = [];
  let currentIncantation = [];
  let currentSpell = null;
  
  for (const node of nodes) {
    const { node_type, fields } = node;
    
    switch (node_type) {
      case "attack":
        actions.push({
          action_type: "Attack",
          parameters: {}
        });
        break;
        
      case "heal":
        const amount = parseInt(fields.AMOUNT) || 10;
        actions.push({
          action_type: "Heal",
          parameters: { amount }
        });
        break;
        
      case "wait_seconds":
        const seconds = parseFloat(fields.SECONDS) || 1;
        actions.push({
          action_type: "Wait",
          parameters: { seconds }
        });
        break;
        
      case "cast_magic":
        currentSpell = fields.SPELL;
        currentIncantation = [];
        actions.push({
          action_type: "StartIncantation",
          parameters: { spell: currentSpell }
        });
        break;
        
      case "cast_healing":
      case "cast_healing_magic":
        // ステージ2用の回復魔法ブロックの処理
        currentSpell = "HEALING";
        currentIncantation = [];
        actions.push({
          action_type: "StartIncantation",
          parameters: { spell: "回復魔法" }
        });
        break;
        
      case "wave_left_hand":
        currentIncantation.push("left");
        actions.push({
          action_type: "WaveLeftHand",
          parameters: {}
        });
        break;
        
      case "wave_right_hand":
        currentIncantation.push("right");
        actions.push({
          action_type: "WaveRightHand",
          parameters: {}
        });
        break;
    }
  }
  
  // 詠唱が完了したら魔法を実行
  if (currentSpell && currentIncantation.length > 0) {
    const expectedPattern = MAGIC_PATTERNS[currentSpell];
    const isCorrect = 
      JSON.stringify(currentIncantation) === JSON.stringify(expectedPattern);
    
    if (isCorrect) {
      actions.push({
        action_type: "CompleteIncantation",
        parameters: { 
          spell: currentSpell,
          pattern: currentIncantation.join(",")
        }
      });
      
      if (currentSpell === "HEALING") {
        actions.push({
          action_type: "CastHealingMagic",
          parameters: { power: 30 }
        });
      } else {
        actions.push({
          action_type: "CastMagic",
          parameters: { spell: currentSpell }
        });
      }
    } else {
      actions.push({
        action_type: "FailIncantation",
        parameters: { 
          spell: currentSpell,
          pattern: currentIncantation.join(","),
          expected: expectedPattern.join(",")
        }
      });
    }
  }
  
  return actions;
}

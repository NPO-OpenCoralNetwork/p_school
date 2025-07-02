import Blockly from "scratch-blocks";
import { parseAst } from "../wasm/wasm-bridge";

export async function getASTFromWorkspace(workspace) {
  // ブロックからASTを生成
  const jsAst = convertBlocksToAST(workspace);
  console.log("Generated AST:", JSON.stringify(jsAst, null, 2));
  
  // WAMSによる解析を試みる（利用可能な場合）
  try {
    const parsedAst = await parseAst(jsAst);
    console.log("AST parsed with WASM:", parsedAst);
    return jsAst; // 元のASTを返す（解析結果は検証のみに使用）
  } catch (e) {
    console.warn("WASM parsing failed, using JavaScript AST only:", e);
    return jsAst;
  }
}

// ブロックをシンプルなAST形式に変換する関数
function convertBlocksToAST(workspace) {
  const ast = [];
  const topBlocks = workspace.getTopBlocks(true);
  
  for (const block of topBlocks) {
    const node = processBlock(block);
    if (node) {
      ast.push(node);
    }
  }
  
  return ast;
}

// ブロックとその子ブロックを再帰的に処理
function processBlock(block) {
  if (!block) return null;
  
  const blockData = {
    type: block.type,
    fields: {},
    children: []
  };
  
  // フィールド値を取得
  const fields = block.inputList.reduce((acc, input) => {
    if (input.fieldRow) {
      for (const field of input.fieldRow) {
        if (field.name && field.getValue) {
          acc[field.name] = field.getValue();
        }
      }
    }
    return acc;
  }, {});
  
  blockData.fields = fields;
  
  // デバッグ情報: ブロックのタイプと構造
  console.log(`Processing block type: ${block.type}`);
  
  // 特に魔法詠唱ブロックの場合、より詳細なデバッグ
  if (block.type === 'cast_magic') {
    console.log('Cast magic block being processed:');
    console.log('- Fields:', blockData.fields);
    console.log('- Input list:', block.inputList.map(input => ({
      name: input.name, 
      type: input.type, 
      hasConnection: !!input.connection,
      connectionTargetExists: input.connection ? !!input.connection.targetConnection : false
    })));
  }
  
  // ステートメント入力内のブロックを子として処理
  for (let i = 0; i < block.inputList.length; i++) {
    const input = block.inputList[i];
    
    // Blockly.INPUT_STATEMENT の値（3）を直接使用するのではなく、
    // プロパティ名（3 = 'dummy_input'）を使って比較する
    if (input.type === 3 && input.connection && input.connection.targetConnection) {
      console.log(`Found statement input: ${input.name} for block type: ${block.type}`);
      
      const childBlock = input.connection.targetConnection.sourceBlock_;
      if (!childBlock) {
        console.log(`No child block found for input: ${input.name}`);
        continue;
      }
      
      console.log(`Child block type: ${childBlock.type}`);
      
      const childNode = processBlock(childBlock);
      if (childNode) {
        blockData.children.push(childNode);
        console.log(`Added child node for ${childBlock.type} to ${block.type}`);
      }
      
      // 連結されたブロックを処理
      let nextSibling = childBlock.nextConnection && childBlock.nextConnection.targetConnection
        ? childBlock.nextConnection.targetConnection.sourceBlock_
        : null;
        
      while (nextSibling) {
        console.log(`Processing connected block: ${nextSibling.type}`);
        const siblingNode = processBlock(nextSibling);
        if (siblingNode) {
          blockData.children.push(siblingNode);
          console.log(`Added sibling node for ${nextSibling.type} to ${block.type}`);
        }
        nextSibling = nextSibling.nextConnection && nextSibling.nextConnection.targetConnection
          ? nextSibling.nextConnection.targetConnection.sourceBlock_
          : null;
      }
    }
    
    // 値入力（式ブロック）の処理
    else if (input.type === 1 && input.connection && input.connection.targetConnection) {
      const valueBlock = input.connection.targetConnection.sourceBlock_;
      const valueNode = processBlock(valueBlock);
      if (valueNode) {
        // 特定のブロックタイプに対してカスタム処理
        if (input.name === 'CONDITION' && blockData.type === 'controls_if') {
          blockData.condition = valueNode;
        } else {
          blockData.fields[input.name] = valueNode.value || valueNode;
        }
      }
    }
  }
  
  // 特に魔法詠唱ブロックの場合、子ブロックの処理を確認
  if (block.type === 'cast_magic') {
    console.log(`Cast magic block "${fields.SPELL}" has ${blockData.children.length} children after processing`);
    if (blockData.children.length === 0) {
      // INCATATIONという名前の子要素が空の場合、特別な処理を試みる
      // 今後のデバッグのために、魔法詠唱ブロックの子ブロックがないことを通知
      console.warn(`Warning: Magic spell block for "${fields.SPELL}" has no child incantation blocks`);
    }
  }
  
  return blockData;
}

// 追加：特定のブロックタイプのASTを検証するヘルパー関数
export function validateBlockPattern(block, expectedPattern) {
  // 魔法詠唱パターンの検証などに使用
  if (block.type === 'cast_magic') {
    const spellType = block.fields.SPELL;
    const steps = block.children.map(child => {
      if (child.type === 'wave_left_hand') return 'left';
      if (child.type === 'wave_right_hand') return 'right';
      return null;
    }).filter(Boolean);
    
    // パターン検証
    return compareArrays(steps, expectedPattern);
  }
  
  return false;
}

// 配列の比較ヘルパー
function compareArrays(a, b) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

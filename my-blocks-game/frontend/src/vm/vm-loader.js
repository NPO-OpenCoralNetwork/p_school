import Blockly from "scratch-blocks";

export async function getASTFromWorkspace(workspace) {
  // 直接ブロックからASTを生成
  return convertBlocksToAST(workspace);
}

// ブロックをシンプルなAST形式に変換する関数
function convertBlocksToAST(workspace) {
  const ast = [];
  const topBlocks = workspace.getTopBlocks(true);
  
  for (const block of topBlocks) {
    processBlock(block, ast);
  }
  
  return ast;
}

// ブロックとその子ブロックを再帰的に処理
function processBlock(block, ast) {
  const blockData = {
    type: block.type,
    fields: {}
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
  ast.push(blockData);
  
  // ステートメント入力内のブロックを処理
  for (let i = 0; i < block.inputList.length; i++) {
    const input = block.inputList[i];
    if (input.type === Blockly.INPUT_STATEMENT && input.connection && input.connection.targetConnection) {
      const childBlock = input.connection.targetConnection.sourceBlock_;
      processBlock(childBlock, ast);
    }
  }
  
  // 次のブロックがあれば処理
  if (block.nextConnection && block.nextConnection.targetConnection) {
    const nextBlock = block.nextConnection.targetConnection.sourceBlock_;
    processBlock(nextBlock, ast);
  }
}

// wasm-game-coreの初期化関数をimport
import init from '../../../wasm-game-core/pkg/wasm_game_core.js';

let isInitialized = false;
let wasmModule = null;

export async function initWasm() {
  if (!isInitialized) {
    // init関数を呼び出してWASMモジュール初期化
    await init();
    isInitialized = true;
  }

  try {
    const wasm = await import('../../../wasm-game-core/pkg/wasm_game_core.js');
    if (wasm.__wbindgen_start) {
      wasm.__wbindgen_start();
    }
    wasmModule = wasm;
    console.log("WASM Game Core initialized successfully");
  } catch (err) {
    console.error("Failed to load WASM module:", err);
    throw err;
  }
}

// ...以下省略




// AST解析関数
export async function parseAst(astJson) {
  await ensureInitialized();
  
  try {
    const jsonStr = JSON.stringify(astJson);
    const result = wasmModule.parse_ast(jsonStr);
    return JSON.parse(result);
  } catch (error) {
    console.error("Error parsing AST with WASM:", error);
    throw error;
  }
}

// AST評価関数
export async function evaluateAst(parsedAstJson) {
  await ensureInitialized();
  
  try {
    const jsonStr = JSON.stringify(parsedAstJson);
    const result = wasmModule.evaluate_ast(jsonStr);
    console.log("Raw WASM result:", result);
    
    const parsedResult = JSON.parse(result);
    console.log("Parsed WASM result:", parsedResult);
    
    // エラー処理: Rustからエラーが返された場合は例外をスローする
    if (parsedResult && parsedResult.error) {
      throw new Error(parsedResult.error);
    }
    
    // 結果がactionsプロパティを持つオブジェクトの場合は、それを展開
    if (parsedResult && typeof parsedResult === 'object' && parsedResult.actions) {
      console.log("Found actions array in result, returning it directly");
      return Array.isArray(parsedResult.actions) ? parsedResult.actions : [];
    }
    
    // 配列でない結果が返された場合は空の配列を返す
    if (!Array.isArray(parsedResult)) {
      console.warn("WASM returned non-array result, returning empty array");
      return [];
    }
    
    return parsedResult;
  } catch (error) {
    console.error("Error evaluating AST with WASM:", error);
    throw error;
  }
}

// 魔法詠唱パターン評価関数
export async function evaluateMagicPattern(spellType, pattern) {
  await ensureInitialized();
  
  try {
    const result = wasmModule.evaluate_magic_pattern(spellType, pattern);
    return JSON.parse(result);
  } catch (error) {
    console.error("Error evaluating magic pattern with WASM:", error);
    throw error;
  }
}

// モジュールが初期化されていることを確認
async function ensureInitialized() {
  if (!isInitialized) {
    await initWasm();
  }
}
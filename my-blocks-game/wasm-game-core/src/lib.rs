mod ast;
mod magic;
mod utils;

wasm-pack build --target bundler

use wasm_bindgen::prelude::*;
use serde::{Serialize, Deserialize};

// JavaScriptのコンソールにログを出力するユーティリティ関数
#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

// マクロでlog!を定義
macro_rules! console_log {
    ($($t:tt)*) => (log(&format!($($t)*)))
}

// ASTノードの表現
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct AstNode {
    pub node_type: String,
    pub fields: serde_json::Value,
    pub children: Option<Vec<AstNode>>,
}

// AST解析結果
#[derive(Serialize, Deserialize, Debug)]
pub struct AstResult {
    pub nodes: Vec<AstNode>,
    pub is_valid: bool,
    pub error_message: Option<String>,
}

// JavaScript呼び出し用の関数
#[wasm_bindgen]
pub fn parse_ast(json_str: &str) -> String {
    console_log!("Parsing AST in Rust WASM");
    
    // JSONをパース
    let ast_nodes: Result<Vec<serde_json::Value>, _> = serde_json::from_str(json_str);
    match ast_nodes {
        Ok(nodes) => {
            // ASTをRustで処理
            match ast::parser::parse_ast_nodes(nodes) {
                Ok(result) => {
                    // 処理結果を返す
                    match serde_json::to_string(&result) {
                        Ok(json) => json,
                        Err(e) => format!("{{\"error\": \"シリアライズエラー: {}\"}}", e)
                    }
                },
                Err(e) => format!("{{\"error\": \"AST解析エラー: {}\"}}", e)
            }
        },
        Err(e) => format!("{{\"error\": \"JSONパースエラー: {}\"}}", e)
    }
}

// 魔法詠唱パターンの評価
#[wasm_bindgen]
pub fn evaluate_magic_pattern(spell_type: &str, pattern: &str) -> String {
    let result = magic::patterns::evaluate_pattern(spell_type, pattern);
    serde_json::to_string(&result).unwrap_or_else(|_| String::from("{\"error\": \"結果のシリアライズに失敗\"}"))
}

// ASTから評価されたアクションのリストを生成
#[wasm_bindgen]
pub fn evaluate_ast(json_str: &str) -> String {
    console_log!("Evaluating AST in Rust WASM");
    
    // JSONをパース
    let parsed_ast: Result<AstResult, _> = serde_json::from_str(json_str);
    
    match parsed_ast {
        Ok(ast) => {
            // ASTを評価してアクションを生成
            match ast::evaluator::evaluate(ast) {
                Ok(actions) => serde_json::to_string(&actions).unwrap_or_else(|_| 
                    String::from("{\"error\": \"アクションのシリアライズに失敗\"}")),
                Err(e) => format!("{{\"error\": \"評価エラー: {}\"}}", e)
            }
        },
        Err(e) => format!("{{\"error\": \"JSONパースエラー: {}\"}}", e)
    }
}

// 初期化関数（デバッグ用）
#[wasm_bindgen(start)]
pub fn start() {
    utils::set_panic_hook();
    console_log!("WASM Game Core initialized");
}
use crate::{AstNode, AstResult};
use serde_json::Value;
use std::error::Error;
use std::fmt;

#[derive(Debug)]
pub struct ParseError(String);

impl fmt::Display for ParseError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "Parse error: {}", self.0)
    }
}

impl Error for ParseError {}

// ASTノードをパースする関数
pub fn parse_ast_nodes(nodes: Vec<Value>) -> Result<AstResult, Box<dyn Error>> {
    let mut parsed_nodes = Vec::new();
    let mut is_valid = true;
    let mut error_message = None;

    for node in nodes {
        match parse_node(node) {
            Ok(ast_node) => parsed_nodes.push(ast_node),
            Err(e) => {
                is_valid = false;
                error_message = Some(e.to_string());
                break;
            }
        }
    }

    Ok(AstResult {
        nodes: parsed_nodes,
        is_valid,
        error_message,
    })
}

// 各ノードを解析する関数
fn parse_node(node: Value) -> Result<AstNode, Box<dyn Error>> {
    // 型チェック
    if !node.is_object() {
        return Err(Box::new(ParseError("ノードがオブジェクトではありません".into())));
    }

    // typeフィールドの抽出
    let node_obj = node.as_object().unwrap();
    let node_type = match node_obj.get("type") {
        Some(t) => {
            if let Some(type_str) = t.as_str() {
                type_str.to_string()
            } else {
                return Err(Box::new(ParseError("typeフィールドが文字列ではありません".into())));
            }
        }
        None => return Err(Box::new(ParseError("typeフィールドがありません".into())))
    };

    // fieldsの抽出
    let fields = match node_obj.get("fields") {
        Some(f) => f.clone(),
        None => Value::Object(serde_json::Map::new()) // fieldsがなければ空オブジェクト
    };

    // 子ノードの処理
    let mut children = None;
    if let Some(children_value) = node_obj.get("children") {
        if let Some(children_array) = children_value.as_array() {
            let mut parsed_children = Vec::new();
            for child in children_array {
                parsed_children.push(parse_node(child.clone())?);
            }
            children = Some(parsed_children);
        } else {
            return Err(Box::new(ParseError("childrenが配列ではありません".into())));
        }
    }

    Ok(AstNode {
        node_type,
        fields,
        children,
    })
}

// ブロックの検証
pub fn validate_blocks(nodes: &[AstNode]) -> Result<(), Box<dyn Error>> {
    // 各種ブロックの検証ロジック
    for node in nodes {
        match node.node_type.as_str() {
            "cast_magic" => validate_cast_magic(node)?,
            "attack" => {}, // 攻撃ブロックは特に検証不要
            "heal" => validate_heal(node)?,
            "wait_seconds" => validate_wait_seconds(node)?,
            _ => {} // その他のブロックは今のところ無視
        }
        
        // 子ノードの検証
        if let Some(children) = &node.children {
            validate_blocks(children)?;
        }
    }
    
    Ok(())
}

// 魔法詠唱ブロックの検証
fn validate_cast_magic(node: &AstNode) -> Result<(), Box<dyn Error>> {
    // SPELLフィールドの存在確認
    let spell = match node.fields.get("SPELL") {
        Some(s) => {
            if let Some(spell_str) = s.as_str() {
                spell_str
            } else {
                return Err(Box::new(ParseError("SPELLフィールドが文字列ではありません".into())));
            }
        },
        None => return Err(Box::new(ParseError("SPELLフィールドがありません".into())))
    };
    
    // スペルタイプの検証
    match spell {
        "FIRE" | "ICE" | "THUNDER" => Ok(()),
        _ => Err(Box::new(ParseError(format!("未知の魔法タイプ: {}", spell))))
    }
}

// 回復ブロックの検証
fn validate_heal(node: &AstNode) -> Result<(), Box<dyn Error>> {
    // AMOUNTフィールドのチェック（オプショナル）
    if let Some(amount) = node.fields.get("AMOUNT") {
        if amount.is_number() || amount.is_string() {
            // 文字列からの数値変換を試みる
            if let Some(amount_str) = amount.as_str() {
                if amount_str.parse::<i32>().is_err() {
                    return Err(Box::new(ParseError("AMOUNTが有効な数値ではありません".into())));
                }
            }
        } else {
            return Err(Box::new(ParseError("AMOUNTフィールドが数値または文字列ではありません".into())));
        }
    }
    
    Ok(())
}

// 待機ブロックの検証
fn validate_wait_seconds(node: &AstNode) -> Result<(), Box<dyn Error>> {
    // SECONDSフィールドのチェック
    if let Some(seconds) = node.fields.get("SECONDS") {
        if seconds.is_number() || seconds.is_string() {
            // 文字列からの数値変換を試みる
            if let Some(seconds_str) = seconds.as_str() {
                if seconds_str.parse::<f32>().is_err() {
                    return Err(Box::new(ParseError("SECONDSが有効な数値ではありません".into())));
                }
            }
        } else {
            return Err(Box::new(ParseError("SECONDSフィールドが数値または文字列ではありません".into())));
        }
    } else {
        return Err(Box::new(ParseError("SECONDSフィールドがありません".into())));
    }
    
    Ok(())
}
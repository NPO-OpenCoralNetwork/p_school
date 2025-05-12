use crate::AstResult;
use serde::{Serialize, Deserialize};
use std::error::Error;
use std::fmt;

#[derive(Debug)]
pub struct EvaluationError(String);

impl fmt::Display for EvaluationError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "Evaluation error: {}", self.0)
    }
}

impl Error for EvaluationError {}

// アクションの型
#[derive(Serialize, Deserialize, Debug, Clone)]
pub enum ActionType {
    Attack,
    Heal,
    CastMagic,
    CastHealingMagic, // 回復魔法用のアクション追加
    Wait,
    StartIncantation,
    WaveLeftHand,
    WaveRightHand,
    CompleteIncantation,
    FailIncantation,
}

// ゲームアクション
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct GameAction {
    pub action_type: ActionType,
    pub parameters: serde_json::Value,
}

// ASTから実行可能なアクションのリストを生成
pub fn evaluate(ast_result: AstResult) -> Result<Vec<GameAction>, Box<dyn Error>> {
    if !ast_result.is_valid {
        return Err(Box::new(EvaluationError(
            format!("AST検証エラー: {}", 
                ast_result.error_message.unwrap_or_else(|| "不明なエラー".to_string())
            )
        )));
    }

    let mut actions = Vec::new();
    
    // ノードを再帰的に処理する関数
    fn process_node(
        node: &crate::AstNode, 
        actions: &mut Vec<GameAction>, 
        spell_context: &mut Option<String>,
        steps: &mut Vec<String>
    ) -> bool {
        let mut success = true;
        
        match node.node_type.as_str() {
            "cast_magic" => {
                // 魔法詠唱開始
                if let Some(spell_value) = node.fields.get("SPELL") {
                    if let Some(spell_str) = spell_value.as_str() {
                        *spell_context = Some(spell_str.to_string());
                        steps.clear();

                        actions.push(GameAction {
                            action_type: ActionType::StartIncantation,
                            parameters: serde_json::json!({ "spell": spell_str }),
                        });

                        // 子ノードを処理
                        if let Some(children) = &node.children {
                            web_sys::console::log_1(&format!("処理する子ノードの数: {}", children.len()).into());
                            for (i, child) in children.iter().enumerate() {
                                web_sys::console::log_1(&format!("子ノード #{}: タイプ = {}", i, child.node_type).into());
                                // 子ノードを再帰的に処理
                                process_node(child, actions, spell_context, steps);
                            }
                        } else {
                            web_sys::console::log_1(&"魔法詠唱ブロックに子ノードがありません！".into());
                        }

                        // 詠唱の結果を評価
                        let pattern = steps.join(",");
                        let is_correct = evaluate_incantation(spell_str, &pattern);
                        
                        // デバッグ出力を追加
                        web_sys::console::log_1(&format!("Spell: {}, Pattern: {}, Expected: {}, IsCorrect: {}", 
                            spell_str, pattern, 
                            match spell_str {
                                "FIRE" => "right,right,left",
                                "ICE" => "left",
                                "THUNDER" => "right,left,right,left",
                                _ => "unknown",
                            },
                            is_correct).into());

                        if is_correct {
                            // 詠唱成功
                            actions.push(GameAction {
                                action_type: ActionType::CompleteIncantation,
                                parameters: serde_json::json!({ "spell": spell_str, "pattern": pattern }),
                            });

                            // 魔法攻撃を実行
                            actions.push(GameAction {
                                action_type: ActionType::CastMagic,
                                parameters: serde_json::json!({ "spell": spell_str }),
                            });
                        } else {
                            // 詠唱失敗
                            actions.push(GameAction {
                                action_type: ActionType::FailIncantation,
                                parameters: serde_json::json!({ "spell": spell_str, "pattern": pattern }),
                            });
                            success = false;
                        }
                        
                        // スペルコンテキストをリセット
                        *spell_context = None;
                    }
                }
            },
            // ステージ2用: 回復魔法詠唱ブロック
            "cast_healing_magic" => {
                // 回復魔法詠唱開始
                *spell_context = Some("HEALING".to_string());
                steps.clear();

                actions.push(GameAction {
                    action_type: ActionType::StartIncantation,
                    parameters: serde_json::json!({ "spell": "HEALING" }),
                });

                // 子ノードを処理
                if let Some(children) = &node.children {
                    web_sys::console::log_1(&format!("回復魔法の子ノード数: {}", children.len()).into());
                    for (i, child) in children.iter().enumerate() {
                        web_sys::console::log_1(&format!("回復魔法子ノード #{}: タイプ = {}", i, child.node_type).into());
                        // 子ノードを再帰的に処理
                        process_node(child, actions, spell_context, steps);
                    }
                }

                // 詠唱の結果を評価
                let pattern = steps.join(",");
                let is_correct = evaluate_healing_incantation(&pattern);
                
                web_sys::console::log_1(&format!("回復魔法パターン: {}, 正しいか: {}", pattern, is_correct).into());

                if is_correct {
                    // 詠唱成功
                    actions.push(GameAction {
                        action_type: ActionType::CompleteIncantation,
                        parameters: serde_json::json!({ "spell": "HEALING", "pattern": pattern }),
                    });

                    // 回復魔法を実行
                    actions.push(GameAction {
                        action_type: ActionType::CastHealingMagic,
                        parameters: serde_json::json!({ "amount": 15 }), // 回復量は15固定
                    });
                } else {
                    // 詠唱失敗
                    actions.push(GameAction {
                        action_type: ActionType::FailIncantation,
                        parameters: serde_json::json!({ "spell": "HEALING", "pattern": pattern }),
                    });
                    success = false;
                }
                
                // スペルコンテキストをリセット
                *spell_context = None;
            },
            "wave_left_hand" => {
                steps.push("left".to_string());
                actions.push(GameAction {
                    action_type: ActionType::WaveLeftHand,
                    parameters: serde_json::json!({}),
                });
            },
            "wave_right_hand" => {
                steps.push("right".to_string());
                actions.push(GameAction {
                    action_type: ActionType::WaveRightHand,
                    parameters: serde_json::json!({}),
                });
            },
            "attack" => {
                actions.push(GameAction {
                    action_type: ActionType::Attack,
                    parameters: serde_json::json!({}),
                });
            },
            "heal" => {
                // ヒール量のパラメータを取得（デフォルト: 10）
                let amount = node.fields.get("AMOUNT")
                    .and_then(|v| v.as_i64())
                    .unwrap_or(10);

                actions.push(GameAction {
                    action_type: ActionType::Heal,
                    parameters: serde_json::json!({ "amount": amount }),
                });
            },
            // ステージ2用: シンプルな回復魔法ブロック
            "cast_healing" => {
                actions.push(GameAction {
                    action_type: ActionType::CastHealingMagic,
                    parameters: serde_json::json!({ "amount": 15 }),
                });
            },
            "wait_seconds" => {
                // 待機秒数のパラメータを取得（デフォルト: 1）
                let seconds = node.fields.get("SECONDS")
                    .and_then(|v| v.as_f64())
                    .unwrap_or(1.0);

                actions.push(GameAction {
                    action_type: ActionType::Wait,
                    parameters: serde_json::json!({ "seconds": seconds }),
                });
            },
            _ => {}
        }
        
        success
    }
    
    // トップレベルのノードを処理
    let mut spell_context = None;
    let mut steps = Vec::new();
    
    for node in &ast_result.nodes {
        process_node(node, &mut actions, &mut spell_context, &mut steps);
    }

    Ok(actions)
}

// 魔法詠唱パターンの評価
fn evaluate_incantation(spell: &str, pattern: &str) -> bool {
    // 魔法のパターンを定義
    let expected_pattern = match spell {
        "FIRE" => "right,right,left",
        "ICE" => "left",
        "THUNDER" => "right,left,right,left",
        _ => return false,
    };

    pattern == expected_pattern
}

// 回復魔法詠唱パターンの評価（ステージ2用）
fn evaluate_healing_incantation(pattern: &str) -> bool {
    // 回復魔法のパターン: 左右を交互に3回ずつ
    let expected_pattern = "left,right,left,right,left,right";
    pattern == expected_pattern
}
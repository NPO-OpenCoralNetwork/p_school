use serde::{Serialize, Deserialize};

// 魔法パターンの評価結果
#[derive(Serialize, Deserialize, Debug)]
pub struct PatternEvaluationResult {
    pub is_valid: bool,
    pub expected_pattern: String,
    pub actual_pattern: String,
    pub spell_type: String
}

// 詠唱パターン対応表
const MAGIC_PATTERNS: &[(&str, &str)] = &[
    ("FIRE", "right,right,left"),
    ("ICE", "left,left"), // ステージ4用の氷魔法パターンを更新
    ("THUNDER", "right,left,right,left"),
    ("HEALING", "left,right,left,right,left,right"), // ステージ2用の回復魔法パターン
];

// 魔法詠唱パターンを評価する関数
pub fn evaluate_pattern(spell_type: &str, pattern: &str) -> PatternEvaluationResult {
    // パターン対応表から期待されるパターンを取得
    let expected_pattern = MAGIC_PATTERNS
        .iter()
        .find(|(s, _)| *s == spell_type)
        .map_or("", |(_, p)| *p); // unwrap_orの代わりにmap_orを使用
    
    // パターンが一致するか評価
    let is_valid = !expected_pattern.is_empty() && pattern == expected_pattern; // 参照レベルを合わせる
    
    PatternEvaluationResult {
        is_valid,
        expected_pattern: expected_pattern.to_string(),
        actual_pattern: pattern.to_string(),
        spell_type: spell_type.to_string()
    }
}

// 利用可能な魔法の一覧を取得
pub fn get_available_spells() -> Vec<&'static str> {
    MAGIC_PATTERNS.iter().map(|(spell, _)| *spell).collect()
}
export function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ステージ情報の定義
export const BATTLE_STAGES = [
  {
    key: 'BattleScene',
    name: 'ステージ1: はじめての戦い',
    difficulty: 'Easy',
    params: {
      background: 'forest',
      enemy: 'goblin',
      stageNumber: 1
    }
  },
  {
    key: 'Stage2Battle',  // 'BattleScene2'から'Stage2Battle'に変更
    name: 'ステージ2: 回復の魔法',
    difficulty: 'Easy',
    params: {
      background: 'swamp',
      enemy: 'poisonmoth',
      stageNumber: 2
    }
  }
];

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
  },  {
    key: 'Stage3Battle',  // 'BattleScene3'のキー
    name: 'ステージ3: 魔法の詠唱',
    difficulty: 'Easy',
    params: {
      background: 'volcano',
      enemy: 'firegoblin',
      stageNumber: 3
    }
  },  {
    key: 'Stage4Battle',  // 'BattleScene4'のキー
    name: 'ステージ4: 氷の壁',
    difficulty: 'Easy',
    params: {
      background: 'snow',
      enemy: 'flamewolf',
      stageNumber: 4
    }
  },
  {
    key: 'Stage5Battle',  // 'BattleScene5'のキー
    name: 'ステージ5: 時間との勝負',
    difficulty: 'Easy',
    params: {
      background: 'clock',
      enemy: 'timeeater',
      stageNumber: 5
    }
  }
];

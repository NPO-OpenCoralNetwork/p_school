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
      stageNumber: 1,
      scratchMode: true
    }
  },
  {
    key: 'Stage2Battle',  // 'BattleScene2'から'Stage2Battle'に変更
    name: 'ステージ2: 回復の魔法',
    difficulty: 'Easy',
    params: {
      background: 'swamp',
      enemy: 'poisonmoth',
      stageNumber: 2,
      scratchMode: true
    }
  },
  {
    key: 'Stage3Battle',  // 'BattleScene3'のキー
    name: 'ステージ3: 魔法の詠唱',
    difficulty: 'Easy',
    params: {
      background: 'volcano',
      enemy: 'firegoblin',
      stageNumber: 3,
      scratchMode: true
    }
  },
  {
    key: 'Stage4Battle',  // 'BattleScene4'のキー
    name: 'ステージ4: 氷の壁',
    difficulty: 'Easy',
    params: {
      background: 'snow',
      enemy: 'flamewolf',
      stageNumber: 4,
      scratchMode: true
    }
  },
  {
    key: 'Stage5Battle',  // 'BattleScene5'のキー
    name: 'ステージ5: 時間との勝負',
    difficulty: 'Easy',
    params: {
      background: 'clock',
      enemy: 'timeeater',
      stageNumber: 5,
      scratchMode: true
    }
  },
  {
    key: 'Stage6Battle',  // 'BattleScene6'のキー
    name: 'ステージ6: 薬の調合',
    difficulty: 'Normal',
    params: {
      background: 'laboratory',
      enemy: 'poisonkong',
      stageNumber: 6,
      scratchMode: true
    }
  },
  {
    key: 'Stage7Battle',  // 'BattleScene7'のキー
    name: 'ステージ7: 雷の力',
    difficulty: 'Normal',
    params: {
      background: 'metalcavern',
      enemy: 'metalslime',
      stageNumber: 7,
      scratchMode: true
    }
  },
  {
    key: 'Stage8Battle',  // 'BattleScene8'のキー
    name: 'ステージ8: 行動の繰り返し',
    difficulty: 'Normal',
    params: {
      background: 'camp',
      enemy: 'goblins',
      stageNumber: 8,
      scratchMode: true
    }
  },
  {
    key: 'Stage9Battle',
    name: 'ステージ9: 魔法の連携',
    difficulty: 'Hard',
    params: {
      background: 'cave',
      enemy: 'shadowbat',
      stageNumber: 9,
      scratchMode: true
    }
  },
  {
    key: 'Stage10Battle',
    name: 'ステージ10: 初級ボス戦',
    difficulty: 'Boss',
    params: {
      background: 'darkfortress',
      enemy: 'darkknight',
      stageNumber: 10,
      scratchMode: true
    }
  }
];

import Blockly from 'scratch-blocks';

Blockly.Blocks['attack'] = {
  init: function() {
    this.jsonInit({
      "message0": "攻撃する",
      "category": "バトルコマンド",
      "colour": 230,
      "extensions": ["colours_operators", "shape_statement"]
    });
  }
};

Blockly.Blocks['cast_spell'] = {
  init: function() {
    this.jsonInit({
      "message0": "%1 の魔法を唱える",
      "args0": [
        {
          "type": "field_dropdown",
          "name": "SPELL",
          "options": [
            ["炎", "FIRE"],
            ["氷", "ICE"],
            ["雷", "THUNDER"]
          ]
        }
      ],
      "category": "バトルコマンド",
      "colour": 230,
      "extensions": ["colours_operators", "shape_statement"]
    });
  }
};

Blockly.Blocks['heal'] = {
  init: function() {
    this.jsonInit({
      "message0": "HPを %1 回復する",
      "args0": [
        {
          "type": "input_value",
          "name": "AMOUNT",
          "check": "Number"
        }
      ],
      "category": "バトルコマンド",
      "colour": 230,
      "extensions": ["colours_operators", "shape_statement"]
    });
  }
};

Blockly.Blocks['wait_seconds'] = {
  init: function() {
    this.jsonInit({
      "message0": "%1 秒待機",
      "args0": [
        {
          "type": "input_value",
          "name": "SECONDS",
          "check": "Number"
        }
      ],
      "category": "バトルコマンド",
      "colour": 230,
      "extensions": ["colours_operators", "shape_statement"]
    });
  }
};

// 左手を振るブロック
Blockly.Blocks['wave_left_hand'] = {
  init: function() {
    this.jsonInit({
      "message0": "左手を振る",
      "category": "詠唱動作",
      "colour": 160,
      "extensions": ["colours_more", "shape_statement"]
    });
  }
};

// 右手を振るブロック
Blockly.Blocks['wave_right_hand'] = {
  init: function() {
    this.jsonInit({
      "message0": "右手を振る",
      "category": "詠唱動作",
      "colour": 160,
      "extensions": ["colours_more", "shape_statement"]
    });
  }
};

// 魔法を詠唱するブロック（開始ブロック）
Blockly.Blocks['cast_magic'] = {
  init: function() {
    this.jsonInit({
      "message0": "%1 の魔法を詠唱する",
      "args0": [
        {
          "type": "field_dropdown",
          "name": "SPELL",
          "options": [
            ["炎", "FIRE"],
            ["氷", "ICE"],
            ["雷", "THUNDER"]
          ]
        }
      ],
      "message1": "%1",
      "args1": [
        {
          "type": "input_statement",
          "name": "INCANTATION"
        }
      ],
      "category": "バトルコマンド",
      "colour": 230,
      "extensions": ["colours_operators", "shape_hat"]
    });
  }
};

// 回復魔法ブロック（ステージ2用）
Blockly.Blocks['cast_healing'] = {
  init: function() {
    this.jsonInit({
      "message0": "回復魔法を使う",
      "category": "バトルコマンド",
      "colour": 110, // 緑色系
      "extensions": ["colours_operators", "shape_statement"],
      "tooltip": "HPを回復します。ステージ2で使用できます。"
    });
  }
};

// 回復魔法詠唱ブロック（ヒーリングバリエーション - ステージ2用）
Blockly.Blocks['cast_healing_magic'] = {
  init: function() {
    this.jsonInit({
      "message0": "回復の魔法を詠唱する",
      "message1": "%1",
      "args1": [
        {
          "type": "input_statement",
          "name": "INCANTATION"
        }
      ],
      "category": "バトルコマンド",
      "colour": 110, // 緑色系
      "extensions": ["colours_operators", "shape_hat"],
      "tooltip": "回復の魔法を詠唱します。正しい手順で詠唱すると効果が発動します。"
    });
  }
};

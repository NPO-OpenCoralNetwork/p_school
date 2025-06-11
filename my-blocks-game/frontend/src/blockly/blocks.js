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

// 新しい待機ブロック（数値入力なし、ステージ5用）
Blockly.Blocks['wait'] = {
  init: function() {
    this.jsonInit({
      "message0": "敵の攻撃を待機",
      "category": "バトルコマンド",
      "colour": 160,
      "extensions": ["colours_operators", "shape_statement"],
      "tooltip": "1秒待機し、敵の攻撃を回避できる可能性があります。特にステージ5で有効です。"
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

// 炎の魔法詠唱ブロック（ステージ3用）
Blockly.Blocks['cast_fire_magic'] = {
  init: function() {
    this.jsonInit({
      "message0": "炎の魔法を詠唱する",
      "message1": "%1",
      "args1": [
        {
          "type": "input_statement",
          "name": "INCANTATION"
        }
      ],
      "category": "バトルコマンド",
      "colour": 350, // 赤紫色系
      "extensions": ["colours_operators", "shape_hat"],
      "tooltip": "炎の魔法を詠唱します。右手→右手→左手の順で詠唱すると効果が発動します。"
    });
  }
};

// 氷の魔法詠唱ブロック（ステージ4用）
Blockly.Blocks['cast_ice_magic'] = {
  init: function() {
    this.jsonInit({
      "message0": "氷の魔法を詠唱する",
      "message1": "%1",
      "args1": [
        {
          "type": "input_statement",
          "name": "INCANTATION"
        }
      ],
      "category": "バトルコマンド",
      "colour": 210, // 青色系
      "extensions": ["colours_operators", "shape_hat"],
      "tooltip": "氷の魔法を詠唱します。左手→左手の順で詠唱すると効果が発動します。"
    });
  }
};

// 解毒薬調合ブロック（ステージ6用）
Blockly.Blocks['brew_antidote'] = {
  init: function() {
    this.jsonInit({
      "message0": "解毒薬を調合する",
      "category": "薬学",
      "colour": 65, // 緑色系
      "extensions": ["colours_operators", "shape_statement"],
      "tooltip": "毒状態を治療する解毒薬を調合します。毒を受けたらすぐに使いましょう。"
    });
  }
};

// 薬の使用ブロック（ステージ6用）
Blockly.Blocks['use_potion'] = {
  init: function() {
    this.jsonInit({
      "message0": "%1 を使用する",
      "args0": [
        {
          "type": "field_dropdown",
          "name": "POTION_TYPE",
          "options": [
            ["解毒薬", "ANTIDOTE"],
            ["回復薬", "HEALING"],
            ["強化薬", "BOOST"]
          ]
        }
      ],
      "category": "薬学",
      "colour": 65, // 緑色系
      "extensions": ["colours_operators", "shape_statement"],
      "tooltip": "調合した薬を使用します。効果は薬の種類によって異なります。"
    });
  }
};

Blockly.Blocks['repeat_twice'] = {
  init: function() {
    this.jsonInit({
      "message0": "2回繰り返す %1 %2",
      "args0": [
        {
          "type": "input_dummy"
        },
        {
          "type": "input_statement",
          "name": "STACK"
        }
      ],
      "category": "制御",
      "colour": 120,
      "extensions": ["colours_control", "shape_statement"]
    });
  }
};

// 3回繰り返しブロック（ステージ9用）
Blockly.Blocks['repeat_three_times'] = {
  init: function() {
    this.jsonInit({
      "message0": "3回繰り返す %1 %2",
      "args0": [
        {
          "type": "input_dummy"
        },
        {
          "type": "input_statement",
          "name": "STACK"
        }
      ],
      "category": "制御",
      "colour": 120,
      "extensions": ["colours_control", "shape_statement"]
    });
  }
};

// JavaScript code generation for blocks
if (typeof Blockly !== 'undefined' && Blockly.JavaScript) {
  
  // Basic action blocks
  Blockly.JavaScript['attack'] = function(block) {
    return 'attack();\n';
  };

  Blockly.JavaScript['cast_spell'] = function(block) {
    var spell = block.getFieldValue('SPELL');
    return 'castSpell("' + spell + '");\n';
  };

  Blockly.JavaScript['heal'] = function(block) {
    var amount = Blockly.JavaScript.valueToCode(block, 'AMOUNT', Blockly.JavaScript.ORDER_ATOMIC) || '20';
    return 'heal(' + amount + ');\n';
  };

  Blockly.JavaScript['wait_seconds'] = function(block) {
    var seconds = Blockly.JavaScript.valueToCode(block, 'SECONDS', Blockly.JavaScript.ORDER_ATOMIC) || '1';
    return 'wait(' + seconds + ');\n';
  };

  Blockly.JavaScript['wait'] = function(block) {
    return 'wait(1);\n';
  };

  // Hand gesture blocks
  Blockly.JavaScript['wave_left_hand'] = function(block) {
    return 'waveLeftHand();\n';
  };

  Blockly.JavaScript['wave_right_hand'] = function(block) {
    return 'waveRightHand();\n';
  };

  // Magic casting blocks
  Blockly.JavaScript['cast_magic'] = function(block) {
    var spell = block.getFieldValue('SPELL');
    var statements = Blockly.JavaScript.statementToCode(block, 'INCANTATION');
    return 'castMagic("' + spell + '", function() {\n' + statements + '});\n';
  };

  Blockly.JavaScript['cast_healing'] = function(block) {
    return 'castHealing();\n';
  };

  Blockly.JavaScript['cast_healing_magic'] = function(block) {
    var statements = Blockly.JavaScript.statementToCode(block, 'INCANTATION');
    return 'castHealingMagic(function() {\n' + statements + '});\n';
  };

  Blockly.JavaScript['cast_fire_magic'] = function(block) {
    var statements = Blockly.JavaScript.statementToCode(block, 'INCANTATION');
    return 'castFireMagic(function() {\n' + statements + '});\n';
  };

  Blockly.JavaScript['cast_ice_magic'] = function(block) {
    var statements = Blockly.JavaScript.statementToCode(block, 'INCANTATION');
    return 'castIceMagic(function() {\n' + statements + '});\n';
  };

  // Alchemy blocks
  Blockly.JavaScript['brew_antidote'] = function(block) {
    return 'brewAntidote();\n';
  };

  Blockly.JavaScript['use_item'] = function(block) {
    return 'useItem();\n';
  };

  // Control blocks
  Blockly.JavaScript['repeat_twice'] = function(block) {
    var statements = Blockly.JavaScript.statementToCode(block, 'STACK');
    return 'for (var i = 0; i < 2; i++) {\n' + statements + '}\n';
  };

  // New repeat three times block
  Blockly.JavaScript['repeat_three_times'] = function(block) {
    var statements = Blockly.JavaScript.statementToCode(block, 'STACK');
    return 'for (var i = 0; i < 3; i++) {\n' + statements + '}\n';
  };
}

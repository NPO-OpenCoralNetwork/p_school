import "./style.css";
import Blockly from "scratch-blocks";
import "./blockly/blocks";
import toolboxXmlString from "./blockly/toolbox.xml";
import { getASTFromWorkspace } from "./vm/vm-loader";
import { runGameWithCommands } from "./game/engine";
import { Player } from "./game/player";
import { Enemy } from "./game/enemy";
import { UI } from "./game/ui";
import Phaser from "phaser";
import { BattleScene } from "./game/battle"; // BattleSceneのみをインポート
import { BattleScene2 } from "./game/BattleScene2"; // 正しいファイルからBattleScene2をインポート
import { MainMenuScene } from "./game/MainMenuScene";

// Blockly 初期化
window.onload = () => {
  console.log("Loading Blockly workspace...");
  
  // toolboxの設定
  let toolbox;
  try {
    const parser = new DOMParser();
    toolbox = parser.parseFromString(toolboxXmlString, "text/xml").documentElement;
    console.log("Toolbox loaded:", toolbox);
  } catch (e) {
    console.error("Error parsing toolbox:", e);
  }
  
  // Blocklyワークスペースの初期化
  const workspace = Blockly.inject("blocklyDiv", {
    toolbox: toolbox,
    media: "./media/",
    scrollbars: true,
    horizontalLayout: false,
    sounds: true,
    zoom: {
      controls: true,
      wheel: true,
      startScale: 0.75,
      maxScale: 4,
      minScale: 0.25,
      scaleSpeed: 1.1
    }
  });
  
  console.log("Workspace created:", workspace);
  
  // Phaser ゲーム起動
  const config = {
    type: Phaser.CANVAS,
    width: 800,
    height: 600,
    canvas: document.getElementById('gameCanvas'),
    scene: [MainMenuScene, BattleScene, BattleScene2]  // BattleScene2を追加
  };

  // ゲームインスタンスを作成
  const game = new Phaser.Game(config);

  // 「実行」ボタン
  document.getElementById("runButton").addEventListener("click", async () => {
    const ast = await getASTFromWorkspace(workspace);
    
    // アクティブなバトルシーンを取得（BattleSceneまたはStage2Battle）
    const battleScene = game.scene.getScene('BattleScene') || game.scene.getScene('Stage2Battle');
    
    if (battleScene && battleScene.scene.isActive()) {
      // バトルシーンがアクティブな場合、そのシーンのプレイヤーとエネミーを使用
      await runGameWithCommands(ast, { 
        player: battleScene.player, 
        enemy: battleScene.enemy 
      }, battleScene.ui || new UI());
    } else {
      console.warn('バトルシーンがアクティブではありません。コマンドは実行できません。');
    }
  });
};

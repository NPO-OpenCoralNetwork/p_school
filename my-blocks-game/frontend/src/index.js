import "./style.css";
import Blockly from "scratch-blocks";  // * as を削除
import "./blockly/blocks";
import toolboxXmlString from "./blockly/toolbox.xml";
import { getASTFromWorkspace } from "./vm/vm-loader";
import { runGameWithCommands } from "./game/engine";
import { Player } from "./game/player";
import { Enemy } from "./game/enemy";
import { UI } from "./game/ui";
import Phaser from "phaser";

// Blockly 初期化
window.onload = () => {  // DOMContentLoadedの代わりにwindow.onloadを使用
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
    media: "./media/",  // メディアパスの設定
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
    type: Phaser.CANVAS,  // 明示的にCANVASレンダラーを指定
    width: 800,
    height: 600,
    canvas: document.getElementById('gameCanvas'), // 既存のCanvas要素を使用
    scene: {
      preload,
      create
    }
  };
  let game, scene, ui, player, enemy;

  function preload() {
    // アセットをロード
    this.load.image('background', 'assets/battle-background.png');
    this.load.image('player', 'assets/player.png');
    this.load.image('enemy', 'assets/enemy.png');
    
    // UI要素
    this.load.image('hp-bar', 'assets/hp-bar.png');
    this.load.image('button', 'assets/button.png');
  }

  function create() {
    scene = this;
    
    // 背景を追加
    this.add.image(400, 300, 'background');
    
    // プレイヤーキャラクターを追加
    const playerSprite = this.add.sprite(200, 400, 'player').setScale(2);
    
    // 敵キャラクターを追加
    const enemySprite = this.add.sprite(600, 250, 'enemy').setScale(2);
    
    // HPバーを描画
    const playerHPBar = this.add.graphics();
    playerHPBar.fillStyle(0x00ff00, 1);  // 緑色
    playerHPBar.fillRect(100, 450, 200, 20);
    
    const enemyHPBar = this.add.graphics();
    enemyHPBar.fillStyle(0xff0000, 1);  // 赤色
    enemyHPBar.fillRect(500, 150, 200, 20);
    
    // テキストを追加
    this.add.text(100, 480, 'プレイヤー', { fontSize: '20px', fill: '#fff' });
    this.add.text(500, 120, '敵', { fontSize: '20px', fill: '#fff' });
    
    // バトルログエリア
    const logBackground = this.add.graphics();
    logBackground.fillStyle(0x000000, 0.7);
    logBackground.fillRect(100, 520, 600, 60);
    const battleLog = this.add.text(110, 530, 'バトル開始！行動を選択してください', 
      { fontSize: '18px', fill: '#fff' });
    
    // 魔法詠唱ヘルプテキスト
    const helpText = this.add.text(400, 50, 
      '魔法詠唱パターン:\n' +
      '炎: 右手→右手→左手\n' +
      '氷: 左手\n' +
      '雷: 右手→左手→右手→左手', 
      { fontSize: '16px', fill: '#fff', align: 'center' }
    ).setOrigin(0.5);
    
    // UIとゲーム状態を初期化
    ui = new UI();
    ui.logArea = battleLog;  // UIクラスにログテキストオブジェクトを渡す
    
    player = new Player(scene, ui);
    player.sprite = playerSprite;
    
    enemy = new Enemy(scene, ui);
    enemy.sprite = enemySprite;
    
    // HPの更新メソッドをオーバーライド
    ui.updateHP = function(playerHP, enemyHP) {
      playerHPBar.clear();
      playerHPBar.fillStyle(0x00ff00, 1);
      playerHPBar.fillRect(100, 450, playerHP * 2, 20);
      
      enemyHPBar.clear();
      enemyHPBar.fillStyle(0xff0000, 1);
      enemyHPBar.fillRect(500, 150, enemyHP * 4, 20);
      
      document.getElementById('playerHP').textContent = `Player: ${playerHP}`;
      document.getElementById('enemyHP').textContent = `Enemy: ${enemyHP}`;
    };
    
    // 初期HPを設定
    ui.updateHP(player.hp, enemy.hp);
  }

  game = new Phaser.Game(config);

  // 「実行」ボタン
  document.getElementById("runButton").addEventListener("click", async () => {
    const ast = await getASTFromWorkspace(workspace);
    await runGameWithCommands(ast, { player, enemy }, ui);
  });
};

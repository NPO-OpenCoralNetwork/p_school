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
import { BattleScene3 } from "./game/BattleScene3"; // ステージ3のシーン
import { BattleScene4 } from "./game/BattleScene4"; // ステージ4のシーン
import { BattleScene5 } from "./game/BattleScene5"; // ステージ5のシーン
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
  console.log("Initializing Blockly workspace...");
  const blocklyDiv = document.getElementById("blocklyDiv");
  console.log("BlocklyDiv element:", blocklyDiv);
  
  // blocklyDivを確実に表示状態にする
  if (blocklyDiv) {
    blocklyDiv.style.display = 'block';
    blocklyDiv.style.visibility = 'visible';
    blocklyDiv.style.width = '550px';
    blocklyDiv.style.height = '600px';
    console.log("BlocklyDiv display style set to:", blocklyDiv.style.display);
  }
  
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
      scaleSpeed: 1.1    }
  });
  
  console.log("Workspace created:", workspace);
  
  // リサイズ処理を追加
  window.addEventListener('resize', function() {
    // 遅延してリサイズを適用（ブラウザのサイズ変更中に何度も実行されるのを防ぐ）
    if (window.resizeTimeout) {
      clearTimeout(window.resizeTimeout);
    }
    window.resizeTimeout = setTimeout(function() {
      Blockly.svgResize(workspace);
    }, 250);
  });
    // カテゴリ選択時のスクロール機能を追加
  setupCategoryScrolling(workspace);
  
  // Phaser ゲーム起動
  const config = {
    type: Phaser.CANVAS,
    width: 800,
    height: 600,
    canvas: document.getElementById('gameCanvas'),
    scene: [MainMenuScene, BattleScene, BattleScene2, BattleScene3, BattleScene4, BattleScene5]  // BattleScene5を追加
  };
  // ゲームインスタンスを作成
  const game = new Phaser.Game(config);
  
  // コマンド実行関数を共通化
  const executeCommands = async () => {
    console.log("Run button clicked - executing commands");
    const ast = await getASTFromWorkspace(workspace);
    
    // 利用可能なシーンを確認
    const scenes = game.scene.getScenes();
    console.log("Available scenes:", scenes.map(scene => scene.scene.key));
      // アクティブなシーンを全て取得
    const activeScenes = scenes.filter(scene => scene.scene.isActive());
    console.log("Active scenes:", activeScenes.map(scene => scene.scene.key));
    
    // 現在有効なステージ名の配列（優先度順）
    const battleSceneKeys = ['Stage5Battle', 'Stage4Battle', 'Stage3Battle', 'Stage2Battle', 'BattleScene'];
    
    // アクティブなバトルシーンを探す (Stage3Battle または Stage2Battle または BattleScene)
    // battleSceneKeysの順で優先的に探す
    let battleScene = null;
    for (const key of battleSceneKeys) {
      battleScene = activeScenes.find(scene => scene.scene.key === key);
      if (battleScene) {
        console.log(`Found active battle scene: ${key}`);
        break;
      }
    }
    
    console.log("Found battle scene:", battleScene?.scene?.key);
    
    if (battleScene) {
      console.log("Executing commands with player:", battleScene.player, "and enemy:", battleScene.enemy);
      // バトルシーンがアクティブな場合、そのシーンのプレイヤーとエネミーを使用
      await runGameWithCommands(ast, { 
        player: battleScene.player, 
        enemy: battleScene.enemy,
        scene: battleScene // シーンそのものも渡す
      }, battleScene.ui || new UI());
    } else {
      console.warn('バトルシーンがアクティブではありません。コマンドは実行できません。');    }
  };
  
  // 「実行」ボタンにイベントリスナーを追加
  document.getElementById("runButton").addEventListener("click", executeCommands);
  
  // カスタムイベントも購読（BattleScene2からも実行できるように）
  document.addEventListener("blockly-run", executeCommands);
};

/**
 * カテゴリ選択時に対応するブロックにスクロールする機能をセットアップ
 * @param {Object} workspace - Blocklyのワークスペース
 */
function setupCategoryScrolling(workspace) {
  console.log('カテゴリスクロール機能をセットアップしています...');
  
  // 前回選択されたカテゴリを記録する変数
  let lastSelectedCategoryName = '';
  
  // カテゴリ選択イベントをリッスン
  const observer = new MutationObserver(mutations => {
    // 選択されたカテゴリ要素を取得
    const selectedCategory = document.querySelector('.blocklyToolboxCategory.categorySelected');
    if (!selectedCategory) return;
    
    // カテゴリ名を取得
    const categoryLabel = selectedCategory.querySelector('.blocklyTreeLabel');
    if (!categoryLabel) return;
    
    const categoryName = categoryLabel.textContent.trim();
    
    // 同じカテゴリが再選択された場合はスキップ
    if (categoryName === lastSelectedCategoryName) return;
    
    console.log(`カテゴリー選択検出: ${categoryName}`);
    lastSelectedCategoryName = categoryName;
    
    // Blocklyがフライアウト内のブロックを展開するのを待つ
    setTimeout(() => {
      scrollToCategory(workspace, categoryName);
    }, 200);  // 200msの遅延でより確実にブロックが展開された後に実行
  });
  
  // カテゴリボタンのクリックイベントを追加
  function addCategoryClickHandlers() {
    const categories = document.querySelectorAll('.blocklyTreeRow');
    categories.forEach(category => {
      if (!category._hasScrollListener) {
        category.addEventListener('click', function(e) {
          const label = this.querySelector('.blocklyTreeLabel');
          if (label) {
            const categoryName = label.textContent.trim();
            console.log(`カテゴリークリック: ${categoryName}`);
            // クリック時にも同様の遅延処理
            setTimeout(() => {
              scrollToCategory(workspace, categoryName);
            }, 200);
          }
        });
        category._hasScrollListener = true;
      }
    });
  }
  
  // ツールボックスのDOM変更を監視
  const toolboxElement = document.querySelector('.blocklyToolboxDiv');
  if (toolboxElement) {
    console.log('ツールボックス要素を監視中');
    
    // クラス変更を監視（カテゴリ選択状態の変更）
    observer.observe(toolboxElement, {
      attributes: true,
      attributeFilter: ['class'],
      subtree: true,
      childList: true
    });
    
    // 初期カテゴリボタンへのイベントリスナー追加
    setTimeout(addCategoryClickHandlers, 500);
    
    // DOM変更時にもカテゴリボタンイベントを再追加
    const domObserver = new MutationObserver(() => {
      addCategoryClickHandlers();
    });
    
    domObserver.observe(toolboxElement, {
      childList: true,
      subtree: true
    });
  } else {
    console.warn('ツールボックス要素が見つかりません');
  }
}

/**
 * 指定されたカテゴリに対応するブロック領域にスクロール
 * @param {Object} workspace - Blocklyのワークスペース
 * @param {string} categoryName - カテゴリ名
 */
function scrollToCategory(workspace, categoryName) {
  console.log(`スクロール処理開始: ${categoryName}`);

  // フライアウトに表示されたブロック要素を取得
  const flyoutBlocks = document.querySelectorAll('.blocklyFlyout .blocklyBlockCanvas g.blocklyDraggable');
  if (!flyoutBlocks || flyoutBlocks.length === 0) {
    console.log('フライアウトブロックが見つかりません');
    return;
  }

  // まず定義済みの推奨ブロックを探す
  const preferredBlockTypes = getBlockTypesByCategory(categoryName);
  const preferredBlock = findPreferredBlock(flyoutBlocks, preferredBlockTypes);

  if (preferredBlock) {
    scrollToBlock(preferredBlock);
    console.log(`推奨ブロックが見つかりました: ${preferredBlock.getAttribute('data-type')}`);
    return;
  }

  // 推奨ブロックが見つからない場合、最初のブロックへスクロール
  console.log(`推奨ブロックが見つからないため、最初のブロックへスクロールします`);
  scrollToBlock(flyoutBlocks[0]);
}

/**
 * 推奨ブロックを見つける
 * @param {NodeList} flyoutBlocks - フライアウト内のブロック要素
 * @param {string[]} preferredBlockTypes - 優先的に探すブロックタイプの配列
 * @return {Element|null} - 見つかったブロック要素、または null
 */
function findPreferredBlock(flyoutBlocks, preferredBlockTypes) {
  if (!preferredBlockTypes || preferredBlockTypes.length === 0) return null;

  for (const blockType of preferredBlockTypes) {
    for (const block of flyoutBlocks) {
      const type = block.getAttribute('data-type');
      if (type === blockType) return block;
    }
  }
  return null;
}

/**
 * 指定されたブロック要素へスクロール
 * @param {Element} blockElement - スクロール先のブロック要素
 */
function scrollToBlock(blockElement) {
  const blockBounds = blockElement.getBoundingClientRect();
  const flyout = document.querySelector('.blocklyFlyout');
  
  if (flyout && blockBounds) {
    // 計算する前にコンソールに情報をログ
    console.log(`ブロック位置: ${blockBounds.top}, フライアウト位置: ${flyout.getBoundingClientRect().top}`);
    
    // フライアウト内の位置にスクロール (上端に少し余白を追加)
    const scrollTop = blockBounds.top - flyout.getBoundingClientRect().top;
    console.log(`計算されたスクロール位置: ${scrollTop}`);
    
    // アニメーションなしでスクロール
    flyout.scrollTop = Math.max(0, scrollTop - 20);
    
    // ハイライトエフェクトを追加
    addHighlightEffect(blockElement);
  }
}

/**
 * ブロックにハイライトエフェクトを追加
 * @param {Element} blockElement - ハイライトするブロック要素
 */
function addHighlightEffect(blockElement) {
  // 現在のクラスリストを保存
  const originalClassList = blockElement.getAttribute('class');
  
  // ハイライトクラスを追加
  blockElement.classList.add('blocklyHighlighted');
  
  // 一時的なスタイルを追加
  blockElement.style.filter = 'drop-shadow(0 0 6px rgba(66, 133, 244, 0.8))';
  blockElement.style.transition = 'all 0.3s ease';
  blockElement.style.transform = 'scale(1.03)';
  
  // 1秒後にハイライトを削除
  setTimeout(() => {
    blockElement.style.filter = '';
    blockElement.style.transform = '';
    
    setTimeout(() => {
      blockElement.style.transition = '';
      blockElement.classList.remove('blocklyHighlighted');
    }, 300);
  }, 1000);
}

/**
 * カテゴリ名に基づいてブロックタイプの配列を返す
 * @param {string} categoryName - カテゴリ名
 * @return {string[]} - ブロックタイプの配列
 */
function getBlockTypesByCategory(categoryName) {
  switch (categoryName) {
    case '基本アクション':
      return ['attack', 'heal', 'wait_seconds'];
    case '回復魔法':
      return ['cast_healing', 'cast_healing_magic'];
    case '魔法詠唱':
      return ['cast_magic', 'cast_fire_magic', 'wave_left_hand', 'wave_right_hand'];
    default:
      return [];
  }
}

// ========== ログイン・プロフィール管理機能 ==========

// 既存のSupabase関数をimport
import { signIn, signUp, signOut, getProfile, updateExperience, addBadge } from './lib/profile.js';

// ログイン・プロフィール管理
class GameLoginManager {
  constructor() {
    this.currentProfile = null;
    this.setupEventListeners();
  }

  setupEventListeners() {
    // ログインボタン
    document.getElementById('loginButton').addEventListener('click', () => {
      this.handleLogin();
    });

    // 新規登録ボタン
    document.getElementById('signupButton').addEventListener('click', () => {
      this.handleSignup();
    });

    // ログアウトボタン
    document.getElementById('logoutButton').addEventListener('click', () => {
      this.handleLogout();
    });

    // プロフィール表示切り替え
    document.getElementById('profileToggle').addEventListener('click', () => {
      this.toggleProfile();
    });

    // フォーム切り替え
    document.getElementById('showSignupForm').addEventListener('click', () => {
      this.showSignupForm();
    });

    document.getElementById('showLoginForm').addEventListener('click', () => {
      this.showLoginForm();
    });

    // エンターキーでログイン
    document.getElementById('loginPassword').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.handleLogin();
      }
    });

    document.getElementById('signupPassword').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.handleSignup();
      }
    });
  }

  showSignupForm() {
    document.getElementById('loginForm').classList.remove('active');
    document.getElementById('signupForm').classList.add('active');
    this.clearMessages();
  }

  showLoginForm() {
    document.getElementById('signupForm').classList.remove('active');
    document.getElementById('loginForm').classList.add('active');
    this.clearMessages();
  }

  async handleLogin() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const button = document.getElementById('loginButton');

    if (!email || !password) {
      this.showError('メールアドレスとパスワードを入力してください');
      return;
    }

    try {
      // ローディング表示
      button.disabled = true;
      button.innerHTML = 'ログイン中... <div class="loading"></div>';

      // 実際のSupabase認証
      const user = await signIn(email, password);
      console.log('ログイン成功:', user);

      // プロフィール取得
      this.currentProfile = await getProfile();
      console.log('プロフィール取得:', this.currentProfile);

      this.showGameScreen();
      this.clearMessages();

    } catch (error) {
      console.error('ログインエラー:', error);
      this.showError('ログインに失敗しました: ' + error.message);
    } finally {
      button.disabled = false;
      button.innerHTML = 'ログイン';
    }
  }

  async handleSignup() {
    const username = document.getElementById('signupUsername').value;
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const button = document.getElementById('signupButton');

    if (!username || !name || !email || !password) {
      this.showError('全ての項目を入力してください');
      return;
    }

    if (password.length < 6) {
      this.showError('パスワードは6文字以上で入力してください');
      return;
    }

    try {
      // ローディング表示
      button.disabled = true;
      button.innerHTML = '登録中... <div class="loading"></div>';

      // 実際のSupabase新規登録
      const user = await signUp(email, password, username, name);
      console.log('新規登録成功:', user);

      this.showSuccess('登録が完了しました！メールを確認してアカウントを有効化してください。');
      
      // 少し待ってからログインフォームに切り替え
      setTimeout(() => {
        this.showLoginForm();
        document.getElementById('loginEmail').value = email;
      }, 2000);

    } catch (error) {
      console.error('新規登録エラー:', error);
      this.showError('新規登録に失敗しました: ' + error.message);
    } finally {
      button.disabled = false;
      button.innerHTML = '新規登録';
    }
  }

  async handleLogout() {
    try {
      await signOut();
      this.currentProfile = null;
      document.getElementById('loginScreen').style.display = 'flex';
      document.getElementById('gameScreen').style.display = 'none';
      
      // フォームをクリア
      document.getElementById('loginEmail').value = '';
      document.getElementById('loginPassword').value = '';
      document.getElementById('signupUsername').value = '';
      document.getElementById('signupName').value = '';
      document.getElementById('signupEmail').value = '';
      document.getElementById('signupPassword').value = '';
      
      this.showLoginForm();
      this.clearMessages();
      
    } catch (error) {
      console.error('ログアウトエラー:', error);
    }
  }

  showGameScreen() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('gameScreen').style.display = 'block';
    this.updateProfileDisplay();
  }

  showError(message) {
    const errorDiv = document.getElementById('authError');
    const successDiv = document.getElementById('authSuccess');
    successDiv.style.display = 'none';
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
  }

  showSuccess(message) {
    const errorDiv = document.getElementById('authError');
    const successDiv = document.getElementById('authSuccess');
    errorDiv.style.display = 'none';
    successDiv.textContent = message;
    successDiv.style.display = 'block';
  }

  clearMessages() {
    document.getElementById('authError').style.display = 'none';
    document.getElementById('authSuccess').style.display = 'none';
  }

  toggleProfile() {
    const content = document.getElementById('profileContent');
    const button = document.getElementById('profileToggle');
    
    if (content.classList.contains('visible')) {
      content.classList.remove('visible');
      button.textContent = '👤 プロフィール表示';
    } else {
      content.classList.add('visible');
      button.textContent = '👤 プロフィール非表示';
      this.updateProfileDisplay();
    }
  }

  updateProfileDisplay() {
    if (!this.currentProfile) return;

    const currentLevel = Math.floor(this.currentProfile.experience_points / 100);
    const currentLevelExp = this.currentProfile.experience_points - (currentLevel * 100);
    const expToNext = 100 - currentLevelExp;
    const expPercentage = (currentLevelExp / 100) * 100;

    document.getElementById('profileName').textContent = this.currentProfile.name;
    document.getElementById('profileLevel').textContent = `Lv.${currentLevel}`;
    document.getElementById('profileExp').textContent = this.currentProfile.experience_points;
    document.getElementById('profileTrophies').textContent = this.currentProfile.trophy_count;
    document.getElementById('expToNext').textContent = `次のレベルまで: ${expToNext}`;
    document.getElementById('expBar').style.width = `${expPercentage}%`;

    // バッジ表示
    const badgesContainer = document.getElementById('profileBadges');
    badgesContainer.innerHTML = '';
    if (this.currentProfile.badges && this.currentProfile.badges.length > 0) {
      this.currentProfile.badges.forEach(badge => {
        const badgeElement = document.createElement('span');
        badgeElement.className = 'badge';
        badgeElement.textContent = badge;
        badgesContainer.appendChild(badgeElement);
      });
    } else {
      badgesContainer.innerHTML = '<span style="color: #999; font-size: 12px;">まだバッジがありません</span>';
    }
  }

  // バトル勝利時の経験値追加
  async addExperience(points) {
    if (!this.currentProfile) return;

    try {
      const oldLevel = Math.floor(this.currentProfile.experience_points / 100);
      const newExpPoints = this.currentProfile.experience_points + points;
      
      // データベース更新
      const updatedProfile = await updateExperience(newExpPoints);
      
      if (updatedProfile && updatedProfile.length > 0) {
        this.currentProfile = updatedProfile[0];
        
        const newLevel = Math.floor(this.currentProfile.experience_points / 100);

        // レベルアップ処理
        if (newLevel > oldLevel) {
          await this.handleLevelUp(newLevel);
          this.showLevelUpEffect(newLevel);
        }

        this.updateProfileDisplay();
        return { levelUp: newLevel > oldLevel, newLevel, earnedExp: points };
      }
    } catch (error) {
      console.error('経験値更新エラー:', error);
    }
  }

  async handleLevelUp(newLevel) {
    try {
      // レベルアップバッジ
      const levelBadges = {
        5: 'レベル5達成',
        10: 'レベル10達成',
        20: 'レベル20達成',
        50: 'レベル50達成'
      };

      if (levelBadges[newLevel]) {
        const updatedProfile = await addBadge(levelBadges[newLevel]);
        if (updatedProfile && updatedProfile.length > 0) {
          this.currentProfile = updatedProfile[0];
        }
      }
    } catch (error) {
      console.error('レベルアップバッジ追加エラー:', error);
    }
  }

  showLevelUpEffect(newLevel) {
    // レベルアップのポップアップ表示（CSSクラス版）
    const popup = document.createElement('div');
    popup.className = 'level-up-popup';
    popup.innerHTML = `🎉<br>LEVEL UP!<br>Lv.${newLevel}`;

    document.body.appendChild(popup);

    setTimeout(() => {
      document.body.removeChild(popup);
    }, 2000);
  }
}

// ゲームログイン管理の初期化
window.gameLoginManager = new GameLoginManager();

// 既存のindex.jsから呼び出される関数（グローバルに公開）
window.addGameExperience = (points) => {
  return window.gameLoginManager.addExperience(points);
};

// ステージクリア時のバッジ追加関数も公開
window.addStageBadge = async (stageName) => {
  if (window.gameLoginManager.currentProfile) {
    try {
      const badgeName = `${stageName}初回クリア`;
      const updatedProfile = await addBadge(badgeName);
      if (updatedProfile && updatedProfile.length > 0) {
        window.gameLoginManager.currentProfile = updatedProfile[0];
        window.gameLoginManager.updateProfileDisplay();
      }
    } catch (error) {
      console.error('ステージバッジ追加エラー:', error);
    }
  }
};

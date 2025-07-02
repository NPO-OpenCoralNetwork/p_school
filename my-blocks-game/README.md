# ブロックプログラミングバトルゲーム

## プロジェクト概要

ブロックプログラミングを使って魔法詠唱や戦略を組み立てて敵と戦うバトルゲームです。Scratch風のブロックエディタで戦闘コマンドを作成し、実行することで敵とバトルすることができます。

---

## プロジェクト構造図

```mermaid
graph TD
    subgraph frontend
        index[index.js]
        blockly[blockly/]
        game[game/]
        vm[vm-loader.js]
    end
    
    subgraph blockly
        blocks[blocks.js]
        toolbox[toolbox.xml]
    end
    
    subgraph game
        engine[engine.js]
        player[player.js]
        enemy[enemy.js]
        ui[ui.js]
        utils[utils.js]
        battle[battle.js]
    end
    
    index --> blockly
    index --> game
    index --> vm
    
    game --> player
    game --> enemy
    game --> ui
    game --> utils
    
    vm --> blockly
```

## 実行フロー

```mermaid
sequenceDiagram
    participant User as ユーザー
    participant Blockly as ブロックエディタ
    participant VM as vm-loader
    participant Engine as engine.js
    participant Player as player.js
    participant Enemy as enemy.js
    participant UI as ui.js
    
    User->>Blockly: ブロックの配置
    User->>Blockly: 実行ボタンをクリック
    Blockly->>VM: ワークスペース情報を渡す
    VM->>Engine: AST(抽象構文木)を生成
    
    loop コマンド実行
        Engine->>Player: プレイヤーアクション実行
        Player->>UI: アクションを表示
        Player->>UI: HP更新
    end
    
    Engine->>Enemy: 敵のターン実行
    Enemy->>UI: 敵のアクションを表示
    Enemy->>UI: HP更新
```

---

## フォルダ構成

```
my-blocks-game/
├── frontend/                   # フロントエンドアプリケーション
│   ├── public/                 # 静的ファイル
│   │   └── index.html          # メインHTMLファイル
│   ├── src/                    # ソースコード
│   │   ├── blockly/            # Blockly関連ファイル
│   │   │   ├── blocks.js       # カスタムブロック定義
│   │   │   └── toolbox.xml     # ブロックツールボックス設定
│   │   ├── game/               # ゲームロジック
│   │   │   ├── battle.js       # バトルシーン
│   │   │   ├── enemy.js        # 敵キャラクターロジック
│   │   │   ├── engine.js       # ゲーム実行エンジン
│   │   │   ├── player.js       # プレイヤーロジック
│   │   │   ├── ui.js           # UI管理
│   │   │   └── utils.js        # ユーティリティ関数
│   │   ├── vm/                 # 実行エンジン
│   │   │   └── vm-loader.js    # BlocklyからAST生成
│   │   ├── index.js            # アプリケーションエントリーポイント
│   │   └── style.css           # スタイル定義
│   ├── package.json            # npm依存関係
│   └── webpack.config.js       # Webpackビルド設定
└── wasm-game-core/             # Rust/WASM機能
    ├── src/                    # Rustソース
    │   └── lib.rs              # WASMエクスポート関数
    └── Cargo.toml              # Rust依存関係
```

---

## 各ファイルの役割

### フロントエンド

#### `index.html`
- **役割**: アプリケーションのメインHTML構造を定義。HPバー、ゲームキャンバス、ブロックエディタを配置
- **実行時**: ページロード時に最初に読み込まれ、DOMツリーを構築

#### `index.js`
- **役割**: アプリケーションのエントリーポイント。Blocklyの初期化、Phaserゲームの設定、イベントハンドラの設定
- **実行時**: HTML読み込み後に`window.onload`で実行され、ゲーム全体を初期化

#### `blocks.js`
- **役割**: Scratch-Blocksライブラリで使用するカスタムブロックを定義（攻撃、魔法、回復など）
- **実行時**: `index.js`からインポートされ、Blockly初期化時に各ブロックタイプが登録される

#### `toolbox.xml`
- **役割**: Blocklyエディタで使用可能なブロック一覧を定義するXMLファイル
- **実行時**: Blockly初期化時にエディタのツールボックスの内容として読み込まれる

#### `engine.js`
- **役割**: ブロックコマンドの実行エンジン。ASTを受け取り実際のゲーム処理を実行。魔法詠唱パターンの検証
- **実行時**: 実行ボタンクリック後、ASTが生成された後に呼び出され、プレイヤーアクションと敵アクションを処理

#### `player.js`
- **役割**: プレイヤーキャラクターのロジッククラス。攻撃、魔法詠唱、回復などのアクション
- **実行時**: `engine.js`がASTを処理する中で、対応するプレイヤーアクションが呼び出される

#### `enemy.js`
- **役割**: 敵キャラクターのロジッククラス。敵のターン処理、攻撃、ダメージ計算
- **実行時**: プレイヤーのコマンド実行後、`engine.js`から呼び出されて敵のターンを実行する

#### `ui.js`
- **役割**: ゲーム内UIを管理するクラス。ログメッセージの表示やHP表示の更新
- **実行時**: ゲーム起動時に初期化され、アクション実行中にログ表示やHPの更新のために呼び出される

#### `utils.js`
- **役割**: 共通ユーティリティ関数を提供。主にPromiseベースの遅延処理機能
- **実行時**: アニメーションの表示や処理の間に適切な遅延を挿入するために随時呼び出される

#### `battle.js`
- **役割**: Phaserを使ったバトルシーンのクラス。背景、キャラクター、UIの描画と更新
- **実行時**: Phaserゲーム初期化時にシーンとして登録され、画面描画や更新を行う

#### `vm-loader.js`
- **役割**: BlocklyワークスペースからAST(抽象構文木)を生成するユーティリティ
- **実行時**: 実行ボタンが押されたときに最初に呼び出され、エディタのブロックからASTを生成

#### `style.css`
- **役割**: アプリケーションのスタイル定義。ゲーム要素のレイアウトやデザイン
- **実行時**: `index.js`からインポート時に適用され、UIコンポーネントにスタイルを提供

#### `webpack.config.js`
- **役割**: Webpackによるアプリケーションのビルド設定。エントリーポイント、出力設定、モジュールローダーを定義
- **実行時**: 開発サーバー起動時（`npm start`）やビルド時にWebpackによって読み込まれる

### WASM機能

#### `lib.rs`
- **役割**: WebAssemblyで実装されたゲームコア機能。将来的に処理速度が重要な部分を実装予定
- **実行時**: 現時点では実際には使用されていないが、JSからWasm関数として呼び出される設計

#### `Cargo.toml`
- **役割**: Rustプロジェクトの設定ファイル。依存関係やWASMビルド設定を定義
- **実行時**: `cargo`コマンド実行時や`wasm-pack`ビルド時に参照される

---

## 実行フローの詳細

```mermaid
flowchart TD
    A[実行ボタンクリック] --> B[BlocklyからAST生成]
    B --> C{AST解析}
    C -->|攻撃コマンド| D[player.attack実行]
    C -->|魔法詠唱開始| E[詠唱パターン記録開始]
    C -->|手を振る| F[詠唱パターンに追加]
    C -->|回復| G[player.heal実行]
    C -->|待機| H[delay実行]
    
    E --> I{詠唱完了}
    F --> I
    I -->|パターン一致| J[魔法発動]
    I -->|パターン不一致| K[魔法失敗]
    
    D --> L[敵のターン実行]
    G --> L
    H --> L
    J --> L
    K --> L
    
    L --> M[UI更新]
    M --> N[バトル継続]
```

## 魔法詠唱パターン

```mermaid
graph LR
    Start[詠唱開始] --> F{FIRE}
    Start --> I{ICE}
    Start --> T{THUNDER}
    
    F -->|右手| F1[Step 1]
    F1 -->|右手| F2[Step 2]
    F2 -->|左手| Success1[成功]
    
    I -->|左手| Success2[成功]
    
    T -->|右手| T1[Step 1]
    T1 -->|左手| T2[Step 2]
    T2 -->|右手| T3[Step 3]
    T3 -->|左手| Success3[成功]
    
    F -->|誤ったパターン| Fail1[失敗]
    I -->|誤ったパターン| Fail2[失敗]
    T -->|誤ったパターン| Fail3[失敗]
```

---

## 特殊な機能：魔法詠唱パターン

このゲームでは以下の魔法詠唱パターンが実装されています：

- **炎の魔法**: 右手 → 右手 → 左手
- **氷の魔法**: 左手
- **雷の魔法**: 右手 → 左手 → 右手 → 左手

---

## 開発環境のセットアップ

```bash
# フロントエンド
cd frontend
npm install
npm start

# WASMコンポーネント（必要な場合）
cd wasm-game-core
wasm-pack build --target web
```

---

## 技術スタック

- **Blockly / Scratch-Blocks**: ビジュアルプログラミングインターフェース
- **Phaser**: 2Dゲームエンジン
- **Webpack**: モジュールバンドラー
- **Rust / WebAssembly**: 高速な処理が必要な部分（将来的な拡張用）
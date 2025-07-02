# WASM Game Core

ブロックプログラミングバトルゲームのコア機能をWebAssemblyで実装したモジュールです。以下の機能を提供します：

- ASTの構文解析と検証
- アクションの評価・生成
- 魔法詠唱パターンの検証

## 前提条件

以下のツールがインストールされている必要があります：

- [Rust](https://www.rust-lang.org/) (安定版)
- [wasm-pack](https://rustwasm.github.io/wasm-pack/installer/)

## ビルド方法

このディレクトリ内で以下のコマンドを実行します：

```bash
wasm-pack build --target web
```

成功すると、`pkg`ディレクトリが作成され、コンパイル済みのWASMファイルとJavaScriptラッパーが生成されます。

## フロントエンドとの統合

フロントエンドからWASMを使用するには、`wasm-bridge.js`からエクスポートされている関数を呼び出します：

```javascript
import { initWasm, parseAst, evaluateAst, evaluateMagicPattern } from '../wasm/wasm-bridge';

// 初期化
await initWasm();

// ASTの解析
const parsedAst = await parseAst(astJson);

// ASTの評価（アクションリストの生成）
const actions = await evaluateAst(parsedAst);

// 魔法詠唱パターンの評価
const result = await evaluateMagicPattern('FIRE', 'right,right,left');
```

## 機能の説明

### ASTパーサー（ast/parser.rs）

Blocklyのブロックから生成されたJSONベースのASTを解析し、型安全な形式に変換します。各ブロックの検証も行います。

### アクション評価器（ast/evaluator.rs）

ASTからゲーム内で実行可能なアクションのリストを生成します。これにより、プログラムブロックをゲーム内のキャラクターの動きに変換します。

### 魔法詠唱パターン評価（magic/patterns.rs）

魔法の詠唱パターン（例: 右手、右手、左手）を検証し、正しいパターンかどうかを判定します。

## エラー処理

WAMSが利用できない場合や、エラーが発生した場合は、JavaScriptで実装されたフォールバック関数が使用されます。フォールバック実装は`engine.js`の`evaluateAstJs`関数に実装されています。
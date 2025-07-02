# Discord Supabase Bot

Discord BotとSupabaseデータベースを連携したデータ操作システム

## 概要

このプロジェクトは、DiscordのスラッシュコマンドからSupabaseデータベースの情報を取得できるBotシステムです。

## 機能

- `/db test` - データベース接続テスト
- `/db select table:テーブル名` - 指定テーブルからデータ取得（最大5件）
- `/db select table:テーブル名 limit:数値` - 指定件数でデータ取得

## 技術スタック

- **Node.js** - サーバーサイド実行環境
- **Discord.js** - Discord Bot開発ライブラリ
- **Supabase** - PostgreSQLベースのBaaS
- **dotenv** - 環境変数管理

## セットアップ

### 1. 依存関係のインストール
```bash
npm install

### コマンド追加のファイル
node commands/deploy.js

### Bot起動ファイル（DiscordのみだとBotを起動させることができないそうで、私は GitBash で起動させています）
node index.js

### ファイル構成
discord-supabase-clean/
├── index.js              # メインBotファイル
├── commands/
│   ├── database.js       # データベース操作コマンド
│   └── deploy.js         # コマンド登録スクリプト
├── utils/
│   └── supabase.js       # Supabase接続設定
├── .env                  # 環境変数（要作成）
└── package.json          # プロジェクト設定

※envファイルには、TOKENなどの情報が入っているため、PRしておりません


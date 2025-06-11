const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  mode: "development",
  entry: "./src/index.js",
  output: {
    filename: "[name].[contenthash].js",
    path: path.resolve(__dirname, "dist"),
    clean: true
  },
  experiments: {
    asyncWebAssembly: true,
    syncWebAssembly: true,
  },
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all'
        }
      }
    }
  },  devServer: {
    static: [
      path.join(__dirname, "dist"),
      // publicフォルダーからアセットにアクセスできるようにする
      {
        directory: path.join(__dirname, "public"),
        publicPath: "/"
      },
      // 開発サーバーからWASMファイルにアクセスできるようにする
      { 
        directory: path.resolve(__dirname, '../wasm-game-core/pkg'),
        publicPath: '/wasm-game-core/pkg'
      }
    ],
    port: 8080,
    hot: true
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: "babel-loader"
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"]
      },
      {
        test: /\.xml$/,
        use: "raw-loader"
      },
      {
        test: /\.(mp3|wav|ogg)$/,
        type: "asset/resource"
      },
      {
        test: /\.wasm$/,
        type: "asset/resource"
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./public/index.html"
    }),    // メディアファイルをコピーするプラグインを追加
    new CopyPlugin({
      patterns: [
        { from: "node_modules/scratch-blocks/media", to: "media" },
        // WAMSビルド後の成果物をdistにコピー
        { 
          from: path.resolve(__dirname, "../wasm-game-core/pkg"), 
          to: "wasm-game-core/pkg",
          noErrorOnMissing: true
        },
        // アセットフォルダーをコピー
        { 
          from: "public/assets", 
          to: "assets",
          noErrorOnMissing: true
        },
      ],
    }),
  ],
  resolve: {
    extensions: ['.js', '.wasm']
  }
};
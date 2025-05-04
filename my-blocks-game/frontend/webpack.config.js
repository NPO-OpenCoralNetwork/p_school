const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  mode: "development", // 開発中は development モードを使用
  entry: "./src/index.js",
  output: {
    filename: "[name].[contenthash].js",
    path: path.resolve(__dirname, "dist"),
    clean: true // 古いファイルの自動クリーンアップ
  },
  optimization: {
    splitChunks: {
      chunks: 'all',
      // サードパーティライブラリを別バンドルに
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all'
        }
      }
    }
  },
  devServer: {
    static: path.join(__dirname, "dist"),
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
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./public/index.html"
    }),
    // メディアファイルをコピーするプラグインを追加
    new CopyPlugin({
      patterns: [
        { from: "node_modules/scratch-blocks/media", to: "media" },
      ],
    }),
  ]
};
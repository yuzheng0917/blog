const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'build')
  },
  module: {
    rules: [
      // loader配置

    ]
  },
  plugins: [
    // plugin配置
    // 默认创建一个空html文件， 自动引入打包后输出的所有资源（js/css）
    new HtmlWebpackPlugin({
      // 复制index.html文件，并自动引入打包资源
      template: './index.html',
    }),
  ],
  mode: 'development'
}
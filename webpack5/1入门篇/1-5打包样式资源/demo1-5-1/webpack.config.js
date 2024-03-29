const path = require('path');

module.exports = {
  // 入口起点
  entry: './src/index.js',
  // 输出
  output: {
    // 输出文件名，把所有依赖的模块合并输出到一个 bundle.js 文件
    filename: 'bundle.js',
    // 输出路径，绝对路径，输出文件都放到 build 目录下
    // __dirname是nodejs的变量，代表当前文件（即webpack.config.js）的目录（即demo1-5-1）的绝对路径
    path: path.resolve(__dirname, './build'),
  },
  // loader配置
  module: {
    rules: [
      // 详细的loader配置
    ]
  },
  // plugins配置
  plugins: [
    // 详细的plugins配置
  ],
  mode: 'development',
  // mode: 'production'
};
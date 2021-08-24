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
      {
        // 匹配哪些文件
        test: /\.css$/,
        // 使用哪些loader处理
        use: [
          // loader执行顺序：从右到左，从下到上依次执行
          // 创建style标签，将js中的样式资源插入到style标签内，然后添加到html head中
          'style-loader',
          // 将css文件转换成样式字符串，变成commonjs模块，并整合到js文件中
          'css-loader'
        ]
      }
    ]
  },
  // plugins配置
  plugins: [
    // 详细的plugins配置
  ],
  mode: 'development',
  // mode: 'production'
};
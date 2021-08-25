### 打包html资源

之前我们都是在 `build` 目录下新建 `index.html` 引用打包后的 `bundle.js` 文件，之后才能让 `index.html` 在浏览器中运行起来。实际项目远比这复杂，一个页面常常有很多资源要加载，若手动去引用这些资源，不仅繁琐而且极易出错，`html-webpack-plugin` 插件可以帮我们解决上述痛点。

`cd` 根目录，安装 `html-webpack-plugin`

    npm i html-webpack-plugin -D

    + html-webpack-plugin@5.3.2

`webpack.config.js` 如下：

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
        new HtmlWebpackPlugin(),
      ],
      mode: 'development'

最终 `build` 目录下生成了一个 `index.html` 文件，并且引用了 `bundle.js` 文件

    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Webpack App</title>
      <meta name="viewport" content="width=device-width, initial-scale=1"><script defer src="bundle.js"></script></head>
      <body>
      </body>
    </html>

`index.html` 是个空壳子，若我们想提前预置一些内容，需要建立一个 `html` 文件作为模板

`cd demo1-6-2` 新建 `html` 模板文件：

`index.html` 如下：

    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>demo1-6-2</title>
    </head>
    <body>
      <h1 id="#title">hello webpack</h1>  
    </body>
    </html>

`webpack.config.js` 如下：

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
          // 复制index.html文件，并自动引入打包后输出的所有资源（js/css）
          template: './index.html',
        }),
      ],
      mode: 'development'
    }

 最终打包后的 `index.html` 如下，它以 `demo1-6-2/index.html.js` 文件为模板，并自动引入了 `bundle.js` 文件

    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>demo1-6-2</title>
    <script defer src="bundle.js"></script></head>
    <body>
      <h1 id="#title">hello webpack</h1>  
    </body>
    </html>   
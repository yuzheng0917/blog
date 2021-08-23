### `webpack`核心概念
- `Entry`：入口指示，告诉`Webpack`以哪个文件作为入口起点开始打包，并以此分析构建内部依赖图。
- `Output`：输出指示，告诉`Webpack`打包最终生成的`bundles`要输出到哪个文件下，以及如何命名这些文件。
- `Loader`：模块转换器，将所有类型的文件转换为 `webpack` 能够识别的有效模块（类似于翻译官，将英文翻译成中文，那么中国人就可以听懂了），以便`webpack`进一步打包处理。
- `Plugin`：扩展插件，`Loader`能做的事情有限，一些更复杂、功能更加强大的任务就需要`Plugin`去处理了，比如优化、压缩、重新定义环境变量等。
- `Mode`: 模式，指示`webpack`使用哪种模式的配置去打包。
  `development`模式功能相对简单，能让代码在本地调试运行即可，`production`模式需要优化性能和处理兼容性。

  | 选项        | 描述                                                                                                                                                                                                              |
  | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | development | 会将process.env.NODE_ENV设为development，启用NamedChunksPlugin和NamedModulesPlugin                                                                                                                                |
  | production  | 会将process.env.NODE_ENV设为production，启用FlagDependencyUsagePlugin，FlagIncludedChunksPlugin，ModuleConcatenationPlugin，NoEmitOnErrorsPlugin，OccurrenceOrderPlugin， sideEffectsFlagPlugin，和UglifyJsPlugin |
- `Module`：模块，在 `Webpack` 里一切皆模块，一个模块对应着一个文件。`Webpack` 会从配置的 `Entry` 开始递归找出所有依赖的模块。
- `Chunk`：`Webpack`启动后，会从入口文件开始递归解析其所依赖的所有`Module`。每找到一个`Module`，再解析出该`Module`依赖的`Module`。这些模块会以入口文件为单位进行分组，一个入口文件和其所有依赖的`Module`会被分到一个组，即是一个`Chunk`。
- `context`: 项目打包根目录，是个绝对路径。`webpack`在寻找相对路径的文件时会以`context`为根目录，`context`默认为启动`webpack`时所在的当前工作目录（即`webpack.config.js` 所在目录）。如果指定了`context`，那么`entry`就需要相对于`context`配置的路径去设置。
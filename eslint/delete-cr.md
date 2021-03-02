### 问题背景

在`Windows`笔记本上新拉完代码，在执行`pre-commit`时，出现如下错误：

```
Delete `␍`eslint(prettier/prettier)
```

![](https://user-gold-cdn.xitu.io/2020/2/21/17066b6e1a746ada?w=1464&h=958&f=png&s=179320)

下面是几种个人尝试过的解决方案：

### 解决方案

#### 一、Crtl+S 保存文件

按`Crtl+S`保存当前报错文件，`eslint`错误消失，但是`Git`暂存区多了个文件改动记录，对比`Working tree`没发现任何不同。

![](https://user-gold-cdn.xitu.io/2020/2/21/17066b8160fa5fef?w=1465&h=748&f=png&s=157207)

缺点：你不可能一一保存所有文件，麻烦，还要`commit`，多余。

#### 二、yarn run lint --fix

比上面省事，`eslint`错误消失，但暂存区多了 n 个文件改动记录，对比`Working tree`也没发现任何不同。

缺点：需要`commit`所有文件，多余。

[参考资料："error Delete ⏎ prettier/prettier" in .vue files](https://github.com/prettier/eslint-plugin-prettier/issues/114)``

#### 三、配置.prettierrc 文件

在项目根目录下的`.prettierrc`文件中写入即可。其实就是不让`prettier`检测文件每行结束的格式.

```
"endOfLine": "auto"
```

缺点：不能兼容跨平台开发，从前端工程化上讲没有做到尽善尽美。

[参考资料：Why do I keep getting Delete ‘cr’ \[prettier/prettier\]?](https://stackoverflow.com/questions/53516594/why-do-i-keep-getting-delete-cr-prettier-prettier)

#### 四、最佳方案

**问题根源:**

罪魁祸首是`git`的一个配置属性：`core.autocrlf `

由于历史原因，`windows`下和`linux`下的文本文件的换行符不一致。

```
* Windows在换行的时候，同时使用了回车符CR(carriage-return character)和换行符LF(linefeed character)

* 而Mac和Linux系统，仅仅使用了换行符LF

* 老版本的Mac系统使用的是回车符CR
```

| Windows  | Linux/Mac | Old Mac(pre-OSX |
| -------- | --------- | --------------- |
| CRLF     | LF        | CR              |
| '\\n\\r' | '\\n'     | '\\r'           |

因此，文本文件在不同系统下创建和使用时就会出现不兼容的问题。

我的项目仓库中默认是`Linux`环境下提交的代码，文件默认是以`LF`结尾的(工程化需要，统一标准)。

当我用`windows`电脑`git clone`代码的时候，若我的`autocrlf`(在`windows`下安装`git`，该选项默认为`true`)为`true`，那么文件每行会被自动转成以`CRLF`结尾，若对文件不做任何修改，`pre-commit`执行`eslint`的时候就会提示你删除`CR`。

现在可以理解`ctrl+s`和`yarn run lint --fix`方案为何可以修复`eslint`错误了吧，因为`Git`自动将`CRLF`转换成了`LF`。

**最佳实践：**

现在`VScode`，`Notepad++`编辑器都能够自动识别文件的换行符是`LF`还是`CRLF`。 如果你用的是`windows`，文件编码是`UTF-8`且包含中文，最好全局将`autocrlf`设置为`false`。

```

git config --global core.autocrlf false

```

注意：`git`全局配置之后，你需要重新拉取代码。

### 总结

查找了不少资料，`stackoverflow`、`github`上对这个问题有相应的讨论和解决办法，但都不能触及灵魂。作下此文，以便日后翻阅，若对遇坑的朋友有所帮助，笔者乐此不疲！

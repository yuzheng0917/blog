### 前言

最近```pull```了某环保项目最新代码，启动devServer时，终端报如下警告：

``` (Emitted value instead of an instance of Error) autoprefixer:xxx\code\ep-smp-pc-web\src\pages\SpecialAction\SpecialInfo\SpecialInfo.less:3218:3: Second Autoprefixer control comment was ignored. Autoprefixer applies control comment to whole block, not to next rules.``` 

找到源文件``` SpecialInfo.less``` ，首先想到应该是``` Autoprefixer``` 注释出了问题。
``` 
.describeList-value{
  line-height: .35rem;
  white-space: initial;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  /* autoprefixer: off */ 
  -webkit-box-orient: vertical;
  /* autoprefixer: on */
}
``` 
为何要使用``` Autoprefixer``` 注释？
因为``` -webkit-box-orient``` 是老式过时的``` CSS``` 属性，若``` webpack``` 配置了``` postcss-loader```，``` Autoprefixer``` 会自动将其移除 。

### 解决途径

那如何保留```-webkit-box-orient``` 属性？

有如下几种解决方案。

##### 一、	不配置``` Autoprefixer``` 属性

在``` postcss-loader``` 的``` options``` 不引入``` Autoprefixer``` 配置。

缺点：其它需要兼容浏览器样式的地方都得靠开发自己去加前缀，累死，不可取。

##### 二、	取消``` Autoprefixer``` 的``` remove``` 功能

可在``` webpack.config``` 文件中修改``` Autoprefixer``` 配置，增加一行配置``` remove: false``` ；

``` 
{
    loader: require.resolve('postcss-loader'),
    options: {
      // Necessary for external CSS imports to work
      // https://github.com/facebookincubator/create-react-app/issues/2677
      ident: 'postcss',
      plugins: () => [
        require('postcss-flexbugs-fixes'),
        autoprefixer({
          browsers: [
            '>1%',
            'last 4 versions',
            'Firefox ESR',
            'not ie < 9', // React doesn't support IE8 anyway
          ],
          flexbox: 'no-2009',
          remove: false,
        }),
    ],
  },
},
 ```  

缺点：既然``` Autoprefixer``` 会自动删除``` -webkit-box-orient``` 属性，那它肯定是认为有些``` CSS``` 属性是真心过时了，不推荐开发者使用（虽然``` Autoprefixer``` 配置了``` control comment``` 功能，让开发者局部``` disable Autoprefixer``` ）；若真的关闭``` Autoprefixer remove``` 功能，那项目中可能会充斥大量过时的``` CSS``` 属性，不利于维护，这种方案个人不推荐使用。
            

#### 三、	终极方案：正确使用``` autoprefixer control comment``` 功能

回过头来再看前言中提到的警告提示：
``` Second Autoprefixer control comment was ignored. Autoprefixer applies control comment to whole block, not to next rules.``` 

认真去理解这段英文，翻译成大白话就是：
第二个``` Autoprefixer``` 注释被忽略了，```Autoprefixer```注释应该被用于整个代码块，而不是下一条规则。也就是``` /* autoprefixer: off */``` 在一个代码块中不可以再作用于``` /* autoprefixer: on */``` 。

注：”整个代码块”指的是样式``` .describeList-value {}``` 大括号中的范围，不是指当前``` Less``` 文件的全局范围。

查阅``` autoprefixer``` 官网，官网对同个代码块中多次使用``` control comment``` 做了提示说明：
``` Note that comments that disable the whole block should not be featured in the same block twice。``` 

所以，最终只使用```  /* autoprefixer: off */``` 一个注释就可以了，可将``` /* autoprefixer: on */``` 注释取消，则``` warning``` 消失。样式如下：
``` 
.describeList-value{
  line-height: .35rem;
  white-space: initial;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  /* autoprefixer: off */ 
  // 只会作用于当前block，非全局
  -webkit-box-orient: vertical;
}
``` 
``` /* autoprefixer: off */```  或```  /* autoprefixer: on */ ``` 放在``` block``` 哪个地方可以，因为它们作用于整个``` block``` 。

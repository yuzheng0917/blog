### 项目背景

最近做了个电子报项目，用户可在上传的报刊版面图上划出一个个区域，通过`OCR`图文识别技术，识别出区域文字信息，然后编辑成一条条新闻，可在 PC 端和手机端点击版面图，查看新闻详情。

**⚠️ 关键技术点**： 用`Canvas`如何绘制出裁剪框。

本文主要介绍裁剪框的实现过程。

单个裁剪

![](./images/canvas1.awebp)

批量裁剪

![](./images/canvas2.awebp)

### Canvas 技术点

- `CanvasRenderingContext2D.drawImage()`方法
- `CanvasRenderingContext2D.save()`和`CanvasRenderingContext2D.restore()`方法的成对使用
- `CanvasRenderingContext2D.globalCompositeOperation`属性
- `CanvasRenderingContext2D.getImageData()`、`CanvasRenderingContext2D.putImageData`方法

🔥**小贴士**：如果您对本文有兴趣，期望您先了解以上技术点。

### 流程简介

1.  读取图片
2.  用`Canvas`绘制图片

    1.  `drawImage()`的使用
    2.  绘制版面图

3.  裁剪操作
    1.  基本裁剪流程
    2.  裁剪框的绘制
4.  输出裁剪图片
    1.  `getImageData()`的使用
    2.  `putImageData()`的使用
    3.  使用`Canvas.toDataURL()`输出图片
    4.  使用`OCR`识别图片信息

![](./images/canvas3.awebp)

### 一、读取图片

组件初始化时，通过`new Image`对象读取图片链接；
若图片是通过本地上传的，可用`new FileReader`对象读取。

**⚠️ 注意点**：

1. 图片的跨域问题；
2. `image.src = url`放在图片读取后面，因为会偶发图片读取异常。

🔨 实现代码如下：

```
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Button } from 'antd';
import styles from './index.less';

/**
*file 版面文件
*useOcr true:通过OCR转换成文字；false:转换为图片
*onTransform 转换成文字或图片后调用组件外部方法
*/
export default function ({ file, useOcr, onTransform }) {
    const { url } = file;
    const [originImg, setOriginImg] = useState(); // 源图片
    const [contentNode, setContentNode] = useState(); // 最外层节点
    const [canvasNode, setCanvasNode] = useState(); // canvas节点
    const [btnGroupNode, setBtnGroupNode] = useState(); // 按钮组
    const [startCoordinate, setStartCoordinate] = useState([0, 0]); // 开始坐标
    const [dragging, setDragging] = useState(false); // 是否可以裁剪
    const [curPoisition, setCurPoisition] = useState(null); // 当前裁剪框坐标信息
    const [trimPositionMap, setTrimPositionMap] = useState([]); // 裁剪框坐标信息
    const fileSyncUpdating = useSelector(state => state.loading.effects['digital/postImgFileWithAliOcr']);
    const dispatch = useDispatch();

    const initCanvas = () => {
        // url为上传的图片链接
        if (url == null) {
          return;
        }

        // 实例化一个Image对象，获取图片宽高，用于设置canvas宽高
        const image = new Image();
        image.addEventListener('load', () => {
            ...
        });
        image.crossOrigin = 'anonymous'; // 解决图片跨域问题
        image.src = url;
    };

    useEffect(() => {
        initCanvas();
    }, [url]);
}
```

### 二、`canvas`绘制图片

#### 2.1 `drawImage()`的使用

![](./images/canvas4.awebp)

##### 语法

```
ctx.drawImage(image, dx, dy) 
ctx.drawImage(image, dx, dy, dw, dh) 
ctxdrawImage(image, sx, sy, sw, sh, dx, dy, dw, dh)
```

##### 参数

- `image`: 图像源;
- `dx`和`dy`是 canvas 中即将绘制区域的开始坐标值；
- `dw`和`dh`是 canvas 中即将绘制区域的宽高；
- 若需绘制源图像某部分，`sx`和`sy`是该区域的左上角坐标值；
- 若需绘制源图像某部分，`sw`和`sh`是该区域的宽高。

#### 2.2 绘制版面图

在读取版面图的时候，通过调用`CanvasRenderingContext2D.drawImage()`绘制图片。

**⚠️ 注意**： 每次调用`canvas`方法时，需要用`ctx.clearRect()`擦除一次，这样可以节省内存，否则`canvas`绘制的图像会一层层叠加，虽然看上去只有一张图。

🔨 实现代码如下：

```
// 初始化
const initCanvas = () => {
    // url为上传的图片链接
    if (url == null) {
      return;
    }
    // contentNode为最外层DOM节点
    if (contentNode == null) {
      return;
    }
    // canvasNode为canvas节点
    if (canvasNode == null) {
      return;
    }

    const image = new Image();
    setOriginImg(image); // 保存源图
    image.addEventListener('load', () => {
        const ctx = canvasNode.getContext('2d');
        // 擦除一次，否则canvas会一层层叠加，节省内存
        ctx.clearRect(0, 0, canvasNode.width, canvasNode.height);
        // 若源图宽度大于最外层节点的clientWidth，则设置canvas宽为clientWidth，否则设置为图片的宽度
        const clientW = contentNode.clientWidth;
        const size = image.width / clientW;
        if (image.width > clientW) {
        canvasNode.width = clientW;
        canvasNode.height = image.height / size;
        } else {
        canvasNode.width = image.width;
        canvasNode.height = image.height;
        }
        // 调用drawImage API将版面图绘制出来
        ctx.drawImage(image, 0, 0, canvasNode.width, canvasNode.height);
    });
    image.crossOrigin = 'anonymous'; // 解决图片跨域问题
    image.src = url;
};

useEffect(() => {
    initCanvas();
}, [canvasNode, url]);

return (
    <section ref={setContentNode} className={styles.modaLLayout}>
      <canvas
        ref={setCanvasNode}
        onMouseDown={handleMouseDownEvent}
        onMouseMove={handleMouseMoveEvent}
        onMouseUp={handleMouseRemoveEvent}
      />
   </section>
)
```

### 三、裁剪操作

#### 3.1 基本裁剪流程

流程如下：

1. 鼠标移入`canvas`画布区；
2. 点击鼠标，通过`onMouseDown`事件获取开始坐标点`（startX,startY）`；
3. 移动鼠标，通过`onMouseMove`事件获取坐标，实时绘制裁剪框；
4. 松开鼠标，通过`onMouseUp`事件终止裁剪框的绘制

🔨 实现代码如下：

```
  // 点击鼠标事件
  const handleMouseDownEvent = e => {
    // 开始裁剪
    setDragging(true);
    const { offsetX, offsetY } = e.nativeEvent;
    // 保存开始坐标
    setStartCoordinate([offsetX, offsetY]);

    if (btnGroupNode == null) {
      return;
    }
    // 裁剪按钮不可见
    btnGroupNode.style.display = 'none';
  };

  // 移动鼠标事件
  const handleMouseMoveEvent = e => {
    if (!dragging) {
      return;
    }
    const ctx = canvasNode.getContext('2d');
    // 每一帧都需要清除画布(取最后一帧绘图状态, 否则状态会累加)
    ctx.clearRect(0, 0, canvasNode.width, canvasNode.height);

    const { offsetX, offsetY } = e.nativeEvent;

    // 计算临时裁剪框的宽高
    const tempWidth = offsetX - startCoordinate[0];
    const tempHeight = offsetY - startCoordinate[1];
    // 调用绘制裁剪框的方法
    drawTrim(startCoordinate[0], startCoordinate[1], tempWidth, tempHeight);
  };

  // 松开鼠标
  const handleMouseRemoveEvent = () => {
    // 结束裁剪
    setDragging(false);

    // 处理裁剪按钮样式
    if (curPoisition == null) {
      return;
    }
    if (btnGroupNode == null) {
      return;
    }
    btnGroupNode.style.display = 'block';
    btnGroupNode.style.left = `${curPoisition.startX}px`;
    btnGroupNode.style.top = `${curPoisition.startY + curPoisition.height}px`;

    // 判断裁剪区是否重叠(此项目需要裁剪不规则的相邻区域，所以裁剪框重叠时才支持批量裁剪)
    judgeTrimAreaIsOverlap();
  };

return (
    <section ref={setContentNode} className={styles.modaLLayout}>
      <canvas
        ref={setCanvasNode}
        onMouseDown={handleMouseDownEvent}
        onMouseMove={handleMouseMoveEvent}
        onMouseUp={handleMouseRemoveEvent}
      />
      <div ref={setBtnGroupNode} className={styles.buttonWrap}>
          <Button type="link" icon="close" size="small" ghost disabled={fileSyncUpdating} onClick={handleCancle}>
            取消
          </Button>
          <Button
            type="link"
            icon="file-image"
            size="small"
            ghost
            disabled={fileSyncUpdating}
            onClick={() => getImgTrimData('justImg')}
          >
            转为图片
          </Button>
          <Button
            type="link"
            icon="file-text"
            size="small"
            ghost
            loading={fileSyncUpdating}
            onClick={getImgTrimData}
          >
            转为文字
          </Button>
      </div>
   </section>
)
```

#### 3.2 绘制裁剪框

实现流程如下：

![](./images/canvas5.awebp)

**⚠️ 注意： `canvas`是基于状态的，`save()`和`restore()`需要成对使用**

**如何将版面图、蒙层、裁剪框和边框像素点按照顺序叠在一起呢 ❓**

这里需要用到`CanvasRenderingContext2D.globalCompositeOperation`属性，它可以实现图像的合成。

🔨 实现代码如下：

```
// 绘制裁剪框的方法
const drawTrim = (x, y, w, h, flag) => {
    const ctx = canvasNode.getContext('2d');

    // 绘制蒙层
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.6)'; // 蒙层颜色
    ctx.fillRect(0, 0, canvasNode.width, canvasNode.height);

    // 将蒙层凿开
    ctx.globalCompositeOperation = 'source-atop';
    // 裁剪选择框
    ctx.clearRect(x, y, w, h);
    if (!flag && trimPositionMap.length > 0) {
      trimPositionMap.map(item => ctx.clearRect(item.startX, item.startY, item.width, item.height));
    }

    // 绘制8个边框像素点
    ctx.globalCompositeOperation = 'source-over';
    drawBorderPixel(ctx, x, y, w, h);
    if (!flag && trimPositionMap.length > 0) {
      trimPositionMap.map(item => drawBorderPixel(ctx, item.startX, item.startY, item.width, item.height));
    }

    // 保存当前区域坐标信息
    setCurPoisition({
      width: w,
      height: h,
      startX: x,
      startY: y,
      position: [
        (x, y),
        (x + w, y),
        (x, y + h),
        (x + w, y + h),
        (x + w / 2, y),
        (x + w / 2, y + h),
        (x, y + h / 2),
        (x + w, y + h / 2),
      ],
      canvasWidth: canvasNode.width, // 用于计算移动端版面图缩放比例
    });

    ctx.restore();

    // 再次调用drawImage将图片绘制到蒙层下方
    ctx.save();
    ctx.globalCompositeOperation = 'destination-over';
    ctx.drawImage(originImg, 0, 0, canvasNode.width, canvasNode.height);
    ctx.restore();
  };

// 绘制边框像素点的方法
const drawBorderPixel = (ctx, x, y, w, h) => {
  ctx.fillStyle = '#f5222d';
  const size = 5; // 自定义像素点大小
  ctx.fillRect(x - size / 2, y - size / 2, size, size);
  // ...同理通过ctx.fillRect再画出其余像素点
  ctx.fillRect(x + w - size / 2, y - size / 2, size, size);
  ctx.fillRect(x - size / 2, y + h - size / 2, size, size);
  ctx.fillRect(x + w - size / 2, y + h - size / 2, size, size);

  ctx.fillRect(x + w / 2 - size / 2, y - size / 2, size, size);
  ctx.fillRect(x + w / 2 - size / 2, y + h - size / 2, size, size);
  ctx.fillRect(x - size / 2, y + h / 2 - size / 2, size, size);
  ctx.fillRect(x + w - size / 2, y + h / 2 - size / 2, size, size);
};

```

### 四、输出裁剪图片

#### 4.1 `getImageData()` 的使用

我们要获取裁剪框的图像信息，需要用到`getImageData()`方法，它返回一个`ImageData`对象。

##### 语法

- `context.getImageData(sx, sy, sWidth, sHeight);`

##### 参数

- `sx、sy`：截图框的起始坐标值；
- `sWidth, sHeight`: 截图框的宽高

**❓：获取了裁剪框图像信息后，那怎么将它们转换成图片呢**
需要新建一个`canvas`，通过`getImageData()`方法把裁剪框图像信息放在该`canvas`上。

**❓：为什么要新建 canvas,直接用`toBlob()`不行吗**
`HTMLCanvasElement.toBlob()`是将整个`canvas`进行输出，而此项目要的是`canvas`中裁剪框的图像信息。

#### 4.2 `putImageData()`的使用

`putImageData()`可以把已有的裁剪框数据绘制到新画布的指定区域上。

##### 语法

- `context.putImageData(imagedata, dx, dy)`;
- `context.putImageData(imagedata, dx, dy, dirtyX, dirtyY, dirtyWidth, dirtyHeight)`;

##### 参数

- `imagedata`：裁剪框图像信息；
- `dx, dy`: 目标`Canvas`中被`imagedata`替换的起始坐标；
- `dirtyX, dirtyY`:裁剪框区域左上角的坐标,默认为`0`；
- `dirtyWidth, dirtyHeight`:裁剪框的宽高。默认值`是imagedata`图像的宽高。

#### 4.3 使用`Canvas.toDataURL()`输出图片

`canvas`提供了两个`2D`转换为图片的方法：

- `HTMLCanvasElement.toDataURL()` 返回`base64`地址
- `HTMLCanvasElement.toBlob()` 返回`Blob`对象

本项目`OCR`接口要求的图片格式是`Base64`，所以使用`HTMLCanvasElement.toDataURL()`方法。

#### 4.4 使用`OCR`识别图片信息

**❓：为什么要计算出包含多个裁剪框的最小矩形**

因为`OCR`每调用一次都是计费的，所以不管有多少个裁剪框，最后只输出到一个`canvas`上，这样只调用一次`OCR`。

**⚠️**单个裁剪框的最小矩形即是其本身。

**❓：如何计算出最小矩形**

很简单，分别得到多个裁剪框的最小`startX`、`startY`值和最大`endX`、`endY`值，即可计算出最小矩形的开始坐标和宽高。

![](./images/canvas6.awebp)

代码实现如下：

```
// 获得裁剪后的图片文件
  const getImgTrimData = flag => {
    // trimPositionMap为裁剪框的坐标数据
    if (trimPositionMap.length === 0) {
      return;
    }

    const ctx = canvasNode.getContext('2d');

    // 重新构建一个canvas，计算出包含多个裁剪框的最小矩形
    const trimCanvasNode = document.createElement('canvas');
    const { startX, startY, minWidth, minHeight } = getMinTrimReactArea();
    trimCanvasNode.width = minWidth;
    trimCanvasNode.height = minHeight;
    const trimCtx = trimCanvasNode.getContext('2d');
    trimCtx.clearRect(0, 0, trimCanvasNode.width, trimCanvasNode.height);
    trimPositionMap.map(pos => {
      // 取到裁剪框的像素数据
      const data = ctx.getImageData(pos.startX, pos.startY, pos.width, pos.height);
      // 输出在canvas上
      return trimCtx.putImageData(data, pos.startX - startX, pos.startY - startY);
    });
    const trimData = trimCanvasNode.toDataURL();

    // 若转成图片，直接输出trimData；若转成文字，则请求OCR接口,转换成文字
    (flag === 'justImg'
      ? Promise.resolve(trimData)
      : dispatch({
          type: 'digital/postImgFileWithAliOcr',
          payload: {
            img: trimData,
          },
        })
    ).then(result => {
       // 调用外部api,输出图片数据
      onTransform(result, flag);
    });
  };

  // 计算出包含多个裁剪框的最小矩形
  const getMinTrimReactArea = () => {
    const startX = Math.min(...trimPositionMap.map(item => item.startX));
    const endX = Math.max(...trimPositionMap.map(item => item.startX + item.width));
    const startY = Math.min(...trimPositionMap.map(item => item.startY));
    const endY = Math.max(...trimPositionMap.map(item => item.startY + item.height));
    return {
      startX,
      startY,
      minWidth: endX - startX,
      minHeight: endY - startY,
    };
  };
```

### 总结

很多业务场景中会用到图片的裁剪功能，因为裁剪组件实现起来比较费时间，所以很多前端朋友直接借助第三方插件，但插件中又依赖了很多别的插件，这样你的项目后期维护会比较费劲，个人建议能不依赖第三方库的尽量自己去实现。

本文主要是介绍裁剪框的绘制，至于裁剪框的移动、伸缩、旋转，暂没有去实现，这些都是基于坐标点的操作，相对简单。

`Canvas`的属性和方法若能用得好的话，可以实现非常多好玩的效果，前提是要吃透`canvas`。

欢迎指正，谢谢！

### 参考链接

- [Canvas API 中文版](https://www.canvasapi.cn/)
- [从零开始做一个图片裁剪组件](https://juejin.im/post/6844904081190813710)
- [基于 REACT 实现图片上传裁切](https://www.bilibili.com/video/av70695415?p=3)
- [【开源】canvas 图像裁剪、压缩、旋转](https://juejin.im/post/6844903511671439374)

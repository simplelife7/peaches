Peaches 
======
> 简单、自然的书写样式

**Peaches** 是一个CSS编译工具，用于自动合并background-image并更新background-position。  

**Peaches** 追求简单、自然的CSS书写方式。使用 **Peaches**，可以让我们的工作更轻松愉快：

* 告别烦人的图片合并:
    * 每个需要背景图片的元素都可以单独设置。告别图片合并操作，将CSS优化的工作，交给 **Peaches**
* 不再为定位背景图片而烦恼:
    * 元素使用单独的背景图片，意味着不再需要定位背景。**Peaches** 将代劳这最伤神的定位操作。
* 告别修改sprite图片带来的麻烦 :
    * 现在你只要关心单个元素的背景图片，不用再担心因为修改图片影响其他功能了。
    * 一个复杂的sprite图片举例：[https://i.alipayobjects.com/e/201112/1k1a4oNien.png](https://i.alipayobjects.com/e/201112/1k1a4oNien.png)

一个使用 **Peaches** 书写样式的例子:[点击这里](http://sliuqin.github.com/peaches/example/index.html)

## 安装
    npm install peaches

图片合并使用[node-canvas](https://github.com/LearnBoost/node-canvas)，安装前，请确保已经正确安装[Cairo](http://cairographics.org/)。

PS: 安装暂时不可用，优化处理中。
# 原生JS实现微信公众号或网页使用下拉加载和上拉刷新
> 微信浏览器打开网页显示网址安全信息解决办法,网上很多办法，也找了很久，但是最新的很多用不了。
> 先看看效果，是不是亲想要的，可以跳过，以免浪费宝贵时间。用微信打开以下网址浏览效果（用微信打开）：http://atigege.com/case/web/wxPull/
![qr code][http://atigege.com/case/web/wxPull/qr.png]
## 我的解决思路：
> 1、直接在样式表里的html和body上加上：touch-action:none;
    html,body{touch-action:none}
> 2、然后把touch事件全部用js来处理。包括滚动条的移动也用JS来监听
## 原理：
### 初始化配置pull.init()
> init中调用extend方法，重置config的值
### 监听touchstart,touchmove,touchend事件
#### 监听touchstart
> 1、记录下开始滑动位置（this.status.start）
> 2、记录下滑动时滚动条的位置(this.status.startScrollTop)
> 2、清除滑动方向(this.status.direction)
#### 监听touchmove
> 1、记录下当前的位置(this.status.end)
> 2、记录下手指位移值(this.status.offset)
> 3、清除动画时间(this.setTransition(0))
> 4、当滚动条没有到底时，滑动只控制滚动条
> 5、根据滑动的方向，确认方向，方向一旦赋值，在松开手指前不变更（this.status.direction）
> 6、如果方向向上，执行this.touchMoveUp();
> 7、如果方向向下，执行this.couchMoveDown();
#### 监听touchEnd
> 1、根据方向，this.status.direction="down"时，执行向上this.touchEndDown();
> 2、根据方向，this.status.direction="up"时，执行向上this.touchEndUp();
> 3、设置this.status.isCanMove=false;
> 4、this.setTransition(1),把动画时间设为1秒
> 5、this.back(0)复位对象。


## 使用方法
#### 禁用touch-action
> html,body{touch-action:none}
#### 添加HTML元素
> 1、下拉刷新提示容器:<div id="downMessage"><div class="txt">下拉刷新</div></div>
> 2、滚动对象:<div id="pull">......</div>
> 3、上拉加载提示容器:<div id="upMessage"><div class="txt">上拉加载</div></div>
#### 开始调用：
> var pullObj = pull.init(option)
> option选项见下一项

## 配置参数
> var pullObj = pull.init({
        elID: "#pull",//下拉对象ID<font color=ff0000>必填</font>
        upMessageID: "#upMessage",//上拉加载提示信息ID<font color=ff0000>必填</font>
        downMessageID: "#downMessage",//下拉刷新提示信息ID<font color=ff0000>必填</font>
        totalRecords: 60,//总记录数
        method:"up,down",//调用方法，这里是上拉和下拉都调用
        upCallback:function(){这里填写上拉加载回调函数},
        downCallback:function(){这里填写下拉刷新回调函数}
        }
#### 参数说明：
>        elID: "",//控制ID
>         upMessageID: "",//上拉加载提示ID
>         downMessageID: "",//下拉刷新提示ID
>         upPullToLoadMore: '上拉加载', // 上拉加载提示
>         upReleaseToRefresh: '松开加载', //松开加载提示
>         upRefreshing: '加载中…', // 加载中文字提示
>         upIsLastMessage: "已经是最后一页",//最后一页文字提示
>         downPullToRefresh: '下拉刷新', // 下拉刷新文字提示
>         downReleaseToRefresh: '松开刷新', //松开刷新文字提示
>         downRefreshing: '刷新中…', // 刷新中文字提示
>         threshold: 60,//移动距离阀值
>         maxOffset: 150,//最大可拖动距离
>         actionOffset: 60,//可引起操作的拖动距离
>         method: "up,down",//包括方法，up：上拉加载,down:下拉刷新
>         upCallback: null,//上拉刷新回调函数
>         downCallback: null,//下拉加载回调函数
>         totalRecords: 0,//总记录数
>         pageSize: 20//页面记录数

# 原生JS实现微信公众号或网页使用下拉加载和上拉刷新
> 微信浏览器打开网页显示网址安全信息解决办法,网上很多办法，也找了很久，但是最新的很多用不了。
> 先看看效果，是不是亲想要的，可以跳过，以免浪费宝贵时间。用微信打开以下网址浏览效果（用微信打开）：http://atigege.com/case/web/wxPull/
>![avatar][base64strQrcode]
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
[base64strQrcode]:data:image/png;base64,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
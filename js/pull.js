/**
 * Created by c-zouzhongxing1 on 2018/10/30. 微信:gavinjzx QQ:120534960
 */
var pull = {
    config: {
        elID: "",//控制ID
        upMessageID: "",//上拉加载提示ID
        downMessageID: "",//下拉刷新提示ID
        upPullToLoadMore: '上拉加载', // text：pull to refresh
        upReleaseToRefresh: '松开加载', //text：Release to refresh
        upRefreshing: '加载中…', // text：refreshing
        upIsLastMessage: "已经是最后一页",//text:is last page
        downPullToRefresh: '下拉刷新', // text：pull to refresh
        downReleaseToRefresh: '松开刷新', //text：Release to refresh
        downRefreshing: '刷新中…', // text：refreshing
        threshold: 60,//移动距离阀值
        maxOffset: 150,//最大可拖动距离
        actionOffset: 60,//可引起操作的拖动距离
        method: "up,down",//包括方法，up：上拉加载,down:下拉刷新
        upCallback: null,//上拉刷新回调函数
        downCallback: null,//下拉加载回调函数
        totalRecords: 0,//总记录数
        pageSize: 20//页面记录数
    },
    status: {
        hasTouch: 'ontouchstart' in window,//是否是在window
        start: 0,//touch起点
        end: 0,//touch终点
        offset: 0,//移动,往下为正数，往下为负数
        direction: "",//方向：up或down,up为上拉刷新，down为下拉加载,在touchstart事件中确定
        isLock: false,//是否锁定整个操作
        isCanMove: false,//是否移动滑块
        message: "",//提示文字
        startScrollTop: 0,//初始滚动条距顶位置
        page: 1,//当前页
        isLast: false//是否是最后一页
    },
    isLastPage: function () {//是否是最后一页
        this.status.isLast = (this.config.totalRecords < this.status.page * this.config.pageSize + 1);
        // console.log(this.status.isLast);
    },
    init: function (option, callback) {
        //初始化函数：
        // 1、根据参数重载配置
        // 2、执行touchstart事件，记录下start,给isLock赋值,isCanMove赋值
        // 3、执行touchMove事件，offset来确认操作是上拉还是下拉，根据config的method，确认能否调用
        // 4、执行touchEnd事件，执行回调，复位DIV，复位isCanMove,isLock,Message
        // 1、根据参数重载配置
        if (typeof(option) == "object") {
            this.config = this.extend(this.config, option);
        }
        // 2、执行touchstart事件，记录下start,给isLock赋值,isCanMove赋值
        var el = document.querySelector(this.config.elID);//因为是移动端，不用考虑PC兼容情况，所以使用querySelector
        var _this = this;
        el.addEventListener("touchstart", function (e) {
            _this.touchStart(e);
        });
        el.addEventListener("touchmove", function (e) {
            _this.touchMove(e);
        });
        el.addEventListener("touchend", function (e) {
            _this.touchEnd(e);
        });
    },
    touchStart: function (e) {
        //开始滑动
        //位置复原
        this.setPositionOriginal();
        this.status.direction = "";
        this.isLastPage();//是否最后一页赋值
        console.log("最后一页:" + this.status.isLast);
        this.status.isLock = true;//是否锁定整个操作
        this.status.isCanMove = true;//是否移动滑块
        var even = typeof event == "undefined" ? e : event;
        this.status.start = this.status.hasTouch ? even.touches[0].pageY : even.pageY;//1、给status.start赋值

        //记录初始滚动条位置
        var ele = document.querySelector(this.config.elID);
        var scrollTop = ele.parentNode.scrollTop;
        this.status.startScrollTop = scrollTop;

    },
    touchMove: function (e) {
        //滑动中
        //判定方法:设置status.direction值
        //保存当前鼠标Y坐标
        var even = typeof event == "undefined" ? e : event;
        this.status.end = this.status.hasTouch ? even.touches[0].pageY : even.pageY;
        this.status.offset = this.status.end - this.status.start;
        //控制滚动条
        var ele = document.querySelector(this.config.elID);
        var eleParent = ele.parentNode;
        var scrollTop = eleParent.scrollTop;
        //清除动画时间
        this.setTransition(0);
        //当滑动条没到顶或没到底时
        if (scrollTop >= 0 && scrollTop <= ele.clientHeight - eleParent.clientHeight + 1) {
            eleParent.scrollTop = eleParent.scrollTop - this.status.offset;
        }
        //判断方向
        if (this.status.direction == "") {
            this.status.direction = this.status.offset > 0 ? "down" : "up";
        }
        //当滑动条到顶,方向向下
        if (scrollTop == 0 && this.status.direction == "down") {
            this.touchMoveDown();
        }
        //当滑动条到底，且方向向上
        if (scrollTop + 1 >= ele.clientHeight - eleParent.clientHeight && this.status.direction == "up") {
            this.touchMoveUp();
        }
    },
    touchMoveUp: function () {
        var ele = document.querySelector(this.config.elID);
        //滚动到底的高度
        var scrollBottom = ele.clientHeight - ele.parentNode.clientHeight;
        // console.log("移动条的高度:"+scrollBottom);
        // console.log("ele.clientHeight:" + ele.clientHeight);
        // console.log("ele.parentNode.height:" + ele.parentNode.clientHeight);
        var transVal = -this.status.offset - ( scrollBottom - this.status.startScrollTop);
        //最后一页
        if (this.status.isLast) {
            this.status.message = this.config.upIsLastMessage;
            this.setMessage();
            if (transVal > this.config.threshold) {
                var diff = -transVal + this.config.threshold;
                if (-diff > this.config.actionOffset) {
                    diff = -this.config.actionOffset;
                }
                this.setTransition(0);
                this.translate(diff);
            }
        }
        else {
            this.status.message = this.config.upPullToLoadMore;
            this.setMessage();
            if (transVal > this.config.threshold) {//大于阀值移动
                var diff = -transVal + this.config.threshold;
                if (-diff > this.config.actionOffset) {//大于操作距离
                    this.status.message = this.config.upReleaseToRefresh;
                    if (-diff > this.config.maxOffset) {//大于最大距离
                        diff = -this.config.maxOffset;
                    }
                }
                this.setTransition(0);
                this.translate(diff);

            }
            this.setMessage();
            // this.status.message = this.config.upPullToLoadMore;
            // console.log(transVal);
            // if (transVal > this.config.threshold) {
            //     // this.status.message = this.config.upReleaseToRefresh;
            //     if (transVal - this.config.threshold > this.config.actionOffset) {
            //         this.status.offset = -transVal;
            //         this.status.message = this.config.upReleaseToRefresh;
            //     }
            //     if (transVal - this.config.threshold > this.config.maxOffset) this.status.offset = -this.config.maxOffset;
            //     this.setMessage();
            //     //设置动画时间为0秒
            //     this.setTransition(0);
            //     this.translate(this.status.offset);
            // }
        }
    },
    touchMoveDown: function () {
        // console.log("到顶且下拉");往下拉,offset为正
        if (this.status.offset > this.config.threshold + this.status.startScrollTop) {
            console.log("offset:" + this.status.offset);
            //偏移：手势移动距离 - 阀值 - 滚动条位置
            var transVal = this.status.offset - (this.config.threshold + this.status.startScrollTop);
            //设定最大距离
            if (transVal > this.config.maxOffset) transVal = this.config.maxOffset;
            //move对象跟随
            this.translate(transVal);
            this.status.message = this.config.downPullToRefresh;
            //当偏移距离大于操作距离时
            if (transVal > this.config.actionOffset) {
                this.status.message = this.config.downReleaseToRefresh;
            }
            this.setMessage();
        }


    },
    touchEnd: function (e) {
        if (this.status.isCanMove) {
            if (this.status.direction == "down") {
                this.touchEndDown();
            }
            if (this.status.direction == "up") {
                this.touchEndUp();
            }
            this.status.isCanMove = false;
            this.setTransition(1);
            this.back(0);
        }
    },
    touchEndDown: function () {
        //偏移：手势移动距离 - 阀值 - 滚动条位置
        var transVal = this.status.offset - (this.config.threshold + this.status.startScrollTop);
        if (transVal > this.config.actionOffset) {
            this.status.message = this.config.downRefreshing;
            this.setMessage();
            //执行回调函数
            if (typeof this.config.downCallback == "function") {
                this.config.downCallback();
            }
        }
    },
    touchEndUp: function () {
        // console.log("touch end up load more!");
        //向上滑offset为负数
        //偏移：手势移动距离 - 阀值 - 滚动条位置
        //滚动条移到底的距离：内容高度（ele.ClientHeight）-父容器高度(ele.parentNode.height)
        var ele = document.querySelector(this.config.elID);
        //滚动到底的高度
        var scrollBottom = ele.clientHeight - ele.parentNode.clientHeight;
        // console.log("移动条的高度:"+scrollBottom);
        // console.log("ele.clientHeight:" + ele.clientHeight);
        // console.log("ele.parentNode.height:" + ele.parentNode.clientHeight);
        var transVal = -this.status.offset - ( scrollBottom - this.status.startScrollTop);
        // console.log("this.status.offset:" + this.status.offset);
        // console.log("transVal:" + transVal);
        if (transVal > this.config.threshold) {
            // console.log("大于阀值！");
            if (!this.status.isLast) {
                if (transVal > this.config.actionOffset + this.config.threshold) {
                    //设置更新中提示信息
                    this.status.message = this.config.upRefreshing;
                    this.setMessage();
                    //执行回调函数
                    if (typeof this.config.upCallback == "function") {
                        this.config.upCallback();
                        this.status.page++;
                    }
                }
            }
            //设置动画时间
            this.setTransition(1);
            //返回原位
            this.back(0);
        }
    },
    //状态复原
    setPositionOriginal: function () {
        //方向不存在时：第一次初始化
        var ele = document.querySelector(this.config.elID);
        this.setTransition(0);
        var direct = this.status.direction;
        // console.log(direct);
        //上拉或下拉时
        if (direct == "up" && this.config.method.indexOf("up") > -1) {
            var ele1 = document.querySelector(this.config.upMessageID);
            ele1.className = "";
            //设置message
            this.status.message = this.config.upPullToLoadMore;
            this.setMessage();
        }
        if (direct == "down" && this.config.method.indexOf("down") > -1) {
            var ele1 = document.querySelector(this.config.downMessageID);
            ele1.className = "";
            //设置message
            this.status.message = this.config.downPullToRefresh;
            console.log("set message");
            this.setMessage();
        }
    },
    setTransition: function (time) {//设置效果时间
        var ele = document.querySelector(this.config.elID);
        ele.style.webkitTransition = "all " + time + "s";
        ele.style.transition = "all " + time + "s";
        //给提示ID设置动画过渡时间
        if (this.status.direction) {
            var eleID1 = (this.status.direction == "up") ? this.config.upMessageID : this.config.downMessageID;
            eleID1 = document.querySelector(eleID1);
            eleID1.style.webkitTransition = "all " + time + "s";
            eleID1.style.transition = "all " + time + "s";
        }
    },
    translate: function (diff) {//设置移动
        var ele = document.querySelector(this.config.elID);
        ele.style.webkitTransform = "translate(0," + diff + "px)";
        ele.style.transform = "translate(0," + diff + "px)";
        //给提示ID设置移动
        var eleID1 = (this.status.direction == "up") ? this.config.upMessageID : this.config.downMessageID;
        eleID1 = document.querySelector(eleID1);
        eleID1.style.height = Math.abs(diff) + "px";
    },
    back: function (offset) {
        this.translate(0 - offset);
        //标识操作完成
        this.status.isLock = false;
        this.status.isCanMove = false;
        // this.status.direction = "";//方法置空
    },
    setMessage: function () {//设置提示信息内容
        if (this.status.direction == "up") {//上拉加载
            var ele = document.querySelector(this.config.upMessageID);
            ele.querySelector(".txt").innerText = this.status.message;
        }
        if (this.status.direction == "down") {//下拉刷新
            var ele = document.querySelector(this.config.downMessageID);
            ele.querySelector(".txt").innerText = this.status.message;
        }
    },
    extend: function () {//填充参数
        var length = arguments.length;//参数长度
        var target = arguments[0] || {};
        if (typeof target != "object" && typeof target != "function") {
            target = {};
        }
        if (length == 1) {
            target = this;
        }
        for (var i = 1; i < length; i++) {
            var source = arguments[i];
            for (var key in source) {
                // 使用for in会遍历数组所有的可枚举属性，包括原型。
                if (Object.prototype.hasOwnProperty.call(source, key)) {
                    target[key] = source[key];
                }
            }
        }
        return target;
    }
};
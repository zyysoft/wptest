//index.js
var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config')
var util = require('../../utils/util.js')

Page({
    data: {
        logged: false,
        takeSession: false,
        requestResult: '',
        // mode: "scaleToFill",
        currentTab:0, //选项卡
        banners: [
          { url: 'https://static001.geekbang.org/resource/image/bc/39/bcc42592dd4c05d28612255c0625c439.jpg' },
          { url: 'https://static001.geekbang.org/resource/image/0e/95/0eff41ad84353ba49c1e2d2bb755b795.jpg' },
          { url: 'https://static001.geekbang.org/resource/image/bc/14/bca8eee56d3cad468efdfcbb5c165714.jpg' },
          { url: 'https://static001.geekbang.org/resource/image/58/57/58fcdd4ed7a7f88d1bd0517bada69857.jpg' }
        ],
        isFixTab: false, //是否显示悬浮tab
        floatTop: 193, //悬浮框高度
        content_image_width:0,
        contents: [],
        pageSize:4,
        pageNumber:1
    },

  onLoad: function (options) {
    var that=this;
    /**wx.showLoading({ //显示消息提示框  此处是提升用户体验的作用
      title: '数据加载中',
      icon: 'loading',
    });*/
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          content_image_width:res.windowWidth*0.6,
          // floatTop : 104 * res.screenWidth / 750,
        });
      }
    });
    this.getScrollTop();
    this.listTopics();
  },

  listTopics:function(type){
    var that = this;
    // console.log(that.data.pageSize);
    // console.log(that.data.pageNumber);
    wx.request({
      url: 'https://na.nonobank.com/bilog-pc/ithup/list/topic?typeName=' + that.data.currentTab + '&pageSize=' + that.data.pageSize + '&pageNumber=' + that.data.pageNumber, //请求接口的url
      method: 'GET', //请求方式
      data: {},//请求参数
      header: {
        'content-type': 'application/json' // 默认值
      },
      complete() {  //请求结束后隐藏 loading 提示框
        // wx.hideLoading();
      },
      success: res => {
        if (type){ //加载更多
          var oldData = this.data.contents;
          for (var i = 0; i < res.data.data.length; i++) {
            oldData.push(res.data.data[i]);
          }
          this.setData({
            contents: oldData,
          });
        }else {
          this.setData({
            contents: res.data.data,
          });
        }
      }
    });
  },

  getScrollTop: function () {
    var that = this;
    if (wx.canIUse('getSystemInfo.success.screenWidth')) {
      
    }
  },


  onPageScroll: function (event) {
    var scrollTop = event.scrollTop;
    // console.log(scrollTop);`
    if (scrollTop >= this.data.floatTop && !this.data.isFixTab) {
      this.setData({
        isFixTab: true,
      });
    } else if (scrollTop < this.data.floatTop && this.data.isFixTab) {
      this.setData({
        isFixTab: false,
      });
    }
  },

  onPullDownRefresh:function(e){
    this.setData({
      pageNumber: 1,
    }),
    this.listTopics();
    wx.hideNavigationBarLoading();
    wx.stopPullDownRefresh();
  },
  onReachBottom:function(e){
      this.setData({
        pageNumber: this.data.pageNumber+1
      }),
      this.listTopics(true)
  },

  toSearchView: function (e) {
    wx.navigateTo({
      url: '../search/search',
    })
  },

  bannerClick:function(e){
    console.log(e.target.dataset);
    wx.navigateTo({
      url: '../webview/webview?url=' + e.target.dataset.url+'&id='+e.target.dataset.index,
    })
  },

  //点击切换
  swichNav: function (e) {
    var that = this;
    if (this.data.currentTab === e.target.dataset.current) {
      return false;
    } else {
      that.setData({
        currentTab: e.target.dataset.current,
        contents:[],
        pageNumber:1,
      });
      /**
      wx.showLoading({ //显示消息提示框  此处是提升用户体验的作用
        title: '数据加载中',
        icon: 'loading',
      });
       */
      this.listTopics();
    }
  },

  toContentDetail:function(e){
    //设置全局变量
    getApp().globalData.currentContent = e.currentTarget.dataset.content;
    wx.navigateTo({
      url: '../content/content?item=' + e.currentTarget.dataset.content,
    })
  },
  //滑动切换
  swiperTab: function (e) {
    var that = this;
    // console.log(e.detail.current)
    that.setData({
      currentTab: e.detail.current
    });
  },

    // 用户登录示例
    bindGetUserInfo: function () {
        if (this.data.logged) return

        util.showBusy('正在登录')

        const session = qcloud.Session.get()

        if (session) {
            // 第二次登录
            // 或者本地已经有登录态
            // 可使用本函数更新登录态
            qcloud.loginWithCode({
                success: res => {
                    this.setData({ userInfo: res, logged: true })
                    util.showSuccess('登录成功')
                },
                fail: err => {
                    console.error(err)
                    util.showModel('登录错误', err.message)
                }
            })
        } else {
            // 首次登录
            qcloud.login({
                success: res => {
                    this.setData({ userInfo: res, logged: true })
                    util.showSuccess('登录成功')
                },
                fail: err => {
                    console.error(err)
                    util.showModel('登录错误', err.message)
                }
            })
        }
    },

    // 切换是否带有登录态
    switchRequestMode: function (e) {
        this.setData({
            takeSession: e.detail.value
        })
        this.doRequest()
    },

    doRequest: function () {
        util.showBusy('请求中...')
        var that = this
        var options = {
            url: config.service.requestUrl,
            login: true,
            success (result) {
                util.showSuccess('请求成功完成')
                console.log('request success', result)
                that.setData({
                    requestResult: JSON.stringify(result.data)
                })
            },
            fail (error) {
                util.showModel('请求失败', error);
                console.log('request fail', error);
            }
        }
        if (this.data.takeSession) {  // 使用 qcloud.request 带登录态登录
            qcloud.request(options)
        } else {    // 使用 wx.request 则不带登录态
            wx.request(options)
        }
    },

    // 上传图片接口
    doUpload: function () {
        var that = this

        // 选择图片
        wx.chooseImage({
            count: 1,
            sizeType: ['compressed'],
            sourceType: ['album', 'camera'],
            success: function(res){
                util.showBusy('正在上传')
                var filePath = res.tempFilePaths[0]

                // 上传图片
                wx.uploadFile({
                    url: config.service.uploadUrl,
                    filePath: filePath,
                    name: 'file',

                    success: function(res){
                        util.showSuccess('上传图片成功')
                        console.log(res)
                        res = JSON.parse(res.data)
                        console.log(res)
                        that.setData({
                            imgUrl: res.data.imgUrl
                        })
                    },

                    fail: function(e) {
                        util.showModel('上传图片失败')
                    }
                })

            },
            fail: function(e) {
                console.error(e)
            }
        })
    },

    // 预览图片
    previewImg: function () {
        wx.previewImage({
            current: this.data.imgUrl,
            urls: [this.data.imgUrl]
        })
    },

    // 切换信道的按钮
    switchChange: function (e) {
        var checked = e.detail.value

        if (checked) {
            this.openTunnel()
        } else {
            this.closeTunnel()
        }
    },

    openTunnel: function () {
        util.showBusy('信道连接中...')
        // 创建信道，需要给定后台服务地址
        var tunnel = this.tunnel = new qcloud.Tunnel(config.service.tunnelUrl)

        // 监听信道内置消息，包括 connect/close/reconnecting/reconnect/error
        tunnel.on('connect', () => {
            util.showSuccess('信道已连接')
            console.log('WebSocket 信道已连接')
            this.setData({ tunnelStatus: 'connected' })
        })

        tunnel.on('close', () => {
            util.showSuccess('信道已断开')
            console.log('WebSocket 信道已断开')
            this.setData({ tunnelStatus: 'closed' })
        })

        tunnel.on('reconnecting', () => {
            console.log('WebSocket 信道正在重连...')
            util.showBusy('正在重连')
        })

        tunnel.on('reconnect', () => {
            console.log('WebSocket 信道重连成功')
            util.showSuccess('重连成功')
        })

        tunnel.on('error', error => {
            util.showModel('信道发生错误', error)
            console.error('信道发生错误：', error)
        })

        // 监听自定义消息（服务器进行推送）
        tunnel.on('speak', speak => {
            util.showModel('信道消息', speak)
            console.log('收到说话消息：', speak)
        })

        // 打开信道
        tunnel.open()

        this.setData({ tunnelStatus: 'connecting' })
    },

    /**
     * 点击「发送消息」按钮，测试使用信道发送消息
     */
    sendMessage() {
        if (!this.data.tunnelStatus || !this.data.tunnelStatus === 'connected') return
        // 使用 tunnel.isActive() 来检测当前信道是否处于可用状态
        if (this.tunnel && this.tunnel.isActive()) {
            // 使用信道给服务器推送「speak」消息
            this.tunnel.emit('speak', {
                'word': 'I say something at ' + new Date(),
            });
        }
    },

    /**
     * 点击「关闭信道」按钮，关闭已经打开的信道
     */
    closeTunnel() {
        if (this.tunnel) {
            this.tunnel.close();
        }
        util.showBusy('信道连接中...')
        this.setData({ tunnelStatus: 'closed' })
    }
})

//index.js
var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config')
var util = require('../../utils/util.js')
Page({
  /**
  * 页面的初始数据
  */
  data: {
    inputValue: '', //搜索的内容
    contents: [],
    pageSize: 4,
    pageNumber: 1
  },

  //搜索框文本内容显示
  inputBind: function (event) {
    this.setData({
      inputValue: event.detail.value
    })
  },
  /**
  * 搜索执行按钮
  */
  searchBind: function (event) {
    var that = this
    if (!that.data.inputValue){
      return ;
    }
    that.setData({
      pageNumber:1
    })
    this.queryTopic(false,that.data.inputValue)
  },
  onReachBottom: function (e) {
    var that = this
    that.setData({
      pageNumber: that.data.pageNumber + 1
    }),
      this.queryTopic(true, that.data.inputValue)
  },

  queryTopic:function(type,keyWord){
    var that=this;
    wx.request({
      url: config.service.searchTopicUrl,
      data: {
        keyWord: keyWord,
        pageSize: this.data.pageSize,
        pageNumber: this.data.pageNumber
      },
      method: 'GET',
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        if(type){ //加载更多
          var oldData = that.data.contents;
          for (var i = 0; i < res.data.data.length; i++) {
            oldData.push(res.data.data[i]);
          }
          that.setData({
            contents: oldData,
          });
        }else{
          that.setData({
            contents: res.data.data,
          });
        }
      }
    })
  },
  toContentDetail: function (e) {
    //设置全局变量
    getApp().globalData.currentContent = e.currentTarget.dataset.content;
    wx.navigateTo({
      url: '../content/content?item=' + e.currentTarget.dataset.content,
    })
  },
})
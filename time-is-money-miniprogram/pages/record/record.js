const api = require('../../utils/api')

Page({
  data: {
    todayEarned: '0.00'
  },

  onLoad() {
    const app = getApp()
    api.getTodayEarnings(app.globalData.userId).then(data => {
      this.setData({ todayEarned: parseFloat(data.todayEarned).toFixed(2) })
    }).catch(() => {})
  }
})

const api = require('./utils/api')

App({
  globalData: {
    userId: null,
    userInfo: null,
    loginReady: false
  },

  onLaunch() {
    this.loginPromise = new Promise((resolve) => {
      wx.login({
        success: (res) => {
          if (res.code) {
            api.login(res.code, '', '').then(user => {
              this.globalData.userId = user.id
              this.globalData.loginReady = true
              console.log('[登录] 成功 userId:', user.id)
              resolve()
            }).catch(err => {
              console.error('[登录] 失败:', err)
              this.globalData.userId = 1
              this.globalData.loginReady = true
              resolve()
            })
          } else {
            this.globalData.userId = 1
            this.globalData.loginReady = true
            resolve()
          }
        },
        fail: () => {
          this.globalData.userId = 1
          this.globalData.loginReady = true
          resolve()
        }
      })
    })
  },

  waitForLogin() {
    return this.loginPromise || Promise.resolve()
  }
})

// 部署到 Railway 后，把第一行的地址改成你的 Railway 域名
// 正式地址放第一位，开发地址自动回退
const BASE_URLS = [
  'https://time-is-money-production.up.railway.app/api',
  'http://127.0.0.1:8080/api',
  'http://192.168.1.6:8080/api'
]
let currentUrlIndex = 0

function request(method, url, data) {
  return new Promise((resolve, reject) => {
    const fullUrl = BASE_URLS[currentUrlIndex] + url
    console.log('[API] 请求:', method, fullUrl, data)
    wx.request({
      url: fullUrl,
      method,
      data,
      header: { 'Content-Type': 'application/json' },
      success: (res) => {
        console.log('[API] 响应:', res.data)
        if (res.data && res.data.code === 200) {
          resolve(res.data.data)
        } else {
          reject(new Error((res.data && res.data.msg) || '请求失败'))
        }
      },
      fail: (err) => {
        console.error('[API] 失败(' + fullUrl + '):', err)
        if (currentUrlIndex < BASE_URLS.length - 1) {
          currentUrlIndex++
          console.log('[API] 切换到:', BASE_URLS[currentUrlIndex])
          resolve(request(method, url, data))
        } else {
          reject(err)
        }
      }
    })
  })
}

module.exports = {
  getConfig(userId) {
    return request('GET', '/config', { userId })
  },
  saveConfig(userId, data) {
    return request('POST', '/config?userId=' + userId, data)
  },
  getTodayEarnings(userId) {
    return request('GET', '/earnings/today', { userId })
  }
}

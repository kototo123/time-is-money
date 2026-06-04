const BASE_URL = 'http://localhost:8080/api'

function request(method, url, data) {
  return new Promise((resolve, reject) => {
    uni.request({
      url: BASE_URL + url,
      method,
      data,
      dataType: 'json',
      header: { 'Content-Type': 'application/json' },
      success: (res) => {
        if (res.data.code === 200) {
          resolve(res.data.data)
        } else {
          reject(new Error(res.data.msg || '请求失败'))
        }
      },
      fail: reject
    })
  })
}

export const api = {
  login(code, nickname, avatarUrl) {
    return request('POST', '/user/login', { code, nickname, avatarUrl })
  },
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

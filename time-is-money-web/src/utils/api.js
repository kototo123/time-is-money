const BASE_URL = 'http://localhost:8080/api'

async function request(method, url, data) {
  const params = method === 'GET' ? '?' + new URLSearchParams(data) : ''
  const body = method === 'GET' ? undefined : JSON.stringify(data)
  const res = await fetch(BASE_URL + url + params, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body
  })
  const json = await res.json()
  if (json.code === 200) return json.data
  throw new Error(json.msg || '请求失败')
}

export const api = {
  getConfig(userId) { return request('GET', '/config', { userId }) },
  saveConfig(userId, data) { return request('POST', '/config?userId=' + userId, data) },
  getTodayEarnings(userId) { return request('GET', '/earnings/today', { userId }) }
}

export function getStoredUser() {
  const raw = localStorage.getItem('user')
  if (raw) return JSON.parse(raw)
  const defaultUser = { id: 1, nickname: '测试用户' }
  localStorage.setItem('user', JSON.stringify(defaultUser))
  return defaultUser
}

export function setStoredUser(user) { localStorage.setItem('user', JSON.stringify(user)) }

const api = require('../../utils/api')

const fishQuotes = [
  '🐟 摸鱼一时爽，一直摸鱼一直爽',
  '🦑 薪水就像乌贼，喷着喷着就没了',
  '🐠 今天也是努力摸鱼的一天',
  '🐡 气得像河豚一样鼓鼓的，但还是得摸鱼',
  '🐙 八爪鱼也忙不过来，不如摸鱼',
  '🦐 摸鱼摸到虾，工作算个啥',
  '🐬 海豚音提醒你：该摸鱼了',
]

function pad(n) { return n < 10 ? '0' + n : '' + n }
function formatCountdown(secs) {
  if (secs <= 0) return '00:00:00'
  const h = Math.floor(secs / 3600)
  const m = Math.floor((secs % 3600) / 60)
  const s = secs % 60
  return pad(h) + ':' + pad(m) + ':' + pad(s)
}
function getGreeting() {
  const h = new Date().getHours()
  if (h < 6) return '夜深了，还在加班？'
  if (h < 9) return '早上好，摸鱼人！'
  if (h < 12) return '上午好，摸鱼要低调'
  if (h < 14) return '中午好，吃饱再摸鱼'
  if (h < 18) return '下午好，胜利在望'
  return '下班快乐！'
}
function getToday() {
  const d = new Date()
  const weekdays = ['日', '一', '二', '三', '四', '五', '六']
  return d.getFullYear() + '年' + (d.getMonth() + 1) + '月' + d.getDate() + '日 星期' + weekdays[d.getDay()]
}

Page({
  data: {
    earned: '0.00',
    dailyTotal: '0.00',
    percentage: 0,
    remainingSeconds: 0,
    isWorkTime: true,
    perSecond: '0.0000',
    countdown: '00:00:00',
    countdownLabel: '距离下班',
    statusText: '摸鱼中 🐟',
    fishIndex: 0,
    fishText: fishQuotes[0],
    greeting: getGreeting(),
    today: getToday(),
    error: ''
  },

  onLoad() {
    this.fetchData()
    this.timer = setInterval(() => this.fetchData(), 3000)
  },

  onUnload() {
    if (this.timer) clearInterval(this.timer)
  },

  fetchData() {
    const app = getApp()
    api.getTodayEarnings(app.globalData.userId).then(data => {
      const isWork = data.isWorkTime
      const remSecs = data.remainingSeconds
      let label, status
      if (!isWork && remSecs > 0) { label = '距离上班'; status = '休息中 😴' }
      else if (isWork) { label = '距离下班'; status = '摸鱼中 🐟' }
      else { label = '已经下班'; status = '自由时间 🎉' }
      this.setData({
        earned: parseFloat(data.todayEarned).toFixed(2),
        dailyTotal: parseFloat(data.todayTotal).toFixed(2),
        percentage: parseFloat(data.percentage),
        remainingSeconds: remSecs,
        isWorkTime: isWork,
        countdown: formatCountdown(remSecs),
        countdownLabel: label,
        statusText: status,
        perSecond: data.perSecond
          ? parseFloat(data.perSecond).toFixed(6)
          : '0.000000',
        error: ''
      })
    }).catch(err => {
      console.error('请求失败:', err)
      this.setData({
        error: '连接后端失败: ' + (err.errMsg || err.message || '未知错误')
      })
    })
  },

  toggleFish() {
    const idx = (this.data.fishIndex + 1) % fishQuotes.length
    this.setData({ fishIndex: idx, fishText: fishQuotes[idx] })
  }
})

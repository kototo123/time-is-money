const api = require('../../utils/api')

const fishQuotes = [
  '🐟 摸鱼一时爽，一直摸鱼一直爽',
  '🦑 薪水就像乌贼，喷着喷着就没了',
  '🐠 今天也是努力摸鱼的一天',
  '🐡 气得像河豚一样鼓鼓的，但还是得摸鱼',
  '🐙 八爪鱼也忙不过来，不如摸鱼',
  '🦐 摸鱼摸到虾，工作算个啥',
  '🐬 海豚音提醒你：该摸鱼了',
  '🦈 鲨鱼从不加班，因为它已经是海洋霸主',
  '🐳 鲸落万物生，摸鱼万物成',
  '🦀 横着走的螃蟹，从不看老板脸色',
  '🐸 井底之蛙也有摸鱼的自由',
  '🦋 蝴蝶效应告诉老板，我在扇动业绩',
  '🐝 采蜜的蜜蜂都知道劳逸结合',
  '🦉 猫头鹰白天摸鱼，晚上才认真',
  '🐧 企鹅摸鱼是因为天太冷，手冻僵了',
  '🦚 开屏的孔雀，摸的鱼也最漂亮',
  '🦩 火烈鸟站着都能睡，我坐着也能摸',
  '💼 工作使我快乐——假的',
  '☕ 咖啡续命，摸鱼续魂',
  '📉 今天的KPI和我的发际线一样在退',
  '💤 我不是在摸鱼，我是在为大脑充电',
  '🔄 上班如上坟，摸鱼如转世',
  '🧩 人生已经够难了，上班就别太认真',
  '🎮 摸鱼的最高境界：老板以为你在加班',
  '🎯 我的目标不是升职，是摸到下班',
  '⏰ 距离下班还有……算了，不看了，心累',
  '🌊 摸鱼不是懒，是给生活留一口气',
  '🚀 摸鱼不仅是为了生存，更是为了反抗',
  '💡 聪明人摸鱼，打工人打工',
]

function pad(n) { return n < 10 ? '0' + n : '' + n }
function getDp() { return parseInt(wx.getStorageSync('decimalPlaces')) || 2 }
function formatCountdown(secs) {
  if (secs <= 0) return '00:00:00'
  const h = Math.floor(secs / 3600)
  const m = Math.floor((secs % 3600) / 60)
  const s = secs % 60
  return pad(h) + ':' + pad(m) + ':' + pad(s)
}
function toMin(t) { return t.h * 60 + t.m }
function getGreeting(config) {
  const now = new Date()
  const h = now.getHours(), m = now.getMinutes()
  const cur = h * 60 + m
  if (h < 6) return '夜深了，还在加班？'
  if (!config) return cur < 12 ? '上午好' : '下午好'
  const start = toMin(config.workStart), end = toMin(config.workEnd)
  const lunchS = toMin(config.lunchStart), lunchE = toMin(config.lunchEnd)
  if (cur < start) return '还没到上班时间，早安'
  if (cur >= lunchS && cur < lunchE) return '午休时间，好好休息'
  if (cur >= end) return ''
  if (cur >= end - 120) return '胜利在望！'
  if (cur < lunchS) return '上午好，摸鱼要低调'
  return '下午好，加油摸鱼'
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
    perSecond: 0,
    percentage: 0,
    remainingSeconds: 0,
    isWorkTime: true,
    countdownStr: '00:00:00',
    countdownLabel: '距离下班',
    statusText: '摸鱼中 🐟',
    fishIndex: 0,
    fishText: fishQuotes[0],
    greeting: getGreeting(),
    today: getToday(),
    error: '',
    perSecondStr: '0.000000',
    percentageStr: '0.00',
    cdChars: '00:00:00'.split('').map((ch, i) => ({ ch, id: i, changed: false })),
    moneyChars: '0.00'.split('').map((ch, i) => ({ ch, id: i, dot: ch === '.', changed: false })),
    prevCdChars: [],
    prevMoneyChars: [],
    coins: [],
    coinIdSeq: 0,
    lastEarnedInt: -1,
    latestEarned: 0,
    moneyVisible: true,
    goalEnabled: false,
    goalName: '',
    goalAmount: 0,
    goalEarned: 0,
    goalEarnedStr: '0.00',
    goalPct: 0,
    goalPctStr: '0.0',
    celebration: false,
    confetti: [],
    showReport: false,
    reportEarned: '0.00',
    reportPct: '0',
    reportPerSec: '0',
    reportStatus: '',
    reportDate: '',
    isRestDay: false,
    workSchedule: null,
  },

  syncGoal() {
    const enabled = !!wx.getStorageSync('goalEnabled')
    this.setData({
      goalEnabled: enabled,
      goalName: wx.getStorageSync('goalName') || '',
      goalAmount: parseFloat(wx.getStorageSync('goalAmount')) || 0,
    })
  },

  updateGoalEarned(todayEarned) {
    const today = new Date().toISOString().slice(0, 10)
    const lastDate = wx.getStorageSync('goalLastDate') || ''
    let cumulative = parseFloat(wx.getStorageSync('cumulativeEarned')) || 0
    const lastToday = parseFloat(wx.getStorageSync('lastTodayEarned')) || 0

    if (lastDate && lastDate !== today) {
      cumulative += lastToday
      wx.setStorageSync('cumulativeEarned', cumulative)
    }
    wx.setStorageSync('goalLastDate', today)
    wx.setStorageSync('lastTodayEarned', todayEarned)

    const total = cumulative + todayEarned
    const amount = this.data.goalAmount
    const dp = getDp()
    const pct = amount > 0 ? Math.min(total / amount * 100, 100) : 0
    this.setData({
      goalEarned: total,
      goalEarnedStr: total.toFixed(dp),
      goalPct: pct,
      goalPctStr: pct.toFixed(1),
    })
  },

  fetchConfig() {
    const app = getApp()
    api.getConfig(app.globalData.userId).then(cfg => {
      if (!cfg) return
      this.data.workSchedule = {
        workStart: { h: parseInt(cfg.workStartTime?.slice(0,2)), m: parseInt(cfg.workStartTime?.slice(3,5)) },
        workEnd: { h: parseInt(cfg.workEndTime?.slice(0,2)), m: parseInt(cfg.workEndTime?.slice(3,5)) },
        lunchStart: { h: parseInt(cfg.lunchStart?.slice(0,2)), m: parseInt(cfg.lunchStart?.slice(3,5)) },
        lunchEnd: { h: parseInt(cfg.lunchEnd?.slice(0,2)), m: parseInt(cfg.lunchEnd?.slice(3,5)) },
      }
    })
  },

  onLoad() {
    getApp().waitForLogin().then(() => {
      this.setData({ moneyVisible: !wx.getStorageSync('hideMoney') })
      this.syncGoal()
      this.fetchConfig()
      this.fetchData()
      this.timer = setInterval(() => this.fetchData(), 3000)
      this.secondTimer = setInterval(() => this.tick(), 1000)
      setTimeout(() => this.spawnCoins(1, true), 500)
    })
  },

  onShow() {
    this.setData({ moneyVisible: !wx.getStorageSync('hideMoney') })
    this.syncGoal()
    this.fetchConfig()
    this.fetchData()
  },

  onUnload() {
    if (this.timer) clearInterval(this.timer)
    if (this.secondTimer) clearInterval(this.secondTimer)
  },

  tick() {
    const rem = this.data.remainingSeconds
    if (rem <= 0) return
    const perSec = parseFloat(this.data.perSecond) || 0
    const dailyTotal = parseFloat(this.data.dailyTotal) || 0
    const newRem = rem - 1
    const isWork = this.data.isWorkTime
    const dp = getDp()

    if (rem > 0 && newRem <= 0) this.spawnConfetti()

    const newCd = formatCountdown(newRem)
    const newCdChars = newCd.split('').map((ch, i) => {
      const changed = ch !== this.data.countdownStr[i]
      return { ch, id: i, changed }
    })

    if (isWork && perSec > 0) {
      const newEarned = Math.min(this.data.latestEarned + perSec, dailyTotal)
      this.data.latestEarned = newEarned
    }
    if (this.data.goalEnabled && this.data.goalAmount) {
      const cumulative = parseFloat(wx.getStorageSync('cumulativeEarned')) || 0
      const total = cumulative + this.data.latestEarned
      const amount = this.data.goalAmount
      const pct = amount > 0 ? Math.min(total / amount * 100, 100) : 0
      this.setData({
        goalEarned: total,
        goalEarnedStr: total.toFixed(dp),
        goalPct: pct,
        goalPctStr: pct.toFixed(1),
      })
    }

    if (isWork && perSec > 0) {
      if (Math.random() < 0.02) this.spawnCoins(1, false)
      const newMoney = this.data.latestEarned.toFixed(dp)
      const newPct = dailyTotal > 0 ? (this.data.latestEarned / dailyTotal * 100) : 0
      const newMoneyChars = newMoney.split('').map((ch, i) => {
        const changed = ch !== this.data.earned[i]
        return { ch, id: i, dot: ch === '.', changed }
      })
      this.setData({
        earned: newMoney,
        percentage: newPct,
        percentageStr: newPct.toFixed(2),
        remainingSeconds: newRem,
        countdownStr: newCd,
        cdChars: newCdChars,
        moneyChars: newMoneyChars,
      })
    } else {
      const curMoney = this.data.earned
      const newMoneyChars = curMoney.split('').map((ch, i) => {
        const changed = ch !== this.data.earned[i]
        return { ch, id: i, dot: ch === '.', changed }
      })
      this.setData({
        remainingSeconds: newRem,
        countdownStr: newCd,
        cdChars: newCdChars,
        moneyChars: newMoneyChars,
      })
    }

    // Clear changed flags after animation
    setTimeout(() => {
      this.setData({
        cdChars: this.data.cdChars.map(c => ({ ...c, changed: false })),
        moneyChars: this.data.moneyChars.map(c => ({ ...c, changed: false })),
      })
    }, 400)
  },

  fetchData() {
    const app = getApp()
    api.getTodayEarnings(app.globalData.userId).then(data => {
      const isWork = data.isWorkTime
      const remSecs = data.remainingSeconds
      const perSec = parseFloat(data.perSecond) || 0
      const restDay = data.isRestDay || false
      let label, status, greeting
      if (restDay) { label = '今天休息'; status = '休息日 🏖️'; greeting = '今天不用上班～ ☀️' }
      else if (!isWork && remSecs > 0) { label = '距离上班'; status = '休息中 😴'; greeting = '还没到上班时间' }
      else if (isWork) { label = '距离下班'; status = '摸鱼中 🐟' }
      else { label = '已经下班'; status = '自由时间 🎉'; greeting = '下班快乐！' }
      if (!greeting) greeting = getGreeting(this.data.workSchedule)

      const dp = getDp()
      const earnedNum = parseFloat(data.todayEarned) || 0
      this.data.latestEarned = earnedNum
      this.updateGoalEarned(earnedNum)
      const earnedStr = earnedNum.toFixed(dp)
      const cdStr = formatCountdown(remSecs)
      const pct = parseFloat(data.percentage)
      if (this.data.lastEarnedInt === -1) {
        const t = parseInt(wx.getStorageSync('coinThreshold')) || 0
        if (t) {
          this.data.lastEarnedInt = Math.floor(this.data.latestEarned / t)
          if (this.data.lastEarnedInt > 0) this.spawnCoins(Math.min(this.data.lastEarnedInt, 3), true)
        }
      } else {
        this.checkThreshold()
      }
      this.setData({
        earned: earnedStr,
        dailyTotal: parseFloat(data.todayTotal).toFixed(2),
        percentage: pct,
        remainingSeconds: remSecs,
        isWorkTime: isWork,
        perSecond: perSec,
        perSecondStr: perSec.toFixed(6),
        percentageStr: pct.toFixed(2),
        countdownLabel: label,
        statusText: status,
        countdownStr: cdStr,
        cdChars: cdStr.split('').map((ch, i) => ({ ch, id: i, changed: false })),
        moneyChars: earnedStr.split('').map((ch, i) => ({ ch, id: i, dot: ch === '.', changed: false })),
        isRestDay: restDay,
        greeting: greeting || this.data.greeting,
        error: ''
      })
    }).catch(() => {
      this.setData({ error: '连接后端失败' })
    })
  },

  checkThreshold() {
    const threshold = parseInt(wx.getStorageSync('coinThreshold')) || 0
    if (!threshold) return
    const curInt = Math.floor(this.data.latestEarned / threshold)
    if (this.data.lastEarnedInt === -1) {
      this.data.lastEarnedInt = curInt
    } else {
      const diff = curInt - this.data.lastEarnedInt
      if (diff < 0) {
        this.data.lastEarnedInt = curInt
      } else if (diff >= 1) {
        this.spawnCoins(diff, true)
        this.data.lastEarnedInt = curInt
      }
    }
  },

  spawnCoins(count, goldOnly) {
    const n = Math.min(count * 15, 60)
    const allTypes = ['gold', 'gold', 'copper', 'silver', 'bag']
    const sizes = { copper: 28, silver: 32, gold: 36, bag: 42 }
    const newCoins = []
    let seq = this.data.coinIdSeq
    for (let i = 0; i < n; i++) {
      seq++
      const type = goldOnly ? 'gold' : allTypes[Math.floor(Math.random() * 5)]
      newCoins.push({
        id: seq,
        left: Math.random() * 90 + '%',
        delay: Math.random() * 0.5 + 's',
        duration: (Math.random() * 1 + 1.5) + 's',
        size: sizes[type] + 'rpx',
        type,
      })
    }
    const allCoins = this.data.coins.concat(newCoins).slice(-150)
    this.setData({ coins: allCoins, coinIdSeq: seq })
    setTimeout(() => {
      this.setData({ coins: this.data.coins.slice(n) })
    }, 2500)
  },

  spawnConfetti() {
    const colors = ['#ff6b6b', '#ffd700', '#00d4ff', '#ff69b4', '#7bed9f', '#ffa502', '#5352ed', '#2ed573']
    const pieces = []
    for (let i = 0; i < 60; i++) {
      pieces.push({
        id: i,
        left: Math.random() * 100 + '%',
        delay: Math.random() * 1.5 + 's',
        duration: (Math.random() * 2 + 2) + 's',
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 12 + 8 + 'rpx',
        type: Math.random() > 0.5 ? 'circle' : 'square',
      })
    }
    this.setData({ celebration: true, confetti: pieces })
    setTimeout(() => this.setData({ celebration: false, confetti: [] }), 5000)
  },

  openReport() {
    const dp = getDp()
    const earned = parseFloat(this.data.earned) || 0
    const total = parseFloat(this.data.dailyTotal) || 0
    const pct = total > 0 ? (earned / total * 100).toFixed(1) : '0'
    this.setData({
      showReport: true,
      reportEarned: earned.toFixed(dp),
      reportPct: pct,
      reportPerSec: this.data.perSecondStr,
      reportStatus: this.data.statusText,
      reportDate: this.data.today,
    })
  },

  closeReport() {
    this.setData({ showReport: false })
  },

  onShareAppMessage() {
    const earned = this.data.reportEarned || this.data.earned
    return {
      title: '今日摸鱼报告：已赚 ¥' + earned + '！你也来试试 👋',
      path: '/pages/index/index',
    }
  },

  onShareTimeline() {
    const earned = this.data.reportEarned || this.data.earned
    return {
      title: '今日摸鱼报告：已赚 ¥' + earned + '！',
      query: '',
    }
  },

  toggleMoney() {
    this.setData({ moneyVisible: !this.data.moneyVisible })
  },

  toggleFish() {
    const idx = (this.data.fishIndex + 1) % fishQuotes.length
    this.setData({ fishIndex: idx, fishText: fishQuotes[idx] })
    this.spawnCoins(1, false)
  }
})

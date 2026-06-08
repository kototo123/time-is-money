const api = require('../../utils/api')

const weekdayNames = ['一', '二', '三', '四', '五', '六', '日']

function workDaysToSet(str) {
  if (!str) return new Set([1, 2, 3, 4, 5])
  return new Set(str.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n)))
}

function setToWorkDays(set) {
  return Array.from(set).sort((a, b) => a - b).join(',')
}

function buildCalendar(year, month, workDaysSet) {
  const firstDay = new Date(year, month - 1, 1)
  const lastDay = new Date(year, month, 0)
  const totalDays = lastDay.getDate()
  const startDOW = firstDay.getDay() || 7

  const today = new Date()
  const todayStr = today.getFullYear() + '-' + today.getMonth() + '-' + today.getDate()

  const weeks = []
  let week = []
  for (let i = 0; i < startDOW - 1; i++) {
    week.push({ date: null, dow: null, isWork: false, isToday: false })
  }
  for (let d = 1; d <= totalDays; d++) {
    const dow = new Date(year, month - 1, d).getDay() || 7
    const isToday = (year + '-' + (month - 1) + '-' + d) === todayStr
    week.push({ date: d, dow, isWork: workDaysSet.has(dow), isToday })
    if (dow === 7 || d === totalDays) {
      while (week.length < 7) {
        week.push({ date: null, dow: null, isWork: false, isToday: false })
      }
      weeks.push(week)
      week = []
    }
  }
  return weeks
}

Page({
  data: {
    salaryType: 'MONTHLY',
    monthlySalary: '5000',
    hourlyRate: '0',
    dailyWorkHours: '8',
    workStartTime: '09:00',
    workEndTime: '18:00',
    lunchStart: '12:00',
    lunchEnd: '13:00',
    workDays: '1,2,3,4,5',
    calendarYear: 0,
    calendarMonth: 0,
    calendarWeeks: [],
    weekdayNames,
    decimalPlaces: 2,
    decimalIndex: 0,
    decimalOptions: [
      { label: '2位 (0.01)', value: 2 },
      { label: '3位 (0.001)', value: 3 },
      { label: '4位 (0.0001)', value: 4 },
      { label: '5位 (0.00001)', value: 5 },
      { label: '6位 (0.000001)', value: 6 },
    ],
    coinThreshold: 1,
    coinThresholdIndex: 0,
    coinThresholdOptions: [
      { label: '关闭', value: 0 },
      { label: '每赚 1 元', value: 1 },
      { label: '每赚 5 元', value: 5 },
      { label: '每赚 10 元', value: 10 },
      { label: '每赚 50 元', value: 50 },
      { label: '每赚 100 元', value: 100 },
    ],
    hideMoney: false,
    goalEnabled: false,
    goalName: '',
    goalAmount: '',
  },

  refreshCalendar(workDays) {
    const s = workDaysToSet(workDays)
    const weeks = buildCalendar(this.data.calendarYear, this.data.calendarMonth, s)
    this.setData({ calendarWeeks: weeks })
  },

  onLoad() {
    getApp().waitForLogin().then(() => {
      let dp = wx.getStorageSync('decimalPlaces')
      if (dp === '' || dp === null || dp === undefined) { dp = 2; wx.setStorageSync('decimalPlaces', dp) }
      let ct = parseInt(wx.getStorageSync('coinThreshold'))
      if (isNaN(ct)) { ct = 1; wx.setStorageSync('coinThreshold', ct) }
      const ctIdx = this.data.coinThresholdOptions.findIndex(o => o.value === ct)
      const hideMoney = !!wx.getStorageSync('hideMoney')
      const goalEnabled = !!wx.getStorageSync('goalEnabled')
      const goalName = wx.getStorageSync('goalName') || ''
      const goalAmount = wx.getStorageSync('goalAmount') || ''

      const now = new Date()
      this.setData({
        decimalPlaces: dp,
        decimalIndex: dp - 2,
        coinThreshold: ct,
        coinThresholdIndex: ctIdx > -1 ? ctIdx : 0,
        hideMoney,
        goalEnabled,
        goalName,
        goalAmount,
        calendarYear: now.getFullYear(),
        calendarMonth: now.getMonth() + 1,
      })

      const app = getApp()
      api.getConfig(app.globalData.userId).then(config => {
        if (config) {
          const wd = config.workDays || '1,2,3,4,5'
          this.setData({
            salaryType: config.salaryType || 'MONTHLY',
            monthlySalary: String(config.monthlySalary || ''),
            hourlyRate: String(config.hourlyRate || ''),
            dailyWorkHours: String(config.dailyWorkHours || '8'),
            workStartTime: (config.workStartTime || '09:00').slice(0, 5),
            workEndTime: (config.workEndTime || '18:00').slice(0, 5),
            lunchStart: (config.lunchStart || '12:00').slice(0, 5),
            lunchEnd: (config.lunchEnd || '13:00').slice(0, 5),
            workDays: wd,
          })
          this.refreshCalendar(wd)
        } else {
          this.refreshCalendar('1,2,3,4,5')
        }
      }).catch(() => {
        this.refreshCalendar('1,2,3,4,5')
      })
    })
  },

  onDecimalChange(e) {
    const idx = parseInt(e.detail.value)
    const val = this.data.decimalOptions[idx].value
    wx.setStorageSync('decimalPlaces', val)
    this.setData({ decimalPlaces: val, decimalIndex: idx })
    wx.showToast({ title: '已设为 ' + val + ' 位', icon: 'none' })
  },

  onCoinThresholdChange(e) {
    const idx = parseInt(e.detail.value)
    const val = this.data.coinThresholdOptions[idx].value
    wx.setStorageSync('coinThreshold', val)
    this.setData({ coinThreshold: val, coinThresholdIndex: idx })
    wx.showToast({ title: val ? '每' + val + '元掉金币' : '已关闭金币', icon: 'none' })
  },

  onGoalEnabledChange(e) {
    this.setData({ goalEnabled: e.detail.value })
  },

  onHideMoneyChange(e) {
    const val = e.detail.value
    wx.setStorageSync('hideMoney', val)
    this.setData({ hideMoney: val })
  },

  setType(e) {
    this.setData({ salaryType: e.currentTarget.dataset.type })
  },

  onInput(e) {
    const field = e.currentTarget.dataset.field
    this.setData({ [field]: e.detail.value })
  },

  onTimeChange(e) {
    const field = e.currentTarget.dataset.field
    this.setData({ [field]: e.detail.value })
  },

  toggleDay(e) {
    const dow = parseInt(e.currentTarget.dataset.dow)
    if (!dow) return
    const set = workDaysToSet(this.data.workDays)
    if (set.has(dow)) set.delete(dow); else set.add(dow)
    const str = setToWorkDays(set)
    this.setData({ workDays: str })
    this.refreshCalendar(str)
  },

  toggleWeekday(e) {
    const dow = parseInt(e.currentTarget.dataset.dow)
    const set = workDaysToSet(this.data.workDays)
    if (set.has(dow)) set.delete(dow); else set.add(dow)
    const str = setToWorkDays(set)
    this.setData({ workDays: str })
    this.refreshCalendar(str)
  },

  prevMonth() {
    let y = this.data.calendarYear, m = this.data.calendarMonth - 1
    if (m < 1) { m = 12; y-- }
    this.setData({ calendarYear: y, calendarMonth: m })
    this.refreshCalendar(this.data.workDays)
  },

  nextMonth() {
    let y = this.data.calendarYear, m = this.data.calendarMonth + 1
    if (m > 12) { m = 1; y++ }
    this.setData({ calendarYear: y, calendarMonth: m })
    this.refreshCalendar(this.data.workDays)
  },

  handleSave() {
    const app = getApp()
    api.saveConfig(app.globalData.userId, {
      salaryType: this.data.salaryType,
      monthlySalary: this.data.salaryType === 'MONTHLY' ? parseFloat(this.data.monthlySalary) : 0,
      hourlyRate: this.data.salaryType === 'HOURLY' ? parseFloat(this.data.hourlyRate) : 0,
      dailyWorkHours: parseFloat(this.data.dailyWorkHours),
      workStartTime: this.data.workStartTime,
      workEndTime: this.data.workEndTime,
      lunchStart: this.data.lunchStart,
      lunchEnd: this.data.lunchEnd,
      workDaysPerWeek: this.data.workDays ? workDaysToSet(this.data.workDays).size : 5,
      workDays: this.data.workDays,
    }).then(() => {
      wx.setStorageSync('goalEnabled', this.data.goalEnabled)
      wx.setStorageSync('goalName', this.data.goalName)
      wx.setStorageSync('goalAmount', this.data.goalAmount)
      wx.showToast({ title: '保存成功', icon: 'success' })
    }).catch(() => {
      wx.showToast({ title: '保存失败', icon: 'none' })
    })
  }
})

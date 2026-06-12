const api = require('../../utils/api')

const weekdayNames = ['一', '二', '三', '四', '五', '六', '日']

function workDaysToSet(str) {
  if (!str) return new Set([1, 2, 3, 4, 5])
  return new Set(str.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n)))
}

function setToWorkDays(set) {
  return Array.from(set).sort((a, b) => a - b).join(',')
}

function workDaysLabel(str) {
  if (!str) return '点击设置'
  const names = str.split(',').map(n => weekdayNames[parseInt(n) - 1]).filter(Boolean)
  if (names.length <= 5) return names.join(' ')
  return names.slice(0, 5).join(' ') + '..'
}

function parseOverrides(str) {
  const added = new Set()
  const removed = new Set()
  if (!str) return { added, removed }
  str.split(',').forEach(entry => {
    entry = entry.trim()
    if (!entry) return
    if (entry.startsWith('+')) added.add(entry.slice(1))
    else if (entry.startsWith('-')) removed.add(entry.slice(1))
  })
  return { added, removed }
}

function overridesToString(added, removed) {
  const parts = []
  Array.from(added).sort().forEach(d => parts.push('+' + d))
  Array.from(removed).sort().forEach(d => parts.push('-' + d))
  return parts.join(',')
}

function formatDate(y, m, d) {
  return y + '-' + String(m).padStart(2, '0') + '-' + String(d).padStart(2, '0')
}

function buildCalendar(year, month, workDaysSet, addedSet, removedSet) {
  const firstDay = new Date(year, month - 1, 1)
  const lastDay = new Date(year, month, 0)
  const totalDays = lastDay.getDate()
  const startDOW = firstDay.getDay() || 7

  const today = new Date()
  const todayStr = formatDate(today.getFullYear(), today.getMonth() + 1, today.getDate())

  const weeks = []
  let week = []
  for (let i = 0; i < startDOW - 1; i++) {
    week.push({ date: null, dow: null, isWork: false, isToday: false, isOverride: false })
  }
  for (let d = 1; d <= totalDays; d++) {
    const dow = new Date(year, month - 1, d).getDay() || 7
    const ds = formatDate(year, month, d)
    const isToday = ds === todayStr
    const isAdded = addedSet.has(ds)
    const isRemoved = removedSet.has(ds)
    const isWork = isAdded ? true : isRemoved ? false : workDaysSet.has(dow)
    week.push({ date: d, dow, isWork, isToday, isOverride: isAdded || isRemoved, dateStr: ds })
    if (dow === 7 || d === totalDays) {
      while (week.length < 7) { week.push({ date: null, dow: null, isWork: false, isToday: false, isOverride: false }) }
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
    workDaysLabel: '一 二 三 四 五',
    workDateOverrides: '',
    calOpen: false,
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

  refreshCalendar() {
    const s = workDaysToSet(this.data.workDays)
    const { added, removed } = parseOverrides(this.data.workDateOverrides)
    const weeks = buildCalendar(this.data.calendarYear, this.data.calendarMonth, s, added, removed)
    this.setData({ calendarWeeks: weeks })
  },

  openCal() {
    const now = new Date()
    this.setData({
      calOpen: true,
      calendarYear: now.getFullYear(),
      calendarMonth: now.getMonth() + 1,
    })
    this.refreshCalendar()
  },

  closeCal() {
    this.setData({ calOpen: false })
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

      this.setData({
        decimalPlaces: dp,
        decimalIndex: dp - 2,
        coinThreshold: ct,
        coinThresholdIndex: ctIdx > -1 ? ctIdx : 0,
        hideMoney,
        goalEnabled,
        goalName,
        goalAmount,
      })

      const app = getApp()
      api.getConfig(app.globalData.userId).then(config => {
        if (config) {
          this.setData({
            salaryType: config.salaryType || 'MONTHLY',
            monthlySalary: String(config.monthlySalary || ''),
            hourlyRate: String(config.hourlyRate || ''),
            dailyWorkHours: String(config.dailyWorkHours || '8'),
            workStartTime: (config.workStartTime || '09:00').slice(0, 5),
            workEndTime: (config.workEndTime || '18:00').slice(0, 5),
            lunchStart: (config.lunchStart || '12:00').slice(0, 5),
            lunchEnd: (config.lunchEnd || '13:00').slice(0, 5),
            workDays: config.workDays || '1,2,3,4,5',
            workDaysLabel: workDaysLabel(config.workDays || '1,2,3,4,5'),
            workDateOverrides: config.workDateOverrides || '',
          })
        }
      }).catch(() => {})
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

  onGoalEnabledChange(e) { this.setData({ goalEnabled: e.detail.value }) },

  onHideMoneyChange(e) {
    const val = e.detail.value
    wx.setStorageSync('hideMoney', val)
    this.setData({ hideMoney: val })
  },

  setType(e) { this.setData({ salaryType: e.currentTarget.dataset.type }) },

  onInput(e) {
    const field = e.currentTarget.dataset.field
    this.setData({ [field]: e.detail.value })
  },

  onTimeChange(e) {
    const field = e.currentTarget.dataset.field
    this.setData({ [field]: e.detail.value })
  },

  toggleWeekday(e) {
    const dow = parseInt(e.currentTarget.dataset.dow)
    const set = workDaysToSet(this.data.workDays)
    if (set.has(dow)) set.delete(dow); else set.add(dow)
    const str = setToWorkDays(set)
    this.setData({ workDays: str, workDaysLabel: workDaysLabel(str) })
    this.refreshCalendar()
  },

  toggleDay(e) {
    const ds = e.currentTarget.dataset.date
    if (!ds) return
    const s = workDaysToSet(this.data.workDays)
    const dow = new Date(ds).getDay() || 7
    const baseWork = s.has(dow)
    const { added, removed } = parseOverrides(this.data.workDateOverrides)
    if (baseWork) {
      if (removed.has(ds)) removed.delete(ds); else removed.add(ds)
      if (added.has(ds)) added.delete(ds)
    } else {
      if (added.has(ds)) added.delete(ds); else added.add(ds)
      if (removed.has(ds)) removed.delete(ds)
    }
    this.setData({ workDateOverrides: overridesToString(added, removed) })
    this.refreshCalendar()
  },

  prevMonth() {
    let y = this.data.calendarYear, m = this.data.calendarMonth - 1
    if (m < 1) { m = 12; y-- }
    this.setData({ calendarYear: y, calendarMonth: m })
    this.refreshCalendar()
  },

  nextMonth() {
    let y = this.data.calendarYear, m = this.data.calendarMonth + 1
    if (m > 12) { m = 1; y++ }
    this.setData({ calendarYear: y, calendarMonth: m })
    this.refreshCalendar()
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
      workDateOverrides: this.data.workDateOverrides,
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

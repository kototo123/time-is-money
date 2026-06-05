const api = require('../../utils/api')

const workDaysOptions = [
  { label: '1天/周', value: 1 },
  { label: '2天/周', value: 2 },
  { label: '3天/周', value: 3 },
  { label: '4天/周', value: 4 },
  { label: '5天/周', value: 5 },
  { label: '6天/周', value: 6 },
  { label: '7天/周', value: 7 },
]

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
    workDaysPerWeek: 5,
    workDaysIndex: 4,
    workDaysOptions: workDaysOptions,
    salaryTypeOptions: [
      { label: '月薪', value: 'MONTHLY' },
      { label: '时薪', value: 'HOURLY' },
    ],
  },

  onLoad() {
    const app = getApp()
    api.getConfig(app.globalData.userId).then(config => {
      if (config) {
        const wd = config.workDaysPerWeek || 5
        this.setData({
          salaryType: config.salaryType || 'MONTHLY',
          monthlySalary: String(config.monthlySalary || ''),
          hourlyRate: String(config.hourlyRate || ''),
          dailyWorkHours: String(config.dailyWorkHours || '8'),
          workStartTime: (config.workStartTime || '09:00').slice(0, 5),
          workEndTime: (config.workEndTime || '18:00').slice(0, 5),
          lunchStart: (config.lunchStart || '12:00').slice(0, 5),
          lunchEnd: (config.lunchEnd || '13:00').slice(0, 5),
          workDaysPerWeek: wd,
          workDaysIndex: wd - 1,
        })
      }
    }).catch(() => {})
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

  onWorkDaysChange(e) {
    const idx = parseInt(e.detail.value)
    this.setData({
      workDaysIndex: idx,
      workDaysPerWeek: workDaysOptions[idx].value,
    })
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
      workDaysPerWeek: this.data.workDaysPerWeek,
    }).then(() => {
      wx.showToast({ title: '保存成功', icon: 'success' })
    }).catch(() => {
      wx.showToast({ title: '保存失败', icon: 'none' })
    })
  }
})

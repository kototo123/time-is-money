const api = require('../../utils/api')

Page({
  data: {
    salaryType: 'MONTHLY',
    monthlySalary: '5000',
    hourlyRate: '0',
    dailyWorkHours: '8',
    workStartTime: '09:00',
    workEndTime: '18:00'
  },

  onLoad() {
    const app = getApp()
    api.getConfig(app.globalData.userId).then(config => {
      if (config) {
        this.setData({
          salaryType: config.salaryType || 'MONTHLY',
          monthlySalary: String(config.monthlySalary || ''),
          hourlyRate: String(config.hourlyRate || ''),
          dailyWorkHours: String(config.dailyWorkHours || '8'),
          workStartTime: (config.workStartTime || '09:00').slice(0, 5),
          workEndTime: (config.workEndTime || '18:00').slice(0, 5)
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

  handleSave() {
    const app = getApp()
    api.saveConfig(app.globalData.userId, {
      salaryType: this.data.salaryType,
      monthlySalary: this.data.salaryType === 'MONTHLY' ? parseFloat(this.data.monthlySalary) : 0,
      hourlyRate: this.data.salaryType === 'HOURLY' ? parseFloat(this.data.hourlyRate) : 0,
      dailyWorkHours: parseFloat(this.data.dailyWorkHours),
      workStartTime: this.data.workStartTime,
      workEndTime: this.data.workEndTime
    }).then(() => {
      wx.showToast({ title: '保存成功', icon: 'success' })
    }).catch(() => {
      wx.showToast({ title: '保存失败', icon: 'none' })
    })
  }
})

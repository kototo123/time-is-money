<template>
  <view class="container">
    <view class="section">
      <text class="section-title">薪资设置</text>

      <view class="form-group">
        <text class="label">薪资类型</text>
        <view class="radio-group">
          <view class="radio-item" :class="{ active: salaryType === 'MONTHLY' }" @tap="salaryType = 'MONTHLY'">
            <text>月薪</text>
          </view>
          <view class="radio-item" :class="{ active: salaryType === 'HOURLY' }" @tap="salaryType = 'HOURLY'">
            <text>时薪</text>
          </view>
        </view>
      </view>

      <view class="form-group" v-if="salaryType === 'MONTHLY'">
        <text class="label">月薪 (元)</text>
        <input class="input" type="digit" v-model="monthlySalary" placeholder="请输入月薪" />
      </view>

      <view class="form-group" v-if="salaryType === 'HOURLY'">
        <text class="label">时薪 (元)</text>
        <input class="input" type="digit" v-model="hourlyRate" placeholder="请输入时薪" />
      </view>

      <view class="form-group">
        <text class="label">每日工作小时数</text>
        <input class="input" type="digit" v-model="dailyWorkHours" placeholder="默认8小时" />
      </view>
    </view>

    <view class="section">
      <text class="section-title">工作时间</text>

      <view class="form-group">
        <text class="label">上班时间</text>
        <picker mode="time" :value="workStartTime" @change="e => workStartTime = e.detail.value">
          <view class="picker">{{ workStartTime || '选择时间' }}</view>
        </picker>
      </view>

      <view class="form-group">
        <text class="label">下班时间</text>
        <picker mode="time" :value="workEndTime" @change="e => workEndTime = e.detail.value">
          <view class="picker">{{ workEndTime || '选择时间' }}</view>
        </picker>
      </view>
    </view>

    <button class="save-btn" @tap="handleSave">保存设置</button>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api } from '@/utils/api'

const user = uni.getStorageSync('user')
const salaryType = ref('MONTHLY')
const monthlySalary = ref('')
const hourlyRate = ref('')
const dailyWorkHours = ref('8')
const workStartTime = ref('09:00')
const workEndTime = ref('18:00')

onMounted(async () => {
  if (!user) {
    uni.reLaunch({ url: '/pages/login/login' })
    return
  }
  try {
    const config = await api.getConfig(user.id)
    if (config) {
      salaryType.value = config.salaryType || 'MONTHLY'
      monthlySalary.value = config.monthlySalary ? String(config.monthlySalary) : ''
      hourlyRate.value = config.hourlyRate ? String(config.hourlyRate) : ''
      dailyWorkHours.value = config.dailyWorkHours ? String(config.dailyWorkHours) : '8'
      workStartTime.value = config.workStartTime || '09:00'
      workEndTime.value = config.workEndTime || '18:00'
    }
  } catch (e) {
    console.error('获取配置失败', e)
  }
})

async function handleSave() {
  try {
    await api.saveConfig(user.id, {
      salaryType: salaryType.value,
      monthlySalary: salaryType.value === 'MONTHLY' ? parseFloat(monthlySalary.value) : 0,
      hourlyRate: salaryType.value === 'HOURLY' ? parseFloat(hourlyRate.value) : 0,
      dailyWorkHours: parseFloat(dailyWorkHours.value),
      workStartTime: workStartTime.value,
      workEndTime: workEndTime.value,
    })
    uni.showToast({ title: '保存成功', icon: 'success' })
  } catch (e) {
    uni.showToast({ title: '保存失败', icon: 'none' })
  }
}
</script>

<style scoped>
.container {
  padding: 30rpx;
}
.section {
  background: #1a1a2e;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
}
.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #00d4ff;
  display: block;
  margin-bottom: 30rpx;
}
.form-group {
  margin-bottom: 30rpx;
}
.label {
  font-size: 28rpx;
  color: #8888aa;
  display: block;
  margin-bottom: 12rpx;
}
.input {
  height: 80rpx;
  background: #0f0f23;
  border-radius: 12rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
  color: #fff;
}
.radio-group {
  display: flex;
  gap: 20rpx;
}
.radio-item {
  flex: 1;
  height: 80rpx;
  line-height: 80rpx;
  text-align: center;
  background: #0f0f23;
  border-radius: 12rpx;
  font-size: 28rpx;
  color: #8888aa;
  border: 1px solid transparent;
}
.radio-item.active {
  background: rgba(0, 212, 255, 0.15);
  color: #00d4ff;
  border-color: #00d4ff;
}
.picker {
  height: 80rpx;
  line-height: 80rpx;
  background: #0f0f23;
  border-radius: 12rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
  color: #fff;
}
.save-btn {
  width: 100%;
  height: 88rpx;
  line-height: 88rpx;
  background: linear-gradient(135deg, #00d4ff, #0077ff);
  border-radius: 44rpx;
  font-size: 32rpx;
  border: none;
  color: #fff;
}
</style>

<template>
  <div class="container">
    <div class="section">
      <div class="section-title">薪资设置</div>

      <div class="form-group">
        <label class="label">薪资类型</label>
        <div class="radio-group">
          <div class="radio-item" :class="{ active: salaryType === 'MONTHLY' }" @click="salaryType = 'MONTHLY'">月薪</div>
          <div class="radio-item" :class="{ active: salaryType === 'HOURLY' }" @click="salaryType = 'HOURLY'">时薪</div>
        </div>
      </div>

      <div class="form-group" v-if="salaryType === 'MONTHLY'">
        <label class="label">月薪 (元)</label>
        <input class="input" type="number" v-model.number="monthlySalary" placeholder="请输入月薪" />
      </div>

      <div class="form-group" v-if="salaryType === 'HOURLY'">
        <label class="label">时薪 (元)</label>
        <input class="input" type="number" v-model.number="hourlyRate" placeholder="请输入时薪" />
      </div>

      <div class="form-group">
        <label class="label">每日工作小时数</label>
        <input class="input" type="number" v-model.number="dailyWorkHours" placeholder="默认8小时" />
      </div>
    </div>

    <div class="section">
      <div class="section-title">工作时间</div>
      <div class="form-group">
        <label class="label">上班时间</label>
        <input class="input" type="time" v-model="workStartTime" />
      </div>
      <div class="form-group">
        <label class="label">下班时间</label>
        <input class="input" type="time" v-model="workEndTime" />
      </div>
    </div>

    <button class="save-btn" @click="handleSave">保存设置</button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api, getStoredUser } from '../utils/api'

const user = getStoredUser()
const salaryType = ref('MONTHLY')
const monthlySalary = ref(0)
const hourlyRate = ref(0)
const dailyWorkHours = ref(8)
const workStartTime = ref('09:00')
const workEndTime = ref('18:00')

onMounted(async () => {
  if (!user) return
  try {
    const config = await api.getConfig(user.id)
    if (config) {
      salaryType.value = config.salaryType || 'MONTHLY'
      monthlySalary.value = config.monthlySalary || 0
      hourlyRate.value = config.hourlyRate || 0
      dailyWorkHours.value = config.dailyWorkHours || 8
      workStartTime.value = config.workStartTime?.slice(0, 5) || '09:00'
      workEndTime.value = config.workEndTime?.slice(0, 5) || '18:00'
    }
  } catch (e) { console.error(e) }
})

async function handleSave() {
  try {
    await api.saveConfig(user.id, {
      salaryType: salaryType.value,
      monthlySalary: salaryType.value === 'MONTHLY' ? monthlySalary.value : 0,
      hourlyRate: salaryType.value === 'HOURLY' ? hourlyRate.value : 0,
      dailyWorkHours: dailyWorkHours.value,
      workStartTime: workStartTime.value,
      workEndTime: workEndTime.value,
    })
    alert('保存成功')
  } catch (e) { alert('保存失败') }
}
</script>

<style scoped>
.container { padding: 24px; }
.section { background: #1a1a2e; border-radius: 16px; padding: 24px; margin-bottom: 20px; }
.section-title { font-size: 18px; font-weight: bold; color: #00d4ff; margin-bottom: 20px; }
.form-group { margin-bottom: 20px; }
.label { font-size: 14px; color: #8888aa; display: block; margin-bottom: 8px; }
.input {
  width: 100%; height: 48px; background: #0f0f23; border: none; border-radius: 8px;
  padding: 0 14px; font-size: 15px; color: #fff; outline: none;
}
.radio-group { display: flex; gap: 12px; }
.radio-item {
  flex: 1; height: 48px; line-height: 48px; text-align: center;
  background: #0f0f23; border-radius: 8px; font-size: 15px;
  color: #8888aa; border: 1px solid transparent; cursor: pointer;
}
.radio-item.active {
  background: rgba(0,212,255,0.15); color: #00d4ff; border-color: #00d4ff;
}
.save-btn {
  width: 100%; height: 52px; line-height: 52px;
  background: linear-gradient(135deg, #00d4ff, #0077ff);
  border-radius: 26px; font-size: 17px; border: none; color: #fff; cursor: pointer;
}
</style>

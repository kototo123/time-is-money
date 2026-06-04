<template>
  <div class="container">
    <div class="page-title">每日收入记录</div>

    <div class="summary-card">
      <div class="summary-label">今日收入</div>
      <div class="summary-amount">¥{{ todayEarned }}</div>
    </div>

    <div class="record-list">
      <div class="empty">暂无记录，快去摸鱼吧 🐟</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api, getStoredUser } from '../utils/api'

const user = getStoredUser()
const todayEarned = ref('0.00')

onMounted(async () => {
  if (!user) return
  try {
    const data = await api.getTodayEarnings(user.id)
    todayEarned.value = parseFloat(data.todayEarned).toFixed(2)
  } catch (e) { console.error(e) }
})
</script>

<style scoped>
.container { padding: 24px; }
.page-title { font-size: 18px; font-weight: bold; color: #00d4ff; margin-bottom: 20px; }
.summary-card {
  background: linear-gradient(135deg, #1a1a2e, #16213e);
  border-radius: 16px; padding: 32px; text-align: center;
  margin-bottom: 20px; border: 1px solid rgba(255,215,0,0.2);
}
.summary-label { font-size: 14px; color: #8888aa; margin-bottom: 8px; }
.summary-amount { font-size: 48px; font-weight: bold; color: #ffd700; font-family: 'Courier New', monospace; }
.record-list { background: #1a1a2e; border-radius: 16px; padding: 20px; }
.empty { text-align: center; padding: 40px; color: #8888aa; font-size: 15px; }
</style>

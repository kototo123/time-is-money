<template>
  <div class="container">
    <div class="header">
      <div class="greeting">{{ greeting }}</div>
      <div class="date">{{ today }}</div>
    </div>

    <div class="money-card">
      <div class="money-label">今日已赚</div>
      <div class="money-amount">¥{{ earned }}</div>
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: percentage + '%' }"></div>
      </div>
      <div class="progress-text">已完成 {{ percentage }}%</div>
    </div>

    <div class="info-row">
      <div class="info-item">
        <div class="info-label">今日目标</div>
        <div class="info-value">¥{{ dailyTotal }}</div>
      </div>
      <div class="info-item">
        <div class="info-label">每秒入账</div>
        <div class="info-value">¥{{ perSecond }}</div>
      </div>
    </div>

    <div class="countdown-card" :class="{ 'is-off-duty': !isWorkTime }">
      <div class="countdown-label">{{ countdownLabel }}</div>
      <div class="countdown-time">{{ countdown }}</div>
      <div class="countdown-status">{{ statusText }}</div>
    </div>

    <div class="fish-tip" @click="toggleFish">{{ fishText }}</div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { api, getStoredUser } from '../utils/api'

const user = getStoredUser()
const earned = ref('0.00')
const dailyTotal = ref('0.00')
const percentage = ref(0)
const remainingSeconds = ref(0)
const isWorkTime = ref(true)
const perSecond = ref('0.0000')
const countdown = ref('00:00:00')
const fishIndex = ref(0)

const fishQuotes = [
  '🐟 摸鱼一时爽，一直摸鱼一直爽',
  '🦑 薪水就像乌贼，喷着喷着就没了',
  '🐠 今天也是努力摸鱼的一天',
  '🐡 气得像河豚一样鼓鼓的，但还是得摸鱼',
  '🐙 八爪鱼也忙不过来，不如摸鱼',
  '🦐 摸鱼摸到虾，工作算个啥',
  '🐬 海豚音提醒你：该摸鱼了',
]

const today = computed(() => {
  const d = new Date()
  const weekdays = ['日', '一', '二', '三', '四', '五', '六']
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 星期${weekdays[d.getDay()]}`
})

const greeting = computed(() => {
  const h = new Date().getHours()
  if (h < 6) return '夜深了，还在加班？'
  if (h < 9) return '早上好，摸鱼人！'
  if (h < 12) return '上午好，摸鱼要低调'
  if (h < 14) return '中午好，吃饱再摸鱼'
  if (h < 18) return '下午好，胜利在望'
  return '下班快乐！'
})

const countdownLabel = computed(() => {
  if (!isWorkTime.value && remainingSeconds.value > 0) return '距离上班'
  if (isWorkTime.value) return '距离下班'
  return '已经下班'
})

const statusText = computed(() => {
  if (!isWorkTime.value && remainingSeconds.value > 0) return '休息中 😴'
  if (isWorkTime.value) return '摸鱼中 🐟'
  return '自由时间 🎉'
})

const fishText = computed(() => fishQuotes[fishIndex.value])

let timer = null

function toggleFish() {
  fishIndex.value = (fishIndex.value + 1) % fishQuotes.length
}

function pad(n) { return n < 10 ? '0' + n : '' + n }

function formatCountdown(secs) {
  if (secs <= 0) return '00:00:00'
  const h = Math.floor(secs / 3600)
  const m = Math.floor((secs % 3600) / 60)
  const s = secs % 60
  return `${pad(h)}:${pad(m)}:${pad(s)}`
}

async function fetchData() {
  if (!user) return
  try {
    const data = await api.getTodayEarnings(user.id)
    earned.value = parseFloat(data.todayEarned).toFixed(2)
    dailyTotal.value = parseFloat(data.todayTotal).toFixed(2)
    percentage.value = parseFloat(data.percentage)
    remainingSeconds.value = data.remainingSeconds
    isWorkTime.value = data.isWorkTime
    countdown.value = formatCountdown(data.remainingSeconds)
    const earnedNum = parseFloat(data.todayEarned)
    perSecond.value = earnedNum > 0
      ? (earnedNum / (3600 * 9)).toFixed(4)
      : '0.0000'
  } catch (e) { console.error(e) }
}

onMounted(() => {
  fetchData()
  timer = setInterval(fetchData, 3000)
})

onUnmounted(() => { if (timer) clearInterval(timer) })
</script>

<style scoped>
.container { padding: 24px; }
.header { margin-bottom: 24px; }
.greeting { font-size: 22px; font-weight: bold; margin-bottom: 4px; }
.date { font-size: 14px; color: #8888aa; }
.money-card {
  background: linear-gradient(135deg, #1a1a2e, #16213e);
  border-radius: 16px; padding: 32px; margin-bottom: 20px;
  text-align: center; border: 1px solid rgba(0,212,255,0.2);
}
.money-label { font-size: 14px; color: #8888aa; }
.money-amount {
  font-size: 56px; font-weight: bold; color: #00d4ff;
  margin: 16px 0; font-family: 'Courier New', monospace;
}
.progress-bar { height: 8px; background: #333; border-radius: 4px; overflow: hidden; margin-bottom: 10px; }
.progress-fill { height: 100%; background: linear-gradient(90deg, #00d4ff, #0077ff); border-radius: 4px; }
.progress-text { font-size: 13px; color: #8888aa; }
.info-row { display: flex; gap: 12px; margin-bottom: 20px; }
.info-item { flex: 1; background: #1a1a2e; border-radius: 12px; padding: 16px; text-align: center; }
.info-label { font-size: 13px; color: #8888aa; margin-bottom: 4px; }
.info-value { font-size: 24px; font-weight: bold; color: #ffd700; }
.countdown-card {
  background: #1a1a2e; border-radius: 16px; padding: 32px;
  text-align: center; margin-bottom: 20px;
  border: 1px solid rgba(0,212,255,0.15);
}
.countdown-card.is-off-duty { border-color: rgba(255,215,0,0.3); }
.countdown-label { font-size: 14px; color: #8888aa; margin-bottom: 12px; }
.countdown-time {
  font-size: 56px; font-weight: bold; font-family: 'Courier New', monospace;
  color: #fff; margin-bottom: 12px; letter-spacing: 4px;
}
.is-off-duty .countdown-time { color: #ffd700; }
.countdown-status { font-size: 15px; color: #00d4ff; }
.is-off-duty .countdown-status { color: #ffd700; }
.fish-tip { text-align: center; padding: 12px; font-size: 15px; color: #8888aa; cursor: pointer; }
</style>

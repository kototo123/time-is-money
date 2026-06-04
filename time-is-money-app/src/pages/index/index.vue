<template>
  <view class="container">
    <view class="header">
      <text class="greeting">{{ greeting }}</text>
      <text class="date">{{ today }}</text>
    </view>

    <view class="money-card">
      <text class="money-label">今日已赚</text>
      <text class="money-amount">¥{{ earned }}</text>
      <view class="progress-bar">
        <view class="progress-fill" :style="{ width: percentage + '%' }"></view>
      </view>
      <text class="progress-text">已完成 {{ percentage }}%</text>
    </view>

    <view class="info-row">
      <view class="info-item">
        <text class="info-label">今日目标</text>
        <text class="info-value">¥{{ dailyTotal }}</text>
      </view>
      <view class="info-item">
        <text class="info-label">每秒入账</text>
        <text class="info-value">¥{{ perSecond }}</text>
      </view>
    </view>

    <view class="countdown-card" :class="{ 'is-off-duty': !isWorkTime }">
      <text class="countdown-label">{{ countdownLabel }}</text>
      <text class="countdown-time">{{ countdown }}</text>
      <text class="countdown-status">{{ statusText }}</text>
    </view>

    <view class="fish-tip" @tap="toggleFish">
      <text>{{ fishText }}</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { api } from '@/utils/api'

const user = uni.getStorageSync('user')
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

function formatCountdown(secs) {
  if (secs <= 0) return '00:00:00'
  const h = Math.floor(secs / 3600)
  const m = Math.floor((secs % 3600) / 60)
  const s = secs % 60
  return `${pad(h)}:${pad(m)}:${pad(s)}`
}

function pad(n) {
  return n < 10 ? '0' + n : '' + n
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

    const totalSecs = isWorkTime.value
      ? remainingSeconds.value
      : 1
    const earnedNum = parseFloat(data.todayEarned)
    perSecond.value = totalSecs > 0 && earnedNum > 0
      ? (earnedNum / (86400 - remainingSeconds.value) || 0).toFixed(4)
      : '0.0000'
  } catch (e) {
    console.error('获取数据失败', e)
  }
}

onMounted(() => {
  if (!user) {
    uni.reLaunch({ url: '/pages/login/login' })
    return
  }
  fetchData()
  timer = setInterval(fetchData, 3000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<style scoped>
.container {
  padding: 30rpx;
  min-height: 100vh;
}
.header {
  margin-bottom: 40rpx;
}
.greeting {
  font-size: 36rpx;
  font-weight: bold;
  display: block;
  margin-bottom: 8rpx;
}
.date {
  font-size: 26rpx;
  color: #8888aa;
}
.money-card {
  background: linear-gradient(135deg, #1a1a2e, #16213e);
  border-radius: 20rpx;
  padding: 40rpx;
  margin-bottom: 30rpx;
  text-align: center;
  border: 1px solid rgba(0, 212, 255, 0.2);
}
.money-label {
  font-size: 28rpx;
  color: #8888aa;
}
.money-amount {
  font-size: 80rpx;
  font-weight: bold;
  color: #00d4ff;
  display: block;
  margin: 20rpx 0;
  font-family: 'Courier New', monospace;
}
.progress-bar {
  height: 12rpx;
  background: #333;
  border-radius: 6rpx;
  overflow: hidden;
  margin-bottom: 16rpx;
}
.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #00d4ff, #0077ff);
  border-radius: 6rpx;
  transition: width 0.5s;
}
.progress-text {
  font-size: 24rpx;
  color: #8888aa;
}
.info-row {
  display: flex;
  gap: 20rpx;
  margin-bottom: 30rpx;
}
.info-item {
  flex: 1;
  background: #1a1a2e;
  border-radius: 16rpx;
  padding: 24rpx;
  text-align: center;
}
.info-label {
  font-size: 24rpx;
  color: #8888aa;
  display: block;
  margin-bottom: 8rpx;
}
.info-value {
  font-size: 36rpx;
  font-weight: bold;
  color: #ffd700;
}
.countdown-card {
  background: #1a1a2e;
  border-radius: 20rpx;
  padding: 40rpx;
  text-align: center;
  margin-bottom: 30rpx;
  border: 1px solid rgba(0, 212, 255, 0.15);
}
.countdown-card.is-off-duty {
  border-color: rgba(255, 215, 0, 0.3);
}
.countdown-label {
  font-size: 28rpx;
  color: #8888aa;
  display: block;
  margin-bottom: 16rpx;
}
.countdown-time {
  font-size: 72rpx;
  font-weight: bold;
  font-family: 'Courier New', monospace;
  color: #fff;
  display: block;
  margin-bottom: 16rpx;
  letter-spacing: 8rpx;
}
.is-off-duty .countdown-time {
  color: #ffd700;
}
.countdown-status {
  font-size: 28rpx;
  color: #00d4ff;
}
.is-off-duty .countdown-status {
  color: #ffd700;
}
.fish-tip {
  text-align: center;
  padding: 20rpx;
  font-size: 28rpx;
  color: #8888aa;
}
</style>

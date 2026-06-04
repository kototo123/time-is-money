<template>
  <view class="container">
    <text class="page-title">每日收入记录</text>

    <view class="summary-card">
      <text class="summary-label">本月累计</text>
      <text class="summary-amount">¥{{ monthlyTotal }}</text>
    </view>

    <view class="record-list">
      <view class="record-item" v-for="(r, i) in records" :key="i">
        <text class="record-date">{{ r.date }}</text>
        <text class="record-amount">¥{{ r.amount }}</text>
      </view>
      <view class="empty" v-if="records.length === 0">
        <text>暂无记录，快去摸鱼吧 🐟</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'

const monthlyTotal = ref('0.00')
const records = ref([])

const user = uni.getStorageSync('user')

if (!user) {
  uni.reLaunch({ url: '/pages/login/login' })
}
</script>

<style scoped>
.container {
  padding: 30rpx;
}
.page-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #00d4ff;
  display: block;
  margin-bottom: 30rpx;
}
.summary-card {
  background: linear-gradient(135deg, #1a1a2e, #16213e);
  border-radius: 20rpx;
  padding: 40rpx;
  text-align: center;
  margin-bottom: 30rpx;
  border: 1px solid rgba(255, 215, 0, 0.2);
}
.summary-label {
  font-size: 28rpx;
  color: #8888aa;
  display: block;
  margin-bottom: 12rpx;
}
.summary-amount {
  font-size: 64rpx;
  font-weight: bold;
  color: #ffd700;
  font-family: 'Courier New', monospace;
}
.record-list {
  background: #1a1a2e;
  border-radius: 20rpx;
  padding: 20rpx;
}
.record-item {
  display: flex;
  justify-content: space-between;
  padding: 24rpx 16rpx;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}
.record-date {
  font-size: 28rpx;
  color: #ccc;
}
.record-amount {
  font-size: 28rpx;
  color: #00d4ff;
  font-weight: bold;
}
.empty {
  text-align: center;
  padding: 60rpx;
  color: #8888aa;
  font-size: 28rpx;
}
</style>

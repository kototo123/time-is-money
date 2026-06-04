<template>
  <view class="login-page">
    <view class="logo-area">
      <text class="logo-icon">🐟</text>
      <text class="logo-title">摸鱼倒计时</text>
      <text class="logo-desc">实时计算你的每一分钱</text>
    </view>
    <button class="login-btn" type="primary" @click="handleLogin">
      微信一键登录
    </button>
    <text class="login-hint">登录即表示同意《用户协议》</text>
  </view>
</template>

<script setup>
import { api } from '@/utils/api'

function handleLogin() {
  uni.login({
    provider: 'weixin',
    success: async (res) => {
      const userInfo = await uni.getUserProfile({ desc: '用于完善用户资料' })
      try {
        const user = await api.login(
          res.code,
          userInfo.userInfo.nickName,
          userInfo.userInfo.avatarUrl
        )
        uni.setStorageSync('user', user)
        uni.reLaunch({ url: '/pages/index/index' })
      } catch (e) {
        uni.showToast({ title: '登录失败', icon: 'none' })
      }
    },
    fail: () => {
      uni.showToast({ title: '登录失败', icon: 'none' })
    }
  })
}
</script>

<style scoped>
.login-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 60rpx;
}
.logo-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 100rpx;
}
.logo-icon {
  font-size: 120rpx;
  margin-bottom: 20rpx;
}
.logo-title {
  font-size: 48rpx;
  font-weight: bold;
  color: #00d4ff;
  margin-bottom: 16rpx;
}
.logo-desc {
  font-size: 28rpx;
  color: #8888aa;
}
.login-btn {
  width: 100%;
  height: 88rpx;
  line-height: 88rpx;
  background: linear-gradient(135deg, #00d4ff, #0077ff);
  border-radius: 44rpx;
  font-size: 32rpx;
  border: none;
  margin-bottom: 30rpx;
}
.login-hint {
  font-size: 24rpx;
  color: #555;
}
</style>

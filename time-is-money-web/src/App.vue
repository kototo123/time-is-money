<template>
  <div class="app">
    <nav class="tab-bar">
      <router-link to="/" class="tab-item" :class="{ active: $route.path === '/' }">倒计时</router-link>
      <router-link to="/config" class="tab-item" :class="{ active: $route.path === '/config' }">设置</router-link>
      <router-link to="/record" class="tab-item" :class="{ active: $route.path === '/record' }">记录</router-link>
    </nav>
    <router-view />
  </div>
</template>

<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  background: #0f0f23;
  color: #fff;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  min-height: 100vh;
}
.app { max-width: 480px; margin: 0 auto; padding-bottom: 100px; }
.tab-bar {
  position: fixed; bottom: 0; left: 50%; transform: translateX(-50%);
  width: 100%; max-width: 480px;
  display: flex; background: #1a1a2e;
  border-top: 1px solid #222;
  z-index: 100;
}
.tab-item {
  flex: 1; text-align: center; padding: 14px 0;
  color: #666; text-decoration: none; font-size: 14px;
  transition: color 0.2s;
}
.tab-item.active { color: #00d4ff; }
</style>

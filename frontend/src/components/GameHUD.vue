<template>
  <div class="hud-bar">
    <div class="hud-left">
      <div class="hud-item nickname">
        <span class="hud-icon">👨‍🍳</span>
        <span>{{ nickname }}</span>
      </div>
      <div class="hud-item level">
        <span class="hud-icon">⭐</span>
        <span>Lv.{{ level }}</span>
      </div>
    </div>

    <div class="hud-center">
      <div class="hud-item coins">
        <span class="coin-icon">🪙</span>
        <span class="coin-value">{{ coins }}</span>
      </div>
      <div class="hud-item served">
        <span class="hud-icon">👥</span>
        <span>已服务: {{ customersServed }}</span>
      </div>
    </div>

    <div class="hud-right">
      <el-button type="success" round size="small" @click="$emit('save')">
        💾 存档
      </el-button>
      <el-button type="danger" round size="small" @click="$emit('logout')">
        🚪 退出
      </el-button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  coins: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  customersServed: { type: Number, default: 0 },
  nickname: { type: String, default: '' }
})

defineEmits(['save', 'logout'])
</script>

<style scoped>
.hud-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 20px;
  background: linear-gradient(135deg, #2d2d44 0%, #1a1a2e 100%);
  border-bottom: 2px solid #f39c12;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
}

.hud-left, .hud-center, .hud-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.hud-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #ecf0f1;
  font-size: 14px;
  font-weight: 600;
  padding: 6px 12px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.08);
}

.hud-icon {
  font-size: 18px;
}

.coins {
  background: linear-gradient(135deg, rgba(241, 196, 15, 0.2) 0%, rgba(243, 156, 18, 0.2) 100%);
  border: 1px solid rgba(241, 196, 15, 0.4);
}

.coin-icon {
  font-size: 20px;
  animation: spin 3s linear infinite;
}

.coin-value {
  font-size: 18px;
  color: #f1c40f;
  font-weight: bold;
}

@keyframes spin {
  0% { transform: rotateY(0deg); }
  100% { transform: rotateY(360deg); }
}
</style>

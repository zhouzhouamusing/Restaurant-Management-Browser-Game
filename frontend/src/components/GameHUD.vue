<template>
  <div class="hud-bar">
    <div class="hud-section hud-left">
      <div class="hud-badge nickname-badge">
        <span class="badge-icon">👨‍🍳</span>
        <span class="badge-text">{{ nickname || '厨师' }}</span>
      </div>
      <div class="hud-badge level-badge">
        <span class="badge-icon">⭐</span>
        <span class="badge-text">Lv.{{ level }}</span>
      </div>
    </div>

    <div class="hud-section hud-center">
      <div class="coin-display">
        <span class="coin-icon-wrapper">
          <span class="coin-emoji">🪙</span>
        </span>
        <span class="coin-amount">{{ animatedCoins }}</span>
      </div>
      <div class="hud-badge served-badge">
        <span class="badge-icon">👥</span>
        <span class="badge-text">已服务 {{ customersServed }} 人</span>
      </div>
    </div>

    <div class="hud-section hud-right">
      <button class="hud-btn save-btn" @click="$emit('save')">
        <span>💾</span> 存档
      </button>
      <button class="hud-btn exit-btn" @click="$emit('logout')">
        <span>🚪</span> 退出
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  coins: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  customersServed: { type: Number, default: 0 },
  nickname: { type: String, default: '' }
})

defineEmits(['save', 'logout'])

const animatedCoins = ref(props.coins)
let coinAnimFrame = null

watch(() => props.coins, (newVal) => {
  const start = animatedCoins.value
  const diff = newVal - start
  const duration = 300
  const startTime = Date.now()

  const animate = () => {
    const elapsed = Date.now() - startTime
    const progress = Math.min(elapsed / duration, 1)
    animatedCoins.value = Math.floor(start + diff * easeOut(progress))
    if (progress < 1) {
      coinAnimFrame = requestAnimationFrame(animate)
    }
  }

  if (coinAnimFrame) cancelAnimationFrame(coinAnimFrame)
  animate()
})

function easeOut(t) {
  return 1 - Math.pow(1 - t, 3)
}
</script>

<style scoped>
.hud-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  background: linear-gradient(135deg, #2c2c44 0%, #1e1e36 100%);
  border-bottom: 3px solid #f39c12;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
}

.hud-section {
  display: flex;
  align-items: center;
  gap: 10px;
}

.hud-badge {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 12px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.badge-icon {
  font-size: 16px;
}

.badge-text {
  font-size: 13px;
  color: #ecf0f1;
  font-weight: 600;
  font-family: 'Comic Sans MS', cursive;
}

.level-badge {
  background: linear-gradient(135deg, rgba(155, 89, 182, 0.2) 0%, rgba(142, 68, 173, 0.15) 100%);
  border-color: rgba(155, 89, 182, 0.35);
}

.level-badge .badge-text {
  color: #d5a6f0;
}

/* 金币显示 */
.coin-display {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 16px;
  border-radius: 24px;
  background: linear-gradient(135deg, rgba(241, 196, 15, 0.18) 0%, rgba(243, 156, 18, 0.12) 100%);
  border: 1.5px solid rgba(241, 196, 15, 0.4);
  box-shadow: 0 0 12px rgba(241, 196, 15, 0.1);
}

.coin-icon-wrapper {
  display: flex;
  align-items: center;
}

.coin-emoji {
  font-size: 20px;
  animation: coinSpin 4s linear infinite;
  display: inline-block;
}

@keyframes coinSpin {
  0%, 100% { transform: rotateY(0deg); }
  50% { transform: rotateY(180deg); }
}

.coin-amount {
  font-size: 18px;
  font-weight: 800;
  color: #f1c40f;
  font-family: 'Comic Sans MS', cursive;
  min-width: 40px;
}

.served-badge {
  background: rgba(46, 204, 113, 0.1);
  border-color: rgba(46, 204, 113, 0.25);
}

.served-badge .badge-text {
  color: #7dcea0;
}

/* 按钮 */
.hud-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 14px;
  border-radius: 10px;
  border: none;
  font-size: 12px;
  font-weight: 600;
  font-family: 'Comic Sans MS', cursive;
  cursor: pointer;
  transition: all 0.2s;
}

.save-btn {
  background: linear-gradient(135deg, #27ae60, #2ecc71);
  color: white;
  box-shadow: 0 2px 8px rgba(46, 204, 113, 0.3);
}

.save-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(46, 204, 113, 0.4);
}

.exit-btn {
  background: linear-gradient(135deg, #636e72, #95a5a6);
  color: white;
}

.exit-btn:hover {
  transform: translateY(-1px);
  background: linear-gradient(135deg, #e74c3c, #c0392b);
}
</style>

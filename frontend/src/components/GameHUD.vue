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
        <div class="level-glow"></div>
      </div>
    </div>

    <div class="hud-section hud-center">
      <div class="coin-display">
        <span class="coin-icon-wrapper">
          <svg class="coin-svg" viewBox="0 0 24 24" width="22" height="22">
            <circle cx="12" cy="12" r="10" fill="#f1c40f" stroke="#b8860b" stroke-width="2"/>
            <circle cx="12" cy="12" r="6.5" fill="none" stroke="#d4a017" stroke-width="1" opacity="0.5"/>
            <text x="12" y="16" text-anchor="middle" font-size="10" font-weight="bold" fill="#8B6914">¥</text>
          </svg>
        </span>
        <span class="coin-amount" :class="{ bump: coinBump }">{{ animatedCoins }}</span>
      </div>
      <div class="hud-badge served-badge">
        <span class="badge-icon">👥</span>
        <span class="badge-text">已服务 {{ customersServed }} 人</span>
      </div>
    </div>

    <div class="hud-section hud-right">
      <div class="bonus-display" v-if="bonuses && (bonuses.tipBonus > 0 || bonuses.patienceBonus > 0)">
        <span class="bonus-tag" v-if="bonuses.tipBonus > 0">💰+{{ Math.round(bonuses.tipBonus * 100) }}%</span>
        <span class="bonus-tag patience" v-if="bonuses.patienceBonus > 0">⏳+{{ Math.round(bonuses.patienceBonus * 100) }}%</span>
      </div>
      <button class="hud-btn save-btn" @click="$emit('save')">
        <span class="btn-icon">💾</span>
        <span class="btn-text">存档</span>
      </button>
      <button class="hud-btn exit-btn" @click="$emit('logout')">
        <span class="btn-icon">🚪</span>
        <span class="btn-text">退出</span>
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
  nickname: { type: String, default: '' },
  bonuses: { type: Object, default: () => ({ tipBonus: 0, patienceBonus: 0 }) },
  editMode: { type: Boolean, default: false }
})

defineEmits(['save', 'logout', 'toggle-edit'])

const animatedCoins = ref(props.coins)
const coinBump = ref(false)
let coinAnimFrame = null

watch(() => props.coins, (newVal) => {
  const start = animatedCoins.value
  const diff = newVal - start
  const duration = 400
  const startTime = Date.now()

  if (diff > 0) {
    coinBump.value = true
    setTimeout(() => { coinBump.value = false }, 300)
  }

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
  padding: 8px 18px;
  background: linear-gradient(135deg, #2c2c44 0%, #1e1e36 100%);
  border-bottom: 3px solid #f39c12;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.5);
  position: relative;
  z-index: 10;
}

.hud-section {
  display: flex;
  align-items: center;
  gap: 10px;
}

.hud-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  position: relative;
  transition: all 0.3s;
}

.hud-badge:hover {
  background: rgba(255, 255, 255, 0.08);
}

.badge-icon {
  font-size: 16px;
}

.badge-text {
  font-size: 13px;
  color: #ecf0f1;
  font-weight: 600;
  font-family: 'ZCOOL KuaiLe', 'Nunito', cursive;
}

.level-badge {
  background: linear-gradient(135deg, rgba(155, 89, 182, 0.18) 0%, rgba(142, 68, 173, 0.12) 100%);
  border-color: rgba(155, 89, 182, 0.3);
  overflow: hidden;
}

.level-badge .badge-text {
  color: #d5a6f0;
}

.level-glow {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent, rgba(155, 89, 182, 0.15), transparent);
  animation: glowSlide 3s ease infinite;
}

@keyframes glowSlide {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

/* Gold display */
.coin-display {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 18px;
  border-radius: 26px;
  background: linear-gradient(135deg, rgba(241, 196, 15, 0.15) 0%, rgba(243, 156, 18, 0.1) 100%);
  border: 1.5px solid rgba(241, 196, 15, 0.35);
  box-shadow: 0 0 16px rgba(241, 196, 15, 0.08);
  transition: all 0.3s;
}

.coin-icon-wrapper {
  display: flex;
  align-items: center;
}

.coin-svg {
  animation: coinSpin 4s linear infinite;
  display: inline-block;
}

@keyframes coinSpin {
  0%, 100% { transform: rotateY(0deg); }
  50% { transform: rotateY(180deg); }
}

.coin-amount {
  font-size: 20px;
  font-weight: 800;
  color: #f1c40f;
  font-family: 'ZCOOL KuaiLe', 'Nunito', cursive;
  min-width: 44px;
  transition: transform 0.3s;
}

.coin-amount.bump {
  animation: coinBump 0.3s ease;
}

@keyframes coinBump {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); color: #fff; }
}

.served-badge {
  background: rgba(46, 204, 113, 0.08);
  border-color: rgba(46, 204, 113, 0.2);
}

.served-badge .badge-text {
  color: #7dcea0;
}

/* Buttons */
.hud-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 7px 16px;
  border-radius: 12px;
  border: none;
  font-size: 12px;
  font-weight: 600;
  font-family: 'ZCOOL KuaiLe', 'Nunito', cursive;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-icon {
  font-size: 14px;
}

.btn-text {
  color: inherit;
}

.save-btn {
  background: linear-gradient(135deg, #27ae60, #2ecc71);
  color: white;
  box-shadow: 0 3px 10px rgba(46, 204, 113, 0.25);
}

.save-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(46, 204, 113, 0.35);
}

.save-btn:active {
  transform: translateY(0);
}

.exit-btn {
  background: linear-gradient(135deg, #636e72, #95a5a6);
  color: white;
}

.exit-btn:hover {
  transform: translateY(-2px);
  background: linear-gradient(135deg, #e74c3c, #c0392b);
  box-shadow: 0 4px 12px rgba(231, 76, 60, 0.3);
}

.bonus-display {
  display: flex;
  gap: 4px;
  align-items: center;
}

.bonus-tag {
  padding: 4px 10px;
  border-radius: 14px;
  font-size: 11px;
  font-weight: 600;
  font-family: 'ZCOOL KuaiLe', 'Nunito', cursive;
  background: rgba(241, 196, 15, 0.12);
  color: #f1c40f;
  border: 1px solid rgba(241, 196, 15, 0.25);
}

.bonus-tag.patience {
  background: rgba(46, 204, 113, 0.12);
  color: #2ecc71;
  border-color: rgba(46, 204, 113, 0.25);
}
</style>

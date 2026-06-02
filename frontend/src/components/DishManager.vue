<template>
  <div class="dish-manager">
    <h3 class="panel-title">🍽️ 菜品管理</h3>

    <!-- Unlocked dishes -->
    <div class="section-label">✅ 已上架</div>
    <div class="dish-list">
      <TransitionGroup name="dish">
        <div
          v-for="dish in dishes"
          :key="dish.id"
          class="dish-card active"
        >
          <span class="dish-emoji">{{ dish.emoji || '🍲' }}</span>
          <div class="dish-detail">
            <span class="dish-name">{{ dish.name }}</span>
            <div class="dish-stats">
              <span class="stat price">💰{{ dish.price }}</span>
              <span class="stat time">⏱️{{ dish.cookTime }}s</span>
            </div>
          </div>
          <div class="active-indicator"></div>
        </div>
      </TransitionGroup>
    </div>

    <!-- Locked dishes -->
    <div class="section-label" v-if="lockedDishes.length > 0">🔒 待解锁</div>
    <div class="dish-list">
      <div
        v-for="dish in lockedDishes"
        :key="dish.id"
        class="dish-card locked"
        :class="{ affordable: coins >= dish.unlockCost }"
        @click="$emit('unlock-dish', dish)"
      >
        <span class="dish-emoji locked-emoji">{{ dish.emoji }}</span>
        <div class="dish-detail">
          <span class="dish-name">{{ dish.name }}</span>
          <div class="dish-stats">
            <span class="stat unlock-cost">🪙{{ dish.unlockCost }}</span>
            <span class="stat price">售💰{{ dish.price }}</span>
          </div>
        </div>
        <div class="unlock-badge" v-if="coins >= dish.unlockCost">
          <span class="unlock-icon">🔓</span>
          <span>解锁</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  dishes: { type: Array, default: () => [] },
  coins: { type: Number, default: 0 }
})

defineEmits(['unlock-dish'])

const allDishes = [
  { id: 4, name: '宫保鸡丁', price: 18, cookTime: 4, emoji: '🍜', unlockCost: 50 },
  { id: 5, name: '鱼香肉丝', price: 16, cookTime: 4, emoji: '🥡', unlockCost: 60 },
  { id: 6, name: '麻婆豆腐', price: 12, cookTime: 3, emoji: '🥘', unlockCost: 40 },
  { id: 7, name: '北京烤鸭', price: 38, cookTime: 7, emoji: '🍗', unlockCost: 120 },
  { id: 8, name: '珍珠奶茶', price: 15, cookTime: 2, emoji: '🧋', unlockCost: 80 },
]

const lockedDishes = computed(() => {
  const ids = props.dishes.map(d => d.id)
  return allDishes.filter(d => !ids.includes(d.id))
})
</script>

<style scoped>
.dish-manager {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 16px;
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.panel-title {
  color: #f1c40f;
  font-size: 15px;
  margin-bottom: 12px;
  text-align: center;
  font-family: 'ZCOOL KuaiLe', 'Nunito', cursive;
}

.section-label {
  color: #bdc3c7;
  font-size: 11px;
  margin: 12px 0 8px 4px;
  font-weight: 600;
}

.dish-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.dish-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 14px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.dish-card.active {
  background: linear-gradient(135deg, rgba(46, 204, 113, 0.08) 0%, rgba(39, 174, 96, 0.04) 100%);
  border: 1px solid rgba(46, 204, 113, 0.18);
}

.dish-card.active:hover {
  background: linear-gradient(135deg, rgba(46, 204, 113, 0.12) 0%, rgba(39, 174, 96, 0.08) 100%);
}

.active-indicator {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #2ecc71;
  box-shadow: 0 0 6px rgba(46, 204, 113, 0.6);
  animation: pulse 2s ease infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(0.8); }
}

.dish-card.locked {
  background: rgba(255, 255, 255, 0.02);
  border: 1.5px dashed rgba(255, 255, 255, 0.1);
  cursor: pointer;
}

.dish-card.locked:hover {
  background: rgba(241, 196, 15, 0.06);
  border-color: rgba(241, 196, 15, 0.3);
  transform: translateX(3px);
}

.dish-card.locked.affordable {
  border-color: rgba(46, 204, 113, 0.35);
  background: rgba(46, 204, 113, 0.05);
}

.dish-card.locked.affordable:hover {
  transform: translateX(4px) scale(1.01);
  background: rgba(46, 204, 113, 0.1);
  box-shadow: 0 2px 10px rgba(46, 204, 113, 0.15);
}

.dish-emoji {
  font-size: 26px;
  min-width: 32px;
  text-align: center;
  transition: transform 0.3s;
}

.dish-card:hover .dish-emoji {
  transform: scale(1.15) rotate(-5deg);
}

.locked-emoji {
  opacity: 0.6;
  filter: grayscale(30%);
}

.dish-detail {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.dish-name {
  color: #ecf0f1;
  font-size: 12px;
  font-weight: 600;
  font-family: 'ZCOOL KuaiLe', 'Nunito', cursive;
}

.dish-stats {
  display: flex;
  gap: 8px;
}

.stat {
  font-size: 10px;
  color: #95a5a6;
}

.stat.price {
  color: #2ecc71;
}

.stat.unlock-cost {
  color: #f39c12;
  font-weight: 600;
}

.unlock-badge {
  display: flex;
  align-items: center;
  gap: 3px;
  background: linear-gradient(135deg, #27ae60, #2ecc71);
  color: white;
  font-size: 10px;
  padding: 4px 10px;
  border-radius: 10px;
  font-weight: 600;
  box-shadow: 0 2px 6px rgba(39, 174, 96, 0.3);
  animation: badgePulse 2s ease infinite;
}

@keyframes badgePulse {
  0%, 100% { box-shadow: 0 2px 6px rgba(39, 174, 96, 0.3); }
  50% { box-shadow: 0 2px 12px rgba(39, 174, 96, 0.5); }
}

.unlock-icon {
  font-size: 11px;
}

/* Transition */
.dish-enter-active {
  animation: dishIn 0.4s ease;
}

@keyframes dishIn {
  from { opacity: 0; transform: translateX(-10px); }
  to { opacity: 1; transform: translateX(0); }
}
</style>

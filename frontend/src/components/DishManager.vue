<template>
  <div class="dish-manager">
    <h3 class="panel-title">🍽️ 菜品管理</h3>

    <!-- 已解锁菜品 -->
    <div class="section-label">✅ 已上架</div>
    <div class="dish-list">
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
      </div>
    </div>

    <!-- 可解锁菜品 -->
    <div class="section-label" v-if="lockedDishes.length > 0">🔒 待解锁</div>
    <div class="dish-list">
      <div
        v-for="dish in lockedDishes"
        :key="dish.id"
        class="dish-card locked"
        :class="{ affordable: coins >= dish.unlockCost }"
        @click="$emit('unlock-dish', dish)"
      >
        <span class="dish-emoji">{{ dish.emoji }}</span>
        <div class="dish-detail">
          <span class="dish-name">{{ dish.name }}</span>
          <div class="dish-stats">
            <span class="stat unlock-cost">🪙{{ dish.unlockCost }}</span>
            <span class="stat price">售💰{{ dish.price }}</span>
          </div>
        </div>
        <div class="unlock-badge" v-if="coins >= dish.unlockCost">
          解锁
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
  { id: 4, name: '宫保鸡丁', price: 18, cookTime: 4, emoji: '🍗', unlockCost: 50 },
  { id: 5, name: '鱼香肉丝', price: 16, cookTime: 4, emoji: '🥘', unlockCost: 60 },
  { id: 6, name: '麻婆豆腐', price: 12, cookTime: 3, emoji: '🫕', unlockCost: 40 },
  { id: 7, name: '北京烤鸭', price: 38, cookTime: 7, emoji: '🦆', unlockCost: 120 },
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
  padding: 14px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}

.dish-manager::-webkit-scrollbar {
  width: 3px;
}
.dish-manager::-webkit-scrollbar-thumb {
  background: rgba(255,255,255,0.12);
  border-radius: 2px;
}

.panel-title {
  color: #f1c40f;
  font-size: 15px;
  margin-bottom: 10px;
  text-align: center;
  font-family: 'Comic Sans MS', cursive;
}

.section-label {
  color: #bdc3c7;
  font-size: 11px;
  margin: 10px 0 6px 4px;
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
  border-radius: 12px;
  transition: all 0.2s;
  position: relative;
}

.dish-card.active {
  background: linear-gradient(135deg, rgba(46, 204, 113, 0.1) 0%, rgba(39, 174, 96, 0.06) 100%);
  border: 1px solid rgba(46, 204, 113, 0.2);
}

.dish-card.locked {
  background: rgba(255, 255, 255, 0.02);
  border: 1px dashed rgba(255, 255, 255, 0.12);
  cursor: pointer;
}

.dish-card.locked:hover {
  background: rgba(241, 196, 15, 0.08);
  border-color: rgba(241, 196, 15, 0.3);
}

.dish-card.locked.affordable {
  border-color: rgba(46, 204, 113, 0.4);
  background: rgba(46, 204, 113, 0.06);
}

.dish-card.locked.affordable:hover {
  transform: scale(1.02);
  background: rgba(46, 204, 113, 0.12);
}

.dish-emoji {
  font-size: 24px;
  min-width: 30px;
  text-align: center;
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
  font-family: 'Comic Sans MS', cursive;
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
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background: linear-gradient(135deg, #27ae60, #2ecc71);
  color: white;
  font-size: 10px;
  padding: 3px 8px;
  border-radius: 8px;
  font-weight: 600;
}
</style>

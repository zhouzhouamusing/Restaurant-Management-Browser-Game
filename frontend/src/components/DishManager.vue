<template>
  <div class="dish-manager">
    <h3 class="panel-title">🍽️ 菜品管理</h3>

    <!-- 已解锁菜品列表 -->
    <div class="dish-list">
      <div
        v-for="dish in dishes"
        :key="dish.id"
        class="dish-card unlocked"
      >
        <span class="dish-emoji">{{ dish.emoji || '🍲' }}</span>
        <div class="dish-info">
          <span class="dish-name">{{ dish.name }}</span>
          <span class="dish-price">💰 {{ dish.price }}币</span>
        </div>
        <span class="dish-time">⏱️ {{ dish.cookTime }}s</span>
      </div>
    </div>

    <!-- 可解锁菜品 -->
    <h4 class="section-title">🔒 待解锁</h4>
    <div class="dish-list">
      <div
        v-for="dish in lockedDishes"
        :key="dish.id"
        class="dish-card locked"
        @click="$emit('unlock-dish', dish)"
      >
        <span class="dish-emoji">{{ dish.emoji }}</span>
        <div class="dish-info">
          <span class="dish-name">{{ dish.name }}</span>
          <span class="dish-cost">🪙 {{ dish.unlockCost }}币解锁</span>
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
  { id: 5, name: '鱼香肉丝', price: 16, cookTime: 4, emoji: '🥩', unlockCost: 60 },
  { id: 6, name: '麻婆豆腐', price: 12, cookTime: 3, emoji: '🫕', unlockCost: 40 },
  { id: 7, name: '北京烤鸭', price: 38, cookTime: 7, emoji: '🦆', unlockCost: 120 },
  { id: 8, name: '珍珠奶茶', price: 15, cookTime: 2, emoji: '🧋', unlockCost: 80 },
]

const lockedDishes = computed(() => {
  const unlockedIds = props.dishes.map(d => d.id)
  return allDishes.filter(d => !unlockedIds.includes(d.id))
})
</script>

<style scoped>
.dish-manager {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  overflow-y: auto;
  max-height: 100%;
}

.panel-title {
  color: #f1c40f;
  font-size: 16px;
  margin-bottom: 12px;
  text-align: center;
}

.section-title {
  color: #95a5a6;
  font-size: 13px;
  margin: 12px 0 8px;
  padding-left: 4px;
}

.dish-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.dish-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 12px;
  transition: all 0.2s;
}

.dish-card.unlocked {
  background: linear-gradient(135deg, rgba(46, 204, 113, 0.15) 0%, rgba(39, 174, 96, 0.1) 100%);
  border: 1px solid rgba(46, 204, 113, 0.3);
}

.dish-card.locked {
  background: rgba(255, 255, 255, 0.03);
  border: 1px dashed rgba(255, 255, 255, 0.15);
  cursor: pointer;
}

.dish-card.locked:hover {
  background: rgba(241, 196, 15, 0.1);
  border-color: rgba(241, 196, 15, 0.4);
  transform: scale(1.02);
}

.dish-emoji {
  font-size: 24px;
}

.dish-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.dish-name {
  color: #ecf0f1;
  font-size: 13px;
  font-weight: 600;
}

.dish-price {
  color: #2ecc71;
  font-size: 11px;
}

.dish-cost {
  color: #f39c12;
  font-size: 11px;
}

.dish-time {
  color: #95a5a6;
  font-size: 11px;
}
</style>

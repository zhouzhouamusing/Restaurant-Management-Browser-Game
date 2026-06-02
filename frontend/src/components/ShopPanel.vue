<template>
  <div class="shop-panel">
    <h3 class="panel-title">🛒 商店</h3>

    <div class="shop-item" @click="handleBuySeat">
      <div class="item-icon">🪑</div>
      <div class="item-info">
        <span class="item-name">新增座位</span>
        <span class="item-desc">当前 {{ seatCount }}/8 个座位</span>
      </div>
      <div class="item-cost" :class="{ affordable: coins >= seatCost }">
        🪙 {{ seatCost }}
      </div>
    </div>

    <div class="shop-note" v-if="seatCount >= 8">
      ✨ 座位已满！
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  coins: { type: Number, default: 0 },
  seatCount: { type: Number, default: 4 }
})

const emit = defineEmits(['buy-seat'])

const seatCost = computed(() => {
  return 50 + (props.seatCount - 4) * 30
})

function handleBuySeat() {
  if (props.seatCount >= 8) return
  emit('buy-seat', seatCost.value)
}
</script>

<style scoped>
.shop-panel {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.panel-title {
  color: #e67e22;
  font-size: 15px;
  margin-bottom: 12px;
  text-align: center;
  font-family: 'Comic Sans MS', cursive;
}

.shop-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.1);
  cursor: pointer;
  transition: all 0.2s;
}

.shop-item:hover {
  background: rgba(230, 126, 34, 0.12);
  border-color: rgba(230, 126, 34, 0.4);
  transform: scale(1.02);
}

.item-icon {
  font-size: 28px;
}

.item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.item-name {
  color: #ecf0f1;
  font-size: 13px;
  font-weight: 600;
}

.item-desc {
  color: #95a5a6;
  font-size: 11px;
}

.item-cost {
  color: #e74c3c;
  font-size: 13px;
  font-weight: bold;
  padding: 4px 8px;
  border-radius: 8px;
  background: rgba(231, 76, 60, 0.1);
}

.item-cost.affordable {
  color: #2ecc71;
  background: rgba(46, 204, 113, 0.1);
}

.shop-note {
  text-align: center;
  color: #95a5a6;
  font-size: 12px;
  margin-top: 8px;
}
</style>

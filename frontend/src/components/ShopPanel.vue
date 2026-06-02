<template>
  <div class="shop-panel">
    <h3 class="panel-title">🛒 商店</h3>

    <div class="shop-item" :class="{ maxed: seatCount >= 8 }" @click="handleBuySeat">
      <div class="item-icon-wrapper">
        <span class="item-icon">🪑</span>
      </div>
      <div class="item-info">
        <span class="item-name">新增座位</span>
        <span class="item-desc">当前 {{ seatCount }}/8 个座位</span>
        <div class="seat-progress">
          <div class="seat-progress-fill" :style="{ width: (seatCount / 8 * 100) + '%' }"></div>
        </div>
      </div>
      <div class="item-cost" :class="{ affordable: coins >= seatCost }" v-if="seatCount < 8">
        🪙 {{ seatCost }}
      </div>
      <div class="maxed-badge" v-else>
        ✨ 已满
      </div>
    </div>

    <div class="shop-tips">
      <div class="tip-item">
        <span class="tip-icon">💡</span>
        <span class="tip-text">更多座位 = 更多顾客 = 更多收入</span>
      </div>
      <div class="tip-item">
        <span class="tip-icon">👥</span>
        <span class="tip-text">雇佣员工请查看"员工"面板</span>
      </div>
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
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.panel-title {
  color: #e67e22;
  font-size: 15px;
  margin-bottom: 14px;
  text-align: center;
  font-family: 'Comic Sans MS', cursive;
}

.shop-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.04);
  border: 1.5px solid rgba(255, 255, 255, 0.08);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.shop-item:hover:not(.maxed) {
  background: rgba(230, 126, 34, 0.1);
  border-color: rgba(230, 126, 34, 0.35);
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(230, 126, 34, 0.15);
}

.shop-item:active:not(.maxed) {
  transform: translateY(0);
}

.shop-item.maxed {
  cursor: default;
  opacity: 0.7;
}

.item-icon-wrapper {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: rgba(230, 126, 34, 0.1);
}

.item-icon {
  font-size: 26px;
}

.item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.item-name {
  color: #ecf0f1;
  font-size: 13px;
  font-weight: 600;
  font-family: 'Comic Sans MS', cursive;
}

.item-desc {
  color: #95a5a6;
  font-size: 11px;
}

.seat-progress {
  height: 4px;
  background: rgba(255,255,255,0.06);
  border-radius: 2px;
  margin-top: 4px;
  overflow: hidden;
}

.seat-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #e67e22, #f39c12);
  border-radius: 2px;
  transition: width 0.5s ease;
}

.item-cost {
  color: #e74c3c;
  font-size: 13px;
  font-weight: bold;
  padding: 5px 10px;
  border-radius: 10px;
  background: rgba(231, 76, 60, 0.08);
  transition: all 0.3s;
}

.item-cost.affordable {
  color: #2ecc71;
  background: rgba(46, 204, 113, 0.08);
}

.maxed-badge {
  font-size: 12px;
  color: #f39c12;
  font-weight: 600;
  padding: 5px 10px;
  border-radius: 10px;
  background: rgba(243, 156, 18, 0.1);
}

.shop-tips {
  margin-top: 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.tip-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.02);
}

.tip-icon {
  font-size: 12px;
}

.tip-text {
  font-size: 10px;
  color: #7f8c8d;
}
</style>

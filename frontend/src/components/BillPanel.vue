<template>
  <div class="bill-panel">
    <h3 class="panel-title">
      <span class="title-icon">🧾</span>
      <span>收银明细</span>
    </h3>

    <div class="bill-summary">
      <div class="summary-item">
        <span class="summary-label">今日收入</span>
        <span class="summary-value gold">🪙 {{ todayIncome }}</span>
      </div>
      <div class="summary-item">
        <span class="summary-label">订单数</span>
        <span class="summary-value">{{ bills.length }}</span>
      </div>
      <div class="summary-item">
        <span class="summary-label">总小费</span>
        <span class="summary-value tip">💰 {{ totalTips }}</span>
      </div>
    </div>

    <div class="bill-list" v-if="bills.length > 0">
      <TransitionGroup name="bill">
        <div
          v-for="bill in displayedBills"
          :key="bill.id"
          class="bill-card"
          :class="'mood-' + bill.satisfaction"
        >
          <div class="bill-left">
            <span class="bill-customer">{{ bill.customerEmoji }}</span>
            <div class="bill-info">
              <span class="bill-dish">{{ bill.dish?.emoji }} {{ bill.dish?.name || '未知' }}</span>
              <span class="bill-time">{{ bill.time }} · {{ bill.staffName }}</span>
            </div>
          </div>
          <div class="bill-right">
            <span class="bill-amount">+{{ bill.amount }}</span>
            <span class="bill-tip" v-if="bill.tip > 0">含小费 {{ bill.tip }}</span>
          </div>
          <div class="bill-mood-indicator" :class="bill.satisfaction">
            {{ bill.satisfaction === 'happy' ? '😊' : bill.satisfaction === 'neutral' ? '😐' : '😤' }}
          </div>
        </div>
      </TransitionGroup>
    </div>

    <div class="bill-empty" v-else>
      <span class="empty-icon">📝</span>
      <span class="empty-text">还没有账单记录</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  bills: { type: Array, default: () => [] }
})

const displayedBills = computed(() => props.bills.slice(0, 20))

const todayIncome = computed(() => {
  return props.bills.reduce((sum, b) => sum + b.amount, 0)
})

const totalTips = computed(() => {
  return props.bills.reduce((sum, b) => sum + (b.tip || 0), 0)
})
</script>

<style scoped>
.bill-panel {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 18px;
  padding: 16px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(8px);
  max-height: 280px;
  display: flex;
  flex-direction: column;
}

.panel-title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  color: #fdcb6e;
  font-size: 15px;
  margin-bottom: 12px;
  font-family: 'ZCOOL KuaiLe', 'Nunito', cursive;
}

.title-icon {
  font-size: 18px;
}

.bill-summary {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 1px dashed rgba(255,255,255,0.08);
}

.summary-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.summary-label {
  font-size: 10px;
  color: #95a5a6;
}

.summary-value {
  font-size: 13px;
  font-weight: 700;
  color: #ecf0f1;
  font-family: 'ZCOOL KuaiLe', 'Nunito', cursive;
}

.summary-value.gold {
  color: #f1c40f;
}

.summary-value.tip {
  color: #2ecc71;
}

.bill-list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-right: 4px;
}

.bill-list::-webkit-scrollbar {
  width: 3px;
}
.bill-list::-webkit-scrollbar-thumb {
  background: rgba(255,255,255,0.1);
  border-radius: 2px;
}

.bill-card {
  display: flex;
  align-items: center;
  padding: 8px 10px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  transition: all 0.3s;
  position: relative;
  overflow: hidden;
}

.bill-card.mood-happy {
  border-left: 3px solid rgba(46, 204, 113, 0.6);
}

.bill-card.mood-neutral {
  border-left: 3px solid rgba(241, 196, 15, 0.6);
}

.bill-card.mood-angry {
  border-left: 3px solid rgba(231, 76, 60, 0.6);
}

.bill-card:hover {
  background: rgba(255, 255, 255, 0.06);
}

.bill-left {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.bill-customer {
  font-size: 20px;
}

.bill-info {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.bill-dish {
  font-size: 11px;
  color: #ecf0f1;
  font-weight: 600;
}

.bill-time {
  font-size: 9px;
  color: #7f8c8d;
}

.bill-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 1px;
}

.bill-amount {
  font-size: 13px;
  font-weight: 700;
  color: #f1c40f;
  font-family: 'ZCOOL KuaiLe', 'Nunito', cursive;
}

.bill-tip {
  font-size: 9px;
  color: #2ecc71;
}

.bill-mood-indicator {
  position: absolute;
  top: 4px;
  right: 6px;
  font-size: 12px;
  opacity: 0.7;
}

.bill-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 24px;
  color: #7f8c8d;
}

.empty-icon {
  font-size: 32px;
  opacity: 0.5;
}

.empty-text {
  font-size: 12px;
}

/* Transition animations */
.bill-enter-active {
  animation: slideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.bill-leave-active {
  animation: slideOut 0.3s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
}

@keyframes slideOut {
  from {
    opacity: 1;
    transform: translateX(0);
  }
  to {
    opacity: 0;
    transform: translateX(20px);
  }
}
</style>

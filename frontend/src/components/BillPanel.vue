<template>
  <div class="bill-panel">
    <h3 class="panel-title">
      <span class="title-icon">🧾</span>
      <span>订单管理</span>
    </h3>

    <!-- Sub-tabs -->
    <div class="bill-sub-tabs">
      <button class="sub-tab" :class="{ active: subTab === 'active' }" @click="subTab = 'active'">
        <span class="sub-tab-dot active-dot" v-if="activeOrders.length > 0"></span>
        进行中 ({{ activeOrders.length }})
      </button>
      <button class="sub-tab" :class="{ active: subTab === 'history' }" @click="subTab = 'history'">
        历史订单
      </button>
    </div>

    <!-- Active Orders -->
    <div v-if="subTab === 'active'" class="tab-content">
      <div v-if="activeOrders.length > 0" class="order-list">
        <TransitionGroup name="order">
          <div v-for="order in activeOrders" :key="order.id" class="order-card" :class="'status-' + order.status">
            <div class="order-left">
              <span class="order-customer">{{ order.customerEmoji }}</span>
              <div class="order-info">
                <span class="order-dish">{{ order.dish?.emoji }} {{ order.isCombo ? order.comboName : order.dish?.name }}</span>
                <span class="order-customer-name">{{ order.customerName }}</span>
              </div>
            </div>
            <div class="order-right">
              <span class="status-badge" :class="order.status">
                <span class="status-dot"></span>
                {{ statusLabel(order.status) }}
              </span>
              <div class="patience-mini" v-if="order.patience !== undefined">
                <div class="patience-mini-fill" :style="{ width: order.patience + '%' }" :class="patienceClass(order.patience)"></div>
              </div>
            </div>
          </div>
        </TransitionGroup>
      </div>
      <div v-else class="empty-state">
        <span class="empty-icon">🍳</span>
        <span class="empty-text">当前没有进行中的订单</span>
      </div>
    </div>

    <!-- History -->
    <div v-if="subTab === 'history'" class="tab-content">
      <!-- Filters -->
      <div class="filter-bar">
        <button class="filter-chip" :class="{ active: moodFilter === 'all' }" @click="moodFilter = 'all'">全部</button>
        <button class="filter-chip happy" :class="{ active: moodFilter === 'happy' }" @click="moodFilter = 'happy'">😊</button>
        <button class="filter-chip neutral" :class="{ active: moodFilter === 'neutral' }" @click="moodFilter = 'neutral'">😐</button>
        <button class="filter-chip angry" :class="{ active: moodFilter === 'angry' }" @click="moodFilter = 'angry'">😤</button>
        <input class="search-input" v-model="searchQuery" placeholder="搜索菜品..." />
      </div>

      <!-- Summary -->
      <div class="bill-summary">
        <div class="summary-item">
          <span class="summary-label">总收入</span>
          <span class="summary-value gold">🪙 {{ totalIncome }}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">订单数</span>
          <span class="summary-value">{{ filteredBills.length }}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">总小费</span>
          <span class="summary-value tip">💰 {{ totalTips }}</span>
        </div>
      </div>

      <!-- Bill list -->
      <div class="bill-list" v-if="filteredBills.length > 0">
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
        <div v-if="filteredBills.length > displayLimit" class="load-more" @click="displayLimit += 20">
          加载更多...
        </div>
      </div>
      <div class="empty-state" v-else>
        <span class="empty-icon">📝</span>
        <span class="empty-text">{{ searchQuery || moodFilter !== 'all' ? '没有匹配的记录' : '还没有账单记录' }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  bills: { type: Array, default: () => [] },
  activeOrders: { type: Array, default: () => [] }
})

const subTab = ref('active')
const moodFilter = ref('all')
const searchQuery = ref('')
const displayLimit = ref(20)

function statusLabel(status) {
  const labels = { pending: '待处理', cooking: '烹饪中', ready: '待上菜', eating: '用餐中', served: '待结账' }
  return labels[status] || status
}

function patienceClass(patience) {
  if (patience > 60) return 'patience-high'
  if (patience > 30) return 'patience-mid'
  return 'patience-low'
}

const filteredBills = computed(() => {
  let list = props.bills
  if (moodFilter.value !== 'all') {
    list = list.filter(b => b.satisfaction === moodFilter.value)
  }
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(b => (b.dish?.name || '').toLowerCase().includes(q) || (b.customerName || '').toLowerCase().includes(q))
  }
  return list
})

const displayedBills = computed(() => filteredBills.value.slice(0, displayLimit.value))

const totalIncome = computed(() => filteredBills.value.reduce((sum, b) => sum + b.amount, 0))
const totalTips = computed(() => filteredBills.value.reduce((sum, b) => sum + (b.tip || 0), 0))
</script>

<style scoped>
.bill-panel {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 18px;
  padding: 16px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(8px);
  display: flex;
  flex-direction: column;
  height: 100%;
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

.title-icon { font-size: 18px; }

/* Sub-tabs */
.bill-sub-tabs {
  display: flex;
  gap: 4px;
  margin-bottom: 12px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 10px;
  padding: 3px;
}

.sub-tab {
  flex: 1;
  padding: 7px 10px;
  border: none;
  background: transparent;
  border-radius: 8px;
  color: #95a5a6;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.sub-tab.active {
  background: linear-gradient(135deg, rgba(241, 196, 15, 0.2), rgba(243, 156, 18, 0.15));
  color: #f1c40f;
}

.sub-tab-dot {
  position: absolute;
  top: 4px;
  right: 8px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #e74c3c;
  animation: dotPulse 1.5s ease infinite;
}

@keyframes dotPulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.4); opacity: 0.6; }
}

.tab-content {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}

.tab-content::-webkit-scrollbar { width: 3px; }
.tab-content::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }

/* Active Orders */
.order-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.order-card {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  transition: all 0.3s;
}

.order-card.status-cooking {
  border-left: 3px solid #e67e22;
  background: rgba(230, 126, 34, 0.05);
}

.order-card.status-pending {
  border-left: 3px solid #3498db;
  background: rgba(52, 152, 219, 0.05);
}

.order-card.status-ready {
  border-left: 3px solid #2ecc71;
  background: rgba(46, 204, 113, 0.05);
}

.order-card.status-eating {
  border-left: 3px solid #9b59b6;
  background: rgba(155, 89, 182, 0.05);
}

.order-card.status-served {
  border-left: 3px solid #f1c40f;
  background: rgba(241, 196, 15, 0.05);
}

.order-left {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.order-customer { font-size: 22px; }

.order-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.order-dish {
  font-size: 11px;
  color: #ecf0f1;
  font-weight: 600;
}

.order-customer-name {
  font-size: 9px;
  color: #7f8c8d;
}

.order-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.status-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 8px;
}

.status-badge.cooking {
  background: rgba(230, 126, 34, 0.15);
  color: #e67e22;
}

.status-badge.pending {
  background: rgba(52, 152, 219, 0.15);
  color: #3498db;
}

.status-badge.ready {
  background: rgba(46, 204, 113, 0.15);
  color: #2ecc71;
}

.status-badge.eating {
  background: rgba(155, 89, 182, 0.15);
  color: #9b59b6;
}

.status-badge.served {
  background: rgba(241, 196, 15, 0.15);
  color: #f1c40f;
}

.status-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: currentColor;
  animation: statusBlink 1.2s ease infinite;
}

@keyframes statusBlink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.patience-mini {
  width: 50px;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
}

.patience-mini-fill {
  height: 100%;
  border-radius: 2px;
  transition: width 0.5s;
}

.patience-mini-fill.patience-high { background: #2ecc71; }
.patience-mini-fill.patience-mid { background: #f39c12; }
.patience-mini-fill.patience-low { background: #e74c3c; }

/* Filters */
.filter-bar {
  display: flex;
  gap: 4px;
  margin-bottom: 10px;
  flex-wrap: wrap;
  align-items: center;
}

.filter-chip {
  padding: 4px 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  background: transparent;
  color: #95a5a6;
  font-size: 10px;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-chip.active {
  background: rgba(241, 196, 15, 0.15);
  border-color: rgba(241, 196, 15, 0.3);
  color: #f1c40f;
}

.filter-chip:hover:not(.active) {
  background: rgba(255, 255, 255, 0.05);
}

.search-input {
  flex: 1;
  min-width: 80px;
  padding: 5px 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.2);
  color: #ecf0f1;
  font-size: 10px;
  outline: none;
  transition: border-color 0.2s;
}

.search-input:focus {
  border-color: rgba(241, 196, 15, 0.4);
}

.search-input::placeholder { color: #7f8c8d; }

/* Summary */
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

.summary-label { font-size: 10px; color: #95a5a6; }

.summary-value {
  font-size: 13px;
  font-weight: 700;
  color: #ecf0f1;
  font-family: 'ZCOOL KuaiLe', 'Nunito', cursive;
}

.summary-value.gold { color: #f1c40f; }
.summary-value.tip { color: #2ecc71; }

/* Bill list */
.bill-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
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

.bill-card.mood-happy { border-left: 3px solid rgba(46, 204, 113, 0.6); }
.bill-card.mood-neutral { border-left: 3px solid rgba(241, 196, 15, 0.6); }
.bill-card.mood-angry { border-left: 3px solid rgba(231, 76, 60, 0.6); }

.bill-card:hover { background: rgba(255, 255, 255, 0.06); }

.bill-left {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.bill-customer { font-size: 20px; }

.bill-info {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.bill-dish { font-size: 11px; color: #ecf0f1; font-weight: 600; }
.bill-time { font-size: 9px; color: #7f8c8d; }

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

.bill-tip { font-size: 9px; color: #2ecc71; }

.bill-mood-indicator {
  position: absolute;
  top: 4px;
  right: 6px;
  font-size: 12px;
  opacity: 0.7;
}

.load-more {
  text-align: center;
  padding: 8px;
  color: #3498db;
  font-size: 11px;
  cursor: pointer;
  transition: color 0.2s;
}

.load-more:hover { color: #2ecc71; }

/* Empty state */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 24px;
  color: #7f8c8d;
}

.empty-icon { font-size: 32px; opacity: 0.5; }
.empty-text { font-size: 12px; }

/* Transitions */
.order-enter-active { animation: slideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1); }
.order-leave-active { animation: slideOut 0.3s ease; }
.bill-enter-active { animation: slideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1); }
.bill-leave-active { animation: slideOut 0.3s ease; }

@keyframes slideIn {
  from { opacity: 0; transform: translateX(-20px) scale(0.95); }
  to { opacity: 1; transform: translateX(0) scale(1); }
}

@keyframes slideOut {
  from { opacity: 1; transform: translateX(0); }
  to { opacity: 0; transform: translateX(20px); }
}
</style>

<template>
  <div class="order-overlay" @click.self="$emit('close')">
    <div class="order-panel">
      <div class="order-header">
        <span class="order-title">📋 顾客点单</span>
        <button class="close-btn" @click="$emit('close')">✕</button>
      </div>

      <!-- Customer info -->
      <div class="customer-info" v-if="customer">
        <span class="customer-emoji">{{ customer.emoji }}</span>
        <div class="customer-detail">
          <span class="customer-name">{{ customer.name }}</span>
          <span class="customer-dialogue">"{{ customer.wantedDish ? `我想要${customer.wantedDish.name}！` : '我想吃点东西~' }}"</span>
        </div>
      </div>

      <!-- Wanted dish highlight -->
      <div class="wanted-dish" v-if="customer?.wantedDish">
        <div class="wanted-label">🎯 顾客想要点:</div>
        <div class="wanted-card" @click="$emit('confirm', customer.wantedDish)">
          <span class="wanted-emoji">{{ customer.wantedDish.emoji }}</span>
          <div class="wanted-info">
            <span class="wanted-name">{{ customer.wantedDish.name }}</span>
            <div class="wanted-meta">
              <span class="meta-price">💰{{ customer.wantedDish.price }}</span>
              <span class="meta-time">⏱️{{ customer.wantedDish.cookTime }}s</span>
            </div>
          </div>
          <div class="confirm-badge">确认</div>
        </div>
      </div>

      <!-- Full menu -->
      <div class="menu-section">
        <div class="menu-label">📜 完整菜单 (也可选其他菜)</div>
        <div class="menu-grid">
          <div
            v-for="dish in dishes"
            :key="dish.id"
            class="menu-item"
            :class="{ wanted: customer?.wantedDish?.id === dish.id }"
            @click="$emit('confirm', dish)"
          >
            <span class="menu-emoji">{{ dish.emoji }}</span>
            <span class="menu-name">{{ dish.name }}</span>
            <div class="menu-meta">
              <span class="menu-price">💰{{ dish.price }}</span>
              <span class="menu-time">⏱️{{ dish.cookTime }}s</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  customer: { type: Object, default: null },
  dishes: { type: Array, default: () => [] }
})
defineEmits(['confirm', 'close'])
</script>

<style scoped>
.order-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  backdrop-filter: blur(2px);
  animation: overlayIn 0.2s ease;
}

@keyframes overlayIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.order-panel {
  background: rgba(255, 255, 255, 0.98);
  border-radius: 24px;
  padding: 22px;
  min-width: 340px;
  max-width: 420px;
  max-height: 80%;
  overflow-y: auto;
  box-shadow: 0 16px 50px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(243, 156, 18, 0.2);
  animation: popIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes popIn {
  from { transform: scale(0.88) translateY(10px); opacity: 0; }
  to { transform: scale(1) translateY(0); opacity: 1; }
}

.order-panel::-webkit-scrollbar {
  width: 4px;
}
.order-panel::-webkit-scrollbar-thumb {
  background: rgba(0,0,0,0.1);
  border-radius: 2px;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 2px dashed #f0e6d3;
}

.order-title {
  font-size: 17px;
  font-weight: bold;
  color: #d35400;
  font-family: 'ZCOOL KuaiLe', 'Nunito', cursive;
}

.close-btn {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: none;
  background: #fee;
  color: #e74c3c;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.25s;
}
.close-btn:hover {
  background: #e74c3c;
  color: white;
  transform: scale(1.1) rotate(90deg);
}

.customer-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  background: linear-gradient(135deg, #fff9f0, #fff5e8);
  border-radius: 16px;
  border: 1px solid #fce4c0;
  margin-bottom: 16px;
}

.customer-emoji {
  font-size: 36px;
}

.customer-detail {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.customer-name {
  font-size: 14px;
  font-weight: 700;
  color: #5d4037;
  font-family: 'ZCOOL KuaiLe', 'Nunito', cursive;
}

.customer-dialogue {
  font-size: 12px;
  color: #8d6e63;
  font-style: italic;
}

/* Wanted dish */
.wanted-dish {
  margin-bottom: 16px;
}

.wanted-label {
  font-size: 12px;
  color: #e67e22;
  font-weight: 600;
  margin-bottom: 8px;
  font-family: 'ZCOOL KuaiLe', 'Nunito', cursive;
}

.wanted-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 16px;
  background: linear-gradient(135deg, #fff3cd, #ffeaa7);
  border: 2px solid #f39c12;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.wanted-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(45deg, transparent 40%, rgba(255,255,255,0.3) 50%, transparent 60%);
  animation: shine 2s ease infinite;
}

@keyframes shine {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.wanted-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(243, 156, 18, 0.3);
}

.wanted-card:active {
  transform: translateY(0);
}

.wanted-emoji {
  font-size: 36px;
}

.wanted-info {
  flex: 1;
}

.wanted-name {
  font-size: 15px;
  font-weight: 700;
  color: #5d4037;
  font-family: 'ZCOOL KuaiLe', 'Nunito', cursive;
}

.wanted-meta {
  display: flex;
  gap: 10px;
  margin-top: 3px;
  font-size: 12px;
  color: #8d6e63;
}

.meta-price {
  color: #e67e22;
  font-weight: 600;
}

.confirm-badge {
  background: linear-gradient(135deg, #27ae60, #2ecc71);
  color: white;
  font-size: 12px;
  font-weight: 700;
  padding: 6px 14px;
  border-radius: 12px;
  font-family: 'ZCOOL KuaiLe', 'Nunito', cursive;
  box-shadow: 0 2px 8px rgba(39, 174, 96, 0.3);
}

/* Menu section */
.menu-section {
  border-top: 1px solid #f0f0f0;
  padding-top: 12px;
}

.menu-label {
  font-size: 11px;
  color: #999;
  margin-bottom: 10px;
}

.menu-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.menu-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 12px 8px;
  border-radius: 14px;
  background: linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%);
  border: 1.5px solid #eee;
  cursor: pointer;
  transition: all 0.25s;
}

.menu-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border-color: #f39c12;
  background: linear-gradient(135deg, #fff9f0 0%, #fff3e0 100%);
}

.menu-item:active {
  transform: translateY(0);
}

.menu-item.wanted {
  border-color: #f39c12;
  background: linear-gradient(135deg, #fff9f0 0%, #fff3e0 100%);
}

.menu-emoji {
  font-size: 28px;
}

.menu-name {
  font-size: 12px;
  font-weight: 600;
  color: #5d4037;
  font-family: 'ZCOOL KuaiLe', 'Nunito', cursive;
}

.menu-meta {
  display: flex;
  gap: 8px;
  font-size: 10px;
  color: #999;
}

.menu-price {
  color: #e67e22;
  font-weight: 600;
}
</style>

<template>
  <div class="order-panel">
    <div class="order-header">
      <span class="order-title">📋 为顾客点餐</span>
      <button class="close-btn" @click="$emit('close')">✕</button>
    </div>
    <div class="menu-grid">
      <div
        v-for="dish in dishes"
        :key="dish.id"
        class="menu-item"
        @click="$emit('select-dish', dish)"
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
</template>

<script setup>
defineProps({
  customer: { type: Object, default: null },
  dishes: { type: Array, default: () => [] }
})
defineEmits(['select-dish', 'close'])
</script>

<style scoped>
.order-panel {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(255, 255, 255, 0.97);
  border-radius: 20px;
  padding: 20px;
  min-width: 320px;
  max-width: 400px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
  z-index: 100;
  animation: popIn 0.25s ease-out;
  border: 2px solid rgba(243, 156, 18, 0.3);
}

@keyframes popIn {
  from { transform: translate(-50%, -50%) scale(0.85); opacity: 0; }
  to { transform: translate(-50%, -50%) scale(1); opacity: 1; }
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 10px;
  border-bottom: 2px dashed #f0e6d3;
}

.order-title {
  font-size: 16px;
  font-weight: bold;
  color: #d35400;
  font-family: 'Comic Sans MS', cursive;
}

.close-btn {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: none;
  background: #fee;
  color: #e74c3c;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}
.close-btn:hover {
  background: #e74c3c;
  color: white;
  transform: scale(1.1);
}

.menu-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.menu-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 14px 10px;
  border-radius: 14px;
  background: linear-gradient(135deg, #fff9f0 0%, #fff3e0 100%);
  border: 2px solid #fce4c0;
  cursor: pointer;
  transition: all 0.2s;
}

.menu-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 16px rgba(243, 156, 18, 0.2);
  border-color: #f39c12;
  background: linear-gradient(135deg, #fff5e6 0%, #ffe8cc 100%);
}

.menu-item:active {
  transform: translateY(0);
}

.menu-emoji {
  font-size: 32px;
}

.menu-name {
  font-size: 13px;
  font-weight: 600;
  color: #5d4037;
  font-family: 'Comic Sans MS', cursive;
}

.menu-meta {
  display: flex;
  gap: 8px;
  font-size: 11px;
  color: #888;
}

.menu-price {
  color: #e67e22;
  font-weight: 600;
}
</style>

<template>
  <div class="canvas-container" ref="containerRef">
    <canvas ref="canvasRef"></canvas>
    <div class="canvas-overlay-info">
      <span class="seat-info">🪑 {{ occupiedSeats }}/{{ seatCount }}</span>
      <span class="customer-count">👥 {{ customerCount }}</span>
      <span class="tip" v-if="!editMode">💡 点击顾客互动</span>
      <button class="edit-toggle-btn" :class="{ active: editMode }" @click="$emit('toggle-edit')">
        ✏️ {{ editMode ? '退出编辑' : '编辑布局' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { GameEngine } from '../game/engine.js'

const props = defineProps({
  dishes: { type: Array, default: () => [] },
  seatCount: { type: Number, default: 4 },
  staff: { type: Array, default: () => [] },
  decorations: { type: Object, default: () => ({}) },
  bonuses: { type: Object, default: () => ({ tipBonus: 0, patienceBonus: 0 }) },
  editMode: { type: Boolean, default: false },
  tablePositions: { type: Array, default: null }
})

const emit = defineEmits(['customer-click', 'earn-coins', 'serve-customer', 'staff-action', 'bill-update', 'position-changed', 'toggle-edit'])

const containerRef = ref(null)
const canvasRef = ref(null)
const occupiedSeats = ref(0)
const customerCount = ref(0)
let engine = null
let resizeObserver = null
let updateInterval = null

onMounted(() => {
  const canvas = canvasRef.value
  const container = containerRef.value

  const resize = () => {
    canvas.width = container.clientWidth
    canvas.height = container.clientHeight
    if (engine) {
      engine.invalidateBgCache()
      engine.updateSeats(props.seatCount, props.tablePositions)
    }
  }
  resize()

  resizeObserver = new ResizeObserver(resize)
  resizeObserver.observe(container)

  engine = new GameEngine(canvas, {
    dishes: props.dishes,
    onCustomerClick: (customer) => emit('customer-click', customer),
    onEarnCoins: (amount) => emit('earn-coins', amount),
    onServeCustomer: () => emit('serve-customer'),
    onStaffAction: (result) => emit('staff-action', result),
    onPositionChanged: (data) => emit('position-changed', data)
  })
  engine.updateStaff(props.staff)
  engine.updateDecorationState(props.decorations)
  engine.updateBonuses(props.bonuses.tipBonus, props.bonuses.patienceBonus)
  engine.updateSeats(props.seatCount, props.tablePositions)
  engine.start()

  updateInterval = setInterval(() => {
    if (engine) {
      occupiedSeats.value = engine.customers.filter(
        c => c.state !== 'leaving' && c.state !== 'walking_in'
      ).length
      customerCount.value = engine.customers.length
      emit('bill-update', engine.billHistory)
    }
  }, 500)
})

onUnmounted(() => {
  if (engine) engine.stop()
  if (resizeObserver) resizeObserver.disconnect()
  if (updateInterval) clearInterval(updateInterval)
})

watch(() => props.dishes, (val) => {
  if (engine) engine.updateDishes(val)
}, { deep: true })

watch(() => props.seatCount, (val) => {
  if (engine) engine.updateSeats(val, props.tablePositions)
})

watch(() => props.tablePositions, (val) => {
  if (engine) engine.updateSeats(props.seatCount, val)
}, { deep: true })

watch(() => props.staff, (val) => {
  if (engine) engine.updateStaff(val)
}, { deep: true })

watch(() => props.decorations, (val) => {
  if (engine) engine.updateDecorationState(val)
}, { deep: true })

watch(() => props.bonuses, (val) => {
  if (engine) engine.updateBonuses(val.tipBonus, val.patienceBonus)
}, { deep: true })

watch(() => props.editMode, (val) => {
  if (engine) engine.setEditMode(val)
})

function confirmOrder(customer, dish) {
  if (engine) engine.confirmOrder(customer, dish)
}

function serveDish(customer) {
  if (engine) engine.serveDish(customer)
}

function checkout(customer) {
  if (engine) return engine.checkout(customer)
  return 0
}

function triggerSalaryEffect(amount) {
  if (engine) engine.triggerSalaryEffect(amount)
}

function setEditMode(enabled) {
  if (engine) engine.setEditMode(enabled)
}

function updateDecorationState(state) {
  if (engine) engine.updateDecorationState(state)
}

function updateBonuses(tipBonus, patienceBonus) {
  if (engine) engine.updateBonuses(tipBonus, patienceBonus)
}

function getCanvasSize() {
  return { w: canvasRef.value?.width || 800, h: canvasRef.value?.height || 600 }
}

defineExpose({ confirmOrder, serveDish, checkout, triggerSalaryEffect, setEditMode, updateDecorationState, updateBonuses, getCanvasSize })
</script>

<style scoped>
.canvas-container {
  width: 100%;
  height: 100%;
  position: relative;
  border-radius: 20px;
  overflow: hidden;
}

canvas {
  display: block;
  width: 100%;
  height: 100%;
}

.canvas-overlay-info {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  gap: 8px;
  align-items: center;
}

.seat-info, .customer-count, .tip {
  background: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 5px 12px;
  border-radius: 18px;
  font-size: 12px;
  backdrop-filter: blur(6px);
  font-family: 'ZCOOL KuaiLe', 'Nunito', cursive;
  border: 1px solid rgba(255,255,255,0.08);
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}

.tip {
  color: #f1c40f;
}

.customer-count {
  color: #74b9ff;
}

.edit-toggle-btn {
  background: rgba(0, 0, 0, 0.7);
  color: #f1c40f;
  padding: 5px 14px;
  border-radius: 18px;
  font-size: 11px;
  font-family: 'ZCOOL KuaiLe', 'Nunito', cursive;
  border: 1.5px solid rgba(241, 196, 15, 0.3);
  cursor: pointer;
  transition: all 0.25s;
  backdrop-filter: blur(6px);
}

.edit-toggle-btn:hover {
  background: rgba(241, 196, 15, 0.15);
  border-color: rgba(241, 196, 15, 0.6);
}

.edit-toggle-btn.active {
  background: rgba(241, 196, 15, 0.2);
  border-color: rgba(241, 196, 15, 0.8);
  color: #fff;
  box-shadow: 0 0 12px rgba(241, 196, 15, 0.3);
}
</style>

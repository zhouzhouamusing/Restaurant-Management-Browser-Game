<template>
  <div class="canvas-container" ref="containerRef">
    <canvas ref="canvasRef"></canvas>
    <div class="canvas-overlay-info">
      <span class="seat-info">🪑 {{ occupiedSeats }}/{{ seatCount }}</span>
      <span class="customer-count">👥 {{ customerCount }}</span>
      <span class="tip">💡 点击顾客互动</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { GameEngine } from '../game/engine.js'

const props = defineProps({
  dishes: { type: Array, default: () => [] },
  seatCount: { type: Number, default: 4 },
  staff: { type: Array, default: () => [] }
})

const emit = defineEmits(['customer-click', 'earn-coins', 'serve-customer', 'staff-action', 'bill-update'])

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
  }
  resize()

  resizeObserver = new ResizeObserver(resize)
  resizeObserver.observe(container)

  engine = new GameEngine(canvas, {
    dishes: props.dishes,
    onCustomerClick: (customer) => emit('customer-click', customer),
    onEarnCoins: (amount) => emit('earn-coins', amount),
    onServeCustomer: () => emit('serve-customer'),
    onStaffAction: (result) => emit('staff-action', result)
  })
  engine.updateStaff(props.staff)
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
  if (engine) engine.updateSeats(val)
})

watch(() => props.staff, (val) => {
  if (engine) engine.updateStaff(val)
}, { deep: true })

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

defineExpose({ confirmOrder, serveDish, checkout })
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
}

.seat-info, .customer-count, .tip {
  background: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 5px 12px;
  border-radius: 18px;
  font-size: 12px;
  backdrop-filter: blur(6px);
  font-family: 'Comic Sans MS', cursive;
  border: 1px solid rgba(255,255,255,0.08);
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}

.tip {
  color: #f1c40f;
}

.customer-count {
  color: #74b9ff;
}
</style>

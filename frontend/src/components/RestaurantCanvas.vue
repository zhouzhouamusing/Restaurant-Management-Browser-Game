<template>
  <div class="canvas-container" ref="containerRef">
    <canvas ref="canvasRef"></canvas>
    <div class="canvas-overlay-info">
      <span class="seat-info">🪑 {{ occupiedSeats }}/{{ seatCount }}</span>
      <span class="tip">💡 点击顾客互动</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import { GameEngine } from '../game/engine.js'

const props = defineProps({
  dishes: { type: Array, default: () => [] },
  seatCount: { type: Number, default: 4 }
})

const emit = defineEmits(['customer-click', 'earn-coins', 'serve-customer'])

const containerRef = ref(null)
const canvasRef = ref(null)
const occupiedSeats = ref(0)
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
    onServeCustomer: () => emit('serve-customer')
  })
  engine.start()

  updateInterval = setInterval(() => {
    if (engine) {
      occupiedSeats.value = engine.customers.filter(
        c => c.state !== 'leaving' && c.state !== 'walking_in'
      ).length
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
  border-radius: 16px;
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
  gap: 10px;
}

.seat-info, .tip {
  background: rgba(0, 0, 0, 0.55);
  color: white;
  padding: 5px 10px;
  border-radius: 16px;
  font-size: 12px;
  backdrop-filter: blur(4px);
  font-family: 'Comic Sans MS', cursive;
}

.tip {
  color: #f1c40f;
}
</style>

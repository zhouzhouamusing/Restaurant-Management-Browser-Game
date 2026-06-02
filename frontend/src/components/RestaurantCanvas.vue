<template>
  <div class="canvas-container" ref="containerRef">
    <canvas ref="canvasRef"></canvas>
    <!-- 顾客数量指示 -->
    <div class="customer-count">
      <span>🧑‍🤝‍🧑</span>
      <span>{{ customerCount }}/{{ maxSeats }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { GameEngine } from '../game/engine.js'

const props = defineProps({
  dishes: { type: Array, default: () => [] }
})

const emit = defineEmits(['earn-coins', 'serve-customer'])

const containerRef = ref(null)
const canvasRef = ref(null)
const customerCount = ref(0)
const maxSeats = ref(6)
let engine = null
let resizeObserver = null

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

  engine = new GameEngine(
    canvas,
    props.dishes,
    (amount) => emit('earn-coins', amount),
    () => emit('serve-customer')
  )
  engine.start()

  // 定时更新顾客数量显示
  setInterval(() => {
    if (engine) {
      customerCount.value = engine.customers.length
    }
  }, 500)
})

onUnmounted(() => {
  if (engine) engine.stop()
  if (resizeObserver) resizeObserver.disconnect()
})

watch(() => props.dishes, (newDishes) => {
  if (engine) engine.updateDishes(newDishes)
}, { deep: true })
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

.customer-count {
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 6px;
  backdrop-filter: blur(4px);
}
</style>

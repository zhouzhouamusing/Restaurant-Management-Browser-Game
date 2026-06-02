<template>
  <div class="game-container">
    <!-- 顶部HUD -->
    <GameHUD
      :coins="gameState.coins"
      :level="gameState.level"
      :customersServed="gameState.customersServed"
      :nickname="user.nickname"
      @save="saveGame"
      @logout="logout"
    />

    <!-- 主游戏区域 -->
    <div class="game-main">
      <!-- Canvas餐厅场景 -->
      <div class="canvas-wrapper">
        <RestaurantCanvas
          ref="canvasRef"
          :dishes="gameState.dishes"
          :seatCount="gameState.seatCount"
          @customer-click="handleCustomerClick"
          @earn-coins="earnCoins"
          @serve-customer="serveCustomer"
        />

        <!-- 点餐弹窗 -->
        <OrderPanel
          v-if="orderPanel.visible"
          :customer="orderPanel.customer"
          :dishes="gameState.dishes"
          :style="orderPanel.style"
          @select-dish="handleSelectDish"
          @close="orderPanel.visible = false"
        />
      </div>

      <!-- 右侧面板 -->
      <div class="side-panel">
        <DishManager
          :dishes="gameState.dishes"
          :coins="gameState.coins"
          @unlock-dish="unlockDish"
        />
        <ShopPanel
          :coins="gameState.coins"
          :seatCount="gameState.seatCount"
          @buy-seat="buySeat"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { gameApi } from '../api'
import GameHUD from '../components/GameHUD.vue'
import RestaurantCanvas from '../components/RestaurantCanvas.vue'
import DishManager from '../components/DishManager.vue'
import ShopPanel from '../components/ShopPanel.vue'
import OrderPanel from '../components/OrderPanel.vue'

const router = useRouter()
const canvasRef = ref(null)
const user = JSON.parse(localStorage.getItem('user') || '{}')

const gameState = reactive({
  coins: 100,
  level: 1,
  dishes: [
    { id: 1, name: '蛋炒饭', price: 10, cookTime: 3, emoji: '🍚' },
    { id: 2, name: '番茄汤', price: 8, cookTime: 2, emoji: '🍅' },
    { id: 3, name: '红烧肉', price: 20, cookTime: 5, emoji: '🥩' }
  ],
  customersServed: 0,
  seatCount: 4
})

const orderPanel = reactive({
  visible: false,
  customer: null,
  style: {}
})

onMounted(async () => {
  if (!user.id) {
    router.push('/login')
    return
  }
  try {
    const res = await gameApi.load(user.id)
    if (res.data.code === 200) {
      const data = res.data.data
      gameState.coins = data.coins
      gameState.level = data.level
      gameState.customersServed = data.customersServed
      const savedDishes = JSON.parse(data.dishes || '[]')
      if (savedDishes.length > 0) gameState.dishes = savedDishes
    }
  } catch (e) {
    // 使用默认数据
  }
})

function handleCustomerClick(customer) {
  if (customer.state === 'waiting_to_order') {
    customer.startOrder()
    orderPanel.customer = customer
    orderPanel.visible = true
  } else if (customer.state === 'ready_to_serve') {
    canvasRef.value.serveDish(customer)
    ElMessage({ message: '上菜成功!', type: 'success', duration: 1200 })
  } else if (customer.state === 'waiting_to_pay') {
    const payment = canvasRef.value.checkout(customer)
    ElMessage({ message: `收款 ${payment} 金币!`, type: 'success', duration: 1500 })
  }
}

function handleSelectDish(dish) {
  if (orderPanel.customer) {
    canvasRef.value.confirmOrder(orderPanel.customer, dish)
    orderPanel.visible = false
    orderPanel.customer = null
  }
}

function earnCoins(amount) {
  gameState.coins += amount
}

function serveCustomer() {
  gameState.customersServed++
  if (gameState.customersServed % 10 === 0) {
    gameState.level++
    ElMessage({ message: `🎉 恭喜! 餐厅升级到 Lv.${gameState.level}!`, type: 'success', duration: 2500 })
  }
}

function unlockDish(dish) {
  if (gameState.coins >= dish.unlockCost) {
    gameState.coins -= dish.unlockCost
    gameState.dishes.push({ ...dish, unlockCost: undefined })
    ElMessage({ message: `解锁新菜品: ${dish.emoji} ${dish.name}!`, type: 'success', duration: 2000 })
  } else {
    ElMessage({ message: '金币不足!', type: 'warning', duration: 1500 })
  }
}

function buySeat(cost) {
  if (gameState.coins >= cost) {
    gameState.coins -= cost
    gameState.seatCount++
    ElMessage({ message: `新增座位! 当前 ${gameState.seatCount} 个座位`, type: 'success', duration: 2000 })
  } else {
    ElMessage({ message: '金币不足!', type: 'warning', duration: 1500 })
  }
}

async function saveGame() {
  try {
    await gameApi.save({
      userId: user.id,
      coins: gameState.coins,
      level: gameState.level,
      dishes: JSON.stringify(gameState.dishes),
      customersServed: gameState.customersServed
    })
    ElMessage({ message: '💾 存档成功!', type: 'success', duration: 1500 })
  } catch (e) {
    ElMessage({ message: '存档失败', type: 'error', duration: 1500 })
  }
}

function logout() {
  localStorage.removeItem('user')
  router.push('/login')
}
</script>

<style scoped>
.game-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
  overflow: hidden;
}

.game-main {
  flex: 1;
  display: flex;
  gap: 12px;
  padding: 12px;
  min-height: 0;
}

.canvas-wrapper {
  flex: 1;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.4);
  position: relative;
  border: 2px solid rgba(255, 255, 255, 0.08);
}

.side-panel {
  width: 290px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow-y: auto;
}

.side-panel::-webkit-scrollbar {
  width: 4px;
}
.side-panel::-webkit-scrollbar-thumb {
  background: rgba(255,255,255,0.15);
  border-radius: 2px;
}
</style>

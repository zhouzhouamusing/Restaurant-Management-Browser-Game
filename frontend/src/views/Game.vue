<template>
  <div class="game-container">
    <!-- 顶部状态栏 -->
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
          @earn-coins="earnCoins"
          @serve-customer="serveCustomer"
        />
      </div>

      <!-- 右侧面板 -->
      <div class="side-panel">
        <DishManager
          :dishes="gameState.dishes"
          :coins="gameState.coins"
          @unlock-dish="unlockDish"
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

const router = useRouter()
const canvasRef = ref(null)
const user = JSON.parse(localStorage.getItem('user') || '{}')

const gameState = reactive({
  coins: 100,
  level: 1,
  dishes: [],
  customersServed: 0
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
      gameState.dishes = JSON.parse(data.dishes || '[]')
      gameState.customersServed = data.customersServed
    }
  } catch (e) {
    ElMessage.warning('加载存档失败，使用默认数据')
  }
})

const earnCoins = (amount) => {
  gameState.coins += amount
}

const serveCustomer = () => {
  gameState.customersServed++
  if (gameState.customersServed % 10 === 0) {
    gameState.level++
    ElMessage.success(`恭喜! 餐厅升级到 ${gameState.level} 级!`)
  }
}

const unlockDish = (dish) => {
  if (gameState.coins >= dish.unlockCost) {
    gameState.coins -= dish.unlockCost
    gameState.dishes.push(dish)
    ElMessage.success(`解锁新菜品: ${dish.name}!`)
  } else {
    ElMessage.warning('金币不足!')
  }
}

const saveGame = async () => {
  try {
    await gameApi.save({
      userId: user.id,
      coins: gameState.coins,
      level: gameState.level,
      dishes: JSON.stringify(gameState.dishes),
      customersServed: gameState.customersServed
    })
    ElMessage.success('存档成功!')
  } catch (e) {
    ElMessage.error('存档失败')
  }
}

const logout = () => {
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
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.side-panel {
  width: 280px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>

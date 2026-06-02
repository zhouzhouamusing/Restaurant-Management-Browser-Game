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
          :staff="gameState.staff"
          @customer-click="handleCustomerClick"
          @earn-coins="earnCoins"
          @serve-customer="serveCustomer"
          @staff-action="handleStaffAction"
          @bill-update="handleBillUpdate"
        />

        <!-- 顾客点菜确认弹窗 -->
        <OrderPanel
          v-if="orderPanel.visible"
          :customer="orderPanel.customer"
          :dishes="gameState.dishes"
          @confirm="handleConfirmOrder"
          @close="orderPanel.visible = false"
        />

        <!-- 收银台弹窗 -->
        <Transition name="fade-scale">
          <div v-if="checkoutPanel.visible" class="checkout-overlay">
            <div class="checkout-modal">
              <div class="checkout-header">
                <span class="checkout-title">🧾 收银台</span>
                <button class="close-btn" @click="checkoutPanel.visible = false">✕</button>
              </div>
              <div class="checkout-body">
                <div class="checkout-customer">
                  <span class="checkout-emoji">{{ checkoutPanel.customer?.emoji }}</span>
                  <span class="checkout-name">{{ checkoutPanel.customer?.name }}</span>
                </div>
                <div class="checkout-bill-detail">
                  <div class="bill-row">
                    <span>菜品</span>
                    <span>{{ checkoutPanel.customer?.orderedDish?.emoji }} {{ checkoutPanel.customer?.orderedDish?.name }}</span>
                  </div>
                  <div class="bill-row">
                    <span>单价</span>
                    <span>🪙 {{ checkoutPanel.customer?.orderedDish?.price || 0 }}</span>
                  </div>
                  <div class="bill-row tip-row">
                    <span>小费</span>
                    <span class="tip-amount">🪙 {{ checkoutTip }}</span>
                  </div>
                  <div class="bill-divider"></div>
                  <div class="bill-row total-row">
                    <span>合计</span>
                    <span class="total-amount">🪙 {{ checkoutTotal }}</span>
                  </div>
                </div>
                <div class="satisfaction-display">
                  <span>顾客满意度：</span>
                  <span class="satisfaction-bar">
                    <span class="satisfaction-fill" :style="{ width: (checkoutPanel.customer?.patience || 0) + '%' }"></span>
                  </span>
                  <span class="satisfaction-emoji">{{ getSatisfactionEmoji() }}</span>
                </div>
              </div>
              <button class="checkout-confirm-btn" @click="confirmCheckout">
                💰 收款 {{ checkoutTotal }} 金币
              </button>
            </div>
          </div>
        </Transition>

        <!-- Notification toasts -->
        <TransitionGroup name="toast" tag="div" class="toast-container">
          <div v-for="toast in toasts" :key="toast.id" class="toast-item" :class="toast.type">
            <span class="toast-icon">{{ toast.icon }}</span>
            <span class="toast-text">{{ toast.text }}</span>
          </div>
        </TransitionGroup>
      </div>

      <!-- 右侧面板 -->
      <div class="side-panel">
        <!-- Tab switcher -->
        <div class="panel-tabs">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            class="tab-btn"
            :class="{ active: activeTab === tab.id }"
            @click="activeTab = tab.id"
          >
            <span class="tab-icon">{{ tab.icon }}</span>
            <span class="tab-label">{{ tab.label }}</span>
          </button>
        </div>

        <div class="panel-content">
          <Transition name="tab-slide" mode="out-in">
            <DishManager
              v-if="activeTab === 'dishes'"
              :dishes="gameState.dishes"
              :coins="gameState.coins"
              @unlock-dish="unlockDish"
            />
            <ShopPanel
              v-else-if="activeTab === 'shop'"
              :coins="gameState.coins"
              :seatCount="gameState.seatCount"
              @buy-seat="buySeat"
            />
            <StaffPanel
              v-else-if="activeTab === 'staff'"
              :staff="gameState.staff"
              :coins="gameState.coins"
              @hire-staff="hireStaff"
              @upgrade-staff="upgradeStaff"
            />
            <BillPanel
              v-else-if="activeTab === 'bills'"
              :bills="billHistory"
            />
          </Transition>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { gameApi } from '../api'
import { Staff, getHireCost } from '../game/staff.js'
import GameHUD from '../components/GameHUD.vue'
import RestaurantCanvas from '../components/RestaurantCanvas.vue'
import DishManager from '../components/DishManager.vue'
import ShopPanel from '../components/ShopPanel.vue'
import OrderPanel from '../components/OrderPanel.vue'
import StaffPanel from '../components/StaffPanel.vue'
import BillPanel from '../components/BillPanel.vue'

const router = useRouter()
const canvasRef = ref(null)
const user = JSON.parse(localStorage.getItem('user') || '{}')
const activeTab = ref('dishes')
const billHistory = ref([])
const toasts = ref([])
let toastId = 0
let staffIdCounter = 0
let salaryInterval = null

const tabs = [
  { id: 'dishes', icon: '🍽️', label: '菜品' },
  { id: 'staff', icon: '👥', label: '员工' },
  { id: 'shop', icon: '🛒', label: '商店' },
  { id: 'bills', icon: '🧾', label: '账单' }
]

const gameState = reactive({
  coins: 100,
  level: 1,
  dishes: [
    { id: 1, name: '蛋炒饭', price: 10, cookTime: 3, emoji: '🍚' },
    { id: 2, name: '番茄汤', price: 8, cookTime: 2, emoji: '🍅' },
    { id: 3, name: '红烧肉', price: 20, cookTime: 5, emoji: '🥩' }
  ],
  customersServed: 0,
  seatCount: 4,
  staff: []
})

const orderPanel = reactive({
  visible: false,
  customer: null
})

const checkoutPanel = reactive({
  visible: false,
  customer: null
})

const checkoutTip = computed(() => {
  const c = checkoutPanel.customer
  if (!c || !c.orderedDish) return 0
  const multiplier = c.patience > 70 ? 1.5 : c.patience > 40 ? 1.2 : 1
  return Math.floor(c.orderedDish.price * multiplier) - c.orderedDish.price
})

const checkoutTotal = computed(() => {
  const c = checkoutPanel.customer
  if (!c || !c.orderedDish) return 0
  const multiplier = c.patience > 70 ? 1.5 : c.patience > 40 ? 1.2 : 1
  return Math.floor(c.orderedDish.price * multiplier)
})

function getSatisfactionEmoji() {
  const c = checkoutPanel.customer
  if (!c) return '😐'
  if (c.patience > 70) return '😄'
  if (c.patience > 40) return '😐'
  return '😤'
}

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
    // defaults
  }

  salaryInterval = setInterval(() => {
    const totalSalary = gameState.staff.reduce((sum, s) => sum + s.getSalary(), 0)
    if (totalSalary > 0 && gameState.coins >= totalSalary) {
      gameState.coins -= totalSalary
      canvasRef.value?.triggerSalaryEffect(totalSalary)
      showToast('💸', `支付员工薪资 -${totalSalary} 金币`, 'salary')
    } else if (totalSalary > 0 && gameState.coins < totalSalary) {
      showToast('⚠️', '金币不足以支付薪资！', 'error')
    }
  }, 60000)
})

onUnmounted(() => {
  if (salaryInterval) clearInterval(salaryInterval)
})

function showToast(icon, text, type = 'info') {
  const id = ++toastId
  toasts.value.push({ id, icon, text, type })
  setTimeout(() => {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }, 2500)
}

function handleCustomerClick(customer) {
  if (customer.state === 'waiting_to_order') {
    customer.startOrder()
    orderPanel.customer = customer
    orderPanel.visible = true
  } else if (customer.state === 'ready_to_serve') {
    canvasRef.value.serveDish(customer)
    showToast('🍽️', `为${customer.name}上菜成功！`, 'success')
  } else if (customer.state === 'waiting_to_pay') {
    checkoutPanel.customer = customer
    checkoutPanel.visible = true
  }
}

function handleConfirmOrder(dish) {
  if (orderPanel.customer) {
    canvasRef.value.confirmOrder(orderPanel.customer, dish || orderPanel.customer.wantedDish)
    orderPanel.visible = false
    showToast('📝', `${orderPanel.customer.name}点了${(dish || orderPanel.customer.wantedDish).name}`, 'info')
    orderPanel.customer = null
  }
}

function confirmCheckout() {
  if (checkoutPanel.customer) {
    const payment = canvasRef.value.checkout(checkoutPanel.customer)
    checkoutPanel.visible = false
    showToast('💰', `收款 ${payment} 金币！`, 'success')
    checkoutPanel.customer = null
  }
}

function handleStaffAction(result) {
  if (result.type === 'order_taken') {
    showToast('🧑‍🍳', `${result.staff.name}为${result.customer.name}点单`, 'staff')
  } else if (result.type === 'dish_served') {
    showToast('🍽️', `${result.staff.name}为${result.customer.name}上菜`, 'staff')
  } else if (result.type === 'checkout_done') {
    showToast('💁', `${result.staff.name}收款 ${result.payment} 金币`, 'staff')
  }
}

function handleBillUpdate(bills) {
  billHistory.value = bills
}

function earnCoins(amount) {
  gameState.coins += amount
}

function serveCustomer() {
  gameState.customersServed++
  if (gameState.customersServed % 10 === 0) {
    gameState.level++
    showToast('🎉', `恭喜！餐厅升级到 Lv.${gameState.level}！`, 'levelup')
  }
}

function unlockDish(dish) {
  if (gameState.coins >= dish.unlockCost) {
    gameState.coins -= dish.unlockCost
    gameState.dishes.push({ ...dish, unlockCost: undefined })
    showToast('🆕', `解锁新菜品: ${dish.emoji} ${dish.name}！`, 'success')
  } else {
    showToast('❌', '金币不足！', 'error')
  }
}

function buySeat(cost) {
  if (gameState.coins >= cost) {
    gameState.coins -= cost
    gameState.seatCount++
    showToast('🪑', `新增座位！当前 ${gameState.seatCount} 个`, 'success')
  } else {
    showToast('❌', '金币不足！', 'error')
  }
}

function hireStaff(type) {
  const count = gameState.staff.filter(s => s.type === type).length
  const cost = getHireCost(type, count)
  if (gameState.coins >= cost) {
    gameState.coins -= cost
    const staff = new Staff(type, ++staffIdCounter)
    gameState.staff.push(staff)
    const typeName = type === 'waiter' ? '服务员' : '收银员'
    showToast('🎊', `成功雇佣${typeName} ${staff.name}！`, 'success')
  } else {
    showToast('❌', '金币不足！', 'error')
  }
}

function upgradeStaff(staff) {
  const cost = staff.getUpgradeCost()
  if (gameState.coins >= cost) {
    gameState.coins -= cost
    staff.upgrade()
    showToast('⬆️', `${staff.name}升级到 Lv.${staff.level}！`, 'success')
  } else {
    showToast('❌', '金币不足！', 'error')
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
    showToast('💾', '存档成功！', 'success')
  } catch (e) {
    showToast('❌', '存档失败', 'error')
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
  background: linear-gradient(145deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
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
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255,255,255,0.05);
  position: relative;
  border: 2px solid rgba(255, 255, 255, 0.06);
}

.side-panel {
  width: 300px;
  display: flex;
  flex-direction: column;
  gap: 0;
  min-height: 0;
}

/* Panel Tabs */
.panel-tabs {
  display: flex;
  gap: 4px;
  padding: 6px;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 16px 16px 0 0;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-bottom: none;
}

.tab-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 8px 4px;
  border: none;
  border-radius: 12px;
  background: transparent;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.tab-btn:hover {
  background: rgba(255, 255, 255, 0.06);
}

.tab-btn.active {
  background: linear-gradient(135deg, rgba(243, 156, 18, 0.2), rgba(241, 196, 15, 0.1));
  box-shadow: 0 2px 8px rgba(243, 156, 18, 0.15);
}

.tab-icon {
  font-size: 18px;
  transition: transform 0.3s;
}

.tab-btn.active .tab-icon {
  transform: scale(1.2);
}

.tab-label {
  font-size: 10px;
  color: #95a5a6;
  font-family: 'ZCOOL KuaiLe', 'Nunito', cursive;
  font-weight: 600;
  transition: color 0.3s;
}

.tab-btn.active .tab-label {
  color: #f39c12;
}

.panel-content {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  border-radius: 0 0 16px 16px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-top: none;
}

.panel-content::-webkit-scrollbar {
  width: 4px;
}
.panel-content::-webkit-scrollbar-thumb {
  background: rgba(255,255,255,0.12);
  border-radius: 2px;
}

/* Checkout Modal */
.checkout-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  backdrop-filter: blur(3px);
}

.checkout-modal {
  background: linear-gradient(145deg, #ffffff, #f8f9fa);
  border-radius: 24px;
  padding: 24px;
  min-width: 320px;
  max-width: 380px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(243, 156, 18, 0.2);
}

.checkout-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18px;
}

.checkout-title {
  font-size: 18px;
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
  transition: all 0.2s;
}
.close-btn:hover {
  background: #e74c3c;
  color: white;
  transform: scale(1.1) rotate(90deg);
}

.checkout-body {
  margin-bottom: 18px;
}

.checkout-customer {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
  padding: 10px 14px;
  background: #fff9f0;
  border-radius: 14px;
  border: 1px solid #fce4c0;
}

.checkout-emoji {
  font-size: 32px;
}

.checkout-name {
  font-size: 14px;
  font-weight: 600;
  color: #5d4037;
  font-family: 'ZCOOL KuaiLe', 'Nunito', cursive;
}

.checkout-bill-detail {
  background: #fafafa;
  border-radius: 14px;
  padding: 12px 16px;
  margin-bottom: 14px;
}

.bill-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
  font-size: 13px;
  color: #555;
}

.tip-row {
  color: #27ae60;
}

.tip-amount {
  font-weight: 600;
  color: #27ae60;
}

.bill-divider {
  border-top: 2px dashed #eee;
  margin: 6px 0;
}

.total-row {
  font-weight: bold;
  font-size: 15px;
  color: #333;
}

.total-amount {
  color: #d35400;
  font-size: 17px;
  font-weight: 800;
}

.satisfaction-display {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #666;
}

.satisfaction-bar {
  flex: 1;
  height: 8px;
  background: #eee;
  border-radius: 4px;
  overflow: hidden;
}

.satisfaction-fill {
  height: 100%;
  background: linear-gradient(90deg, #e74c3c, #f39c12, #2ecc71);
  border-radius: 4px;
  transition: width 0.3s;
}

.satisfaction-emoji {
  font-size: 18px;
}

.checkout-confirm-btn {
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: 16px;
  background: linear-gradient(135deg, #f39c12, #e67e22);
  color: white;
  font-size: 16px;
  font-weight: 700;
  font-family: 'ZCOOL KuaiLe', 'Nunito', cursive;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 15px rgba(243, 156, 18, 0.3);
}

.checkout-confirm-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(243, 156, 18, 0.4);
}

.checkout-confirm-btn:active {
  transform: translateY(0);
}

/* Toast notifications */
.toast-container {
  position: absolute;
  top: 12px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 150;
  pointer-events: none;
}

.toast-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  border-radius: 14px;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(10px);
  color: white;
  font-size: 13px;
  font-family: 'ZCOOL KuaiLe', 'Nunito', cursive;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  white-space: nowrap;
}

.toast-item.success {
  background: rgba(39, 174, 96, 0.85);
}

.toast-item.error {
  background: rgba(231, 76, 60, 0.85);
}

.toast-item.staff {
  background: rgba(52, 152, 219, 0.85);
}

.toast-item.salary {
  background: linear-gradient(135deg, rgba(231, 76, 60, 0.9), rgba(192, 57, 43, 0.9));
  animation: salaryShake 0.4s ease;
}

@keyframes salaryShake {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-4px); }
  40% { transform: translateX(4px); }
  60% { transform: translateX(-2px); }
  80% { transform: translateX(2px); }
}

.toast-item.levelup {
  background: linear-gradient(135deg, rgba(155, 89, 182, 0.9), rgba(142, 68, 173, 0.9));
  animation: levelUpPulse 0.5s ease;
}

@keyframes levelUpPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.toast-icon {
  font-size: 16px;
}

.toast-text {
  font-weight: 600;
}

/* Transitions */
.fade-scale-enter-active {
  animation: fadeScaleIn 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}
.fade-scale-leave-active {
  animation: fadeScaleOut 0.25s ease;
}

@keyframes fadeScaleIn {
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
}
@keyframes fadeScaleOut {
  from { opacity: 1; transform: scale(1); }
  to { opacity: 0; transform: scale(0.9); }
}

.toast-enter-active {
  animation: toastIn 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}
.toast-leave-active {
  animation: toastOut 0.3s ease;
}

@keyframes toastIn {
  from { opacity: 0; transform: translateY(-20px) scale(0.9); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes toastOut {
  from { opacity: 1; transform: translateY(0); }
  to { opacity: 0; transform: translateY(-10px) scale(0.95); }
}

.tab-slide-enter-active {
  animation: tabIn 0.3s ease;
}
.tab-slide-leave-active {
  animation: tabOut 0.2s ease;
}

@keyframes tabIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes tabOut {
  from { opacity: 1; }
  to { opacity: 0; }
}
</style>

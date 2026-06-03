<template>
  <div class="game-container">
    <!-- 顶部HUD -->
    <GameHUD
      :coins="gameState.coins"
      :level="gameState.level"
      :customersServed="gameState.customersServed"
      :nickname="user.nickname"
      :bonuses="activeBonuses"
      :editMode="editMode"
      :seasonTimer="seasonTimer"
      :currentSeason="currentSeason"
      :activeEvent="activeEvent"
      :achievementCount="gameState.achievements.length"
      :achievementTotal="ACHIEVEMENT_DEFINITIONS.length"
      @save="saveGame"
      @logout="logout"
      @toggle-edit="toggleEditMode"
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
          :decorations="gameState.decorations"
          :bonuses="activeBonuses"
          :editMode="editMode"
          :tablePositions="gameState.tablePositions"
          @customer-click="handleCustomerClick"
          @earn-coins="earnCoins"
          @serve-customer="serveCustomer"
          @staff-action="handleStaffAction"
          @bill-update="handleBillUpdate"
          @position-changed="handlePositionChanged"
          @toggle-edit="toggleEditMode"
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
                  <span v-if="checkoutPanel.customer?.reviewResult" class="checkout-review" :class="checkoutPanel.customer.reviewResult.isPositive ? 'review-positive' : 'review-negative'">
                    {{ checkoutPanel.customer.reviewResult.isPositive ? '👍 好评' : '👎 差评' }}
                  </span>
                </div>
                <div class="checkout-bill-detail">
                  <div class="bill-row">
                    <span>菜品</span>
                    <span v-if="checkoutPanel.customer?.isComboOrder">🍱 {{ checkoutPanel.customer?.orderedCombo?.name || '套餐' }}</span>
                    <span v-else>{{ checkoutPanel.customer?.orderedDish?.emoji }} {{ checkoutPanel.customer?.orderedDish?.name }}</span>
                  </div>
                  <div v-if="checkoutDishRarity" class="bill-row rarity-row">
                    <span>稀有度</span>
                    <span class="rarity-tag" :style="{ color: checkoutDishRarity.color }">{{ checkoutDishRarity.emoji }} {{ checkoutDishRarity.name }} ×{{ checkoutDishRarity.revenueMultiplier }}</span>
                  </div>
                  <div class="bill-row">
                    <span>单价</span>
                    <span><svg class="coin-inline" viewBox="0 0 20 20" width="14" height="14"><circle cx="10" cy="10" r="8" fill="#f1c40f" stroke="#b8860b" stroke-width="1.5"/><text x="10" y="14" text-anchor="middle" font-size="9" font-weight="bold" fill="#8B6914">¥</text></svg> {{ checkoutPanel.customer?.isComboOrder ? checkoutPanel.customer?.comboDishes?.reduce((s,d) => s+d.price, 0) : (checkoutPanel.customer?.orderedDish?.price || 0) }}</span>
                  </div>
                  <div v-if="checkoutPanel.customer?.isComboOrder" class="bill-row combo-bonus-row">
                    <span>🍱 套餐加成</span>
                    <span class="combo-bonus-tag">+{{ Math.round((checkoutPanel.customer.comboMultiplier * 1.1 - 1) * 100) }}%</span>
                  </div>
                  <div class="bill-row tip-row">
                    <span>小费</span>
                    <span class="tip-amount"><svg class="coin-inline" viewBox="0 0 20 20" width="14" height="14"><circle cx="10" cy="10" r="8" fill="#f1c40f" stroke="#b8860b" stroke-width="1.5"/><text x="10" y="14" text-anchor="middle" font-size="9" font-weight="bold" fill="#8B6914">¥</text></svg> {{ checkoutTip }}</span>
                  </div>
                  <div class="bill-divider"></div>
                  <div class="bill-row total-row">
                    <span>合计</span>
                    <span class="total-amount"><svg class="coin-inline" viewBox="0 0 20 20" width="16" height="16"><circle cx="10" cy="10" r="8" fill="#f1c40f" stroke="#b8860b" stroke-width="1.5"/><text x="10" y="14" text-anchor="middle" font-size="9" font-weight="bold" fill="#8B6914">¥</text></svg> {{ checkoutTotal }}</span>
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
                <svg class="coin-inline" viewBox="0 0 20 20" width="16" height="16"><circle cx="10" cy="10" r="8" fill="#f1c40f" stroke="#b8860b" stroke-width="1.5"/><text x="10" y="14" text-anchor="middle" font-size="9" font-weight="bold" fill="#8B6914">¥</text></svg> 收款 {{ checkoutTotal }} 金币
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
              :researchManager="researchManager"
              :seasonTimer="seasonTimer"
              :currentSeason="currentSeason"
              :qualityMap="qualityMap"
              :unlockedSuppliers="gameState.unlockedSuppliers"
              :supplierAssignments="gameState.supplierAssignments"
              :combos="gameState.combos"
              :unlockedComboTemplates="gameState.unlockedComboTemplates"
              :restaurantLevel="gameState.level"
              :ingredientStock="gameState.ingredientStock"
              :supplierPurchaseHistory="gameState.supplierPurchaseHistory"
              :activeEvent="activeEvent"
              :comboRecommendations="comboRecommendations"
              @unlock-dish="unlockDish"
              @start-research="startResearch"
              @unlock-supplier="unlockSupplier"
              @set-supplier="setSupplierForDish"
              @unlock-combo-template="unlockComboTemplate"
              @create-combo="createCombo"
              @remove-combo="removeCombo"
              @buy-ingredient="buyIngredient"
            />
            <ShopPanel
              v-else-if="activeTab === 'shop'"
              :coins="gameState.coins"
              :seatCount="gameState.seatCount"
              :decorations="gameState.decorations"
              @buy-seat="buySeat"
              @buy-decoration="buyDecoration"
              @equip-decoration="equipDecoration"
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
              :activeOrders="activeOrders"
            />
            <StatsPanel
              v-else-if="activeTab === 'stats'"
              :bills="billHistory"
              :gameState="gameState"
              :achievements="gameState.achievements"
            />
          </Transition>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, watch, shallowRef } from 'vue'
import { useRouter } from 'vue-router'
import { gameApi } from '../api'
import { Staff, getHireCost } from '../game/staff.js'
import { saveToLocal, loadFromLocal } from '../game/persistence.js'
import { getDefaultDecorationState } from '../game/decorations.js'
import { calculateBonuses, calculateDishQuality } from '../game/bonus-calculator.js'
import { DISH_CATALOG, SUPPLIER_CATALOG, COMBO_TEMPLATES, RARITY_CONFIG, getCurrentSeason, getSupplierById, isDishAvailableInSeason, validateCombo, getIngredientCost, canServeDish, consumeIngredients, getBuyPrice, INGREDIENT_CATALOG, ACHIEVEMENT_DEFINITIONS, SEASONAL_EVENTS, getSupplierLoyaltyTier, getNextLoyaltyTier, getBuyPriceWithLoyalty, getComboRecommendations } from '../game/dishes.js'
import { SeasonTimer } from '../game/season-timer.js'
import { ResearchManager } from '../game/research.js'
import GameHUD from '../components/GameHUD.vue'
import RestaurantCanvas from '../components/RestaurantCanvas.vue'
import DishManager from '../components/DishManager.vue'
import ShopPanel from '../components/ShopPanel.vue'
import OrderPanel from '../components/OrderPanel.vue'
import StaffPanel from '../components/StaffPanel.vue'
import BillPanel from '../components/BillPanel.vue'
import StatsPanel from '../components/StatsPanel.vue'

const router = useRouter()
const canvasRef = ref(null)
const user = JSON.parse(localStorage.getItem('user') || '{}')
const activeTab = ref('dishes')
const billHistory = ref([])
const toasts = ref([])
let toastId = 0
let staffIdCounter = 0
let salaryInterval = null
let autoSaveInterval = null
let researchCheckInterval = null
let seasonCheckInterval = null
let seasonTickInterval = null
let lastSeason = null

const tabs = [
  { id: 'dishes', icon: '🍽️', label: '菜品' },
  { id: 'staff', icon: '👥', label: '员工' },
  { id: 'shop', icon: '🛒', label: '商店' },
  { id: 'bills', icon: '🧾', label: '订单' },
  { id: 'stats', icon: '📊', label: '统计' }
]

const gameState = reactive({
  coins: 100,
  level: 1,
  dishes: [
    { id: 1, name: '蛋炒饭', price: 10, cookTime: 3, emoji: '🍛' },
    { id: 2, name: '番茄汤', price: 8, cookTime: 2, emoji: '🍲' },
    { id: 3, name: '红烧肉', price: 20, cookTime: 5, emoji: '🍖' }
  ],
  customersServed: 0,
  seatCount: 4,
  staff: [],
  decorations: getDefaultDecorationState(),
  tablePositions: null,
  researchData: null,
  unlockedSuppliers: ['market_basic'],
  supplierAssignments: {},
  seasonEpoch: Date.now(),
  combos: [],
  unlockedComboTemplates: [],
  ingredientStock: {},
  positiveReviews: 0,
  totalReviews: 0,
  achievements: [],
  totalEarned: 0,
  supplierPurchaseHistory: {},
  eventsParticipated: 0
})

const researchManager = ref(ResearchManager.fromSerialized(null))
const seasonTimer = shallowRef(new SeasonTimer(gameState.seasonEpoch))
const currentSeason = computed(() => seasonTimer.value.getCurrentSeason())

const editMode = ref(false)
const activeOrders = ref([])

const activeBonuses = computed(() => calculateBonuses(gameState.decorations))
const activeEvent = computed(() => seasonTimer.value.getActiveEvent())
const comboRecommendations = computed(() =>
  getComboRecommendations(gameState.dishes, currentSeason.value, gameState.unlockedComboTemplates)
)

watch(activeBonuses, (bonuses) => {
  canvasRef.value?.updateBonuses(bonuses.tipBonus, bonuses.patienceBonus)
}, { deep: true })

watch(() => gameState.decorations, (deco) => {
  canvasRef.value?.updateDecorationState(deco)
}, { deep: true })

const qualityMap = computed(() => {
  const map = {}
  for (const dish of gameState.dishes) {
    const catalogDish = DISH_CATALOG[dish.id]
    if (!catalogDish) { map[dish.id] = 50; continue }
    const supplierId = gameState.supplierAssignments[dish.id] || 'market_basic'
    const supplier = getSupplierById(supplierId)
    map[dish.id] = calculateDishQuality(catalogDish, supplier.qualityBonus)
  }
  return map
})

watch(qualityMap, (map) => {
  canvasRef.value?.updateQualityMap(map)
}, { deep: true })

watch(currentSeason, (season) => {
  canvasRef.value?.updateSeasonData(season)
})

watch(() => gameState.combos, (combos) => {
  canvasRef.value?.updateCombos(combos)
}, { deep: true })

watch(() => gameState.level, (level) => {
  canvasRef.value?.updateRestaurantLevel(level)
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
  const total = c.getPayment()
  const basePrice = c.isComboOrder
    ? c.comboDishes.reduce((sum, d) => sum + d.price, 0)
    : c.orderedDish.price
  return Math.max(0, total - basePrice)
})

const checkoutTotal = computed(() => {
  const c = checkoutPanel.customer
  if (!c || !c.orderedDish) return 0
  return c.getPayment()
})

function getSatisfactionEmoji() {
  const c = checkoutPanel.customer
  if (!c) return '😐'
  if (c.patience > 70) return '😄'
  if (c.patience > 40) return '😐'
  return '😤'
}

const checkoutDishRarity = computed(() => {
  const c = checkoutPanel.customer
  if (!c || !c.orderedDish) return null
  const catalogDish = DISH_CATALOG[c.orderedDish.id]
  if (!catalogDish || !catalogDish.rarity || catalogDish.rarity === 'common') return null
  return RARITY_CONFIG[catalogDish.rarity]
})

onMounted(async () => {
  if (!user.id) {
    router.push('/login')
    return
  }

  // Load from localStorage first (fast, works offline)
  const localSave = loadFromLocal(user.id)
  let backendSave = null

  try {
    const res = await gameApi.load(user.id)
    if (res.data.code === 200) {
      backendSave = res.data.data
    }
  } catch (e) {
    // backend unavailable
  }

  // Use whichever save is newer
  const useLocal = localSave && (!backendSave || localSave.savedAt > new Date(backendSave.updateTime || 0).getTime())
  if (useLocal && localSave) {
    gameState.coins = localSave.coins
    gameState.level = localSave.level
    gameState.customersServed = localSave.customersServed
    if (localSave.dishes && localSave.dishes.length > 0) gameState.dishes = localSave.dishes
    if (localSave.seatCount) gameState.seatCount = localSave.seatCount
    if (localSave.staff && localSave.staff.length > 0) {
      gameState.staff = localSave.staff.map(s => Staff.fromSerialized(s))
      staffIdCounter = Math.max(...localSave.staff.map(s => s.id), 0)
    }
    if (localSave.billHistory) billHistory.value = localSave.billHistory
    if (localSave.decorations) gameState.decorations = localSave.decorations
    if (localSave.tablePositions) gameState.tablePositions = localSave.tablePositions
    if (localSave.researchData) gameState.researchData = localSave.researchData
    if (localSave.unlockedSuppliers) gameState.unlockedSuppliers = localSave.unlockedSuppliers
    if (localSave.supplierAssignments) gameState.supplierAssignments = localSave.supplierAssignments
    if (localSave.seasonEpoch) gameState.seasonEpoch = localSave.seasonEpoch
    if (localSave.combos) gameState.combos = localSave.combos
    if (localSave.unlockedComboTemplates) gameState.unlockedComboTemplates = localSave.unlockedComboTemplates
    if (localSave.ingredientStock) gameState.ingredientStock = localSave.ingredientStock
    if (localSave.positiveReviews) gameState.positiveReviews = localSave.positiveReviews
    if (localSave.totalReviews) gameState.totalReviews = localSave.totalReviews
    if (localSave.achievements) gameState.achievements = localSave.achievements
    if (localSave.totalEarned) gameState.totalEarned = localSave.totalEarned
    if (localSave.supplierPurchaseHistory) gameState.supplierPurchaseHistory = localSave.supplierPurchaseHistory
    if (localSave.eventsParticipated) gameState.eventsParticipated = localSave.eventsParticipated
  } else if (backendSave) {
    gameState.coins = backendSave.coins
    gameState.level = backendSave.level
    gameState.customersServed = backendSave.customersServed
    const savedDishes = JSON.parse(backendSave.dishes || '[]')
    if (savedDishes.length > 0) gameState.dishes = savedDishes
    if (backendSave.seatCount) gameState.seatCount = backendSave.seatCount
    if (backendSave.staffData) {
      try {
        const staffArr = JSON.parse(backendSave.staffData)
        gameState.staff = staffArr.map(s => Staff.fromSerialized(s))
        staffIdCounter = Math.max(...staffArr.map(s => s.id), 0)
      } catch (e) {}
    }
    if (backendSave.billHistory) {
      try { billHistory.value = JSON.parse(backendSave.billHistory) } catch (e) {}
    }
    if (backendSave.decorationData) {
      try {
        const decoData = JSON.parse(backendSave.decorationData)
        if (decoData.decorations) gameState.decorations = decoData.decorations
        if (decoData.tablePositions) gameState.tablePositions = decoData.tablePositions
      } catch (e) {}
    }
  }

  // Auto-save to localStorage every 30 seconds
  autoSaveInterval = setInterval(() => {
    saveToLocal(user.id, gameState, billHistory.value)
  }, 30000)

  // Save on page unload
  window.addEventListener('beforeunload', handleBeforeUnload)

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

  // Initialize research manager from saved data
  researchManager.value = ResearchManager.fromSerialized(gameState.researchData)
  checkResearchCompletion()

  // Check research progress every second
  researchCheckInterval = setInterval(() => {
    checkResearchCompletion()
  }, 1000)

  // Check season changes every 10 seconds
  lastSeason = currentSeason.value
  seasonCheckInterval = setInterval(() => {
    const now = currentSeason.value
    if (now !== lastSeason) {
      const { names, emojis } = { names: { spring: '春季', summer: '夏季', autumn: '秋季', winter: '冬季' }, emojis: { spring: '🌸', summer: '☀️', autumn: '🍂', winter: '❄️' } }
      showToast(emojis[now], `季节更替！现在是${names[now]}`, 'info')
      lastSeason = now
      canvasRef.value?.updateSeasonData(now)
    }
  }, 10000)

  // Tick season timer every second for live countdown
  seasonTickInterval = setInterval(() => {
    seasonTimer.value = new SeasonTimer(gameState.seasonEpoch)
    updateActiveOrders()
    checkEventParticipation()
  }, 1000)

  // Push initial data to engine
  setTimeout(() => {
    canvasRef.value?.updateSeasonData(currentSeason.value)
    canvasRef.value?.updateQualityMap(qualityMap.value)
    canvasRef.value?.updateCombos(gameState.combos)
    canvasRef.value?.updateRestaurantLevel(gameState.level)
  }, 100)
})

onUnmounted(() => {
  if (salaryInterval) clearInterval(salaryInterval)
  if (autoSaveInterval) clearInterval(autoSaveInterval)
  if (researchCheckInterval) clearInterval(researchCheckInterval)
  if (seasonCheckInterval) clearInterval(seasonCheckInterval)
  if (seasonTickInterval) clearInterval(seasonTickInterval)
  window.removeEventListener('beforeunload', handleBeforeUnload)
})

function handleBeforeUnload() {
  saveToLocal(user.id, gameState, billHistory.value)
}

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
    gameState.totalReviews++
    if (customer.reviewResult && customer.reviewResult.isPositive) {
      gameState.positiveReviews++
    }
    showToast('🍽️', `为${customer.name}上菜成功！`, 'success')
  } else if (customer.state === 'waiting_to_pay') {
    checkoutPanel.customer = customer
    checkoutPanel.visible = true
  }
}

function handleConfirmOrder(dish) {
  if (orderPanel.customer) {
    const chosenDish = dish || orderPanel.customer.wantedDish
    const customer = orderPanel.customer
    if (customer.isComboOrder) {
      for (const comboDish of customer.comboDishes) {
        if (!consumeDishIngredients(comboDish)) {
          return
        }
      }
    } else {
      if (!consumeDishIngredients(chosenDish)) {
        return
      }
    }
    canvasRef.value.confirmOrder(customer, chosenDish)
    orderPanel.visible = false
    showToast('📝', `${customer.name}点了${chosenDish.name}`, 'info')
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
  updateActiveOrders()
}

function earnCoins(amount) {
  gameState.coins += amount
  gameState.totalEarned += amount
  checkAchievements()
}

function serveCustomer() {
  gameState.customersServed++
  if (gameState.customersServed % 10 === 0) {
    gameState.level++
    showToast('🎉', `恭喜！餐厅升级到 Lv.${gameState.level}！`, 'levelup')
  }
  checkAchievements()
}

function unlockDish(dish) {
  if (gameState.coins >= dish.unlockCost) {
    gameState.coins -= dish.unlockCost
    gameState.dishes.push({ ...dish, unlockCost: undefined })
    showToast('🆕', `解锁新菜品: ${dish.emoji} ${dish.name}！`, 'success')
    checkAchievements()
  } else {
    showToast('❌', '金币不足！', 'error')
  }
}

function startResearch(dishId) {
  const check = researchManager.value.canStartResearch(dishId, gameState.coins)
  if (!check.ok) {
    showToast('❌', check.reason, 'error')
    return
  }
  const dish = DISH_CATALOG[dishId]
  gameState.coins -= dish.research.cost
  researchManager.value.startResearch(dishId)
  gameState.researchData = researchManager.value.serialize()
  showToast('🔬', `开始研发「${dish.name}」！`, 'info')
}

function checkResearchCompletion() {
  const progress = researchManager.value.getProgress()
  if (!progress || !progress.isComplete) return

  const result = researchManager.value.completeResearch()
  if (!result) return

  const dish = DISH_CATALOG[result.dishId]
  if (result.success) {
    gameState.dishes.push({
      id: dish.id, name: dish.name, price: dish.price,
      cookTime: dish.cookTime, emoji: dish.emoji
    })
    showToast('🎉', `研发成功！解锁新菜品「${dish.emoji} ${dish.name}」！`, 'success')
  } else {
    const fails = researchManager.value.getFailCount(result.dishId)
    showToast('💥', `研发失败...再接再厉！(已失败${fails}次，下次+${Math.min(15, fails * 5)}%)`, 'error')
  }
  gameState.researchData = researchManager.value.serialize()
}

function unlockSupplier(supplierId) {
  const supplier = SUPPLIER_CATALOG.find(s => s.id === supplierId)
  if (!supplier) return
  if (gameState.unlockedSuppliers.includes(supplierId)) {
    showToast('❌', '已解锁该供应商', 'error')
    return
  }
  if (gameState.coins < supplier.unlockCost) {
    showToast('❌', '金币不足！', 'error')
    return
  }
  gameState.coins -= supplier.unlockCost
  gameState.unlockedSuppliers.push(supplierId)
  showToast('🤝', `成功签约「${supplier.emoji} ${supplier.name}」！`, 'success')
}

function setSupplierForDish(dishId, supplierId) {
  gameState.supplierAssignments[dishId] = supplierId
}

function unlockComboTemplate(templateId) {
  const template = COMBO_TEMPLATES.find(t => t.id === templateId)
  if (!template) return
  if (gameState.unlockedComboTemplates.includes(templateId)) {
    showToast('❌', '已解锁该套餐模板', 'error')
    return
  }
  if (gameState.coins < template.unlockCost) {
    showToast('❌', '金币不足！', 'error')
    return
  }
  gameState.coins -= template.unlockCost
  gameState.unlockedComboTemplates.push(templateId)
  showToast('🍱', `解锁套餐模板「${template.name}」！`, 'success')
}

function createCombo(templateId, dishIds, name) {
  if (!validateCombo(templateId, dishIds)) {
    showToast('❌', '套餐菜品搭配不正确', 'error')
    return
  }
  const template = COMBO_TEMPLATES.find(t => t.id === templateId)
  gameState.combos.push({ templateId, dishIds, name: name || template.name })
  showToast('🎊', `创建套餐「${name || template.name}」成功！`, 'success')
  checkAchievements()
}

function removeCombo(index) {
  gameState.combos.splice(index, 1)
  showToast('🗑️', '已移除套餐', 'info')
}

function buyIngredient(ingredientId, quantity, supplierId) {
  const supplier = getSupplierById(supplierId || 'market_basic')
  const loyaltyTier = getSupplierLoyaltyTier(gameState.supplierPurchaseHistory[supplier.id] || 0)
  const cost = getBuyPriceWithLoyalty(ingredientId, quantity, supplier, loyaltyTier.discount)
  if (gameState.coins < cost) {
    showToast('❌', '金币不足！', 'error')
    return
  }
  gameState.coins -= cost
  const ingredient = INGREDIENT_CATALOG[ingredientId]
  gameState.ingredientStock[ingredientId] = (gameState.ingredientStock[ingredientId] || 0) + quantity

  if (!gameState.supplierPurchaseHistory[supplier.id]) {
    gameState.supplierPurchaseHistory[supplier.id] = 0
  }
  const oldTier = getSupplierLoyaltyTier(gameState.supplierPurchaseHistory[supplier.id])
  gameState.supplierPurchaseHistory[supplier.id] += quantity
  const newTier = getSupplierLoyaltyTier(gameState.supplierPurchaseHistory[supplier.id])
  if (newTier.level > oldTier.level) {
    showToast(newTier.emoji, `供应商关系升级！${newTier.name} (折扣${Math.round(newTier.discount * 100)}%)`, 'success')
  }

  showToast('🛒', `购入 ${ingredient.emoji}${ingredient.name} ×${quantity}`, 'success')
  checkAchievements()
}

function consumeDishIngredients(dish) {
  const catalogDish = DISH_CATALOG[dish.id]
  if (!catalogDish) return true
  if (!canServeDish(catalogDish, gameState.ingredientStock)) {
    showToast('⚠️', `「${dish.name}」食材不足，无法上菜！`, 'error')
    return false
  }
  consumeIngredients(catalogDish, gameState.ingredientStock)
  return true
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

function buyDecoration(item) {
  if (gameState.coins < item.cost) {
    showToast('💸', `金币不足！需要 ${item.cost} 金币，还差 ${item.cost - gameState.coins} 金币`, 'error')
    return
  }
  gameState.coins -= item.cost
  gameState.decorations.owned.push(item.id)

  const bonusText = item.bonus.type === 'tip_multiplier'
    ? ` (小费+${Math.round(item.bonus.value * 100)}%)`
    : item.bonus.type === 'patience_boost'
      ? ` (耐心+${Math.round(item.bonus.value * 100)}%)`
      : ''

  if (item.category === 'wallpaper') {
    gameState.decorations.activeWallpaper = item.id
    showToast('🎨', `已购买并使用「${item.name}」${bonusText}`, 'success')
  } else if (item.category === 'floor') {
    gameState.decorations.activeFloor = item.id
    showToast('🏠', `已购买并使用「${item.name}」${bonusText}`, 'success')
  } else {
    gameState.decorations.placed.push({
      id: item.id,
      x: item.defaultPos?.x || 0.5,
      y: item.defaultPos?.y || 0.5
    })
    showToast('🎉', `已购买「${item.name}」${bonusText}`, 'success')
  }
}

function equipDecoration(item) {
  if (item.category === 'wallpaper') {
    gameState.decorations.activeWallpaper = item.id
    showToast('🎨', `已切换墙纸为「${item.name}」`, 'info')
  } else if (item.category === 'floor') {
    gameState.decorations.activeFloor = item.id
    showToast('🏠', `已切换地板为「${item.name}」`, 'info')
  }
}

function toggleEditMode() {
  editMode.value = !editMode.value
  canvasRef.value?.setEditMode(editMode.value)
  if (editMode.value) {
    showToast('✏️', '进入编辑模式，拖动家具调整位置', 'info')
  }
}

function handlePositionChanged(data) {
  if (data.type === 'table') {
    if (!gameState.tablePositions) {
      const w = canvasRef.value?.getCanvasSize?.()?.w || 800
      const h = canvasRef.value?.getCanvasSize?.()?.h || 600
      gameState.tablePositions = []
      for (let i = 0; i < gameState.seatCount; i++) {
        gameState.tablePositions.push(null)
      }
    }
    gameState.tablePositions[data.index] = { x: data.x, y: data.y }
  } else if (data.type === 'decoration') {
    const placed = gameState.decorations.placed[data.index]
    if (placed) {
      placed.x = data.x
      placed.y = data.y
    }
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
    checkAchievements()
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
      customersServed: gameState.customersServed,
      seatCount: gameState.seatCount,
      staffData: JSON.stringify(gameState.staff.map(s => ({
        id: s.id, type: s.type, level: s.level,
        proficiency: s.proficiency, name: s.name, totalServed: s.totalServed
      }))),
      billHistory: JSON.stringify(billHistory.value.slice(0, 50)),
      decorationData: JSON.stringify({
        decorations: gameState.decorations,
        tablePositions: gameState.tablePositions
      }),
      dishSystemData: JSON.stringify({
        researchData: gameState.researchData,
        unlockedSuppliers: gameState.unlockedSuppliers,
        supplierAssignments: gameState.supplierAssignments,
        seasonEpoch: gameState.seasonEpoch,
        combos: gameState.combos,
        unlockedComboTemplates: gameState.unlockedComboTemplates,
        ingredientStock: gameState.ingredientStock
      })
    })
    saveToLocal(user.id, gameState, billHistory.value)
    showToast('💾', '存档成功！', 'success')
  } catch (e) {
    saveToLocal(user.id, gameState, billHistory.value)
    showToast('💾', '本地存档成功（服务器不可用）', 'success')
  }
}

function checkAchievements() {
  for (const def of ACHIEVEMENT_DEFINITIONS) {
    if (gameState.achievements.includes(def.id)) continue
    if (def.condition(gameState)) {
      gameState.achievements.push(def.id)
      gameState.coins += def.reward.coins
      showToast(def.emoji, `成就解锁「${def.name}」! +${def.reward.coins}金币`, 'achievement')
    }
  }
}

function updateActiveOrders() {
  const engine = canvasRef.value?.getEngine?.()
  if (!engine) return
  const customers = engine.customers || []
  activeOrders.value = customers
    .filter(c => c.state !== 'walking_in' && c.state !== 'leaving' && c.orderedDish)
    .map(c => ({
      id: c.id,
      customerName: c.name,
      customerEmoji: c.emoji,
      dish: c.orderedDish,
      isCombo: c.isComboOrder,
      comboName: c.orderedCombo?.name,
      status: c.state === 'cooking' ? 'cooking' : c.state === 'ready_to_serve' ? 'ready' : c.state === 'eating' ? 'eating' : c.state === 'waiting_to_pay' ? 'served' : 'pending',
      patience: c.patience
    }))
}

function checkEventParticipation() {
  const event = activeEvent.value
  if (event && gameState.eventsParticipated === 0) {
    gameState.eventsParticipated = 1
    checkAchievements()
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

.checkout-review {
  margin-left: auto;
  font-size: 11px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 8px;
}

.checkout-review.review-positive {
  background: rgba(46, 204, 113, 0.15);
  color: #27ae60;
}

.checkout-review.review-negative {
  background: rgba(231, 76, 60, 0.15);
  color: #e74c3c;
}

.rarity-row {
  color: #9b59b6;
}

.rarity-tag {
  font-weight: 700;
  font-size: 12px;
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

.combo-bonus-row {
  color: #e67e22;
}

.combo-bonus-tag {
  font-weight: 600;
  color: #e67e22;
  background: #fef3e2;
  padding: 1px 6px;
  border-radius: 8px;
  font-size: 0.85em;
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

.toast-item.achievement {
  background: linear-gradient(135deg, rgba(241, 196, 15, 0.95), rgba(243, 156, 18, 0.9));
  animation: achievePulse 0.6s ease;
  box-shadow: 0 4px 20px rgba(241, 196, 15, 0.4);
}

@keyframes achievePulse {
  0%, 100% { transform: scale(1); }
  30% { transform: scale(1.08); }
  60% { transform: scale(1.03); }
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
.coin-inline {
  display: inline-block;
  vertical-align: middle;
  margin-right: 2px;
}

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

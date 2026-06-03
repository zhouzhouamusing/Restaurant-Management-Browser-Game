<template>
  <div class="dish-manager">
    <h3 class="panel-title">🍽️ 菜品管理</h3>

    <!-- Sub-tabs -->
    <div class="sub-tabs">
      <button
        v-for="tab in subTabs"
        :key="tab.id"
        class="sub-tab-btn"
        :class="{ active: activeSubTab === tab.id }"
        @click="activeSubTab = tab.id"
      >
        <span class="sub-tab-icon">{{ tab.icon }}</span>
        <span class="sub-tab-label">{{ tab.label }}</span>
      </button>
    </div>

    <!-- Menu Tab -->
    <div v-if="activeSubTab === 'menu'" class="tab-content">
      <!-- Season indicator -->
      <div class="season-bar">
        <div class="season-info">
          <span class="season-emoji">{{ seasonEmoji }}</span>
          <span class="season-name">{{ seasonName }}</span>
          <span class="season-timer">{{ seasonTimeLeft }}</span>
        </div>
        <div class="season-progress">
          <div class="season-progress-fill" :style="{ width: (seasonProgress * 100) + '%', background: seasonColor }"></div>
        </div>
      </div>

      <!-- Active dishes -->
      <div class="section-label">✅ 当季菜品</div>
      <div class="dish-list">
        <TransitionGroup name="dish">
          <div
            v-for="dish in seasonalActiveDishes"
            :key="dish.id"
            class="dish-card active"
          >
            <span class="dish-emoji">{{ dish.emoji || '🍲' }}</span>
            <div class="dish-detail">
              <div class="dish-name-row">
                <span class="dish-name">{{ dish.name }}</span>
                <span v-if="getRarityInfo(dish.id)" class="rarity-badge" :style="{ color: getRarityInfo(dish.id).color, borderColor: getRarityInfo(dish.id).color + '44' }">{{ getRarityInfo(dish.id).emoji }} {{ getRarityInfo(dish.id).name }}</span>
              </div>
              <div class="dish-stats">
                <span class="stat price">💰{{ dish.price }}</span>
                <span class="stat time">⏱️{{ dish.cookTime }}s</span>
                <span v-if="getDishQuality(dish.id)" class="stat quality" :class="qualityClass(dish.id)">⭐{{ getDishQuality(dish.id) }}</span>
                <span class="stat review-stat">👍{{ getReviewRate(dish.id) }}%</span>
              </div>
            </div>
            <div class="dish-badges">
              <span v-if="isSeasonalDish(dish.id)" class="badge seasonal">{{ getSeasonBadge(dish.id) }}</span>
              <span v-if="getCategoryBadge(dish.id)" class="badge category">{{ getCategoryBadge(dish.id) }}</span>
            </div>
          </div>
        </TransitionGroup>
      </div>

      <!-- Off-season dishes -->
      <div v-if="offSeasonDishes.length > 0" class="section-label">🚫 非当季</div>
      <div class="dish-list">
        <div
          v-for="dish in offSeasonDishes"
          :key="dish.id"
          class="dish-card off-season"
        >
          <span class="dish-emoji off-season-emoji">{{ dish.emoji || '🍲' }}</span>
          <div class="dish-detail">
            <span class="dish-name">{{ dish.name }}</span>
            <div class="dish-stats">
              <span class="stat">{{ getSeasonNames(dish.id) }}</span>
            </div>
          </div>
          <span class="badge off-season-badge">下季回归</span>
        </div>
      </div>
    </div>

    <!-- R&D Tab -->
    <div v-if="activeSubTab === 'research'" class="tab-content">
      <!-- Active research -->
      <div v-if="researchProgress" class="research-active">
        <div class="research-header">🔬 研发进行中</div>
        <div class="research-item-active">
          <span class="research-emoji">{{ getResearchDish(researchProgress.dishId)?.emoji }}</span>
          <div class="research-info">
            <span class="research-name">{{ getResearchDish(researchProgress.dishId)?.name }}</span>
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: (researchProgress.progress * 100) + '%' }">
                <span class="progress-text">{{ Math.floor(researchProgress.progress * 100) }}%</span>
              </div>
            </div>
            <span class="research-time">剩余 {{ formatTime(researchProgress.timeRemaining) }}</span>
          </div>
        </div>
      </div>

      <!-- Researchable dishes -->
      <div class="section-label">📋 可研发菜品</div>
      <div class="dish-list">
        <div
          v-for="dish in researchableDishes"
          :key="dish.id"
          class="dish-card research"
          :class="{ affordable: coins >= dish.research.cost, researched: isResearched(dish.id) }"
        >
          <span class="dish-emoji" :class="{ 'locked-emoji': !isResearched(dish.id) }">{{ dish.emoji }}</span>
          <div class="dish-detail">
            <div class="dish-name-row">
              <span class="dish-name">{{ dish.name }}</span>
              <span v-if="getRarityInfo(dish.id)" class="rarity-badge" :style="{ color: getRarityInfo(dish.id).color, borderColor: getRarityInfo(dish.id).color + '44' }">{{ getRarityInfo(dish.id).emoji }}</span>
            </div>
            <div class="dish-stats">
              <span class="stat price">💰{{ dish.price }}</span>
              <span class="stat">{{ getCategoryLabel(dish.category) }}</span>
              <span v-if="dish.seasons.length < 4" class="stat seasonal-stat">{{ dish.seasons.map(s => seasonEmojis[s]).join('') }}</span>
            </div>
            <div class="research-stats">
              <span class="stat cost">🪙{{ dish.research.cost }}</span>
              <span class="stat rate" :class="rateClass(dish.id)">🎯{{ Math.floor(getEffectiveRate(dish.id) * 100) }}%</span>
              <span v-if="getFailCount(dish.id) > 0" class="stat fails">❌{{ getFailCount(dish.id) }}</span>
            </div>
          </div>
          <div v-if="isResearched(dish.id)" class="researched-badge">✅</div>
          <button
            v-else-if="!researchProgress && coins >= dish.research.cost"
            class="research-btn"
            @click="$emit('start-research', dish.id)"
          >
            🔬 研发
          </button>
          <span v-else-if="!researchProgress" class="cost-badge insufficient">🪙{{ dish.research.cost }}</span>
        </div>
      </div>
    </div>

    <!-- Ingredients Tab -->
    <div v-if="activeSubTab === 'ingredients'" class="tab-content">
      <!-- Suppliers -->
      <div class="section-label">🚚 供应商</div>
      <div class="supplier-list">
        <div
          v-for="supplier in allSuppliers"
          :key="supplier.id"
          class="supplier-card"
          :class="{ unlocked: isSupplierUnlocked(supplier.id), locked: !isSupplierUnlocked(supplier.id) }"
        >
          <span class="supplier-emoji">{{ supplier.emoji }}</span>
          <div class="supplier-info">
            <span class="supplier-name">{{ supplier.name }}</span>
            <span class="supplier-desc">{{ supplier.description }}</span>
            <div class="supplier-stats">
              <span class="stat">品质+{{ supplier.qualityBonus }}</span>
              <span class="stat">价格×{{ supplier.priceMultiplier }}</span>
            </div>
          </div>
          <button
            v-if="!isSupplierUnlocked(supplier.id) && coins >= supplier.unlockCost"
            class="unlock-btn"
            @click="$emit('unlock-supplier', supplier.id)"
          >
            🪙{{ supplier.unlockCost }}
          </button>
          <span v-else-if="!isSupplierUnlocked(supplier.id)" class="cost-badge insufficient">🔒 {{ supplier.unlockCost }}</span>
          <span v-else class="badge unlocked-badge">✓</span>
        </div>
      </div>

      <!-- Ingredient stock -->
      <div class="section-label">📦 食材库存</div>
      <div class="ingredient-grid">
        <div
          v-for="ing in allIngredients"
          :key="ing.id"
          class="ingredient-item"
          :class="{ 'low-stock': getStock(ing.id) < 5, 'no-stock': getStock(ing.id) === 0 }"
        >
          <span class="ing-emoji">{{ ing.emoji }}</span>
          <div class="ing-info">
            <span class="ing-name">{{ ing.name }}</span>
            <span class="ing-stock">×{{ getStock(ing.id) }}</span>
          </div>
          <button class="buy-btn" @click="$emit('buy-ingredient', ing.id, 10, activeSupplierForBuy)">
            🪙{{ getBuyCost(ing.id, 10) }} ×10
          </button>
        </div>
      </div>

      <!-- Per-dish supplier assignment -->
      <div class="section-label">🍽️ 食材配置</div>
      <div class="dish-list">
        <div
          v-for="dish in dishes"
          :key="dish.id"
          class="dish-card ingredient-card"
        >
          <span class="dish-emoji">{{ dish.emoji }}</span>
          <div class="dish-detail">
            <span class="dish-name">{{ dish.name }}</span>
            <div class="dish-ingredients-needed">
              <span v-for="ing in getDishIngredients(dish.id)" :key="ing.id" class="ing-need-chip" :class="{ 'ing-short': getStock(ing.id) < ing.quantity }">
                {{ ing.emoji }}×{{ ing.quantity }}
              </span>
            </div>
            <div class="quality-bar-container">
              <div class="quality-bar">
                <div class="quality-fill" :style="{ width: getDishQuality(dish.id) + '%' }" :class="qualityClass(dish.id)"></div>
              </div>
              <span class="quality-number">{{ getDishQuality(dish.id) }}</span>
            </div>
          </div>
          <select
            class="supplier-select"
            :value="getAssignedSupplier(dish.id)"
            @change="$emit('set-supplier', dish.id, $event.target.value)"
          >
            <option
              v-for="s in unlockedSupplierList"
              :key="s.id"
              :value="s.id"
            >{{ s.emoji }} {{ s.name }}</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Combos Tab -->
    <div v-if="activeSubTab === 'combos'" class="tab-content">
      <!-- Existing combos -->
      <div v-if="combos.length > 0" class="section-label">🍱 已创建套餐</div>
      <div class="combo-list">
        <div v-for="(combo, index) in combos" :key="index" class="combo-card">
          <div class="combo-header">
            <span class="combo-name">{{ combo.name }}</span>
            <span class="combo-bonus">+{{ Math.floor((getComboMultiplier(combo.templateId) - 1) * 100) }}%</span>
          </div>
          <div class="combo-dishes">
            <span v-for="dishId in combo.dishIds" :key="dishId" class="combo-dish-chip">
              {{ getDishEmoji(dishId) }} {{ getDishName(dishId) }}
            </span>
          </div>
          <button class="remove-combo-btn" @click="$emit('remove-combo', index)">✕</button>
        </div>
      </div>

      <!-- Combo templates -->
      <div class="section-label">📦 套餐模板</div>
      <div class="template-list">
        <div
          v-for="template in comboTemplates"
          :key="template.id"
          class="template-card"
          :class="{ unlocked: isTemplateUnlocked(template.id) }"
        >
          <div class="template-header">
            <span class="template-emoji">{{ template.emoji }}</span>
            <span class="template-name">{{ template.name }}</span>
            <span class="template-bonus">+{{ Math.floor((template.bonusMultiplier - 1) * 100) }}%</span>
          </div>
          <div class="template-slots">
            <span v-for="(slot, i) in template.slots" :key="i" class="slot-chip">{{ getCategoryLabel(slot) }}</span>
          </div>
          <button
            v-if="!isTemplateUnlocked(template.id) && coins >= template.unlockCost"
            class="unlock-btn"
            @click="$emit('unlock-combo-template', template.id)"
          >
            🪙{{ template.unlockCost }} 解锁
          </button>
          <span v-else-if="!isTemplateUnlocked(template.id)" class="cost-badge insufficient">🔒 {{ template.unlockCost }}</span>
          <button
            v-else
            class="create-combo-btn"
            @click="openComboBuilder(template)"
          >
            ➕ 创建
          </button>
        </div>
      </div>

      <!-- Combo builder modal -->
      <div v-if="comboBuilder.visible" class="combo-builder-overlay">
        <div class="combo-builder">
          <div class="builder-header">
            <span>🍱 创建{{ comboBuilder.template?.name }}</span>
            <button class="close-btn" @click="comboBuilder.visible = false">✕</button>
          </div>
          <div class="builder-slots">
            <div
              v-for="(slot, i) in comboBuilder.template?.slots || []"
              :key="i"
              class="builder-slot"
            >
              <span class="slot-label">{{ getCategoryLabel(slot) }}</span>
              <select
                class="slot-select"
                v-model="comboBuilder.selections[i]"
              >
                <option :value="null">选择菜品...</option>
                <option
                  v-for="d in getDishesByCategory(slot)"
                  :key="d.id"
                  :value="d.id"
                >{{ d.emoji }} {{ d.name }}</option>
              </select>
            </div>
          </div>
          <button
            class="confirm-combo-btn"
            :disabled="!isComboValid"
            @click="confirmCombo"
          >
            ✅ 确认创建
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { DISH_CATALOG, SUPPLIER_CATALOG, COMBO_TEMPLATES, SEASON_CONFIG, INGREDIENT_CATALOG, RARITY_CONFIG, isDishAvailableInSeason, isDishSeasonal, getCategoryName, getSupplierById, getBuyPrice, getPositiveReviewRate } from '../game/dishes.js'

const props = defineProps({
  dishes: { type: Array, default: () => [] },
  coins: { type: Number, default: 0 },
  researchManager: { type: Object, default: null },
  seasonTimer: { type: Object, default: null },
  currentSeason: { type: String, default: 'spring' },
  qualityMap: { type: Object, default: () => ({}) },
  unlockedSuppliers: { type: Array, default: () => ['market_basic'] },
  supplierAssignments: { type: Object, default: () => ({}) },
  combos: { type: Array, default: () => [] },
  unlockedComboTemplates: { type: Array, default: () => [] },
  restaurantLevel: { type: Number, default: 1 },
  ingredientStock: { type: Object, default: () => ({}) }
})

const emit = defineEmits([
  'unlock-dish', 'start-research', 'unlock-supplier',
  'set-supplier', 'unlock-combo-template', 'create-combo', 'remove-combo',
  'buy-ingredient'
])

const activeSubTab = ref('menu')
const subTabs = [
  { id: 'menu', icon: '📋', label: '菜单' },
  { id: 'research', icon: '🔬', label: '研发' },
  { id: 'ingredients', icon: '🥬', label: '食材' },
  { id: 'combos', icon: '🍱', label: '套餐' }
]

const seasonEmojis = SEASON_CONFIG.emojis

const comboBuilder = reactive({
  visible: false,
  template: null,
  selections: []
})

// Season display
const seasonEmoji = computed(() => props.seasonTimer?.getSeasonEmoji?.() || '🌸')
const seasonName = computed(() => props.seasonTimer?.getSeasonName?.() || '春季')
const seasonTimeLeft = computed(() => props.seasonTimer?.getTimeRemainingFormatted?.() || '--:--')
const seasonProgress = computed(() => props.seasonTimer?.getProgress?.() || 0)
const seasonColor = computed(() => props.seasonTimer?.getSeasonColor?.() || '#a8e6cf')

// Active dishes split by season
const seasonalActiveDishes = computed(() => {
  return props.dishes.filter(d => {
    const catalog = DISH_CATALOG[d.id]
    if (!catalog) return true
    return isDishAvailableInSeason(catalog, props.currentSeason)
  })
})

const offSeasonDishes = computed(() => {
  return props.dishes.filter(d => {
    const catalog = DISH_CATALOG[d.id]
    if (!catalog) return false
    return !isDishAvailableInSeason(catalog, props.currentSeason)
  })
})

// Research
const researchProgress = computed(() => props.researchManager?.getProgress?.() || null)
const researchableDishes = computed(() => {
  return Object.values(DISH_CATALOG).filter(d => d.research !== null)
})

function getResearchDish(dishId) { return DISH_CATALOG[dishId] }
function isResearched(dishId) { return props.researchManager?.isResearched?.(dishId) || false }
function getEffectiveRate(dishId) { return props.researchManager?.getEffectiveSuccessRate?.(dishId) || DISH_CATALOG[dishId]?.research?.successRate || 0 }
function getFailCount(dishId) { return props.researchManager?.getFailCount?.(dishId) || 0 }

function rateClass(dishId) {
  const rate = getEffectiveRate(dishId)
  if (rate >= 0.85) return 'rate-high'
  if (rate >= 0.70) return 'rate-mid'
  return 'rate-low'
}

// Quality & suppliers
const allSuppliers = SUPPLIER_CATALOG
const unlockedSupplierList = computed(() => {
  return SUPPLIER_CATALOG.filter(s => props.unlockedSuppliers.includes(s.id))
})

function isSupplierUnlocked(id) { return props.unlockedSuppliers.includes(id) }
function getAssignedSupplier(dishId) { return props.supplierAssignments[dishId] || 'market_basic' }
function getDishQuality(dishId) { return props.qualityMap[dishId] || 50 }

function getRarityInfo(dishId) {
  const d = DISH_CATALOG[dishId]
  if (!d || !d.rarity || d.rarity === 'common') return null
  return RARITY_CONFIG[d.rarity]
}

function getReviewRate(dishId) {
  const quality = getDishQuality(dishId)
  return Math.round(getPositiveReviewRate(quality) * 100)
}

// Ingredient stock helpers
const allIngredients = Object.values(INGREDIENT_CATALOG)
const activeSupplierForBuy = computed(() => {
  const unlocked = props.unlockedSuppliers
  return unlocked[unlocked.length - 1] || 'market_basic'
})

function getStock(ingredientId) { return props.ingredientStock[ingredientId] || 0 }
function getBuyCost(ingredientId, qty) {
  const supplier = getSupplierById(activeSupplierForBuy.value)
  return getBuyPrice(ingredientId, qty, supplier)
}
function getDishIngredients(dishId) {
  const dish = DISH_CATALOG[dishId]
  if (!dish || !dish.ingredients) return []
  return dish.ingredients.map(ing => ({
    ...INGREDIENT_CATALOG[ing.ingredientId],
    quantity: ing.quantity
  }))
}

function qualityClass(dishId) {
  const q = getDishQuality(dishId)
  if (q >= 80) return 'quality-high'
  if (q >= 60) return 'quality-mid'
  return 'quality-low'
}

// Dish helpers
function isSeasonalDish(dishId) {
  const d = DISH_CATALOG[dishId]
  return d && isDishSeasonal(d)
}

function getSeasonBadge(dishId) {
  const d = DISH_CATALOG[dishId]
  if (!d) return ''
  return d.seasons.map(s => SEASON_CONFIG.emojis[s]).join('')
}

function getSeasonNames(dishId) {
  const d = DISH_CATALOG[dishId]
  if (!d) return ''
  return d.seasons.map(s => SEASON_CONFIG.names[s]).join('/')
}

function getCategoryBadge(dishId) {
  const d = DISH_CATALOG[dishId]
  if (!d) return ''
  const labels = { main: '主菜', drink: '饮料', dessert: '甜点' }
  return labels[d.category] || ''
}

function getCategoryLabel(category) {
  return getCategoryName(category)
}

function getDishEmoji(dishId) { return DISH_CATALOG[dishId]?.emoji || '🍽️' }
function getDishName(dishId) { return DISH_CATALOG[dishId]?.name || '未知' }

// Combos
const comboTemplates = COMBO_TEMPLATES

function isTemplateUnlocked(templateId) { return props.unlockedComboTemplates.includes(templateId) }
function getComboMultiplier(templateId) {
  const t = COMBO_TEMPLATES.find(x => x.id === templateId)
  return t?.bonusMultiplier || 1
}

function getDishesByCategory(category) {
  return props.dishes.filter(d => {
    const catalog = DISH_CATALOG[d.id]
    return catalog && catalog.category === category
  })
}

function openComboBuilder(template) {
  comboBuilder.template = template
  comboBuilder.selections = new Array(template.slots.length).fill(null)
  comboBuilder.visible = true
}

const isComboValid = computed(() => {
  if (!comboBuilder.template) return false
  return comboBuilder.selections.every(s => s !== null)
})

function confirmCombo() {
  if (!isComboValid.value) return
  const dishes = comboBuilder.selections.map(id => DISH_CATALOG[id])
  const name = dishes.map(d => d.name).join('+')
  emit('create-combo', comboBuilder.template.id, comboBuilder.selections, name)
  comboBuilder.visible = false
}

function formatTime(ms) {
  const sec = Math.ceil(ms / 1000)
  if (sec >= 60) return `${Math.floor(sec / 60)}分${sec % 60}秒`
  return `${sec}秒`
}
</script>

<style scoped>
.dish-manager {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 16px;
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.panel-title {
  color: #f1c40f;
  font-size: 15px;
  margin-bottom: 12px;
  text-align: center;
  font-family: 'ZCOOL KuaiLe', 'Nunito', cursive;
}

/* Sub-tabs */
.sub-tabs {
  display: flex;
  gap: 4px;
  margin-bottom: 12px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 10px;
  padding: 3px;
}

.sub-tab-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 3px;
  padding: 6px 4px;
  border: none;
  background: transparent;
  border-radius: 8px;
  cursor: pointer;
  color: #95a5a6;
  font-size: 10px;
  transition: all 0.2s;
}

.sub-tab-btn.active {
  background: linear-gradient(135deg, rgba(241, 196, 15, 0.2), rgba(243, 156, 18, 0.15));
  color: #f1c40f;
  box-shadow: 0 2px 8px rgba(241, 196, 15, 0.15);
}

.sub-tab-btn:hover:not(.active) {
  background: rgba(255, 255, 255, 0.05);
  color: #bdc3c7;
}

.sub-tab-icon { font-size: 12px; }
.sub-tab-label { font-weight: 600; }

.tab-content {
  max-height: calc(100vh - 280px);
  overflow-y: auto;
  padding-right: 4px;
}

.tab-content::-webkit-scrollbar { width: 4px; }
.tab-content::-webkit-scrollbar-track { background: transparent; }
.tab-content::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.15); border-radius: 2px; }

/* Season bar */
.season-bar {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.02));
  border-radius: 10px;
  padding: 8px 12px;
  margin-bottom: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.season-info {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
}

.season-emoji { font-size: 16px; }
.season-name { color: #ecf0f1; font-size: 12px; font-weight: 600; }
.season-timer { color: #95a5a6; font-size: 10px; margin-left: auto; }

.season-progress {
  height: 3px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
}

.season-progress-fill {
  height: 100%;
  border-radius: 2px;
  transition: width 1s linear;
}

/* Section labels */
.section-label {
  color: #bdc3c7;
  font-size: 11px;
  margin: 12px 0 8px 4px;
  font-weight: 600;
}

/* Dish list */
.dish-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.dish-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 14px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.dish-card.active {
  background: linear-gradient(135deg, rgba(46, 204, 113, 0.08) 0%, rgba(39, 174, 96, 0.04) 100%);
  border: 1px solid rgba(46, 204, 113, 0.18);
}

.dish-card.active:hover {
  background: linear-gradient(135deg, rgba(46, 204, 113, 0.12) 0%, rgba(39, 174, 96, 0.08) 100%);
}

.dish-card.off-season {
  background: rgba(255, 255, 255, 0.02);
  border: 1px dashed rgba(255, 255, 255, 0.08);
  opacity: 0.6;
}

.dish-card.research {
  background: rgba(255, 255, 255, 0.02);
  border: 1.5px dashed rgba(255, 255, 255, 0.1);
}

.dish-card.research.affordable {
  border-color: rgba(52, 152, 219, 0.35);
  background: rgba(52, 152, 219, 0.05);
}

.dish-card.research.researched {
  border-color: rgba(46, 204, 113, 0.25);
  background: rgba(46, 204, 113, 0.05);
  opacity: 0.7;
}

.dish-card.ingredient-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.dish-emoji {
  font-size: 24px;
  min-width: 30px;
  text-align: center;
  transition: transform 0.3s;
}

.dish-card:hover .dish-emoji { transform: scale(1.15) rotate(-5deg); }
.locked-emoji { opacity: 0.6; filter: grayscale(30%); }
.off-season-emoji { filter: grayscale(60%); }

.dish-detail {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}

.dish-name {
  color: #ecf0f1;
  font-size: 12px;
  font-weight: 600;
  font-family: 'ZCOOL KuaiLe', 'Nunito', cursive;
}

.dish-name-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.rarity-badge {
  font-size: 9px;
  padding: 1px 5px;
  border-radius: 6px;
  border: 1px solid;
  font-weight: 700;
  white-space: nowrap;
}

.review-stat {
  color: #2ecc71 !important;
  font-weight: 600;
}

.dish-stats, .research-stats {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.stat {
  font-size: 10px;
  color: #95a5a6;
}

.stat.price { color: #2ecc71; }
.stat.cost { color: #f39c12; }
.stat.quality { font-weight: 600; }
.stat.quality.quality-high { color: #f1c40f; }
.stat.quality.quality-mid { color: #2ecc71; }
.stat.quality.quality-low { color: #95a5a6; }
.stat.rate-high { color: #2ecc71; }
.stat.rate-mid { color: #f39c12; }
.stat.rate-low { color: #e74c3c; }
.stat.fails { color: #e74c3c; }
.stat.seasonal-stat { color: #3498db; }

/* Badges */
.dish-badges {
  display: flex;
  flex-direction: column;
  gap: 3px;
  align-items: flex-end;
}

.badge {
  font-size: 9px;
  padding: 2px 6px;
  border-radius: 6px;
  font-weight: 600;
}

.badge.seasonal {
  background: rgba(52, 152, 219, 0.15);
  color: #3498db;
}

.badge.category {
  background: rgba(155, 89, 182, 0.15);
  color: #9b59b6;
}

.off-season-badge {
  font-size: 9px;
  padding: 2px 6px;
  border-radius: 6px;
  background: rgba(231, 76, 60, 0.15);
  color: #e74c3c;
}

.unlocked-badge {
  color: #2ecc71;
  font-weight: bold;
}

/* Research section */
.research-active {
  background: linear-gradient(135deg, rgba(52, 152, 219, 0.1), rgba(41, 128, 185, 0.05));
  border: 1px solid rgba(52, 152, 219, 0.25);
  border-radius: 12px;
  padding: 12px;
  margin-bottom: 12px;
}

.research-header {
  color: #3498db;
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 8px;
}

.research-item-active {
  display: flex;
  align-items: center;
  gap: 10px;
}

.research-emoji { font-size: 28px; }

.research-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.research-name {
  color: #ecf0f1;
  font-size: 12px;
  font-weight: 600;
}

.progress-bar {
  height: 16px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  overflow: hidden;
  position: relative;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3498db, #2ecc71);
  border-radius: 8px;
  transition: width 0.5s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 30px;
}

.progress-text {
  color: white;
  font-size: 9px;
  font-weight: 700;
  text-shadow: 0 1px 2px rgba(0,0,0,0.3);
}

.research-time {
  color: #95a5a6;
  font-size: 10px;
}

.research-btn {
  background: linear-gradient(135deg, #3498db, #2980b9);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 6px 10px;
  font-size: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.research-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 3px 10px rgba(52, 152, 219, 0.3);
}

.researched-badge {
  font-size: 16px;
}

.cost-badge {
  font-size: 10px;
  padding: 4px 8px;
  border-radius: 8px;
  background: rgba(231, 76, 60, 0.15);
  color: #e74c3c;
  font-weight: 600;
  white-space: nowrap;
}

/* Suppliers */
.supplier-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.supplier-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.03);
}

.supplier-card.unlocked {
  border-color: rgba(46, 204, 113, 0.2);
  background: rgba(46, 204, 113, 0.05);
}

.supplier-card.locked {
  opacity: 0.7;
}

.supplier-emoji { font-size: 24px; }

.supplier-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.supplier-name {
  color: #ecf0f1;
  font-size: 12px;
  font-weight: 600;
}

.supplier-desc {
  color: #95a5a6;
  font-size: 10px;
}

.supplier-stats {
  display: flex;
  gap: 8px;
}

.unlock-btn {
  background: linear-gradient(135deg, #27ae60, #2ecc71);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 6px 10px;
  font-size: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.unlock-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 3px 10px rgba(39, 174, 96, 0.3);
}

/* Quality bar */
.quality-bar-container {
  display: flex;
  align-items: center;
  gap: 6px;
}

.quality-bar {
  flex: 1;
  height: 6px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 3px;
  overflow: hidden;
}

.quality-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.3s;
}

.quality-fill.quality-high { background: linear-gradient(90deg, #f1c40f, #f39c12); }
.quality-fill.quality-mid { background: linear-gradient(90deg, #2ecc71, #27ae60); }
.quality-fill.quality-low { background: linear-gradient(90deg, #95a5a6, #7f8c8d); }

.quality-number {
  font-size: 10px;
  color: #95a5a6;
  min-width: 20px;
}

.supplier-select {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 6px;
  color: #ecf0f1;
  font-size: 10px;
  padding: 4px 6px;
  cursor: pointer;
  max-width: 85px;
}

/* Ingredient grid */
.ingredient-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 5px;
  margin-bottom: 12px;
}

.ingredient-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 8px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  transition: all 0.2s;
}

.ingredient-item.low-stock {
  border-color: rgba(243, 156, 18, 0.3);
  background: rgba(243, 156, 18, 0.05);
}

.ingredient-item.no-stock {
  border-color: rgba(231, 76, 60, 0.3);
  background: rgba(231, 76, 60, 0.05);
}

.ing-emoji { font-size: 16px; }

.ing-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.ing-name { font-size: 10px; color: #ecf0f1; font-weight: 600; }
.ing-stock { font-size: 9px; color: #95a5a6; }

.no-stock .ing-stock { color: #e74c3c; }
.low-stock .ing-stock { color: #f39c12; }

.buy-btn {
  background: linear-gradient(135deg, rgba(46, 204, 113, 0.2), rgba(39, 174, 96, 0.15));
  border: 1px solid rgba(46, 204, 113, 0.3);
  color: #2ecc71;
  border-radius: 6px;
  padding: 3px 6px;
  font-size: 9px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.buy-btn:hover {
  background: linear-gradient(135deg, rgba(46, 204, 113, 0.3), rgba(39, 174, 96, 0.25));
  transform: scale(1.05);
}

.dish-ingredients-needed {
  display: flex;
  gap: 3px;
  flex-wrap: wrap;
  margin: 2px 0;
}

.ing-need-chip {
  font-size: 9px;
  padding: 1px 4px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.08);
  color: #95a5a6;
}

.ing-need-chip.ing-short {
  background: rgba(231, 76, 60, 0.15);
  color: #e74c3c;
}

/* Combos */
.combo-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 12px;
}

.combo-card {
  background: linear-gradient(135deg, rgba(155, 89, 182, 0.08), rgba(142, 68, 173, 0.04));
  border: 1px solid rgba(155, 89, 182, 0.2);
  border-radius: 12px;
  padding: 10px 12px;
  position: relative;
}

.combo-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.combo-name {
  color: #ecf0f1;
  font-size: 12px;
  font-weight: 600;
}

.combo-bonus {
  color: #2ecc71;
  font-size: 11px;
  font-weight: 700;
  background: rgba(46, 204, 113, 0.15);
  padding: 2px 6px;
  border-radius: 6px;
}

.combo-dishes {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.combo-dish-chip {
  background: rgba(255, 255, 255, 0.08);
  border-radius: 6px;
  padding: 3px 8px;
  font-size: 10px;
  color: #bdc3c7;
}

.remove-combo-btn {
  position: absolute;
  top: 6px;
  right: 8px;
  background: none;
  border: none;
  color: #e74c3c;
  cursor: pointer;
  font-size: 12px;
  opacity: 0.5;
  transition: opacity 0.2s;
}

.remove-combo-btn:hover { opacity: 1; }

/* Templates */
.template-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.template-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px dashed rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  padding: 10px 12px;
}

.template-card.unlocked {
  border-style: solid;
  border-color: rgba(155, 89, 182, 0.25);
  background: rgba(155, 89, 182, 0.05);
}

.template-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
}

.template-emoji { font-size: 16px; }
.template-name { color: #ecf0f1; font-size: 12px; font-weight: 600; flex: 1; }
.template-bonus { color: #2ecc71; font-size: 10px; font-weight: 700; }

.template-slots {
  display: flex;
  gap: 4px;
  margin-bottom: 8px;
}

.slot-chip {
  background: rgba(255, 255, 255, 0.08);
  border-radius: 6px;
  padding: 2px 8px;
  font-size: 10px;
  color: #95a5a6;
}

.create-combo-btn {
  background: linear-gradient(135deg, #9b59b6, #8e44ad);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 6px 12px;
  font-size: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  width: 100%;
}

.create-combo-btn:hover {
  transform: scale(1.02);
  box-shadow: 0 3px 10px rgba(155, 89, 182, 0.3);
}

/* Combo builder */
.combo-builder-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.combo-builder {
  background: linear-gradient(145deg, #2c3e50, #1a252f);
  border-radius: 16px;
  padding: 20px;
  width: 280px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.builder-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  color: #ecf0f1;
  font-size: 14px;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  color: #95a5a6;
  cursor: pointer;
  font-size: 16px;
}

.builder-slots {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 16px;
}

.builder-slot {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.slot-label {
  color: #95a5a6;
  font-size: 11px;
  font-weight: 600;
}

.slot-select {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  color: #ecf0f1;
  font-size: 12px;
  padding: 8px 10px;
  cursor: pointer;
  width: 100%;
}

.confirm-combo-btn {
  width: 100%;
  background: linear-gradient(135deg, #9b59b6, #8e44ad);
  color: white;
  border: none;
  border-radius: 10px;
  padding: 10px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.confirm-combo-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.confirm-combo-btn:not(:disabled):hover {
  transform: scale(1.02);
  box-shadow: 0 4px 15px rgba(155, 89, 182, 0.4);
}

/* Transitions */
.dish-enter-active { animation: dishIn 0.4s ease; }
@keyframes dishIn {
  from { opacity: 0; transform: translateX(-10px); }
  to { opacity: 1; transform: translateX(0); }
}
</style>

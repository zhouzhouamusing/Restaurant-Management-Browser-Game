<template>
  <div class="shop-panel">
    <h3 class="panel-title">🛒 商店</h3>

    <div class="shop-tabs">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        class="shop-tab"
        :class="{ active: activeTab === tab.id }"
        @click="activeTab = tab.id"
      >
        <span class="tab-icon">{{ tab.icon }}</span>
        <span class="tab-label">{{ tab.label }}</span>
      </button>
    </div>

    <div class="shop-items">
      <!-- 座位 Tab -->
      <template v-if="activeTab === 'seats'">
        <div class="shop-item" :class="{ maxed: seatCount >= 8 }" @click="handleBuySeat">
          <div class="item-icon-wrapper seat-icon">
            <span class="item-icon">🪑</span>
          </div>
          <div class="item-info">
            <span class="item-name">新增座位</span>
            <span class="item-desc">更多座位意味着更多顾客同时用餐</span>
            <span class="item-progress-text">当前 {{ seatCount }}/8 个座位</span>
            <div class="seat-progress">
              <div class="seat-progress-fill" :style="{ width: (seatCount / 8 * 100) + '%' }"></div>
            </div>
          </div>
          <div class="item-cost" :class="{ affordable: coins >= seatCost }" v-if="seatCount < 8">
            🪙 {{ seatCost }}
          </div>
          <div class="maxed-badge" v-else>✨ 已满</div>
        </div>
      </template>

      <!-- 墙纸 Tab -->
      <template v-if="activeTab === 'wallpaper'">
        <div
          v-for="item in wallpapers"
          :key="item.id"
          class="shop-item"
          :class="{ owned: isOwned(item.id), active: decorations.activeWallpaper === item.id }"
          @click="handleDecorationAction(item)"
        >
          <div class="item-icon-wrapper" :style="getWallpaperPreviewStyle(item)">
            <span class="item-icon">🎨</span>
          </div>
          <div class="item-info">
            <span class="item-name">{{ item.name }}</span>
            <span class="item-desc">{{ item.description }}</span>
            <span class="item-bonus" v-if="item.bonus.type !== 'none'">
              {{ getBonusLabel(item.bonus) }}
            </span>
          </div>
          <div class="item-action">
            <span v-if="decorations.activeWallpaper === item.id" class="active-badge">使用中</span>
            <span v-else-if="isOwned(item.id)" class="equip-btn" @click.stop="$emit('equip-decoration', item)">使用</span>
            <span v-else class="item-cost" :class="{ affordable: coins >= item.cost }">🪙 {{ item.cost }}</span>
          </div>
        </div>
      </template>

      <!-- 地板 Tab -->
      <template v-if="activeTab === 'floor'">
        <div
          v-for="item in floors"
          :key="item.id"
          class="shop-item"
          :class="{ owned: isOwned(item.id), active: decorations.activeFloor === item.id }"
          @click="handleDecorationAction(item)"
        >
          <div class="item-icon-wrapper floor-preview">
            <span class="item-icon">🏠</span>
          </div>
          <div class="item-info">
            <span class="item-name">{{ item.name }}</span>
            <span class="item-desc">{{ item.description }}</span>
            <span class="item-bonus" v-if="item.bonus.type !== 'none'">
              {{ getBonusLabel(item.bonus) }}
            </span>
          </div>
          <div class="item-action">
            <span v-if="decorations.activeFloor === item.id" class="active-badge">使用中</span>
            <span v-else-if="isOwned(item.id)" class="equip-btn" @click.stop="$emit('equip-decoration', item)">使用</span>
            <span v-else class="item-cost" :class="{ affordable: coins >= item.cost }">🪙 {{ item.cost }}</span>
          </div>
        </div>
      </template>

      <!-- 挂饰 Tab -->
      <template v-if="activeTab === 'wall_art'">
        <div
          v-for="item in wallArt"
          :key="item.id"
          class="shop-item"
          :class="{ owned: isOwned(item.id) }"
          @click="handleDecorationAction(item)"
        >
          <div class="item-icon-wrapper art-preview">
            <span class="item-icon">🖼️</span>
          </div>
          <div class="item-info">
            <span class="item-name">{{ item.name }}</span>
            <span class="item-desc">{{ item.description }}</span>
            <span class="item-bonus" v-if="item.bonus.type !== 'none'">
              {{ getBonusLabel(item.bonus) }}
            </span>
          </div>
          <div class="item-action">
            <span v-if="isOwned(item.id)" class="owned-badge">已拥有</span>
            <span v-else class="item-cost" :class="{ affordable: coins >= item.cost }">🪙 {{ item.cost }}</span>
          </div>
        </div>
      </template>

      <!-- 植物 Tab -->
      <template v-if="activeTab === 'plants'">
        <div
          v-for="item in plants"
          :key="item.id"
          class="shop-item"
          :class="{ owned: isOwned(item.id) }"
          @click="handleDecorationAction(item)"
        >
          <div class="item-icon-wrapper plant-preview">
            <span class="item-icon">🌿</span>
          </div>
          <div class="item-info">
            <span class="item-name">{{ item.name }}</span>
            <span class="item-desc">{{ item.description }}</span>
            <span class="item-bonus" v-if="item.bonus.type !== 'none'">
              {{ getBonusLabel(item.bonus) }}
            </span>
          </div>
          <div class="item-action">
            <span v-if="isOwned(item.id)" class="owned-badge">已拥有</span>
            <span v-else class="item-cost" :class="{ affordable: coins >= item.cost }">🪙 {{ item.cost }}</span>
          </div>
        </div>
      </template>
    </div>

    <div class="shop-tips">
      <div class="tip-item" v-if="activeTab === 'seats'">
        <span class="tip-icon">💡</span>
        <span class="tip-text">更多座位 = 更多顾客 = 更多收入</span>
      </div>
      <div class="tip-item" v-if="activeTab === 'wallpaper' || activeTab === 'floor'">
        <span class="tip-icon">💡</span>
        <span class="tip-text">购买后点击"使用"即可更换，装饰提供额外加成</span>
      </div>
      <div class="tip-item" v-if="activeTab === 'wall_art' || activeTab === 'plants'">
        <span class="tip-icon">💡</span>
        <span class="tip-text">购买后自动放置，进入编辑模式可拖动调整位置</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { DECORATION_CATALOG } from '../game/decorations.js'

const props = defineProps({
  coins: { type: Number, default: 0 },
  seatCount: { type: Number, default: 4 },
  decorations: {
    type: Object,
    default: () => ({
      activeWallpaper: 'wp_cream',
      activeFloor: 'fl_wood',
      owned: ['wp_cream', 'fl_wood'],
      placed: []
    })
  }
})

const emit = defineEmits(['buy-seat', 'buy-decoration', 'equip-decoration'])

const activeTab = ref('seats')

const tabs = [
  { id: 'seats', icon: '🪑', label: '座位' },
  { id: 'wallpaper', icon: '🎨', label: '墙纸' },
  { id: 'floor', icon: '🏠', label: '地板' },
  { id: 'wall_art', icon: '🖼️', label: '挂饰' },
  { id: 'plants', icon: '🌿', label: '植物' },
]

const wallpapers = DECORATION_CATALOG.wallpapers
const floors = DECORATION_CATALOG.floors
const wallArt = DECORATION_CATALOG.wall_art
const plants = DECORATION_CATALOG.plants

const seatCost = computed(() => 50 + (props.seatCount - 4) * 30)

function isOwned(itemId) {
  return props.decorations.owned.includes(itemId)
}

function getBonusLabel(bonus) {
  if (bonus.type === 'tip_multiplier') {
    return `💰 小费 +${Math.round(bonus.value * 100)}%`
  }
  if (bonus.type === 'patience_boost') {
    return `⏳ 耐心 +${Math.round(bonus.value * 100)}%`
  }
  return ''
}

function getWallpaperPreviewStyle(item) {
  const patterns = {
    cream_gradient: 'background: linear-gradient(135deg, #fff8e7, #fff3d4)',
    brick: 'background: linear-gradient(135deg, #c0392b, #922b21)',
    stripes: 'background: repeating-linear-gradient(90deg, #ffeaa7 0px, #ffeaa7 4px, #fdcb6e 4px, #fdcb6e 8px)',
    floral: 'background: linear-gradient(135deg, #fef9f2, #fce4ec)'
  }
  return patterns[item.render.pattern] || ''
}

function handleBuySeat() {
  if (props.seatCount >= 8) return
  emit('buy-seat', seatCost.value)
}

function handleDecorationAction(item) {
  if (isOwned(item.id)) {
    if (item.category === 'wallpaper' || item.category === 'floor') {
      emit('equip-decoration', item)
    }
  } else {
    emit('buy-decoration', item)
  }
}
</script>

<style scoped>
.shop-panel {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 14px;
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.panel-title {
  color: #e67e22;
  font-size: 15px;
  margin-bottom: 12px;
  text-align: center;
  font-family: 'ZCOOL KuaiLe', 'Nunito', cursive;
}

.shop-tabs {
  display: flex;
  gap: 4px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.shop-tab {
  flex: 1;
  min-width: 48px;
  padding: 6px 4px;
  border: 1.5px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.03);
  cursor: pointer;
  transition: all 0.25s;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.shop-tab:hover {
  background: rgba(230, 126, 34, 0.08);
  border-color: rgba(230, 126, 34, 0.3);
}

.shop-tab.active {
  background: rgba(230, 126, 34, 0.15);
  border-color: rgba(230, 126, 34, 0.5);
  box-shadow: 0 2px 8px rgba(230, 126, 34, 0.15);
}

.tab-icon {
  font-size: 14px;
}

.tab-label {
  font-size: 9px;
  color: #bdc3c7;
  font-family: 'ZCOOL KuaiLe', 'Nunito', cursive;
}

.shop-tab.active .tab-label {
  color: #e67e22;
}

.shop-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 320px;
  overflow-y: auto;
  padding-right: 4px;
}

.shop-items::-webkit-scrollbar {
  width: 4px;
}

.shop-items::-webkit-scrollbar-thumb {
  background: rgba(255,255,255,0.1);
  border-radius: 2px;
}

.shop-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.04);
  border: 1.5px solid rgba(255, 255, 255, 0.08);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.shop-item:hover:not(.maxed) {
  background: rgba(230, 126, 34, 0.1);
  border-color: rgba(230, 126, 34, 0.35);
  transform: translateY(-1px);
  box-shadow: 0 3px 12px rgba(230, 126, 34, 0.12);
}

.shop-item:active:not(.maxed) {
  transform: translateY(0);
}

.shop-item.maxed {
  cursor: default;
  opacity: 0.7;
}

.shop-item.active {
  border-color: rgba(46, 204, 113, 0.4);
  background: rgba(46, 204, 113, 0.06);
}

.shop-item.owned:not(.active) {
  border-color: rgba(52, 152, 219, 0.25);
}

.item-icon-wrapper {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: rgba(230, 126, 34, 0.1);
  flex-shrink: 0;
}

.item-icon-wrapper.floor-preview {
  background: linear-gradient(135deg, #e8c99b, #d4a76a);
}

.item-icon-wrapper.art-preview {
  background: linear-gradient(135deg, #f5f0e8, #e0d8cc);
}

.item-icon-wrapper.plant-preview {
  background: linear-gradient(135deg, #c8e6c9, #81c784);
}

.item-icon {
  font-size: 20px;
}

.item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.item-name {
  color: #ecf0f1;
  font-size: 12px;
  font-weight: 600;
  font-family: 'ZCOOL KuaiLe', 'Nunito', cursive;
}

.item-desc {
  color: #95a5a6;
  font-size: 10px;
  line-height: 1.3;
}

.item-progress-text {
  color: #7f8c8d;
  font-size: 10px;
}

.item-bonus {
  display: inline-block;
  margin-top: 2px;
  padding: 1px 6px;
  border-radius: 6px;
  background: rgba(241, 196, 15, 0.1);
  color: #f1c40f;
  font-size: 9px;
  font-weight: 600;
  width: fit-content;
}

.seat-progress {
  height: 4px;
  background: rgba(255,255,255,0.06);
  border-radius: 2px;
  margin-top: 3px;
  overflow: hidden;
}

.seat-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #e67e22, #f39c12);
  border-radius: 2px;
  transition: width 0.5s ease;
}

.item-action {
  flex-shrink: 0;
}

.item-cost {
  color: #e74c3c;
  font-size: 12px;
  font-weight: bold;
  padding: 4px 8px;
  border-radius: 8px;
  background: rgba(231, 76, 60, 0.08);
  transition: all 0.3s;
  white-space: nowrap;
}

.item-cost.affordable {
  color: #2ecc71;
  background: rgba(46, 204, 113, 0.08);
}

.maxed-badge {
  font-size: 11px;
  color: #f39c12;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 8px;
  background: rgba(243, 156, 18, 0.1);
}

.active-badge {
  font-size: 10px;
  color: #2ecc71;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 8px;
  background: rgba(46, 204, 113, 0.12);
}

.equip-btn {
  font-size: 10px;
  color: #3498db;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 8px;
  background: rgba(52, 152, 219, 0.12);
  cursor: pointer;
  transition: all 0.2s;
}

.equip-btn:hover {
  background: rgba(52, 152, 219, 0.25);
}

.owned-badge {
  font-size: 10px;
  color: #7f8c8d;
  padding: 3px 8px;
  border-radius: 8px;
  background: rgba(127, 140, 141, 0.1);
}

.shop-tips {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.tip-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 8px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.02);
}

.tip-icon {
  font-size: 11px;
}

.tip-text {
  font-size: 9px;
  color: #7f8c8d;
}
</style>

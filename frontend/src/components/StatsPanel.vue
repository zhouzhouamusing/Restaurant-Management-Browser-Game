<template>
  <div class="stats-panel">
    <h3 class="panel-title">📊 数据统计</h3>

    <!-- Sub-tabs -->
    <div class="stats-tabs">
      <button class="stats-tab" :class="{ active: tab === 'revenue' }" @click="tab = 'revenue'">💰 营收</button>
      <button class="stats-tab" :class="{ active: tab === 'customers' }" @click="tab = 'customers'">👥 顾客</button>
      <button class="stats-tab" :class="{ active: tab === 'achievements' }" @click="tab = 'achievements'">🏆 成就</button>
    </div>

    <!-- Revenue Tab -->
    <div v-if="tab === 'revenue'" class="tab-content">
      <div class="stats-grid">
        <div class="stat-card gold">
          <span class="stat-card-icon">🪙</span>
          <span class="stat-card-value">{{ totalRevenue }}</span>
          <span class="stat-card-label">总营收</span>
        </div>
        <div class="stat-card green">
          <span class="stat-card-icon">💰</span>
          <span class="stat-card-value">{{ totalTips }}</span>
          <span class="stat-card-label">总小费</span>
        </div>
        <div class="stat-card blue">
          <span class="stat-card-icon">📋</span>
          <span class="stat-card-value">{{ bills.length }}</span>
          <span class="stat-card-label">总订单</span>
        </div>
        <div class="stat-card purple">
          <span class="stat-card-icon">📈</span>
          <span class="stat-card-value">{{ avgOrderValue }}</span>
          <span class="stat-card-label">均单价</span>
        </div>
      </div>

      <!-- Revenue Chart -->
      <div class="section-label">📊 近期收入趋势</div>
      <div class="trend-indicator" v-if="revenueTrend !== 0">
        <span class="trend-arrow" :class="revenueTrend > 0 ? 'up' : 'down'">{{ revenueTrend > 0 ? '📈' : '📉' }}</span>
        <span class="trend-text" :class="revenueTrend > 0 ? 'up' : 'down'">{{ revenueTrend > 0 ? '+' : '' }}{{ revenueTrend }}% 趋势</span>
      </div>
      <div class="bar-chart">
        <div v-for="(bar, i) in revenueChart" :key="i" class="chart-col">
          <div class="chart-bar-wrapper">
            <div class="chart-bar" :style="{ height: bar.pct + '%' }" :class="{ 'bar-highlight': bar.highlight, 'bar-peak': bar.isPeak }">
              <span class="bar-value" v-if="bar.value > 0">{{ bar.value }}</span>
              <span class="peak-marker" v-if="bar.isPeak">🔺</span>
            </div>
          </div>
          <span class="chart-label">{{ bar.label }}</span>
        </div>
      </div>
      <div class="peak-info" v-if="peakRevenue > 0">
        <span class="peak-label">⚡ 峰值</span>
        <span class="peak-value">{{ peakRevenue }} 金币 ({{ peakTime }})</span>
      </div>

      <!-- Popular Dishes -->
      <div class="section-label">🔥 热门菜品</div>
      <div class="popular-list">
        <div v-for="(dish, i) in popularDishes" :key="dish.name" class="popular-item">
          <span class="popular-rank">{{ i + 1 }}</span>
          <span class="popular-emoji">{{ dish.emoji }}</span>
          <span class="popular-name">{{ dish.name }}</span>
          <div class="popular-bar-bg">
            <div class="popular-bar-fill" :style="{ width: dish.pct + '%' }"></div>
          </div>
          <span class="popular-count">{{ dish.count }}</span>
        </div>
      </div>
    </div>

    <!-- Customers Tab -->
    <div v-if="tab === 'customers'" class="tab-content">
      <div class="stats-grid">
        <div class="stat-card green">
          <span class="stat-card-icon">👥</span>
          <span class="stat-card-value">{{ gameState.customersServed }}</span>
          <span class="stat-card-label">总服务</span>
        </div>
        <div class="stat-card gold">
          <span class="stat-card-icon">⭐</span>
          <span class="stat-card-value">{{ satisfactionRate }}%</span>
          <span class="stat-card-label">好评率</span>
        </div>
      </div>

      <!-- Satisfaction Pie -->
      <div class="section-label">😊 满意度分布</div>
      <div class="pie-container">
        <div class="pie-chart" :style="{ background: pieGradient }"></div>
        <div class="pie-legend">
          <div class="legend-item"><span class="legend-dot" style="background:#2ecc71"></span> 满意 {{ satisfactionData.happy }}</div>
          <div class="legend-item"><span class="legend-dot" style="background:#f1c40f"></span> 一般 {{ satisfactionData.neutral }}</div>
          <div class="legend-item"><span class="legend-dot" style="background:#e74c3c"></span> 不满 {{ satisfactionData.angry }}</div>
        </div>
      </div>

      <!-- Customer Traffic -->
      <div class="section-label">📈 客流量</div>
      <div class="traffic-chart">
        <svg class="traffic-svg" viewBox="0 0 240 60" preserveAspectRatio="none">
          <path :d="trafficPath" fill="none" stroke="url(#trafficGrad)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path :d="trafficAreaPath" fill="url(#trafficArea)" opacity="0.3"/>
          <circle v-if="trafficPeakPoint" :cx="trafficPeakPoint.x" :cy="trafficPeakPoint.y" r="4" fill="#e74c3c" stroke="#fff" stroke-width="1"/>
          <defs>
            <linearGradient id="trafficGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stop-color="#3498db"/>
              <stop offset="100%" stop-color="#2ecc71"/>
            </linearGradient>
            <linearGradient id="trafficArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#3498db" stop-opacity="0.4"/>
              <stop offset="100%" stop-color="#3498db" stop-opacity="0"/>
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div class="traffic-stats">
        <div class="traffic-stat">
          <span class="ts-label">峰值客流</span>
          <span class="ts-value">{{ trafficPeak }} 人/5分钟</span>
        </div>
        <div class="traffic-stat">
          <span class="ts-label">平均客流</span>
          <span class="ts-value">{{ trafficAvg }} 人/5分钟</span>
        </div>
      </div>

      <!-- Customer Flow Histogram -->
      <div class="section-label">🕐 客流分时统计</div>
      <div class="flow-histogram">
        <div v-for="(slot, i) in flowHistogram" :key="i" class="flow-col">
          <div class="flow-bar-wrapper">
            <div class="flow-bar" :style="{ height: slot.pct + '%' }" :class="{ 'flow-peak': slot.isPeak }"></div>
          </div>
          <span class="flow-label">{{ slot.label }}</span>
        </div>
      </div>
    </div>

    <!-- Achievements Tab -->
    <div v-if="tab === 'achievements'" class="tab-content">
      <div class="achievement-progress">
        <span class="ap-text">已解锁 {{ achievements.length }} / {{ allAchievements.length }}</span>
        <div class="ap-bar">
          <div class="ap-fill" :style="{ width: (achievements.length / allAchievements.length * 100) + '%' }"></div>
        </div>
      </div>
      <div class="achievement-list">
        <div
          v-for="ach in allAchievements"
          :key="ach.id"
          class="achievement-card"
          :class="{ unlocked: achievements.includes(ach.id) }"
        >
          <span class="ach-emoji">{{ ach.emoji }}</span>
          <div class="ach-info">
            <span class="ach-name">{{ ach.name }}</span>
            <span class="ach-desc">{{ ach.desc }}</span>
          </div>
          <div class="ach-reward" v-if="!achievements.includes(ach.id)">
            <span class="ach-reward-text">🪙{{ ach.reward.coins }}</span>
          </div>
          <span v-else class="ach-done">✅</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ACHIEVEMENT_DEFINITIONS } from '../game/dishes.js'

const props = defineProps({
  bills: { type: Array, default: () => [] },
  gameState: { type: Object, default: () => ({}) },
  achievements: { type: Array, default: () => [] }
})

const tab = ref('revenue')
const allAchievements = ACHIEVEMENT_DEFINITIONS

const totalRevenue = computed(() => props.bills.reduce((s, b) => s + b.amount, 0))
const totalTips = computed(() => props.bills.reduce((s, b) => s + (b.tip || 0), 0))
const avgOrderValue = computed(() => props.bills.length ? Math.round(totalRevenue.value / props.bills.length) : 0)

const satisfactionRate = computed(() => {
  if (!props.gameState.totalReviews) return 0
  return Math.round((props.gameState.positiveReviews / props.gameState.totalReviews) * 100)
})

const satisfactionData = computed(() => {
  const data = { happy: 0, neutral: 0, angry: 0 }
  for (const b of props.bills) {
    if (b.satisfaction === 'happy') data.happy++
    else if (b.satisfaction === 'neutral') data.neutral++
    else data.angry++
  }
  return data
})

const pieGradient = computed(() => {
  const d = satisfactionData.value
  const total = d.happy + d.neutral + d.angry || 1
  const p1 = (d.happy / total) * 360
  const p2 = p1 + (d.neutral / total) * 360
  return `conic-gradient(#2ecc71 0deg ${p1}deg, #f1c40f ${p1}deg ${p2}deg, #e74c3c ${p2}deg 360deg)`
})

const revenueChart = computed(() => {
  const buckets = []
  const now = Date.now()
  for (let i = 7; i >= 0; i--) {
    const start = now - (i + 1) * 300000
    const end = now - i * 300000
    const sum = props.bills.filter(b => {
      const t = b.id || 0
      return t >= start && t < end
    }).reduce((s, b) => s + b.amount, 0)
    buckets.push({ value: sum, label: i === 0 ? '现在' : `-${i * 5}m` })
  }
  const max = Math.max(...buckets.map(b => b.value), 1)
  const peakIdx = buckets.reduce((pi, b, i) => b.value > buckets[pi].value ? i : pi, 0)
  return buckets.map((b, i) => ({ ...b, pct: (b.value / max) * 100, highlight: i === buckets.length - 1, isPeak: i === peakIdx && b.value > 0 }))
})

const revenueTrend = computed(() => {
  const chart = revenueChart.value
  if (chart.length < 4) return 0
  const recent = chart.slice(-3).reduce((s, b) => s + b.value, 0)
  const earlier = chart.slice(0, 3).reduce((s, b) => s + b.value, 0)
  if (earlier === 0) return recent > 0 ? 100 : 0
  return Math.round(((recent - earlier) / earlier) * 100)
})

const peakRevenue = computed(() => {
  const chart = revenueChart.value
  const peak = chart.reduce((m, b) => b.value > m ? b.value : m, 0)
  return peak
})

const peakTime = computed(() => {
  const chart = revenueChart.value
  const peak = chart.reduce((pi, b, i) => b.value > chart[pi].value ? i : pi, 0)
  return chart[peak]?.label || ''
})

const popularDishes = computed(() => {
  const counts = {}
  for (const b of props.bills) {
    const name = b.dish?.name || '未知'
    const emoji = b.dish?.emoji || '🍽️'
    if (!counts[name]) counts[name] = { name, emoji, count: 0 }
    counts[name].count++
  }
  const sorted = Object.values(counts).sort((a, b) => b.count - a.count).slice(0, 5)
  const max = sorted[0]?.count || 1
  return sorted.map(d => ({ ...d, pct: (d.count / max) * 100 }))
})

const trafficPath = computed(() => {
  const points = trafficPoints.value
  const max = Math.max(...points, 1)
  const coords = points.map((p, i) => {
    const x = (i / 11) * 240
    const y = 55 - (p / max) * 50
    return `${x},${y}`
  })
  return 'M' + coords.join(' L')
})

const trafficPoints = computed(() => {
  const points = []
  const now = Date.now()
  for (let i = 11; i >= 0; i--) {
    const start = now - (i + 1) * 300000
    const end = now - i * 300000
    const count = props.bills.filter(b => (b.id || 0) >= start && (b.id || 0) < end).length
    points.push(count)
  }
  return points
})

const trafficPeakPoint = computed(() => {
  const points = trafficPoints.value
  const max = Math.max(...points, 1)
  if (max === 0) return null
  const peakIdx = points.reduce((pi, p, i) => p > points[pi] ? i : pi, 0)
  if (points[peakIdx] === 0) return null
  return { x: (peakIdx / 11) * 240, y: 55 - (points[peakIdx] / max) * 50 }
})

const trafficPeak = computed(() => Math.max(...trafficPoints.value, 0))
const trafficAvg = computed(() => {
  const pts = trafficPoints.value
  const sum = pts.reduce((s, p) => s + p, 0)
  return pts.length ? (sum / pts.length).toFixed(1) : '0'
})

const flowHistogram = computed(() => {
  const now = Date.now()
  const slots = []
  for (let i = 5; i >= 0; i--) {
    const start = now - (i + 1) * 600000
    const end = now - i * 600000
    const count = props.bills.filter(b => (b.id || 0) >= start && (b.id || 0) < end).length
    slots.push({ count, label: i === 0 ? '现在' : `-${(i) * 10}m` })
  }
  const max = Math.max(...slots.map(s => s.count), 1)
  const peakIdx = slots.reduce((pi, s, i) => s.count > slots[pi].count ? i : pi, 0)
  return slots.map((s, i) => ({ ...s, pct: (s.count / max) * 100, isPeak: i === peakIdx && s.count > 0 }))
})

const trafficAreaPath = computed(() => {
  return trafficPath.value + ' L240,58 L0,58 Z'
})
</script>

<style scoped>
.stats-panel {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 18px;
  padding: 16px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  flex-direction: column;
  height: 100%;
}

.panel-title {
  color: #fdcb6e;
  font-size: 15px;
  margin-bottom: 12px;
  text-align: center;
  font-family: 'ZCOOL KuaiLe', 'Nunito', cursive;
}

.stats-tabs {
  display: flex;
  gap: 4px;
  margin-bottom: 12px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 10px;
  padding: 3px;
}

.stats-tab {
  flex: 1;
  padding: 6px 4px;
  border: none;
  background: transparent;
  border-radius: 8px;
  color: #95a5a6;
  font-size: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.stats-tab.active {
  background: linear-gradient(135deg, rgba(241, 196, 15, 0.2), rgba(243, 156, 18, 0.15));
  color: #f1c40f;
}

.tab-content {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}

.tab-content::-webkit-scrollbar { width: 3px; }
.tab-content::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-bottom: 14px;
}

.stat-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 12px 8px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  transition: transform 0.2s;
}

.stat-card:hover { transform: scale(1.02); }

.stat-card.gold { border-color: rgba(241, 196, 15, 0.2); background: rgba(241, 196, 15, 0.05); }
.stat-card.green { border-color: rgba(46, 204, 113, 0.2); background: rgba(46, 204, 113, 0.05); }
.stat-card.blue { border-color: rgba(52, 152, 219, 0.2); background: rgba(52, 152, 219, 0.05); }
.stat-card.purple { border-color: rgba(155, 89, 182, 0.2); background: rgba(155, 89, 182, 0.05); }

.stat-card-icon { font-size: 20px; }
.stat-card-value { font-size: 18px; font-weight: 800; color: #ecf0f1; font-family: 'ZCOOL KuaiLe', cursive; }
.stat-card-label { font-size: 10px; color: #95a5a6; }

.section-label {
  color: #bdc3c7;
  font-size: 11px;
  margin: 14px 0 8px 4px;
  font-weight: 600;
}

/* Bar Chart */
.bar-chart {
  display: flex;
  gap: 4px;
  height: 80px;
  align-items: flex-end;
  padding: 0 4px;
  margin-bottom: 12px;
}

.chart-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
}

.chart-bar-wrapper {
  flex: 1;
  width: 100%;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.chart-bar {
  width: 80%;
  border-radius: 4px 4px 0 0;
  background: linear-gradient(180deg, #3498db, #2980b9);
  transition: height 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  min-height: 2px;
}

.chart-bar.bar-highlight {
  background: linear-gradient(180deg, #2ecc71, #27ae60);
  box-shadow: 0 0 8px rgba(46, 204, 113, 0.3);
}

.bar-value {
  position: absolute;
  top: -14px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 8px;
  color: #95a5a6;
  white-space: nowrap;
}

.chart-label {
  font-size: 8px;
  color: #7f8c8d;
  margin-top: 4px;
}

/* Popular dishes */
.popular-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 12px;
}

.popular-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 8px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.03);
}

.popular-rank {
  font-size: 11px;
  font-weight: 800;
  color: #f39c12;
  width: 16px;
  text-align: center;
}

.popular-emoji { font-size: 16px; }
.popular-name { font-size: 11px; color: #ecf0f1; font-weight: 600; min-width: 50px; }

.popular-bar-bg {
  flex: 1;
  height: 6px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 3px;
  overflow: hidden;
}

.popular-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #f39c12, #e67e22);
  border-radius: 3px;
  transition: width 0.5s;
}

.popular-count {
  font-size: 10px;
  color: #95a5a6;
  min-width: 20px;
  text-align: right;
}

/* Pie chart */
.pie-container {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 14px;
  padding: 10px;
}

.pie-chart {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.pie-legend {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: #bdc3c7;
}

.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

/* Traffic chart */
.traffic-chart {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  padding: 12px;
  margin-bottom: 12px;
}

.traffic-svg {
  width: 100%;
  height: 60px;
}

/* Achievements */
.achievement-progress {
  margin-bottom: 12px;
}

.ap-text {
  font-size: 11px;
  color: #f1c40f;
  font-weight: 600;
  display: block;
  margin-bottom: 6px;
}

.ap-bar {
  height: 8px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 4px;
  overflow: hidden;
}

.ap-fill {
  height: 100%;
  background: linear-gradient(90deg, #f1c40f, #e67e22);
  border-radius: 4px;
  transition: width 0.5s;
}

.achievement-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.achievement-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
  opacity: 0.5;
  transition: all 0.3s;
}

.achievement-card.unlocked {
  opacity: 1;
  background: linear-gradient(135deg, rgba(241, 196, 15, 0.08), rgba(243, 156, 18, 0.04));
  border-color: rgba(241, 196, 15, 0.2);
}

.ach-emoji { font-size: 24px; }

.ach-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.ach-name { font-size: 12px; color: #ecf0f1; font-weight: 600; }
.ach-desc { font-size: 10px; color: #95a5a6; }

.ach-reward {
  background: rgba(241, 196, 15, 0.15);
  padding: 3px 8px;
  border-radius: 8px;
}

.ach-reward-text { font-size: 10px; color: #f1c40f; font-weight: 600; }
.ach-done { font-size: 16px; }

/* Trend indicator */
.trend-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
  padding: 4px 8px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.03);
}

.trend-arrow { font-size: 14px; }
.trend-text { font-size: 11px; font-weight: 700; }
.trend-text.up { color: #2ecc71; }
.trend-text.down { color: #e74c3c; }

.chart-bar.bar-peak {
  background: linear-gradient(180deg, #e74c3c, #c0392b);
  box-shadow: 0 0 10px rgba(231, 76, 60, 0.4);
  position: relative;
}

.peak-marker {
  position: absolute;
  top: -16px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 9px;
}

.peak-info {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: 8px;
  background: rgba(231, 76, 60, 0.08);
  border: 1px solid rgba(231, 76, 60, 0.15);
  margin-top: 8px;
  margin-bottom: 12px;
}

.peak-label {
  font-size: 10px;
  color: #e74c3c;
  font-weight: 700;
}

.peak-value {
  font-size: 11px;
  color: #ecf0f1;
  font-weight: 600;
}

/* Traffic stats */
.traffic-stats {
  display: flex;
  gap: 12px;
  margin: 8px 0 12px;
}

.traffic-stat {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 6px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.03);
}

.ts-label { font-size: 9px; color: #7f8c8d; }
.ts-value { font-size: 11px; color: #ecf0f1; font-weight: 700; }

/* Flow histogram */
.flow-histogram {
  display: flex;
  gap: 4px;
  height: 60px;
  align-items: flex-end;
  padding: 0 4px;
  margin-bottom: 12px;
}

.flow-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
}

.flow-bar-wrapper {
  flex: 1;
  width: 100%;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.flow-bar {
  width: 70%;
  border-radius: 3px 3px 0 0;
  background: linear-gradient(180deg, #9b59b6, #8e44ad);
  transition: height 0.5s;
  min-height: 2px;
}

.flow-bar.flow-peak {
  background: linear-gradient(180deg, #e74c3c, #c0392b);
  box-shadow: 0 0 8px rgba(231, 76, 60, 0.3);
}

.flow-label {
  font-size: 8px;
  color: #7f8c8d;
  margin-top: 3px;
}
</style>

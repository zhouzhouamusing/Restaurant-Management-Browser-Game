<template>
  <div class="review-panel">
    <h3 class="panel-title">⭐ 评价中心</h3>

    <!-- Overall Rating -->
    <div class="overall-rating">
      <div class="rating-score">
        <span class="score-value">{{ overallScore }}</span>
        <span class="score-max">/5.0</span>
      </div>
      <div class="rating-stars">
        <span v-for="i in 5" :key="i" class="star" :class="{ filled: i <= Math.round(overallScoreNum), half: i === Math.ceil(overallScoreNum) && overallScoreNum % 1 >= 0.3 }">★</span>
      </div>
      <div class="rating-summary">
        <span class="rating-count">{{ totalReviews }} 条评价</span>
        <span class="positive-rate" :class="rateClass">{{ positiveRate }}% 好评</span>
      </div>
    </div>

    <!-- Satisfaction Breakdown -->
    <div class="breakdown-section">
      <div class="section-label">📊 满意度分布</div>
      <div class="breakdown-bars">
        <div class="breakdown-row">
          <span class="br-emoji">😊</span>
          <span class="br-label">满意</span>
          <div class="br-bar-bg">
            <div class="br-bar-fill happy" :style="{ width: happyPct + '%' }"></div>
          </div>
          <span class="br-count">{{ moodCounts.happy }}</span>
        </div>
        <div class="breakdown-row">
          <span class="br-emoji">😐</span>
          <span class="br-label">一般</span>
          <div class="br-bar-bg">
            <div class="br-bar-fill neutral" :style="{ width: neutralPct + '%' }"></div>
          </div>
          <span class="br-count">{{ moodCounts.neutral }}</span>
        </div>
        <div class="breakdown-row">
          <span class="br-emoji">😤</span>
          <span class="br-label">不满</span>
          <div class="br-bar-bg">
            <div class="br-bar-fill angry" :style="{ width: angryPct + '%' }"></div>
          </div>
          <span class="br-count">{{ moodCounts.angry }}</span>
        </div>
      </div>
    </div>

    <!-- Per-Dish Ratings -->
    <div class="dish-ratings-section">
      <div class="section-label">🍽️ 菜品评分</div>
      <div class="dish-rating-list">
        <div v-for="dish in dishRatings" :key="dish.name" class="dish-rating-card">
          <div class="dr-left">
            <span class="dr-emoji">{{ dish.emoji }}</span>
            <div class="dr-info">
              <span class="dr-name">{{ dish.name }}</span>
              <span class="dr-count">{{ dish.total }} 单</span>
            </div>
          </div>
          <div class="dr-right">
            <div class="dr-mini-bar">
              <div class="dr-mini-fill" :style="{ width: dish.happyRate + '%' }" :class="rateClassFor(dish.happyRate)"></div>
            </div>
            <span class="dr-rate" :class="rateClassFor(dish.happyRate)">{{ dish.happyRate }}%</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Reviews -->
    <div class="recent-reviews-section">
      <div class="section-label">💬 最近评价</div>
      <div class="review-list">
        <div v-for="review in recentReviews" :key="review.id" class="review-card" :class="'mood-' + review.satisfaction">
          <div class="rv-header">
            <span class="rv-customer">{{ review.customerEmoji }}</span>
            <span class="rv-name">{{ review.customerName }}</span>
            <span class="rv-mood">{{ review.satisfaction === 'happy' ? '😊' : review.satisfaction === 'neutral' ? '😐' : '😤' }}</span>
            <span class="rv-time">{{ review.time }}</span>
          </div>
          <div class="rv-body">
            <span class="rv-dish">{{ review.dish?.emoji }} {{ review.dish?.name }}</span>
            <span class="rv-amount">+{{ review.amount }}</span>
          </div>
        </div>
        <div v-if="recentReviews.length === 0" class="empty-state">
          <span class="empty-icon">📝</span>
          <span class="empty-text">还没有评价记录</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  bills: { type: Array, default: () => [] },
  gameState: { type: Object, default: () => ({}) }
})

const totalReviews = computed(() => props.gameState.totalReviews || 0)
const positiveRate = computed(() => {
  if (!totalReviews.value) return 0
  return Math.round((props.gameState.positiveReviews / totalReviews.value) * 100)
})

const overallScoreNum = computed(() => {
  if (!props.bills.length) return 0
  const scores = { happy: 5, neutral: 3, angry: 1 }
  const total = props.bills.reduce((s, b) => s + (scores[b.satisfaction] || 3), 0)
  return total / props.bills.length
})

const overallScore = computed(() => overallScoreNum.value.toFixed(1))

const rateClass = computed(() => {
  if (positiveRate.value >= 80) return 'rate-good'
  if (positiveRate.value >= 50) return 'rate-mid'
  return 'rate-bad'
})

function rateClassFor(rate) {
  if (rate >= 80) return 'rate-good'
  if (rate >= 50) return 'rate-mid'
  return 'rate-bad'
}

const moodCounts = computed(() => {
  const counts = { happy: 0, neutral: 0, angry: 0 }
  for (const b of props.bills) {
    if (b.satisfaction === 'happy') counts.happy++
    else if (b.satisfaction === 'neutral') counts.neutral++
    else counts.angry++
  }
  return counts
})

const happyPct = computed(() => {
  const total = props.bills.length || 1
  return Math.round((moodCounts.value.happy / total) * 100)
})
const neutralPct = computed(() => {
  const total = props.bills.length || 1
  return Math.round((moodCounts.value.neutral / total) * 100)
})
const angryPct = computed(() => {
  const total = props.bills.length || 1
  return Math.round((moodCounts.value.angry / total) * 100)
})

const dishRatings = computed(() => {
  const map = {}
  for (const b of props.bills) {
    const name = b.dish?.name || '未知'
    if (!map[name]) map[name] = { name, emoji: b.dish?.emoji || '🍽️', happy: 0, total: 0 }
    map[name].total++
    if (b.satisfaction === 'happy') map[name].happy++
  }
  return Object.values(map)
    .sort((a, b) => b.total - a.total)
    .slice(0, 8)
    .map(d => ({ ...d, happyRate: d.total ? Math.round((d.happy / d.total) * 100) : 0 }))
})

const recentReviews = computed(() => props.bills.slice(0, 15))
</script>

<style scoped>
.review-panel {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 18px;
  padding: 16px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: auto;
}

.review-panel::-webkit-scrollbar { width: 3px; }
.review-panel::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }

.panel-title {
  color: #fdcb6e;
  font-size: 15px;
  margin-bottom: 14px;
  text-align: center;
  font-family: 'ZCOOL KuaiLe', 'Nunito', cursive;
}

.overall-rating {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 16px;
  background: linear-gradient(135deg, rgba(241, 196, 15, 0.08), rgba(243, 156, 18, 0.04));
  border: 1px solid rgba(241, 196, 15, 0.15);
  border-radius: 16px;
  margin-bottom: 16px;
}

.rating-score {
  display: flex;
  align-items: baseline;
}

.score-value {
  font-size: 36px;
  font-weight: 800;
  color: #f1c40f;
  font-family: 'ZCOOL KuaiLe', cursive;
}

.score-max {
  font-size: 14px;
  color: #95a5a6;
  margin-left: 2px;
}

.rating-stars {
  display: flex;
  gap: 2px;
}

.star {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.15);
  transition: color 0.3s;
}

.star.filled {
  color: #f1c40f;
  text-shadow: 0 0 6px rgba(241, 196, 15, 0.4);
}

.rating-summary {
  display: flex;
  gap: 12px;
  align-items: center;
}

.rating-count {
  font-size: 11px;
  color: #95a5a6;
}

.positive-rate {
  font-size: 12px;
  font-weight: 700;
}

.rate-good { color: #2ecc71; }
.rate-mid { color: #f39c12; }
.rate-bad { color: #e74c3c; }

.section-label {
  color: #bdc3c7;
  font-size: 11px;
  margin: 12px 0 8px 4px;
  font-weight: 600;
}

/* Breakdown */
.breakdown-bars {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.breakdown-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.br-emoji { font-size: 14px; }
.br-label { font-size: 10px; color: #95a5a6; width: 28px; }

.br-bar-bg {
  flex: 1;
  height: 8px;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 4px;
  overflow: hidden;
}

.br-bar-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.br-bar-fill.happy { background: linear-gradient(90deg, #2ecc71, #27ae60); }
.br-bar-fill.neutral { background: linear-gradient(90deg, #f39c12, #e67e22); }
.br-bar-fill.angry { background: linear-gradient(90deg, #e74c3c, #c0392b); }

.br-count {
  font-size: 10px;
  color: #bdc3c7;
  min-width: 22px;
  text-align: right;
}

/* Dish Ratings */
.dish-rating-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 12px;
}

.dish-rating-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 10px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.dr-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.dr-emoji { font-size: 18px; }

.dr-info {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.dr-name { font-size: 11px; color: #ecf0f1; font-weight: 600; }
.dr-count { font-size: 9px; color: #7f8c8d; }

.dr-right {
  display: flex;
  align-items: center;
  gap: 6px;
}

.dr-mini-bar {
  width: 50px;
  height: 5px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 3px;
  overflow: hidden;
}

.dr-mini-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.5s;
}

.dr-mini-fill.rate-good { background: #2ecc71; }
.dr-mini-fill.rate-mid { background: #f39c12; }
.dr-mini-fill.rate-bad { background: #e74c3c; }

.dr-rate {
  font-size: 11px;
  font-weight: 700;
  min-width: 32px;
  text-align: right;
}

/* Recent Reviews */
.review-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.review-card {
  padding: 8px 10px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.2s;
}

.review-card.mood-happy { border-left: 3px solid rgba(46, 204, 113, 0.5); }
.review-card.mood-neutral { border-left: 3px solid rgba(241, 196, 15, 0.5); }
.review-card.mood-angry { border-left: 3px solid rgba(231, 76, 60, 0.5); }

.rv-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;
}

.rv-customer { font-size: 14px; }
.rv-name { font-size: 10px; color: #bdc3c7; font-weight: 600; flex: 1; }
.rv-mood { font-size: 12px; }
.rv-time { font-size: 9px; color: #7f8c8d; }

.rv-body {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-left: 22px;
}

.rv-dish { font-size: 10px; color: #95a5a6; }
.rv-amount { font-size: 11px; color: #f1c40f; font-weight: 700; }

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 24px;
  color: #7f8c8d;
}

.empty-icon { font-size: 32px; opacity: 0.5; }
.empty-text { font-size: 12px; }
</style>

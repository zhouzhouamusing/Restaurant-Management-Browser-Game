import { DISH_CATALOG } from './dishes.js'

export class ResearchManager {
  constructor() {
    this.activeResearch = null
    this.completedResearchIds = []
    this.failedAttempts = {}
  }

  canStartResearch(dishId, coins) {
    if (this.activeResearch) return { ok: false, reason: '已有研发进行中' }
    const dish = DISH_CATALOG[dishId]
    if (!dish || !dish.research) return { ok: false, reason: '该菜品无需研发' }
    if (this.completedResearchIds.includes(dishId)) return { ok: false, reason: '已研发成功' }
    if (coins < dish.research.cost) return { ok: false, reason: '金币不足' }
    return { ok: true }
  }

  startResearch(dishId) {
    const dish = DISH_CATALOG[dishId]
    if (!dish || !dish.research) return null
    this.activeResearch = {
      dishId,
      startTime: Date.now(),
      duration: dish.research.duration * 1000,
      cost: dish.research.cost,
      successRate: dish.research.successRate
    }
    return this.activeResearch
  }

  getProgress() {
    if (!this.activeResearch) return null
    const elapsed = Date.now() - this.activeResearch.startTime
    const progress = Math.min(1, elapsed / this.activeResearch.duration)
    return {
      dishId: this.activeResearch.dishId,
      progress,
      isComplete: progress >= 1,
      timeRemaining: Math.max(0, this.activeResearch.duration - elapsed)
    }
  }

  getEffectiveSuccessRate(dishId) {
    const dish = DISH_CATALOG[dishId]
    if (!dish || !dish.research) return 0
    const base = dish.research.successRate
    const failBonus = this.getFailedAttemptBonus(dishId)
    return Math.min(0.99, base + failBonus)
  }

  completeResearch() {
    if (!this.activeResearch) return null
    const dishId = this.activeResearch.dishId
    const effectiveRate = this.getEffectiveSuccessRate(dishId)
    const roll = Math.random()
    const success = roll < effectiveRate

    if (success) {
      this.completedResearchIds.push(dishId)
    } else {
      this.failedAttempts[dishId] = (this.failedAttempts[dishId] || 0) + 1
    }

    this.activeResearch = null
    return { success, dishId }
  }

  getFailedAttemptBonus(dishId) {
    const fails = this.failedAttempts[dishId] || 0
    return Math.min(0.15, fails * 0.05)
  }

  getFailCount(dishId) {
    return this.failedAttempts[dishId] || 0
  }

  isResearched(dishId) {
    return this.completedResearchIds.includes(dishId)
  }

  serialize() {
    return {
      activeResearch: this.activeResearch,
      completedResearchIds: this.completedResearchIds,
      failedAttempts: this.failedAttempts
    }
  }

  static fromSerialized(data) {
    const rm = new ResearchManager()
    if (data) {
      rm.activeResearch = data.activeResearch || null
      rm.completedResearchIds = data.completedResearchIds || []
      rm.failedAttempts = data.failedAttempts || {}
    }
    return rm
  }
}

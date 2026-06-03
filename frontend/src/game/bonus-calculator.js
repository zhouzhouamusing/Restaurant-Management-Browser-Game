import { DECORATION_CATALOG, findItemById } from './decorations.js'
import { RARITY_CONFIG, getPositiveReviewRate } from './dishes.js'

export function calculateBonuses(decorationState) {
  let tipBonus = 0
  let patienceBonus = 0

  const wp = DECORATION_CATALOG.wallpapers.find(w => w.id === decorationState.activeWallpaper)
  if (wp && wp.bonus.type === 'tip_multiplier') tipBonus += wp.bonus.value
  if (wp && wp.bonus.type === 'patience_boost') patienceBonus += wp.bonus.value

  const fl = DECORATION_CATALOG.floors.find(f => f.id === decorationState.activeFloor)
  if (fl && fl.bonus.type === 'tip_multiplier') tipBonus += fl.bonus.value
  if (fl && fl.bonus.type === 'patience_boost') patienceBonus += fl.bonus.value

  for (const placed of decorationState.placed) {
    const item = findItemById(placed.id)
    if (item && item.bonus.type === 'tip_multiplier') tipBonus += item.bonus.value
    if (item && item.bonus.type === 'patience_boost') patienceBonus += item.bonus.value
  }

  return {
    tipBonus: Math.min(tipBonus, 0.50),
    patienceBonus: Math.min(patienceBonus, 0.50)
  }
}

export function calculateDishQuality(dish, supplierQualityBonus) {
  const base = dish.baseQuality || 50
  return Math.min(100, base + (supplierQualityBonus || 0))
}

export function calculateDishPayment(dish, patience, decorTipBonus, qualityScore, currentSeason, comboMultiplier) {
  const basePrice = dish.price
  const tipMultiplier = patience > 70 ? 1.5 : patience > 40 ? 1.2 : 1
  const qualityMultiplier = 1 + (qualityScore / 100) * 0.5
  const isSeasonal = dish.seasons && dish.seasons.length < 4 && dish.seasons.includes(currentSeason)
  const seasonalMultiplier = isSeasonal ? (1 + (dish.seasonalBonus || 0.3)) : 1
  const decorMultiplier = 1 + (decorTipBonus || 0)
  const combo = comboMultiplier || 1
  const comboTipBonus = combo > 1 ? 1.1 : 1
  const rarityConfig = RARITY_CONFIG[dish.rarity || 'common']
  const rarityMultiplier = rarityConfig ? rarityConfig.revenueMultiplier : 1
  const reviewRate = getPositiveReviewRate(qualityScore)
  const reviewBonus = 1 + (reviewRate - 0.5) * 0.3

  return Math.floor(basePrice * tipMultiplier * qualityMultiplier * seasonalMultiplier * decorMultiplier * combo * comboTipBonus * rarityMultiplier * reviewBonus)
}

export function calculateCustomerReview(qualityScore, patience) {
  const baseReviewRate = getPositiveReviewRate(qualityScore)
  const patienceModifier = patience > 70 ? 0.1 : patience > 40 ? 0 : -0.15
  const finalRate = Math.max(0.1, Math.min(1, baseReviewRate + patienceModifier))
  const isPositive = Math.random() < finalRate
  return { isPositive, rate: finalRate }
}

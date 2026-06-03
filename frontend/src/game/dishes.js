/**
 * 菜品系统数据定义
 */

export const RARITY_CONFIG = {
  common:    { name: '普通', emoji: '⚪', color: '#95a5a6', revenueMultiplier: 1.0 },
  uncommon:  { name: '优良', emoji: '🟢', color: '#2ecc71', revenueMultiplier: 1.15 },
  rare:      { name: '稀有', emoji: '🔵', color: '#3498db', revenueMultiplier: 1.35 },
  epic:      { name: '珍品', emoji: '🟣', color: '#9b59b6', revenueMultiplier: 1.6 },
  legendary: { name: '传说', emoji: '🟡', color: '#f1c40f', revenueMultiplier: 2.0 }
}

export const DISH_CATALOG = {
  1: {
    id: 1, name: '蛋炒饭', price: 10, cookTime: 3, emoji: '🍛',
    category: 'main', tier: 1, rarity: 'common',
    seasons: ['spring', 'summer', 'autumn', 'winter'],
    ingredients: [{ ingredientId: 'rice', quantity: 1 }, { ingredientId: 'egg', quantity: 2 }],
    research: null,
    baseQuality: 50
  },
  2: {
    id: 2, name: '番茄汤', price: 8, cookTime: 2, emoji: '🍲',
    category: 'main', tier: 1, rarity: 'common',
    seasons: ['spring', 'summer', 'autumn', 'winter'],
    ingredients: [{ ingredientId: 'tomato', quantity: 2 }, { ingredientId: 'egg', quantity: 1 }],
    research: null,
    baseQuality: 45
  },
  3: {
    id: 3, name: '红烧肉', price: 20, cookTime: 5, emoji: '🍖',
    category: 'main', tier: 1, rarity: 'uncommon',
    seasons: ['spring', 'summer', 'autumn', 'winter'],
    ingredients: [{ ingredientId: 'pork', quantity: 3 }, { ingredientId: 'soy_sauce', quantity: 1 }],
    research: null,
    baseQuality: 60
  },
  4: {
    id: 4, name: '宫保鸡丁', price: 18, cookTime: 4, emoji: '🍜',
    category: 'main', tier: 2, rarity: 'uncommon',
    seasons: ['spring', 'summer', 'autumn', 'winter'],
    ingredients: [{ ingredientId: 'chicken', quantity: 2 }, { ingredientId: 'peanut', quantity: 1 }, { ingredientId: 'chili', quantity: 1 }],
    research: { cost: 50, successRate: 0.85, duration: 60 },
    baseQuality: 60
  },
  5: {
    id: 5, name: '鱼香肉丝', price: 16, cookTime: 4, emoji: '🥡',
    category: 'main', tier: 2, rarity: 'uncommon',
    seasons: ['spring', 'summer', 'autumn', 'winter'],
    ingredients: [{ ingredientId: 'pork', quantity: 2 }, { ingredientId: 'chili', quantity: 1 }, { ingredientId: 'vinegar', quantity: 1 }],
    research: { cost: 60, successRate: 0.82, duration: 75 },
    baseQuality: 58
  },
  6: {
    id: 6, name: '麻婆豆腐', price: 12, cookTime: 3, emoji: '🥘',
    category: 'main', tier: 2, rarity: 'uncommon',
    seasons: ['spring', 'summer', 'autumn', 'winter'],
    ingredients: [{ ingredientId: 'tofu', quantity: 2 }, { ingredientId: 'chili', quantity: 1 }, { ingredientId: 'pork', quantity: 1 }],
    research: { cost: 40, successRate: 0.90, duration: 45 },
    baseQuality: 55
  },
  7: {
    id: 7, name: '北京烤鸭', price: 38, cookTime: 7, emoji: '🍗',
    category: 'main', tier: 3, rarity: 'epic',
    seasons: ['autumn', 'winter'],
    ingredients: [{ ingredientId: 'duck', quantity: 3 }, { ingredientId: 'flour', quantity: 1 }, { ingredientId: 'scallion', quantity: 1 }],
    research: { cost: 120, successRate: 0.65, duration: 120 },
    baseQuality: 80,
    seasonalBonus: 0.3
  },
  8: {
    id: 8, name: '珍珠奶茶', price: 15, cookTime: 2, emoji: '🧋',
    category: 'drink', tier: 2, rarity: 'uncommon',
    seasons: ['spring', 'summer', 'autumn', 'winter'],
    ingredients: [{ ingredientId: 'tea', quantity: 1 }, { ingredientId: 'milk', quantity: 1 }, { ingredientId: 'starch', quantity: 1 }],
    research: { cost: 80, successRate: 0.88, duration: 50 },
    baseQuality: 55
  },
  9: {
    id: 9, name: '冰粉', price: 12, cookTime: 2, emoji: '🍧',
    category: 'dessert', tier: 2, rarity: 'rare',
    seasons: ['summer'],
    ingredients: [{ ingredientId: 'starch', quantity: 1 }, { ingredientId: 'brown_sugar', quantity: 1 }],
    research: { cost: 70, successRate: 0.80, duration: 90 },
    baseQuality: 55,
    seasonalBonus: 0.3
  },
  10: {
    id: 10, name: '西瓜汁', price: 8, cookTime: 1, emoji: '🍉',
    category: 'drink', tier: 2, rarity: 'rare',
    seasons: ['summer'],
    ingredients: [{ ingredientId: 'watermelon', quantity: 2 }],
    research: { cost: 40, successRate: 0.92, duration: 40 },
    baseQuality: 45,
    seasonalBonus: 0.25
  },
  11: {
    id: 11, name: '热可可', price: 10, cookTime: 2, emoji: '☕',
    category: 'drink', tier: 2, rarity: 'rare',
    seasons: ['winter'],
    ingredients: [{ ingredientId: 'cocoa', quantity: 1 }, { ingredientId: 'milk', quantity: 1 }],
    research: { cost: 50, successRate: 0.85, duration: 55 },
    baseQuality: 55,
    seasonalBonus: 0.3
  },
  12: {
    id: 12, name: '火锅', price: 35, cookTime: 8, emoji: '🫕',
    category: 'main', tier: 3, rarity: 'epic',
    seasons: ['autumn', 'winter'],
    ingredients: [{ ingredientId: 'beef', quantity: 2 }, { ingredientId: 'tofu', quantity: 1 }, { ingredientId: 'chili', quantity: 2 }, { ingredientId: 'scallion', quantity: 1 }],
    research: { cost: 100, successRate: 0.70, duration: 110 },
    baseQuality: 75,
    seasonalBonus: 0.35
  },
  13: {
    id: 13, name: '春卷', price: 14, cookTime: 3, emoji: '🥟',
    category: 'main', tier: 2, rarity: 'rare',
    seasons: ['spring'],
    ingredients: [{ ingredientId: 'flour', quantity: 1 }, { ingredientId: 'pork', quantity: 1 }, { ingredientId: 'vegetable', quantity: 1 }],
    research: { cost: 45, successRate: 0.90, duration: 50 },
    baseQuality: 50,
    seasonalBonus: 0.25
  },
  14: {
    id: 14, name: '桂花糕', price: 16, cookTime: 4, emoji: '🍰',
    category: 'dessert', tier: 2, rarity: 'rare',
    seasons: ['autumn'],
    ingredients: [{ ingredientId: 'flour', quantity: 1 }, { ingredientId: 'osmanthus', quantity: 2 }, { ingredientId: 'brown_sugar', quantity: 1 }],
    research: { cost: 60, successRate: 0.78, duration: 80 },
    baseQuality: 65,
    seasonalBonus: 0.3
  },
  15: {
    id: 15, name: '柠檬茶', price: 9, cookTime: 1, emoji: '🍋',
    category: 'drink', tier: 2, rarity: 'uncommon',
    seasons: ['spring', 'summer'],
    ingredients: [{ ingredientId: 'lemon', quantity: 2 }, { ingredientId: 'tea', quantity: 1 }],
    research: { cost: 35, successRate: 0.93, duration: 35 },
    baseQuality: 45,
    seasonalBonus: 0.2
  },
  16: {
    id: 16, name: '汤圆', price: 11, cookTime: 3, emoji: '🥮',
    category: 'dessert', tier: 2, rarity: 'rare',
    seasons: ['winter'],
    ingredients: [{ ingredientId: 'glutinous_rice', quantity: 2 }, { ingredientId: 'sesame', quantity: 1 }],
    research: { cost: 55, successRate: 0.85, duration: 60 },
    baseQuality: 55,
    seasonalBonus: 0.3
  },
  17: {
    id: 17, name: '糖醋排骨', price: 25, cookTime: 5, emoji: '🥩',
    category: 'main', tier: 2, rarity: 'rare',
    seasons: ['spring', 'summer', 'autumn', 'winter'],
    ingredients: [{ ingredientId: 'pork', quantity: 3 }, { ingredientId: 'vinegar', quantity: 1 }, { ingredientId: 'brown_sugar', quantity: 1 }],
    research: { cost: 80, successRate: 0.75, duration: 90 },
    baseQuality: 65
  },
  18: {
    id: 18, name: '酸梅汤', price: 7, cookTime: 1, emoji: '🥤',
    category: 'drink', tier: 1, rarity: 'uncommon',
    seasons: ['summer'],
    ingredients: [{ ingredientId: 'plum', quantity: 2 }, { ingredientId: 'brown_sugar', quantity: 1 }],
    research: { cost: 30, successRate: 0.95, duration: 30 },
    baseQuality: 40,
    seasonalBonus: 0.2
  },
  19: {
    id: 19, name: '姜母鸭', price: 30, cookTime: 6, emoji: '🦆',
    category: 'main', tier: 3, rarity: 'legendary',
    seasons: ['winter'],
    ingredients: [{ ingredientId: 'duck', quantity: 2 }, { ingredientId: 'ginger', quantity: 2 }, { ingredientId: 'sesame', quantity: 1 }],
    research: { cost: 110, successRate: 0.68, duration: 100 },
    baseQuality: 72,
    seasonalBonus: 0.35
  },
  20: {
    id: 20, name: '芒果布丁', price: 13, cookTime: 3, emoji: '🍮',
    category: 'dessert', tier: 2, rarity: 'rare',
    seasons: ['spring', 'summer'],
    ingredients: [{ ingredientId: 'mango', quantity: 2 }, { ingredientId: 'milk', quantity: 1 }],
    research: { cost: 65, successRate: 0.82, duration: 70 },
    baseQuality: 58,
    seasonalBonus: 0.25
  }
}

export const INGREDIENT_CATALOG = {
  rice:          { id: 'rice',          name: '大米',     emoji: '🍚', basePrice: 2 },
  egg:           { id: 'egg',           name: '鸡蛋',     emoji: '🥚', basePrice: 3 },
  tomato:        { id: 'tomato',        name: '番茄',     emoji: '🍅', basePrice: 2 },
  pork:          { id: 'pork',          name: '猪肉',     emoji: '🥓', basePrice: 5 },
  chicken:       { id: 'chicken',       name: '鸡肉',     emoji: '🍗', basePrice: 5 },
  beef:          { id: 'beef',          name: '牛肉',     emoji: '🥩', basePrice: 8 },
  duck:          { id: 'duck',          name: '鸭肉',     emoji: '🦆', basePrice: 7 },
  tofu:          { id: 'tofu',          name: '豆腐',     emoji: '🧈', basePrice: 2 },
  flour:         { id: 'flour',         name: '面粉',     emoji: '🌾', basePrice: 2 },
  chili:         { id: 'chili',         name: '辣椒',     emoji: '🌶️', basePrice: 1 },
  peanut:        { id: 'peanut',        name: '花生',     emoji: '🥜', basePrice: 2 },
  tea:           { id: 'tea',           name: '茶叶',     emoji: '🍵', basePrice: 3 },
  milk:          { id: 'milk',          name: '牛奶',     emoji: '🥛', basePrice: 3 },
  starch:        { id: 'starch',        name: '淀粉',     emoji: '🫧', basePrice: 1 },
  brown_sugar:   { id: 'brown_sugar',   name: '红糖',     emoji: '🍯', basePrice: 2 },
  soy_sauce:     { id: 'soy_sauce',     name: '酱油',     emoji: '🫙', basePrice: 2 },
  vinegar:       { id: 'vinegar',       name: '醋',       emoji: '🍶', basePrice: 2 },
  scallion:      { id: 'scallion',      name: '葱',       emoji: '🧅', basePrice: 1 },
  watermelon:    { id: 'watermelon',    name: '西瓜',     emoji: '🍉', basePrice: 3 },
  cocoa:         { id: 'cocoa',         name: '可可粉',   emoji: '🍫', basePrice: 4 },
  vegetable:     { id: 'vegetable',     name: '时蔬',     emoji: '🥬', basePrice: 2 },
  osmanthus:     { id: 'osmanthus',     name: '桂花',     emoji: '🌼', basePrice: 4 },
  lemon:         { id: 'lemon',         name: '柠檬',     emoji: '🍋', basePrice: 2 },
  glutinous_rice:{ id: 'glutinous_rice',name: '糯米',     emoji: '🍘', basePrice: 3 },
  sesame:        { id: 'sesame',        name: '芝麻',     emoji: '🫘', basePrice: 2 },
  plum:          { id: 'plum',          name: '酸梅',     emoji: '🫐', basePrice: 3 },
  ginger:        { id: 'ginger',        name: '生姜',     emoji: '🫚', basePrice: 2 },
  mango:         { id: 'mango',         name: '芒果',     emoji: '🥭', basePrice: 4 }
}

export const SUPPLIER_CATALOG = [
  {
    id: 'market_basic',
    name: '菜市场',
    emoji: '🏪',
    description: '便宜实惠，品质一般',
    qualityLevel: 1,
    priceMultiplier: 1.0,
    qualityBonus: 0,
    unlockCost: 0
  },
  {
    id: 'farm_direct',
    name: '农场直供',
    emoji: '🌾',
    description: '新鲜有机，品质优良',
    qualityLevel: 2,
    priceMultiplier: 1.8,
    qualityBonus: 20,
    unlockCost: 200
  },
  {
    id: 'premium_import',
    name: '进口精选',
    emoji: '✈️',
    description: '顶级食材，极致品质',
    qualityLevel: 3,
    priceMultiplier: 3.0,
    qualityBonus: 45,
    unlockCost: 500
  }
]

export const SEASON_CONFIG = {
  seasons: ['spring', 'summer', 'autumn', 'winter'],
  names: { spring: '春季', summer: '夏季', autumn: '秋季', winter: '冬季' },
  emojis: { spring: '🌸', summer: '☀️', autumn: '🍂', winter: '❄️' },
  colors: { spring: '#a8e6cf', summer: '#ffd54f', autumn: '#ff8a65', winter: '#90caf9' },
  cycleDuration: 1 * 60 * 60 * 1000
}

export const COMBO_TEMPLATES = [
  {
    id: 'combo_basic',
    name: '经典套餐',
    description: '主菜 + 饮料',
    emoji: '🍱',
    slots: ['main', 'drink'],
    bonusMultiplier: 1.15,
    unlockCost: 100
  },
  {
    id: 'combo_full',
    name: '豪华全餐',
    description: '主菜 + 饮料 + 甜点',
    emoji: '🎊',
    slots: ['main', 'drink', 'dessert'],
    bonusMultiplier: 1.3,
    unlockCost: 250
  },
  {
    id: 'combo_duo',
    name: '双拼套餐',
    description: '两道主菜搭配',
    emoji: '🍽️',
    slots: ['main', 'main'],
    bonusMultiplier: 1.2,
    unlockCost: 150
  }
]

export function getCurrentSeason(seasonEpoch) {
  const elapsed = Date.now() - seasonEpoch
  const totalCycle = SEASON_CONFIG.cycleDuration * 4
  const positionInCycle = ((elapsed % totalCycle) + totalCycle) % totalCycle
  const seasonIndex = Math.floor(positionInCycle / SEASON_CONFIG.cycleDuration)
  return SEASON_CONFIG.seasons[seasonIndex]
}

export function getSeasonProgress(seasonEpoch) {
  const elapsed = Date.now() - seasonEpoch
  const positionInSeason = ((elapsed % SEASON_CONFIG.cycleDuration) + SEASON_CONFIG.cycleDuration) % SEASON_CONFIG.cycleDuration
  return positionInSeason / SEASON_CONFIG.cycleDuration
}

export function getSeasonTimeRemaining(seasonEpoch) {
  const elapsed = Date.now() - seasonEpoch
  const positionInSeason = ((elapsed % SEASON_CONFIG.cycleDuration) + SEASON_CONFIG.cycleDuration) % SEASON_CONFIG.cycleDuration
  return SEASON_CONFIG.cycleDuration - positionInSeason
}

export function isDishAvailableInSeason(dish, currentSeason) {
  if (!dish.seasons || dish.seasons.length === 4) return true
  return dish.seasons.includes(currentSeason)
}

export function isDishSeasonal(dish) {
  return dish.seasons && dish.seasons.length < 4
}

export function getStarterDishes() {
  return Object.values(DISH_CATALOG).filter(d => d.research === null)
}

export function getResearchableDishes() {
  return Object.values(DISH_CATALOG).filter(d => d.research !== null)
}

export function getDishById(id) {
  return DISH_CATALOG[id] || null
}

export function getIngredientCost(dish, supplier) {
  if (!dish.ingredients) return 0
  let cost = 0
  for (const ing of dish.ingredients) {
    const ingredient = INGREDIENT_CATALOG[ing.ingredientId]
    if (ingredient) {
      cost += ingredient.basePrice * ing.quantity * supplier.priceMultiplier
    }
  }
  return Math.ceil(cost)
}

export function getSupplierById(id) {
  return SUPPLIER_CATALOG.find(s => s.id === id) || SUPPLIER_CATALOG[0]
}

export function validateCombo(templateId, dishIds) {
  const template = COMBO_TEMPLATES.find(t => t.id === templateId)
  if (!template) return false
  if (dishIds.length !== template.slots.length) return false
  for (let i = 0; i < template.slots.length; i++) {
    const dish = DISH_CATALOG[dishIds[i]]
    if (!dish || dish.category !== template.slots[i]) return false
  }
  return true
}

export function getComboTotalPrice(combo) {
  const template = COMBO_TEMPLATES.find(t => t.id === combo.templateId)
  if (!template) return 0
  let total = 0
  for (const dishId of combo.dishIds) {
    const dish = DISH_CATALOG[dishId]
    if (dish) total += dish.price
  }
  return Math.floor(total * template.bonusMultiplier)
}

export function getCategoryName(category) {
  const names = { main: '主菜', drink: '饮料', dessert: '甜点' }
  return names[category] || category
}

export function getCategoryEmoji(category) {
  const emojis = { main: '🍖', drink: '🥤', dessert: '🍰' }
  return emojis[category] || '🍽️'
}

export function canServeDish(dish, ingredientStock) {
  if (!dish.ingredients) return true
  for (const ing of dish.ingredients) {
    const have = ingredientStock[ing.ingredientId] || 0
    if (have < ing.quantity) return false
  }
  return true
}

export function consumeIngredients(dish, ingredientStock) {
  if (!dish.ingredients) return
  for (const ing of dish.ingredients) {
    ingredientStock[ing.ingredientId] = (ingredientStock[ing.ingredientId] || 0) - ing.quantity
  }
}

export function getMissingIngredients(dish, ingredientStock) {
  if (!dish.ingredients) return []
  const missing = []
  for (const ing of dish.ingredients) {
    const have = ingredientStock[ing.ingredientId] || 0
    if (have < ing.quantity) {
      const ingredient = INGREDIENT_CATALOG[ing.ingredientId]
      missing.push({ ...ingredient, need: ing.quantity, have })
    }
  }
  return missing
}

export function getBuyPrice(ingredientId, quantity, supplier) {
  const ingredient = INGREDIENT_CATALOG[ingredientId]
  if (!ingredient) return 0
  return Math.ceil(ingredient.basePrice * quantity * supplier.priceMultiplier)
}

export function getDishRarity(dish) {
  return RARITY_CONFIG[dish.rarity || 'common']
}

export function getRarityMultiplier(dish) {
  const rarity = RARITY_CONFIG[dish.rarity || 'common']
  return rarity ? rarity.revenueMultiplier : 1
}

export function getPositiveReviewRate(qualityScore) {
  if (qualityScore >= 90) return 0.95
  if (qualityScore >= 75) return 0.80
  if (qualityScore >= 60) return 0.65
  if (qualityScore >= 45) return 0.50
  return 0.35
}

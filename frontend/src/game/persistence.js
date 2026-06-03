import { getDefaultDecorationState } from './decorations.js'

const STORAGE_KEY_PREFIX = 'restaurant_game_state_'

export function saveToLocal(userId, gameState, billHistory) {
  const data = {
    coins: gameState.coins,
    level: gameState.level,
    dishes: gameState.dishes,
    customersServed: gameState.customersServed,
    seatCount: gameState.seatCount,
    staff: gameState.staff.map(s => ({
      id: s.id,
      type: s.type,
      level: s.level,
      proficiency: s.proficiency,
      name: s.name,
      totalServed: s.totalServed
    })),
    billHistory: (billHistory || []).slice(0, 50),
    decorations: gameState.decorations || getDefaultDecorationState(),
    tablePositions: gameState.tablePositions || null,
    researchData: gameState.researchData || null,
    unlockedSuppliers: gameState.unlockedSuppliers || ['market_basic'],
    supplierAssignments: gameState.supplierAssignments || {},
    seasonEpoch: gameState.seasonEpoch || Date.now(),
    combos: gameState.combos || [],
    unlockedComboTemplates: gameState.unlockedComboTemplates || [],
    ingredientStock: gameState.ingredientStock || {},
    savedAt: Date.now()
  }
  try {
    localStorage.setItem(STORAGE_KEY_PREFIX + userId, JSON.stringify(data))
  } catch (e) {
    // quota exceeded or private browsing
  }
}

export function loadFromLocal(userId) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PREFIX + userId)
    if (!raw) return null
    const data = JSON.parse(raw)
    if (!data.decorations) {
      data.decorations = getDefaultDecorationState()
    }
    if (!data.tablePositions) {
      data.tablePositions = null
    }
    if (!data.researchData) data.researchData = null
    if (!data.unlockedSuppliers) data.unlockedSuppliers = ['market_basic']
    if (!data.supplierAssignments) data.supplierAssignments = {}
    if (!data.seasonEpoch) data.seasonEpoch = Date.now()
    if (!data.combos) data.combos = []
    if (!data.unlockedComboTemplates) data.unlockedComboTemplates = []
    if (!data.ingredientStock) data.ingredientStock = {}
    return data
  } catch (e) {
    return null
  }
}

export function clearLocal(userId) {
  localStorage.removeItem(STORAGE_KEY_PREFIX + userId)
}

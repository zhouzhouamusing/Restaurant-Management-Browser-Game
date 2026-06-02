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
    return JSON.parse(raw)
  } catch (e) {
    return null
  }
}

export function clearLocal(userId) {
  localStorage.removeItem(STORAGE_KEY_PREFIX + userId)
}

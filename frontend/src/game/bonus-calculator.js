import { DECORATION_CATALOG, findItemById } from './decorations.js'

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

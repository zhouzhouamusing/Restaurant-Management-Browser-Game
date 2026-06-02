const BODY_COLORS = ['#FFB3BA', '#BAFFC9', '#BAE1FF', '#FFFFBA', '#E8BAFF', '#FFD4BA', '#B3E0FF', '#FFE0B3']
const WAITER_COLOR = '#FFFFFF'
const WAITER_APRON = '#3498db'
const CASHIER_COLOR = '#E8D5F5'
const CASHIER_VEST = '#8e44ad'

export function getRandomBodyColor() {
  return BODY_COLORS[Math.floor(Math.random() * BODY_COLORS.length)]
}

export function drawCustomerBody(ctx, x, y, customer, frameCount) {
  const state = customer.state
  const isWalking = state === 'walking_in' || state === 'leaving'
  const isEating = state === 'eating'
  const isAngry = customer.patience < 20 && state === 'leaving'
  const walkPhase = frameCount * 0.12
  const bodyColor = customer.bodyColor || '#FFB3BA'
  const breathe = Math.sin(frameCount * 0.04) * 0.5

  ctx.save()

  // Shadow
  ctx.beginPath()
  ctx.ellipse(x, y + 28, 14, 5, 0, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(0,0,0,0.1)'
  ctx.fill()

  // Legs
  const legSwing = isWalking ? Math.sin(walkPhase) * 0.5 : 0
  ctx.strokeStyle = '#6B4A2B'
  ctx.lineWidth = 3.5
  ctx.lineCap = 'round'

  ctx.beginPath()
  ctx.moveTo(x - 5, y + 14)
  ctx.lineTo(x - 5 - Math.sin(legSwing) * 7, y + 26)
  ctx.stroke()

  ctx.beginPath()
  ctx.moveTo(x + 5, y + 14)
  ctx.lineTo(x + 5 + Math.sin(legSwing) * 7, y + 26)
  ctx.stroke()

  // Shoes
  ctx.fillStyle = '#4E342E'
  ctx.beginPath()
  ctx.ellipse(x - 5 - Math.sin(legSwing) * 7, y + 27, 5, 3, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(x + 5 + Math.sin(legSwing) * 7, y + 27, 5, 3, 0, 0, Math.PI * 2)
  ctx.fill()

  // Torso
  ctx.beginPath()
  ctx.roundRect(x - 10, y - 4 + breathe, 20, 19, 7)
  ctx.fillStyle = bodyColor
  ctx.fill()
  ctx.strokeStyle = 'rgba(0,0,0,0.08)'
  ctx.lineWidth = 1
  ctx.stroke()

  // Collar/neckline
  ctx.beginPath()
  ctx.arc(x, y - 3 + breathe, 4, 0, Math.PI, false)
  ctx.strokeStyle = 'rgba(0,0,0,0.06)'
  ctx.lineWidth = 1
  ctx.stroke()

  // Arms
  const armSwing = isWalking ? Math.sin(walkPhase) * 0.4 : 0
  const skinColor = '#FFDAB9'
  ctx.strokeStyle = skinColor
  ctx.lineWidth = 4
  ctx.lineCap = 'round'

  if (isEating) {
    ctx.beginPath()
    ctx.moveTo(x - 10, y + 1)
    ctx.lineTo(x - 16, y + 10)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(x + 10, y + 1)
    ctx.quadraticCurveTo(x + 15, y - 6, x + 8, y - 14)
    ctx.stroke()
  } else if (isAngry) {
    ctx.beginPath()
    ctx.moveTo(x - 10, y + 1)
    ctx.lineTo(x + 4, y + 6)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(x + 10, y + 1)
    ctx.lineTo(x - 4, y + 6)
    ctx.stroke()
  } else {
    ctx.beginPath()
    ctx.moveTo(x - 10, y + 1)
    ctx.lineTo(x - 15 - Math.sin(armSwing) * 5, y + 12 + Math.sin(armSwing) * 3)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(x + 10, y + 1)
    ctx.lineTo(x + 15 + Math.sin(armSwing) * 5, y + 12 - Math.sin(armSwing) * 3)
    ctx.stroke()
  }

  // Head - directly on top of body (no gap)
  ctx.font = '20px serif'
  ctx.textAlign = 'center'
  ctx.fillText(customer.emoji, x, y - 8 + breathe)

  ctx.restore()
}

export function drawStaffBody(ctx, x, y, staff, frameCount) {
  const isMoving = staff.moving || staff.returning
  const isBusy = staff.busy && !isMoving
  const isCarrying = staff.carryingDish != null
  const walkPhase = staff.walkFrame * 0.15
  const breathe = Math.sin(frameCount * 0.04) * 0.5
  const isWaiter = staff.type === 'waiter'
  const bodyColor = isWaiter ? WAITER_COLOR : CASHIER_COLOR
  const accentColor = isWaiter ? WAITER_APRON : CASHIER_VEST

  ctx.save()

  // Shadow
  ctx.beginPath()
  ctx.ellipse(x, y + 26, 13, 4.5, 0, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(0,0,0,0.12)'
  ctx.fill()

  // Legs
  const legSwing = isMoving ? Math.sin(walkPhase) * 0.5 : 0
  ctx.strokeStyle = '#2C3E50'
  ctx.lineWidth = 3.5
  ctx.lineCap = 'round'

  ctx.beginPath()
  ctx.moveTo(x - 5, y + 13)
  ctx.lineTo(x - 5 - Math.sin(legSwing) * 6, y + 24)
  ctx.stroke()

  ctx.beginPath()
  ctx.moveTo(x + 5, y + 13)
  ctx.lineTo(x + 5 + Math.sin(legSwing) * 6, y + 24)
  ctx.stroke()

  // Shoes
  ctx.fillStyle = '#1a1a1a'
  ctx.beginPath()
  ctx.ellipse(x - 5 - Math.sin(legSwing) * 6, y + 25, 4.5, 2.5, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(x + 5 + Math.sin(legSwing) * 6, y + 25, 4.5, 2.5, 0, 0, Math.PI * 2)
  ctx.fill()

  // Torso
  ctx.beginPath()
  ctx.roundRect(x - 9, y - 4 + breathe, 18, 18, 6)
  ctx.fillStyle = bodyColor
  ctx.fill()
  ctx.strokeStyle = 'rgba(0,0,0,0.08)'
  ctx.lineWidth = 1
  ctx.stroke()

  // Apron/Vest overlay
  ctx.beginPath()
  ctx.roundRect(x - 8, y + 0 + breathe, 16, 13, 4)
  ctx.fillStyle = accentColor
  ctx.globalAlpha = 0.75
  ctx.fill()
  ctx.globalAlpha = 1

  // Belt/strap detail
  ctx.beginPath()
  ctx.moveTo(x - 8, y + 0 + breathe)
  ctx.lineTo(x + 8, y + 0 + breathe)
  ctx.strokeStyle = 'rgba(0,0,0,0.15)'
  ctx.lineWidth = 1.5
  ctx.stroke()

  // Arms
  const armSwing = isMoving ? Math.sin(walkPhase) * 0.35 : 0
  const skinColor = '#FFDAB9'
  ctx.strokeStyle = skinColor
  ctx.lineWidth = 4
  ctx.lineCap = 'round'

  if (isCarrying && isMoving) {
    // Both arms raised carrying a tray
    ctx.beginPath()
    ctx.moveTo(x - 9, y + 0)
    ctx.quadraticCurveTo(x - 16, y - 8, x - 12, y - 14)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(x + 9, y + 0)
    ctx.quadraticCurveTo(x + 16, y - 8, x + 12, y - 14)
    ctx.stroke()

    // Tray
    ctx.beginPath()
    ctx.ellipse(x, y - 16, 14, 4, 0, 0, Math.PI * 2)
    ctx.fillStyle = '#C0C0C0'
    ctx.fill()
    ctx.strokeStyle = '#999'
    ctx.lineWidth = 1
    ctx.stroke()

    // Dish on tray
    const dishBob = Math.sin(frameCount * 0.08) * 1
    ctx.font = '14px serif'
    ctx.textAlign = 'center'
    ctx.fillText(staff.carryingDish, x, y - 20 + dishBob)
  } else if (isBusy) {
    // One arm extended (serving action)
    ctx.beginPath()
    ctx.moveTo(x - 9, y + 0)
    ctx.lineTo(x - 14, y + 8)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(x + 9, y + 0)
    ctx.quadraticCurveTo(x + 18, y - 6, x + 20, y - 12)
    ctx.stroke()
  } else {
    // Normal idle/swing
    ctx.beginPath()
    ctx.moveTo(x - 9, y + 0)
    ctx.lineTo(x - 14 - Math.sin(armSwing) * 4, y + 10 + Math.sin(armSwing) * 3)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(x + 9, y + 0)
    ctx.lineTo(x + 14 + Math.sin(armSwing) * 4, y + 10 - Math.sin(armSwing) * 3)
    ctx.stroke()
  }

  // Head - directly on body (no gap)
  ctx.font = '18px serif'
  ctx.textAlign = 'center'
  ctx.fillText(staff.emoji, x, y - 8 + breathe)

  ctx.restore()
}

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
  ctx.ellipse(x, y + 24, 14, 5, 0, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(0,0,0,0.08)'
  ctx.fill()

  // Legs
  const legSwing = isWalking ? Math.sin(walkPhase) * 0.5 : 0
  ctx.strokeStyle = '#8B6914'
  ctx.lineWidth = 3
  ctx.lineCap = 'round'

  // Left leg
  ctx.beginPath()
  ctx.moveTo(x - 5, y + 10)
  ctx.lineTo(x - 5 - Math.sin(legSwing) * 7, y + 23)
  ctx.stroke()

  // Right leg
  ctx.beginPath()
  ctx.moveTo(x + 5, y + 10)
  ctx.lineTo(x + 5 + Math.sin(legSwing) * 7, y + 23)
  ctx.stroke()

  // Shoes
  ctx.fillStyle = '#5D4037'
  ctx.beginPath()
  ctx.ellipse(x - 5 - Math.sin(legSwing) * 7, y + 24, 4, 2.5, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(x + 5 + Math.sin(legSwing) * 7, y + 24, 4, 2.5, 0, 0, Math.PI * 2)
  ctx.fill()

  // Torso
  ctx.beginPath()
  ctx.roundRect(x - 9, y - 10 + breathe, 18, 21, 6)
  ctx.fillStyle = bodyColor
  ctx.fill()
  ctx.strokeStyle = 'rgba(0,0,0,0.1)'
  ctx.lineWidth = 1
  ctx.stroke()

  // Arms
  const armSwing = isWalking ? Math.sin(walkPhase) * 0.4 : 0
  ctx.strokeStyle = bodyColor
  ctx.lineWidth = 4
  ctx.lineCap = 'round'

  if (isEating) {
    // Left arm at side
    ctx.beginPath()
    ctx.moveTo(x - 9, y - 4)
    ctx.lineTo(x - 15, y + 6)
    ctx.stroke()
    // Right arm raised to mouth
    ctx.beginPath()
    ctx.moveTo(x + 9, y - 4)
    ctx.quadraticCurveTo(x + 16, y - 12, x + 6, y - 22)
    ctx.stroke()
  } else if (isAngry) {
    // Arms crossed
    ctx.beginPath()
    ctx.moveTo(x - 9, y - 4)
    ctx.lineTo(x + 5, y + 4)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(x + 9, y - 4)
    ctx.lineTo(x - 5, y + 4)
    ctx.stroke()
  } else {
    // Left arm
    ctx.beginPath()
    ctx.moveTo(x - 9, y - 4)
    ctx.lineTo(x - 15 - Math.sin(armSwing) * 5, y + 8 + Math.sin(armSwing) * 3)
    ctx.stroke()
    // Right arm
    ctx.beginPath()
    ctx.moveTo(x + 9, y - 4)
    ctx.lineTo(x + 15 + Math.sin(armSwing) * 5, y + 8 - Math.sin(armSwing) * 3)
    ctx.stroke()
  }

  // Arm outline for definition
  ctx.strokeStyle = 'rgba(0,0,0,0.08)'
  ctx.lineWidth = 1

  // Head (emoji)
  ctx.font = '22px serif'
  ctx.textAlign = 'center'
  ctx.fillText(customer.emoji, x, y - 16)

  ctx.restore()
}

export function drawStaffBody(ctx, x, y, staff, frameCount) {
  const isMoving = staff.moving || staff.returning
  const isBusy = staff.busy && !isMoving
  const walkPhase = staff.walkFrame * 0.15
  const breathe = Math.sin(frameCount * 0.04) * 0.5
  const isWaiter = staff.type === 'waiter'
  const bodyColor = isWaiter ? WAITER_COLOR : CASHIER_COLOR
  const accentColor = isWaiter ? WAITER_APRON : CASHIER_VEST

  ctx.save()

  // Shadow
  ctx.beginPath()
  ctx.ellipse(x, y + 22, 12, 4, 0, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(0,0,0,0.1)'
  ctx.fill()

  // Legs
  const legSwing = isMoving ? Math.sin(walkPhase) * 0.5 : 0
  ctx.strokeStyle = '#2C3E50'
  ctx.lineWidth = 3
  ctx.lineCap = 'round'

  ctx.beginPath()
  ctx.moveTo(x - 4, y + 9)
  ctx.lineTo(x - 4 - Math.sin(legSwing) * 6, y + 21)
  ctx.stroke()

  ctx.beginPath()
  ctx.moveTo(x + 4, y + 9)
  ctx.lineTo(x + 4 + Math.sin(legSwing) * 6, y + 21)
  ctx.stroke()

  // Shoes
  ctx.fillStyle = '#1a1a1a'
  ctx.beginPath()
  ctx.ellipse(x - 4 - Math.sin(legSwing) * 6, y + 22, 4, 2.5, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(x + 4 + Math.sin(legSwing) * 6, y + 22, 4, 2.5, 0, 0, Math.PI * 2)
  ctx.fill()

  // Torso
  ctx.beginPath()
  ctx.roundRect(x - 8, y - 10 + breathe, 16, 20, 5)
  ctx.fillStyle = bodyColor
  ctx.fill()
  ctx.strokeStyle = 'rgba(0,0,0,0.1)'
  ctx.lineWidth = 1
  ctx.stroke()

  // Apron/Vest overlay
  ctx.beginPath()
  ctx.roundRect(x - 7, y - 4 + breathe, 14, 14, 4)
  ctx.fillStyle = accentColor
  ctx.globalAlpha = 0.7
  ctx.fill()
  ctx.globalAlpha = 1

  // Arms
  const armSwing = isMoving ? Math.sin(walkPhase) * 0.35 : 0
  ctx.strokeStyle = bodyColor
  ctx.lineWidth = 3.5
  ctx.lineCap = 'round'

  if (isBusy) {
    // One arm extended forward (serving)
    ctx.beginPath()
    ctx.moveTo(x - 8, y - 5)
    ctx.lineTo(x - 14, y + 5)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(x + 8, y - 5)
    ctx.quadraticCurveTo(x + 18, y - 10, x + 20, y - 15)
    ctx.stroke()
  } else {
    // Normal swing
    ctx.beginPath()
    ctx.moveTo(x - 8, y - 5)
    ctx.lineTo(x - 13 - Math.sin(armSwing) * 4, y + 6 + Math.sin(armSwing) * 3)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(x + 8, y - 5)
    ctx.lineTo(x + 13 + Math.sin(armSwing) * 4, y + 6 - Math.sin(armSwing) * 3)
    ctx.stroke()
  }

  // Head (emoji)
  ctx.font = '20px serif'
  ctx.textAlign = 'center'
  ctx.fillText(staff.emoji, x, y - 16)

  ctx.restore()
}

const BODY_COLORS = ['#FFB3BA', '#BAFFC9', '#BAE1FF', '#FFFFBA', '#E8BAFF', '#FFD4BA', '#B3E0FF', '#FFE0B3']

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
  const breathe = Math.sin(frameCount * 0.04) * 0.3

  ctx.save()

  // Shadow
  ctx.beginPath()
  ctx.ellipse(x, y + 26, 12, 4, 0, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(0,0,0,0.1)'
  ctx.fill()

  // Legs
  const legSwing = isWalking ? Math.sin(walkPhase) * 0.5 : 0
  ctx.strokeStyle = '#5D4037'
  ctx.lineWidth = 3.5
  ctx.lineCap = 'round'

  ctx.beginPath()
  ctx.moveTo(x - 4, y + 13)
  ctx.lineTo(x - 4 - Math.sin(legSwing) * 6, y + 24)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(x + 4, y + 13)
  ctx.lineTo(x + 4 + Math.sin(legSwing) * 6, y + 24)
  ctx.stroke()

  // Shoes
  ctx.fillStyle = '#3E2723'
  ctx.beginPath()
  ctx.ellipse(x - 4 - Math.sin(legSwing) * 6, y + 25, 4.5, 3, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(x + 4 + Math.sin(legSwing) * 6, y + 25, 4.5, 3, 0, 0, Math.PI * 2)
  ctx.fill()

  // Torso
  ctx.beginPath()
  ctx.roundRect(x - 9, y - 2 + breathe, 18, 16, 5)
  ctx.fillStyle = bodyColor
  ctx.fill()
  ctx.strokeStyle = 'rgba(0,0,0,0.06)'
  ctx.lineWidth = 0.8
  ctx.stroke()

  // Arms (skin color)
  const armSwing = isWalking ? Math.sin(walkPhase) * 0.4 : 0
  ctx.strokeStyle = '#FDBCB4'
  ctx.lineWidth = 3.5
  ctx.lineCap = 'round'

  if (isEating) {
    ctx.beginPath()
    ctx.moveTo(x - 9, y + 2)
    ctx.lineTo(x - 14, y + 10)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(x + 9, y + 2)
    ctx.quadraticCurveTo(x + 14, y - 4, x + 6, y - 10)
    ctx.stroke()
  } else if (isAngry) {
    ctx.beginPath()
    ctx.moveTo(x - 9, y + 2)
    ctx.lineTo(x + 3, y + 7)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(x + 9, y + 2)
    ctx.lineTo(x - 3, y + 7)
    ctx.stroke()
  } else {
    ctx.beginPath()
    ctx.moveTo(x - 9, y + 2)
    ctx.lineTo(x - 14 - Math.sin(armSwing) * 4, y + 12 + Math.sin(armSwing) * 2)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(x + 9, y + 2)
    ctx.lineTo(x + 14 + Math.sin(armSwing) * 4, y + 12 - Math.sin(armSwing) * 2)
    ctx.stroke()
  }

  // Neck
  ctx.fillStyle = '#FDBCB4'
  ctx.fillRect(x - 3, y - 5 + breathe, 6, 5)

  // Head (emoji) - positioned right above neck
  ctx.font = '18px serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'bottom'
  ctx.fillText(customer.emoji, x, y - 3 + breathe)
  ctx.textBaseline = 'alphabetic'

  ctx.restore()
}

export function drawStaffBody(ctx, x, y, staff, frameCount) {
  const isMoving = staff.moving || staff.returning
  const isBusy = staff.busy && !isMoving
  const isCarrying = staff.carryingDish != null
  const walkPhase = staff.walkFrame * 0.15
  const breathe = Math.sin(frameCount * 0.04) * 0.3
  const isWaiter = staff.type === 'waiter'

  ctx.save()

  // Shadow
  ctx.beginPath()
  ctx.ellipse(x, y + 26, 12, 4, 0, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(0,0,0,0.12)'
  ctx.fill()

  // Legs
  const legSwing = isMoving ? Math.sin(walkPhase) * 0.5 : 0
  ctx.strokeStyle = '#2C3E50'
  ctx.lineWidth = 3.5
  ctx.lineCap = 'round'

  ctx.beginPath()
  ctx.moveTo(x - 4, y + 13)
  ctx.lineTo(x - 4 - Math.sin(legSwing) * 5, y + 24)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(x + 4, y + 13)
  ctx.lineTo(x + 4 + Math.sin(legSwing) * 5, y + 24)
  ctx.stroke()

  // Shoes
  ctx.fillStyle = '#1a1a1a'
  ctx.beginPath()
  ctx.ellipse(x - 4 - Math.sin(legSwing) * 5, y + 25, 4.5, 3, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(x + 4 + Math.sin(legSwing) * 5, y + 25, 4.5, 3, 0, 0, Math.PI * 2)
  ctx.fill()

  // Torso (uniform)
  ctx.beginPath()
  ctx.roundRect(x - 9, y - 2 + breathe, 18, 16, 5)
  ctx.fillStyle = isWaiter ? '#FFFFFF' : '#E8D5F5'
  ctx.fill()
  ctx.strokeStyle = 'rgba(0,0,0,0.06)'
  ctx.lineWidth = 0.8
  ctx.stroke()

  // Apron/Vest
  if (isWaiter) {
    // Waiter apron
    ctx.beginPath()
    ctx.moveTo(x - 7, y + 2 + breathe)
    ctx.lineTo(x - 8, y + 13 + breathe)
    ctx.lineTo(x + 8, y + 13 + breathe)
    ctx.lineTo(x + 7, y + 2 + breathe)
    ctx.closePath()
    ctx.fillStyle = 'rgba(52, 152, 219, 0.7)'
    ctx.fill()
    // Apron strings
    ctx.beginPath()
    ctx.moveTo(x - 5, y + 2 + breathe)
    ctx.lineTo(x, y + 4 + breathe)
    ctx.lineTo(x + 5, y + 2 + breathe)
    ctx.strokeStyle = 'rgba(52, 152, 219, 0.9)'
    ctx.lineWidth = 1
    ctx.stroke()
  } else {
    // Cashier vest
    ctx.beginPath()
    ctx.roundRect(x - 7, y + 0 + breathe, 14, 12, 3)
    ctx.fillStyle = 'rgba(142, 68, 173, 0.65)'
    ctx.fill()
    // Collar
    ctx.beginPath()
    ctx.moveTo(x - 4, y - 1 + breathe)
    ctx.lineTo(x, y + 3 + breathe)
    ctx.lineTo(x + 4, y - 1 + breathe)
    ctx.strokeStyle = 'rgba(142, 68, 173, 0.9)'
    ctx.lineWidth = 1.2
    ctx.stroke()
  }

  // Arms
  const armSwing = isMoving ? Math.sin(walkPhase) * 0.35 : 0
  ctx.strokeStyle = '#FDBCB4'
  ctx.lineWidth = 3.5
  ctx.lineCap = 'round'

  if (isCarrying && isMoving) {
    // Both arms up carrying tray
    ctx.beginPath()
    ctx.moveTo(x - 9, y + 1)
    ctx.quadraticCurveTo(x - 14, y - 6, x - 10, y - 12)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(x + 9, y + 1)
    ctx.quadraticCurveTo(x + 14, y - 6, x + 10, y - 12)
    ctx.stroke()

    // Tray (silver plate)
    ctx.beginPath()
    ctx.ellipse(x, y - 14, 13, 4, 0, 0, Math.PI * 2)
    const trayGrad = ctx.createLinearGradient(x - 13, y - 14, x + 13, y - 14)
    trayGrad.addColorStop(0, '#B0B0B0')
    trayGrad.addColorStop(0.5, '#E0E0E0')
    trayGrad.addColorStop(1, '#A0A0A0')
    ctx.fillStyle = trayGrad
    ctx.fill()
    ctx.strokeStyle = '#888'
    ctx.lineWidth = 0.8
    ctx.stroke()

    // Dish on tray
    const dishBob = Math.sin(frameCount * 0.1) * 0.8
    ctx.font = '13px serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'bottom'
    ctx.fillText(staff.carryingDish, x, y - 15 + dishBob)
    ctx.textBaseline = 'alphabetic'
  } else if (isBusy) {
    ctx.beginPath()
    ctx.moveTo(x - 9, y + 1)
    ctx.lineTo(x - 14, y + 9)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(x + 9, y + 1)
    ctx.quadraticCurveTo(x + 16, y - 4, x + 18, y - 10)
    ctx.stroke()
  } else {
    ctx.beginPath()
    ctx.moveTo(x - 9, y + 1)
    ctx.lineTo(x - 13 - Math.sin(armSwing) * 4, y + 10 + Math.sin(armSwing) * 2)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(x + 9, y + 1)
    ctx.lineTo(x + 13 + Math.sin(armSwing) * 4, y + 10 - Math.sin(armSwing) * 2)
    ctx.stroke()
  }

  // Neck
  ctx.fillStyle = '#FDBCB4'
  ctx.fillRect(x - 2.5, y - 5 + breathe, 5, 5)

  // Head - canvas drawn face (no emoji, avoids font rendering gaps)
  _drawStaffHead(ctx, x, y - 11 + breathe, isWaiter, frameCount)

  ctx.restore()
}

function _drawStaffHead(ctx, x, y, isWaiter, frameCount) {
  // Head circle
  ctx.beginPath()
  ctx.arc(x, y, 9, 0, Math.PI * 2)
  ctx.fillStyle = '#FDBCB4'
  ctx.fill()
  ctx.strokeStyle = 'rgba(0,0,0,0.08)'
  ctx.lineWidth = 0.5
  ctx.stroke()

  // Hair
  ctx.beginPath()
  if (isWaiter) {
    // Short tidy hair with chef hat hint
    ctx.arc(x, y - 2, 9, Math.PI, 0, false)
    ctx.fillStyle = '#4a3728'
    ctx.fill()
    // Chef hat
    ctx.beginPath()
    ctx.roundRect(x - 6, y - 14, 12, 7, 3)
    ctx.fillStyle = '#fff'
    ctx.fill()
    ctx.strokeStyle = 'rgba(0,0,0,0.1)'
    ctx.lineWidth = 0.5
    ctx.stroke()
    // Hat band
    ctx.fillStyle = isWaiter ? '#3498db' : '#8e44ad'
    ctx.fillRect(x - 6, y - 8, 12, 2)
  } else {
    // Neat tied-back hair for cashier
    ctx.arc(x, y - 1, 9, Math.PI + 0.3, -0.3, false)
    ctx.fillStyle = '#2c1a0e'
    ctx.fill()
    // Hair bun
    ctx.beginPath()
    ctx.arc(x + 7, y - 3, 4, 0, Math.PI * 2)
    ctx.fillStyle = '#2c1a0e'
    ctx.fill()
    // Hairband
    ctx.beginPath()
    ctx.arc(x, y - 1, 9.5, Math.PI + 0.5, -0.5, false)
    ctx.strokeStyle = '#8e44ad'
    ctx.lineWidth = 1.5
    ctx.stroke()
  }

  // Eyes
  const blink = Math.sin(frameCount * 0.03) > 0.97 ? 0.3 : 1
  ctx.fillStyle = '#333'
  ctx.beginPath()
  ctx.ellipse(x - 3, y + 1, 1.5, 1.5 * blink, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(x + 3, y + 1, 1.5, 1.5 * blink, 0, 0, Math.PI * 2)
  ctx.fill()

  // Eye highlights
  ctx.fillStyle = '#fff'
  ctx.beginPath()
  ctx.arc(x - 2.5, y + 0.5, 0.6, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(x + 3.5, y + 0.5, 0.6, 0, Math.PI * 2)
  ctx.fill()

  // Mouth (small smile)
  ctx.beginPath()
  ctx.arc(x, y + 4, 2.5, 0.1, Math.PI - 0.1, false)
  ctx.strokeStyle = '#c0392b'
  ctx.lineWidth = 1
  ctx.stroke()

  // Blush
  ctx.fillStyle = 'rgba(255, 150, 150, 0.25)'
  ctx.beginPath()
  ctx.ellipse(x - 5, y + 3, 2.5, 1.5, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(x + 5, y + 3, 2.5, 1.5, 0, 0, Math.PI * 2)
  ctx.fill()
}

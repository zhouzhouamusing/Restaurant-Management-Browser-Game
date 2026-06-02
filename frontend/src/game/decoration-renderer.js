/**
 * Procedural rendering functions for decorations, wallpapers, and floors
 */

// ===== WALLPAPER RENDERERS =====

export function drawCreamWall(ctx, w, h, wallH) {
  const grad = ctx.createLinearGradient(0, 0, 0, wallH)
  grad.addColorStop(0, '#fff8e7')
  grad.addColorStop(0.5, '#fff5e0')
  grad.addColorStop(1, '#fff3d4')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, w, wallH)

  // ceiling shadow
  const ceilShadow = ctx.createLinearGradient(0, 0, 0, 20)
  ceilShadow.addColorStop(0, 'rgba(0,0,0,0.06)')
  ceilShadow.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = ceilShadow
  ctx.fillRect(0, 0, w, 20)
}

export function drawBrickWall(ctx, w, h, wallH) {
  const baseColor = '#c0392b'
  const mortarColor = '#f5e6d3'
  ctx.fillStyle = mortarColor
  ctx.fillRect(0, 0, w, wallH)

  const brickW = 40
  const brickH = 18
  const gap = 3

  for (let row = 0; row * (brickH + gap) < wallH; row++) {
    const offsetX = (row % 2) * (brickW / 2 + gap / 2)
    const y = row * (brickH + gap)
    for (let col = -1; col * (brickW + gap) < w + brickW; col++) {
      const x = col * (brickW + gap) + offsetX
      const shade = 0.85 + Math.sin(row * 3.7 + col * 2.3) * 0.15
      const r = Math.floor(192 * shade)
      const g = Math.floor(57 * shade)
      const b = Math.floor(43 * shade)
      ctx.fillStyle = `rgb(${r},${g},${b})`
      ctx.beginPath()
      ctx.roundRect(x, y, brickW, brickH, 2)
      ctx.fill()

      // bottom shadow
      ctx.fillStyle = 'rgba(0,0,0,0.1)'
      ctx.fillRect(x + 1, y + brickH - 3, brickW - 2, 3)

      // top highlight
      ctx.fillStyle = 'rgba(255,255,255,0.08)'
      ctx.fillRect(x + 1, y, brickW - 2, 2)
    }
  }

  // ceiling shadow
  const ceilShadow = ctx.createLinearGradient(0, 0, 0, 25)
  ceilShadow.addColorStop(0, 'rgba(0,0,0,0.12)')
  ceilShadow.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = ceilShadow
  ctx.fillRect(0, 0, w, 25)
}

export function drawStripeWall(ctx, w, h, wallH) {
  const grad = ctx.createLinearGradient(0, 0, 0, wallH)
  grad.addColorStop(0, '#fef9e7')
  grad.addColorStop(1, '#fdf2d6')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, w, wallH)

  const stripeW = 18
  for (let x = 0; x < w; x += stripeW * 2) {
    const stripeGrad = ctx.createLinearGradient(x, 0, x + stripeW, 0)
    stripeGrad.addColorStop(0, 'rgba(241, 196, 15, 0.15)')
    stripeGrad.addColorStop(0.5, 'rgba(241, 196, 15, 0.25)')
    stripeGrad.addColorStop(1, 'rgba(241, 196, 15, 0.15)')
    ctx.fillStyle = stripeGrad
    ctx.fillRect(x, 0, stripeW, wallH)
  }

  // depth: vertical edge shadows
  ctx.fillStyle = 'rgba(0,0,0,0.04)'
  ctx.fillRect(0, 0, 3, wallH)
  ctx.fillRect(w - 3, 0, 3, wallH)

  // ceiling shadow
  const ceilShadow = ctx.createLinearGradient(0, 0, 0, 18)
  ceilShadow.addColorStop(0, 'rgba(0,0,0,0.08)')
  ceilShadow.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = ceilShadow
  ctx.fillRect(0, 0, w, 18)
}

export function drawFloralWall(ctx, w, h, wallH) {
  const grad = ctx.createLinearGradient(0, 0, 0, wallH)
  grad.addColorStop(0, '#fef9f2')
  grad.addColorStop(1, '#fdf0e6')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, w, wallH)

  // draw small floral motifs
  const spacing = 60
  for (let row = 0; row * spacing < wallH; row++) {
    for (let col = 0; col * spacing < w; col++) {
      const cx = col * spacing + 30 + (row % 2) * 30
      const cy = row * spacing + 30
      if (cy > wallH - 10) continue
      drawSmallFlower(ctx, cx, cy, 8 + Math.sin(row + col) * 2)
    }
  }

  // ceiling shadow
  const ceilShadow = ctx.createLinearGradient(0, 0, 0, 20)
  ceilShadow.addColorStop(0, 'rgba(0,0,0,0.07)')
  ceilShadow.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = ceilShadow
  ctx.fillRect(0, 0, w, 20)
}

function drawSmallFlower(ctx, cx, cy, size) {
  ctx.save()
  ctx.globalAlpha = 0.3
  const petalCount = 5
  for (let i = 0; i < petalCount; i++) {
    const angle = (i / petalCount) * Math.PI * 2
    const px = cx + Math.cos(angle) * size * 0.6
    const py = cy + Math.sin(angle) * size * 0.6
    ctx.beginPath()
    ctx.ellipse(px, py, size * 0.4, size * 0.25, angle, 0, Math.PI * 2)
    ctx.fillStyle = i % 2 === 0 ? '#e8a0bf' : '#f0c0d8'
    ctx.fill()
  }
  ctx.beginPath()
  ctx.arc(cx, cy, size * 0.2, 0, Math.PI * 2)
  ctx.fillStyle = '#f4d03f'
  ctx.fill()
  ctx.restore()
}

// ===== FLOOR RENDERERS =====

export function drawWoodFloor(ctx, w, floorY, floorH) {
  const grad = ctx.createLinearGradient(0, floorY, 0, floorY + floorH)
  grad.addColorStop(0, '#d4a76a')
  grad.addColorStop(0.3, '#c9956a')
  grad.addColorStop(0.7, '#b8845a')
  grad.addColorStop(1, '#a07040')
  ctx.fillStyle = grad
  ctx.fillRect(0, floorY, w, floorH)

  const plankH = 28
  const plankColors = ['#c49060', '#b88050', '#d4a070', '#c89565', '#be8855']
  let rowIdx = 0

  for (let y = floorY; y < floorY + floorH; y += plankH) {
    // perspective: planks get narrower toward back
    const depth = (y - floorY) / floorH
    const perspH = plankH * (0.7 + 0.3 * depth)

    let plankW = 60 + depth * 40
    let x = (rowIdx % 2) * plankW * 0.5

    while (x < w) {
      const colorIdx = Math.abs(Math.floor(Math.sin(x * 0.1 + rowIdx * 2.3) * plankColors.length)) % plankColors.length
      ctx.fillStyle = plankColors[colorIdx]
      ctx.fillRect(x, y, plankW - 2, perspH - 1)

      // grain lines
      ctx.strokeStyle = 'rgba(90, 50, 20, 0.08)'
      ctx.lineWidth = 0.5
      for (let g = 0; g < 3; g++) {
        ctx.beginPath()
        const gy = y + perspH * (0.2 + g * 0.3)
        ctx.moveTo(x + 3, gy)
        ctx.quadraticCurveTo(x + plankW * 0.5, gy + Math.sin(x + g) * 2, x + plankW - 3, gy)
        ctx.stroke()
      }

      // plank bottom edge shadow
      ctx.fillStyle = 'rgba(0,0,0,0.06)'
      ctx.fillRect(x, y + perspH - 2, plankW - 2, 2)

      // plank top highlight
      ctx.fillStyle = 'rgba(255,255,255,0.04)'
      ctx.fillRect(x, y, plankW - 2, 1)

      x += plankW
    }
    rowIdx++
  }

  // overall floor top-edge shadow (where wall meets floor)
  const topShadow = ctx.createLinearGradient(0, floorY, 0, floorY + 15)
  topShadow.addColorStop(0, 'rgba(0,0,0,0.15)')
  topShadow.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = topShadow
  ctx.fillRect(0, floorY, w, 15)
}

export function drawCheckerFloor(ctx, w, floorY, floorH) {
  ctx.fillStyle = '#ddd'
  ctx.fillRect(0, floorY, w, floorH)

  const vanishX = w / 2
  const vanishY = floorY - 30
  const tileRows = 10
  const tileCols = 12

  for (let row = 0; row < tileRows; row++) {
    const t0 = row / tileRows
    const t1 = (row + 1) / tileRows
    const y0 = floorY + floorH * t0
    const y1 = floorY + floorH * t1

    const shrink0 = 0.4 + 0.6 * t0
    const shrink1 = 0.4 + 0.6 * t1

    for (let col = 0; col < tileCols; col++) {
      const u0 = col / tileCols
      const u1 = (col + 1) / tileCols

      const x0Top = vanishX + (u0 - 0.5) * w * shrink0
      const x1Top = vanishX + (u1 - 0.5) * w * shrink0
      const x0Bot = vanishX + (u0 - 0.5) * w * shrink1
      const x1Bot = vanishX + (u1 - 0.5) * w * shrink1

      const isDark = (row + col) % 2 === 0
      ctx.fillStyle = isDark ? '#2c3e50' : '#ecf0f1'

      ctx.beginPath()
      ctx.moveTo(x0Top, y0)
      ctx.lineTo(x1Top, y0)
      ctx.lineTo(x1Bot, y1)
      ctx.lineTo(x0Bot, y1)
      ctx.closePath()
      ctx.fill()

      // tile edge highlight
      ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'
      ctx.lineWidth = 0.5
      ctx.stroke()
    }
  }

  // top-edge shadow
  const topShadow = ctx.createLinearGradient(0, floorY, 0, floorY + 20)
  topShadow.addColorStop(0, 'rgba(0,0,0,0.18)')
  topShadow.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = topShadow
  ctx.fillRect(0, floorY, w, 20)
}

export function drawTerracottaFloor(ctx, w, floorY, floorH) {
  const grad = ctx.createLinearGradient(0, floorY, 0, floorY + floorH)
  grad.addColorStop(0, '#d4856a')
  grad.addColorStop(1, '#b86a50')
  ctx.fillStyle = grad
  ctx.fillRect(0, floorY, w, floorH)

  // hex tiles
  const hexR = 22
  const hexH = hexR * Math.sqrt(3)
  const hexW = hexR * 2
  const colors = ['#cc7755', '#d48866', '#c07050', '#d89070']

  let row = 0
  for (let y = floorY; y < floorY + floorH + hexH; y += hexH * 0.75) {
    const offset = (row % 2) * hexR * 1.5
    for (let x = offset; x < w + hexW; x += hexW * 1.5) {
      const depth = (y - floorY) / floorH
      const scale = 0.75 + 0.25 * depth
      const colorIdx = Math.abs(Math.floor(Math.sin(x * 0.05 + y * 0.03) * colors.length)) % colors.length

      ctx.save()
      ctx.translate(x, y)
      ctx.scale(scale, scale)
      drawHexagon(ctx, 0, 0, hexR - 1, colors[colorIdx])
      ctx.restore()
    }
    row++
  }

  // top shadow
  const topShadow = ctx.createLinearGradient(0, floorY, 0, floorY + 15)
  topShadow.addColorStop(0, 'rgba(0,0,0,0.15)')
  topShadow.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = topShadow
  ctx.fillRect(0, floorY, w, 15)
}

function drawHexagon(ctx, cx, cy, r, color) {
  ctx.beginPath()
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 6
    const x = cx + r * Math.cos(angle)
    const y = cy + r * Math.sin(angle)
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.closePath()
  ctx.fillStyle = color
  ctx.fill()
  ctx.strokeStyle = 'rgba(80, 40, 20, 0.2)'
  ctx.lineWidth = 1.5
  ctx.stroke()

  // inner highlight
  ctx.beginPath()
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 6
    const x = cx + r * 0.7 * Math.cos(angle)
    const y = cy + r * 0.7 * Math.sin(angle)
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.closePath()
  ctx.fillStyle = 'rgba(255,255,255,0.06)'
  ctx.fill()
}

export function drawMarbleFloor(ctx, w, floorY, floorH) {
  const grad = ctx.createLinearGradient(0, floorY, 0, floorY + floorH)
  grad.addColorStop(0, '#f0ece4')
  grad.addColorStop(0.5, '#e8e2d8')
  grad.addColorStop(1, '#ddd6cc')
  ctx.fillStyle = grad
  ctx.fillRect(0, floorY, w, floorH)

  // marble veins
  ctx.save()
  ctx.globalAlpha = 0.08
  ctx.strokeStyle = '#8a7a6a'
  ctx.lineWidth = 1
  for (let i = 0; i < 20; i++) {
    ctx.beginPath()
    const startX = Math.sin(i * 1.7) * w
    const startY = floorY + Math.cos(i * 2.1) * floorH * 0.5 + floorH * 0.3
    ctx.moveTo(startX, startY)
    ctx.bezierCurveTo(
      startX + 80 + Math.sin(i) * 40, startY + Math.cos(i * 0.7) * 30,
      startX + 160 + Math.cos(i) * 60, startY + Math.sin(i * 1.3) * 40,
      startX + 250 + Math.sin(i * 0.5) * 50, startY + Math.cos(i * 0.9) * 20
    )
    ctx.stroke()
  }
  ctx.restore()

  // tile grid with perspective
  const tileCols = 8
  const tileRows = 6
  const vanishX = w / 2

  ctx.strokeStyle = 'rgba(160, 140, 120, 0.2)'
  ctx.lineWidth = 1.5

  for (let row = 0; row <= tileRows; row++) {
    const t = row / tileRows
    const y = floorY + floorH * t
    const shrink = 0.5 + 0.5 * t
    const leftX = vanishX - (w * shrink) / 2
    const rightX = vanishX + (w * shrink) / 2
    ctx.beginPath()
    ctx.moveTo(leftX, y)
    ctx.lineTo(rightX, y)
    ctx.stroke()
  }

  for (let col = 0; col <= tileCols; col++) {
    const u = col / tileCols
    ctx.beginPath()
    const x0 = vanishX + (u - 0.5) * w * 0.5
    const x1 = vanishX + (u - 0.5) * w * 1.0
    ctx.moveTo(x0, floorY)
    ctx.lineTo(x1, floorY + floorH)
    ctx.stroke()
  }

  // reflective shine
  const shine = ctx.createRadialGradient(w * 0.4, floorY + floorH * 0.4, 10, w * 0.4, floorY + floorH * 0.4, floorH * 0.6)
  shine.addColorStop(0, 'rgba(255,255,255,0.08)')
  shine.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = shine
  ctx.fillRect(0, floorY, w, floorH)

  // top shadow
  const topShadow = ctx.createLinearGradient(0, floorY, 0, floorY + 18)
  topShadow.addColorStop(0, 'rgba(0,0,0,0.12)')
  topShadow.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = topShadow
  ctx.fillRect(0, floorY, w, 18)
}

// ===== DECORATION RENDERERS =====

export function drawMonstera(ctx, x, y, w, h) {
  // pot
  const potW = w * 0.4
  const potH = h * 0.3
  const potX = x - potW / 2
  const potY = y + h * 0.65

  ctx.beginPath()
  ctx.moveTo(potX, potY)
  ctx.lineTo(potX + potW, potY)
  ctx.lineTo(potX + potW * 0.85, potY + potH)
  ctx.lineTo(potX + potW * 0.15, potY + potH)
  ctx.closePath()
  const potGrad = ctx.createLinearGradient(potX, potY, potX + potW, potY)
  potGrad.addColorStop(0, '#8B4513')
  potGrad.addColorStop(0.5, '#A0522D')
  potGrad.addColorStop(1, '#6B3410')
  ctx.fillStyle = potGrad
  ctx.fill()

  // pot rim
  ctx.fillStyle = '#9B5523'
  ctx.fillRect(potX - 2, potY - 4, potW + 4, 5)
  ctx.fillStyle = 'rgba(255,255,255,0.1)'
  ctx.fillRect(potX - 2, potY - 4, potW + 4, 2)

  // leaves
  const leaves = [
    { angle: -0.5, size: 1.0, offsetY: -0.1 },
    { angle: 0.3, size: 0.9, offsetY: -0.05 },
    { angle: -0.2, size: 0.85, offsetY: 0.1 },
    { angle: 0.6, size: 0.75, offsetY: 0.15 },
    { angle: -0.8, size: 0.7, offsetY: 0.2 }
  ]

  for (const leaf of leaves) {
    ctx.save()
    const lx = x + Math.sin(leaf.angle) * w * 0.3
    const ly = potY - h * 0.3 + leaf.offsetY * h
    ctx.translate(lx, ly)
    ctx.rotate(leaf.angle * 0.3)

    const leafW = w * 0.35 * leaf.size
    const leafH = h * 0.35 * leaf.size

    // stem
    ctx.strokeStyle = '#2d6b30'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(0, leafH * 0.5)
    ctx.quadraticCurveTo(0, 0, Math.sin(leaf.angle) * leafW * 0.3, -leafH * 0.3)
    ctx.stroke()

    // leaf shape
    ctx.beginPath()
    ctx.ellipse(0, -leafH * 0.2, leafW * 0.5, leafH * 0.5, 0, 0, Math.PI * 2)
    const leafGrad = ctx.createRadialGradient(0, -leafH * 0.2, 0, 0, -leafH * 0.2, leafW * 0.5)
    leafGrad.addColorStop(0, '#4CAF50')
    leafGrad.addColorStop(0.7, '#2E7D32')
    leafGrad.addColorStop(1, '#1B5E20')
    ctx.fillStyle = leafGrad
    ctx.fill()

    // leaf vein
    ctx.strokeStyle = 'rgba(255,255,255,0.15)'
    ctx.lineWidth = 0.8
    ctx.beginPath()
    ctx.moveTo(0, -leafH * 0.2 + leafH * 0.4)
    ctx.lineTo(0, -leafH * 0.2 - leafH * 0.4)
    ctx.stroke()

    ctx.restore()
  }
}

export function drawFicus(ctx, x, y, w, h) {
  // trunk
  ctx.save()
  ctx.strokeStyle = '#5D4037'
  ctx.lineWidth = 4
  ctx.beginPath()
  ctx.moveTo(x, y + h * 0.95)
  ctx.quadraticCurveTo(x - 2, y + h * 0.5, x + 3, y + h * 0.25)
  ctx.stroke()
  ctx.lineWidth = 2.5
  ctx.beginPath()
  ctx.moveTo(x + 3, y + h * 0.35)
  ctx.quadraticCurveTo(x + 8, y + h * 0.2, x + 12, y + h * 0.1)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(x + 1, y + h * 0.45)
  ctx.quadraticCurveTo(x - 8, y + h * 0.3, x - 12, y + h * 0.15)
  ctx.stroke()

  // fiddle leaves (large rounded)
  const leafPositions = [
    { lx: 12, ly: h * 0.08, s: 1.0 },
    { lx: -12, ly: h * 0.12, s: 0.9 },
    { lx: 6, ly: h * 0.2, s: 0.85 },
    { lx: -8, ly: h * 0.28, s: 0.8 },
    { lx: 10, ly: h * 0.32, s: 0.75 }
  ]

  for (const lp of leafPositions) {
    const lx = x + lp.lx
    const ly = y + lp.ly
    const s = lp.s
    ctx.beginPath()
    ctx.ellipse(lx, ly, w * 0.22 * s, h * 0.1 * s, 0, 0, Math.PI * 2)
    const lg = ctx.createRadialGradient(lx, ly, 0, lx, ly, w * 0.22 * s)
    lg.addColorStop(0, '#66BB6A')
    lg.addColorStop(1, '#2E7D32')
    ctx.fillStyle = lg
    ctx.fill()
  }

  // pot
  const potW = w * 0.5
  const potH = h * 0.18
  const potX = x - potW / 2
  const potY = y + h * 0.82
  ctx.beginPath()
  ctx.moveTo(potX, potY)
  ctx.lineTo(potX + potW, potY)
  ctx.lineTo(potX + potW * 0.8, potY + potH)
  ctx.lineTo(potX + potW * 0.2, potY + potH)
  ctx.closePath()
  ctx.fillStyle = '#5D4037'
  ctx.fill()
  ctx.fillStyle = 'rgba(255,255,255,0.08)'
  ctx.fillRect(potX, potY, potW, 3)
  ctx.restore()
}

export function drawSucculent(ctx, x, y, w, h) {
  // small pot
  const potW = w * 0.6
  const potH = h * 0.35
  const potX = x - potW / 2
  const potY = y + h * 0.55

  ctx.beginPath()
  ctx.roundRect(potX, potY, potW, potH, 4)
  ctx.fillStyle = '#e0d5c0'
  ctx.fill()
  ctx.strokeStyle = '#c0aa8a'
  ctx.lineWidth = 1
  ctx.stroke()

  // soil
  ctx.beginPath()
  ctx.ellipse(x, potY + 3, potW * 0.4, 4, 0, 0, Math.PI * 2)
  ctx.fillStyle = '#6B4423'
  ctx.fill()

  // succulents (rosette pattern)
  const colors = ['#7CB342', '#8BC34A', '#AED581', '#9CCC65']
  for (let ring = 0; ring < 3; ring++) {
    const petals = ring === 0 ? 3 : ring === 1 ? 5 : 7
    const r = ring * 4 + 3
    for (let i = 0; i < petals; i++) {
      const angle = (i / petals) * Math.PI * 2 + ring * 0.3
      const px = x + Math.cos(angle) * r
      const py = potY - 2 + Math.sin(angle) * r * 0.5
      ctx.beginPath()
      ctx.ellipse(px, py, 4, 3, angle, 0, Math.PI * 2)
      ctx.fillStyle = colors[(i + ring) % colors.length]
      ctx.fill()
    }
  }
}

export function drawBamboo(ctx, x, y, w, h) {
  // vase
  const vaseW = w * 0.5
  const vaseH = h * 0.25
  const vaseX = x - vaseW / 2
  const vaseY = y + h * 0.75

  ctx.beginPath()
  ctx.moveTo(vaseX + vaseW * 0.1, vaseY)
  ctx.quadraticCurveTo(vaseX, vaseY + vaseH * 0.5, vaseX + vaseW * 0.15, vaseY + vaseH)
  ctx.lineTo(vaseX + vaseW * 0.85, vaseY + vaseH)
  ctx.quadraticCurveTo(vaseX + vaseW, vaseY + vaseH * 0.5, vaseX + vaseW * 0.9, vaseY)
  ctx.closePath()
  const vaseGrad = ctx.createLinearGradient(vaseX, vaseY, vaseX + vaseW, vaseY)
  vaseGrad.addColorStop(0, '#e8e8e8')
  vaseGrad.addColorStop(0.3, '#ffffff')
  vaseGrad.addColorStop(1, '#d0d0d0')
  ctx.fillStyle = vaseGrad
  ctx.fill()

  // bamboo stalks
  const stalks = [
    { sx: x - 3, tall: 0.7 },
    { sx: x + 2, tall: 0.8 },
    { sx: x - 1, tall: 0.6 }
  ]

  for (const stalk of stalks) {
    const baseY = vaseY
    const topY = y + h * (1 - stalk.tall)

    // stalk
    ctx.strokeStyle = '#4CAF50'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(stalk.sx, baseY)
    ctx.lineTo(stalk.sx, topY)
    ctx.stroke()

    // nodes
    const segments = 4
    for (let i = 1; i < segments; i++) {
      const ny = baseY - (baseY - topY) * (i / segments)
      ctx.fillStyle = '#388E3C'
      ctx.fillRect(stalk.sx - 2.5, ny - 1, 5, 3)
    }

    // leaves at top
    ctx.save()
    ctx.translate(stalk.sx, topY)
    for (let i = 0; i < 3; i++) {
      const angle = -0.8 + i * 0.8
      ctx.beginPath()
      ctx.ellipse(Math.cos(angle) * 8, Math.sin(angle) * 3 - 5, 10, 3, angle * 0.5, 0, Math.PI * 2)
      ctx.fillStyle = '#66BB6A'
      ctx.fill()
    }
    ctx.restore()
  }
}

// ===== WALL ART RENDERERS =====

export function drawLandscapePainting(ctx, x, y, w, h) {
  // frame
  ctx.save()
  ctx.shadowColor = 'rgba(0,0,0,0.3)'
  ctx.shadowBlur = 6
  ctx.shadowOffsetY = 3

  // outer frame
  ctx.fillStyle = '#5D4037'
  ctx.fillRect(x - 4, y - 4, w + 8, h + 8)

  // inner frame highlight
  ctx.fillStyle = '#8D6E63'
  ctx.fillRect(x - 2, y - 2, w + 4, h + 4)

  ctx.restore()

  // canvas background
  ctx.fillStyle = '#f5f0e8'
  ctx.fillRect(x, y, w, h)

  // mountain scene (ink wash style)
  ctx.save()
  ctx.beginPath()
  ctx.rect(x, y, w, h)
  ctx.clip()

  // sky
  ctx.fillStyle = '#eef5f0'
  ctx.fillRect(x, y, w, h)

  // distant mountain
  ctx.fillStyle = 'rgba(100, 130, 120, 0.3)'
  ctx.beginPath()
  ctx.moveTo(x, y + h * 0.6)
  ctx.quadraticCurveTo(x + w * 0.3, y + h * 0.2, x + w * 0.5, y + h * 0.35)
  ctx.quadraticCurveTo(x + w * 0.7, y + h * 0.15, x + w, y + h * 0.5)
  ctx.lineTo(x + w, y + h)
  ctx.lineTo(x, y + h)
  ctx.fill()

  // closer mountain
  ctx.fillStyle = 'rgba(60, 90, 80, 0.5)'
  ctx.beginPath()
  ctx.moveTo(x, y + h * 0.8)
  ctx.quadraticCurveTo(x + w * 0.2, y + h * 0.4, x + w * 0.4, y + h * 0.55)
  ctx.quadraticCurveTo(x + w * 0.6, y + h * 0.3, x + w * 0.8, y + h * 0.6)
  ctx.lineTo(x + w, y + h * 0.7)
  ctx.lineTo(x + w, y + h)
  ctx.lineTo(x, y + h)
  ctx.fill()

  // water
  ctx.fillStyle = 'rgba(150, 180, 200, 0.3)'
  ctx.fillRect(x, y + h * 0.8, w, h * 0.2)

  ctx.restore()
}

export function drawFoodPainting(ctx, x, y, w, h) {
  ctx.save()
  ctx.shadowColor = 'rgba(0,0,0,0.3)'
  ctx.shadowBlur = 6
  ctx.shadowOffsetY = 3

  // ornate gold frame
  ctx.fillStyle = '#B8860B'
  ctx.fillRect(x - 5, y - 5, w + 10, h + 10)
  ctx.fillStyle = '#DAA520'
  ctx.fillRect(x - 3, y - 3, w + 6, h + 6)
  ctx.restore()

  // canvas
  ctx.fillStyle = '#3e2723'
  ctx.fillRect(x, y, w, h)

  ctx.save()
  ctx.beginPath()
  ctx.rect(x, y, w, h)
  ctx.clip()

  // table cloth
  ctx.fillStyle = '#5D1A1A'
  ctx.fillRect(x, y + h * 0.5, w, h * 0.5)

  // plate
  ctx.beginPath()
  ctx.ellipse(x + w * 0.5, y + h * 0.6, w * 0.3, h * 0.15, 0, 0, Math.PI * 2)
  ctx.fillStyle = '#f5f5f5'
  ctx.fill()
  ctx.strokeStyle = '#ddd'
  ctx.lineWidth = 1
  ctx.stroke()

  // food on plate (abstract warm blob)
  ctx.beginPath()
  ctx.ellipse(x + w * 0.5, y + h * 0.55, w * 0.15, h * 0.1, 0, 0, Math.PI * 2)
  const foodGrad = ctx.createRadialGradient(x + w * 0.5, y + h * 0.55, 0, x + w * 0.5, y + h * 0.55, w * 0.15)
  foodGrad.addColorStop(0, '#e65100')
  foodGrad.addColorStop(1, '#bf360c')
  ctx.fillStyle = foodGrad
  ctx.fill()

  // wine glass
  ctx.strokeStyle = 'rgba(200, 200, 255, 0.5)'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(x + w * 0.75, y + h * 0.7)
  ctx.lineTo(x + w * 0.75, y + h * 0.5)
  ctx.stroke()
  ctx.beginPath()
  ctx.ellipse(x + w * 0.75, y + h * 0.45, w * 0.08, h * 0.1, 0, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(150, 30, 30, 0.6)'
  ctx.fill()

  ctx.restore()
}

export function drawAbstractPainting(ctx, x, y, w, h) {
  ctx.save()
  ctx.shadowColor = 'rgba(0,0,0,0.25)'
  ctx.shadowBlur = 5
  ctx.shadowOffsetY = 2

  // white frame
  ctx.fillStyle = '#fff'
  ctx.fillRect(x - 3, y - 3, w + 6, h + 6)
  ctx.restore()

  // background
  ctx.fillStyle = '#fafafa'
  ctx.fillRect(x, y, w, h)

  ctx.save()
  ctx.beginPath()
  ctx.rect(x, y, w, h)
  ctx.clip()

  // abstract shapes
  const colors = ['#e91e63', '#2196F3', '#FFC107', '#4CAF50', '#9C27B0']
  for (let i = 0; i < 5; i++) {
    ctx.globalAlpha = 0.6
    ctx.fillStyle = colors[i]
    ctx.beginPath()
    const cx = x + w * (0.2 + Math.sin(i * 1.7) * 0.3)
    const cy = y + h * (0.3 + Math.cos(i * 2.1) * 0.25)
    const r = Math.min(w, h) * (0.12 + Math.sin(i) * 0.05)
    if (i % 3 === 0) {
      ctx.arc(cx, cy, r, 0, Math.PI * 2)
    } else if (i % 3 === 1) {
      ctx.rect(cx - r, cy - r, r * 2, r * 1.5)
    } else {
      ctx.moveTo(cx, cy - r)
      ctx.lineTo(cx + r, cy + r)
      ctx.lineTo(cx - r, cy + r)
      ctx.closePath()
    }
    ctx.fill()
  }

  ctx.restore()
}

// ===== 3D TABLE RENDERER =====

export function draw3DTable(ctx, x, y, tableStyle, isOccupied, tableIndex) {
  const tableW = 76
  const tableH = 36
  const depth = 10
  const colors = [
    { top: '#A0714F', front: '#7D5638', side: '#6B4528', highlight: 'rgba(255,255,255,0.15)' },
    { top: '#8B5E3C', front: '#6B4226', side: '#553218', highlight: 'rgba(255,255,255,0.12)' },
    { top: '#B8734A', front: '#8F5530', side: '#7A4525', highlight: 'rgba(255,255,255,0.14)' }
  ]
  const c = colors[tableStyle % 3]

  // ground shadow (multiple layers for softness)
  for (let i = 3; i >= 0; i--) {
    ctx.beginPath()
    ctx.ellipse(x, y + 28 + i, 42 - i, 10 - i, 0, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(0, 0, 0, ${0.03 + i * 0.01})`
    ctx.fill()
  }

  // table legs
  const legW = 4
  const legH = 22
  const legPositions = [
    { lx: x - tableW / 2 + 8, ly: y + 2 },
    { lx: x + tableW / 2 - 12, ly: y + 2 },
    { lx: x - tableW / 2 + 10, ly: y + 8 },
    { lx: x + tableW / 2 - 14, ly: y + 8 }
  ]

  for (const leg of legPositions) {
    ctx.fillStyle = c.side
    ctx.fillRect(leg.lx, leg.ly, legW, legH)
    ctx.fillStyle = 'rgba(255,255,255,0.05)'
    ctx.fillRect(leg.lx, leg.ly, 1, legH)
  }

  // front face (depth)
  ctx.beginPath()
  ctx.moveTo(x - tableW / 2, y - 2)
  ctx.lineTo(x + tableW / 2, y - 2)
  ctx.lineTo(x + tableW / 2, y - 2 + depth)
  ctx.lineTo(x - tableW / 2, y - 2 + depth)
  ctx.closePath()
  ctx.fillStyle = c.front
  ctx.fill()

  // top surface
  ctx.beginPath()
  ctx.roundRect(x - tableW / 2, y - 2 - depth, tableW, tableH * 0.6, 4)
  ctx.fillStyle = c.top
  ctx.fill()

  // wood grain on top
  ctx.save()
  ctx.globalAlpha = 0.06
  ctx.strokeStyle = '#3e2723'
  ctx.lineWidth = 0.5
  for (let g = 0; g < 4; g++) {
    ctx.beginPath()
    const gy = y - 2 - depth + 4 + g * 5
    ctx.moveTo(x - tableW / 2 + 5, gy)
    ctx.quadraticCurveTo(x, gy + Math.sin(g) * 1.5, x + tableW / 2 - 5, gy)
    ctx.stroke()
  }
  ctx.restore()

  // top highlight
  ctx.beginPath()
  ctx.roundRect(x - tableW / 2 + 4, y - 2 - depth + 2, tableW - 8, 6, 3)
  ctx.fillStyle = c.highlight
  ctx.fill()

  // side edge (right)
  ctx.fillStyle = c.side
  ctx.fillRect(x + tableW / 2 - 2, y - 2, 2, depth)

  // chairs (3D cylinder-ish)
  drawChair(ctx, x - 34, y + 18, tableStyle)
  drawChair(ctx, x + 34, y + 18, tableStyle)

  // table number
  ctx.save()
  ctx.globalAlpha = 0.4
  ctx.font = '9px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillStyle = '#fff'
  ctx.fillText(`${tableIndex + 1}号桌`, x, y + 5)
  ctx.restore()

  // flower on empty table
  if (!isOccupied) {
    const flowers = ['🌸', '🌺', '🌻', '💐']
    ctx.font = '14px serif'
    ctx.textAlign = 'center'
    ctx.fillText(flowers[tableIndex % flowers.length], x, y - depth - 2)
  }
}

function drawChair(ctx, x, y, style) {
  const colors = ['#654321', '#5c3d1e', '#7a5230']
  const color = colors[style % 3]

  // seat (top ellipse)
  ctx.beginPath()
  ctx.ellipse(x, y - 4, 11, 7, 0, 0, Math.PI * 2)
  ctx.fillStyle = color
  ctx.fill()

  // seat side (cylinder depth)
  ctx.beginPath()
  ctx.ellipse(x, y, 11, 7, 0, 0, Math.PI)
  const chairGrad = ctx.createLinearGradient(x - 11, y, x + 11, y)
  chairGrad.addColorStop(0, 'rgba(0,0,0,0.2)')
  chairGrad.addColorStop(0.5, 'rgba(0,0,0,0.05)')
  chairGrad.addColorStop(1, 'rgba(0,0,0,0.2)')
  ctx.fillStyle = chairGrad
  ctx.fill()

  // highlight on seat
  ctx.beginPath()
  ctx.ellipse(x - 2, y - 5, 5, 3, 0, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(255,255,255,0.1)'
  ctx.fill()
}

// ===== AMBIENT EFFECTS =====

export function drawWindowLightShaft(ctx, windowX, windowY, windowW, windowH, floorY) {
  ctx.save()
  ctx.globalAlpha = 0.06
  const shaftWidth = windowW * 1.5
  const grad = ctx.createLinearGradient(windowX + windowW / 2, windowY + windowH, windowX + windowW / 2, floorY + 40)
  grad.addColorStop(0, '#fffde0')
  grad.addColorStop(1, 'rgba(255, 253, 224, 0)')
  ctx.fillStyle = grad

  ctx.beginPath()
  ctx.moveTo(windowX, windowY + windowH)
  ctx.lineTo(windowX + windowW, windowY + windowH)
  ctx.lineTo(windowX + windowW + shaftWidth * 0.3, floorY + 40)
  ctx.lineTo(windowX - shaftWidth * 0.3, floorY + 40)
  ctx.closePath()
  ctx.fill()
  ctx.restore()
}

export function drawVignette(ctx, w, h) {
  ctx.save()
  const grad = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.3, w / 2, h / 2, Math.max(w, h) * 0.7)
  grad.addColorStop(0, 'rgba(0,0,0,0)')
  grad.addColorStop(1, 'rgba(0,0,0,0.08)')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, w, h)
  ctx.restore()
}

export function drawBaseboard(ctx, w, floorY) {
  // baseboard with 3D molding
  const boardH = 8
  ctx.fillStyle = '#8B5E3C'
  ctx.fillRect(0, floorY - boardH, w, boardH)

  // top highlight
  ctx.fillStyle = 'rgba(255,255,255,0.2)'
  ctx.fillRect(0, floorY - boardH, w, 2)

  // bottom shadow
  ctx.fillStyle = 'rgba(0,0,0,0.15)'
  ctx.fillRect(0, floorY - 1, w, 2)
}

// ===== CEILING & AMBIENT LIGHTING =====

export function drawCeilingMolding(ctx, w) {
  // crown molding with 3D profile
  ctx.fillStyle = '#e8ddd0'
  ctx.fillRect(0, 0, w, 6)
  ctx.fillStyle = 'rgba(255,255,255,0.4)'
  ctx.fillRect(0, 0, w, 2)
  ctx.fillStyle = '#d4c8b8'
  ctx.fillRect(0, 6, w, 3)
  ctx.fillStyle = 'rgba(0,0,0,0.08)'
  ctx.fillRect(0, 9, w, 2)
}

export function drawAmbientLighting(ctx, w, h, placedDecorations) {
  // global warm ambient from ceiling
  const ambGrad = ctx.createLinearGradient(0, 0, 0, h * 0.5)
  ambGrad.addColorStop(0, 'rgba(255, 240, 200, 0.04)')
  ambGrad.addColorStop(1, 'rgba(255, 240, 200, 0)')
  ctx.fillStyle = ambGrad
  ctx.fillRect(0, 0, w, h * 0.5)

  // ambient occlusion at wall-floor junction
  const aoGrad = ctx.createLinearGradient(0, h * 0.35 - 5, 0, h * 0.35 + 20)
  aoGrad.addColorStop(0, 'rgba(0,0,0,0)')
  aoGrad.addColorStop(0.3, 'rgba(0,0,0,0.06)')
  aoGrad.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = aoGrad
  ctx.fillRect(0, h * 0.35 - 5, w, 25)

  // corner shadows (left and right wall edges)
  const leftShadow = ctx.createLinearGradient(0, 0, 30, 0)
  leftShadow.addColorStop(0, 'rgba(0,0,0,0.06)')
  leftShadow.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = leftShadow
  ctx.fillRect(0, 0, 30, h * 0.35)

  const rightShadow = ctx.createLinearGradient(w, 0, w - 30, 0)
  rightShadow.addColorStop(0, 'rgba(0,0,0,0.06)')
  rightShadow.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = rightShadow
  ctx.fillRect(w - 30, 0, 30, h * 0.35)

  // floor ambient occlusion near counter
  const floorAO = ctx.createLinearGradient(0, h - 80, 0, h - 70)
  floorAO.addColorStop(0, 'rgba(0,0,0,0)')
  floorAO.addColorStop(1, 'rgba(0,0,0,0.08)')
  ctx.fillStyle = floorAO
  ctx.fillRect(0, h - 80, w, 10)
}

// ===== LIGHTING RENDERERS =====

export function drawPendantLamp(ctx, x, y, w, h) {
  ctx.save()
  // cord
  ctx.strokeStyle = '#333'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(x, y)
  ctx.lineTo(x, y + h * 0.3)
  ctx.stroke()

  // shade (trapezoid)
  const shadeTop = y + h * 0.3
  const shadeBot = y + h * 0.55
  const topW = w * 0.15
  const botW = w * 0.5

  ctx.beginPath()
  ctx.moveTo(x - topW, shadeTop)
  ctx.lineTo(x + topW, shadeTop)
  ctx.lineTo(x + botW, shadeBot)
  ctx.lineTo(x - botW, shadeBot)
  ctx.closePath()
  const shadeGrad = ctx.createLinearGradient(x - botW, shadeTop, x + botW, shadeTop)
  shadeGrad.addColorStop(0, '#2c2c2c')
  shadeGrad.addColorStop(0.5, '#444')
  shadeGrad.addColorStop(1, '#2c2c2c')
  ctx.fillStyle = shadeGrad
  ctx.fill()

  // inner glow
  ctx.beginPath()
  ctx.ellipse(x, shadeBot + 2, botW * 0.7, 4, 0, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(255, 220, 100, 0.6)'
  ctx.fill()

  // light cone
  const coneGrad = ctx.createRadialGradient(x, shadeBot, 2, x, shadeBot + h * 0.4, w * 0.8)
  coneGrad.addColorStop(0, 'rgba(255, 230, 150, 0.15)')
  coneGrad.addColorStop(1, 'rgba(255, 230, 150, 0)')
  ctx.fillStyle = coneGrad
  ctx.fillRect(x - w, shadeBot, w * 2, h * 0.5)

  ctx.restore()
}

export function drawChandelier(ctx, x, y, w, h) {
  ctx.save()

  // main rod
  ctx.strokeStyle = '#8B7355'
  ctx.lineWidth = 2.5
  ctx.beginPath()
  ctx.moveTo(x, y)
  ctx.lineTo(x, y + h * 0.2)
  ctx.stroke()

  // central ornament
  ctx.beginPath()
  ctx.arc(x, y + h * 0.22, 5, 0, Math.PI * 2)
  ctx.fillStyle = '#DAA520'
  ctx.fill()

  // arms (5 branches)
  const armY = y + h * 0.25
  const arms = [-0.4, -0.2, 0, 0.2, 0.4]
  for (const offset of arms) {
    const ax = x + offset * w
    ctx.strokeStyle = '#8B7355'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(x, armY)
    ctx.quadraticCurveTo(x + offset * w * 0.5, armY + 8, ax, armY + 12)
    ctx.stroke()

    // crystal drops
    ctx.fillStyle = '#e8e0f0'
    ctx.beginPath()
    ctx.ellipse(ax, armY + 16, 3, 5, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = 'rgba(255,255,255,0.5)'
    ctx.beginPath()
    ctx.ellipse(ax - 1, armY + 14, 1.5, 2, 0, 0, Math.PI * 2)
    ctx.fill()
  }

  // warm glow below
  const glowGrad = ctx.createRadialGradient(x, armY + 20, 5, x, armY + 20, w * 0.7)
  glowGrad.addColorStop(0, 'rgba(255, 220, 120, 0.12)')
  glowGrad.addColorStop(1, 'rgba(255, 220, 120, 0)')
  ctx.fillStyle = glowGrad
  ctx.fillRect(x - w, armY, w * 2, h * 0.7)

  ctx.restore()
}

export function drawWallSconce(ctx, x, y, w, h) {
  ctx.save()
  // bracket
  ctx.fillStyle = '#8B7355'
  ctx.fillRect(x - 3, y + h * 0.3, 6, h * 0.15)

  // arm
  ctx.beginPath()
  ctx.moveTo(x, y + h * 0.35)
  ctx.quadraticCurveTo(x + w * 0.3, y + h * 0.3, x + w * 0.1, y + h * 0.2)
  ctx.strokeStyle = '#8B7355'
  ctx.lineWidth = 2
  ctx.stroke()

  // shade
  ctx.beginPath()
  ctx.moveTo(x - w * 0.2, y + h * 0.1)
  ctx.lineTo(x + w * 0.2, y + h * 0.1)
  ctx.lineTo(x + w * 0.3, y + h * 0.35)
  ctx.lineTo(x - w * 0.3, y + h * 0.35)
  ctx.closePath()
  ctx.fillStyle = '#f5e6d3'
  ctx.fill()
  ctx.strokeStyle = '#d4b896'
  ctx.lineWidth = 0.5
  ctx.stroke()

  // glow on wall
  const glow = ctx.createRadialGradient(x, y + h * 0.3, 3, x, y + h * 0.3, w)
  glow.addColorStop(0, 'rgba(255, 220, 120, 0.15)')
  glow.addColorStop(1, 'rgba(255, 220, 120, 0)')
  ctx.fillStyle = glow
  ctx.fillRect(x - w, y, w * 2, h)

  ctx.restore()
}

export function drawFloorLamp(ctx, x, y, w, h) {
  ctx.save()
  // base
  ctx.beginPath()
  ctx.ellipse(x, y + h * 0.95, w * 0.35, 5, 0, 0, Math.PI * 2)
  ctx.fillStyle = '#444'
  ctx.fill()

  // pole
  ctx.strokeStyle = '#555'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(x, y + h * 0.92)
  ctx.lineTo(x, y + h * 0.15)
  ctx.stroke()

  // shade
  ctx.beginPath()
  ctx.ellipse(x, y + h * 0.12, w * 0.4, h * 0.12, 0, 0, Math.PI * 2)
  const sg = ctx.createRadialGradient(x, y + h * 0.12, 0, x, y + h * 0.12, w * 0.4)
  sg.addColorStop(0, '#fff8e0')
  sg.addColorStop(1, '#e8d8b8')
  ctx.fillStyle = sg
  ctx.fill()
  ctx.strokeStyle = '#bba888'
  ctx.lineWidth = 1
  ctx.stroke()

  // glow
  const glow = ctx.createRadialGradient(x, y + h * 0.25, 5, x, y + h * 0.25, w)
  glow.addColorStop(0, 'rgba(255, 230, 150, 0.12)')
  glow.addColorStop(1, 'rgba(255, 230, 150, 0)')
  ctx.fillStyle = glow
  ctx.fillRect(x - w, y, w * 2, h)

  ctx.restore()
}

// ===== FURNITURE RENDERERS =====

export function drawCabinet(ctx, x, y, w, h) {
  ctx.save()
  // shadow
  ctx.fillStyle = 'rgba(0,0,0,0.08)'
  ctx.fillRect(x - w/2 + 3, y + h - 3, w, 5)

  // body
  const bodyGrad = ctx.createLinearGradient(x - w/2, y, x + w/2, y)
  bodyGrad.addColorStop(0, '#5D3A1A')
  bodyGrad.addColorStop(0.5, '#7B5230')
  bodyGrad.addColorStop(1, '#5D3A1A')
  ctx.fillStyle = bodyGrad
  ctx.beginPath()
  ctx.roundRect(x - w/2, y, w, h, 3)
  ctx.fill()

  // top surface (3D)
  ctx.fillStyle = '#8B6340'
  ctx.fillRect(x - w/2 - 2, y - 3, w + 4, 5)
  ctx.fillStyle = 'rgba(255,255,255,0.12)'
  ctx.fillRect(x - w/2 - 2, y - 3, w + 4, 2)

  // doors
  ctx.strokeStyle = 'rgba(255,255,255,0.08)'
  ctx.lineWidth = 1
  ctx.strokeRect(x - w/2 + 4, y + 6, w/2 - 6, h - 14)
  ctx.strokeRect(x + 2, y + 6, w/2 - 6, h - 14)

  // handles
  ctx.fillStyle = '#DAA520'
  ctx.beginPath()
  ctx.arc(x - 4, y + h/2, 2.5, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(x + 4, y + h/2, 2.5, 0, Math.PI * 2)
  ctx.fill()

  ctx.restore()
}

export function drawBookshelf(ctx, x, y, w, h) {
  ctx.save()
  // frame
  const frameGrad = ctx.createLinearGradient(x - w/2, y, x + w/2, y)
  frameGrad.addColorStop(0, '#4a3020')
  frameGrad.addColorStop(0.5, '#6b4a35')
  frameGrad.addColorStop(1, '#4a3020')
  ctx.fillStyle = frameGrad
  ctx.beginPath()
  ctx.roundRect(x - w/2, y, w, h, 2)
  ctx.fill()

  // shelves (4 levels)
  const shelfCount = 4
  const shelfH = h / shelfCount
  const bookColors = ['#c0392b', '#2980b9', '#27ae60', '#8e44ad', '#d35400', '#2c3e50', '#f39c12']

  for (let i = 0; i < shelfCount; i++) {
    const sy = y + i * shelfH + 3
    // shelf board
    ctx.fillStyle = '#5a3a25'
    ctx.fillRect(x - w/2 + 2, sy + shelfH - 4, w - 4, 4)
    ctx.fillStyle = 'rgba(255,255,255,0.1)'
    ctx.fillRect(x - w/2 + 2, sy + shelfH - 4, w - 4, 1)

    // books on shelf
    let bx = x - w/2 + 5
    while (bx < x + w/2 - 8) {
      const bw = 4 + Math.random() * 4
      const bh = shelfH - 8 - Math.random() * 4
      const color = bookColors[Math.floor(Math.random() * bookColors.length)]
      ctx.fillStyle = color
      ctx.fillRect(bx, sy + shelfH - 4 - bh, bw, bh)
      // spine highlight
      ctx.fillStyle = 'rgba(255,255,255,0.15)'
      ctx.fillRect(bx, sy + shelfH - 4 - bh, 1, bh)
      bx += bw + 1
    }
  }
  ctx.restore()
}

export function drawSofa(ctx, x, y, w, h) {
  ctx.save()
  // shadow
  ctx.beginPath()
  ctx.ellipse(x, y + h * 0.9, w * 0.45, 5, 0, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(0,0,0,0.1)'
  ctx.fill()

  // body
  ctx.beginPath()
  ctx.roundRect(x - w/2, y + h * 0.3, w, h * 0.5, 6)
  const sofaGrad = ctx.createLinearGradient(x - w/2, y, x + w/2, y)
  sofaGrad.addColorStop(0, '#5D3A1A')
  sofaGrad.addColorStop(0.5, '#7B4F2E')
  sofaGrad.addColorStop(1, '#5D3A1A')
  ctx.fillStyle = sofaGrad
  ctx.fill()

  // back rest
  ctx.beginPath()
  ctx.roundRect(x - w/2 + 3, y, w - 6, h * 0.45, [6, 6, 0, 0])
  ctx.fillStyle = '#6B4226'
  ctx.fill()
  ctx.fillStyle = 'rgba(255,255,255,0.06)'
  ctx.fillRect(x - w/2 + 5, y + 3, w - 10, 4)

  // cushions
  ctx.beginPath()
  ctx.roundRect(x - w/2 + 5, y + h * 0.35, w * 0.4, h * 0.35, 4)
  ctx.fillStyle = '#8B5E3C'
  ctx.fill()
  ctx.beginPath()
  ctx.roundRect(x + 3, y + h * 0.35, w * 0.4, h * 0.35, 4)
  ctx.fillStyle = '#8B5E3C'
  ctx.fill()

  // armrests
  ctx.fillStyle = '#5D3A1A'
  ctx.beginPath()
  ctx.roundRect(x - w/2 - 3, y + h * 0.15, 8, h * 0.55, 4)
  ctx.fill()
  ctx.beginPath()
  ctx.roundRect(x + w/2 - 5, y + h * 0.15, 8, h * 0.55, 4)
  ctx.fill()

  ctx.restore()
}

export function drawWineRack(ctx, x, y, w, h) {
  ctx.save()
  // frame
  ctx.fillStyle = '#3e2723'
  ctx.beginPath()
  ctx.roundRect(x - w/2, y, w, h, 3)
  ctx.fill()

  // grid slots for bottles
  const cols = 3
  const rows = 4
  const slotW = (w - 8) / cols
  const slotH = (h - 8) / rows

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const sx = x - w/2 + 4 + c * slotW
      const sy = y + 4 + r * slotH
      // diamond slot
      ctx.strokeStyle = '#5D3A1A'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(sx + slotW/2, sy)
      ctx.lineTo(sx + slotW, sy + slotH/2)
      ctx.lineTo(sx + slotW/2, sy + slotH)
      ctx.lineTo(sx, sy + slotH/2)
      ctx.closePath()
      ctx.stroke()

      // bottle (random fill)
      if (Math.sin(r * 3.7 + c * 2.3) > -0.3) {
        ctx.beginPath()
        ctx.ellipse(sx + slotW/2, sy + slotH/2, slotW * 0.25, slotH * 0.35, 0, 0, Math.PI * 2)
        const bColor = ['#4a0e0e', '#1a3320', '#2c1a40'][Math.floor(Math.abs(Math.sin(r + c * 2)) * 3)]
        ctx.fillStyle = bColor
        ctx.fill()
        // bottle shine
        ctx.fillStyle = 'rgba(255,255,255,0.15)'
        ctx.beginPath()
        ctx.ellipse(sx + slotW/2 - 1, sy + slotH/2 - 2, 2, slotH * 0.15, 0, 0, Math.PI * 2)
        ctx.fill()
      }
    }
  }
  ctx.restore()
}

// ===== APPLIANCE RENDERERS =====

export function drawAirConditioner(ctx, x, y, w, h) {
  ctx.save()
  // shadow on wall
  ctx.fillStyle = 'rgba(0,0,0,0.06)'
  ctx.fillRect(x - w/2 + 2, y + h + 1, w - 4, 4)

  // body
  const bodyGrad = ctx.createLinearGradient(x - w/2, y, x - w/2, y + h)
  bodyGrad.addColorStop(0, '#f8f8f8')
  bodyGrad.addColorStop(0.8, '#e8e8e8')
  bodyGrad.addColorStop(1, '#d0d0d0')
  ctx.fillStyle = bodyGrad
  ctx.beginPath()
  ctx.roundRect(x - w/2, y, w, h, 4)
  ctx.fill()

  // top edge highlight
  ctx.fillStyle = 'rgba(255,255,255,0.6)'
  ctx.fillRect(x - w/2 + 2, y + 1, w - 4, 2)

  // vent lines
  ctx.strokeStyle = 'rgba(0,0,0,0.1)'
  ctx.lineWidth = 0.8
  for (let i = 0; i < 5; i++) {
    const vy = y + h * 0.5 + i * 3
    ctx.beginPath()
    ctx.moveTo(x - w/2 + 8, vy)
    ctx.lineTo(x + w/2 - 8, vy)
    ctx.stroke()
  }

  // display LED
  ctx.fillStyle = '#00cc44'
  ctx.beginPath()
  ctx.arc(x + w/2 - 12, y + 8, 2, 0, Math.PI * 2)
  ctx.fill()

  // cold air effect
  ctx.globalAlpha = 0.04
  ctx.fillStyle = '#aaddff'
  ctx.beginPath()
  ctx.moveTo(x - w * 0.3, y + h)
  ctx.lineTo(x + w * 0.3, y + h)
  ctx.lineTo(x + w * 0.5, y + h + 30)
  ctx.lineTo(x - w * 0.5, y + h + 30)
  ctx.closePath()
  ctx.fill()
  ctx.restore()
}

export function drawWaterDispenser(ctx, x, y, w, h) {
  ctx.save()
  // shadow
  ctx.beginPath()
  ctx.ellipse(x, y + h - 2, w * 0.4, 4, 0, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(0,0,0,0.08)'
  ctx.fill()

  // body
  const bodyGrad = ctx.createLinearGradient(x - w/2, y + h * 0.25, x + w/2, y + h * 0.25)
  bodyGrad.addColorStop(0, '#ddd')
  bodyGrad.addColorStop(0.5, '#f5f5f5')
  bodyGrad.addColorStop(1, '#ccc')
  ctx.fillStyle = bodyGrad
  ctx.beginPath()
  ctx.roundRect(x - w/2, y + h * 0.25, w, h * 0.7, 4)
  ctx.fill()

  // water bottle on top
  ctx.beginPath()
  ctx.moveTo(x - w * 0.25, y + h * 0.25)
  ctx.lineTo(x - w * 0.15, y + 5)
  ctx.lineTo(x + w * 0.15, y + 5)
  ctx.lineTo(x + w * 0.25, y + h * 0.25)
  ctx.closePath()
  const bottleGrad = ctx.createLinearGradient(x - w * 0.25, y, x + w * 0.25, y)
  bottleGrad.addColorStop(0, 'rgba(100, 180, 255, 0.3)')
  bottleGrad.addColorStop(0.5, 'rgba(150, 210, 255, 0.4)')
  bottleGrad.addColorStop(1, 'rgba(100, 180, 255, 0.3)')
  ctx.fillStyle = bottleGrad
  ctx.fill()
  ctx.strokeStyle = 'rgba(100, 150, 200, 0.3)'
  ctx.lineWidth = 1
  ctx.stroke()

  // taps
  ctx.fillStyle = '#e74c3c'
  ctx.beginPath()
  ctx.roundRect(x - 6, y + h * 0.45, 5, 4, 1)
  ctx.fill()
  ctx.fillStyle = '#3498db'
  ctx.beginPath()
  ctx.roundRect(x + 1, y + h * 0.45, 5, 4, 1)
  ctx.fill()

  // drip tray
  ctx.fillStyle = '#999'
  ctx.fillRect(x - w * 0.3, y + h * 0.55, w * 0.6, 3)

  ctx.restore()
}

export function drawSpeaker(ctx, x, y, w, h) {
  ctx.save()
  // body
  const bodyGrad = ctx.createLinearGradient(x - w/2, y, x + w/2, y)
  bodyGrad.addColorStop(0, '#2c2c2c')
  bodyGrad.addColorStop(0.5, '#444')
  bodyGrad.addColorStop(1, '#2c2c2c')
  ctx.fillStyle = bodyGrad
  ctx.beginPath()
  ctx.roundRect(x - w/2, y, w, h, 5)
  ctx.fill()

  // speaker cone
  ctx.beginPath()
  ctx.arc(x, y + h * 0.4, w * 0.3, 0, Math.PI * 2)
  ctx.fillStyle = '#222'
  ctx.fill()
  ctx.beginPath()
  ctx.arc(x, y + h * 0.4, w * 0.15, 0, Math.PI * 2)
  ctx.fillStyle = '#555'
  ctx.fill()

  // tweeter
  ctx.beginPath()
  ctx.arc(x, y + h * 0.75, w * 0.15, 0, Math.PI * 2)
  ctx.fillStyle = '#333'
  ctx.fill()

  // LED
  ctx.fillStyle = '#00ff88'
  ctx.beginPath()
  ctx.arc(x, y + h - 5, 2, 0, Math.PI * 2)
  ctx.fill()

  ctx.restore()
}

export function drawTV(ctx, x, y, w, h) {
  ctx.save()
  // shadow behind
  ctx.shadowColor = 'rgba(0,0,0,0.3)'
  ctx.shadowBlur = 8
  ctx.shadowOffsetY = 3

  // bezel
  ctx.fillStyle = '#1a1a1a'
  ctx.beginPath()
  ctx.roundRect(x - w/2, y, w, h, 4)
  ctx.fill()
  ctx.restore()

  // screen
  const screenGrad = ctx.createLinearGradient(x - w/2 + 3, y + 3, x + w/2 - 3, y + h - 6)
  screenGrad.addColorStop(0, '#1a3a5c')
  screenGrad.addColorStop(0.5, '#2a5a8c')
  screenGrad.addColorStop(1, '#1a3a5c')
  ctx.fillStyle = screenGrad
  ctx.fillRect(x - w/2 + 3, y + 3, w - 6, h - 9)

  // screen reflection
  ctx.fillStyle = 'rgba(255,255,255,0.05)'
  ctx.beginPath()
  ctx.moveTo(x - w/2 + 3, y + 3)
  ctx.lineTo(x + w/2 - 3, y + 3)
  ctx.lineTo(x - w/2 + 3, y + h * 0.5)
  ctx.closePath()
  ctx.fill()

  // brand dot
  ctx.fillStyle = '#e74c3c'
  ctx.beginPath()
  ctx.arc(x, y + h - 4, 1.5, 0, Math.PI * 2)
  ctx.fill()

  // glow on wall behind
  ctx.save()
  const tvGlow = ctx.createRadialGradient(x, y + h/2, 5, x, y + h/2, w * 0.8)
  tvGlow.addColorStop(0, 'rgba(40, 80, 140, 0.06)')
  tvGlow.addColorStop(1, 'rgba(40, 80, 140, 0)')
  ctx.fillStyle = tvGlow
  ctx.fillRect(x - w, y - h * 0.3, w * 2, h * 1.6)
  ctx.restore()
}

// ===== CURTAIN RENDERERS =====

export function drawVelvetCurtain(ctx, x, y, w, h) {
  ctx.save()
  // rod
  ctx.fillStyle = '#8B7355'
  ctx.fillRect(x - w/2 - 5, y, w + 10, 4)
  ctx.fillStyle = 'rgba(255,255,255,0.2)'
  ctx.fillRect(x - w/2 - 5, y, w + 10, 1.5)
  // rod ends
  ctx.beginPath()
  ctx.arc(x - w/2 - 5, y + 2, 4, 0, Math.PI * 2)
  ctx.fillStyle = '#8B7355'
  ctx.fill()
  ctx.beginPath()
  ctx.arc(x + w/2 + 5, y + 2, 4, 0, Math.PI * 2)
  ctx.fill()

  // left drape
  const drapeW = w * 0.35
  for (let side = -1; side <= 1; side += 2) {
    const dx = x + side * (w * 0.32)
    const foldGrad = ctx.createLinearGradient(dx - drapeW/2, y, dx + drapeW/2, y)
    foldGrad.addColorStop(0, '#6b1a1a')
    foldGrad.addColorStop(0.3, '#8b2222')
    foldGrad.addColorStop(0.5, '#a03030')
    foldGrad.addColorStop(0.7, '#8b2222')
    foldGrad.addColorStop(1, '#5a1515')
    ctx.fillStyle = foldGrad

    ctx.beginPath()
    ctx.moveTo(dx - drapeW/2, y + 4)
    ctx.quadraticCurveTo(dx - drapeW/2 + 2, y + h * 0.3, dx - drapeW/2 - 3, y + h * 0.9)
    ctx.lineTo(dx + drapeW/2 + 3, y + h * 0.9)
    ctx.quadraticCurveTo(dx + drapeW/2 - 2, y + h * 0.3, dx + drapeW/2, y + 4)
    ctx.closePath()
    ctx.fill()

    // fold highlights
    ctx.strokeStyle = 'rgba(255,200,200,0.1)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(dx, y + 6)
    ctx.quadraticCurveTo(dx + 2, y + h * 0.4, dx - 1, y + h * 0.85)
    ctx.stroke()
  }

  // tiebacks
  ctx.fillStyle = '#DAA520'
  ctx.beginPath()
  ctx.ellipse(x - w * 0.32, y + h * 0.35, 4, 6, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(x + w * 0.32, y + h * 0.35, 4, 6, 0, 0, Math.PI * 2)
  ctx.fill()

  ctx.restore()
}

export function drawSheerCurtain(ctx, x, y, w, h) {
  ctx.save()
  // rod
  ctx.fillStyle = '#ccc'
  ctx.fillRect(x - w/2 - 3, y, w + 6, 3)

  ctx.globalAlpha = 0.35
  // flowing sheer fabric
  const folds = 6
  for (let i = 0; i < folds; i++) {
    const fx = x - w/2 + (w / folds) * i
    const fw = w / folds + 3
    const foldGrad = ctx.createLinearGradient(fx, y, fx + fw, y)
    foldGrad.addColorStop(0, '#fff')
    foldGrad.addColorStop(0.5, '#ffeedd')
    foldGrad.addColorStop(1, '#fff')
    ctx.fillStyle = foldGrad
    ctx.beginPath()
    ctx.moveTo(fx, y + 3)
    ctx.quadraticCurveTo(fx + fw/2, y + h * 0.5, fx - 2, y + h * 0.95)
    ctx.lineTo(fx + fw + 2, y + h * 0.95)
    ctx.quadraticCurveTo(fx + fw/2, y + h * 0.5, fx + fw, y + 3)
    ctx.closePath()
    ctx.fill()
  }
  ctx.restore()
}

export function drawBambooBlinds(ctx, x, y, w, h) {
  ctx.save()
  // top bar
  ctx.fillStyle = '#8B7355'
  ctx.fillRect(x - w/2, y, w, 5)

  // slats
  const slats = 14
  const slatH = (h - 8) / slats
  for (let i = 0; i < slats; i++) {
    const sy = y + 6 + i * slatH
    const shade = 0.8 + Math.sin(i * 1.5) * 0.2
    ctx.fillStyle = `rgb(${Math.floor(180 * shade)}, ${Math.floor(140 * shade)}, ${Math.floor(80 * shade)})`
    ctx.fillRect(x - w/2 + 2, sy, w - 4, slatH - 1)
    // highlight on each slat
    ctx.fillStyle = 'rgba(255,255,255,0.08)'
    ctx.fillRect(x - w/2 + 2, sy, w - 4, 1)
  }

  // strings
  ctx.strokeStyle = '#a08060'
  ctx.lineWidth = 0.8
  ctx.beginPath()
  ctx.moveTo(x - w * 0.25, y + 5)
  ctx.lineTo(x - w * 0.25, y + h)
  ctx.moveTo(x + w * 0.25, y + 5)
  ctx.lineTo(x + w * 0.25, y + h)
  ctx.stroke()

  ctx.restore()
}

// ===== WALL DECORATION RENDERERS =====

export function drawWallClock(ctx, x, y, w, h) {
  ctx.save()
  const r = Math.min(w, h) * 0.45

  // shadow
  ctx.shadowColor = 'rgba(0,0,0,0.2)'
  ctx.shadowBlur = 6
  ctx.shadowOffsetY = 2

  // face
  ctx.beginPath()
  ctx.arc(x, y + h/2, r, 0, Math.PI * 2)
  const faceGrad = ctx.createRadialGradient(x, y + h/2, 0, x, y + h/2, r)
  faceGrad.addColorStop(0, '#fffff0')
  faceGrad.addColorStop(1, '#f5f0e0')
  ctx.fillStyle = faceGrad
  ctx.fill()

  // rim
  ctx.strokeStyle = '#8B7355'
  ctx.lineWidth = 3
  ctx.stroke()

  ctx.shadowBlur = 0
  ctx.shadowOffsetY = 0

  // hour marks
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2 - Math.PI / 2
    const innerR = r * 0.78
    const outerR = r * 0.88
    ctx.beginPath()
    ctx.moveTo(x + Math.cos(angle) * innerR, y + h/2 + Math.sin(angle) * innerR)
    ctx.lineTo(x + Math.cos(angle) * outerR, y + h/2 + Math.sin(angle) * outerR)
    ctx.strokeStyle = '#333'
    ctx.lineWidth = i % 3 === 0 ? 2 : 1
    ctx.stroke()
  }

  // hands (use current time)
  const now = new Date()
  const hourAngle = ((now.getHours() % 12) / 12) * Math.PI * 2 - Math.PI / 2
  const minAngle = (now.getMinutes() / 60) * Math.PI * 2 - Math.PI / 2

  ctx.strokeStyle = '#333'
  ctx.lineWidth = 2.5
  ctx.beginPath()
  ctx.moveTo(x, y + h/2)
  ctx.lineTo(x + Math.cos(hourAngle) * r * 0.5, y + h/2 + Math.sin(hourAngle) * r * 0.5)
  ctx.stroke()

  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(x, y + h/2)
  ctx.lineTo(x + Math.cos(minAngle) * r * 0.7, y + h/2 + Math.sin(minAngle) * r * 0.7)
  ctx.stroke()

  // center dot
  ctx.beginPath()
  ctx.arc(x, y + h/2, 3, 0, Math.PI * 2)
  ctx.fillStyle = '#333'
  ctx.fill()

  ctx.restore()
}

export function drawWallShelf(ctx, x, y, w, h) {
  ctx.save()
  // brackets
  ctx.fillStyle = '#5D3A1A'
  ctx.beginPath()
  ctx.moveTo(x - w * 0.3, y + h)
  ctx.lineTo(x - w * 0.3, y + h - 12)
  ctx.lineTo(x - w * 0.3 + 10, y + h)
  ctx.closePath()
  ctx.fill()
  ctx.beginPath()
  ctx.moveTo(x + w * 0.3, y + h)
  ctx.lineTo(x + w * 0.3, y + h - 12)
  ctx.lineTo(x + w * 0.3 - 10, y + h)
  ctx.closePath()
  ctx.fill()

  // shelf board
  ctx.fillStyle = '#6B4226'
  ctx.fillRect(x - w/2, y + h - 5, w, 5)
  ctx.fillStyle = 'rgba(255,255,255,0.15)'
  ctx.fillRect(x - w/2, y + h - 5, w, 2)
  // front edge depth
  ctx.fillStyle = '#5D3A1A'
  ctx.fillRect(x - w/2, y + h, w, 3)

  // items on shelf
  // vase
  ctx.beginPath()
  ctx.moveTo(x - w * 0.3, y + h - 5)
  ctx.quadraticCurveTo(x - w * 0.3 - 4, y + h - 18, x - w * 0.3 - 2, y + h - 25)
  ctx.lineTo(x - w * 0.3 + 2, y + h - 25)
  ctx.quadraticCurveTo(x - w * 0.3 + 4, y + h - 18, x - w * 0.3, y + h - 5)
  ctx.fillStyle = '#e8c99b'
  ctx.fill()

  // small plant
  ctx.fillStyle = '#4CAF50'
  ctx.beginPath()
  ctx.arc(x, y + h - 14, 6, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#7B5230'
  ctx.fillRect(x - 4, y + h - 9, 8, 5)

  // cup
  ctx.fillStyle = '#fff'
  ctx.fillRect(x + w * 0.2, y + h - 12, 8, 8)
  ctx.fillStyle = '#3498db'
  ctx.fillRect(x + w * 0.2 + 1, y + h - 11, 6, 3)

  ctx.restore()
}

export function drawDecorMirror(ctx, x, y, w, h) {
  ctx.save()
  // shadow
  ctx.shadowColor = 'rgba(0,0,0,0.2)'
  ctx.shadowBlur = 8
  ctx.shadowOffsetY = 3

  // ornate frame
  ctx.beginPath()
  ctx.ellipse(x, y + h/2, w/2 + 4, h/2 + 4, 0, 0, Math.PI * 2)
  ctx.fillStyle = '#B8860B'
  ctx.fill()

  ctx.beginPath()
  ctx.ellipse(x, y + h/2, w/2 + 2, h/2 + 2, 0, 0, Math.PI * 2)
  ctx.fillStyle = '#DAA520'
  ctx.fill()

  ctx.restore()

  // mirror surface
  ctx.beginPath()
  ctx.ellipse(x, y + h/2, w/2 - 2, h/2 - 2, 0, 0, Math.PI * 2)
  const mirrorGrad = ctx.createLinearGradient(x - w/2, y, x + w/2, y + h)
  mirrorGrad.addColorStop(0, '#e8eef5')
  mirrorGrad.addColorStop(0.3, '#d0dae8')
  mirrorGrad.addColorStop(0.7, '#c8d4e2')
  mirrorGrad.addColorStop(1, '#e0e8f0')
  ctx.fillStyle = mirrorGrad
  ctx.fill()

  // reflection highlight
  ctx.beginPath()
  ctx.ellipse(x - w * 0.15, y + h * 0.35, w * 0.15, h * 0.2, -0.3, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(255,255,255,0.25)'
  ctx.fill()
}

export function drawHangingPlant(ctx, x, y, w, h) {
  ctx.save()
  // hook
  ctx.strokeStyle = '#666'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.arc(x, y, 4, 0, Math.PI)
  ctx.stroke()

  // strings
  ctx.strokeStyle = '#8B7355'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(x - 3, y + 3)
  ctx.lineTo(x - 6, y + h * 0.3)
  ctx.moveTo(x + 3, y + 3)
  ctx.lineTo(x + 6, y + h * 0.3)
  ctx.stroke()

  // pot
  const potY = y + h * 0.28
  ctx.fillStyle = '#A0522D'
  ctx.beginPath()
  ctx.moveTo(x - 8, potY)
  ctx.lineTo(x + 8, potY)
  ctx.lineTo(x + 6, potY + 12)
  ctx.lineTo(x - 6, potY + 12)
  ctx.closePath()
  ctx.fill()

  // trailing vines
  const vines = [
    { sx: x - 4, len: h * 0.55 },
    { sx: x + 3, len: h * 0.6 },
    { sx: x - 1, len: h * 0.5 },
    { sx: x + 6, len: h * 0.45 }
  ]
  for (const vine of vines) {
    ctx.strokeStyle = '#388E3C'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(vine.sx, potY + 12)
    ctx.quadraticCurveTo(vine.sx + Math.sin(vine.len) * 8, potY + vine.len * 0.5, vine.sx + Math.sin(vine.len * 2) * 5, potY + vine.len)
    ctx.stroke()

    // leaves on vine
    for (let t = 0.3; t < 1; t += 0.25) {
      const lx = vine.sx + Math.sin(vine.len * t * 2) * 4 * t
      const ly = potY + 12 + vine.len * t
      ctx.fillStyle = '#4CAF50'
      ctx.beginPath()
      ctx.ellipse(lx, ly, 4, 2.5, Math.sin(t) * 0.5, 0, Math.PI * 2)
      ctx.fill()
    }
  }
  ctx.restore()
}

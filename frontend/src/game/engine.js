import { Customer } from './customer.js'
import { Restaurant } from './restaurant.js'

export class GameEngine {
  constructor(canvas, options = {}) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
    this.restaurant = new Restaurant(canvas.width, canvas.height)
    this.customers = []
    this.particles = []
    this.floatingTexts = []
    this.customerIdCounter = 0
    this.spawnTimer = 0
    this.spawnInterval = 200
    this.running = false
    this.hoveredCustomer = null
    this.frameCount = 0

    this.onCustomerClick = options.onCustomerClick || (() => {})
    this.onEarnCoins = options.onEarnCoins || (() => {})
    this.onServeCustomer = options.onServeCustomer || (() => {})
    this.onStaffAction = options.onStaffAction || (() => {})

    this.dishes = options.dishes || []
    this.staff = []
    this.billHistory = []

    this._bindEvents()
  }

  _bindEvents() {
    this.canvas.addEventListener('mousemove', (e) => this._onMouseMove(e))
    this.canvas.addEventListener('click', (e) => this._onClick(e))
  }

  _getMousePos(e) {
    const rect = this.canvas.getBoundingClientRect()
    const scaleX = this.canvas.width / rect.width
    const scaleY = this.canvas.height / rect.height
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    }
  }

  _onMouseMove(e) {
    const pos = this._getMousePos(e)
    this.hoveredCustomer = null
    for (const c of this.customers) {
      c.highlighted = false
      if (c.clickable && c.containsPoint(pos.x, pos.y)) {
        c.highlighted = true
        this.hoveredCustomer = c
      }
    }
    this.canvas.style.cursor = this.hoveredCustomer ? 'pointer' : 'default'
  }

  _onClick(e) {
    const pos = this._getMousePos(e)
    for (const c of this.customers) {
      if (c.clickable && c.containsPoint(pos.x, pos.y)) {
        this.onCustomerClick(c)
        return
      }
    }
  }

  start() {
    this.running = true
    this._loop()
  }

  stop() {
    this.running = false
  }

  updateDishes(dishes) {
    this.dishes = dishes
  }

  updateSeats(count) {
    this.restaurant.maxSeats = count
    this.restaurant.seats = this.restaurant.generateSeats(count)
  }

  updateStaff(staff) {
    this.staff = staff
  }

  _loop() {
    if (!this.running) return
    this.frameCount++
    this._update()
    this._render()
    requestAnimationFrame(() => this._loop())
  }

  _update() {
    this.spawnTimer++
    if (this.spawnTimer >= this.spawnInterval && this.dishes.length > 0) {
      this._spawnCustomer()
      this.spawnTimer = 0
      this.spawnInterval = 150 + Math.random() * 150
    }

    for (const c of this.customers) {
      const prevState = c.state
      c.update()

      if (prevState === 'paying' && c.state === 'leaving') {
        this.restaurant.releaseSeat(c.seatIndex)
        this.onServeCustomer()
      }
    }

    this.customers = this.customers.filter(c => !c.isDone())

    // Staff auto-actions
    for (const s of this.staff) {
      const result = s.update(this.customers, this)
      if (result && result.type !== 'started') {
        this._handleStaffResult(result)
      }
    }

    this.particles = this.particles.filter(p => {
      p.x += p.vx
      p.y += p.vy
      p.vy += 0.06
      p.life--
      p.alpha = p.life / p.maxLife
      return p.life > 0
    })

    this.floatingTexts = this.floatingTexts.filter(t => {
      t.y -= 1
      t.life--
      t.alpha = t.life / t.maxLife
      return t.life > 0
    })
  }

  _handleStaffResult(result) {
    if (result.type === 'checkout_done') {
      this.onEarnCoins(result.payment)
      this._spawnCoinEffect(result.customer.x, result.customer.y - 30, result.payment)
      this._addBill(result.customer, result.payment, result.staff)
    } else if (result.type === 'dish_served' || result.type === 'order_taken') {
      this._spawnStaffEffect(result.customer.x, result.customer.y - 40, result.staff)
    }
    this.onStaffAction(result)
  }

  _spawnCustomer() {
    const seatIndex = this.restaurant.getFreeSeat()
    if (seatIndex === -1) return

    const pos = this.restaurant.getSeatPosition(seatIndex)
    const customer = new Customer(this.customerIdCounter++, seatIndex, pos, this.dishes)
    this.customers.push(customer)
  }

  confirmOrder(customer, dish) {
    customer.confirmOrder(dish || customer.wantedDish)
  }

  serveDish(customer) {
    customer.serveDish()
  }

  checkout(customer) {
    const payment = customer.getPayment()
    customer.checkout()
    this.onEarnCoins(payment)
    this._spawnCoinEffect(customer.x, customer.y - 30, payment)
    this._addBill(customer, payment, null)
    return payment
  }

  _addBill(customer, amount, staff) {
    this.billHistory.unshift({
      id: Date.now(),
      customerName: customer.name,
      customerEmoji: customer.emoji,
      dish: customer.orderedDish,
      amount,
      tip: Math.floor(amount - (customer.orderedDish?.price || 0)),
      satisfaction: customer.evaluationMood,
      staffName: staff ? staff.name : '玩家',
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    })
    if (this.billHistory.length > 50) this.billHistory.pop()
  }

  _spawnCoinEffect(x, y, amount) {
    this.floatingTexts.push({
      x, y: y - 20,
      text: `+${amount} 🪙`,
      color: '#f1c40f',
      size: 22,
      life: 70,
      maxLife: 70,
      alpha: 1
    })
    for (let i = 0; i < 10; i++) {
      this.particles.push({
        x, y,
        vx: (Math.random() - 0.5) * 6,
        vy: -Math.random() * 5 - 1,
        life: 40,
        maxLife: 40,
        alpha: 1,
        color: Math.random() > 0.5 ? '#f1c40f' : '#f39c12',
        size: Math.random() * 5 + 2
      })
    }
  }

  _spawnStaffEffect(x, y, staff) {
    this.floatingTexts.push({
      x, y: y - 10,
      text: `${staff.emoji} ${staff.name}`,
      color: '#3498db',
      size: 14,
      life: 50,
      maxLife: 50,
      alpha: 1
    })
  }

  _render() {
    const ctx = this.ctx
    const w = this.canvas.width
    const h = this.canvas.height

    this._drawBackground(ctx, w, h)
    this._drawFloor(ctx, w, h)
    this._drawWalls(ctx, w, h)
    this._drawDecorations(ctx)
    this._drawTables(ctx)
    this._drawCustomers(ctx)
    this._drawParticles(ctx)
    this._drawFloatingTexts(ctx)
    this._drawCashierCounter(ctx, w, h)
    this._drawStaffArea(ctx, w, h)
  }

  _drawBackground(ctx, w, h) {
    const grad = ctx.createLinearGradient(0, 0, 0, h * 0.4)
    grad.addColorStop(0, '#fff8e7')
    grad.addColorStop(1, '#fff3d4')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, w, h)
  }

  _drawFloor(ctx, w, h) {
    const floorY = h * 0.35
    const grad = ctx.createLinearGradient(0, floorY, 0, h)
    grad.addColorStop(0, '#e8c99b')
    grad.addColorStop(0.5, '#dbb88a')
    grad.addColorStop(1, '#d4a76a')
    ctx.fillStyle = grad
    ctx.fillRect(0, floorY, w, h - floorY)

    ctx.strokeStyle = 'rgba(139, 90, 43, 0.06)'
    ctx.lineWidth = 1
    for (let y = floorY; y < h - 70; y += 25) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(w, y)
      ctx.stroke()
    }
    for (let x = 0; x < w; x += 80) {
      ctx.beginPath()
      ctx.moveTo(x, floorY)
      ctx.lineTo(x, h - 70)
      ctx.stroke()
    }
  }

  _drawWalls(ctx, w, h) {
    ctx.fillStyle = '#d4a574'
    ctx.fillRect(0, h * 0.35 - 4, w, 4)

    this._drawWindow(ctx, 80, 60, 100, 85)
    this._drawWindow(ctx, w - 180, 60, 100, 85)

    ctx.save()
    ctx.font = 'bold 26px "Comic Sans MS", cursive'
    ctx.textAlign = 'center'
    ctx.fillStyle = '#d35400'
    ctx.shadowColor = 'rgba(211, 84, 0, 0.3)'
    ctx.shadowBlur = 12
    ctx.fillText('🏠 欢乐小餐厅 🏠', w / 2, 42)
    ctx.restore()

    const pulse = Math.sin(Date.now() * 0.003) * 0.3 + 0.7
    ctx.save()
    ctx.globalAlpha = pulse
    ctx.font = '14px "Comic Sans MS", cursive'
    ctx.textAlign = 'center'
    ctx.fillStyle = '#27ae60'
    ctx.fillText('✨ 营业中 ✨', w / 2, 64)
    ctx.restore()
  }

  _drawWindow(ctx, x, y, w, h) {
    ctx.save()
    ctx.shadowColor = 'rgba(135, 206, 235, 0.3)'
    ctx.shadowBlur = 8
    ctx.fillStyle = '#87CEEB'
    ctx.beginPath()
    ctx.roundRect(x, y, w, h, 6)
    ctx.fill()
    ctx.restore()

    ctx.strokeStyle = '#8B4513'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.roundRect(x, y, w, h, 6)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(x + w / 2, y)
    ctx.lineTo(x + w / 2, y + h)
    ctx.moveTo(x, y + h / 2)
    ctx.lineTo(x + w, y + h / 2)
    ctx.stroke()

    ctx.fillStyle = 'rgba(255, 182, 193, 0.5)'
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.quadraticCurveTo(x + w * 0.25, y + 22, x, y + 30)
    ctx.fill()
    ctx.beginPath()
    ctx.moveTo(x + w, y)
    ctx.quadraticCurveTo(x + w * 0.75, y + 22, x + w, y + 30)
    ctx.fill()
  }

  _drawDecorations(ctx) {
    for (const d of this.restaurant.decorations) {
      ctx.font = `${d.size}px serif`
      ctx.textAlign = 'center'
      ctx.fillText(d.emoji, d.x, d.y)
    }
  }

  _drawTables(ctx) {
    for (let i = 0; i < this.restaurant.seats.length; i++) {
      const seat = this.restaurant.seats[i]
      const style = seat.tableStyle

      ctx.beginPath()
      ctx.ellipse(seat.x, seat.y + 22, 38, 9, 0, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(0, 0, 0, 0.06)'
      ctx.fill()

      const colors = ['#8B5E3C', '#6B4226', '#A0522D']
      ctx.beginPath()
      ctx.roundRect(seat.x - 36, seat.y - 10, 72, 32, 8)
      ctx.fillStyle = colors[style]
      ctx.fill()
      ctx.strokeStyle = 'rgba(0,0,0,0.1)'
      ctx.lineWidth = 1
      ctx.stroke()

      ctx.beginPath()
      ctx.roundRect(seat.x - 30, seat.y - 7, 60, 10, 4)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.12)'
      ctx.fill()

      ctx.beginPath()
      ctx.arc(seat.x - 30, seat.y + 32, 11, 0, Math.PI * 2)
      ctx.fillStyle = '#654321'
      ctx.fill()
      ctx.beginPath()
      ctx.arc(seat.x + 30, seat.y + 32, 11, 0, Math.PI * 2)
      ctx.fillStyle = '#5c3d1e'
      ctx.fill()

      if (!seat.occupied) {
        ctx.font = '14px serif'
        ctx.textAlign = 'center'
        const flower = ['🌸', '🌺', '🌻', '💐'][i % 4]
        ctx.fillText(flower, seat.x, seat.y + 2)
      }

      ctx.font = '10px "Comic Sans MS", cursive'
      ctx.fillStyle = 'rgba(0,0,0,0.2)'
      ctx.textAlign = 'center'
      ctx.fillText(`${i + 1}号桌`, seat.x, seat.y + 50)
    }
  }

  _drawCustomers(ctx) {
    for (const c of this.customers) {
      ctx.save()
      ctx.globalAlpha = c.alpha

      const bounce = Math.sin(c.bouncePhase) * 2.5
      const y = c.y + bounce

      if (c.highlighted) {
        ctx.beginPath()
        ctx.arc(c.x, y - 15, 34, 0, Math.PI * 2)
        const glowGrad = ctx.createRadialGradient(c.x, y - 15, 0, c.x, y - 15, 34)
        glowGrad.addColorStop(0, 'rgba(241, 196, 15, 0.2)')
        glowGrad.addColorStop(1, 'rgba(241, 196, 15, 0)')
        ctx.fillStyle = glowGrad
        ctx.fill()
        ctx.strokeStyle = 'rgba(241, 196, 15, 0.7)'
        ctx.lineWidth = 2.5
        ctx.stroke()
      }

      ctx.font = '34px serif'
      ctx.textAlign = 'center'
      ctx.fillText(c.emoji, c.x, y - 10)

      ctx.font = '15px serif'
      ctx.fillText(c.getMoodEmoji(), c.x + 22, y - 38)

      if (c.state !== 'walking_in' && c.state !== 'leaving' && c.state !== 'paying') {
        this._drawPatienceBar(ctx, c.x, y - 58, c.patience)
      }

      this._drawDialogueBubble(ctx, c, c.x, y)

      if (c.clickable && c.highlighted) {
        ctx.font = 'bold 12px "Comic Sans MS", cursive'
        ctx.fillStyle = '#f39c12'
        ctx.textAlign = 'center'
        const hintBounce = Math.sin(this.frameCount * 0.08) * 2
        ctx.fillText(c.interactionHint, c.x, y + 48 + hintBounce)
      }

      ctx.restore()
    }
  }

  _drawPatienceBar(ctx, x, y, patience) {
    const w = 44
    const h = 6
    ctx.beginPath()
    ctx.roundRect(x - w / 2 - 1, y - 1, w + 2, h + 2, 4)
    ctx.fillStyle = 'rgba(0,0,0,0.15)'
    ctx.fill()

    ctx.beginPath()
    ctx.roundRect(x - w / 2, y, w, h, 3)
    ctx.fillStyle = 'rgba(0,0,0,0.2)'
    ctx.fill()

    const color = patience > 60 ? '#2ecc71' : patience > 30 ? '#f39c12' : '#e74c3c'
    ctx.beginPath()
    ctx.roundRect(x - w / 2, y, w * (patience / 100), h, 3)
    ctx.fillStyle = color
    ctx.fill()
  }

  _drawDialogueBubble(ctx, customer, x, y) {
    const dialogue = customer.getDialogue()
    const label = customer.getStateLabel()
    const displayText = dialogue || label
    if (!displayText) return

    ctx.font = '12px "Comic Sans MS", cursive'
    const textW = ctx.measureText(displayText).width || 60
    const bw = Math.max(textW + 20, 60)
    const bh = 28
    const bx = x - bw / 2
    const by = y - 88

    // Bubble background with mood color
    let bgColor = 'rgba(255,255,255,0.95)'
    let borderColor = '#e0e0e0'
    if (dialogue && customer.evaluationMood === 'angry') {
      bgColor = 'rgba(255,235,235,0.95)'
      borderColor = '#ffaaaa'
    } else if (dialogue && customer.evaluationMood === 'happy') {
      bgColor = 'rgba(235,255,235,0.95)'
      borderColor = '#aaffaa'
    }

    ctx.save()
    ctx.shadowColor = 'rgba(0,0,0,0.08)'
    ctx.shadowBlur = 6
    ctx.shadowOffsetY = 2
    ctx.beginPath()
    ctx.roundRect(bx, by, bw, bh, 12)
    ctx.fillStyle = bgColor
    ctx.fill()
    ctx.restore()

    ctx.strokeStyle = borderColor
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.roundRect(bx, by, bw, bh, 12)
    ctx.stroke()

    // Triangle pointer
    ctx.beginPath()
    ctx.moveTo(x - 6, by + bh)
    ctx.lineTo(x + 6, by + bh)
    ctx.lineTo(x, by + bh + 7)
    ctx.closePath()
    ctx.fillStyle = bgColor
    ctx.fill()
    ctx.beginPath()
    ctx.moveTo(x - 6, by + bh)
    ctx.lineTo(x, by + bh + 7)
    ctx.lineTo(x + 6, by + bh)
    ctx.strokeStyle = borderColor
    ctx.stroke()

    // Text
    ctx.font = '11px "Comic Sans MS", cursive'
    ctx.textAlign = 'center'
    ctx.fillStyle = dialogue ? '#333' : '#666'
    ctx.fillText(displayText, x, by + 18)

    // Cook progress
    if (customer.state === 'cooking' && customer.cookDuration > 0) {
      const progress = customer.cookProgress / customer.cookDuration
      const barY = by + bh - 4
      ctx.fillStyle = 'rgba(0,0,0,0.08)'
      ctx.beginPath()
      ctx.roundRect(bx + 6, barY, bw - 12, 3, 2)
      ctx.fill()
      ctx.fillStyle = '#e67e22'
      ctx.beginPath()
      ctx.roundRect(bx + 6, barY, (bw - 12) * progress, 3, 2)
      ctx.fill()
    }

    // Eat progress
    if (customer.state === 'eating' && customer.eatDuration > 0) {
      const progress = customer.eatProgress / customer.eatDuration
      const barY = by + bh - 4
      ctx.fillStyle = 'rgba(0,0,0,0.08)'
      ctx.beginPath()
      ctx.roundRect(bx + 6, barY, bw - 12, 3, 2)
      ctx.fill()
      ctx.fillStyle = '#27ae60'
      ctx.beginPath()
      ctx.roundRect(bx + 6, barY, (bw - 12) * progress, 3, 2)
      ctx.fill()
    }

    // Dish emoji above bubble
    if (customer.orderedDish && (customer.state === 'cooking' || customer.state === 'ready_to_serve' || customer.state === 'eating')) {
      ctx.font = '18px serif'
      ctx.textAlign = 'center'
      const dishBounce = Math.sin(this.frameCount * 0.05) * 2
      ctx.fillText(customer.orderedDish.emoji || '🍲', x, by - 4 + dishBounce)
    }
  }

  _drawParticles(ctx) {
    for (const p of this.particles) {
      ctx.save()
      ctx.globalAlpha = p.alpha
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
      ctx.fillStyle = p.color
      ctx.fill()
      ctx.restore()
    }
  }

  _drawFloatingTexts(ctx) {
    for (const t of this.floatingTexts) {
      ctx.save()
      ctx.globalAlpha = t.alpha
      ctx.font = `bold ${t.size}px "Comic Sans MS", cursive`
      ctx.textAlign = 'center'
      ctx.fillStyle = t.color
      ctx.shadowColor = 'rgba(0,0,0,0.2)'
      ctx.shadowBlur = 4
      ctx.fillText(t.text, t.x, t.y)
      ctx.restore()
    }
  }

  _drawCashierCounter(ctx, w, h) {
    const cy = h - 70
    const counterH = 70

    // Counter main body
    const grad = ctx.createLinearGradient(0, cy, 0, h)
    grad.addColorStop(0, '#7d5c3a')
    grad.addColorStop(0.2, '#6d4c2a')
    grad.addColorStop(0.6, '#5d3f22')
    grad.addColorStop(1, '#3e2a15')
    ctx.fillStyle = grad
    ctx.beginPath()
    ctx.roundRect(0, cy, w, counterH, [12, 12, 0, 0])
    ctx.fill()

    // Counter top surface
    ctx.fillStyle = 'rgba(255,255,255,0.08)'
    ctx.fillRect(0, cy, w, 4)

    // Cashier area on right
    const cashierX = w - 180
    ctx.save()
    ctx.fillStyle = 'rgba(255,255,255,0.04)'
    ctx.beginPath()
    ctx.roundRect(cashierX, cy + 8, 170, counterH - 16, 10)
    ctx.fill()
    ctx.strokeStyle = 'rgba(255,255,255,0.1)'
    ctx.lineWidth = 1
    ctx.stroke()
    ctx.restore()

    // Cash register
    ctx.font = '28px serif'
    ctx.textAlign = 'center'
    ctx.fillText('🖥️', cashierX + 40, cy + 45)
    ctx.font = '11px "Comic Sans MS", cursive'
    ctx.fillStyle = 'rgba(255,255,255,0.7)'
    ctx.fillText('收银台', cashierX + 40, cy + 60)

    // Money indicator
    ctx.font = '24px serif'
    ctx.textAlign = 'center'
    ctx.fillText('💵', cashierX + 100, cy + 40)
    ctx.fillText('🧾', cashierX + 140, cy + 40)

    // Left - Kitchen area
    ctx.font = '28px serif'
    ctx.textAlign = 'center'
    ctx.fillText('🧑‍🍳', 45, cy + 45)
    ctx.font = '11px "Comic Sans MS", cursive'
    ctx.fillStyle = 'rgba(255,255,255,0.7)'
    ctx.fillText('厨房', 45, cy + 60)

    // Menu display
    ctx.font = '24px serif'
    ctx.fillText('📋', 110, cy + 40)

    // Bell
    const bellBounce = Math.sin(this.frameCount * 0.06) * 1.5
    ctx.fillText('🔔', 160, cy + 38 + bellBounce)

    // Dish display on counter
    const dishStartX = 210
    for (let i = 0; i < Math.min(this.dishes.length, 6); i++) {
      ctx.font = '20px serif'
      const dishFloat = Math.sin(this.frameCount * 0.03 + i * 0.5) * 1.5
      ctx.fillText(this.dishes[i].emoji || '🍲', dishStartX + i * 42, cy + 40 + dishFloat)
    }
  }

  _drawStaffArea(ctx, w, h) {
    if (this.staff.length === 0) return
    const cy = h - 70

    // Draw active staff near counter
    let sx = 50
    for (const s of this.staff) {
      const bobble = Math.sin(this.frameCount * 0.04 + s.id) * 2
      if (s.busy) {
        ctx.save()
        ctx.globalAlpha = 0.6
        ctx.font = '20px serif'
        ctx.textAlign = 'center'
        ctx.fillText(s.emoji, sx, cy - 15 + bobble)
        ctx.font = '9px "Comic Sans MS", cursive'
        ctx.fillStyle = '#3498db'
        ctx.fillText('忙碌中...', sx, cy - 2)
        ctx.restore()
      } else {
        ctx.font = '20px serif'
        ctx.textAlign = 'center'
        ctx.fillText(s.emoji, sx, cy - 15 + bobble)
        ctx.font = '9px "Comic Sans MS", cursive'
        ctx.fillStyle = 'rgba(255,255,255,0.6)'
        ctx.textAlign = 'center'
        ctx.fillText(s.name, sx, cy - 2)
      }
      sx += 35
    }
  }
}

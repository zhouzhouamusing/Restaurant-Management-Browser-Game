import { Customer } from './customer.js'
import { Restaurant } from './restaurant.js'

/**
 * 游戏引擎 - 管理游戏主循环、渲染、点击交互
 */
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

    this.onCustomerClick = options.onCustomerClick || (() => {})
    this.onEarnCoins = options.onEarnCoins || (() => {})
    this.onServeCustomer = options.onServeCustomer || (() => {})

    this.dishes = options.dishes || []

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

  _loop() {
    if (!this.running) return
    this._update()
    this._render()
    requestAnimationFrame(() => this._loop())
  }

  _update() {
    // 生成顾客
    this.spawnTimer++
    if (this.spawnTimer >= this.spawnInterval && this.dishes.length > 0) {
      this._spawnCustomer()
      this.spawnTimer = 0
      this.spawnInterval = 150 + Math.random() * 150
    }

    // 更新顾客
    for (const c of this.customers) {
      const prevState = c.state
      c.update()

      if (prevState === 'paying' && c.state === 'leaving') {
        this.restaurant.releaseSeat(c.seatIndex)
        this.onServeCustomer()
      }
    }

    this.customers = this.customers.filter(c => !c.isDone())

    // 更新粒子
    this.particles = this.particles.filter(p => {
      p.x += p.vx
      p.y += p.vy
      p.vy += 0.08
      p.life--
      p.alpha = p.life / p.maxLife
      return p.life > 0
    })

    // 更新浮动文字
    this.floatingTexts = this.floatingTexts.filter(t => {
      t.y -= 1.2
      t.life--
      t.alpha = t.life / t.maxLife
      return t.life > 0
    })
  }

  _spawnCustomer() {
    const seatIndex = this.restaurant.getFreeSeat()
    if (seatIndex === -1) return

    const pos = this.restaurant.getSeatPosition(seatIndex)
    const customer = new Customer(this.customerIdCounter++, seatIndex, pos)
    this.customers.push(customer)
  }

  confirmOrder(customer, dish) {
    customer.confirmOrder(dish)
  }

  serveDish(customer) {
    customer.serveDish()
  }

  checkout(customer) {
    const payment = customer.getPayment()
    customer.checkout()
    this.onEarnCoins(payment)
    this._spawnCoinEffect(customer.x, customer.y - 30, payment)
    return payment
  }

  _spawnCoinEffect(x, y, amount) {
    this.floatingTexts.push({
      x, y: y - 20,
      text: `+${amount} 🪙`,
      color: '#f1c40f',
      size: 20,
      life: 60,
      maxLife: 60,
      alpha: 1
    })
    for (let i = 0; i < 8; i++) {
      this.particles.push({
        x, y,
        vx: (Math.random() - 0.5) * 5,
        vy: -Math.random() * 4 - 1,
        life: 35,
        maxLife: 35,
        alpha: 1,
        color: Math.random() > 0.5 ? '#f1c40f' : '#f39c12',
        size: Math.random() * 4 + 2
      })
    }
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
    this._drawCounter(ctx, w, h)
  }

  _drawBackground(ctx, w, h) {
    const grad = ctx.createLinearGradient(0, 0, 0, h * 0.4)
    grad.addColorStop(0, '#fff8e7')
    grad.addColorStop(1, '#fff3d4')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, w, h)
  }

  _drawFloor(ctx, w, h) {
    const floorY = h * 0.38
    const grad = ctx.createLinearGradient(0, floorY, 0, h)
    grad.addColorStop(0, '#e8c99b')
    grad.addColorStop(1, '#d4a76a')
    ctx.fillStyle = grad
    ctx.fillRect(0, floorY, w, h - floorY)

    // 木地板纹理
    ctx.strokeStyle = 'rgba(139, 90, 43, 0.08)'
    ctx.lineWidth = 1
    for (let y = floorY; y < h - 50; y += 25) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(w, y)
      ctx.stroke()
    }
    for (let x = 0; x < w; x += 80) {
      ctx.beginPath()
      ctx.moveTo(x, floorY)
      ctx.lineTo(x, h - 50)
      ctx.stroke()
    }
  }

  _drawWalls(ctx, w, h) {
    // 墙壁装饰线
    ctx.fillStyle = '#d4a574'
    ctx.fillRect(0, h * 0.38 - 4, w, 4)

    // 窗户
    this._drawWindow(ctx, 80, 70, 90, 80)
    this._drawWindow(ctx, w - 170, 70, 90, 80)

    // 招牌
    ctx.save()
    ctx.font = 'bold 24px "Comic Sans MS", cursive'
    ctx.textAlign = 'center'
    ctx.fillStyle = '#d35400'
    ctx.shadowColor = 'rgba(211, 84, 0, 0.3)'
    ctx.shadowBlur = 10
    ctx.fillText('🏠 欢乐小餐厅 🏠', w / 2, 45)
    ctx.restore()

    // 营业指示灯
    const pulse = Math.sin(Date.now() * 0.003) * 0.3 + 0.7
    ctx.save()
    ctx.globalAlpha = pulse
    ctx.font = '13px "Comic Sans MS", cursive'
    ctx.textAlign = 'center'
    ctx.fillStyle = '#27ae60'
    ctx.fillText('✨ 营业中 ✨', w / 2, 68)
    ctx.restore()
  }

  _drawWindow(ctx, x, y, w, h) {
    ctx.fillStyle = '#87CEEB'
    ctx.fillRect(x, y, w, h)
    ctx.strokeStyle = '#8B4513'
    ctx.lineWidth = 3
    ctx.strokeRect(x, y, w, h)
    ctx.beginPath()
    ctx.moveTo(x + w / 2, y)
    ctx.lineTo(x + w / 2, y + h)
    ctx.moveTo(x, y + h / 2)
    ctx.lineTo(x + w, y + h / 2)
    ctx.stroke()
    // 窗帘
    ctx.fillStyle = 'rgba(255, 182, 193, 0.6)'
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.quadraticCurveTo(x + w * 0.25, y + 20, x, y + 30)
    ctx.fill()
    ctx.beginPath()
    ctx.moveTo(x + w, y)
    ctx.quadraticCurveTo(x + w * 0.75, y + 20, x + w, y + 30)
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

      // 桌子阴影
      ctx.beginPath()
      ctx.ellipse(seat.x, seat.y + 22, 36, 8, 0, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(0, 0, 0, 0.08)'
      ctx.fill()

      // 桌子主体
      const colors = ['#8B5E3C', '#6B4226', '#A0522D']
      ctx.beginPath()
      ctx.roundRect(seat.x - 34, seat.y - 10, 68, 30, 6)
      ctx.fillStyle = colors[style]
      ctx.fill()
      ctx.strokeStyle = 'rgba(0,0,0,0.12)'
      ctx.lineWidth = 1
      ctx.stroke()

      // 桌面高光
      ctx.beginPath()
      ctx.roundRect(seat.x - 28, seat.y - 7, 56, 10, 3)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)'
      ctx.fill()

      // 椅子
      ctx.beginPath()
      ctx.arc(seat.x - 28, seat.y + 30, 10, 0, Math.PI * 2)
      ctx.fillStyle = '#654321'
      ctx.fill()
      ctx.beginPath()
      ctx.arc(seat.x + 28, seat.y + 30, 10, 0, Math.PI * 2)
      ctx.fillStyle = '#5c3d1e'
      ctx.fill()

      // 桌上空装饰
      if (!seat.occupied) {
        ctx.font = '13px serif'
        ctx.textAlign = 'center'
        ctx.fillText('🌸', seat.x, seat.y)
      }

      // 座位编号
      ctx.font = '10px Arial'
      ctx.fillStyle = 'rgba(0,0,0,0.25)'
      ctx.textAlign = 'center'
      ctx.fillText(`${i + 1}`, seat.x, seat.y + 48)
    }
  }

  _drawCustomers(ctx) {
    for (const c of this.customers) {
      ctx.save()
      ctx.globalAlpha = c.alpha

      const bounce = Math.sin(c.bouncePhase) * 2
      const y = c.y + bounce

      // 高亮光环
      if (c.highlighted) {
        ctx.beginPath()
        ctx.arc(c.x, y - 15, 32, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(241, 196, 15, 0.15)'
        ctx.fill()
        ctx.strokeStyle = 'rgba(241, 196, 15, 0.6)'
        ctx.lineWidth = 2
        ctx.stroke()
      }

      // 顾客emoji
      ctx.font = '32px serif'
      ctx.textAlign = 'center'
      ctx.fillText(c.emoji, c.x, y - 12)

      // 心情
      ctx.font = '14px serif'
      ctx.fillText(c.getMoodEmoji(), c.x + 20, y - 35)

      // 耐心条
      if (c.state !== 'walking_in' && c.state !== 'leaving' && c.state !== 'paying') {
        this._drawPatienceBar(ctx, c.x, y - 55, c.patience)
      }

      // 状态气泡
      this._drawStateBubble(ctx, c, c.x, y)

      // 交互提示
      if (c.clickable && c.highlighted) {
        ctx.font = 'bold 11px "Comic Sans MS", cursive'
        ctx.fillStyle = '#f39c12'
        ctx.textAlign = 'center'
        ctx.fillText(c.interactionHint, c.x, y + 45)
      }

      ctx.restore()
    }
  }

  _drawPatienceBar(ctx, x, y, patience) {
    const w = 40
    const h = 5
    ctx.fillStyle = 'rgba(0,0,0,0.2)'
    ctx.fillRect(x - w / 2, y, w, h)
    const color = patience > 60 ? '#2ecc71' : patience > 30 ? '#f39c12' : '#e74c3c'
    ctx.fillStyle = color
    ctx.fillRect(x - w / 2, y, w * (patience / 100), h)
  }

  _drawStateBubble(ctx, customer, x, y) {
    const label = customer.getStateLabel()
    if (!label) return

    // 气泡背景
    ctx.fillStyle = 'rgba(255,255,255,0.92)'
    const textW = ctx.measureText(label).width || 50
    const bw = Math.max(textW + 16, 55)
    const bh = 24
    const bx = x - bw / 2
    const by = y - 80

    ctx.beginPath()
    ctx.roundRect(bx, by, bw, bh, 10)
    ctx.fill()
    ctx.strokeStyle = '#ddd'
    ctx.lineWidth = 1
    ctx.stroke()

    // 小三角
    ctx.beginPath()
    ctx.moveTo(x - 5, by + bh)
    ctx.lineTo(x + 5, by + bh)
    ctx.lineTo(x, by + bh + 6)
    ctx.closePath()
    ctx.fillStyle = 'rgba(255,255,255,0.92)'
    ctx.fill()

    // 文字
    ctx.font = '11px "Comic Sans MS", cursive'
    ctx.textAlign = 'center'
    ctx.fillStyle = '#333'
    ctx.fillText(label, x, by + 16)

    // 烹饪进度条
    if (customer.state === 'cooking' && customer.cookDuration > 0) {
      const progress = customer.cookProgress / customer.cookDuration
      ctx.fillStyle = 'rgba(0,0,0,0.1)'
      ctx.fillRect(bx + 4, by + bh - 5, bw - 8, 3)
      ctx.fillStyle = '#e67e22'
      ctx.fillRect(bx + 4, by + bh - 5, (bw - 8) * progress, 3)
    }

    // 用餐进度条
    if (customer.state === 'eating' && customer.eatDuration > 0) {
      const progress = customer.eatProgress / customer.eatDuration
      ctx.fillStyle = 'rgba(0,0,0,0.1)'
      ctx.fillRect(bx + 4, by + bh - 5, bw - 8, 3)
      ctx.fillStyle = '#27ae60'
      ctx.fillRect(bx + 4, by + bh - 5, (bw - 8) * progress, 3)
    }

    // 显示点的菜
    if (customer.orderedDish && (customer.state === 'cooking' || customer.state === 'ready_to_serve' || customer.state === 'eating')) {
      ctx.font = '16px serif'
      ctx.fillText(customer.orderedDish.emoji || '🍲', x, by - 5)
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
      ctx.shadowColor = 'rgba(0,0,0,0.3)'
      ctx.shadowBlur = 3
      ctx.fillText(t.text, t.x, t.y)
      ctx.restore()
    }
  }

  _drawCounter(ctx, w, h) {
    const cy = h - 55
    // 柜台
    const grad = ctx.createLinearGradient(0, cy, 0, h)
    grad.addColorStop(0, '#6d4c2a')
    grad.addColorStop(0.3, '#5d3f22')
    grad.addColorStop(1, '#3e2a15')
    ctx.fillStyle = grad
    ctx.fillRect(0, cy, w, 55)

    // 柜台面板
    ctx.fillStyle = 'rgba(255,255,255,0.06)'
    ctx.fillRect(0, cy, w, 3)

    // 装饰物
    ctx.font = '24px serif'
    ctx.textAlign = 'center'
    ctx.fillText('🧑‍🍳', 50, cy + 35)
    ctx.fillText('📋', 110, cy + 35)
    ctx.fillText('🔔', w - 50, cy + 35)
    ctx.fillText('💵', w - 110, cy + 35)

    // 菜品展示
    const dishStartX = 180
    for (let i = 0; i < Math.min(this.dishes.length, 5); i++) {
      ctx.font = '18px serif'
      ctx.fillText(this.dishes[i].emoji || '🍲', dishStartX + i * 40, cy + 35)
    }
  }
}

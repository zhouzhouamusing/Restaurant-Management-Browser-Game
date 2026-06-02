import { Customer } from './customer.js'
import { Restaurant } from './restaurant.js'

/**
 * 游戏引擎 - 管理游戏循环、渲染和交互逻辑
 */
export class GameEngine {
  constructor(canvas, dishes, onEarnCoins, onServeCustomer) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
    this.dishes = dishes || []
    this.onEarnCoins = onEarnCoins
    this.onServeCustomer = onServeCustomer

    this.restaurant = new Restaurant(canvas.width, canvas.height)
    this.customers = []
    this.particles = []
    this.customerIdCounter = 0
    this.spawnTimer = 0
    this.spawnInterval = 180 // 每3秒生成一个顾客
    this.running = false
    this.lastTime = 0
    this.frameCount = 0
  }

  start() {
    this.running = true
    this.lastTime = performance.now()
    this.loop()
  }

  stop() {
    this.running = false
  }

  updateDishes(dishes) {
    this.dishes = dishes
  }

  loop() {
    if (!this.running) return
    const now = performance.now()
    const delta = now - this.lastTime
    this.lastTime = now
    this.frameCount++

    this.update(delta)
    this.render()
    requestAnimationFrame(() => this.loop())
  }

  update(delta) {
    this.restaurant.update()

    // 生成新顾客
    this.spawnTimer++
    if (this.spawnTimer >= this.spawnInterval && this.dishes.length > 0) {
      this.spawnCustomer()
      this.spawnTimer = 0
      // 随机化下次生成间隔
      this.spawnInterval = 120 + Math.random() * 120
    }

    // 更新顾客
    for (const customer of this.customers) {
      const prevState = customer.state
      customer.update(delta)

      // 顾客结账时获得金币
      if (prevState === 'eating' && customer.state === 'paying') {
        const earned = customer.dish?.price || 10
        this.onEarnCoins(earned)
        this.spawnCoinParticles(customer.x, customer.y, earned)
      }

      // 顾客离开时释放座位并计数
      if (customer.isDone()) {
        this.restaurant.releaseSeat(customer.seatIndex)
        this.onServeCustomer()
      }
    }

    // 清理离开的顾客
    this.customers = this.customers.filter(c => !c.isDone())

    // 更新粒子
    this.particles = this.particles.filter(p => {
      p.x += p.vx
      p.y += p.vy
      p.vy += 0.1
      p.life--
      p.alpha = p.life / p.maxLife
      return p.life > 0
    })
  }

  spawnCustomer() {
    const seatIndex = this.restaurant.getFreeSeat()
    if (seatIndex === -1) return // 没有空座位

    const dish = this.dishes[Math.floor(Math.random() * this.dishes.length)]
    const customer = new Customer(this.customerIdCounter++, seatIndex, dish)
    const seat = this.restaurant.seats[seatIndex]
    customer.targetX = seat.x
    customer.targetY = seat.y
    customer.y = seat.y
    this.customers.push(customer)
  }

  spawnCoinParticles(x, y, amount) {
    for (let i = 0; i < 6; i++) {
      this.particles.push({
        x, y,
        vx: (Math.random() - 0.5) * 4,
        vy: -Math.random() * 4 - 2,
        life: 40,
        maxLife: 40,
        alpha: 1,
        text: i === 0 ? `+${amount}` : '✨',
        color: '#f1c40f',
        size: i === 0 ? 16 : 12
      })
    }
  }

  render() {
    const ctx = this.ctx
    const w = this.canvas.width
    const h = this.canvas.height

    // 清屏并绘制背景
    this.drawBackground(ctx, w, h)

    // 绘制地板
    this.drawFloor(ctx, w, h)

    // 绘制墙壁装饰
    this.drawWallDecorations(ctx)

    // 绘制桌椅
    this.drawTables(ctx)

    // 绘制顾客
    this.drawCustomers(ctx)

    // 绘制粒子效果
    this.drawParticles(ctx)

    // 绘制前景装饰
    this.drawForeground(ctx, w, h)
  }

  drawBackground(ctx, w, h) {
    // 温暖的餐厅墙壁
    const gradient = ctx.createLinearGradient(0, 0, 0, h)
    gradient.addColorStop(0, '#fdf6e3')
    gradient.addColorStop(0.4, '#fef9ef')
    gradient.addColorStop(1, '#f5e6d3')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, w, h)

    // 墙壁纹理条纹
    ctx.strokeStyle = 'rgba(210, 180, 140, 0.15)'
    ctx.lineWidth = 1
    for (let i = 0; i < w; i += 40) {
      ctx.beginPath()
      ctx.moveTo(i, 0)
      ctx.lineTo(i, h * 0.35)
      ctx.stroke()
    }

    // 顶部腰线装饰
    ctx.fillStyle = '#d4a574'
    ctx.fillRect(0, 95, w, 4)
    ctx.fillStyle = '#c0956e'
    ctx.fillRect(0, 99, w, 2)
  }

  drawFloor(ctx, w, h) {
    const floorY = h * 0.35
    // 木地板
    const floorGradient = ctx.createLinearGradient(0, floorY, 0, h)
    floorGradient.addColorStop(0, '#deb887')
    floorGradient.addColorStop(1, '#c4956a')
    ctx.fillStyle = floorGradient
    ctx.fillRect(0, floorY, w, h - floorY)

    // 地板木纹
    ctx.strokeStyle = 'rgba(139, 90, 43, 0.12)'
    ctx.lineWidth = 1
    for (let y = floorY; y < h; y += 30) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(w, y)
      ctx.stroke()
    }
  }

  drawWallDecorations(ctx) {
    for (const deco of this.restaurant.decorations) {
      ctx.font = '28px serif'
      ctx.textAlign = 'center'
      ctx.fillText(deco.emoji, deco.x, deco.y)
    }

    // 餐厅招牌
    ctx.save()
    ctx.font = 'bold 22px "Comic Sans MS", cursive'
    ctx.textAlign = 'center'
    ctx.fillStyle = '#e74c3c'
    ctx.shadowColor = 'rgba(231, 76, 60, 0.3)'
    ctx.shadowBlur = 8
    ctx.fillText('🏠 欢乐餐厅 🏠', this.canvas.width / 2, 40)
    ctx.restore()

    // 营业中灯牌
    const pulse = Math.sin(Date.now() * 0.003) * 0.3 + 0.7
    ctx.save()
    ctx.globalAlpha = pulse
    ctx.font = '14px "Comic Sans MS", cursive'
    ctx.textAlign = 'center'
    ctx.fillStyle = '#27ae60'
    ctx.fillText('✨ 营业中 ✨', this.canvas.width / 2, 65)
    ctx.restore()
  }

  drawTables(ctx) {
    for (const seat of this.restaurant.seats) {
      // 桌子阴影
      ctx.beginPath()
      ctx.ellipse(seat.x, seat.y + 28, 38, 10, 0, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'
      ctx.fill()

      // 桌子
      ctx.beginPath()
      ctx.roundRect(seat.x - 35, seat.y - 8, 70, 35, 8)
      ctx.fillStyle = seat.tableColor
      ctx.fill()
      ctx.strokeStyle = 'rgba(0,0,0,0.15)'
      ctx.lineWidth = 1.5
      ctx.stroke()

      // 桌面高光
      ctx.beginPath()
      ctx.roundRect(seat.x - 30, seat.y - 5, 60, 12, 4)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)'
      ctx.fill()

      // 椅子（小圆凳）
      ctx.beginPath()
      ctx.arc(seat.x - 25, seat.y + 35, 12, 0, Math.PI * 2)
      ctx.fillStyle = '#8b4513'
      ctx.fill()
      ctx.beginPath()
      ctx.arc(seat.x + 25, seat.y + 35, 12, 0, Math.PI * 2)
      ctx.fillStyle = '#a0522d'
      ctx.fill()

      // 桌上装饰（花瓶）
      if (!seat.occupied) {
        ctx.font = '14px serif'
        ctx.textAlign = 'center'
        ctx.fillText('🌸', seat.x, seat.y + 2)
      }
    }
  }

  drawCustomers(ctx) {
    for (const customer of this.customers) {
      ctx.save()
      ctx.globalAlpha = customer.alpha
      const y = customer.y + customer.bounceOffset

      // 顾客主体（emoji）
      ctx.font = '36px serif'
      ctx.textAlign = 'center'
      ctx.fillText(customer.emoji, customer.x, y - 20)

      // 心情气泡
      ctx.font = '18px serif'
      ctx.fillText(customer.getMoodEmoji(), customer.x + 22, y - 40)

      // 状态指示
      this.drawCustomerStatus(ctx, customer, customer.x, y)

      ctx.restore()
    }
  }

  drawCustomerStatus(ctx, customer, x, y) {
    switch (customer.state) {
      case 'ordering':
        // 显示点餐气泡
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
        ctx.beginPath()
        ctx.roundRect(x - 30, y - 75, 60, 28, 10)
        ctx.fill()
        ctx.strokeStyle = '#e0e0e0'
        ctx.lineWidth = 1
        ctx.stroke()
        ctx.font = '12px "Comic Sans MS", cursive'
        ctx.textAlign = 'center'
        ctx.fillStyle = '#333'
        ctx.fillText(customer.dish?.emoji || '🍲', x - 10, y - 57)
        ctx.fillText(customer.dish?.name || '菜品', x + 15, y - 57)
        break

      case 'eating':
        // 进度条
        const progress = customer.getProgress()
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'
        ctx.fillRect(x - 25, y - 60, 50, 6)
        ctx.fillStyle = '#2ecc71'
        ctx.fillRect(x - 25, y - 60, 50 * progress, 6)
        // 食物emoji
        ctx.font = '16px serif'
        ctx.fillText(customer.dish?.emoji || '🍲', x, y - 5)
        break

      case 'paying':
        // 金币动画
        const coinBounce = Math.sin(Date.now() * 0.01) * 3
        ctx.font = '20px serif'
        ctx.fillText('💰', x, y - 55 + coinBounce)
        ctx.font = '11px "Comic Sans MS", cursive'
        ctx.fillStyle = '#f39c12'
        ctx.fillText(`+${customer.dish?.price || 10}`, x, y - 68 + coinBounce)
        break
    }
  }

  drawParticles(ctx) {
    for (const p of this.particles) {
      ctx.save()
      ctx.globalAlpha = p.alpha
      ctx.font = `${p.size}px "Comic Sans MS", cursive`
      ctx.textAlign = 'center'
      ctx.fillStyle = p.color
      ctx.fillText(p.text, p.x, p.y)
      ctx.restore()
    }
  }

  drawForeground(ctx, w, h) {
    // 底部柜台
    const counterY = h - 50
    const counterGradient = ctx.createLinearGradient(0, counterY, 0, h)
    counterGradient.addColorStop(0, '#5d4037')
    counterGradient.addColorStop(1, '#3e2723')
    ctx.fillStyle = counterGradient
    ctx.fillRect(0, counterY, w, 50)

    // 柜台高光
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)'
    ctx.fillRect(0, counterY, w, 3)

    // 柜台上的装饰
    ctx.font = '22px serif'
    ctx.textAlign = 'center'
    ctx.fillText('🧑‍🍳', 60, counterY + 30)
    ctx.fillText('📋', 120, counterY + 30)
    ctx.fillText('🔔', w - 60, counterY + 30)

    // 收银机
    ctx.fillText('💵', w - 120, counterY + 30)
  }
}

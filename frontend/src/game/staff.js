/**
 * 员工系统 - 服务员和收银员（带角色动画和移动）
 */
export class Staff {
  constructor(type, id) {
    this.id = id
    this.type = type
    this.level = 1
    this.proficiency = 0
    this.maxProficiency = 100
    this.name = this._randomName()
    this.emoji = type === 'waiter' ? '🧑‍🍳' : '💁'
    this.busy = false
    this.busyTimer = 0
    this.busyMaxTimer = 0
    this.targetCustomer = null
    this.actionCooldown = 0
    this.totalServed = 0

    // Animation state
    this.x = 0
    this.y = 0
    this.homeX = 0
    this.homeY = 0
    this.targetX = 0
    this.targetY = 0
    this.moving = false
    this.returning = false
    this.animPhase = Math.random() * Math.PI * 2
    this.walkFrame = 0
    this.actionAnim = 0
    this.sparkles = []
    this.showingAction = ''
    this.showActionTimer = 0
  }

  _randomName() {
    if (this.type === 'waiter') {
      const names = ['小张', '阿文', '小刘', '大毛', '小何', '阿强', '小周', '小吴']
      return names[Math.floor(Math.random() * names.length)]
    } else {
      const names = ['小芳', '阿玲', '小慧', '小敏', '阿秀', '小琴', '小燕', '小雪']
      return names[Math.floor(Math.random() * names.length)]
    }
  }

  setHomePosition(x, y) {
    this.homeX = x
    this.homeY = y
    this.x = x
    this.y = y
    this.targetX = x
    this.targetY = y
  }

  getEfficiency() {
    return 1 + (this.level - 1) * 0.3 + (this.proficiency / this.maxProficiency) * 0.2
  }

  getActionSpeed() {
    const base = this.type === 'waiter' ? 120 : 90
    return Math.floor(base / this.getEfficiency())
  }

  getSalary() {
    return Math.floor(10 * Math.pow(1.8, this.level - 1))
  }

  getUpgradeCost() {
    return Math.floor(50 * Math.pow(2, this.level - 1))
  }

  canUpgrade() {
    return this.level < 5
  }

  upgrade() {
    if (!this.canUpgrade()) return false
    this.level++
    this.proficiency = 0
    return true
  }

  addProficiency(amount = 1) {
    this.proficiency = Math.min(this.proficiency + amount, this.maxProficiency)
  }

  update(customers, engine) {
    this.animPhase += 0.06
    this.walkFrame++

    // Update sparkles
    this.sparkles = this.sparkles.filter(sp => {
      sp.life--
      sp.y -= 0.5
      sp.alpha = sp.life / sp.maxLife
      return sp.life > 0
    })

    if (this.showActionTimer > 0) this.showActionTimer--

    // Handle movement animation
    if (this.moving || this.returning) {
      const speed = 3.5
      const dx = this.targetX - this.x
      const dy = this.targetY - this.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < speed) {
        this.x = this.targetX
        this.y = this.targetY
        if (this.returning) {
          this.returning = false
          this.moving = false
        } else if (this.moving) {
          this.moving = false
          this.actionAnim = 30
        }
      } else {
        this.x += (dx / dist) * speed
        this.y += (dy / dist) * speed
      }
    }

    // Action animation countdown
    if (this.actionAnim > 0) {
      this.actionAnim--
    }

    if (this.actionCooldown > 0) {
      this.actionCooldown--
      return null
    }

    if (this.busy) {
      this.busyTimer--
      if (this.busyTimer <= 0) {
        this.busy = false
        const result = this._completeAction(engine)
        this.actionCooldown = Math.floor(30 / this.getEfficiency())
        this.addProficiency(1)
        this.totalServed++
        // Return home
        this.targetX = this.homeX
        this.targetY = this.homeY
        this.returning = true
        // Spawn action sparkles
        this._spawnSparkles()
        return result
      }
      return null
    }

    const target = this._findTarget(customers)
    if (target) {
      this.targetCustomer = target
      this.busy = true
      this.busyTimer = this.getActionSpeed()
      this.busyMaxTimer = this.busyTimer
      // Move towards customer
      this.targetX = target.x - 25
      this.targetY = target.y + 15
      this.moving = true
      // Mark customer as being served
      target._beingServedBy = this
      const actionLabel = this.type === 'waiter'
        ? (target.state === 'ready_to_serve' ? '上菜中' : '点单中')
        : '结账中'
      this.showingAction = actionLabel
      this.showActionTimer = this.busyTimer + 30
      return { type: 'started', staff: this, customer: target }
    }

    return null
  }

  _spawnSparkles() {
    for (let i = 0; i < 5; i++) {
      this.sparkles.push({
        x: this.x + (Math.random() - 0.5) * 20,
        y: this.y - 10 + (Math.random() - 0.5) * 10,
        life: 25 + Math.random() * 15,
        maxLife: 40,
        alpha: 1,
        size: 2 + Math.random() * 2
      })
    }
  }

  _findTarget(customers) {
    if (this.type === 'waiter') {
      let readyToServe = customers.filter(c => c.state === 'ready_to_serve' && !c._staffAssigned)
      if (readyToServe.length > 0) {
        const target = readyToServe.sort((a, b) => a.patience - b.patience)[0]
        target._staffAssigned = true
        return target
      }
      let waitingOrder = customers.filter(c => c.state === 'waiting_to_order' && !c._staffAssigned)
      if (waitingOrder.length > 0) {
        const target = waitingOrder.sort((a, b) => a.patience - b.patience)[0]
        target._staffAssigned = true
        return target
      }
    } else if (this.type === 'cashier') {
      let waitingPay = customers.filter(c => c.state === 'waiting_to_pay' && !c._staffAssigned)
      if (waitingPay.length > 0) {
        const target = waitingPay.sort((a, b) => a.patience - b.patience)[0]
        target._staffAssigned = true
        return target
      }
    }
    return null
  }

  _completeAction(engine) {
    if (!this.targetCustomer) return null
    const customer = this.targetCustomer
    this.targetCustomer = null
    customer._beingServedBy = null

    if (this.type === 'waiter') {
      if (customer.state === 'waiting_to_order') {
        customer.startOrder()
        customer.confirmOrder(customer.wantedDish)
        customer._staffAssigned = false
        return { type: 'order_taken', staff: this, customer }
      } else if (customer.state === 'ready_to_serve') {
        customer.serveDish()
        customer._staffAssigned = false
        return { type: 'dish_served', staff: this, customer }
      }
    } else if (this.type === 'cashier') {
      if (customer.state === 'waiting_to_pay') {
        const payment = customer.getPayment()
        customer.checkout()
        customer._staffAssigned = false
        return { type: 'checkout_done', staff: this, customer, payment }
      }
    }

    customer._staffAssigned = false
    return null
  }

  getDescription() {
    if (this.type === 'waiter') {
      return `接单上菜效率 +${Math.floor((this.getEfficiency() - 1) * 100)}%`
    } else {
      return `收银效率 +${Math.floor((this.getEfficiency() - 1) * 100)}%`
    }
  }
}

export const STAFF_CONFIG = {
  waiter: {
    name: '服务员',
    emoji: '🧑‍🍳',
    baseCost: 80,
    costMultiplier: 1.5,
    description: '自动接单和上菜，减少顾客等待时间'
  },
  cashier: {
    name: '收银员',
    emoji: '💁',
    baseCost: 100,
    costMultiplier: 1.5,
    description: '自动收银结账，提高结账效率'
  }
}

export function getHireCost(type, currentCount) {
  const config = STAFF_CONFIG[type]
  return Math.floor(config.baseCost * Math.pow(config.costMultiplier, currentCount))
}

Staff.fromSerialized = function(data) {
  const staff = new Staff(data.type, data.id)
  staff.level = data.level || 1
  staff.proficiency = data.proficiency || 0
  staff.name = data.name || staff.name
  staff.totalServed = data.totalServed || 0
  return staff
}

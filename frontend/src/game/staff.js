/**
 * 员工系统 - 服务员和收银员
 * 服务员: 自动接单和上菜，减少顾客等待时间
 * 收银员: 自动收银结账
 */
export class Staff {
  constructor(type, id) {
    this.id = id
    this.type = type // 'waiter' | 'cashier'
    this.level = 1
    this.proficiency = 0
    this.maxProficiency = 100
    this.name = this._randomName()
    this.emoji = type === 'waiter' ? '🧑‍🍳' : '💁'
    this.busy = false
    this.busyTimer = 0
    this.targetCustomer = null
    this.actionCooldown = 0
    this.totalServed = 0
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
        return result
      }
      return null
    }

    const target = this._findTarget(customers)
    if (target) {
      this.targetCustomer = target
      this.busy = true
      this.busyTimer = this.getActionSpeed()
      return { type: 'started', staff: this, customer: target }
    }

    return null
  }

  _findTarget(customers) {
    if (this.type === 'waiter') {
      // 服务员优先上菜，其次接单
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

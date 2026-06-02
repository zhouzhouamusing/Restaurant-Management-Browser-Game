/**
 * 顾客类 - 管理单个顾客的状态和动画
 * 交互流程: walking_in -> waiting_to_order -> [玩家点击接单] -> ordering -> [玩家选菜] ->
 *           cooking -> [烹饪完成] -> ready_to_serve -> [玩家点击上菜] -> eating ->
 *           waiting_to_pay -> [玩家点击结账] -> paying -> leaving
 */
export class Customer {
  constructor(id, seatIndex, tablePos) {
    this.id = id
    this.seatIndex = seatIndex
    this.state = 'walking_in'
    this.x = -60
    this.y = tablePos.y
    this.targetX = tablePos.x
    this.targetY = tablePos.y
    this.alpha = 1
    this.patience = 100
    this.patienceDecay = 0.015
    this.orderedDish = null
    this.cookProgress = 0
    this.cookDuration = 0
    this.eatProgress = 0
    this.eatDuration = 120
    this.tipMultiplier = 1
    this.emoji = this.randomEmoji()
    this.bubbleAnim = 0
    this.bouncePhase = Math.random() * Math.PI * 2
    this.highlighted = false
    this.clickable = false
    this.interactionHint = ''
  }

  randomEmoji() {
    const emojis = ['👦', '👧', '👨', '👩', '👴', '👵', '🧑', '👱', '👲', '🧔']
    return emojis[Math.floor(Math.random() * emojis.length)]
  }

  getMoodEmoji() {
    if (this.patience > 70) return '😊'
    if (this.patience > 40) return '😐'
    if (this.patience > 20) return '😤'
    return '😡'
  }

  getStateLabel() {
    switch (this.state) {
      case 'walking_in': return ''
      case 'waiting_to_order': return '想点餐'
      case 'ordering': return '点餐中...'
      case 'cooking': return '等待中...'
      case 'ready_to_serve': return '请上菜!'
      case 'eating': return '用餐中'
      case 'waiting_to_pay': return '要结账'
      case 'paying': return '谢谢!'
      case 'leaving': return ''
      default: return ''
    }
  }

  update() {
    this.bubbleAnim += 0.05
    this.bouncePhase += 0.03

    switch (this.state) {
      case 'walking_in':
        this.x += (this.targetX - this.x) * 0.06
        this.y += (this.targetY - this.y) * 0.06
        if (Math.abs(this.x - this.targetX) < 3) {
          this.state = 'waiting_to_order'
          this.clickable = true
          this.interactionHint = '点击接单'
        }
        break

      case 'waiting_to_order':
        this.patience -= this.patienceDecay
        this.clickable = true
        break

      case 'ordering':
        this.clickable = false
        break

      case 'cooking':
        this.patience -= this.patienceDecay * 0.5
        this.cookProgress++
        if (this.cookProgress >= this.cookDuration) {
          this.state = 'ready_to_serve'
          this.clickable = true
          this.interactionHint = '点击上菜'
        }
        break

      case 'ready_to_serve':
        this.patience -= this.patienceDecay * 0.8
        this.clickable = true
        break

      case 'eating':
        this.eatProgress++
        this.clickable = false
        if (this.eatProgress >= this.eatDuration) {
          this.state = 'waiting_to_pay'
          this.clickable = true
          this.interactionHint = '点击结账'
        }
        break

      case 'waiting_to_pay':
        this.clickable = true
        break

      case 'paying':
        this.clickable = false
        this.alpha -= 0.015
        if (this.alpha <= 0.7) {
          this.state = 'leaving'
        }
        break

      case 'leaving':
        this.x += 5
        this.alpha -= 0.025
        break
    }

    if (this.patience <= 0 && this.state !== 'leaving' && this.state !== 'paying') {
      this.state = 'leaving'
      this.tipMultiplier = 0
    }
  }

  startOrder() {
    this.state = 'ordering'
    this.clickable = false
    this.interactionHint = ''
  }

  confirmOrder(dish) {
    this.orderedDish = dish
    this.cookDuration = dish.cookTime * 30
    this.cookProgress = 0
    this.state = 'cooking'
    this.clickable = false
  }

  serveDish() {
    this.state = 'eating'
    this.eatProgress = 0
    this.clickable = false
    this.interactionHint = ''
  }

  checkout() {
    this.state = 'paying'
    this.clickable = false
    this.interactionHint = ''
    this.tipMultiplier = this.patience > 70 ? 1.5 : this.patience > 40 ? 1.2 : 1
  }

  getPayment() {
    if (!this.orderedDish) return 0
    return Math.floor(this.orderedDish.price * this.tipMultiplier)
  }

  isDone() {
    return this.state === 'leaving' && this.alpha <= 0
  }

  getBounds() {
    return {
      x: this.x - 30,
      y: this.y - 55,
      width: 60,
      height: 70
    }
  }

  containsPoint(px, py) {
    const b = this.getBounds()
    return px >= b.x && px <= b.x + b.width && py >= b.y && py <= b.y + b.height
  }
}

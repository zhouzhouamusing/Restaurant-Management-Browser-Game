/**
 * 顾客类 - 顾客自主点菜、评价系统、对话气泡
 */
import { getRandomBodyColor } from './character-renderer.js'
import { calculateDishPayment } from './bonus-calculator.js'
import { isDishAvailableInSeason, COMBO_TEMPLATES, DISH_CATALOG } from './dishes.js'

export class Customer {
  constructor(id, seatIndex, tablePos, availableDishes, bonuses = {}, extras = {}) {
    this.id = id
    this.seatIndex = seatIndex
    this.state = 'walking_in'
    this.x = -60
    this.y = tablePos.y
    this.targetX = tablePos.x
    this.targetY = tablePos.y
    this.alpha = 1
    this.patience = 100
    this.patienceDecay = 0.012 * (1 - Math.min(bonuses.patienceBonus || 0, 0.50))
    this.tipBonusFromDecor = bonuses.tipBonus || 0
    this.orderedDish = null
    this.cookProgress = 0
    this.cookDuration = 0
    this.eatProgress = 0
    this.eatDuration = 150
    this.tipMultiplier = 1
    this.emoji = this.randomEmoji()
    this.name = this.randomName()
    this.bodyColor = getRandomBodyColor()
    this.bubbleAnim = 0
    this.bouncePhase = Math.random() * Math.PI * 2
    this.highlighted = false
    this.clickable = false
    this.interactionHint = ''
    this.dialogue = ''
    this.dialogueTimer = 0
    this.dialogueMaxTime = 180
    this.evaluation = ''
    this.evaluationMood = 'happy'
    this.stateEnterTime = 0
    this.totalWaitFrames = 0
    this.availableDishes = availableDishes || []
    this.paid = false
    this.billAmount = 0
    this.entryTime = Date.now()
    this.serveWaitStart = 0
    this.payWaitStart = 0

    this.currentSeason = extras.currentSeason || 'spring'
    this.qualityMap = extras.qualityMap || {}
    this.combos = extras.combos || []
    this.restaurantLevel = extras.restaurantLevel || 1

    this.isComboOrder = false
    this.comboMultiplier = 1
    this.orderedCombo = null
    this.comboDishes = []

    const seasonalDishes = availableDishes.filter(d => isDishAvailableInSeason(d, this.currentSeason))
    const pickFrom = seasonalDishes.length > 0 ? seasonalDishes : availableDishes
    this._maybePickCombo(pickFrom)
    if (!this.isComboOrder) {
      this.wantedDish = this._pickDish(pickFrom)
    }
  }

  randomEmoji() {
    const emojis = ['👦', '👧', '👨', '👩', '👴', '👵', '🧑', '👱', '👲', '🧔', '👸', '🤴', '🧒', '👩‍🦰', '👨‍🦱']
    return emojis[Math.floor(Math.random() * emojis.length)]
  }

  randomName() {
    const names = ['小明', '小红', '阿花', '大壮', '小美', '老王', '小李', '阿姨', '叔叔', '奶奶', '帅哥', '美女', '小朋友', '大哥', '姐姐']
    return names[Math.floor(Math.random() * names.length)]
  }

  _pickDish(dishes) {
    if (!dishes || dishes.length === 0) return null
    return dishes[Math.floor(Math.random() * dishes.length)]
  }

  _maybePickCombo(availableDishes) {
    if (!this.combos || this.combos.length === 0) return
    const comboChance = Math.min(0.25, 0.05 + this.restaurantLevel * 0.03)
    if (Math.random() > comboChance) return

    const validCombos = this.combos.filter(combo => {
      const template = COMBO_TEMPLATES.find(t => t.id === combo.templateId)
      if (!template) return false
      return combo.dishIds.every(id => {
        const dish = DISH_CATALOG[id]
        return dish && availableDishes.some(d => d.id === id) && isDishAvailableInSeason(dish, this.currentSeason)
      })
    })

    if (validCombos.length === 0) return

    const chosen = validCombos[Math.floor(Math.random() * validCombos.length)]
    const template = COMBO_TEMPLATES.find(t => t.id === chosen.templateId)
    this.isComboOrder = true
    this.orderedCombo = chosen
    this.comboMultiplier = template.bonusMultiplier
    this.comboDishes = chosen.dishIds.map(id => DISH_CATALOG[id])
    this.wantedDish = this.comboDishes[0]
  }

  getMoodEmoji() {
    if (this.patience > 70) return '😊'
    if (this.patience > 50) return '😐'
    if (this.patience > 30) return '😤'
    if (this.patience > 15) return '😠'
    return '😡'
  }

  getDialogue() {
    if (this.dialogue && this.dialogueTimer > 0) {
      return this.dialogue
    }
    return ''
  }

  _setDialogue(text, duration = 180) {
    this.dialogue = text
    this.dialogueTimer = duration
    this.dialogueMaxTime = duration
  }

  _generateOrderDialogue() {
    if (this.isComboOrder && this.orderedCombo) {
      const names = this.comboDishes.map(d => d.name).join('+')
      const templates = [
        `来个${this.orderedCombo.name || '套餐'}！(${names})`,
        `我要套餐！${this.comboDishes.map(d => d.emoji).join('')}`,
        `套餐看起来很划算~给我来一份！`
      ]
      return templates[Math.floor(Math.random() * templates.length)]
    }
    const dish = this.wantedDish
    if (!dish) return '我想吃点东西~'
    const templates = [
      `我想要一份${dish.name}！`,
      `来份${dish.name}吧~`,
      `${dish.emoji} 给我来个${dish.name}！`,
      `今天想吃${dish.name}~`,
      `听说这里${dish.name}很好吃！`,
      `老板，来份${dish.name}！`
    ]
    return templates[Math.floor(Math.random() * templates.length)]
  }

  _generateWaitDialogue() {
    if (this.patience > 70) {
      const happy = ['好期待呀~', '应该快好了吧', '闻起来好香~', '✨ 等待美食中...']
      return happy[Math.floor(Math.random() * happy.length)]
    } else if (this.patience > 40) {
      const mid = ['有点久了...', '还要多久呀？', '我饿了...', '快点嘛~']
      return mid[Math.floor(Math.random() * mid.length)]
    } else {
      const angry = ['太慢了吧！', '我等不了了！', '差评！', '还要等多久？！']
      return angry[Math.floor(Math.random() * angry.length)]
    }
  }

  _generateServeEvaluation() {
    if (this.patience > 70) {
      this.evaluationMood = 'happy'
      const evals = ['上菜好快！太棒了！', '速度很快，满意~', '效率真高！👍', '完美的服务！']
      return evals[Math.floor(Math.random() * evals.length)]
    } else if (this.patience > 40) {
      this.evaluationMood = 'neutral'
      const evals = ['速度还行吧', '等了一会儿', '还算及时~', '一般般']
      return evals[Math.floor(Math.random() * evals.length)]
    } else {
      this.evaluationMood = 'angry'
      const evals = ['等太久了差评！', '我都快饿死了！', '服务太慢了！', '下次不来了！']
      return evals[Math.floor(Math.random() * evals.length)]
    }
  }

  _generatePayEvaluation() {
    if (this.patience > 70) {
      this.evaluationMood = 'happy'
      const evals = ['结账很快！很满意！', '服务真好~还会再来！', '体验很棒！五星好评！', '下次还来！😄']
      return evals[Math.floor(Math.random() * evals.length)]
    } else if (this.patience > 40) {
      this.evaluationMood = 'neutral'
      const evals = ['总体还行~', '体验一般', '等了好久才结账', '还可以吧']
      return evals[Math.floor(Math.random() * evals.length)]
    } else {
      this.evaluationMood = 'angry'
      const evals = ['再也不来了！', '太差了！差评！', '浪费我时间！', '结账都这么慢！']
      return evals[Math.floor(Math.random() * evals.length)]
    }
  }

  _generateEatingDialogue() {
    const dish = this.orderedDish
    if (!dish) return '好吃~'
    const templates = [
      `${dish.name}真好吃！`,
      `嗯~味道不错！`,
      `好吃好吃！😋`,
      `${dish.emoji} 太美味了！`,
      `幸福~🥰`
    ]
    return templates[Math.floor(Math.random() * templates.length)]
  }

  getStateLabel() {
    switch (this.state) {
      case 'walking_in': return ''
      case 'waiting_to_order':
        if (this.isComboOrder) return `想点: 🍱 套餐`
        return `想点: ${this.wantedDish?.emoji || '🍽️'} ${this.wantedDish?.name || '菜品'}`
      case 'ordering': return '点餐中...'
      case 'cooking':
        if (this.isComboOrder) return `制作套餐中 🍱`
        return `制作中 ${this.orderedDish?.emoji || '🍲'}`
      case 'ready_to_serve':
        if (this.isComboOrder) return `🍱 套餐好了！`
        return `${this.orderedDish?.emoji || '🍲'} 好了！`
      case 'eating': return '用餐中~'
      case 'waiting_to_pay': return '💰 要结账'
      case 'paying': return '谢谢光临！'
      case 'leaving': return ''
      default: return ''
    }
  }

  update() {
    this.bubbleAnim += 0.05
    this.bouncePhase += 0.03

    if (this.dialogueTimer > 0) {
      this.dialogueTimer--
    }

    switch (this.state) {
      case 'walking_in':
        this.x += (this.targetX - this.x) * 0.055
        this.y += (this.targetY - this.y) * 0.055
        if (Math.abs(this.x - this.targetX) < 3) {
          this.state = 'waiting_to_order'
          this.clickable = true
          this.interactionHint = '点击接单'
          this._setDialogue(this._generateOrderDialogue(), 240)
        }
        break

      case 'waiting_to_order':
        this.patience -= this.patienceDecay
        this.totalWaitFrames++
        this.clickable = true
        if (this.totalWaitFrames % 200 === 0 && this.dialogueTimer <= 0) {
          this._setDialogue(this._generateWaitDialogue(), 150)
        }
        break

      case 'ordering':
        this.clickable = false
        break

      case 'cooking':
        this.patience -= this.patienceDecay * 0.4
        this.totalWaitFrames++
        this.cookProgress++
        if (this.cookProgress >= this.cookDuration) {
          this.state = 'ready_to_serve'
          this.clickable = true
          this.interactionHint = '点击上菜'
          this.serveWaitStart = Date.now()
          this._setDialogue(`${this.orderedDish?.emoji || '🍲'} 好了吗？快上菜！`, 200)
        }
        if (this.totalWaitFrames % 250 === 0 && this.dialogueTimer <= 0) {
          this._setDialogue(this._generateWaitDialogue(), 120)
        }
        break

      case 'ready_to_serve':
        this.patience -= this.patienceDecay * 0.7
        this.totalWaitFrames++
        this.clickable = true
        if (this.totalWaitFrames % 180 === 0 && this.dialogueTimer <= 0) {
          this._setDialogue(this._generateWaitDialogue(), 120)
        }
        break

      case 'eating':
        this.eatProgress++
        this.clickable = false
        if (this.eatProgress === 1) {
          this._setDialogue(this._generateEatingDialogue(), 120)
        }
        if (this.eatProgress >= this.eatDuration) {
          this.state = 'waiting_to_pay'
          this.clickable = true
          this.interactionHint = '点击结账'
          this.payWaitStart = Date.now()
          this._setDialogue('吃饱了~ 结账吧！', 180)
        }
        break

      case 'waiting_to_pay':
        this.patience -= this.patienceDecay * 0.5
        this.totalWaitFrames++
        this.clickable = true
        if (this.totalWaitFrames % 200 === 0 && this.dialogueTimer <= 0) {
          const payDialogues = ['快点结账嘛~', '等结账中...', '掏钱准备走了', '该结账了吧']
          this._setDialogue(payDialogues[Math.floor(Math.random() * payDialogues.length)], 120)
        }
        break

      case 'paying':
        this.clickable = false
        this.alpha -= 0.012
        if (this.alpha <= 0.6) {
          this.state = 'leaving'
        }
        break

      case 'leaving':
        this.x += 4.5
        this.alpha -= 0.02
        break
    }

    if (this.patience <= 0 && this.state !== 'leaving' && this.state !== 'paying' && this.state !== 'eating') {
      this._setDialogue('太慢了！我走了！😡', 120)
      this.state = 'leaving'
      this.tipMultiplier = 0
      this.evaluationMood = 'angry'
      this.evaluation = '服务太差了！'
    }
  }

  startOrder() {
    this.state = 'ordering'
    this.clickable = false
    this.interactionHint = ''
  }

  confirmOrder(dish) {
    this.orderedDish = dish || this.wantedDish
    if (this.isComboOrder) {
      const maxCook = Math.max(...this.comboDishes.map(d => d.cookTime))
      this.cookDuration = maxCook * 30
    } else {
      this.cookDuration = (dish || this.wantedDish).cookTime * 30
    }
    this.cookProgress = 0
    this.state = 'cooking'
    this.clickable = false
    this._setDialogue(`好的！等着${(dish || this.wantedDish).name}~`, 120)
  }

  serveDish() {
    this.evaluation = this._generateServeEvaluation()
    this._setDialogue(this.evaluation, 150)
    this.state = 'eating'
    this.eatProgress = 0
    this.clickable = false
    this.interactionHint = ''
  }

  checkout() {
    this.evaluation = this._generatePayEvaluation()
    this._setDialogue(this.evaluation, 180)
    this.state = 'paying'
    this.clickable = false
    this.interactionHint = ''
    this.tipMultiplier = this.patience > 70 ? 1.5 : this.patience > 40 ? 1.2 : 1
    this.paid = true
    this.billAmount = this.getPayment()
  }

  getPayment() {
    if (!this.orderedDish) return 0
    if (this.isComboOrder) {
      let total = 0
      for (const dish of this.comboDishes) {
        const quality = this.qualityMap[dish.id] || dish.baseQuality || 50
        total += calculateDishPayment(dish, this.patience, this.tipBonusFromDecor, quality, this.currentSeason, this.comboMultiplier)
      }
      return total
    }
    const quality = this.qualityMap[this.orderedDish.id] || this.orderedDish.baseQuality || 50
    return calculateDishPayment(this.orderedDish, this.patience, this.tipBonusFromDecor, quality, this.currentSeason, 1)
  }

  isDone() {
    return this.state === 'leaving' && this.alpha <= 0
  }

  getCurrentDecayRate() {
    switch (this.state) {
      case 'cooking': return this.patienceDecay * 0.4
      case 'ready_to_serve': return this.patienceDecay * 0.7
      case 'waiting_to_pay': return this.patienceDecay * 0.5
      default: return this.patienceDecay
    }
  }

  getRemainingSeconds() {
    const rate = this.getCurrentDecayRate()
    if (rate <= 0) return 999
    return Math.ceil(this.patience / rate / 60)
  }

  getBounds() {
    return {
      x: this.x - 20,
      y: this.y - 20,
      width: 40,
      height: 50
    }
  }

  containsPoint(px, py) {
    const b = this.getBounds()
    return px >= b.x && px <= b.x + b.width && py >= b.y && py <= b.y + b.height
  }
}

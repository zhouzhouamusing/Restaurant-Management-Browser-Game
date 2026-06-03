/**
 * 顾客类 - 顾客自主点菜、评价系统、对话气泡
 */
import { getRandomBodyColor } from './character-renderer.js'
import { calculateDishPayment, calculateCustomerReview } from './bonus-calculator.js'
import { isDishAvailableInSeason, isDishSeasonal, COMBO_TEMPLATES, DISH_CATALOG, RARITY_CONFIG, SEASON_CONFIG } from './dishes.js'

const SEASON_PREFERENCE_DIALOGUES = {
  spring: ['春天就该吃点清爽的~', '春暖花开，心情好！', '春季限定不能错过！'],
  summer: ['太热了，来点凉的！', '夏天就要吃冰冰凉凉的~', '这天气必须来杯冷饮！'],
  autumn: ['秋天贴膘！来点硬菜', '秋高气爽适合大吃一顿', '秋天的味道真好~'],
  winter: ['冬天就要吃热乎的！', '来份暖胃的吧~', '天冷了吃点驱寒的！']
}

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

    this.reviewResult = null
    this.seasonalPreference = Math.random() < 0.8

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

    if (this.seasonalPreference) {
      const seasonal = dishes.filter(d => isDishSeasonal(d) && d.seasons.includes(this.currentSeason))
      if (seasonal.length > 0 && Math.random() < 0.75) {
        const rareSeasonal = seasonal.filter(d => {
          const cat = DISH_CATALOG[d.id]
          return cat && (cat.rarity === 'rare' || cat.rarity === 'epic' || cat.rarity === 'legendary')
        })
        if (rareSeasonal.length > 0 && Math.random() < 0.4) {
          return rareSeasonal[Math.floor(Math.random() * rareSeasonal.length)]
        }
        return seasonal[Math.floor(Math.random() * seasonal.length)]
      }
    }

    const withRarity = dishes.map(d => {
      const cat = DISH_CATALOG[d.id]
      const rarity = cat ? (RARITY_CONFIG[cat.rarity] || RARITY_CONFIG.common) : RARITY_CONFIG.common
      return { dish: d, weight: rarity.revenueMultiplier }
    })
    const totalWeight = withRarity.reduce((sum, w) => sum + w.weight, 0)
    let roll = Math.random() * totalWeight
    for (const item of withRarity) {
      roll -= item.weight
      if (roll <= 0) return item.dish
    }
    return dishes[Math.floor(Math.random() * dishes.length)]
  }

  _maybePickCombo(availableDishes) {
    if (!this.combos || this.combos.length === 0) return
    const comboChance = Math.min(0.35, 0.08 + this.restaurantLevel * 0.04)
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

    if (this.seasonalPreference && isDishSeasonal(dish)) {
      const seasonDialogues = SEASON_PREFERENCE_DIALOGUES[this.currentSeason]
      if (seasonDialogues && Math.random() < 0.5) {
        return seasonDialogues[Math.floor(Math.random() * seasonDialogues.length)]
      }
    }

    const catalogDish = DISH_CATALOG[dish.id]
    if (catalogDish && catalogDish.rarity && catalogDish.rarity !== 'common') {
      const rarityInfo = RARITY_CONFIG[catalogDish.rarity]
      if (Math.random() < 0.4) {
        const rareTemplates = [
          `听说${dish.name}很难得！必须试试！`,
          `${rarityInfo.emoji} 我专门来吃${dish.name}的！`,
          `${dish.name}是${rarityInfo.name}菜品吧？期待！`
        ]
        return rareTemplates[Math.floor(Math.random() * rareTemplates.length)]
      }
    }

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
    const quality = this.qualityMap[this.orderedDish?.id] || this.orderedDish?.baseQuality || 50
    const review = calculateCustomerReview(quality, this.patience)
    this.reviewResult = review

    if (review.isPositive) {
      this.evaluationMood = 'happy'
      const evals = ['品质超棒！五星好评！⭐', '食材新鲜，味道一流！', '太满意了！👍', '完美的味道！还会再来！']
      return evals[Math.floor(Math.random() * evals.length)]
    } else if (this.patience > 40) {
      this.evaluationMood = 'neutral'
      const evals = ['味道还行吧...', '普普通通', '食材品质一般', '还可以更好']
      return evals[Math.floor(Math.random() * evals.length)]
    } else {
      this.evaluationMood = 'angry'
      const evals = ['食材不新鲜差评！', '品质太差了！', '这品质对不起这价格！', '下次不来了！']
      return evals[Math.floor(Math.random() * evals.length)]
    }
  }

  _generatePayEvaluation() {
    if (this.reviewResult && this.reviewResult.isPositive) {
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

    const catalogDish = DISH_CATALOG[dish.id]
    if (catalogDish && catalogDish.rarity && catalogDish.rarity !== 'common' && Math.random() < 0.35) {
      const rarityInfo = RARITY_CONFIG[catalogDish.rarity]
      const rareEating = [
        `不愧是${rarityInfo.name}菜品！绝了！`,
        `${rarityInfo.emoji} 果然名不虚传！`,
        `这个品质值得多付钱！`
      ]
      return rareEating[Math.floor(Math.random() * rareEating.length)]
    }

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

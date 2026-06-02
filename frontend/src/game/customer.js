/**
 * 顾客类 - 管理单个顾客的状态和动画
 * 状态流转: walking_in -> waiting -> ordering -> eating -> paying -> leaving
 */
export class Customer {
  constructor(id, seatIndex, dish) {
    this.id = id
    this.seatIndex = seatIndex
    this.dish = dish
    this.state = 'walking_in' // walking_in, waiting, ordering, eating, paying, leaving
    this.x = -60
    this.y = 0
    this.targetX = 0
    this.targetY = 0
    this.alpha = 1
    this.timer = 0
    this.maxTimer = 0
    this.emoji = this.randomEmoji()
    this.mood = 'happy' // happy, waiting, eating, satisfied
    this.bounceOffset = 0
    this.bounceSpeed = Math.random() * 0.02 + 0.02
  }

  randomEmoji() {
    const emojis = ['👦', '👧', '👨', '👩', '👴', '👵', '🧑', '👱']
    return emojis[Math.floor(Math.random() * emojis.length)]
  }

  getMoodEmoji() {
    switch (this.mood) {
      case 'happy': return '😊'
      case 'waiting': return '🤔'
      case 'eating': return '😋'
      case 'satisfied': return '🤩'
      default: return '😊'
    }
  }

  update(deltaTime) {
    this.bounceOffset = Math.sin(Date.now() * this.bounceSpeed) * 3

    switch (this.state) {
      case 'walking_in':
        this.x += (this.targetX - this.x) * 0.05
        this.y += (this.targetY - this.y) * 0.05
        if (Math.abs(this.x - this.targetX) < 2) {
          this.state = 'waiting'
          this.mood = 'waiting'
          this.timer = 0
          this.maxTimer = 60 // 等待点餐
        }
        break

      case 'waiting':
        this.timer++
        if (this.timer >= this.maxTimer) {
          this.state = 'ordering'
          this.timer = 0
          this.maxTimer = 40
        }
        break

      case 'ordering':
        this.timer++
        if (this.timer >= this.maxTimer) {
          this.state = 'eating'
          this.mood = 'eating'
          this.timer = 0
          this.maxTimer = (this.dish?.cookTime || 3) * 40
        }
        break

      case 'eating':
        this.timer++
        if (this.timer >= this.maxTimer) {
          this.state = 'paying'
          this.mood = 'satisfied'
          this.timer = 0
          this.maxTimer = 30
        }
        break

      case 'paying':
        this.timer++
        if (this.timer >= this.maxTimer) {
          this.state = 'leaving'
        }
        break

      case 'leaving':
        this.x += 4
        this.alpha -= 0.02
        break
    }
  }

  isDone() {
    return this.state === 'leaving' && this.alpha <= 0
  }

  getProgress() {
    if (this.maxTimer === 0) return 0
    return this.timer / this.maxTimer
  }
}

/**
 * 餐厅场景管理 - 管理座位、装饰和餐厅布局
 */
export class Restaurant {
  constructor(width, height) {
    this.width = width
    this.height = height
    this.seats = this.initSeats()
    this.decorations = this.initDecorations()
    this.time = 0
  }

  initSeats() {
    const seats = []
    const startX = 120
    const startY = 200
    const cols = 3
    const rows = 2
    const gapX = 200
    const gapY = 160

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        seats.push({
          x: startX + c * gapX,
          y: startY + r * gapY,
          occupied: false,
          tableColor: `hsl(${(r * cols + c) * 45 + 20}, 60%, 45%)`
        })
      }
    }
    return seats
  }

  initDecorations() {
    return [
      { type: 'plant', x: 30, y: 150, emoji: '🌿' },
      { type: 'plant', x: 30, y: 350, emoji: '🌱' },
      { type: 'clock', x: 350, y: 40, emoji: '🕐' },
      { type: 'picture', x: 180, y: 50, emoji: '🖼️' },
      { type: 'lamp', x: 520, y: 30, emoji: '💡' },
    ]
  }

  getFreeSeat() {
    const freeSeat = this.seats.findIndex(s => !s.occupied)
    if (freeSeat !== -1) {
      this.seats[freeSeat].occupied = true
    }
    return freeSeat
  }

  releaseSeat(index) {
    if (index >= 0 && index < this.seats.length) {
      this.seats[index].occupied = false
    }
  }

  update() {
    this.time++
  }
}

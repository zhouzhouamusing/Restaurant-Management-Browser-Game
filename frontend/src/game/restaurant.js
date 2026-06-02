/**
 * 餐厅场景管理 - 管理座位、装饰和餐厅布局
 */
export class Restaurant {
  constructor(width, height) {
    this.width = width
    this.height = height
    this.maxSeats = 4
    this.seats = this.generateSeats(this.maxSeats)
    this.decorations = this.initDecorations()
  }

  generateSeats(count) {
    const seats = []
    const positions = [
      { x: 150, y: 220 },
      { x: 380, y: 220 },
      { x: 150, y: 370 },
      { x: 380, y: 370 },
      { x: 600, y: 220 },
      { x: 600, y: 370 },
      { x: 265, y: 295 },
      { x: 490, y: 295 },
    ]
    for (let i = 0; i < count && i < positions.length; i++) {
      seats.push({
        x: positions[i].x,
        y: positions[i].y,
        occupied: false,
        tableStyle: i % 3
      })
    }
    return seats
  }

  addSeat() {
    if (this.maxSeats >= 8) return false
    this.maxSeats++
    this.seats = this.generateSeats(this.maxSeats)
    return true
  }

  initDecorations() {
    return [
      { emoji: '🌿', x: 25, y: 180, size: 26 },
      { emoji: '🌱', x: 25, y: 380, size: 22 },
      { emoji: '🖼️', x: 200, y: 60, size: 30 },
      { emoji: '🕐', x: 400, y: 55, size: 28 },
      { emoji: '💡', x: 300, y: 35, size: 22 },
      { emoji: '💡', x: 500, y: 35, size: 22 },
    ]
  }

  getFreeSeat() {
    const idx = this.seats.findIndex(s => !s.occupied)
    if (idx !== -1) this.seats[idx].occupied = true
    return idx
  }

  releaseSeat(index) {
    if (index >= 0 && index < this.seats.length) {
      this.seats[index].occupied = false
    }
  }

  getSeatPosition(index) {
    if (index >= 0 && index < this.seats.length) {
      return { x: this.seats[index].x, y: this.seats[index].y }
    }
    return { x: 200, y: 250 }
  }
}

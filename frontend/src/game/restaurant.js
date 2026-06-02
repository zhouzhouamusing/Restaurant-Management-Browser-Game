/**
 * 餐厅场景管理 - 管理座位、装饰和餐厅布局
 */

const DEFAULT_POSITIONS = [
  { x: 0.20, y: 0.45 },
  { x: 0.50, y: 0.45 },
  { x: 0.20, y: 0.70 },
  { x: 0.50, y: 0.70 },
  { x: 0.78, y: 0.45 },
  { x: 0.78, y: 0.70 },
  { x: 0.35, y: 0.57 },
  { x: 0.64, y: 0.57 },
]

export class Restaurant {
  constructor(width, height) {
    this.width = width
    this.height = height
    this.maxSeats = 4
    this.seats = this.generateSeats(this.maxSeats, null, width, height)
  }

  generateSeats(count, customPositions, canvasW, canvasH) {
    const seats = []
    const w = canvasW || this.width
    const h = canvasH || this.height

    for (let i = 0; i < count && i < DEFAULT_POSITIONS.length; i++) {
      let px, py
      if (customPositions && customPositions[i]) {
        px = customPositions[i].x * w
        py = customPositions[i].y * h
      } else {
        px = DEFAULT_POSITIONS[i].x * w
        py = DEFAULT_POSITIONS[i].y * h
      }
      seats.push({
        x: px,
        y: py,
        occupied: false,
        tableStyle: i % 3
      })
    }
    return seats
  }

  addSeat(customPositions, canvasW, canvasH) {
    if (this.maxSeats >= 8) return false
    this.maxSeats++
    this.seats = this.generateSeats(this.maxSeats, customPositions, canvasW, canvasH)
    return true
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

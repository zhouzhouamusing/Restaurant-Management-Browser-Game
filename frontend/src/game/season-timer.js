import { SEASON_CONFIG, SEASONAL_EVENTS, getCurrentSeason, getSeasonProgress, getSeasonTimeRemaining } from './dishes.js'

export class SeasonTimer {
  constructor(epochStart) {
    this.epochStart = epochStart || Date.now()
  }

  getCurrentSeason() {
    return getCurrentSeason(this.epochStart)
  }

  getProgress() {
    return getSeasonProgress(this.epochStart)
  }

  getTimeRemainingMs() {
    return getSeasonTimeRemaining(this.epochStart)
  }

  getTimeRemainingFormatted() {
    const ms = this.getTimeRemainingMs()
    const totalSec = Math.floor(ms / 1000)
    const h = Math.floor(totalSec / 3600)
    const m = Math.floor((totalSec % 3600) / 60)
    const s = totalSec % 60
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    return `${m}:${String(s).padStart(2, '0')}`
  }

  getSeasonName() {
    return SEASON_CONFIG.names[this.getCurrentSeason()]
  }

  getSeasonEmoji() {
    return SEASON_CONFIG.emojis[this.getCurrentSeason()]
  }

  getSeasonColor() {
    return SEASON_CONFIG.colors[this.getCurrentSeason()]
  }

  isEventActive() {
    const progress = this.getProgress()
    const season = this.getCurrentSeason()
    const event = SEASONAL_EVENTS[season]
    return event && progress >= event.startProgress && progress <= event.endProgress
  }

  getActiveEvent() {
    if (!this.isEventActive()) return null
    return SEASONAL_EVENTS[this.getCurrentSeason()]
  }

  getEventProgress() {
    const event = this.getActiveEvent()
    if (!event) return 0
    const progress = this.getProgress()
    return (progress - event.startProgress) / (event.endProgress - event.startProgress)
  }

  serialize() {
    return this.epochStart
  }

  static fromSerialized(data) {
    return new SeasonTimer(data)
  }
}

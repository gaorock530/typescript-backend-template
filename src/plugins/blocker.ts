const MAX_BLOCK_PERIOD = 1000 * 60 * 10 // 10 minute
const MIN_BLOCK_PERIOD = 1000 // ms
const CLEAN_UP_INTERVAL = 1000 * 10 // 10 seconds

/**
 * @method (Singleton)
 */
class Blocker {
  static _instance: Blocker
  list: Record<string, { t: number, p: number }>
  interval: any

  constructor() {
    this.list = {}
    this.interval = null
    if (!Blocker._instance) Blocker._instance = this
    return Blocker._instance
  }

  // checking a unique client with 'key' in the list,
  // if list has the same key, will reset 'p'(blocking period) to MIN_BLOCK_PERIOD
  // or double 'p' until it reaches MAX_BLOCK_PERIOD
  // otherwise make a record of this 'key'
  check(key: string) {
    if (this.list[key]) {
      const { t, p } = this.list[key]
      if (Date.now() - t < p) {
        this.list[key] = {
          t: Date.now(),
          p: Math.min(this.list[key].p * 2, MAX_BLOCK_PERIOD)
        }
        return false
      }
    }

    this.list[key] = {
      t: Date.now(),
      p: MIN_BLOCK_PERIOD
    }
    this.start()
    return true
  }


  cleanup() {
    const now = Date.now()
    for (const key in this.list) {
      const { t, p } = this.list[key]
      if (now - t >= p) {
        delete this.list[key]
      }
    }
    if (Object.keys(this.list).length === 0) this.stop()
  }

  stop() {
    if (this.interval) clearInterval(this.interval)
    this.interval = null
  }

  start() {
    this.stop()
    this.interval = setInterval(() => this.cleanup(), CLEAN_UP_INTERVAL)
  }

  timeToWait(fp: string) {
    return this.list[fp] ? JSON.stringify(this.list[fp]) : ''
  }

  get status() {
    return this.list
  }

}

export default new Blocker()
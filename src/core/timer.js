// Timer (TDD 5.7). Digerakkan oleh update(dt) sehingga otomatis berhenti
// ketika game di-pause (update tidak dipanggil).

export class Timer {
  /** @param {{duration?:number|null, onComplete?:Function|null}} opts duration=null -> stopwatch */
  constructor({ duration = null, onComplete = null } = {}) {
    this.duration = duration;
    this.onComplete = onComplete;
    this.elapsed = 0;
    this.state = 'stopped'; // stopped | running | paused
  }

  start()  { this.elapsed = 0; this.state = 'running'; }
  stop()   { this.state = 'stopped'; }
  pause()  { if (this.state === 'running') this.state = 'paused'; }
  resume() { if (this.state === 'paused') this.state = 'running'; }
  reset()  { this.elapsed = 0; this.state = 'stopped'; }

  get isRunning() { return this.state === 'running'; }
  get remaining() { return this.duration == null ? Infinity : Math.max(0, this.duration - this.elapsed); }

  update(dt) {
    if (this.state !== 'running') return;
    this.elapsed += dt;
    if (this.duration != null && this.elapsed >= this.duration) {
      this.elapsed = this.duration;
      this.state = 'stopped';
      this.onComplete?.();
    }
  }
}

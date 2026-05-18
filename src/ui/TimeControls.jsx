import React from 'react'
import { useStore } from '../store.js'
import { formatTime, onDutyCount } from '../sim.js'

export default function TimeControls() {
  const running = useStore((s) => s.simulationRunning)
  const time = useStore((s) => s.timeOfDay)
  const toggle = useStore((s) => s.toggleSimulation)
  const setTime = useStore((s) => s.setTime)

  const isDay = time >= 360 && time < 1140 // 6:00 → 19:00
  const onDuty = onDutyCount(time)

  return (
    <div className="time-controls">
      <button
        className={`sim-btn ${running ? 'on' : ''}`}
        onClick={toggle}
        title={running ? 'Pause simulation' : 'Run simulation'}
      >
        <span className="sim-btn-icon">{running ? '❚❚' : '▶'}</span>
        <span className="sim-btn-label">{running ? 'Pause' : 'Simulate'}</span>
      </button>

      <div className="time-bar">
        <div className="time-display">
          <span className="time-icon">{isDay ? '☀' : '☾'}</span>
          <span className="time-clock">{formatTime(time)}</span>
          <span className="time-onduty">· {onDuty} on duty</span>
        </div>
        <input
          type="range"
          min="0"
          max="1439"
          value={time}
          step="1"
          onChange={(e) => setTime(Number(e.target.value))}
          className="time-slider"
        />
        <div className="time-ticks">
          <span>00</span>
          <span>06</span>
          <span>12</span>
          <span>18</span>
          <span>24</span>
        </div>
      </div>
    </div>
  )
}

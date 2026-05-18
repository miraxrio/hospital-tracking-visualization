import React from 'react'
import { useStore } from '../store.js'
import { formatTime } from '../sim.js'

const TYPE_ICON = {
  visit: '◉',
  break: '☕',
  meds: '℞',
  schedule: '◷',
  alert: '⚠',
  info: '·',
}

export default function EventsLog() {
  const events = useStore((s) => s.events)
  const clearEvents = useStore((s) => s.clearEvents)
  const running = useStore((s) => s.simulationRunning)

  return (
    <aside className="events-log">
      <header className="events-header">
        <span className="events-title">Live feed</span>
        <span className="events-count">{events.length}</span>
        <button
          className="events-clear"
          onClick={clearEvents}
          disabled={events.length === 0}
          title="Clear feed"
        >
          Clear
        </button>
      </header>
      <div className="events-body">
        {events.length === 0 && (
          <div className="events-empty">
            {running
              ? 'Watching for events…'
              : 'Press ▶ Simulate to see staff rounds, medication doses, alerts and more.'}
          </div>
        )}
        {events.map((ev) => (
          <div key={ev.id} className={`event ev-${ev.type}`}>
            <span className="event-time">{formatTime(ev.time)}</span>
            <span className="event-icon">{TYPE_ICON[ev.type] ?? '·'}</span>
            <span className="event-text">{ev.message}</span>
          </div>
        ))}
      </div>
    </aside>
  )
}

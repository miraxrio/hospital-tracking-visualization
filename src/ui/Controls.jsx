import React from 'react'
import { useStore } from '../store.js'

export default function Controls() {
  const showLabels = useStore((s) => s.showLabels)
  const cutawayFloorOnly = useStore((s) => s.cutawayFloorOnly)
  const toggleLabels = useStore((s) => s.toggleLabels)
  const toggleCutaway = useStore((s) => s.toggleCutaway)

  return (
    <div className="controls">
      <button
        className={`toggle-btn ${showLabels ? 'on' : ''}`}
        onClick={toggleLabels}
        title="Toggle name labels in 3D"
      >
        Labels {showLabels ? 'ON' : 'OFF'}
      </button>
      <button
        className={`toggle-btn ${cutawayFloorOnly ? 'on' : ''}`}
        onClick={toggleCutaway}
        title="Show only the active floor"
      >
        {cutawayFloorOnly ? 'Single floor' : 'All floors'}
      </button>
    </div>
  )
}

import React from 'react'
import { useProgress } from '@react-three/drei'
import { hospital, hospitalStats } from '../data/hospital.js'
import { useStore } from '../store.js'

export default function CityOverlay() {
  const stats = hospitalStats()
  const { active, progress } = useProgress()
  const beginEnterHospital = useStore((s) => s.beginEnterHospital)

  return (
    <>
      <div className="topbar">
        <div className="brand">
          <div className="brand-mark">M</div>
          <div>
            <div className="brand-title">MediTwin</div>
            <div className="brand-sub">{hospital.name}</div>
          </div>
        </div>

        <div className="topbar-stats">
          <div className="stat">
            <div className="stat-value">{stats.occupied}/{stats.beds}</div>
            <div className="stat-label">Hospital beds</div>
          </div>
          <div className="stat">
            <div className="stat-value">{hospital.floors.length}</div>
            <div className="stat-label">Floors</div>
          </div>
        </div>
      </div>

      <div className="city-cta">
        <div className="city-cta-title">Welcome to Northbrook</div>
        <div className="city-cta-body">
          Press the button to step into the hospital and explore every floor.
        </div>
        <button className="enter-btn" onClick={beginEnterHospital} disabled={active}>
          {active ? 'Loading city…' : 'Enter Hospital →'}
        </button>
      </div>

      {active && (
        <div className="loading-screen">
          <div className="loading-ring" />
          <div className="loading-text">Loading city · {progress.toFixed(0)}%</div>
        </div>
      )}
    </>
  )
}

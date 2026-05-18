import React from 'react'
import { useProgress } from '@react-three/drei'
import { hospital, hospitalStats } from '../data/hospital.js'

export default function CityOverlay() {
  const stats = hospitalStats()
  const { active, progress } = useProgress()

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

      <div className="city-hint">
        <div className="city-hint-title">Welcome to Northbrook</div>
        <div className="city-hint-body">
          Click the building marked with the red cross to enter the hospital.
        </div>
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

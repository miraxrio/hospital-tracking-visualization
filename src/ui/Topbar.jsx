import React from 'react'
import { hospital, hospitalStats, severityColor } from '../data/hospital.js'
import { useStore } from '../store.js'

export default function Topbar() {
  const stats = hospitalStats()
  const occRate = Math.round((stats.occupied / stats.beds) * 100)
  const returnToCity = useStore((s) => s.returnToCity)

  return (
    <div className="topbar">
      <div className="brand-row">
        <button
          className="back-btn"
          onClick={returnToCity}
          title="Return to city view"
        >
          <span className="back-btn-arrow">←</span>
          <span className="back-btn-label">City</span>
        </button>
        <div className="brand">
          <div className="brand-mark">M</div>
          <div>
            <div className="brand-title">MediTwin</div>
            <div className="brand-sub">{hospital.name}</div>
          </div>
        </div>
      </div>

      <div className="topbar-stats">
        <div className="stat">
          <div className="stat-value">{stats.occupied}/{stats.beds}</div>
          <div className="stat-label">Beds · {occRate}% occ</div>
        </div>
        <div className="stat">
          <div className="stat-value" style={{ color: severityColor.critical }}>
            <span className="sev-dot" style={{ background: severityColor.critical }} />
            {stats.bySeverity.critical || 0}
          </div>
          <div className="stat-label">Critical</div>
        </div>
        <div className="stat">
          <div className="stat-value" style={{ color: severityColor.high }}>
            <span className="sev-dot" style={{ background: severityColor.high }} />
            {stats.bySeverity.high || 0}
          </div>
          <div className="stat-label">High</div>
        </div>
        <div className="stat">
          <div className="stat-value" style={{ color: severityColor.medium }}>
            <span className="sev-dot" style={{ background: severityColor.medium }} />
            {stats.bySeverity.medium || 0}
          </div>
          <div className="stat-label">Medium</div>
        </div>
        <div className="stat">
          <div className="stat-value" style={{ color: severityColor.low }}>
            <span className="sev-dot" style={{ background: severityColor.low }} />
            {stats.bySeverity.low || 0}
          </div>
          <div className="stat-label">Low</div>
        </div>
      </div>
    </div>
  )
}

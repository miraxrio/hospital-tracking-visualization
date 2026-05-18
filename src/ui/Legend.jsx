import React from 'react'
import { departments, severityColor } from '../data/hospital.js'

export default function Legend() {
  return (
    <div className="legend">
      <div className="legend-title">Severity</div>
      <div className="legend-row">
        <span className="legend-swatch" style={{ background: severityColor.critical }} /> Critical
      </div>
      <div className="legend-row">
        <span className="legend-swatch" style={{ background: severityColor.high }} /> High
      </div>
      <div className="legend-row">
        <span className="legend-swatch" style={{ background: severityColor.medium }} /> Medium
      </div>
      <div className="legend-row">
        <span className="legend-swatch" style={{ background: severityColor.low }} /> Low
      </div>
      <div className="legend-title" style={{ marginTop: 8 }}>Departments</div>
      {Object.entries(departments).map(([key, d]) => (
        <div key={key} className="legend-row">
          <span className="legend-swatch" style={{ background: d.color }} /> {d.name}
        </div>
      ))}
    </div>
  )
}

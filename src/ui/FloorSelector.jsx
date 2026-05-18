import React from 'react'
import { hospital, patients } from '../data/hospital.js'
import { useStore } from '../store.js'

function floorOccupancy(floor) {
  let beds = 0
  let occ = 0
  for (const room of floor.rooms) {
    for (const bed of room.beds) {
      beds += 1
      if (bed.patientId && patients[bed.patientId]) occ += 1
    }
  }
  return { beds, occ }
}

export default function FloorSelector() {
  const selectedFloorId = useStore((s) => s.selectedFloorId)
  const setFloor = useStore((s) => s.setFloor)

  // Reverse so top floor appears at top of the list.
  const ordered = [...hospital.floors].reverse()

  return (
    <div className="floor-selector">
      {ordered.map((floor) => {
        const { beds, occ } = floorOccupancy(floor)
        const active = floor.id === selectedFloorId
        return (
          <button
            key={floor.id}
            className={`floor-btn ${active ? 'active' : ''}`}
            onClick={() => setFloor(floor.id)}
          >
            <div className="floor-btn-name">{floor.name}</div>
            <div className="floor-btn-meta">
              {occ}/{beds} occupied
            </div>
          </button>
        )
      })}
    </div>
  )
}

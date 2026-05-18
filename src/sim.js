import * as THREE from 'three'
import { hospital, patients, staff } from './data/hospital.js'

// Matches Floor.jsx — duplicated here to avoid a circular import from sim helpers.
export const FLOOR_HEIGHT = 3.5
export const FLOOR_THICKNESS = 0.18

// How quickly simulated time advances. 6 minutes of sim per real second = a
// full 24h cycle in 4 minutes of real time.
export const SIM_MINUTES_PER_SECOND = 6

export function parseTime(hhmm) {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

// Inclusive of start, exclusive of end. Wraps midnight when start > end.
export function isOnDuty(staffMember, minutes) {
  const [startStr, endStr] = staffMember.shift.split('-')
  const start = parseTime(startStr)
  const end = parseTime(endStr)
  if (start <= end) return minutes >= start && minutes < end
  return minutes >= start || minutes < end
}

export function formatTime(minutes) {
  const total = ((Math.floor(minutes) % 1440) + 1440) % 1440
  const h = Math.floor(total / 60).toString().padStart(2, '0')
  const m = Math.floor(total % 60).toString().padStart(2, '0')
  return `${h}:${m}`
}

export function patientLocation(patientId) {
  for (const floor of hospital.floors) {
    for (const room of floor.rooms) {
      const bedIdx = room.beds.findIndex((b) => b.patientId === patientId)
      if (bedIdx >= 0) return { floor, room, bedIdx }
    }
  }
  return null
}

// World position where staff stands beside a patient's bed (on the corridor side).
export function staffStandPosition(patientId) {
  const loc = patientLocation(patientId)
  if (!loc) return null
  const { floor, room, bedIdx } = loc

  const bedX = room.beds.length === 2 ? (bedIdx === 0 ? -0.85 : 0.85) : 0
  // Rooms with z<0 are south of the corridor; their feet (and the corridor) are at +z.
  const corridorDir = room.z < 0 ? 1 : -1

  const standY = floor.level * FLOOR_HEIGHT + FLOOR_THICKNESS / 2
  return {
    pos: new THREE.Vector3(room.x + bedX, standY, room.z + corridorDir * 0.85),
    floorId: floor.id,
  }
}

// One route per staff member with at least one assigned patient.
export const STAFF_ROUTES = staff
  .map((s) => {
    const patientIds = Object.keys(patients).filter((pid) =>
      patients[pid].careTeam.some((m) => m.id === s.id),
    )
    return { staff: s, patientIds }
  })
  .filter((r) => r.patientIds.length > 0)

export function onDutyCount(minutes) {
  return STAFF_ROUTES.reduce(
    (a, r) => a + (isOnDuty(r.staff, minutes) ? 1 : 0),
    0,
  )
}

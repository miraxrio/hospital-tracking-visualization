import * as THREE from 'three'
import { hospital, patients, staff } from './data/hospital.js'

// Matches Floor.jsx — duplicated here to avoid a circular import from sim helpers.
export const FLOOR_HEIGHT = 3.5
export const FLOOR_THICKNESS = 0.18

// Where the elevator shaft sits in scene-local coords. East end of the corridor,
// outside every room footprint (rooms span x ∈ [-7.8, 7.8]).
export const ELEVATOR_X = 8
export const ELEVATOR_Z = 0

// How quickly simulated time advances. 6 sim minutes per real second = full
// 24h cycle in 4 real minutes.
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

// World position where staff stands beside a patient's bed. `slot` fans agents
// out along the corridor-facing edge of the bed so multiple staff visiting the
// same patient don't overlap each other.
//   slot 0 -> x offset 0
//   slot 1 -> -0.35
//   slot 2 -> +0.35
//   slot 3 -> -0.7  (also +z offset)
//   slot 4 -> +0.7  (also +z offset)
export function staffStandPosition(patientId, slot = 0) {
  const loc = patientLocation(patientId)
  if (!loc) return null
  const { floor, room, bedIdx } = loc

  const bedX = room.beds.length === 2 ? (bedIdx === 0 ? -0.85 : 0.85) : 0
  const corridorDir = room.z < 0 ? 1 : -1

  const lateralStep = Math.ceil(slot / 2) * 0.35
  const slotX = (slot === 0 ? 0 : (slot % 2 === 1 ? -1 : 1)) * lateralStep
  const slotZ = slot >= 3 ? corridorDir * 0.25 : 0

  return {
    pos: new THREE.Vector3(
      room.x + bedX + slotX,
      floor.level * FLOOR_HEIGHT + FLOOR_THICKNESS / 2,
      room.z + corridorDir * 0.95 + slotZ,
    ),
    floorId: floor.id,
  }
}

export function elevatorPosition(floorId) {
  const floor = hospital.floors.find((f) => f.id === floorId)
  if (!floor) return null
  return {
    pos: new THREE.Vector3(
      ELEVATOR_X,
      floor.level * FLOOR_HEIGHT + FLOOR_THICKNESS / 2,
      ELEVATOR_Z,
    ),
    floorId,
  }
}

// Staff break rooms ("restrooms") — one for doctors, one for nurses. Both sit
// at the west end of the building (opposite the elevator). Doctors lounge on
// the Cardiology/Oncology floor, nurses lounge on the ICU/Pediatrics floor.
export const LOUNGE_X = -8.3
export const LOUNGE_HALF_W = 0.65
export const LOUNGE_HALF_D = 1.2

export const LOUNGES = {
  doctor: {
    id: 'doctor-lounge',
    floorId: 'F2',
    name: "Doctors' Lounge",
    accent: '#0ea5e9',
    z: -3,
    corridorDir: 1, // corridor is at +z
  },
  nurse: {
    id: 'nurse-lounge',
    floorId: 'F3',
    name: "Nurses' Lounge",
    accent: '#fb7185',
    z: 3,
    corridorDir: -1, // corridor is at -z
  },
}

export function loungeFor(staffMember) {
  return staffMember.role === 'Nurse' ? LOUNGES.nurse : LOUNGES.doctor
}

const DOCTOR_LIST = staff.filter((s) => s.role !== 'Nurse')
const NURSE_LIST = staff.filter((s) => s.role === 'Nurse')

function loungeSlotFor(staffMember) {
  const list = staffMember.role === 'Nurse' ? NURSE_LIST : DOCTOR_LIST
  return list.findIndex((s) => s.id === staffMember.id)
}

// Where a staff member stands inside their role's lounge. We fan agents out
// in a small grid so they don't pile up.
export function loungeStandPosition(staffMember) {
  const lounge = loungeFor(staffMember)
  const slot = Math.max(0, loungeSlotFor(staffMember))
  const floor = hospital.floors.find((f) => f.id === lounge.floorId)
  if (!floor) return null

  const cols = 3
  const col = slot % cols
  const row = Math.floor(slot / cols)
  const dx = (col - 1) * 0.32
  const dz = lounge.corridorDir * (0.35 - row * 0.4) // back row is closer to the wall

  return {
    pos: new THREE.Vector3(
      LOUNGE_X + dx,
      floor.level * FLOOR_HEIGHT + FLOOR_THICKNESS / 2,
      lounge.z + dz,
    ),
    floorId: lounge.floorId,
  }
}

// Per-staff visit plan: every patient they care for, plus their assigned slot
// at that patient (the index of the staff inside patient.careTeam).
export const STAFF_ROUTES = staff
  .map((s) => {
    const visits = []
    for (const pid of Object.keys(patients)) {
      const p = patients[pid]
      const slot = p.careTeam.findIndex((m) => m.id === s.id)
      if (slot >= 0) visits.push({ patientId: pid, slot })
    }
    return { staff: s, visits }
  })
  .filter((r) => r.visits.length > 0)

export function onDutyCount(minutes) {
  return STAFF_ROUTES.reduce(
    (a, r) => a + (isOnDuty(r.staff, minutes) ? 1 : 0),
    0,
  )
}

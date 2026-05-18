import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useStore } from '../store.js'
import {
  STAFF_ROUTES,
  staffStandPosition,
  loungeStandPosition,
  loungeFor,
  elevatorPosition,
  isOnDuty,
  SIM_MINUTES_PER_SECOND,
} from '../sim.js'
import { patients } from '../data/hospital.js'
import StaffMesh from './StaffMesh.jsx'

const STAY_PATIENT_MIN = 10
const STAY_LOUNGE_MIN = 18
const WALK_SIM_MINUTES = 2.5
const ELEVATOR_SIM_MINUTES = 1.2
// Each agent picks a number of patient visits in this range before taking a
// break, varied per agent so they don't all walk to the lounge simultaneously.
const BREAK_AFTER_MIN = 2
const BREAK_AFTER_MAX = 4

const _delta = new THREE.Vector3()

function planSegments(fromPos, fromFloorId, toPos, toFloorId) {
  if (fromFloorId === toFloorId) {
    return [
      {
        from: fromPos.clone(),
        to: toPos.clone(),
        kind: 'walk',
        floorId: fromFloorId,
        duration: WALK_SIM_MINUTES,
      },
    ]
  }
  const fromEl = elevatorPosition(fromFloorId).pos
  const toEl = elevatorPosition(toFloorId).pos
  return [
    { from: fromPos.clone(), to: fromEl.clone(), kind: 'walk', floorId: fromFloorId, duration: WALK_SIM_MINUTES },
    { from: fromEl.clone(), to: toEl.clone(), kind: 'elevate', floorId: null, duration: ELEVATOR_SIM_MINUTES },
    { from: toEl.clone(), to: toPos.clone(), kind: 'walk', floorId: toFloorId, duration: WALK_SIM_MINUTES },
  ]
}

function setFacing(agent, from, to) {
  _delta.subVectors(to, from)
  if (_delta.lengthSq() > 1e-4) {
    agent.facing = Math.atan2(_delta.x, _delta.z)
  }
}

function startMove(agent, dest, destType, currentTime) {
  agent.segments = planSegments(agent.worldPos, agent.floorId, dest.pos, dest.floorId)
  agent.segmentIdx = 0
  agent.state = 'moving'
  agent.stateStart = currentTime
  agent.nextType = destType
  agent.nextFloorId = dest.floorId
  setFacing(agent, agent.segments[0].from, agent.segments[0].to)
}

export default function StaffSimulation() {
  const groupRefs = useRef(new Map())
  const agentsRef = useRef(new Map())
  const liveTime = useRef(useStore.getState().timeOfDay)
  const lastSync = useRef(0)

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.1)

    const externalTime = useStore.getState().timeOfDay
    const running = useStore.getState().simulationRunning
    const cutaway = useStore.getState().cutawayFloorOnly
    const selectedFloor = useStore.getState().selectedFloorId

    if (Math.abs(externalTime - liveTime.current) > 1) {
      liveTime.current = externalTime
      agentsRef.current.clear()
    }

    if (running) {
      liveTime.current = (liveTime.current + dt * SIM_MINUTES_PER_SECOND) % 1440
      if (performance.now() - lastSync.current > 100) {
        useStore.setState({ timeOfDay: liveTime.current })
        lastSync.current = performance.now()
      }
    }

    const currentTime = liveTime.current

    for (const route of STAFF_ROUTES) {
      const grp = groupRefs.current.get(route.staff.id)
      if (!grp) continue

      const onDuty = isOnDuty(route.staff, currentTime)
      if (!onDuty) {
        grp.visible = false
        agentsRef.current.delete(route.staff.id)
        continue
      }

      let agent = agentsRef.current.get(route.staff.id)
      if (!agent) {
        const first = staffStandPosition(route.visits[0].patientId, route.visits[0].slot)
        if (!first) continue
        agent = {
          routeIdx: 0,
          state: 'staying',
          stateStart: currentTime,
          worldPos: first.pos.clone(),
          facing: 0,
          floorId: first.floorId,
          currentType: 'patient',
          nextType: 'patient',
          nextFloorId: first.floorId,
          segments: null,
          segmentIdx: 0,
          visitCount: 0,
          breakAfter:
            BREAK_AFTER_MIN +
            Math.floor(Math.random() * (BREAK_AFTER_MAX - BREAK_AFTER_MIN + 1)),
        }
        agentsRef.current.set(route.staff.id, agent)
      }

      if (running) {
        let elapsed = currentTime - agent.stateStart
        if (elapsed < 0) elapsed += 1440

        if (agent.state === 'staying') {
          const stayDuration =
            agent.currentType === 'lounge' ? STAY_LOUNGE_MIN : STAY_PATIENT_MIN

          if (elapsed >= stayDuration) {
            let dest
            let destType

            if (agent.currentType === 'lounge') {
              // Break is over — go back to the next patient in the rotation.
              agent.routeIdx = (agent.routeIdx + 1) % route.visits.length
              const v = route.visits[agent.routeIdx]
              dest = staffStandPosition(v.patientId, v.slot)
              destType = 'patient'
              agent.visitCount = 0
              agent.breakAfter =
                BREAK_AFTER_MIN +
                Math.floor(Math.random() * (BREAK_AFTER_MAX - BREAK_AFTER_MIN + 1))
            } else {
              // Patient visit completed — break or move to the next patient.
              agent.visitCount += 1
              if (agent.visitCount >= agent.breakAfter) {
                dest = loungeStandPosition(route.staff)
                destType = 'lounge'
              } else {
                agent.routeIdx = (agent.routeIdx + 1) % route.visits.length
                const v = route.visits[agent.routeIdx]
                dest = staffStandPosition(v.patientId, v.slot)
                destType = 'patient'
              }
            }

            if (dest) startMove(agent, dest, destType, currentTime)
          }
        } else if (agent.state === 'moving' && agent.segments) {
          const seg = agent.segments[agent.segmentIdx]
          if (elapsed >= seg.duration) {
            agent.worldPos.copy(seg.to)
            agent.segmentIdx += 1
            if (agent.segmentIdx >= agent.segments.length) {
              agent.state = 'staying'
              agent.stateStart = currentTime
              agent.currentType = agent.nextType
              agent.floorId = agent.nextFloorId
              agent.segments = null

              // Emit "arrived" event into the live feed
              const push = useStore.getState().pushEvent
              if (agent.currentType === 'patient') {
                const v = route.visits[agent.routeIdx]
                const patient = patients[v.patientId]
                push({
                  type: 'visit',
                  time: currentTime,
                  message: `${route.staff.name} → ${patient.name}`,
                })
              } else if (agent.currentType === 'lounge') {
                const lounge = loungeFor(route.staff)
                push({
                  type: 'break',
                  time: currentTime,
                  message: `${route.staff.name} resting in the ${lounge.name}`,
                })
              }
            } else {
              agent.stateStart = currentTime
              const next = agent.segments[agent.segmentIdx]
              setFacing(agent, next.from, next.to)
            }
          } else {
            const t = elapsed / seg.duration
            agent.worldPos.lerpVectors(seg.from, seg.to, t)
          }
        }
      }

      // Cutaway visibility: hide while mid-elevator-ride, hide while standing or
      // walking on a non-selected floor.
      let visibleFloorId = agent.floorId
      if (agent.state === 'moving' && agent.segments) {
        const seg = agent.segments[agent.segmentIdx]
        visibleFloorId = seg.floorId
      }
      const visible = !cutaway || visibleFloorId === selectedFloor
      grp.visible = visible

      if (visible) {
        grp.position.copy(agent.worldPos)
        grp.rotation.y = agent.facing
        if (agent.state === 'moving' && agent.segments) {
          const seg = agent.segments[agent.segmentIdx]
          if (seg.kind === 'walk') {
            const bob = Math.sin(currentTime * 6 + agent.routeIdx) * 0.02
            grp.position.y = agent.worldPos.y + bob
          }
        }
      }
    }
  })

  return (
    <>
      {STAFF_ROUTES.map(({ staff }) => (
        <group
          key={staff.id}
          ref={(r) => {
            if (r) groupRefs.current.set(staff.id, r)
            else groupRefs.current.delete(staff.id)
          }}
          visible={false}
        >
          <StaffMesh staff={staff} />
        </group>
      ))}
    </>
  )
}

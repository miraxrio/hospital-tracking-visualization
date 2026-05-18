import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useStore } from '../store.js'
import {
  STAFF_ROUTES,
  staffStandPosition,
  elevatorPosition,
  isOnDuty,
  SIM_MINUTES_PER_SECOND,
} from '../sim.js'
import StaffMesh from './StaffMesh.jsx'

const STAY_SIM_MINUTES = 8
const WALK_SIM_MINUTES = 3
const ELEVATOR_SIM_MINUTES = 1.5

const _delta = new THREE.Vector3()

// Build the list of segments an agent walks between two stand positions.
// Same floor -> single walk. Different floor -> walk to elevator, ride, walk
// from elevator. Each segment carries the floor it lives on (or null for the
// transit ride) so cutaway visibility can hide agents on inactive floors.
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
    {
      from: fromPos.clone(),
      to: fromEl.clone(),
      kind: 'walk',
      floorId: fromFloorId,
      duration: WALK_SIM_MINUTES,
    },
    {
      from: fromEl.clone(),
      to: toEl.clone(),
      kind: 'elevate',
      floorId: null, // mid-ride; hidden in cutaway mode
      duration: ELEVATOR_SIM_MINUTES,
    },
    {
      from: toEl.clone(),
      to: toPos.clone(),
      kind: 'walk',
      floorId: toFloorId,
      duration: WALK_SIM_MINUTES,
    },
  ]
}

function setFacing(agent, from, to) {
  _delta.subVectors(to, from)
  if (_delta.lengthSq() > 1e-4) {
    agent.facing = Math.atan2(_delta.x, _delta.z)
  }
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
        const first = staffStandPosition(
          route.visits[0].patientId,
          route.visits[0].slot,
        )
        if (!first) continue
        agent = {
          routeIdx: 0,
          state: 'staying',
          stateStart: currentTime,
          worldPos: first.pos.clone(),
          facing: 0,
          floorId: first.floorId,
          segments: null,
          segmentIdx: 0,
        }
        agentsRef.current.set(route.staff.id, agent)
      }

      if (running) {
        let elapsed = currentTime - agent.stateStart
        if (elapsed < 0) elapsed += 1440

        if (agent.state === 'staying' && elapsed >= STAY_SIM_MINUTES) {
          // Plan move to the next patient in the visit list
          const nextIdx = (agent.routeIdx + 1) % route.visits.length
          const nextVisit = route.visits[nextIdx]
          const dest = staffStandPosition(nextVisit.patientId, nextVisit.slot)
          if (dest) {
            agent.routeIdx = nextIdx
            agent.segments = planSegments(
              agent.worldPos,
              agent.floorId,
              dest.pos,
              dest.floorId,
            )
            agent.segmentIdx = 0
            agent.state = 'moving'
            agent.stateStart = currentTime
            const seg = agent.segments[0]
            setFacing(agent, seg.from, seg.to)
          }
        } else if (agent.state === 'moving' && agent.segments) {
          const seg = agent.segments[agent.segmentIdx]
          if (elapsed >= seg.duration) {
            agent.worldPos.copy(seg.to)
            agent.segmentIdx += 1
            if (agent.segmentIdx >= agent.segments.length) {
              agent.state = 'staying'
              agent.stateStart = currentTime
              // Final waypoint determines the floor we're now on
              const last = agent.segments[agent.segments.length - 1]
              agent.floorId = last.floorId ?? agent.floorId
              agent.segments = null
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

      // Visibility under cutaway: only show on the active floor; hide while
      // mid-ride between floors.
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

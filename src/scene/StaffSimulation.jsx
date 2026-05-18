import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useStore } from '../store.js'
import {
  STAFF_ROUTES,
  staffStandPosition,
  isOnDuty,
  SIM_MINUTES_PER_SECOND,
} from '../sim.js'
import StaffMesh from './StaffMesh.jsx'

// How long an agent lingers at a bed before walking to the next, and how long
// the walk takes — both in *simulated* minutes.
const STAY_SIM_MINUTES = 8
const WALK_SIM_MINUTES = 3

const _delta = new THREE.Vector3()

export default function StaffSimulation() {
  const groupRefs = useRef(new Map())
  const agentsRef = useRef(new Map())
  const liveTime = useRef(useStore.getState().timeOfDay)
  const lastSync = useRef(0)

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.1) // clamp tab-switch dt

    const externalTime = useStore.getState().timeOfDay
    const running = useStore.getState().simulationRunning
    const cutaway = useStore.getState().cutawayFloorOnly
    const selectedFloor = useStore.getState().selectedFloorId

    // Slider jumped externally — sync our live clock and restart agents from
    // their first patient so the visualization stays consistent.
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
        const first = staffStandPosition(route.patientIds[0])
        if (!first) continue
        agent = {
          routeIdx: 0,
          state: 'staying',
          stateStart: currentTime,
          worldPos: first.pos.clone(),
          fromPos: first.pos.clone(),
          toPos: first.pos.clone(),
          facing: 0,
          floorId: first.floorId,
        }
        agentsRef.current.set(route.staff.id, agent)
      }

      if (running) {
        let elapsed = currentTime - agent.stateStart
        if (elapsed < 0) elapsed += 1440

        if (agent.state === 'staying' && elapsed >= STAY_SIM_MINUTES) {
          const next = (agent.routeIdx + 1) % route.patientIds.length
          const dest = staffStandPosition(route.patientIds[next])
          if (dest) {
            agent.routeIdx = next
            agent.fromPos.copy(agent.worldPos)
            agent.toPos.copy(dest.pos)
            agent.state = 'walking'
            agent.stateStart = currentTime
            agent.floorId = dest.floorId
            _delta.subVectors(dest.pos, agent.fromPos)
            if (_delta.lengthSq() > 1e-4) {
              agent.facing = Math.atan2(_delta.x, _delta.z)
            }
          }
        } else if (agent.state === 'walking' && elapsed >= WALK_SIM_MINUTES) {
          agent.worldPos.copy(agent.toPos)
          agent.state = 'staying'
          agent.stateStart = currentTime
        } else if (agent.state === 'walking') {
          const t = elapsed / WALK_SIM_MINUTES
          agent.worldPos.lerpVectors(agent.fromPos, agent.toPos, t)
        }
      }

      const visible = !cutaway || agent.floorId === selectedFloor
      grp.visible = visible
      if (visible) {
        grp.position.copy(agent.worldPos)
        grp.rotation.y = agent.facing
        // Small bob while walking
        if (agent.state === 'walking') {
          const bob = Math.sin(currentTime * 6) * 0.02
          grp.position.y = agent.worldPos.y + bob
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

import React from 'react'
import { Html } from '@react-three/drei'
import { hospital } from '../data/hospital.js'
import {
  ELEVATOR_X,
  ELEVATOR_Z,
  FLOOR_HEIGHT,
  FLOOR_THICKNESS,
} from '../sim.js'
import { useStore } from '../store.js'

const SHAFT_W = 1.3
const SHAFT_D = 1.3

export default function Elevators() {
  const cutawayFloorOnly = useStore((s) => s.cutawayFloorOnly)
  const selectedFloorId = useStore((s) => s.selectedFloorId)
  const showLabels = useStore((s) => s.showLabels)

  const topLevel = hospital.floors[hospital.floors.length - 1].level
  const shaftHeight = (topLevel + 1) * FLOOR_HEIGHT

  return (
    <group position={[ELEVATOR_X, 0, ELEVATOR_Z]}>
      {/* Glassy shaft — only visible when looking at the whole building */}
      {!cutawayFloorOnly && (
        <mesh position={[0, shaftHeight / 2 - 0.2, 0]}>
          <boxGeometry args={[SHAFT_W, shaftHeight, SHAFT_D]} />
          <meshStandardMaterial
            color="#60a5fa"
            transparent
            opacity={0.12}
            roughness={0.1}
            metalness={0.4}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* Per-floor entrance pad + frame */}
      {hospital.floors.map((floor) => {
        const visible = !cutawayFloorOnly || floor.id === selectedFloorId
        const y = floor.level * FLOOR_HEIGHT + FLOOR_THICKNESS / 2
        return (
          <group key={floor.id} position={[0, y, 0]} visible={visible}>
            {/* Floor pad */}
            <mesh position={[0, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
              <planeGeometry args={[SHAFT_W * 0.95, SHAFT_D * 0.95]} />
              <meshStandardMaterial color="#1e293b" roughness={0.85} />
            </mesh>

            {/* Door frame (back wall of elevator entrance) */}
            <mesh position={[SHAFT_W / 2 - 0.04, 0.8, 0]} castShadow>
              <boxGeometry args={[0.08, 1.6, SHAFT_D]} />
              <meshStandardMaterial color="#475569" />
            </mesh>

            {/* Glow strip above door */}
            <mesh position={[SHAFT_W / 2 - 0.045, 1.5, 0]}>
              <boxGeometry args={[0.02, 0.06, SHAFT_D * 0.9]} />
              <meshStandardMaterial
                color="#38bdf8"
                emissive="#38bdf8"
                emissiveIntensity={1.4}
              />
            </mesh>

            {/* Side rails */}
            <mesh position={[0, 0.8, SHAFT_D / 2 - 0.04]} castShadow>
              <boxGeometry args={[SHAFT_W, 1.6, 0.08]} />
              <meshStandardMaterial color="#475569" />
            </mesh>
            <mesh position={[0, 0.8, -SHAFT_D / 2 + 0.04]} castShadow>
              <boxGeometry args={[SHAFT_W, 1.6, 0.08]} />
              <meshStandardMaterial color="#475569" />
            </mesh>

            {showLabels && visible && (
              <Html position={[0, 1.85, 0]} center distanceFactor={14} zIndexRange={[5, 0]}>
                <div className="elevator-label">ELEVATOR · {floor.id}</div>
              </Html>
            )}
          </group>
        )
      })}
    </group>
  )
}

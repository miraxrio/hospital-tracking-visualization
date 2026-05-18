import React from 'react'
import { Html } from '@react-three/drei'
import { hospital } from '../data/hospital.js'
import {
  LOUNGES,
  LOUNGE_X,
  LOUNGE_HALF_W,
  LOUNGE_HALF_D,
  FLOOR_HEIGHT,
  FLOOR_THICKNESS,
} from '../sim.js'
import { useStore } from '../store.js'

const WALL_H = 1.6
const WALL_T = 0.06

function LoungeRoom({ lounge }) {
  const cutawayFloorOnly = useStore((s) => s.cutawayFloorOnly)
  const selectedFloorId = useStore((s) => s.selectedFloorId)
  const showLabels = useStore((s) => s.showLabels)

  const floor = hospital.floors.find((f) => f.id === lounge.floorId)
  if (!floor) return null

  const visible = !cutawayFloorOnly || floor.id === selectedFloorId
  const y = floor.level * FLOOR_HEIGHT + FLOOR_THICKNESS / 2

  const wallOpacity = cutawayFloorOnly ? 0.2 : 0.45
  const wallColor = '#e2e8f0'
  const corridorEdgeZ = lounge.z + lounge.corridorDir * LOUNGE_HALF_D

  const wallMat = (
    <meshStandardMaterial
      color={wallColor}
      transparent
      opacity={wallOpacity}
      roughness={0.7}
    />
  )

  return (
    <group position={[LOUNGE_X, y, lounge.z]} visible={visible}>
      {/* Floor tile (slightly different color to distinguish from patient rooms) */}
      <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[LOUNGE_HALF_W * 2, LOUNGE_HALF_D * 2]} />
        <meshStandardMaterial color="#e0e7ff" roughness={0.7} />
      </mesh>

      {/* Accent strip along corridor edge */}
      <mesh
        position={[0, 0.012, lounge.corridorDir * (LOUNGE_HALF_D - 0.08)]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[LOUNGE_HALF_W * 2 - 0.2, 0.1]} />
        <meshStandardMaterial
          color={lounge.accent}
          emissive={lounge.accent}
          emissiveIntensity={0.3}
        />
      </mesh>

      {/* Back wall (away from corridor) */}
      <mesh
        position={[0, WALL_H / 2, -lounge.corridorDir * LOUNGE_HALF_D]}
        castShadow
      >
        <boxGeometry args={[LOUNGE_HALF_W * 2, WALL_H, WALL_T]} />
        {wallMat}
      </mesh>

      {/* Side walls */}
      <mesh position={[-LOUNGE_HALF_W, WALL_H / 2, 0]} castShadow>
        <boxGeometry args={[WALL_T, WALL_H, LOUNGE_HALF_D * 2]} />
        {wallMat}
      </mesh>
      <mesh position={[LOUNGE_HALF_W, WALL_H / 2, 0]} castShadow>
        <boxGeometry args={[WALL_T, WALL_H, LOUNGE_HALF_D * 2]} />
        {wallMat}
      </mesh>

      {/* Half wall on corridor side */}
      <mesh position={[0, 0.3, corridorEdgeZ]}>
        <boxGeometry args={[LOUNGE_HALF_W * 2, 0.6, WALL_T]} />
        {wallMat}
      </mesh>

      {/* Couch along the back wall */}
      <mesh
        position={[0, 0.22, -lounge.corridorDir * (LOUNGE_HALF_D - 0.25)]}
        castShadow
      >
        <boxGeometry args={[LOUNGE_HALF_W * 1.6, 0.36, 0.34]} />
        <meshStandardMaterial color={lounge.accent} roughness={0.7} />
      </mesh>
      {/* Couch backrest */}
      <mesh
        position={[0, 0.48, -lounge.corridorDir * (LOUNGE_HALF_D - 0.1)]}
        castShadow
      >
        <boxGeometry args={[LOUNGE_HALF_W * 1.6, 0.3, 0.1]} />
        <meshStandardMaterial color="#1e293b" roughness={0.85} />
      </mesh>

      {/* Coffee table */}
      <mesh position={[0, 0.16, 0]} castShadow>
        <boxGeometry args={[0.36, 0.04, 0.5]} />
        <meshStandardMaterial color="#cbd5e1" />
      </mesh>
      <mesh position={[0, 0.08, 0]}>
        <boxGeometry args={[0.06, 0.16, 0.06]} />
        <meshStandardMaterial color="#475569" />
      </mesh>

      {showLabels && visible && (
        <Html
          position={[0, WALL_H + 0.15, lounge.corridorDir * (LOUNGE_HALF_D - 0.2)]}
          center
          distanceFactor={14}
          zIndexRange={[5, 0]}
        >
          <div
            className="lounge-label"
            style={{
              borderColor: lounge.accent,
              color: lounge.accent,
              background: 'rgba(10, 15, 30, 0.9)',
            }}
          >
            {lounge.name}
          </div>
        </Html>
      )}
    </group>
  )
}

export default function Lounges() {
  return (
    <>
      <LoungeRoom lounge={LOUNGES.doctor} />
      <LoungeRoom lounge={LOUNGES.nurse} />
    </>
  )
}

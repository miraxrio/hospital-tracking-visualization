import React from 'react'
import { Html } from '@react-three/drei'
import { departments } from '../data/hospital.js'
import Bed from './Bed.jsx'

const ROOM_W = 3.6
const ROOM_D = 3.0
const WALL_H = 1.6
const WALL_T = 0.06

// A room is a small enclosure with floor + 4 (partial) walls and 1–2 beds.
// `side` determines which side of the corridor: 'south' (-z) or 'north' (+z).
export default function Room({ room, side, showLabels, dimmed }) {
  const dept = departments[room.dept]
  const opacity = dimmed ? 0.18 : 0.55
  const floorOpacity = dimmed ? 0.4 : 1.0

  // Corridor side wall faces the corridor; we leave it shorter to let the user "see in"
  const corridorIsNorth = side === 'south' // room on south side, corridor is to its north (+z)

  const wallMaterial = (
    <meshStandardMaterial
      color="#e2e8f0"
      transparent
      opacity={opacity}
      roughness={0.7}
      metalness={0.05}
    />
  )

  const accentMaterial = (
    <meshStandardMaterial
      color={dept.color}
      transparent
      opacity={dimmed ? 0.3 : 0.85}
      emissive={dept.color}
      emissiveIntensity={dimmed ? 0.05 : 0.25}
    />
  )

  // Bed placement inside room (room-local coords; room center at 0,0,0)
  // For 2 beds: side by side along x. For 1 bed: centered.
  const beds = room.beds
  const bedPositions = beds.length === 2
    ? [[-0.85, 0, 0], [0.85, 0, 0]]
    : [[0, 0, 0]]
  // Beds face the corridor (headboard away from corridor)
  // If corridor is north (+z), headboard should be on -z → rotate 180°.
  const bedRotY = corridorIsNorth ? Math.PI : 0

  return (
    <group position={[room.x, 0, room.z]}>
      {/* Floor tile */}
      <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[ROOM_W, ROOM_D]} />
        <meshStandardMaterial
          color={dimmed ? '#1a2238' : '#f1f5f9'}
          transparent
          opacity={floorOpacity}
          roughness={0.6}
        />
      </mesh>

      {/* Dept accent strip on the floor along the corridor edge */}
      <mesh
        position={[0, 0.012, corridorIsNorth ? ROOM_D / 2 - 0.08 : -ROOM_D / 2 + 0.08]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[ROOM_W - 0.4, 0.12]} />
        {accentMaterial}
      </mesh>

      {/* Back wall (away from corridor) */}
      <mesh
        position={[0, WALL_H / 2, corridorIsNorth ? -ROOM_D / 2 : ROOM_D / 2]}
        castShadow
      >
        <boxGeometry args={[ROOM_W, WALL_H, WALL_T]} />
        {wallMaterial}
      </mesh>

      {/* Side walls (full height) */}
      <mesh position={[-ROOM_W / 2, WALL_H / 2, 0]} castShadow>
        <boxGeometry args={[WALL_T, WALL_H, ROOM_D]} />
        {wallMaterial}
      </mesh>
      <mesh position={[ROOM_W / 2, WALL_H / 2, 0]} castShadow>
        <boxGeometry args={[WALL_T, WALL_H, ROOM_D]} />
        {wallMaterial}
      </mesh>

      {/* Corridor-facing partial wall (low — like a half wall so you can see in) */}
      <mesh
        position={[0, 0.3, corridorIsNorth ? ROOM_D / 2 : -ROOM_D / 2]}
      >
        <boxGeometry args={[ROOM_W, 0.6, WALL_T]} />
        {wallMaterial}
      </mesh>

      {/* Decorative bedside table */}
      <mesh
        position={[
          beds.length === 2 ? 0 : 1.0,
          0.18,
          corridorIsNorth ? -ROOM_D / 2 + 0.35 : ROOM_D / 2 - 0.35,
        ]}
        castShadow
      >
        <boxGeometry args={[0.32, 0.36, 0.32]} />
        <meshStandardMaterial
          color={dimmed ? '#475569' : '#cbd5e1'}
          transparent
          opacity={dimmed ? 0.4 : 1}
        />
      </mesh>

      {/* Beds */}
      {beds.map((bed, i) => (
        <Bed
          key={bed.id}
          bed={bed}
          position={bedPositions[i]}
          rotationY={bedRotY}
          showLabels={showLabels && !dimmed}
        />
      ))}

      {/* Room label hovering over the room */}
      {showLabels && !dimmed && (
        <Html
          position={[0, WALL_H + 0.15, corridorIsNorth ? ROOM_D / 2 - 0.4 : -ROOM_D / 2 + 0.4]}
          center
          distanceFactor={14}
          zIndexRange={[5, 0]}
        >
          <div className="room-label" style={{ borderColor: dept.color }}>
            {room.id} · {dept.name}
          </div>
        </Html>
      )}
    </group>
  )
}

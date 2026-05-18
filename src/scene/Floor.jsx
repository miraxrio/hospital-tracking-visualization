import React from 'react'
import { Html } from '@react-three/drei'
import Room from './Room.jsx'

const FLOOR_W = 18
const FLOOR_D = 10
const FLOOR_THICKNESS = 0.18
export const FLOOR_HEIGHT = 3.5

export default function Floor({ floor, active, cutawayFloorOnly, showLabels }) {
  const y = floor.level * FLOOR_HEIGHT
  const dimmed = !active

  // Wall / slab opacity depends on the view mode. The CITY scene now provides
  // the building's outer shell, so hospital all-floors view can be more
  // see-through so beds + departments read at a glance.
  const slabOpacity = cutawayFloorOnly ? 0.7 : dimmed ? 0.6 : 0.85
  const slabColor = dimmed ? '#b8c4d6' : '#cbd5e1'
  const stripeOpacity = cutawayFloorOnly ? 0.6 : dimmed ? 0.55 : 0.85
  const stripeColor = dimmed ? '#334155' : '#475569'

  // Outer "glass" envelope opacity (active floor only)
  const envelopeOpacity = cutawayFloorOnly ? 0.04 : 0.12

  return (
    <group position={[0, y, 0]}>
      {/* Floor slab */}
      <mesh position={[0, 0, 0]} receiveShadow castShadow={!dimmed}>
        <boxGeometry args={[FLOOR_W, FLOOR_THICKNESS, FLOOR_D]} />
        <meshStandardMaterial
          color={slabColor}
          roughness={0.6}
          transparent
          opacity={slabOpacity}
        />
      </mesh>

      {/* Corridor stripe */}
      <mesh position={[0, FLOOR_THICKNESS / 2 + 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[FLOOR_W - 0.4, 1.4]} />
        <meshStandardMaterial
          color={stripeColor}
          transparent
          opacity={stripeOpacity}
          roughness={0.7}
        />
      </mesh>

      {/* Outer perimeter (thin glass-like walls) — only the active floor draws them
          to avoid stacking 3 envelopes on top of each other in all-floors view. */}
      {active && (
        <>
          {/* Front (south) */}
          <mesh position={[0, 1.6, -FLOOR_D / 2]}>
            <boxGeometry args={[FLOOR_W, 3.2, 0.06]} />
            <meshStandardMaterial
              color="#60a5fa"
              transparent
              opacity={envelopeOpacity}
              roughness={0.1}
              metalness={0.4}
            />
          </mesh>
          {/* Back (north) */}
          <mesh position={[0, 1.6, FLOOR_D / 2]}>
            <boxGeometry args={[FLOOR_W, 3.2, 0.06]} />
            <meshStandardMaterial
              color="#60a5fa"
              transparent
              opacity={envelopeOpacity}
              roughness={0.1}
              metalness={0.4}
            />
          </mesh>
          {/* Left */}
          <mesh position={[-FLOOR_W / 2, 1.6, 0]}>
            <boxGeometry args={[0.06, 3.2, FLOOR_D]} />
            <meshStandardMaterial
              color="#60a5fa"
              transparent
              opacity={envelopeOpacity}
              roughness={0.1}
              metalness={0.4}
            />
          </mesh>
          {/* Right */}
          <mesh position={[FLOOR_W / 2, 1.6, 0]}>
            <boxGeometry args={[0.06, 3.2, FLOOR_D]} />
            <meshStandardMaterial
              color="#60a5fa"
              transparent
              opacity={envelopeOpacity}
              roughness={0.1}
              metalness={0.4}
            />
          </mesh>
        </>
      )}

      {/* Rooms — placed on top of slab */}
      <group position={[0, FLOOR_THICKNESS / 2, 0]}>
        {floor.rooms.map((room) => (
          <Room
            key={room.id}
            room={room}
            side={room.z < 0 ? 'south' : 'north'}
            showLabels={showLabels}
            dimmed={dimmed}
            cutawayFloorOnly={cutawayFloorOnly}
          />
        ))}
      </group>

      {/* Floor label */}
      {showLabels && (
        <Html position={[-FLOOR_W / 2 - 0.3, 0.4, 0]} center distanceFactor={14} zIndexRange={[3, 0]}>
          <div
            className="room-label"
            style={{
              opacity: dimmed ? 0.45 : 1,
              borderColor: active ? '#38bdf8' : 'var(--border)',
              color: active ? '#38bdf8' : 'var(--text-1)',
            }}
          >
            {floor.id}
          </div>
        </Html>
      )}
    </group>
  )
}

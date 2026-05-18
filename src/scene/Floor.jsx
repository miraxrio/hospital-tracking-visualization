import React from 'react'
import { Html } from '@react-three/drei'
import Room from './Room.jsx'

const FLOOR_W = 18
const FLOOR_D = 10
const FLOOR_THICKNESS = 0.18
export const FLOOR_HEIGHT = 3.5

export default function Floor({ floor, active, showLabels }) {
  const y = floor.level * FLOOR_HEIGHT
  const dimmed = !active

  return (
    <group position={[0, y, 0]}>
      {/* Floor slab */}
      <mesh position={[0, 0, 0]} receiveShadow castShadow={!dimmed}>
        <boxGeometry args={[FLOOR_W, FLOOR_THICKNESS, FLOOR_D]} />
        <meshStandardMaterial
          color={dimmed ? '#1a2238' : '#cbd5e1'}
          roughness={0.6}
          transparent
          opacity={dimmed ? 0.35 : 1}
        />
      </mesh>

      {/* Corridor stripe */}
      <mesh position={[0, FLOOR_THICKNESS / 2 + 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[FLOOR_W - 0.4, 1.4]} />
        <meshStandardMaterial
          color={dimmed ? '#0f172a' : '#475569'}
          transparent
          opacity={dimmed ? 0.4 : 0.9}
          roughness={0.7}
        />
      </mesh>

      {/* Outer perimeter (thin glass-like walls) */}
      {active && (
        <>
          {/* Front (south) */}
          <mesh position={[0, 1.6, -FLOOR_D / 2]}>
            <boxGeometry args={[FLOOR_W, 3.2, 0.06]} />
            <meshStandardMaterial
              color="#60a5fa"
              transparent
              opacity={0.06}
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
              opacity={0.06}
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
              opacity={0.06}
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
              opacity={0.06}
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

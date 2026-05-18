import React, { useMemo } from 'react'

// 5 distant hills strictly past the city's back edge (city z-range ends at
// -45; these start at z = -110) so they read as a far horizon, not as
// something sitting alongside the city. Plus 1 small hill right behind
// the back wall where the AuditCrowd sign perches.
export const HILLS = [
  // Far ridge — backdrop
  { pos: [-55, 0, -130], r: 55, scaleY: 0.7,  color: '#7b573b' },
  { pos: [-15, 0, -145], r: 72, scaleY: 0.75, color: '#6b4928' },
  { pos: [25,  0, -135], r: 60, scaleY: 0.7,  color: '#8a6a47' },
  { pos: [60,  0, -118], r: 46, scaleY: 0.6,  color: '#9a7a56' },
  { pos: [-80, 0, -115], r: 48, scaleY: 0.65, color: '#9a7a56' },
  // Sign hill — pulled closer to the back ridge and made taller so the
  // letters sit higher and nearer the distant mountains.
  { pos: [-15, 0, -92],  r: 32, scaleY: 0.7,  color: '#a8855e' },
]

export const SIGN_HILL_INDEX = 5

export default function Mountains() {
  const hills = useMemo(() => HILLS, [])
  return (
    <group>
      {hills.map((h, i) => (
        <mesh
          key={i}
          position={h.pos}
          scale={[1, h.scaleY, 1]}
          castShadow
          receiveShadow
        >
          <sphereGeometry args={[h.r, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color={h.color} roughness={0.95} flatShading />
        </mesh>
      ))}
    </group>
  )
}

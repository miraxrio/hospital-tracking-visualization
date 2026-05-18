import React, { useMemo } from 'react'

// Big rolling hills planted strictly BEHIND the city (z = -75 ..-115)
// and within the city's horizontal silhouette so they read as the back
// horizon rather than as something sitting next to the city. Hemispheres
// give a soft non-pointy dome shape; brown earth-tone palette + flat
// shading matches the low-poly city style.
//
// signMount = the index of the hill that the AuditCrowd sign perches on
// — kept in sync with AuditCrowdSign.jsx via the export below.
export const HILLS = [
  { pos: [-40, 0, -100], r: 48, scaleY: 0.65, color: '#7b573b' },
  { pos: [-5,  0, -115], r: 60, scaleY: 0.7,  color: '#6b4928' }, // sign sits here
  { pos: [30,  0, -100], r: 46, scaleY: 0.65, color: '#8a6a47' },
  { pos: [-65, 0, -78],  r: 34, scaleY: 0.55, color: '#9a7a56' },
  { pos: [55,  0, -78],  r: 34, scaleY: 0.55, color: '#9a7a56' },
  { pos: [-25, 0, -68],  r: 18, scaleY: 0.45, color: '#a8855e' },
  { pos: [20,  0, -68],  r: 18, scaleY: 0.45, color: '#a8855e' },
]

export const SIGN_HILL_INDEX = 1

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
          {/* Upper hemisphere — domed silhouette, not a pointy cone. */}
          <sphereGeometry args={[h.r, 18, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color={h.color} roughness={0.95} flatShading />
        </mesh>
      ))}
    </group>
  )
}

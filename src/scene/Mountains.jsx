import React, { useMemo } from 'react'

// Rolling earthen hills placed behind the city (negative-Z half of the
// scene), biased toward the back-left so they read as the "horizon" rather
// than something sitting next to the city. Hemispheres + flat shading give
// the cartoon low-poly look that matches the city model.
const HILLS = [
  { pos: [-55, 0, -60], r: 22, scaleY: 0.65, color: '#7b573b' },
  { pos: [-28, 0, -78], r: 28, scaleY: 0.7,  color: '#6b4928' },
  { pos: [-2,  0, -90], r: 30, scaleY: 0.7,  color: '#8a6a47' },
  { pos: [22,  0, -82], r: 25, scaleY: 0.65, color: '#6b4928' },
  { pos: [45,  0, -68], r: 20, scaleY: 0.6,  color: '#7b573b' },
  { pos: [-40, 0, -50], r: 14, scaleY: 0.55, color: '#9a7a56' },
  { pos: [10,  0, -55], r: 12, scaleY: 0.5,  color: '#9a7a56' },
]

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
          {/* Hemisphere: a sphere clipped to the upper half so the silhouette
              is a soft dome instead of a pointy peak. */}
          <sphereGeometry args={[h.r, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color={h.color} roughness={0.95} flatShading />
        </mesh>
      ))}
    </group>
  )
}

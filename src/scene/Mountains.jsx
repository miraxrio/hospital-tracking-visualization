import React, { useMemo } from 'react'

// A short row of stylized cones placed behind the city as a scenic backdrop.
// The colors are picked to match the daytime sky tones; at sunset/night they
// pick up the directional-light tint from SimSky.
const PEAKS = [
  { pos: [-72, 0, -55], r: 22, h: 28, color: '#9aabc4' },
  { pos: [-44, 0, -65], r: 24, h: 36, color: '#7f93af' },
  { pos: [-12, 0, -58], r: 18, h: 24, color: '#a3b3cb' },
  { pos: [18, 0, -68], r: 26, h: 40, color: '#7589a5' },
  { pos: [50, 0, -60], r: 22, h: 32, color: '#94a6bf' },
  { pos: [80, 0, -50], r: 18, h: 24, color: '#a3b3cb' },
]

export default function Mountains() {
  const peaks = useMemo(() => PEAKS, [])
  return (
    <group>
      {peaks.map((p, i) => (
        <mesh key={i} position={p.pos} castShadow receiveShadow>
          <coneGeometry args={[p.r, p.h, 8, 1]} />
          <meshStandardMaterial color={p.color} roughness={0.92} flatShading />
        </mesh>
      ))}
    </group>
  )
}

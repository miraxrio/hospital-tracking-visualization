import React from 'react'

export default function Ground() {
  return (
    <group>
      {/* Big ground disc */}
      <mesh position={[0, -0.5, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[60, 64]} />
        <meshStandardMaterial color="#0a1124" roughness={0.95} />
      </mesh>

      {/* Subtle grid */}
      <gridHelper
        args={[60, 60, '#1e293b', '#111a2e']}
        position={[0, -0.49, 0]}
      />

      {/* Soft ambient ring under the building */}
      <mesh position={[0, -0.48, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[12, 18, 64]} />
        <meshBasicMaterial color="#1e3a8a" transparent opacity={0.18} />
      </mesh>
    </group>
  )
}

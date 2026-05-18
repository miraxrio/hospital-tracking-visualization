import React from 'react'

const SKIN = '#fde68a'
const COAT = '#f8fafc'

const ROLE_BODY = {
  Nurse: '#fb7185',     // pink scrubs
  Attending: '#0ea5e9', // sky blue
  Resident: '#818cf8',  // indigo
  Surgeon: '#a855f7',   // purple
}

function bodyColor(staff) {
  return ROLE_BODY[staff.role] ?? '#38bdf8'
}

export default function StaffMesh({ staff }) {
  const isDoctor = staff.role !== 'Nurse'
  const color = bodyColor(staff)

  return (
    <group>
      {/* Legs */}
      <mesh position={[-0.08, 0.16, 0]} castShadow>
        <boxGeometry args={[0.1, 0.32, 0.12]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
      <mesh position={[0.08, 0.16, 0]} castShadow>
        <boxGeometry args={[0.1, 0.32, 0.12]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>

      {/* Body */}
      <mesh position={[0, 0.6, 0]} castShadow>
        <cylinderGeometry args={[0.17, 0.21, 0.5, 14]} />
        <meshStandardMaterial color={color} roughness={0.75} />
      </mesh>

      {/* Coat / collar */}
      <mesh position={[0, 0.87, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.16, 0.1, 14]} />
        <meshStandardMaterial color={isDoctor ? COAT : '#fda4af'} />
      </mesh>

      {/* Head */}
      <mesh position={[0, 1.04, 0]} castShadow>
        <sphereGeometry args={[0.14, 16, 16]} />
        <meshStandardMaterial color={SKIN} />
      </mesh>

      {/* Cap */}
      {isDoctor ? (
        <mesh position={[0, 1.16, 0]} castShadow>
          <cylinderGeometry args={[0.15, 0.15, 0.04, 16]} />
          <meshStandardMaterial color={COAT} />
        </mesh>
      ) : (
        <mesh position={[0, 1.18, 0]} castShadow rotation={[0, Math.PI / 4, 0]}>
          <coneGeometry args={[0.13, 0.1, 4]} />
          <meshStandardMaterial color={COAT} />
        </mesh>
      )}

      {/* Floor disc indicator (so it's easy to spot agents from above) */}
      <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.22, 0.28, 20]} />
        <meshBasicMaterial color={color} transparent opacity={0.45} />
      </mesh>
    </group>
  )
}

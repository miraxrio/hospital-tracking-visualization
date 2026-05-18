import React, { Suspense } from 'react'
import AnimatedStaff from './AnimatedStaff.jsx'

const SKIN = '#fde68a'
const COAT = '#f8fafc'

const ROLE_BODY = {
  Nurse: '#fb7185',
  Attending: '#0ea5e9',
  Resident: '#818cf8',
  Surgeon: '#a855f7',
}

function bodyColor(staff) {
  return ROLE_BODY[staff.role] ?? '#38bdf8'
}

// Capsule fallback used only while the GLBs stream in.
function CapsuleStaff({ staff }) {
  const isDoctor = staff.role !== 'Nurse'
  const color = bodyColor(staff)
  return (
    <group>
      <mesh position={[-0.08, 0.16, 0]} castShadow>
        <boxGeometry args={[0.1, 0.32, 0.12]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
      <mesh position={[0.08, 0.16, 0]} castShadow>
        <boxGeometry args={[0.1, 0.32, 0.12]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
      <mesh position={[0, 0.6, 0]} castShadow>
        <cylinderGeometry args={[0.17, 0.21, 0.5, 14]} />
        <meshStandardMaterial color={color} roughness={0.75} />
      </mesh>
      <mesh position={[0, 0.87, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.16, 0.1, 14]} />
        <meshStandardMaterial color={isDoctor ? COAT : '#fda4af'} />
      </mesh>
      <mesh position={[0, 1.04, 0]} castShadow>
        <sphereGeometry args={[0.14, 16, 16]} />
        <meshStandardMaterial color={SKIN} />
      </mesh>
    </group>
  )
}

export default function StaffMesh({ staff, walkingRef }) {
  const role = staff.role === 'Nurse' ? 'nurse' : 'doctor'
  return (
    <Suspense fallback={<CapsuleStaff staff={staff} />}>
      <AnimatedStaff role={role} walkingRef={walkingRef} />
    </Suspense>
  )
}

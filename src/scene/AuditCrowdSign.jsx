import React, { Suspense } from 'react'
import { Text3D, Center } from '@react-three/drei'

const FONT_URL = `${import.meta.env.BASE_URL}fonts/helvetiker_bold.typeface.json`

function Sign() {
  return (
    <Center position={[0, 22, -42]} rotation={[0, 0, 0]}>
      <Text3D
        font={FONT_URL}
        size={6}
        height={1.4}
        curveSegments={6}
        bevelEnabled
        bevelThickness={0.12}
        bevelSize={0.07}
        bevelSegments={4}
      >
        AUDITCROWD
        <meshStandardMaterial color="#ffffff" metalness={0.05} roughness={0.55} />
      </Text3D>
    </Center>
  )
}

export default function AuditCrowdSign() {
  return (
    <Suspense fallback={null}>
      <Sign />
    </Suspense>
  )
}

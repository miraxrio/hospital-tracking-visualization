import React, { Suspense } from 'react'
import { Text3D, Center } from '@react-three/drei'
import { HILLS, SIGN_HILL_INDEX } from './Mountains.jsx'

const FONT_URL = `${import.meta.env.BASE_URL}fonts/helvetiker_bold.typeface.json`

const SIGN_SIZE = 7

function Sign() {
  // Anchor the sign on top of the biggest back-center hill so it isn't
  // floating in mid-air. Dome top = hill.r * hill.scaleY; we drop the text
  // center half a glyph below so the letters embed slightly into the hill
  // crest (Hollywood-sign style).
  const hill = HILLS[SIGN_HILL_INDEX]
  const domeTop = hill.r * hill.scaleY
  const y = domeTop + SIGN_SIZE * 0.45

  return (
    <Center position={[hill.pos[0], y, hill.pos[2]]} rotation={[0, 0.45, 0]}>
      <Text3D
        font={FONT_URL}
        size={SIGN_SIZE}
        height={1.6}
        curveSegments={6}
        bevelEnabled
        bevelThickness={0.14}
        bevelSize={0.08}
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

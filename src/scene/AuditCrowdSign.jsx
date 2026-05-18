import React, { Suspense } from 'react'
import { Text3D, Center } from '@react-three/drei'
import { HILLS, SIGN_HILL_INDEX } from './Mountains.jsx'

const FONT_URL = `${import.meta.env.BASE_URL}fonts/helvetiker_bold.typeface.json`

const SIGN_SIZE = 5

function Sign() {
  // Anchor on the small close-in hill (right behind the city's back wall)
  // — keeps the letters low to the ground and close to the city instead of
  // floating high on a distant peak. Dome top = hill.r * hill.scaleY; the
  // text center drops half a glyph below it so the letter feet embed into
  // the crest (Hollywood-sign style).
  const hill = HILLS[SIGN_HILL_INDEX]
  const domeTop = hill.r * hill.scaleY
  const y = domeTop + SIGN_SIZE * 0.45

  return (
    <Center position={[hill.pos[0], y, hill.pos[2]]} rotation={[0, 0, 0]}>
      <Text3D
        font={FONT_URL}
        size={SIGN_SIZE}
        height={1.0}
        curveSegments={6}
        bevelEnabled
        bevelThickness={0.1}
        bevelSize={0.06}
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

import React, { Suspense, useEffect, useRef, useState } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls, Environment } from '@react-three/drei'
import * as THREE from 'three'
import CityModel from './CityModel.jsx'
import SimSky from './SimSky.jsx'
import Mountains from './Mountains.jsx'
import AuditCrowdSign from './AuditCrowdSign.jsx'

const HOME_POS = new THREE.Vector3(45, 35, 45)

// One-shot camera fit that points the camera at the city center
// at a sensible distance regardless of GLB scale.
function CityCamera({ cityBbox }) {
  const { camera } = useThree()
  const controls = useRef()
  const fitDone = useRef(false)

  useEffect(() => {
    if (!cityBbox || fitDone.current || !controls.current) return
    const size = cityBbox.getSize(new THREE.Vector3())
    const center = cityBbox.getCenter(new THREE.Vector3())
    const maxDim = Math.max(size.x, size.z)
    camera.position.set(
      center.x + maxDim * 0.75,
      center.y + maxDim * 0.55,
      center.z + maxDim * 0.75,
    )
    controls.current.target.copy(center)
    controls.current.update()
    fitDone.current = true
  }, [cityBbox, camera])

  return (
    <OrbitControls
      ref={controls}
      makeDefault
      enablePan
      enableZoom
      enableRotate
      minDistance={6}
      maxDistance={140}
      maxPolarAngle={Math.PI / 2 - 0.04}
      minPolarAngle={0.05}
      enableDamping
      dampingFactor={0.08}
    />
  )
}

export default function CityScene() {
  const [cityBbox, setCityBbox] = useState(null)

  return (
    <Canvas
      className="scene-canvas"
      shadows
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      camera={{ position: HOME_POS.toArray(), fov: 45, near: 0.1, far: 1000 }}
    >
      {/* Time-of-day sky drives the city background, sun, and ambient too */}
      <SimSky sunPos={[40, 60, 30]} shadowExtent={60} multiplier={1.3} />

      <Environment preset="park" />

      {/* Brown ground filling the area below the floating city — same earth
          tone as the city's own platform so the city looks rooted in the
          landscape instead of floating in mid-sky. */}
      <mesh position={[0, 1.6, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[800, 800]} />
        <meshStandardMaterial color="#6b4928" roughness={0.95} />
      </mesh>

      <Suspense fallback={null}>
        <CityModel onModelReady={({ bbox }) => setCityBbox(bbox)} />
      </Suspense>

      <Mountains />
      <AuditCrowdSign />

      <CityCamera cityBbox={cityBbox} />
    </Canvas>
  )
}

import React, { Suspense, useEffect, useRef, useState } from 'react'
import { Canvas, useThree, useFrame } from '@react-three/fiber'
import { OrbitControls, Environment, Sky, ContactShadows } from '@react-three/drei'
import * as THREE from 'three'
import CityModel from './CityModel.jsx'
import { useStore } from '../store.js'

const HOME_POS = new THREE.Vector3(45, 35, 45)

function CityCamera({ cityBbox, flyTo, onArrived }) {
  const { camera } = useThree()
  const controls = useRef()
  const flying = useRef(false)
  const fitDone = useRef(false)
  const startTime = useRef(0)
  const duration = 1100
  const fromPos = useRef(new THREE.Vector3())
  const toPos = useRef(new THREE.Vector3())
  const fromTarget = useRef(new THREE.Vector3())
  const toTarget = useRef(new THREE.Vector3())

  // One-time camera fit to whatever scale the loaded city happens to be.
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

  useEffect(() => {
    if (!flyTo || !controls.current) return
    fromPos.current.copy(camera.position)
    fromTarget.current.copy(controls.current.target)

    // End up just outside the hospital. Distance scales with hospital width.
    const mag = Math.max(flyTo.size.x, flyTo.size.z) * 1.6 + 4
    const offset = new THREE.Vector3(mag, mag * 0.7, mag)
    toPos.current.copy(flyTo.top).add(offset)
    toTarget.current.copy(flyTo.center)

    startTime.current = performance.now()
    flying.current = true
  }, [flyTo, camera])

  useFrame(() => {
    if (!flying.current || !controls.current) return
    const t = (performance.now() - startTime.current) / duration
    if (t >= 1) {
      camera.position.copy(toPos.current)
      controls.current.target.copy(toTarget.current)
      controls.current.update()
      flying.current = false
      onArrived?.()
      return
    }
    // easeInCubic — accelerate into the building
    const e = t * t * t
    camera.position.lerpVectors(fromPos.current, toPos.current, e)
    controls.current.target.lerpVectors(fromTarget.current, toTarget.current, e)
    controls.current.update()
  })

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
  const flyToHospital = useStore((s) => s.flyToHospital)
  const beginEnterHospital = useStore((s) => s.beginEnterHospital)
  const transitionTarget = useStore((s) => s.transitionTarget)
  const [cityBbox, setCityBbox] = useState(null)

  return (
    <Canvas
      className="scene-canvas"
      shadows
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      camera={{ position: HOME_POS.toArray(), fov: 45, near: 0.1, far: 1000 }}
    >
      <color attach="background" args={['#cfe5f7']} />
      <fog attach="fog" args={['#cfe5f7', 110, 260]} />

      <ambientLight intensity={0.55} />
      <directionalLight
        position={[40, 60, 30]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-60}
        shadow-camera-right={60}
        shadow-camera-top={60}
        shadow-camera-bottom={-60}
      />
      <directionalLight position={[-20, 18, -18]} intensity={0.35} color="#bae6fd" />

      <Sky sunPosition={[80, 40, 30]} turbidity={6} rayleigh={1.2} mieCoefficient={0.005} />
      <Environment preset="park" />

      <Suspense fallback={null}>
        <CityModel
          onHospitalClick={(info) => flyToHospital(info)}
          onModelReady={({ bbox }) => setCityBbox(bbox)}
        />
      </Suspense>

      <ContactShadows position={[0, 0.01, 0]} opacity={0.4} scale={120} blur={3} far={20} />

      <CityCamera
        cityBbox={cityBbox}
        flyTo={transitionTarget}
        onArrived={() => beginEnterHospital()}
      />
    </Canvas>
  )
}

import React, { useEffect, useRef } from 'react'
import { Canvas, useThree, useFrame } from '@react-three/fiber'
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei'
import * as THREE from 'three'
import { hospital } from '../data/hospital.js'
import { useStore } from '../store.js'
import Floor, { FLOOR_HEIGHT } from './Floor.jsx'
import Ground from './Ground.jsx'
import StaffSimulation from './StaffSimulation.jsx'
import Elevators from './Elevators.jsx'
import Lounges from './Lounges.jsx'
import SimSky from './SimSky.jsx'

function CameraRig() {
  const selectedFloorId = useStore((s) => s.selectedFloorId)
  const { camera } = useThree()
  const controls = useRef()

  // One-shot transition state. While `active.current` is true we lerp camera + target
  // toward `to*` over `duration` ms. Any user input on OrbitControls aborts the transition
  // so we never fight the user's mouse/touch.
  const active = useRef(false)
  const startTime = useRef(0)
  const duration = 700
  const fromTarget = useRef(new THREE.Vector3())
  const toTarget = useRef(new THREE.Vector3())
  const fromPos = useRef(new THREE.Vector3())
  const toPos = useRef(new THREE.Vector3())
  const initialized = useRef(false)

  // Re-target whenever the selected floor changes.
  useEffect(() => {
    if (!controls.current) return
    const floor = hospital.floors.find((f) => f.id === selectedFloorId)
    const y = (floor?.level ?? 0) * FLOOR_HEIGHT + 1.2

    if (!initialized.current) {
      controls.current.target.set(0, y, 0)
      camera.position.set(16, y + 6, 16)
      controls.current.update()
      initialized.current = true
      return
    }

    fromTarget.current.copy(controls.current.target)
    toTarget.current.set(0, y, 0)
    fromPos.current.copy(camera.position)
    // Preserve the user's current orbit offset, just shift it to the new target's y.
    const offset = new THREE.Vector3().subVectors(camera.position, controls.current.target)
    toPos.current.copy(toTarget.current).add(offset)
    startTime.current = performance.now()
    active.current = true
  }, [selectedFloorId, camera])

  // Abort transition the instant the user touches the controls.
  useEffect(() => {
    const c = controls.current
    if (!c) return
    const cancel = () => {
      active.current = false
    }
    c.addEventListener('start', cancel)
    return () => c.removeEventListener('start', cancel)
  }, [])

  useFrame(() => {
    if (!active.current || !controls.current) return
    const t = (performance.now() - startTime.current) / duration
    if (t >= 1) {
      controls.current.target.copy(toTarget.current)
      camera.position.copy(toPos.current)
      controls.current.update()
      active.current = false
      return
    }
    // easeInOutQuad
    const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
    controls.current.target.lerpVectors(fromTarget.current, toTarget.current, e)
    camera.position.lerpVectors(fromPos.current, toPos.current, e)
    controls.current.update()
  })

  return (
    <OrbitControls
      ref={controls}
      makeDefault
      enablePan
      enableZoom
      enableRotate
      minDistance={2.5}
      maxDistance={80}
      maxPolarAngle={Math.PI / 2 - 0.02}
      minPolarAngle={0.02}
      enableDamping
      dampingFactor={0.08}
      panSpeed={1.1}
      rotateSpeed={0.9}
      zoomSpeed={1.0}
    />
  )
}

export default function Scene() {
  const selectedFloorId = useStore((s) => s.selectedFloorId)
  const showLabels = useStore((s) => s.showLabels)
  const cutawayFloorOnly = useStore((s) => s.cutawayFloorOnly)
  const closePanel = useStore((s) => s.closePanel)

  return (
    <Canvas
      className="scene-canvas"
      shadows
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      camera={{ position: [16, 9, 16], fov: 45, near: 0.1, far: 200 }}
      onPointerMissed={() => closePanel()}
    >
      {/* Time-of-day sky drives background, fog, sun, and ambient */}
      <SimSky fogNear={45} fogFar={110} sunPos={[12, 18, 10]} shadowExtent={20} />

      {/* Constant accent fills so faces of buildings keep some color at night */}
      <directionalLight position={[-10, 8, -8]} intensity={0.25} color="#7dd3fc" />
      <pointLight position={[0, 12, 0]} intensity={0.25} color="#a5b4fc" />

      <Environment preset="city" />

      <Ground />

      {hospital.floors
        .filter((floor) => !cutawayFloorOnly || floor.id === selectedFloorId)
        .map((floor) => (
          <Floor
            key={floor.id}
            floor={floor}
            active={floor.id === selectedFloorId}
            cutawayFloorOnly={cutawayFloorOnly}
            showLabels={showLabels}
          />
        ))}

      <Elevators />
      <Lounges />
      <StaffSimulation />

      <ContactShadows
        position={[0, -0.49, 0]}
        opacity={0.55}
        scale={45}
        blur={2.6}
        far={12}
      />

      <CameraRig />
    </Canvas>
  )
}

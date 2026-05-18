import React, { useEffect, useRef } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei'
import * as THREE from 'three'
import { hospital } from '../data/hospital.js'
import { useStore } from '../store.js'
import Floor, { FLOOR_HEIGHT } from './Floor.jsx'
import Ground from './Ground.jsx'

function CameraRig() {
  const selectedFloorId = useStore((s) => s.selectedFloorId)
  const { camera } = useThree()
  const controls = useRef()
  const target = useRef(new THREE.Vector3(0, 0, 0))
  const desired = useRef(new THREE.Vector3(0, 0, 0))
  const camDesired = useRef(new THREE.Vector3())

  useEffect(() => {
    const floor = hospital.floors.find((f) => f.id === selectedFloorId)
    const y = (floor?.level ?? 0) * FLOOR_HEIGHT + 0.8
    desired.current.set(0, y, 0)
    camDesired.current.set(14, y + 5, 14)
  }, [selectedFloorId])

  // Smoothly interpolate target + camera position
  useEffect(() => {
    let raf
    const tick = () => {
      if (controls.current) {
        controls.current.target.lerp(desired.current, 0.08)
        camera.position.lerp(camDesired.current, 0.05)
        controls.current.update()
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [camera])

  return (
    <OrbitControls
      ref={controls}
      enablePan
      enableZoom
      enableRotate
      minDistance={6}
      maxDistance={45}
      maxPolarAngle={Math.PI / 2 - 0.05}
      minPolarAngle={0.15}
      enableDamping
      dampingFactor={0.08}
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
      camera={{ position: [14, 9, 14], fov: 45, near: 0.1, far: 200 }}
      onPointerMissed={() => closePanel()}
    >
      <color attach="background" args={['#050810']} />
      <fog attach="fog" args={['#050810', 35, 80]} />

      {/* Lights */}
      <ambientLight intensity={0.45} />
      <directionalLight
        position={[12, 18, 10]}
        intensity={1.1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />
      <directionalLight position={[-10, 8, -8]} intensity={0.35} color="#7dd3fc" />
      <pointLight position={[0, 12, 0]} intensity={0.4} color="#a5b4fc" />

      <Environment preset="city" />

      <Ground />

      {hospital.floors
        .filter((floor) => !cutawayFloorOnly || floor.id === selectedFloorId)
        .map((floor) => (
          <Floor
            key={floor.id}
            floor={floor}
            active={floor.id === selectedFloorId}
            showLabels={showLabels}
          />
        ))}

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

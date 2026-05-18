import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useGLTF, Html } from '@react-three/drei'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'

const MODEL_URL = `${import.meta.env.BASE_URL}models/low_poly_city/scene.gltf`

// The node names inside scene.gltf that compose the hospital.
const HOSPITAL_NAMES = new Set([
  '(base) hospital',
  '(base) hospital_Colore_0',
])

useGLTF.preload(MODEL_URL)

export default function CityModel({ onHospitalClick, onHospitalHover, onModelReady }) {
  const { scene } = useGLTF(MODEL_URL)
  const groupRef = useRef()
  const [bbox, setBbox] = useState(null)
  const [hospitalCenter, setHospitalCenter] = useState(null)
  const originalEmissive = useRef(new Map())
  const [hovered, setHovered] = useState(false)

  // Walk the scene once: find hospital meshes and the overall bounding box.
  useEffect(() => {
    if (!scene) return

    const hospitalMeshes = []
    scene.traverse((obj) => {
      if (!obj.isMesh) return
      // Walk up the parent chain checking names so we catch children of "(base) hospital".
      let parent = obj
      while (parent) {
        if (HOSPITAL_NAMES.has(parent.name)) {
          hospitalMeshes.push(obj)
          break
        }
        parent = parent.parent
      }
      obj.castShadow = true
      obj.receiveShadow = true
    })

    // Cache hospital meshes for hover toggling
    hospitalMeshes.forEach((m) => {
      m.userData.isHospital = true
      if (m.material) {
        // Materials may be shared across instances — clone to keep hover local
        m.material = m.material.clone()
        originalEmissive.current.set(m.uuid, {
          color: m.material.emissive ? m.material.emissive.clone() : new THREE.Color(0, 0, 0),
          intensity: m.material.emissiveIntensity ?? 1,
        })
      }
    })

    // Compute centers
    const box = new THREE.Box3().setFromObject(scene)
    setBbox(box)

    if (hospitalMeshes.length) {
      const hBox = new THREE.Box3()
      hospitalMeshes.forEach((m) => hBox.expandByObject(m))
      const center = new THREE.Vector3()
      hBox.getCenter(center)
      const top = new THREE.Vector3(center.x, hBox.max.y, center.z)
      setHospitalCenter({ center, top, size: hBox.getSize(new THREE.Vector3()) })
    }

    if (onModelReady) onModelReady({ bbox: box })
  }, [scene, onModelReady])

  // Hover effect — boost emissive on the hospital meshes
  useEffect(() => {
    if (!scene) return
    scene.traverse((obj) => {
      if (!obj.isMesh || !obj.userData.isHospital) return
      const orig = originalEmissive.current.get(obj.uuid)
      if (!orig || !obj.material) return
      if (hovered) {
        obj.material.emissive = new THREE.Color('#38bdf8')
        obj.material.emissiveIntensity = 0.55
      } else {
        obj.material.emissive = orig.color.clone()
        obj.material.emissiveIntensity = orig.intensity
      }
    })
  }, [hovered, scene])

  const handlePointerOver = (e) => {
    if (!e.object?.userData?.isHospital) return
    e.stopPropagation()
    setHovered(true)
    onHospitalHover?.(true)
    document.body.style.cursor = 'pointer'
  }
  const handlePointerOut = (e) => {
    if (!e.object?.userData?.isHospital) return
    e.stopPropagation()
    setHovered(false)
    onHospitalHover?.(false)
    document.body.style.cursor = 'default'
  }
  const handleClick = (e) => {
    if (!e.object?.userData?.isHospital) return
    e.stopPropagation()
    onHospitalClick?.(hospitalCenter)
  }

  // Beacon animation
  const beaconRef = useRef()
  useFrame((state) => {
    if (!beaconRef.current) return
    const t = state.clock.elapsedTime
    beaconRef.current.scale.setScalar(1 + Math.sin(t * 2) * 0.18)
  })

  return (
    <group ref={groupRef}>
      <primitive
        object={scene}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onClick={handleClick}
      />

      {/* Hospital marker — glowing red cross floating above the building */}
      {hospitalCenter && (
        <group
          position={[hospitalCenter.top.x, hospitalCenter.top.y + 3, hospitalCenter.top.z]}
          onPointerOver={() => {
            setHovered(true)
            document.body.style.cursor = 'pointer'
          }}
          onPointerOut={() => {
            setHovered(false)
            document.body.style.cursor = 'default'
          }}
          onClick={(e) => {
            e.stopPropagation()
            onHospitalClick?.(hospitalCenter)
          }}
        >
          {/* Halo */}
          <mesh ref={beaconRef}>
            <sphereGeometry args={[1.2, 24, 24]} />
            <meshBasicMaterial color="#ef4444" transparent opacity={0.18} />
          </mesh>
          {/* Red cross */}
          <group>
            <mesh>
              <boxGeometry args={[1.4, 0.4, 0.35]} />
              <meshStandardMaterial
                color="#ffffff"
                emissive="#ef4444"
                emissiveIntensity={0.5}
              />
            </mesh>
            <mesh>
              <boxGeometry args={[0.4, 1.4, 0.35]} />
              <meshStandardMaterial
                color="#ffffff"
                emissive="#ef4444"
                emissiveIntensity={0.5}
              />
            </mesh>
          </group>
          {/* Beam from cross to ground */}
          <mesh position={[0, -1.8, 0]}>
            <cylinderGeometry args={[0.18, 0.4, 3.6, 16, 1, true]} />
            <meshBasicMaterial color="#ef4444" transparent opacity={0.18} side={2} />
          </mesh>
          {/* Label */}
          <Html position={[0, 1.7, 0]} center distanceFactor={20} zIndexRange={[10, 0]}>
            <div className="hospital-marker">
              Northbrook Regional
              <div className="small">click to enter</div>
            </div>
          </Html>
        </group>
      )}
    </group>
  )
}

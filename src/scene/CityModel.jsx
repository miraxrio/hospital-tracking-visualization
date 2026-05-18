import React, { useEffect, useRef } from 'react'
import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const MODEL_URL = `${import.meta.env.BASE_URL}models/low_poly_city.glb`
const TARGET_CITY_SIZE = 90
// Lift the city up off the ground so mountains + sign read in the lower area.
const CITY_Y_LIFT = 3

useGLTF.preload(MODEL_URL)

export default function CityModel({ onModelReady }) {
  const { scene } = useGLTF(MODEL_URL)
  const wrapperRef = useRef()
  const initialized = useRef(false)
  const cloudsRef = useRef([])
  const onModelReadyRef = useRef(onModelReady)
  useEffect(() => {
    onModelReadyRef.current = onModelReady
  }, [onModelReady])

  useEffect(() => {
    if (!scene || !wrapperRef.current || initialized.current) return
    initialized.current = true

    // Rotate the city 270° around Y so the right face is what's pointing
    // toward the camera (mountain ridge now sits on the other side).
    scene.rotation.y = Math.PI * 1.5
    scene.updateMatrixWorld(true)

    // Mark mesh shadow flags + collect cloud groups for animation.
    const clouds = []
    scene.traverse((obj) => {
      if (obj.isMesh) {
        obj.castShadow = true
        obj.receiveShadow = true
      }
      // Cloud groups are named "Nuvola", "Nuvola 2", "Nuvola.001", etc.
      // Skip the per-mesh "_Colore_0" children — animate the parent groups so
      // both top and bottom cloud halves move together.
      if (
        obj.name &&
        /^Nuvola(\s\d+)?(\.\d+)?$/.test(obj.name) &&
        !/_Colore_0$/.test(obj.name)
      ) {
        clouds.push({
          obj,
          baseX: obj.position.x,
          baseZ: obj.position.z,
          // Random per-cloud drift parameters — frequencies tuned so a full
          // cycle takes roughly 10–25 seconds (visible motion on glance).
          freq: 0.25 + Math.random() * 0.25,
          phase: Math.random() * Math.PI * 2,
          ampX: 1400 + Math.random() * 1600,
          ampZ: 400 + Math.random() * 600,
        })
      }
    })
    cloudsRef.current = clouds

    scene.updateMatrixWorld(true)
    const rawBbox = new THREE.Box3().setFromObject(scene)
    const rawSize = rawBbox.getSize(new THREE.Vector3())
    const rawCenter = rawBbox.getCenter(new THREE.Vector3())
    const maxDim = Math.max(rawSize.x, rawSize.z) || 1
    const scale = TARGET_CITY_SIZE / maxDim

    wrapperRef.current.scale.setScalar(scale)
    wrapperRef.current.position.set(
      -rawCenter.x * scale,
      -rawBbox.min.y * scale + CITY_Y_LIFT,
      -rawCenter.z * scale,
    )
    wrapperRef.current.updateMatrixWorld(true)

    const finalBbox = new THREE.Box3().setFromObject(wrapperRef.current)
    onModelReadyRef.current?.({ bbox: finalBbox })
  }, [scene])

  // Drift the clouds smoothly. Local-space oscillation is large because the
  // GLB sits inside a 0.01-scale FBX root.
  useFrame((state) => {
    const t = state.clock.elapsedTime
    for (const c of cloudsRef.current) {
      c.obj.position.x = c.baseX + Math.sin(t * c.freq + c.phase) * c.ampX
      c.obj.position.z = c.baseZ + Math.cos(t * c.freq * 0.7 + c.phase) * c.ampZ
    }
  })

  return (
    <group ref={wrapperRef}>
      <primitive object={scene} />
    </group>
  )
}

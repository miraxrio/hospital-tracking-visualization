import React, { useEffect, useRef } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'

const MODEL_URL = `${import.meta.env.BASE_URL}models/low_poly_city.glb`
const TARGET_CITY_SIZE = 90

useGLTF.preload(MODEL_URL)

// Pure city renderer. No hospital marker, no hover effects, no click handlers —
// entry into the hospital is driven entirely by the "Enter Hospital" button.
export default function CityModel({ onModelReady }) {
  const { scene } = useGLTF(MODEL_URL)
  const wrapperRef = useRef()
  const initialized = useRef(false)
  const onModelReadyRef = useRef(onModelReady)
  useEffect(() => {
    onModelReadyRef.current = onModelReady
  }, [onModelReady])

  useEffect(() => {
    if (!scene || !wrapperRef.current || initialized.current) return
    initialized.current = true

    scene.traverse((obj) => {
      if (obj.isMesh) {
        obj.castShadow = true
        obj.receiveShadow = true
      }
    })

    scene.updateMatrixWorld(true)
    const rawBbox = new THREE.Box3().setFromObject(scene)
    const rawSize = rawBbox.getSize(new THREE.Vector3())
    const rawCenter = rawBbox.getCenter(new THREE.Vector3())
    const maxDim = Math.max(rawSize.x, rawSize.z) || 1
    const scale = TARGET_CITY_SIZE / maxDim

    wrapperRef.current.scale.setScalar(scale)
    wrapperRef.current.position.set(
      -rawCenter.x * scale,
      -rawBbox.min.y * scale,
      -rawCenter.z * scale,
    )
    wrapperRef.current.updateMatrixWorld(true)

    const finalBbox = new THREE.Box3().setFromObject(wrapperRef.current)
    onModelReadyRef.current?.({ bbox: finalBbox })
  }, [scene])

  return (
    <group ref={wrapperRef}>
      <primitive object={scene} />
    </group>
  )
}

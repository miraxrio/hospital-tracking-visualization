import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useGLTF, Html } from '@react-three/drei'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'

const MODEL_URL = `${import.meta.env.BASE_URL}models/low_poly_city.glb`

// Names inside the GLB that compose the hospital block.
const HOSPITAL_ROOT_NAMES = new Set([
  '(base) hospital',
])

// Normalize the (very large, Sketchfab-exported) city to roughly this size
// along its widest horizontal axis. Anything else in the scene works in these units.
const TARGET_CITY_SIZE = 90

useGLTF.preload(MODEL_URL)

export default function CityModel({ onHospitalClick, onModelReady }) {
  const { scene } = useGLTF(MODEL_URL)
  const wrapperRef = useRef()
  const [hospitalInfo, setHospitalInfo] = useState(null)
  const [hovered, setHovered] = useState(false)
  const originalEmissive = useRef(new Map())
  const initialized = useRef(false)
  // Keep the latest callback in a ref so the init effect can call it
  // without re-firing every time the parent renders a new function.
  const onModelReadyRef = useRef(onModelReady)
  useEffect(() => {
    onModelReadyRef.current = onModelReady
  }, [onModelReady])

  // One-time setup: detect hospital meshes, normalize scene to target size, compute marker pose.
  useEffect(() => {
    if (!scene || !wrapperRef.current || initialized.current) return
    initialized.current = true

    // 1. Mark hospital meshes via parent-name walk.
    const hospitalMeshes = []
    scene.traverse((obj) => {
      if (obj.isMesh) {
        obj.castShadow = true
        obj.receiveShadow = true
      }
      let p = obj
      while (p) {
        if (HOSPITAL_ROOT_NAMES.has(p.name)) {
          if (obj.isMesh) {
            hospitalMeshes.push(obj)
            obj.userData.isHospital = true
          }
          break
        }
        p = p.parent
      }
    })

    // 2. Compute scene-local bbox BEFORE applying wrapper transforms.
    scene.updateMatrixWorld(true)
    const rawBbox = new THREE.Box3().setFromObject(scene)
    const rawSize = rawBbox.getSize(new THREE.Vector3())
    const rawCenter = rawBbox.getCenter(new THREE.Vector3())
    const maxDim = Math.max(rawSize.x, rawSize.z) || 1
    const scale = TARGET_CITY_SIZE / maxDim

    // 3. Apply wrapper transform: scale down + ground-align + center on XZ.
    wrapperRef.current.scale.setScalar(scale)
    wrapperRef.current.position.set(
      -rawCenter.x * scale,
      -rawBbox.min.y * scale,
      -rawCenter.z * scale,
    )
    wrapperRef.current.updateMatrixWorld(true)

    // 4. Compute hospital bbox in world space (post-wrapper transform).
    const hBox = new THREE.Box3()
    hospitalMeshes.forEach((m) => hBox.expandByObject(m))
    const hCenter = hBox.getCenter(new THREE.Vector3())
    const hSize = hBox.getSize(new THREE.Vector3())
    const hTop = new THREE.Vector3(hCenter.x, hBox.max.y, hCenter.z)

    // 5. Clone hospital materials so hover-emissive only paints the hospital
    //    (other buildings may share materials with hospital submeshes).
    hospitalMeshes.forEach((m) => {
      if (m.material && !Array.isArray(m.material)) {
        m.material = m.material.clone()
        originalEmissive.current.set(m.uuid, {
          color: m.material.emissive ? m.material.emissive.clone() : new THREE.Color(0, 0, 0),
          intensity: m.material.emissiveIntensity ?? 1,
        })
      }
    })

    setHospitalInfo({
      meshes: hospitalMeshes,
      center: hCenter,
      top: hTop,
      size: hSize,
    })

    // 6. Final scene bbox for camera auto-fit.
    const finalBbox = new THREE.Box3().setFromObject(wrapperRef.current)
    onModelReadyRef.current?.({ bbox: finalBbox })
  }, [scene])

  // Hover effect — boost emissive on hospital meshes.
  useEffect(() => {
    if (!hospitalInfo) return
    hospitalInfo.meshes.forEach((m) => {
      const orig = originalEmissive.current.get(m.uuid)
      if (!orig || !m.material) return
      if (hovered) {
        m.material.emissive = new THREE.Color('#38bdf8')
        m.material.emissiveIntensity = 0.85
      } else {
        m.material.emissive = orig.color.clone()
        m.material.emissiveIntensity = orig.intensity
      }
    })
  }, [hovered, hospitalInfo])

  // Beacon pulse
  const haloRef = useRef()
  const beamRef = useRef()
  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (haloRef.current) {
      const s = 1 + Math.sin(t * 2) * 0.18
      haloRef.current.scale.setScalar(s)
    }
    if (beamRef.current) {
      beamRef.current.material.opacity = 0.18 + Math.sin(t * 2) * 0.08
    }
  })

  // Marker dimensions are proportional to the hospital size so it always reads.
  const marker = useMemo(() => {
    if (!hospitalInfo) return null
    const m = Math.max(hospitalInfo.size.x, hospitalInfo.size.z)
    return {
      cross: m * 0.45,
      thickness: m * 0.12,
      halo: m * 0.6,
      beamRadius: m * 0.18,
      beamHeight: m * 1.4,
      labelOffset: m * 0.6,
      hitboxScale: [
        hospitalInfo.size.x * 1.05,
        hospitalInfo.size.y * 1.1,
        hospitalInfo.size.z * 1.05,
      ],
    }
  }, [hospitalInfo])

  const enter = () => {
    setHovered(true)
    document.body.style.cursor = 'pointer'
  }
  const leave = () => {
    setHovered(false)
    document.body.style.cursor = 'default'
  }
  const fire = (e) => {
    e?.stopPropagation?.()
    if (hospitalInfo) onHospitalClick?.(hospitalInfo)
  }

  return (
    <>
      <group ref={wrapperRef}>
        <primitive object={scene} />
      </group>

      {hospitalInfo && marker && (
        <>
          {/* Invisible hitbox over the hospital — captures clicks/hover even if the
              underlying meshes are tiny or oddly shaped */}
          <mesh
            position={hospitalInfo.center.toArray()}
            scale={marker.hitboxScale}
            onPointerOver={(e) => { e.stopPropagation(); enter() }}
            onPointerOut={(e) => { e.stopPropagation(); leave() }}
            onClick={fire}
          >
            <boxGeometry />
            <meshBasicMaterial transparent opacity={0} depthWrite={false} />
          </mesh>

          {/* Light beam from the hospital roof up into the sky */}
          <mesh
            ref={beamRef}
            position={[hospitalInfo.top.x, hospitalInfo.top.y + marker.beamHeight / 2, hospitalInfo.top.z]}
          >
            <cylinderGeometry args={[marker.beamRadius * 0.4, marker.beamRadius, marker.beamHeight, 24, 1, true]} />
            <meshBasicMaterial color="#ef4444" transparent opacity={0.22} side={THREE.DoubleSide} depthWrite={false} />
          </mesh>

          {/* Floating beacon: halo + red cross */}
          <group
            position={[hospitalInfo.top.x, hospitalInfo.top.y + marker.beamHeight + marker.cross * 0.5, hospitalInfo.top.z]}
            onPointerOver={enter}
            onPointerOut={leave}
            onClick={fire}
          >
            <mesh ref={haloRef}>
              <sphereGeometry args={[marker.halo, 24, 24]} />
              <meshBasicMaterial color="#ef4444" transparent opacity={0.2} depthWrite={false} />
            </mesh>
            <mesh>
              <boxGeometry args={[marker.cross, marker.thickness, marker.thickness * 0.7]} />
              <meshStandardMaterial
                color="#ffffff"
                emissive="#ef4444"
                emissiveIntensity={0.9}
              />
            </mesh>
            <mesh>
              <boxGeometry args={[marker.thickness, marker.cross, marker.thickness * 0.7]} />
              <meshStandardMaterial
                color="#ffffff"
                emissive="#ef4444"
                emissiveIntensity={0.9}
              />
            </mesh>
            <Html
              position={[0, marker.cross * 0.9, 0]}
              center
              distanceFactor={45}
              zIndexRange={[10, 0]}
            >
              <div className={`hospital-marker ${hovered ? 'is-hovered' : ''}`}>
                Northbrook Regional
                <div className="small">click to enter</div>
              </div>
            </Html>
          </group>
        </>
      )}
    </>
  )
}

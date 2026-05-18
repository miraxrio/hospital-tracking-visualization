import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useGLTF, Html } from '@react-three/drei'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { useStore } from '../store.js'

const MODEL_URL = `${import.meta.env.BASE_URL}models/low_poly_city.glb`
const HOSPITAL_NODE_NAME = '(base) hospital'
// The hospital's transform origin sits on the street in front of the building.
// Plane.014_Colore_0 is the rooftop helipad — its geometry IS the building center,
// so we anchor the marker/camera/hitbox to it (the user's suggested reference).
const HOSPITAL_REF_MESH = 'Plane.014_Colore_0'
const TARGET_CITY_SIZE = 90

useGLTF.preload(MODEL_URL)

export default function CityModel({ onHospitalClick, onModelReady }) {
  const { scene } = useGLTF(MODEL_URL)
  const wrapperRef = useRef()
  const [hospitalInfo, setHospitalInfo] = useState(null)
  const [hovered, setHovered] = useState(false)
  const originalEmissive = useRef(new Map())
  const initialized = useRef(false)
  const setStoreHospitalInfo = useStore((s) => s.setHospitalInfo)

  const onModelReadyRef = useRef(onModelReady)
  useEffect(() => {
    onModelReadyRef.current = onModelReady
  }, [onModelReady])

  // One-time setup: find hospital node, normalize scene, compute world-space marker pose.
  useEffect(() => {
    if (!scene || !wrapperRef.current || initialized.current) return
    initialized.current = true

    // 1. Find the hospital node and a tight reference mesh.
    //    (base) hospital is the natural parent, but it contains rooftop signage and
    //    decoration meshes that sit far from the actual building footprint and
    //    skew Box3.setFromObject. We use the node's TRANSFORM position for X/Z
    //    (always at the building's origin) and filter outliers for the size.
    let hospitalNode = null
    let refMesh = null
    scene.traverse((obj) => {
      if (obj.isMesh) {
        obj.castShadow = true
        obj.receiveShadow = true
      }
      if (obj.name === HOSPITAL_NODE_NAME) hospitalNode = obj
      if (obj.name === HOSPITAL_REF_MESH && obj.isMesh) refMesh = obj
    })

    const hospitalMeshes = []
    if (hospitalNode) {
      hospitalNode.traverse((obj) => {
        if (obj.isMesh) {
          obj.userData.isHospital = true
          hospitalMeshes.push(obj)
        }
      })
    }

    // 2. Compute raw scene bbox (wrapper transform is still identity).
    scene.updateMatrixWorld(true)
    const rawBbox = new THREE.Box3().setFromObject(scene)
    const rawSize = rawBbox.getSize(new THREE.Vector3())
    const rawCenter = rawBbox.getCenter(new THREE.Vector3())
    const maxDim = Math.max(rawSize.x, rawSize.z) || 1
    const scale = TARGET_CITY_SIZE / maxDim

    // 3. Apply wrapper transform: scale + ground-align + XZ-center.
    wrapperRef.current.scale.setScalar(scale)
    wrapperRef.current.position.set(
      -rawCenter.x * scale,
      -rawBbox.min.y * scale,
      -rawCenter.z * scale,
    )
    wrapperRef.current.updateMatrixWorld(true)

    // 4. Hospital pose in world space.
    //    Anchor to Plane.014_Colore_0 (the rooftop helipad) — its geometry sits
    //    exactly on the building, unlike the (base) hospital node whose transform
    //    origin is offset onto the street.
    let hCenter = new THREE.Vector3()
    let hSize = new THREE.Vector3()
    let hTop = new THREE.Vector3()
    let hMin = new THREE.Vector3()

    if (refMesh) {
      // Use Plane.014_Colore_0's matrixWorld TRANSLATION (its transform position),
      // not its bbox center. The mesh vertices are off-center in local space
      // (Y: -9.79 to 0), so setFromObject().getCenter() lands well outside the
      // actual building. The matrix translation, however, is precisely at the
      // helipad's anchor point on the building roof.
      refMesh.updateWorldMatrix(true, false)
      const refPos = new THREE.Vector3().setFromMatrixPosition(refMesh.matrixWorld)
      const refBox = new THREE.Box3().setFromObject(refMesh)
      const refSize = refBox.getSize(new THREE.Vector3())

      const footprint = Math.max(refSize.x, refSize.z, 4)
      const buildingHeight = Math.max(refPos.y, 4)

      hCenter.set(refPos.x, buildingHeight / 2, refPos.z)
      hTop.set(refPos.x, buildingHeight, refPos.z)
      hMin.set(refPos.x - footprint / 2, 0, refPos.z - footprint / 2)
      hSize.set(footprint, buildingHeight, footprint)
    } else if (hospitalNode) {
      // Fallback: tight bbox around the hospital node's near children.
      hospitalNode.updateWorldMatrix(true, false)
      const hPos = new THREE.Vector3().setFromMatrixPosition(hospitalNode.matrixWorld)
      const NEAR_RADIUS = 6
      const nearMeshes = hospitalMeshes.filter((m) => {
        m.updateWorldMatrix(true, false)
        const mp = new THREE.Vector3().setFromMatrixPosition(m.matrixWorld)
        return Math.hypot(mp.x - hPos.x, mp.z - hPos.z) < NEAR_RADIUS
      })
      const meshes = nearMeshes.length > 0 ? nearMeshes : hospitalMeshes
      const fbBox = new THREE.Box3()
      meshes.forEach((m) => fbBox.expandByObject(m))
      fbBox.getSize(hSize)
      hMin.copy(fbBox.min)
      hCenter.set(hPos.x, (fbBox.min.y + fbBox.max.y) / 2, hPos.z)
      hTop.set(hPos.x, fbBox.max.y, hPos.z)
    }

    // 5. Clone hospital materials so hover-emissive only paints the hospital.
    hospitalMeshes.forEach((m) => {
      if (m.material && !Array.isArray(m.material)) {
        m.material = m.material.clone()
        originalEmissive.current.set(m.uuid, {
          color: m.material.emissive ? m.material.emissive.clone() : new THREE.Color(0, 0, 0),
          intensity: m.material.emissiveIntensity ?? 1,
        })
      }
    })

    const info = {
      meshes: hospitalMeshes,
      center: hCenter,
      top: hTop,
      min: hMin,
      size: hSize,
    }
    setHospitalInfo(info)
    setStoreHospitalInfo(info)

    const finalBbox = new THREE.Box3().setFromObject(wrapperRef.current)
    onModelReadyRef.current?.({ bbox: finalBbox })
  }, [scene, setStoreHospitalInfo])

  // Hover effect — emissive boost on hospital meshes.
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
      haloRef.current.scale.setScalar(1 + Math.sin(t * 2) * 0.18)
    }
    if (beamRef.current) {
      beamRef.current.material.opacity = 0.25 + Math.sin(t * 2) * 0.1
    }
  })

  const marker = useMemo(() => {
    if (!hospitalInfo) return null
    const m = Math.max(hospitalInfo.size.x, hospitalInfo.size.z)
    return {
      cross: m * 0.7,
      thickness: m * 0.18,
      halo: m * 0.85,
      beamRadius: m * 0.28,
      beamHeight: m * 1.1,
      hitboxScale: [
        Math.max(hospitalInfo.size.x * 1.15, 1),
        Math.max(hospitalInfo.size.y * 1.2, 1),
        Math.max(hospitalInfo.size.z * 1.15, 1),
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
          {/* Slightly-tinted hitbox over the hospital — gives a visible "this is clickable"
              affordance and captures clicks even on the building's tiny rooftop bits */}
          <mesh
            position={hospitalInfo.center.toArray()}
            scale={marker.hitboxScale}
            onPointerOver={(e) => {
              e.stopPropagation()
              enter()
            }}
            onPointerOut={(e) => {
              e.stopPropagation()
              leave()
            }}
            onClick={fire}
          >
            <boxGeometry />
            <meshBasicMaterial
              color={hovered ? '#38bdf8' : '#ef4444'}
              transparent
              opacity={hovered ? 0.18 : 0.07}
              depthWrite={false}
            />
          </mesh>

          {/* Light beam from hospital roof up into the sky */}
          <mesh
            ref={beamRef}
            position={[hospitalInfo.top.x, hospitalInfo.top.y + marker.beamHeight / 2, hospitalInfo.top.z]}
          >
            <cylinderGeometry args={[marker.beamRadius * 0.4, marker.beamRadius, marker.beamHeight, 24, 1, true]} />
            <meshBasicMaterial color="#ef4444" transparent opacity={0.3} side={THREE.DoubleSide} depthWrite={false} />
          </mesh>

          {/* Floating red cross beacon */}
          <group
            position={[hospitalInfo.top.x, hospitalInfo.top.y + marker.beamHeight + marker.cross * 0.6, hospitalInfo.top.z]}
            onPointerOver={enter}
            onPointerOut={leave}
            onClick={fire}
          >
            <mesh ref={haloRef}>
              <sphereGeometry args={[marker.halo, 24, 24]} />
              <meshBasicMaterial color="#ef4444" transparent opacity={0.25} depthWrite={false} />
            </mesh>
            <mesh>
              <boxGeometry args={[marker.cross, marker.thickness, marker.thickness * 0.7]} />
              <meshStandardMaterial color="#ffffff" emissive="#ef4444" emissiveIntensity={1.1} />
            </mesh>
            <mesh>
              <boxGeometry args={[marker.thickness, marker.cross, marker.thickness * 0.7]} />
              <meshStandardMaterial color="#ffffff" emissive="#ef4444" emissiveIntensity={1.1} />
            </mesh>
            <Html
              position={[0, marker.cross * 0.85, 0]}
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

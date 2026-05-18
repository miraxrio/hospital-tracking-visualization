import React, { useEffect, useMemo, useRef } from 'react'
import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { AnimationMixer, LoopRepeat } from 'three'
import { SkeletonUtils } from 'three-stdlib'

const BASE = import.meta.env.BASE_URL
const IDLE_URL = encodeURI(`${BASE}models/doctor idle.glb`)
const WALK_URL = encodeURI(`${BASE}models/doctor walk.glb`)

// Mixamo GLB mesh is ~1.86 units tall (meters). Hospital rooms have a 1.6
// ceiling, so scale down to ~1.3 unit characters.
const MODEL_SCALE = 0.7

useGLTF.preload(IDLE_URL)
useGLTF.preload(WALK_URL)

export default function DoctorMesh({ walkingRef }) {
  const idleGltf = useGLTF(IDLE_URL)
  const walkGltf = useGLTF(WALK_URL)

  // SkeletonUtils.clone preserves per-instance bone state so multiple doctors
  // animate independently from the same source mesh.
  const cloned = useMemo(() => {
    const c = SkeletonUtils.clone(idleGltf.scene)
    c.traverse((obj) => {
      if (obj.isMesh || obj.isSkinnedMesh) {
        obj.castShadow = true
        obj.receiveShadow = true
        if (obj.material) obj.material = obj.material.clone()
      }
    })
    return c
  }, [idleGltf])

  const mixer = useMemo(() => new AnimationMixer(cloned), [cloned])

  const actions = useMemo(() => {
    const idleClip = idleGltf.animations[0]
    const walkClip = walkGltf.animations[0]
    if (!idleClip || !walkClip) return null
    const idle = mixer.clipAction(idleClip)
    const walk = mixer.clipAction(walkClip)
    idle.setLoop(LoopRepeat, Infinity)
    walk.setLoop(LoopRepeat, Infinity)
    idle.time = Math.random() * idleClip.duration
    walk.time = Math.random() * walkClip.duration
    idle.play()
    return { idle, walk }
  }, [idleGltf, walkGltf, mixer])

  const lastWalking = useRef(false)
  useFrame((_, delta) => {
    mixer.update(delta)
    if (!actions) return
    const w = walkingRef?.current ?? false
    if (w === lastWalking.current) return
    lastWalking.current = w
    if (w) {
      actions.idle.fadeOut(0.25)
      actions.walk.reset().fadeIn(0.25).play()
    } else {
      actions.walk.fadeOut(0.25)
      actions.idle.reset().fadeIn(0.25).play()
    }
  })

  useEffect(() => () => mixer.stopAllAction(), [mixer])

  return <primitive object={cloned} scale={MODEL_SCALE} />
}

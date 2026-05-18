import React, { useEffect, useMemo, useRef } from 'react'
import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { AnimationMixer, LoopRepeat } from 'three'
import { SkeletonUtils } from 'three-stdlib'

const BASE = import.meta.env.BASE_URL

const MODELS = {
  doctor: {
    idle: `${BASE}models/doctor idle.glb`,
    walk: `${BASE}models/doctor walk.glb`,
    scale: 0.7,
  },
  nurse: {
    idle: `${BASE}models/nurse idle.glb`,
    walk: `${BASE}models/nurse walk.glb`,
    scale: 0.7,
  },
}

// Preload every model up front so the first sim tick doesn't stall.
for (const m of Object.values(MODELS)) {
  useGLTF.preload(encodeURI(m.idle))
  useGLTF.preload(encodeURI(m.walk))
}

// Mixamo→Blender→glTF exports often include several animation clips per file:
// a single ~1s cycle plus longer "combined timeline" clips (37s of mostly
// static frames). Picking animations[0] gave us the static one — the doctor
// looked stuck in idle even while "walking". Prefer the short cycle.
function pickCycleClip(clips) {
  if (!clips?.length) return null
  const cycle = clips.find((c) => c.duration >= 0.5 && c.duration <= 5)
  return cycle ?? clips[0]
}

export default function AnimatedStaff({ role, walkingRef }) {
  const conf = MODELS[role] ?? MODELS.doctor
  const idleGltf = useGLTF(encodeURI(conf.idle))
  const walkGltf = useGLTF(encodeURI(conf.walk))

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
    const idleClip = pickCycleClip(idleGltf.animations)
    const walkClip = pickCycleClip(walkGltf.animations)
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

  return <primitive object={cloned} scale={conf.scale} />
}

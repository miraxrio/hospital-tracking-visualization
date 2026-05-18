import React, { useEffect, useMemo, useRef } from 'react'
import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { AnimationMixer, LoopRepeat } from 'three'
import { SkeletonUtils } from 'three-stdlib'

const BASE = import.meta.env.BASE_URL

// Each GLB ships several clips: clip 0 is a 37s "talking on phone" idle
// (long combined timeline) and clip 1 is the 1.03s Mixamo walk cycle.
// Both files in a pair (idle/walk) contain the SAME clip set, so picking
// the right index matters more than picking the right file.
//
// `scale` compensates for any baked-in armature scale. The doctor model has
// an identity armature, the nurse model has a 0.01 armature scale, so it
// needs a 100× larger prop scale to render at the same size.
const MODELS = {
  doctor: {
    idleUrl: `${BASE}models/doctor idle.glb`,
    walkUrl: `${BASE}models/doctor walk.glb`,
    idleClipIdx: 0,
    walkClipIdx: 1,
    scale: 0.7,
  },
  nurse: {
    idleUrl: `${BASE}models/nurse idle.glb`,
    walkUrl: `${BASE}models/nurse walk.glb`,
    idleClipIdx: 0,
    walkClipIdx: 1,
    scale: 70,
  },
}

// Preload every model up front so the first sim tick doesn't stall.
for (const m of Object.values(MODELS)) {
  useGLTF.preload(encodeURI(m.idleUrl))
  useGLTF.preload(encodeURI(m.walkUrl))
}

function pickClip(animations, idx) {
  if (!animations?.length) return null
  return animations[idx] ?? animations[0]
}

export default function AnimatedStaff({ role, walkingRef }) {
  const conf = MODELS[role] ?? MODELS.doctor
  const idleGltf = useGLTF(encodeURI(conf.idleUrl))
  const walkGltf = useGLTF(encodeURI(conf.walkUrl))

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
    const idleClip = pickClip(idleGltf.animations, conf.idleClipIdx)
    const walkClip = pickClip(walkGltf.animations, conf.walkClipIdx)
    if (!idleClip || !walkClip) return null
    const idle = mixer.clipAction(idleClip)
    const walk = mixer.clipAction(walkClip)
    idle.setLoop(LoopRepeat, Infinity)
    walk.setLoop(LoopRepeat, Infinity)
    idle.time = Math.random() * idleClip.duration
    walk.time = Math.random() * walkClip.duration
    idle.play()
    return { idle, walk }
  }, [idleGltf, walkGltf, mixer, conf.idleClipIdx, conf.walkClipIdx])

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

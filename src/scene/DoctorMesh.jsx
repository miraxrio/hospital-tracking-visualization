import React, { useEffect, useMemo, useRef } from 'react'
import { useFBX } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { AnimationMixer, LoopRepeat } from 'three'
import { SkeletonUtils } from 'three-stdlib'

// Walk.fbx ships the walk clip; the talking-on-cell-phone file ships the
// skinned mesh + an idle (phone) clip. Both share the same rig so we use the
// idle file for the mesh and pull each clip into a per-instance AnimationMixer.
const BASE = import.meta.env.BASE_URL
const IDLE_URL = encodeURI(`${BASE}models/Talking On A Cell Phone.fbx`)
const WALK_URL = encodeURI(`${BASE}models/Walk.fbx`)

// Mixamo characters are exported in cm. Aim for roughly 1.6 scene units (a
// little shorter than the room ceiling of 1.6 so they fit under doorways).
const MODEL_SCALE = 0.0095

useFBX.preload(IDLE_URL)
useFBX.preload(WALK_URL)

export default function DoctorMesh({ walkingRef }) {
  const idleFbx = useFBX(IDLE_URL)
  const walkFbx = useFBX(WALK_URL)

  // Per-instance clone — SkeletonUtils preserves bone references so the mixer
  // animates only this copy and not every other doctor on the floor.
  const cloned = useMemo(() => {
    const c = SkeletonUtils.clone(idleFbx)
    c.traverse((obj) => {
      if (obj.isMesh) {
        obj.castShadow = true
        obj.receiveShadow = true
      }
    })
    return c
  }, [idleFbx])

  const mixer = useMemo(() => new AnimationMixer(cloned), [cloned])

  const actions = useMemo(() => {
    const idleClip = idleFbx.animations[0]
    const walkClip = walkFbx.animations[0]
    if (!idleClip || !walkClip) return null
    const idle = mixer.clipAction(idleClip)
    const walk = mixer.clipAction(walkClip)
    idle.setLoop(LoopRepeat, Infinity)
    walk.setLoop(LoopRepeat, Infinity)
    // Offset each instance so they don't all step in sync
    idle.time = Math.random() * (idleClip.duration || 1)
    walk.time = Math.random() * (walkClip.duration || 1)
    idle.play()
    return { idle, walk }
  }, [idleFbx, walkFbx, mixer])

  // Watch the walking ref each frame and crossfade when it changes
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

  // Free the mixer when the component unmounts
  useEffect(() => () => mixer.stopAllAction(), [mixer])

  return <primitive object={cloned} scale={MODEL_SCALE} />
}

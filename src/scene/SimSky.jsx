import React, { useMemo } from 'react'
import { useStore } from '../store.js'
import { skyAppearance } from '../sim.js'

// Time-driven sky + sun + ambient. Pulled out into its own component so only
// it re-renders when timeOfDay ticks, not the whole Canvas tree.
//
// Props:
//   fogNear / fogFar — when both supplied, attaches a fog tinted to the sky.
//   sunPos / shadowExtent — directional-light placement and shadow camera size.
//   multiplier — gain applied to sun + ambient intensity (outdoor scenes
//     usually want > 1 since they don't have a tight room around the camera).
export default function SimSky({
  fogNear,
  fogFar,
  sunPos = [12, 18, 10],
  shadowExtent = 20,
  multiplier = 1,
}) {
  const time = useStore((s) => s.timeOfDay)
  const sky = useMemo(() => skyAppearance(time), [time])

  return (
    <>
      <color attach="background" args={[sky.sky]} />
      {fogNear !== undefined && fogFar !== undefined && (
        <fog attach="fog" args={[sky.fog, fogNear, fogFar]} />
      )}
      <ambientLight intensity={sky.ambI * multiplier} color={sky.amb} />
      <directionalLight
        position={sunPos}
        intensity={sky.sunI * multiplier}
        color={sky.sun}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-shadowExtent}
        shadow-camera-right={shadowExtent}
        shadow-camera-top={shadowExtent}
        shadow-camera-bottom={-shadowExtent}
      />
    </>
  )
}

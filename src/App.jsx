import React, { useEffect } from 'react'
import Scene from './scene/Scene.jsx'
import CityScene from './scene/CityScene.jsx'
import Topbar from './ui/Topbar.jsx'
import FloorSelector from './ui/FloorSelector.jsx'
import Legend from './ui/Legend.jsx'
import Controls from './ui/Controls.jsx'
import PatientPanel from './ui/PatientPanel.jsx'
import CityOverlay from './ui/CityOverlay.jsx'
import { useStore } from './store.js'

const FADE_MS = 320

export default function App() {
  const view = useStore((s) => s.view)
  const showOverlay = useStore((s) => s.showOverlay)
  const selectedBedId = useStore((s) => s.selectedBedId)
  const swapView = useStore((s) => s.swapView)
  const clearOverlay = useStore((s) => s.clearOverlay)

  // Orchestrate the cross-fade: after the overlay fully fades IN, swap the scene
  // and on the next frame fade it OUT so the new scene reveals smoothly.
  useEffect(() => {
    if (!showOverlay) return
    const t = setTimeout(() => {
      swapView()
      // Let the new view mount one paint before pulling the overlay back.
      requestAnimationFrame(() =>
        requestAnimationFrame(() => clearOverlay()),
      )
    }, FADE_MS)
    return () => clearTimeout(t)
  }, [showOverlay, swapView, clearOverlay])

  return (
    <div className="app">
      {view === 'city' ? <CityScene /> : <Scene />}

      {view === 'city' ? (
        <CityOverlay />
      ) : (
        <>
          <Topbar />
          <FloorSelector />
          <Legend />
          <Controls />
          {!selectedBedId && (
            <div className="hint">
              Click a glowing bed to view the patient · drag to orbit · scroll to zoom
            </div>
          )}
          <PatientPanel />
        </>
      )}

      <div className={`fade-overlay ${showOverlay ? 'on' : ''}`} />
    </div>
  )
}

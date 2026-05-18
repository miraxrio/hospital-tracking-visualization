import React from 'react'
import Scene from './scene/Scene.jsx'
import Topbar from './ui/Topbar.jsx'
import FloorSelector from './ui/FloorSelector.jsx'
import Legend from './ui/Legend.jsx'
import Controls from './ui/Controls.jsx'
import PatientPanel from './ui/PatientPanel.jsx'
import { useStore } from './store.js'

export default function App() {
  const selectedBedId = useStore((s) => s.selectedBedId)

  return (
    <div className="app">
      <Scene />
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
    </div>
  )
}

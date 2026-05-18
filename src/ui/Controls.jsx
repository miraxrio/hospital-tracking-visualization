import React, { useEffect, useRef, useState } from 'react'
import { hospital } from '../data/hospital.js'
import { useStore } from '../store.js'

export default function Controls() {
  const showLabels = useStore((s) => s.showLabels)
  const cutawayFloorOnly = useStore((s) => s.cutawayFloorOnly)
  const selectedFloorId = useStore((s) => s.selectedFloorId)
  const toggleLabels = useStore((s) => s.toggleLabels)
  const setCutaway = useStore((s) => s.setCutaway)
  const setFloor = useStore((s) => s.setFloor)

  const [open, setOpen] = useState(false)
  const menuRef = useRef(null)

  const currentLabel = cutawayFloorOnly
    ? hospital.floors.find((f) => f.id === selectedFloorId)?.name ?? 'Floor'
    : 'All floors'

  // Click-outside / Esc to close
  useEffect(() => {
    if (!open) return
    const onPointer = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false)
    }
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onPointer)
    document.addEventListener('touchstart', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onPointer)
      document.removeEventListener('touchstart', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const pickAll = () => {
    setCutaway(false)
    setOpen(false)
  }

  const pickFloor = (id) => {
    setFloor(id)
    setCutaway(true)
    setOpen(false)
  }

  return (
    <div className="controls">
      <button
        className={`toggle-btn ${showLabels ? 'on' : ''}`}
        onClick={toggleLabels}
        title="Toggle name labels in 3D"
      >
        Labels {showLabels ? 'ON' : 'OFF'}
      </button>

      <div className="view-menu" ref={menuRef}>
        <button
          className={`toggle-btn ${open ? 'on' : ''}`}
          onClick={() => setOpen((o) => !o)}
          title="Switch between all floors and a single floor"
        >
          <span className="view-menu-label">View:&nbsp;</span>
          <strong>{currentLabel}</strong>
          <span className="view-menu-caret">▾</span>
        </button>
        {open && (
          <div className="view-menu-pop" role="menu">
            <div className="view-menu-section">Mode</div>
            <button
              role="menuitemradio"
              aria-checked={!cutawayFloorOnly}
              className={`view-menu-item ${!cutawayFloorOnly ? 'active' : ''}`}
              onClick={pickAll}
            >
              <span className="view-menu-bullet" />
              <span>All floors</span>
              <span className="view-menu-meta">whole building</span>
            </button>

            <div className="view-menu-section">Single floor</div>
            {hospital.floors.map((f) => {
              const isActive = cutawayFloorOnly && selectedFloorId === f.id
              const occupied = f.rooms.reduce(
                (a, r) => a + r.beds.filter((b) => b.patientId).length,
                0,
              )
              const beds = f.rooms.reduce((a, r) => a + r.beds.length, 0)
              return (
                <button
                  role="menuitemradio"
                  aria-checked={isActive}
                  key={f.id}
                  className={`view-menu-item ${isActive ? 'active' : ''}`}
                  onClick={() => pickFloor(f.id)}
                >
                  <span className="view-menu-bullet" />
                  <span>{f.name}</span>
                  <span className="view-menu-meta">
                    {occupied}/{beds}
                  </span>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

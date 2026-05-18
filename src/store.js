import { create } from 'zustand'
import { hospital } from './data/hospital.js'

let eventCounter = 0

export const useStore = create((set, get) => ({
  // Top-level view
  view: 'city',
  // Cross-fade overlay between scenes
  showOverlay: false,
  overlayDirection: null, // 'to-hospital' | 'to-city'

  // Hospital scene state
  selectedFloorId: hospital.floors[0].id,
  selectedBedId: null,
  hoveredBedId: null,
  showLabels: true,
  cutawayFloorOnly: false,

  // Simulation state
  simulationRunning: false,
  // Time of day in minutes [0, 1440). Default to 09:00.
  timeOfDay: 9 * 60,
  toggleSimulation: () => set((s) => ({ simulationRunning: !s.simulationRunning })),
  setTime: (minutes) => set({ timeOfDay: ((minutes % 1440) + 1440) % 1440 }),

  // Live events feed. Newest-first; trimmed at 120.
  events: [],
  pushEvent: (ev) =>
    set((s) => ({
      events: [
        { id: ++eventCounter, ...ev },
        ...s.events,
      ].slice(0, 120),
    })),
  clearEvents: () => set({ events: [] }),

  // ---- Transitions ----
  beginEnterHospital: () => set({ showOverlay: true, overlayDirection: 'to-hospital' }),
  beginReturnToCity: () => set({ showOverlay: true, overlayDirection: 'to-city' }),
  swapView: () =>
    set((s) => ({
      view: s.overlayDirection === 'to-hospital' ? 'hospital' : 'city',
      cutawayFloorOnly: false,
      selectedBedId: null,
    })),
  clearOverlay: () => set({ showOverlay: false, overlayDirection: null }),

  returnToCity: () => get().beginReturnToCity(),

  // ---- Hospital scene ----
  setFloor: (id) => set({ selectedFloorId: id, selectedBedId: null }),
  selectBed: (bedId) => set({ selectedBedId: bedId }),
  closePanel: () => set({ selectedBedId: null }),
  setHovered: (bedId) => set({ hoveredBedId: bedId }),
  toggleLabels: () => set({ showLabels: !get().showLabels }),
  toggleCutaway: () => set({ cutawayFloorOnly: !get().cutawayFloorOnly }),
  setCutaway: (value) => set({ cutawayFloorOnly: value }),
}))

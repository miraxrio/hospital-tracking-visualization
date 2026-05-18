import { create } from 'zustand'
import { hospital } from './data/hospital.js'

export const useStore = create((set, get) => ({
  // Top-level view
  view: 'city',
  // Hospital info passed to CityCamera so it can fly the camera into the building.
  // Cleared once the transition is done.
  transitionTarget: null,
  // Cross-fade overlay (covers the swap moment between scenes).
  showOverlay: false,
  overlayDirection: null, // 'to-hospital' | 'to-city'

  // Hospital scene state
  selectedFloorId: hospital.floors[0].id,
  selectedBedId: null,
  hoveredBedId: null,
  showLabels: true,
  cutawayFloorOnly: false,

  // ---- Transitions ----
  flyToHospital: (info) => set({ transitionTarget: info }),
  // Called when the city camera has finished flying — kicks off the cross-fade
  beginEnterHospital: () => set({ showOverlay: true, overlayDirection: 'to-hospital' }),
  beginReturnToCity: () => set({ showOverlay: true, overlayDirection: 'to-city' }),
  // Run *under* the opaque overlay, after fade-in
  swapView: () =>
    set((s) => ({
      view: s.overlayDirection === 'to-hospital' ? 'hospital' : 'city',
      transitionTarget: null,
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

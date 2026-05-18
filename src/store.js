import { create } from 'zustand'
import { hospital } from './data/hospital.js'

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

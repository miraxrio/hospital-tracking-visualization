import { create } from 'zustand'
import { hospital } from './data/hospital.js'

export const useStore = create((set, get) => ({
  selectedFloorId: hospital.floors[0].id,
  selectedBedId: null,
  hoveredBedId: null,
  showLabels: true,
  cutawayFloorOnly: false,

  setFloor: (id) => set({ selectedFloorId: id, selectedBedId: null }),
  selectBed: (bedId) => set({ selectedBedId: bedId }),
  closePanel: () => set({ selectedBedId: null }),
  setHovered: (bedId) => set({ hoveredBedId: bedId }),
  toggleLabels: () => set({ showLabels: !get().showLabels }),
  toggleCutaway: () => set({ cutawayFloorOnly: !get().cutawayFloorOnly }),
  setCutaway: (value) => set({ cutawayFloorOnly: value }),
}))

import { create } from 'zustand'

interface UpdateState {
  version: string
  staged: boolean
  busy: boolean
  failed: boolean
  set: (patch: Partial<Omit<UpdateState, 'set'>>) => void
}

export const useUpdate = create<UpdateState>((set) => ({
  version: '',
  staged: false,
  busy: false,
  failed: false,
  set: (patch) => set(patch),
}))

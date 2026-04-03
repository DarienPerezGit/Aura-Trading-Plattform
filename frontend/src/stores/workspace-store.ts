import { create } from 'zustand'

interface WorkspaceState {
  currentView: string
  previousView: string | null
  navigate: (view: string) => void
  goBack: () => void
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  currentView: '/',
  previousView: null,

  navigate: (view) =>
    set((s) => ({
      currentView: view,
      previousView: s.currentView,
    })),
  goBack: () =>
    set((s) => ({
      currentView: s.previousView ?? '/',
      previousView: null,
    })),
}))

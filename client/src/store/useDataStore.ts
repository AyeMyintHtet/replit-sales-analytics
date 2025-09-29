import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

// Store slice types
interface UiState {
	isCollapsed: boolean
}

interface UiActions {
	setCollapsed: (collapsed: boolean) => void
	toggleCollapsed: () => void
}

export type DataStore = UiState & UiActions

const initialUiState: UiState = {
	isCollapsed: false,
}

export const useDataStore = create<DataStore>()(
	persist(
		(set, get) => ({
			...initialUiState,
			setCollapsed: (collapsed) => set({ isCollapsed: collapsed }),
			toggleCollapsed: () => set({ isCollapsed: !get().isCollapsed }),
		}),
		{
			name: 'app-data-store',
			storage: createJSONStorage(() => localStorage),
			partialize: (state) => ({
				isCollapsed: state.isCollapsed,
			}),
		}
	)
)

export const selectIsCollapsed = (state: DataStore) => state.isCollapsed
export const selectSetCollapsed = (state: DataStore) => state.setCollapsed
export const selectToggleCollapsed = (state: DataStore) => state.toggleCollapsed

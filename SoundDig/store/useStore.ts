import { create } from 'zustand';
import { Track } from '../services/mockServices';

// --- Settings Store ---
interface SettingsState {
    automationEnabled: boolean;
    setAutomationEnabled: (val: boolean) => void;
    // Mock connection states
    soundcloudConnected: boolean;
    spotifyConnected: boolean;
    deezerConnected: boolean;
    toggleConnection: (platform: 'soundcloud' | 'spotify' | 'deezer') => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
    automationEnabled: false,
    setAutomationEnabled: (val) => set({ automationEnabled: val }),

    soundcloudConnected: false,
    spotifyConnected: false,
    deezerConnected: false,
    toggleConnection: (platform) => set((state) => ({
        [`${platform}Connected`]: !state[`${platform}Connected`]
    })),
}));

// --- Flow State Store ---
// Used to pass data between Processing -> Track Selection -> Search & Dispatch without URL params limits
interface FlowState {
    incomingUrl: string | null;
    setIncomingUrl: (url: string | null) => void;

    foundTracks: Track[];
    setFoundTracks: (tracks: Track[]) => void;

    selectedTrackIds: string[];
    toggleSelectTrack: (id: string) => void;
    selectAllTracks: () => void;
    deselectAllTracks: () => void;

    clearFlow: () => void;
}

export const useFlowStore = create<FlowState>((set) => ({
    incomingUrl: null,
    setIncomingUrl: (url) => set({ incomingUrl: url }),

    foundTracks: [],
    setFoundTracks: (tracks) => set({ foundTracks: tracks, selectedTrackIds: tracks.map(t => t.id) }), // Auto select all initially ?

    selectedTrackIds: [],
    toggleSelectTrack: (id) => set((state) => {
        if (state.selectedTrackIds.includes(id)) {
            return { selectedTrackIds: state.selectedTrackIds.filter(tid => tid !== id) };
        } else {
            return { selectedTrackIds: [...state.selectedTrackIds, id] };
        }
    }),
    selectAllTracks: () => set((state) => ({ selectedTrackIds: state.foundTracks.map(t => t.id) })),
    deselectAllTracks: () => set({ selectedTrackIds: [] }),

    clearFlow: () => set({ incomingUrl: null, foundTracks: [], selectedTrackIds: [] }),
}));

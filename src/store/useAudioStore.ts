import { create } from 'zustand'

export type TrackId = 'kick' | 'snare' | 'hihat' | 'synth'

export interface TrackData {
  id: TrackId
  name: string
  color: string // tailwind color class
  steps: boolean[]
  volume: number // -60 to 0 (dB)
  mute: boolean
  solo: boolean
}

interface AudioState {
  // Global Audio Settings
  isPlaying: boolean
  bpm: number
  masterVolume: number // -60 to 0 (dB)
  currentStep: number
  
  // Grid Data
  tracks: Record<TrackId, TrackData>
  
  // Actions
  togglePlay: () => void
  setBpm: (bpm: number) => void
  setMasterVolume: (volume: number) => void
  setCurrentStep: (step: number) => void
  
  // Track Actions
  toggleStep: (trackId: TrackId, stepIndex: number) => void
  setTrackVolume: (trackId: TrackId, volume: number) => void
  toggleTrackMute: (trackId: TrackId) => void
  toggleTrackSolo: (trackId: TrackId) => void
  clearTrack: (trackId: TrackId) => void
  clearAllTracks: () => void
}

const createEmptySteps = () => new Array(16).fill(false)

const initialTracks: Record<TrackId, TrackData> = {
  kick: {
    id: 'kick',
    name: 'KICK',
    color: 'bg-cyber-pink',
    steps: createEmptySteps(),
    volume: -6,
    mute: false,
    solo: false,
  },
  snare: {
    id: 'snare',
    name: 'SNARE',
    color: 'bg-cyber-blue',
    steps: createEmptySteps(),
    volume: -6,
    mute: false,
    solo: false,
  },
  hihat: {
    id: 'hihat',
    name: 'HIHAT',
    color: 'bg-cyber-green',
    steps: createEmptySteps(),
    volume: -12,
    mute: false,
    solo: false,
  },
  synth: {
    id: 'synth',
    name: 'SYNTH',
    color: 'bg-cyber-purple',
    steps: createEmptySteps(),
    volume: -8,
    mute: false,
    solo: false,
  },
}

export const useAudioStore = create<AudioState>((set) => ({
  isPlaying: false,
  bpm: 120,
  masterVolume: 0,
  currentStep: 0,
  
  tracks: initialTracks,
  
  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
  setBpm: (bpm) => set({ bpm }),
  setMasterVolume: (masterVolume) => set({ masterVolume }),
  setCurrentStep: (currentStep) => set({ currentStep }),
  
  toggleStep: (trackId, stepIndex) => 
    set((state) => {
      const newSteps = [...state.tracks[trackId].steps]
      newSteps[stepIndex] = !newSteps[stepIndex]
      return {
        tracks: {
          ...state.tracks,
          [trackId]: {
            ...state.tracks[trackId],
            steps: newSteps
          }
        }
      }
    }),
    
  setTrackVolume: (trackId, volume) =>
    set((state) => ({
      tracks: {
        ...state.tracks,
        [trackId]: { ...state.tracks[trackId], volume }
      }
    })),
    
  toggleTrackMute: (trackId) =>
    set((state) => ({
      tracks: {
        ...state.tracks,
        [trackId]: { ...state.tracks[trackId], mute: !state.tracks[trackId].mute }
      }
    })),
    
  toggleTrackSolo: (trackId) =>
    set((state) => ({
      tracks: {
        ...state.tracks,
        [trackId]: { ...state.tracks[trackId], solo: !state.tracks[trackId].solo }
      }
    })),
    
  clearTrack: (trackId) =>
    set((state) => ({
      tracks: {
        ...state.tracks,
        [trackId]: { ...state.tracks[trackId], steps: createEmptySteps() }
      }
    })),
    
  clearAllTracks: () =>
    set((state) => {
      const newTracks = { ...state.tracks }
      ;(Object.keys(newTracks) as TrackId[]).forEach(id => {
        newTracks[id].steps = createEmptySteps()
      })
      return { tracks: newTracks }
    })
}))

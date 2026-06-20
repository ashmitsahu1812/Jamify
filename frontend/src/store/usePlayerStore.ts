import { create } from 'zustand';

export interface Track {
  _id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  audioUrl: string;
  coverUrl: string;
}

interface PlayerState {
  currentTrack: Track | null;
  queue: Track[];
  isPlaying: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  isMuted: boolean;
  setCurrentTrack: (track: Track) => void;
  setQueue: (queue: Track[]) => void;
  addToQueue: (track: Track) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setVolume: (volume: number) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  toggleMute: () => void;
  playNext: () => void;
  playPrevious: () => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentTrack: null,
  queue: [],
  isPlaying: false,
  volume: 0.5,
  currentTime: 0,
  duration: 0,
  isMuted: false,

  setCurrentTrack: (track) => set({ currentTrack: track, isPlaying: true, currentTime: 0 }),
  setQueue: (queue) => set({ queue }),
  addToQueue: (track) => set((state) => ({ queue: [...state.queue, track] })),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setVolume: (volume) => set({ volume }),
  setCurrentTime: (currentTime) => set({ currentTime }),
  setDuration: (duration) => set({ duration }),
  toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
  playNext: () => {
    const { queue } = get();
    if (queue.length > 0) {
      const nextTrack = queue[0];
      set({ currentTrack: nextTrack, queue: queue.slice(1), isPlaying: true, currentTime: 0 });
    }
  },
  playPrevious: () => {
    // Basic implementation: just reset time for now unless we keep a history
    set({ currentTime: 0 });
  }
}));

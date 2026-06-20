import { create } from 'zustand';
import { Socket } from 'socket.io-client';

interface ChatMessage {
  user: string;
  message: string;
  timestamp: number;
}

interface JamState {
  roomId: string | null;
  isHost: boolean;
  socket: Socket | null;
  participants: any[];
  chat: ChatMessage[];
  setRoomId: (id: string | null) => void;
  setIsHost: (isHost: boolean) => void;
  setSocket: (socket: Socket | null) => void;
  addMessage: (msg: ChatMessage) => void;
  setParticipants: (participants: any[]) => void;
  leaveRoom: () => void;
}

export const useJamStore = create<JamState>((set) => ({
  roomId: null,
  isHost: false,
  socket: null,
  participants: [],
  chat: [],
  
  setRoomId: (roomId) => set({ roomId }),
  setIsHost: (isHost) => set({ isHost }),
  setSocket: (socket) => set({ socket }),
  addMessage: (msg) => set((state) => ({ chat: [...state.chat, msg] })),
  setParticipants: (participants) => set({ participants }),
  leaveRoom: () => set({ roomId: null, isHost: false, participants: [], chat: [] })
}));

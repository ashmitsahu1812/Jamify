'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Plus } from 'lucide-react';

export default function JamPage() {
  const router = useRouter();
  const [joinId, setJoinId] = useState('');

  const createRoom = () => {
    const newRoomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    router.push(`/jam/${newRoomId}?host=true`);
  };

  const joinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (joinId.trim()) {
      router.push(`/jam/${joinId.trim().toUpperCase()}`);
    }
  };

  return (
    <div className="p-8 pb-32 flex flex-col items-center justify-center min-h-[80vh]">
      <div className="bg-[#181818] p-8 rounded-xl w-full max-w-md shadow-2xl border border-zinc-800 text-center">
        <Users size={48} className="text-[#1ED760] mx-auto mb-6" />
        <h1 className="text-3xl font-bold text-white mb-2">Jam Sessions</h1>
        <p className="text-zinc-400 mb-8">Listen to music synchronously with your friends.</p>
        
        <button 
          onClick={createRoom}
          className="w-full bg-[#1ED760] text-black font-bold py-3 rounded-full hover:scale-105 transition-transform flex items-center justify-center gap-2 mb-6"
        >
          <Plus size={20} /> Start a Jam Session
        </button>

        <div className="relative flex items-center justify-center mb-6">
          <div className="border-t border-zinc-700 w-full"></div>
          <span className="bg-[#181818] px-4 text-zinc-500 text-sm absolute">OR</span>
        </div>

        <form onSubmit={joinRoom} className="space-y-4">
          <input 
            type="text" 
            placeholder="Enter Room ID" 
            value={joinId}
            onChange={(e) => setJoinId(e.target.value)}
            className="w-full bg-[#2A2A2A] text-white border border-zinc-700 rounded-md p-3 outline-none focus:border-[#1ED760] focus:ring-1 focus:ring-[#1ED760] text-center font-mono tracking-widest uppercase"
          />
          <button 
            type="submit"
            disabled={!joinId.trim()}
            className="w-full bg-white text-black font-bold py-3 rounded-full hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100"
          >
            Join Session
          </button>
        </form>
      </div>
    </div>
  );
}

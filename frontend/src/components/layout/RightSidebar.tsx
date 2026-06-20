'use client';
import { useJamStore } from '@/store/useJamStore';
import { usePlayerStore } from '@/store/usePlayerStore';
import { Send, Users } from 'lucide-react';
import { useState } from 'react';

export function RightSidebar() {
  const { roomId, chat, addMessage, socket, participants } = useJamStore();
  const { queue } = usePlayerStore();
  const [msg, setMsg] = useState('');

  if (!roomId) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!msg.trim() || !socket) return;
    
    const newMsg = { user: 'Me', message: msg, timestamp: Date.now() };
    socket.emit('chat-message', { roomId, message: msg, user: 'Me' });
    addMessage(newMsg);
    setMsg('');
  };

  return (
    <aside className="w-80 bg-[#121212] border-l border-zinc-800 h-full flex flex-col p-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-white font-bold text-lg">Jam Session</h2>
        <span className="bg-[#1ED760] text-black text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
          <Users size={12} /> {participants.length + 1}
        </span>
      </div>

      <div className="flex-1 flex flex-col gap-4 overflow-hidden">
        {/* Queue Preview */}
        <div className="h-1/3 flex flex-col">
          <h3 className="text-zinc-400 text-sm font-semibold mb-2">Up Next in Room</h3>
          <ul className="overflow-y-auto space-y-2 flex-1">
            {queue.map((track, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-zinc-300">
                <img src={track.coverUrl} alt="cover" className="w-8 h-8 rounded" />
                <div className="truncate">
                  <p className="text-white truncate">{track.title}</p>
                  <p className="text-zinc-500 text-xs truncate">{track.artist}</p>
                </div>
              </li>
            ))}
            {queue.length === 0 && <p className="text-xs text-zinc-500">Queue is empty</p>}
          </ul>
        </div>

        {/* Live Chat */}
        <div className="flex-1 flex flex-col bg-[#181818] rounded-lg p-3">
          <h3 className="text-zinc-400 text-sm font-semibold mb-2">Live Chat</h3>
          <div className="flex-1 overflow-y-auto space-y-3 mb-3">
            {chat.map((c, i) => (
              <div key={i} className="text-sm">
                <span className="font-bold text-[#1ED760] mr-2">{c.user}:</span>
                <span className="text-zinc-300">{c.message}</span>
              </div>
            ))}
          </div>
          <form onSubmit={handleSend} className="relative">
            <input 
              type="text" 
              placeholder="Say something..." 
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              className="w-full bg-[#2A2A2A] text-sm text-white rounded-full py-2 pl-4 pr-10 outline-none focus:ring-1 focus:ring-[#1ED760]"
            />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white">
              <Send size={16} />
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}

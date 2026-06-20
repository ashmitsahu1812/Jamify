'use client';
import { useEffect, useState, useRef } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { io } from 'socket.io-client';
import { useJamStore } from '@/store/useJamStore';
import { usePlayerStore, Track } from '@/store/usePlayerStore';
import { useAuthStore } from '@/store/useAuthStore';
import { Users, Link as LinkIcon, Check, MessageSquare, Send, Search as SearchIcon, Play } from 'lucide-react';
import { API_URL } from '@/config';

export default function RoomPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const roomId = params.roomId as string;
  const isHostParam = searchParams.get('host') === 'true';
  
  const { setRoomId, setIsHost, setSocket, setParticipants, addParticipant, leaveRoom, chat, addMessage, socket } = useJamStore();
  const { queue, currentTrack, setCurrentTrack, setQueue } = usePlayerStore();
  const { user } = useAuthStore();
  const [copied, setCopied] = useState(false);
  const [chatInput, setChatInput] = useState('');
  
  // Host Search Feature
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Track[]>([]);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const delayDebounceFn = setTimeout(async () => {
      try {
        const res = await fetch(`${API_URL}/api/tracks/search?q=${searchQuery}`);
        const data = await res.json();
        setSearchResults(data);
      } catch (err) {
        console.error(err);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handlePlaySong = (track: Track) => {
    setCurrentTrack(track);
    setSearchQuery('');
    setSearchResults([]);
  };

  useEffect(() => {
    // Scroll to bottom of chat when new message arrives
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat]);

  useEffect(() => {
    // Connect to Socket.io Server
    const newSocket = io(API_URL);
    
    setSocket(newSocket);
    setRoomId(roomId);
    setIsHost(isHostParam);

    const userId = user?.username || Math.random().toString(36).substring(2, 9);
    
    newSocket.on('connect', () => {
      newSocket.emit('join-room', { roomId, userId });
    });

    newSocket.on('user-joined', (data) => {
      addParticipant(data);
    });

    newSocket.on('chat-message', (data) => {
      addMessage(data);
    });

    newSocket.on('track-sync', (track) => {
      if (!isHostParam) setCurrentTrack(track);
    });

    newSocket.on('queue-sync', (newQueue) => {
      if (!isHostParam) setQueue(newQueue);
    });

    newSocket.on('room-state-sync', (state) => {
      if (!isHostParam) {
        if (state.currentTrack) setCurrentTrack(state.currentTrack);
        if (state.queue) setQueue(state.queue);
      }
    });

    return () => {
      newSocket.disconnect();
      leaveRoom();
    };
  }, [roomId, isHostParam, user]);

  const copyLink = () => {
    const url = new URL(window.location.href);
    url.searchParams.delete('host');
    navigator.clipboard.writeText(url.toString());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !socket) return;
    socket.emit('chat-message', { roomId, message: chatInput, user: user?.username || 'Guest' });
    setChatInput('');
  };

  return (
    <div className="p-4 md:p-8 pb-32 max-w-6xl mx-auto flex flex-col md:flex-row gap-8 h-full">
      {/* Left Column: Player & Queue */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2 md:gap-3">
              <Users className="text-[#1ED760]" size={28} /> 
              Jam Session <span className="text-zinc-500 font-mono text-xl ml-2">#{roomId}</span>
            </h1>
            <p className="text-zinc-400 mt-2">
              {isHostParam ? "You are the host. You control the music." : "You are a guest. Music syncs automatically."}
            </p>
          </div>
          
          <button 
            onClick={copyLink}
            className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-full font-bold flex items-center gap-2 transition-colors"
          >
            {copied ? <Check size={18} className="text-[#1ED760]" /> : <LinkIcon size={18} />}
            {copied ? 'Copied' : 'Invite'}
          </button>
        </div>
        
        {!isHostParam && (
          <div className="bg-[#1ED760]/10 border border-[#1ED760]/30 text-white p-4 rounded-xl mb-8 flex items-start gap-3 relative z-10">
            <Play className="text-[#1ED760] shrink-0 mt-0.5" size={20} />
            <p className="text-sm">
              <span className="font-bold text-[#1ED760]">Browser Autoplay Blocked?</span> If you don't hear music immediately, manually tap the Play button at the bottom of your screen to join the synchronized audio!
            </p>
          </div>
        )}

        <div className="bg-[#181818] p-6 rounded-xl border border-zinc-800 mb-8 relative z-10">
          <h2 className="text-xl font-bold mb-4">Now Playing</h2>
          {currentTrack ? (
            <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 overflow-hidden">
              <img src={currentTrack.coverUrl} alt="Cover" className="w-48 h-48 md:w-32 md:h-32 rounded-lg shadow-2xl object-cover shrink-0" />
              <div className="w-full min-w-0 flex-1 text-center md:text-left overflow-hidden">
                <h3 className="text-xl md:text-2xl font-bold text-white truncate w-full">{currentTrack.title}</h3>
                <p className="text-base md:text-lg text-zinc-400 truncate w-full">{currentTrack.artist}</p>
              </div>
            </div>
          ) : (
            <p className="text-zinc-500 italic">No track currently playing. {isHostParam && "Play something to start."}</p>
          )}
        </div>
        
        {isHostParam && (
          <div className="mb-8 relative z-10">
            <h2 className="text-xl font-bold mb-4">Change Song</h2>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <SearchIcon className="h-5 w-5 text-zinc-400" />
              </div>
              <input
                type="text"
                placeholder="Search for a song to play..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#181818] text-white rounded-full py-3 pl-12 pr-4 border border-zinc-800 focus:border-[#1ED760] outline-none transition-colors"
              />
            </div>
            {searchResults.length > 0 && (
              <div className="absolute w-full mt-2 bg-[#181818] border border-zinc-800 rounded-xl shadow-2xl overflow-hidden max-h-64 overflow-y-auto z-20">
                {searchResults.map((track) => (
                  <div 
                    key={track._id} 
                    className="flex items-center p-3 hover:bg-[#282828] cursor-pointer transition-colors group"
                    onClick={() => handlePlaySong(track)}
                  >
                    <img src={track.coverUrl} alt={track.title} className="w-10 h-10 rounded mr-3" />
                    <div className="flex-1 min-w-0" onClick={() => handlePlaySong(track)}>
                      <p className="text-white font-semibold truncate group-hover:text-[#1ED760] transition-colors">{track.title}</p>
                      <p className="text-zinc-400 text-sm truncate">{track.artist}</p>
                    </div>
                    <button 
                      onClick={() => handlePlaySong(track)}
                      className="w-8 h-8 flex items-center justify-center bg-[#1ED760] rounded-full text-black opacity-0 group-hover:opacity-100 transition-opacity mr-2 hover:scale-105"
                      title="Play Now"
                    >
                      <Play size={14} fill="currentColor" className="ml-0.5" />
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        addToQueue(track);
                        setSearchQuery('');
                        setSearchResults([]);
                      }}
                      className="w-8 h-8 flex items-center justify-center bg-zinc-800 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-zinc-700 hover:scale-105"
                      title="Add to Queue"
                    >
                      +
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        <div className="flex-1 lg:hidden">
          <h2 className="text-xl font-bold mb-4">Queue</h2>
          <div className="space-y-2 mb-8">
            {queue.map((track, i) => (
              <div key={i} className="flex items-center p-3 bg-[#181818] rounded-lg border border-zinc-800">
                <img src={track.coverUrl} alt={track.title} className="w-10 h-10 rounded mr-3" />
                <div>
                  <p className="text-white font-semibold text-sm truncate">{track.title}</p>
                  <p className="text-zinc-400 text-xs truncate">{track.artist}</p>
                </div>
              </div>
            ))}
            {queue.length === 0 && (
              <p className="text-zinc-500 italic text-sm">Queue is empty.</p>
            )}
          </div>
        </div>
      </div>

      {/* Right Column: Chat Room (Hidden on Desktop, as RightSidebar handles it) */}
      <div className="w-full md:w-80 bg-[#181818] border border-zinc-800 rounded-xl flex-col shrink-0 h-[400px] md:h-[calc(100vh-200px)] flex lg:hidden">
        <div className="p-4 border-b border-zinc-800 flex items-center gap-2 font-bold">
          <MessageSquare size={18} /> Room Chat
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {chat.length === 0 ? (
            <div className="text-center text-zinc-500 text-sm mt-10">
              Say hi to the room!
            </div>
          ) : (
            chat.map((msg, i) => (
              <div key={i} className={`flex flex-col ${msg.user === user?.username ? 'items-end' : 'items-start'}`}>
                <span className="text-xs text-zinc-500 mb-1">{msg.user}</span>
                <div className={`px-3 py-2 rounded-xl text-sm max-w-[85%] break-words ${
                  msg.user === user?.username ? 'bg-[#1ED760] text-black' : 'bg-[#2A2A2A] text-white'
                }`}>
                  {msg.message}
                </div>
              </div>
            ))
          )}
          <div ref={chatEndRef} />
        </div>

        <form onSubmit={sendChat} className="p-3 border-t border-zinc-800 flex gap-2">
          <input 
            type="text" 
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-[#2A2A2A] text-white text-sm rounded-full px-4 py-2 outline-none focus:ring-1 focus:ring-[#1ED760]"
          />
          <button 
            type="submit"
            disabled={!chatInput.trim()}
            className="w-10 h-10 flex items-center justify-center bg-[#1ED760] text-black rounded-full disabled:opacity-50 hover:scale-105 transition-transform shrink-0"
          >
            <Send size={16} className="mr-0.5" />
          </button>
        </form>
      </div>
    </div>
  );
}

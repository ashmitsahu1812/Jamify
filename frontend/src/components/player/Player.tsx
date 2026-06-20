'use client';
import { usePlayerStore } from '@/store/usePlayerStore';
import { useJamStore } from '@/store/useJamStore';
import { useAuthStore } from '@/store/useAuthStore';
import { Play, Pause, SkipForward, SkipBack, Repeat, Shuffle, Volume2, VolumeX, Mic2, Heart, Plus } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import YouTube, { YouTubePlayer } from 'react-youtube';
import { API_URL } from '@/config';

const formatTime = (secs: number) => {
  if (!secs) return '0:00';
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
};

export function Player() {
  const { 
    currentTrack, isPlaying, setIsPlaying, currentTime, setCurrentTime,
    duration, setDuration, volume, setVolume, isMuted, toggleMute, playNext
  } = usePlayerStore();
  const { roomId, socket, isHost } = useJamStore();
  const { user } = useAuthStore();
  const [isLiked, setIsLiked] = useState(false);
  const [showPlaylists, setShowPlaylists] = useState(false);
  const [playlists, setPlaylists] = useState<any[]>([]);
  
  const playerRef = useRef<YouTubePlayer>(null);
  const isSeekingRef = useRef(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Progress Tracker
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(async () => {
        if (playerRef.current && !isSeekingRef.current) {
          const time = await playerRef.current.getCurrentTime();
          setCurrentTime(time);
        }
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isPlaying, setCurrentTime]);

  // Volume Sync
  useEffect(() => {
    if (playerRef.current) {
      if (isMuted) playerRef.current.mute();
      else {
        playerRef.current.unMute();
        playerRef.current.setVolume(volume * 100);
      }
    }
  }, [volume, isMuted, currentTrack]);

    // Play/Pause Sync
  useEffect(() => {
    if (!playerRef.current) return;
    if (isPlaying) playerRef.current.playVideo();
    else playerRef.current.pauseVideo();
  }, [isPlaying, currentTrack]);

  // Host Syncing (Track and Queue changes)
  useEffect(() => {
    if (roomId && socket && isHost && currentTrack) {
      socket.emit('track-change', { roomId, track: currentTrack });
    }
  }, [currentTrack, roomId, socket, isHost]);

  const { queue } = usePlayerStore();
  useEffect(() => {
    if (roomId && socket && isHost) {
      socket.emit('queue-change', { roomId, queue });
    }
  }, [queue, roomId, socket, isHost]);

  // Check if current track is liked and fetch playlists
  useEffect(() => {
    if (!user || !currentTrack) return;
    fetch(`${API_URL}/api/auth/${user._id}/likes`)
      .then(res => res.json())
      .then(data => {
        setIsLiked(data.some((t: any) => t._id === currentTrack._id));
      })
      .catch(console.error);
      
    fetch(`${API_URL}/api/playlists/user/${user._id}`)
      .then(res => res.json())
      .then(data => setPlaylists(data))
      .catch(console.error);
  }, [currentTrack, user]);

  const toggleLike = async () => {
    if (!user || !currentTrack) return;
    const endpoint = isLiked ? 'unlike' : 'like';
    try {
      const res = await fetch(`${API_URL}/api/auth/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user._id, track: currentTrack })
      });
      if (res.ok) {
        setIsLiked(!isLiked);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleTogglePlaylists = () => {
    if (!showPlaylists && user) {
      fetch(`${API_URL}/api/playlists/user/${user._id}`)
        .then(res => res.json())
        .then(data => setPlaylists(data))
        .catch(console.error);
    }
    setShowPlaylists(!showPlaylists);
  };

  const addToPlaylist = async (playlistId: string) => {
    if (!user || !currentTrack) return;
    try {
      const res = await fetch(`${API_URL}/api/playlists/${playlistId}/tracks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ track: currentTrack })
      });
      if (res.ok) {
        setShowPlaylists(false);
        alert('Added to playlist!');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePlayPause = () => {
    const newState = !isPlaying;
    setIsPlaying(newState);
    
    if (roomId && socket && isHost) {
      socket.emit('player-state-change', { 
        roomId, 
        state: { isPlaying: newState, currentTime: currentTime } 
      });
    }
  };

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    isSeekingRef.current = true;
    setCurrentTime(parseFloat(e.target.value));
  };

  const handleSeekMouseUp = (e: React.MouseEvent<HTMLInputElement> | React.TouchEvent<HTMLInputElement>) => {
    isSeekingRef.current = false;
    const time = parseFloat((e.target as HTMLInputElement).value);
    if (playerRef.current) {
      playerRef.current.seekTo(time, true);
    }
    if (roomId && socket && isHost) {
      socket.emit('player-state-change', { roomId, state: { currentTime: time, isPlaying } });
    }
  };

  // Listen for socket sync events
  useEffect(() => {
    if (!socket || isHost) return;

    const handleSync = async (state: any) => {
      if (state.currentTime !== undefined && playerRef.current && !isSeekingRef.current) {
        const pTime = await playerRef.current.getCurrentTime();
        const diff = Math.abs(pTime - state.currentTime);
        if (diff > 0.5) playerRef.current.seekTo(state.currentTime, true);
      }
      if (state.isPlaying !== undefined) setIsPlaying(state.isPlaying);
    };

    socket.on('player-state-sync', handleSync);
    return () => { socket.off('player-state-sync', handleSync); };
  }, [socket, isHost]);

  if (!currentTrack) return null;

  return (
    <div className="h-24 bg-[#181818] border-t border-zinc-800 flex items-center justify-between px-4 fixed bottom-0 w-full z-50">
      <YouTube
        videoId={currentTrack._id}
        opts={{
          height: '0',
          width: '0',
          playerVars: { autoplay: isPlaying ? 1 : 0, controls: 0, disablekb: 1 }
        }}
        onReady={(e) => {
          playerRef.current = e.target;
          setDuration(currentTrack.duration); // YouTube API sometimes delays duration, use the one from search
          if (isMuted) e.target.mute();
          else e.target.setVolume(volume * 100);
          if (isPlaying) e.target.playVideo();
        }}
        onEnd={playNext}
        className="absolute opacity-0 pointer-events-none"
      />
      {/* Left: Track Info */}
      <div className="flex items-center w-1/4 min-w-[180px]">
        <img src={currentTrack.coverUrl} alt="Cover" className="w-14 h-14 rounded-md shadow-lg" />
        <div className="ml-4 truncate">
          <p className="text-white text-sm font-semibold hover:underline cursor-pointer truncate">{currentTrack.title}</p>
          <p className="text-zinc-400 text-xs hover:underline cursor-pointer truncate">{currentTrack.artist}</p>
        </div>
        {user && (
          <div className="flex items-center ml-4 relative">
            <button onClick={toggleLike} className="text-zinc-400 hover:text-white hover:scale-110 transition-transform mr-3">
              <Heart size={18} fill={isLiked ? "#1ED760" : "transparent"} color={isLiked ? "#1ED760" : "currentColor"} />
            </button>
            <button onClick={handleTogglePlaylists} className={`hover:text-white hover:scale-110 transition-transform ${showPlaylists ? 'text-white' : 'text-zinc-400'}`}>
              <Plus size={18} />
            </button>
            
            {showPlaylists && (
              <div className="absolute bottom-10 left-8 bg-[#282828] border border-zinc-700 rounded-md shadow-xl py-2 w-48 z-50">
                <p className="text-xs font-bold text-zinc-400 px-3 mb-2 uppercase">Add to playlist</p>
                {playlists.length > 0 ? (
                  playlists.map(pl => (
                    <button 
                      key={pl._id}
                      onClick={() => addToPlaylist(pl._id)}
                      className="w-full text-left px-3 py-2 text-sm text-white hover:bg-white/10 truncate"
                    >
                      {pl.name}
                    </button>
                  ))
                ) : (
                  <p className="text-xs text-zinc-500 px-3 py-2 italic">No playlists created yet.</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Center: Controls */}
      <div className="flex flex-col items-center justify-center w-2/4 max-w-2xl">
        <div className="flex items-center gap-6 mb-2">
          <button className="text-zinc-400 hover:text-white"><Shuffle size={18} /></button>
          <button className="text-zinc-400 hover:text-white"><SkipBack size={20} /></button>
          <button onClick={handlePlayPause} className="w-8 h-8 flex items-center justify-center bg-white rounded-full text-black hover:scale-105 transition-transform">
            {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-1" />}
          </button>
          <button onClick={playNext} className="text-zinc-400 hover:text-white"><SkipForward size={20} /></button>
          <button className="text-zinc-400 hover:text-white"><Repeat size={18} /></button>
        </div>
        
        <div className="flex items-center w-full gap-2 text-xs text-zinc-400">
          <span className="w-10 text-right">{formatTime(currentTime)}</span>
          <input 
            type="range" 
            min={0} 
            max={duration || 100} 
            value={currentTime} 
            onChange={handleSeekChange}
            onMouseUp={handleSeekMouseUp}
            onTouchEnd={handleSeekMouseUp}
            className="flex-1 h-1 bg-zinc-600 rounded-lg appearance-none cursor-pointer accent-[#1ED760]"
          />
          <span className="w-10">{formatTime(duration)}</span>
        </div>
      </div>

      {/* Right: Volume & Extras */}
      <div className="flex items-center justify-end w-1/4 min-w-[180px] gap-3 text-zinc-400">
        {roomId && <Mic2 size={18} className="text-[#1ED760]" />}
        <button onClick={toggleMute} className="hover:text-white">
          {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>
        <input 
          type="range" 
          min={0} max={1} step={0.01} 
          value={isMuted ? 0 : volume} 
          onChange={(e) => setVolume(parseFloat(e.target.value))}
          className="w-24 h-1 bg-zinc-600 rounded-lg appearance-none cursor-pointer accent-white hover:accent-[#1ED760]"
        />
      </div>
    </div>
  );
}

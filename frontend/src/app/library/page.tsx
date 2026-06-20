'use client';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { usePlayerStore, Track } from '@/store/usePlayerStore';
import { Heart, Play } from 'lucide-react';
import { motion } from 'framer-motion';
import { API_URL } from '@/config';

export default function LibraryPage() {
  const { user } = useAuthStore();
  const { setCurrentTrack, setQueue } = usePlayerStore();
  const [likedTracks, setLikedTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetch(`${API_URL}/api/auth/${user._id}/likes`)
        .then((res) => res.json())
        .then((data) => {
          setLikedTracks(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [user]);

  const handlePlay = (track: Track) => {
    setCurrentTrack(track);
    const trackIndex = likedTracks.findIndex(t => t._id === track._id);
    setQueue(likedTracks.slice(trackIndex + 1));
  };

  const removeLike = async (e: React.MouseEvent, trackId: string) => {
    e.stopPropagation();
    if (!user) return;
    try {
      const res = await fetch(`${API_URL}/api/auth/unlike`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user._id, trackId })
      });
      if (res.ok) {
        setLikedTracks(prev => prev.filter(t => t._id !== trackId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!user) {
    return (
      <div className="p-8 pb-32 flex flex-col items-center justify-center min-h-[80vh]">
        <Heart size={64} className="text-zinc-600 mb-6" />
        <h1 className="text-3xl font-bold text-white mb-4 text-center">Log in to view your library</h1>
        <p className="text-zinc-400 text-center max-w-md">Save your favorite tracks and build your personal collection.</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-8 pb-32 max-w-7xl mx-auto"
    >
      <div className="flex items-end gap-6 mb-8 mt-12">
        <div className="w-48 h-48 bg-gradient-to-br from-indigo-600 to-purple-800 shadow-2xl flex items-center justify-center">
          <Heart size={64} fill="currentColor" className="text-white drop-shadow-xl" />
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-zinc-300">Playlist</p>
          <h1 className="text-6xl font-black text-white mt-2 mb-4 tracking-tighter">Liked Songs</h1>
          <div className="flex items-center gap-2 text-sm text-zinc-300 font-semibold">
            <span className="text-white">{user.username}</span>
            <span>•</span>
            <span>{likedTracks.length} songs</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-zinc-400">Loading your library...</div>
      ) : likedTracks.length > 0 ? (
        <div className="w-full">
          <div className="grid grid-cols-12 gap-4 border-b border-zinc-800 pb-2 mb-4 px-4 text-sm font-semibold text-zinc-400 tracking-wider">
            <div className="col-span-1 text-center">#</div>
            <div className="col-span-5">Title</div>
            <div className="col-span-4">Album</div>
            <div className="col-span-2 text-right">Action</div>
          </div>
          
          <div className="space-y-1">
            {likedTracks.map((track, i) => (
              <div 
                key={track._id} 
                onClick={() => handlePlay(track)}
                className="grid grid-cols-12 gap-4 items-center p-3 rounded-md hover:bg-white/10 transition-colors group cursor-pointer"
              >
                <div className="col-span-1 text-center text-zinc-400 group-hover:hidden">{i + 1}</div>
                <div className="col-span-1 text-center hidden group-hover:flex justify-center text-white">
                  <Play size={16} fill="currentColor" />
                </div>
                
                <div className="col-span-5 flex items-center gap-4 min-w-0">
                  <img src={track.coverUrl} alt="cover" className="w-10 h-10 object-cover" />
                  <div className="min-w-0">
                    <p className="text-white font-semibold truncate">{track.title}</p>
                    <p className="text-zinc-400 text-sm truncate">{track.artist}</p>
                  </div>
                </div>
                
                <div className="col-span-4 text-zinc-400 text-sm truncate">
                  {track.album || 'Single'}
                </div>
                
                <div className="col-span-2 flex justify-end text-sm">
                  <button onClick={(e) => removeLike(e, track._id)} className="text-[#1ED760] hover:scale-110 transition-transform">
                    <Heart size={18} fill="currentColor" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-zinc-400 mt-12 text-lg">
          You haven't liked any songs yet. Go explore!
        </div>
      )}
    </motion.div>
  );
}

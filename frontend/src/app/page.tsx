'use client';
import { useEffect, useState } from 'react';
import { usePlayerStore, Track } from '@/store/usePlayerStore';
import { Play } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/useAuthStore';
import { API_URL } from '@/config';

export default function Home() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const { setCurrentTrack, setQueue, currentTrack, isPlaying } = usePlayerStore();
  const { user } = useAuthStore();

  const [filter, setFilter] = useState<'All' | 'Music' | 'Podcasts'>('All');

  useEffect(() => {
    // Fetch mock tracks from backend
    fetch(`${API_URL}/api/tracks`)
      .then((res) => res.json())
      .then((data) => setTracks(data))
      .catch((err) => console.error(err));
  }, []);

  const handlePlay = (track: Track) => {
    setCurrentTrack(track);
    // Set rest of the tracks as queue
    const trackIndex = tracks.findIndex(t => t._id === track._id);
    setQueue(tracks.slice(trackIndex + 1));
  };

  return (
    <div className="relative min-h-full pb-32">
      {/* Background Gradient */}
      <div className="absolute top-0 left-0 right-0 h-80 bg-gradient-to-b from-[#3E1A11] via-[#121212]/80 to-[#121212] -z-10 pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="px-6 pt-4"
      >
        {/* Filter Chips */}
        <div className="flex items-center gap-2 mb-6">
          <button 
            onClick={() => setFilter('All')} 
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${filter === 'All' ? 'bg-white text-black' : 'bg-white/10 text-white hover:bg-white/20'}`}
          >
            All
          </button>
          <button 
            onClick={() => setFilter('Music')} 
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${filter === 'Music' ? 'bg-white text-black' : 'bg-white/10 text-white hover:bg-white/20'}`}
          >
            Music
          </button>
          <button 
            onClick={() => setFilter('Podcasts')} 
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${filter === 'Podcasts' ? 'bg-white text-black' : 'bg-white/10 text-white hover:bg-white/20'}`}
          >
            Podcasts
          </button>
        </div>

        {filter === 'Podcasts' ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <h2 className="text-2xl font-bold text-white mb-2">No Podcasts Found</h2>
            <p className="text-zinc-400">Podcasts aren't available in this Jamify clone right now. Try exploring Music!</p>
          </div>
        ) : (
          <>
            {/* Top 8 Grid (Recent/Greeting) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
              {tracks.slice(0, 8).map((track) => (
                <div 
                  key={track._id} 
                  className="flex items-center bg-white/10 hover:bg-white/20 transition-colors rounded-md overflow-hidden cursor-pointer group h-14 relative"
                  onClick={() => handlePlay(track)}
                >
                  <img src={track.coverUrl} alt={track.title} className="w-14 h-14 shadow-md object-cover shrink-0" />
                  <div className="px-4 flex-1 font-bold text-sm text-white line-clamp-2">{track.title}</div>
                  <div className="absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="w-10 h-10 flex items-center justify-center bg-[#1ED760] rounded-full text-black hover:scale-105 transition-transform shadow-lg">
                      <Play size={20} fill="currentColor" className="ml-1" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Made for You Section */}
            <div className="flex items-end justify-between mb-4">
              <div>
                <h3 className="text-sm text-zinc-400 hover:underline cursor-pointer">Made For</h3>
                <h2 className="text-2xl font-bold text-white hover:underline cursor-pointer">{user ? user.username : 'You'}</h2>
              </div>
              <span className="text-sm font-bold text-zinc-400 hover:underline cursor-pointer">Show all</span>
            </div>
            
            <div className="flex overflow-x-auto gap-5 pb-4 hide-scrollbar">
              {tracks.map((track) => (
                <div 
                  key={`made-${track._id}`} 
                  className="w-44 bg-[#181818] hover:bg-[#282828] p-3.5 rounded-lg transition-colors cursor-pointer group relative shrink-0"
                  onClick={() => handlePlay(track)}
                >
                  <div className="relative mb-4">
                    <img src={track.coverUrl} alt={track.title} className="w-full aspect-square object-cover rounded-md shadow-lg" />
                    <button className="absolute bottom-2 right-2 w-12 h-12 flex items-center justify-center bg-[#1ED760] rounded-full text-black opacity-0 group-hover:opacity-100 group-hover:translate-y-0 translate-y-2 hover:scale-105 transition-all shadow-xl z-10">
                      <Play size={24} fill="currentColor" className="ml-1" />
                    </button>
                  </div>
                  <h3 className="font-bold text-white truncate mb-1">{track.title}</h3>
                  <p className="text-sm text-zinc-400 line-clamp-2">{track.artist}</p>
                </div>
              ))}
            </div>

            {/* Jump back in Section */}
            <div className="mt-8">
              <div className="flex items-end justify-between mb-4">
                <h2 className="text-2xl font-bold text-white hover:underline cursor-pointer">Jump back in</h2>
                <span className="text-sm font-bold text-zinc-400 hover:underline cursor-pointer">Show all</span>
              </div>
              
              <div className="flex overflow-x-auto gap-5 pb-4 hide-scrollbar">
                {tracks.slice().reverse().map((track) => (
                  <div 
                    key={`jump-${track._id}`} 
                    className="w-44 bg-[#181818] hover:bg-[#282828] p-3.5 rounded-lg transition-colors cursor-pointer group relative shrink-0"
                    onClick={() => handlePlay(track)}
                  >
                    <div className="relative mb-4">
                      <img src={track.coverUrl} alt={track.title} className="w-full aspect-square object-cover rounded-md shadow-lg" />
                      <button className="absolute bottom-2 right-2 w-12 h-12 flex items-center justify-center bg-[#1ED760] rounded-full text-black opacity-0 group-hover:opacity-100 group-hover:translate-y-0 translate-y-2 hover:scale-105 transition-all shadow-xl z-10">
                        <Play size={24} fill="currentColor" className="ml-1" />
                      </button>
                    </div>
                    <h3 className="font-bold text-white truncate mb-1">{track.title}</h3>
                    <p className="text-sm text-zinc-400 line-clamp-2">{track.artist}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

      </motion.div>
    </div>
  );
}

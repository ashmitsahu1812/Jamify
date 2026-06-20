'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { usePlayerStore, Track } from '@/store/usePlayerStore';
import { Play, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { API_URL } from '@/config';

const formatTime = (secs: number) => {
  if (!secs) return '0:00';
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
};

export default function PlaylistPage() {
  const { id } = useParams();
  const [playlist, setPlaylist] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { setCurrentTrack, setQueue } = usePlayerStore();

  useEffect(() => {
    if (!id) return;
    fetch(`${API_URL}/api/playlists/${id}`)
      .then(res => res.json())
      .then(data => {
        setPlaylist(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  const handlePlay = (track: Track, index: number) => {
    setCurrentTrack(track);
    setQueue(playlist.tracks.slice(index + 1));
  };

  const handlePlayAll = () => {
    if (!playlist?.tracks?.length) return;
    setCurrentTrack(playlist.tracks[0]);
    setQueue(playlist.tracks.slice(1));
  };

  if (loading) return <div className="p-8 text-white font-bold">Loading...</div>;
  if (!playlist) return <div className="p-8 text-white font-bold">Playlist not found</div>;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pb-32"
    >
      {/* Header */}
      <div className="flex items-end gap-6 p-8 bg-gradient-to-b from-[#1ED760]/30 to-black/40">
        <img 
          src={playlist.coverUrl || 'https://misc.scdn.co/liked-songs/liked-songs-300.png'} 
          alt="Cover" 
          className="w-52 h-52 shadow-2xl object-cover rounded-md"
        />
        <div className="flex flex-col gap-2">
          <span className="text-sm font-bold uppercase">Playlist</span>
          <h1 className="text-7xl font-black text-white mb-4 tracking-tighter">{playlist.name}</h1>
          <p className="text-zinc-300 font-semibold text-sm">
            {playlist.tracks.length} songs
          </p>
        </div>
      </div>

      {/* Action Bar */}
      <div className="p-8 flex items-center gap-6">
        <button 
          onClick={handlePlayAll}
          className="w-14 h-14 bg-[#1ED760] rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-xl"
        >
          <Play size={28} fill="black" className="text-black ml-1" />
        </button>
      </div>

      {/* Tracklist */}
      <div className="px-8">
        <div className="flex text-zinc-400 border-b border-zinc-800 pb-2 mb-4 text-sm font-semibold uppercase tracking-wider">
          <div className="w-12 text-center">#</div>
          <div className="flex-1">Title</div>
          <div className="w-16 flex justify-end pr-8"><Clock size={16} /></div>
        </div>

        <div className="flex flex-col">
          {playlist.tracks.map((track: Track, index: number) => (
            <div 
              key={track._id}
              onClick={() => handlePlay(track, index)}
              className="flex items-center text-zinc-400 hover:bg-white/10 rounded-md py-2 cursor-pointer group transition-colors"
            >
              <div className="w-12 text-center group-hover:hidden">{index + 1}</div>
              <div className="w-12 text-center hidden group-hover:flex justify-center text-white"><Play size={16} fill="currentColor" /></div>
              <div className="flex-1 flex items-center gap-4">
                <img src={track.coverUrl} className="w-10 h-10 object-cover rounded-sm" />
                <div className="flex flex-col">
                  <span className="text-white font-semibold truncate group-hover:text-[#1ED760]">{track.title}</span>
                  <span className="text-sm truncate">{track.artist}</span>
                </div>
              </div>
              <div className="w-16 text-right pr-8 text-sm">{formatTime(track.duration)}</div>
            </div>
          ))}
          {playlist.tracks.length === 0 && (
            <div className="text-center text-zinc-500 mt-12 font-semibold">
              This playlist is empty. Go find some tracks to add!
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

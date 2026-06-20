'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { usePlayerStore, Track } from '@/store/usePlayerStore';
import { Play } from 'lucide-react';
import { motion } from 'framer-motion';
import { API_URL } from '@/config';

import { Suspense } from 'react';

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<Track[]>([]);
  const [suggested, setSuggested] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);
  const { setCurrentTrack, setQueue } = usePlayerStore();

  useEffect(() => {
    // Fetch default suggested tracks for when search is empty
    fetch(`${API_URL}/api/tracks`)
      .then(res => res.json())
      .then(data => setSuggested(data.slice(0, 10)))
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    const fetchResults = async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/api/tracks/search?q=${query}`);
        const data = await res.json();
        setResults(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      fetchResults();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handlePlay = (track: Track, list: Track[]) => {
    setCurrentTrack(track);
    const trackIndex = list.findIndex(t => t._id === track._id);
    setQueue(list.slice(trackIndex + 1));
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-8 pb-32 max-w-7xl mx-auto"
    >
      {!query && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-6 text-white">Suggested for you</h2>
          <div className="flex overflow-x-auto gap-5 pb-4 hide-scrollbar">
            {suggested.map((track) => (
              <div 
                key={`suggested-${track._id}`} 
                className="w-44 bg-[#181818] hover:bg-[#282828] p-3.5 rounded-lg transition-colors cursor-pointer group relative shrink-0"
                onClick={() => handlePlay(track, suggested)}
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
      )}

      {query && (
        <h2 className="text-2xl font-bold mb-6">
          {loading ? 'Searching...' : `Search results for "${query}"`}
        </h2>
      )}

      {results.length > 0 && (
        <div className="flex overflow-x-auto gap-6 pb-4 hide-scrollbar">
          {results.map((track) => (
            <div 
              key={track._id} 
              className="w-44 bg-[#181818] hover:bg-[#282828] p-3.5 rounded-lg transition-colors cursor-pointer group relative shrink-0"
              onClick={() => handlePlay(track, results)}
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
      )}

      {query && !loading && results.length === 0 && (
        <div className="text-zinc-400 text-center mt-12">
          No results found for "{query}".
        </div>
      )}
    </motion.div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-8 text-white font-bold">Loading search...</div>}>
      <SearchContent />
    </Suspense>
  );
}

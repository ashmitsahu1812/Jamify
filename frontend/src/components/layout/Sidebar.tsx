'use client';
import Link from 'next/link';
import { Home, Search, Library, PlusSquare, Users } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { API_URL } from '@/config';

import { useEffect, useState } from 'react';

export function Sidebar() {
  const { user, logout } = useAuthStore();
  const [playlists, setPlaylists] = useState<any[]>([]);

  const fetchPlaylists = async () => {
    if (!user) return;
    try {
      const res = await fetch(`${API_URL}/api/playlists/user/${user._id}`);
      const data = await res.json();
      setPlaylists(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPlaylists();
  }, [user]);

  const handleCreatePlaylist = async () => {
    if (!user) return alert('Please log in to create a playlist');
    const name = prompt('Enter playlist name:');
    if (!name) return;
    try {
      const res = await fetch(`${API_URL}/api/playlists`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, creator: user._id })
      });
      if (res.ok) fetchPlaylists();
    } catch (err) {
      console.error(err);
    }
  };
  
  return (
    <aside className="w-64 bg-[#000000] h-full flex flex-col p-6 space-y-6">
      <div className="text-white font-bold text-2xl tracking-tighter mb-4">Jamify</div>
      
      <nav className="space-y-4">
        <Link href="/" className="flex items-center text-zinc-400 hover:text-white transition-colors gap-4 font-semibold">
          <Home size={24} /> Home
        </Link>
        <Link href="/search" className="flex items-center text-zinc-400 hover:text-white transition-colors gap-4 font-semibold">
          <Search size={24} /> Search
        </Link>
        <Link href="/library" className="flex items-center text-zinc-400 hover:text-white transition-colors gap-4 font-semibold">
          <Library size={24} /> Your Library
        </Link>
      </nav>

      <div className="pt-6 border-t border-zinc-800 space-y-4">
        <button onClick={handleCreatePlaylist} className="flex items-center text-zinc-400 hover:text-white transition-colors gap-4 font-semibold w-full">
          <PlusSquare size={24} /> Create Playlist
        </button>
        <Link href="/jam" className="flex items-center text-zinc-400 hover:text-[#1ED760] transition-colors gap-4 font-semibold">
          <Users size={24} /> Jam Rooms
        </Link>
      </div>
      
      <div className="flex-1 overflow-y-auto mt-4 border-t border-zinc-800 pt-4 hide-scrollbar">
        <p className="text-xs font-semibold text-zinc-400 tracking-wider mb-3">PLAYLISTS</p>
        <ul className="space-y-3 mb-8">
          {playlists.map(pl => (
            <li key={pl._id} className="text-sm text-zinc-400 hover:text-white cursor-pointer truncate">
              <Link href={`/playlist/${pl._id}`}>{pl.name}</Link>
            </li>
          ))}
          {!user && <li className="text-sm text-zinc-500 italic">Log in to view playlists</li>}
        </ul>
      </div>

      {/* Auth Section */}
      <div className="mt-auto border-t border-zinc-800 pt-4">
        {user ? (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-zinc-800 rounded-full flex items-center justify-center font-bold text-[#1ED760]">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <div className="text-sm text-white font-bold truncate">{user.username}</div>
            </div>
            <button 
              onClick={logout}
              className="text-xs text-zinc-400 hover:text-white text-left font-semibold transition-colors w-max"
            >
              Log out
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <Link 
              href="/register" 
              className="w-full text-center text-sm text-white font-bold hover:scale-105 transition-transform"
            >
              Sign up
            </Link>
            <Link 
              href="/login" 
              className="w-full bg-white text-black font-bold py-2 rounded-full text-sm text-center hover:scale-105 transition-transform"
            >
              Log in
            </Link>
          </div>
        )}
      </div>
    </aside>
  );
}

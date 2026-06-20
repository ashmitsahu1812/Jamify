'use client';
import { ChevronLeft, ChevronRight, Home, Search, Bell, Users, User, Download } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import Link from 'next/link';

export function Topbar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, logout } = useAuthStore();
  const query = searchParams.get('q') || '';

  return (
    <div className="h-16 flex items-center justify-between px-6 bg-[#121212] sticky top-0 z-40">
      {/* Left section: Nav arrows & Home */}
      <div className="flex items-center gap-2">
        <button onClick={() => router.back()} className="w-8 h-8 flex items-center justify-center bg-black/60 rounded-full text-zinc-400 hover:text-white">
          <ChevronLeft size={20} />
        </button>
        <button onClick={() => router.forward()} className="w-8 h-8 flex items-center justify-center bg-black/60 rounded-full text-zinc-400 hover:text-white">
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Center section: Home icon & Search bar */}
      <div className="flex items-center gap-2 flex-1 max-w-xl mx-4">
        <Link href="/" className="w-12 h-12 flex items-center justify-center bg-[#1f1f1f] hover:bg-[#2a2a2a] rounded-full transition-colors shrink-0">
          <Home size={24} className="text-white" />
        </Link>
        <div className="relative flex-1 group">
          <Search size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-zinc-400 group-focus-within:text-white" />
          <input 
            type="text" 
            placeholder="What do you want to play?" 
            value={query}
            onChange={(e) => {
              const val = e.target.value;
              if (val) {
                router.push(`/search?q=${encodeURIComponent(val)}`);
              } else {
                router.push('/search');
              }
            }}
            className="w-full h-12 bg-[#1f1f1f] hover:bg-[#2a2a2a] focus:bg-[#2a2a2a] border border-transparent focus:border-zinc-500 rounded-full pl-12 pr-4 text-white placeholder-zinc-400 outline-none transition-all"
          />
        </div>
      </div>

      {/* Right section: Profile & Extra icons */}
      <div className="flex items-center gap-2 md:gap-4">
        <button 
          onClick={() => alert("Premium features are currently unlocked in this clone!")}
          className="hidden md:flex items-center gap-1 text-sm font-semibold bg-white text-black px-4 py-1.5 rounded-full hover:scale-105 transition-transform"
        >
          Explore Premium
        </button>
        <button 
          onClick={() => alert("PWA Installation prompt will appear here.")}
          className="hidden md:flex items-center gap-1 text-sm font-semibold text-zinc-400 hover:text-white hover:scale-105 transition-all"
        >
          <Download size={16} /> Install App
        </button>
        <button 
          onClick={() => alert("You have 0 new notifications.")}
          className="w-8 h-8 flex items-center justify-center rounded-full text-zinc-400 hover:text-white hover:bg-[#2a2a2a] transition-colors"
        >
          <Bell size={18} />
        </button>
        <button 
          onClick={() => router.push('/jam')}
          title="Jam Room"
          className="w-8 h-8 flex items-center justify-center rounded-full text-zinc-400 hover:text-white hover:bg-[#2a2a2a] transition-colors"
        >
          <Users size={18} />
        </button>
        <button 
          onClick={() => {
            if (user) {
              if (confirm('Do you want to log out?')) {
                logout();
              }
            } else {
              router.push('/login');
            }
          }}
          title={user ? `Logged in as ${user.username}` : "Log In"}
          className="w-8 h-8 flex items-center justify-center bg-[#1f1f1f] hover:bg-[#2a2a2a] rounded-full text-white transition-colors"
        >
          {user ? (
            <span className="text-sm font-bold">{user.username.charAt(0).toUpperCase()}</span>
          ) : (
            <User size={18} />
          )}
        </button>
      </div>
    </div>
  );
}

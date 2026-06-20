'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import Link from 'next/link';
import { API_URL } from '@/config';

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setAuth({ _id: data._id, username: data.username, email: data.email }, data.token);
        router.push('/');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 flex items-center justify-center min-h-[80vh]">
      <div className="bg-[#181818] p-8 rounded-xl w-full max-w-md shadow-2xl border border-zinc-800">
        <h1 className="text-3xl font-bold text-white mb-8 text-center">Log in to Jamify</h1>
        
        {error && <div className="bg-red-500/10 text-red-500 p-3 rounded-md mb-6 text-sm">{error}</div>}
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-white mb-2">Email address</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#2A2A2A] text-white border border-zinc-700 rounded-md p-3 outline-none focus:border-[#1ED760] focus:ring-1 focus:ring-[#1ED760]"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-white mb-2">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#2A2A2A] text-white border border-zinc-700 rounded-md p-3 outline-none focus:border-[#1ED760] focus:ring-1 focus:ring-[#1ED760]"
            />
          </div>
          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-[#1ED760] text-black font-bold py-3 rounded-full hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100 mt-4"
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>
        
        <div className="mt-8 text-center text-zinc-400">
          Don't have an account?{' '}
          <Link href="/register" className="text-white font-bold hover:underline hover:text-[#1ED760]">
            Sign up for Jamify
          </Link>
        </div>
      </div>
    </div>
  );
}

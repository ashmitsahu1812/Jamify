'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import Link from 'next/link';
import { API_URL } from '@/config';
import { GoogleLogin } from '@react-oauth/google';

export default function RegisterPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  
  const [error, setError] = useState('');

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      const res = await fetch(`${API_URL}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: credentialResponse.credential })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setAuth({ _id: data._id, username: data.username, email: data.email }, data.token);
        router.push('/');
      } else {
        setError(data.message || 'Google signup failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    }
  };

  return (
    <div className="p-8 flex items-center justify-center min-h-[80vh]">
      <div className="bg-[#181818] p-8 rounded-xl w-full max-w-md shadow-2xl border border-zinc-800 text-center">
        <h1 className="text-3xl font-bold text-white mb-8">Sign up for Jamify</h1>
        
        {error && <div className="bg-red-500/10 text-red-500 p-3 rounded-md mb-6 text-sm">{error}</div>}
        
        <div className="flex justify-center mb-6">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => {
              setError('Google Signup Failed');
            }}
            theme="filled_black"
            size="large"
            text="signup_with"
            shape="pill"
          />
        </div>
        
        <div className="mt-8 text-center text-zinc-400">
          Already have an account?{' '}
          <Link href="/login" className="text-white font-bold hover:underline hover:text-[#1ED760]">
            Log in here
          </Link>
        </div>
      </div>
    </div>
  );
}

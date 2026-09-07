import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import { Mail, Lock, LogIn, UserPlus } from 'lucide-react';

export default function Auth({ onLoginSuccess }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    const { error } = await supabase.auth.signUp({ 
      email, 
      password 
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage('Account created successfully! You are now logged in.');
      setTimeout(() => {
        if (onLoginSuccess) onLoginSuccess();
        else navigate('/dashboard');
      }, 1000);
    }
    setLoading(false);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    const { error } = await supabase.auth.signInWithPassword({ 
      email, 
      password 
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage('Welcome back!');
      setTimeout(() => {
        if (onLoginSuccess) onLoginSuccess();
        else navigate('/dashboard');
      }, 500);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0b0f14] p-6">
      <div className="mx-auto max-w-md relative z-10 text-center w-full">
        <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-aqua to-magenta mx-auto mb-6 shadow-[0_0_20px_rgba(45,212,191,0.3)]">
          <span className="iconify text-ink text-[24px]" data-icon="ph:lock-key-fill"></span>
        </div>
        <h2 className="font-display text-3xl font-bold tracking-tight text-white mb-2">Welcome</h2>
        <p className="text-slate-400 mb-8">Sign in or create an account to continue.</p>
        
        <div className="glass rounded-2xl p-8 text-left space-y-5">
          <form className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-ink2/50 border border-white/10 rounded-xl text-white focus:border-aqua outline-none transition"
                required
              />
            </div>
            
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-ink2/50 border border-white/10 rounded-xl text-white focus:border-aqua outline-none transition"
                required
              />
            </div>

            {message && (
              <p className="text-sm text-center font-medium text-aqua bg-aqua/10 border border-aqua/20 p-3 rounded-lg">
                {message}
              </p>
            )}

            <div className="flex gap-4 pt-4">
              <button
                onClick={handleLogin}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-aqua to-magenta px-5 py-3 text-sm font-bold text-ink shadow-lg shadow-aqua/20 hover:shadow-aqua/40 transition-all disabled:opacity-50"
              >
                <LogIn className="h-4 w-4" />
                {loading ? 'Loading...' : 'Sign In'}
              </button>
              
              <button
                onClick={handleSignUp}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 rounded-full bg-white/10 px-5 py-3 text-sm font-bold text-white hover:bg-white/20 transition-all disabled:opacity-50"
              >
                <UserPlus className="h-4 w-4" />
                Sign Up
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

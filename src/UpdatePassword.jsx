import React, { useState } from 'react';
import { supabase } from './supabaseClient';

export default function UpdatePassword({ onPasswordUpdated }) {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
    } else {
      setMessage('Password updated successfully!');
      setTimeout(() => {
        if (onPasswordUpdated) onPasswordUpdated();
      }, 2000);
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-6">
      <div className="glass rounded-2xl p-8 max-w-md w-full relative">
        <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-aqua to-magenta mx-auto mb-6 shadow-[0_0_20px_rgba(45,212,191,0.3)]">
          <span className="iconify text-ink text-[24px]" data-icon="ph:lock-key-fill"></span>
        </div>
        
        <h2 className="font-display text-2xl font-bold tracking-tight text-white mb-2 text-center">Update Password</h2>
        <p className="text-slate-400 mb-6 text-center text-sm">Please enter your new password below.</p>
        
        <form onSubmit={handleUpdatePassword} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">New Password</label>
            <input 
              required 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              className="w-full bg-ink2/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-aqua outline-none transition" 
              placeholder="••••••••" 
            />
          </div>
          
          {error && <p className="text-sm text-center font-medium text-red-400 bg-red-400/10 border border-red-400/20 p-3 rounded-lg">{error}</p>}
          {message && <p className="text-sm text-center font-medium text-aqua bg-aqua/10 border border-aqua/20 p-3 rounded-lg">{message}</p>}
          
          <button type="submit" disabled={loading} className="w-full mt-2 rounded-full bg-white px-7 py-3.5 text-sm font-bold text-ink hover:bg-aqua transition-colors disabled:opacity-50">
            {loading ? 'Updating...' : 'Save New Password'}
          </button>
        </form>
      </div>
    </div>
  );
}

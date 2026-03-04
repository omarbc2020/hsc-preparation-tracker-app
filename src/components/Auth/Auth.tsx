import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useStore } from '../../store/useStore';
import { motion } from 'motion/react';
import { User, Lock, Key, RefreshCw } from 'lucide-react';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [isRecover, setIsRecover] = useState(false);
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [uniqueId, setUniqueId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [recoveredId, setRecoveredId] = useState('');

  const setUser = useStore((state) => state.setUser);

  const generateUniqueId = () => {
    return 'HSC-' + Math.random().toString(36).substr(2, 6).toUpperCase();
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const newUniqueId = generateUniqueId();
    const email = `${newUniqueId.toLowerCase()}@hsc-tracker.com`;

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      if (authData.user) {
        const { error: profileError } = await supabase.from('profiles').insert([
          {
            id: authData.user.id,
            name,
            unique_id: newUniqueId,
          },
        ]);

        if (profileError) throw profileError;

        alert(`Registration Successful! Your Unique ID is: ${newUniqueId}. Please save it.`);
        setIsLogin(true);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    let loginUniqueId = uniqueId;

    // If the input doesn't look like a Unique ID (doesn't start with HSC-), 
    // try to find the Unique ID by Name
    if (!uniqueId.toUpperCase().startsWith('HSC-')) {
      try {
        const { data, error: findError } = await supabase
          .from('profiles')
          .select('unique_id')
          .eq('name', uniqueId)
          .single();
        
        if (findError || !data) {
          throw new Error('User not found with this name');
        }
        loginUniqueId = data.unique_id;
      } catch (err: any) {
        setError('Invalid Name or Unique ID');
        setLoading(false);
        return;
      }
    }

    const email = `${loginUniqueId.toLowerCase()}@hsc-tracker.com`;

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (profileError) throw profileError;

      setUser(profileData);
    } catch (err: any) {
      setError('Invalid Credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleRecover = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setRecoveredId('');

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('unique_id')
        .eq('name', name)
        .single();

      if (error || !data) throw new Error('User not found');
      
      setRecoveredId(data.unique_id);
    } catch (err: any) {
      setError('Could not recover ID. Check your name.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-zinc-200"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-zinc-900">HSC Tracker</h1>
          <p className="text-zinc-500 mt-2">
            {isRecover ? 'Recover your Unique ID' : isLogin ? 'Sign in to your account' : 'Create a new account'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}

        {recoveredId && (
          <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-center">
            <p className="text-sm font-medium">Your Unique ID is:</p>
            <p className="text-xl font-bold mt-1">{recoveredId}</p>
            <button 
              onClick={() => { setIsRecover(false); setIsLogin(true); setUniqueId(recoveredId); }}
              className="mt-2 text-sm underline"
            >
              Back to Login
            </button>
          </div>
        )}

        <form onSubmit={isRecover ? handleRecover : isLogin ? handleLogin : handleRegister} className="space-y-4">
          {!isLogin || isRecover ? (
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                  placeholder="John Doe"
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Name or Unique ID</label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="text"
                  required
                  value={uniqueId}
                  onChange={(e) => setUniqueId(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                  placeholder="John Doe or HSC-XXXXXX"
                />
              </div>
            </div>
          )}

          {!isRecover && (
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
            {isRecover ? 'Recover ID' : isLogin ? 'Sign In' : 'Register'}
          </button>
        </form>

        <div className="mt-6 text-center space-y-2">
          {!isRecover && (
            <button
              onClick={() => { setIsLogin(!isLogin); setError(''); }}
              className="text-sm text-zinc-600 hover:text-emerald-600 transition-colors"
            >
              {isLogin ? "Don't have an account? Register" : "Already have an account? Login"}
            </button>
          )}
          <br />
          <button
            onClick={() => { setIsRecover(!isRecover); setError(''); setRecoveredId(''); }}
            className="text-sm text-zinc-500 hover:text-zinc-800 transition-colors"
          >
            {isRecover ? 'Back to Login' : 'Forgot Unique ID?'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

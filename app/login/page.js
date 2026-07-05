'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const router = useRouter();

    // Handle User Sign Up
    const handleSignUp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        });

        if (error) {
            setMessage(`Error: ${error.message}`);
        } else {
            setMessage('Success! Check your email for the confirmation link.');
        }
        setLoading(false);
    };

    // Handle User Sign In
    const handleSignIn = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setMessage(`Error: ${error.message}`);
        } else {
            setMessage('Logged in successfully! Redirecting...');
            router.push('/dashboard'); // Sends user to their dashboard
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-center items-center px-6">
            <div className="max-w-md w-full bg-slate-900 border border-slate-800 p-8 rounded-3xl space-y-6 shadow-2xl">

                <div className="text-center space-y-2">
                    <Link href="/" className="text-xl font-black tracking-tight bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
                        LocalSpot.
                    </Link>
                    <h2 className="text-2xl font-bold tracking-tight">Welcome to the Club</h2>
                    <p className="text-sm text-slate-400">Sign in or create a brand new account below</p>
                </div>

                {message && (
                    <div className={`p-4 rounded-xl text-sm border ${message.startsWith('Error') ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'}`}>
                        {message}
                    </div>
                )}

                <form className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Email Address</label>
                        <input
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 transition-colors text-white"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Password</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 transition-colors text-white"
                            required
                        />
                    </div>

                    <div className="flex gap-4 pt-2">
                        <button
                            type="submit"
                            onClick={handleSignIn}
                            disabled={loading}
                            className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-semibold py-3 px-4 rounded-xl text-sm transition-all disabled:opacity-50"
                        >
                            Sign In
                        </button>
                        <button
                            type="submit"
                            onClick={handleSignUp}
                            disabled={loading}
                            className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold py-3 px-4 rounded-xl text-sm transition-all shadow-lg shadow-emerald-500/10 disabled:opacity-50"
                        >
                            Sign Up
                        </button>
                    </div>
                </form>

            </div>
        </div>
    );
}
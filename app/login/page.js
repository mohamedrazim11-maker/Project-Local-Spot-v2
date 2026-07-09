'use client';

import { useState, useEffect, Suspense } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';

function AuthForm() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Check URL parameters directly during initialization to prevent screen flashing
    const initialMode = searchParams.get('mode') === 'signin' ? 'SIGNIN' : 'SIGNUP';

    // Controls global view: 'SIGNUP' or 'SIGNIN'
    const [view, setView] = useState(initialMode);

    // Controls signup progression step: 'EMAIL' -> 'OTP' -> 'PASSWORD_SETUP'
    const [signupStep, setSignupStep] = useState('EMAIL');

    // Form States
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // UI Feedback States
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Sync state changes if the user clicks between pages using browser history
    useEffect(() => {
        const mode = searchParams.get('mode');
        if (mode === 'signin') {
            setView('SIGNIN');
        } else {
            setView('SIGNUP');
            setSignupStep('EMAIL');
        }
    }, [searchParams]);

    const handleSwitchView = (targetView) => {
        setView(targetView);
        setSignupStep('EMAIL');
        setOtp('');
        setPassword('');
        setConfirmPassword('');
        setMessage({ type: '', text: '' });
    };

    // ==========================================
    // SIGNUP FLOW ACTIONS
    // ==========================================
    const handleSendOtp = async (e) => {
        e.preventDefault();
        if (!email) return;

        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const { error } = await supabase.auth.signInWithOtp({
                email: email.trim().toLowerCase(),
                options: { shouldCreateUser: true },
            });

            if (error) throw error;

            setMessage({ type: 'success', text: 'Verification code sent to your Gmail inbox!' });
            setSignupStep('OTP');
        } catch (err) {
            setMessage({ type: 'error', text: err.message || 'Failed to send verification code.' });
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        if (!otp) return;

        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const { data, error } = await supabase.auth.verifyOtp({
                email: email.trim().toLowerCase(),
                token: otp.trim(),
                type: 'email',
            });

            if (error) throw error;

            if (data.session) {
                setMessage({ type: 'success', text: 'Gmail verified! Set your password.' });
                setSignupStep('PASSWORD_SETUP');
            }
        } catch (err) {
            setMessage({ type: 'error', text: err.message || 'Invalid or expired code.' });
        } finally {
            setLoading(false);
        }
    };

    const handleCreatePassword = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setMessage({ type: 'error', text: 'Passwords do not match.' });
            return;
        }

        if (password.length < 6) {
            setMessage({ type: 'error', text: 'Password must be at least 6 characters long.' });
            return;
        }

        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const { error } = await supabase.auth.updateUser({
                password: password,
            });

            if (error) throw error;

            setMessage({ type: 'success', text: 'Account registered successfully!' });

            setTimeout(() => {
                router.push('/dashboard');
            }, 2000);
        } catch (err) {
            setMessage({ type: 'error', text: err.message || 'Failed to complete registration.' });
        } finally {
            setLoading(false);
        }
    };

    // ==========================================
    // SIGN IN ACTION
    // ==========================================
    const handlePasswordSignIn = async (e) => {
        e.preventDefault();
        if (!email || !password) return;

        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email.trim().toLowerCase(),
                password: password,
            });

            if (error) throw error;

            if (data.user) {
                router.push('/dashboard');
            }
        } catch (err) {
            setMessage({ type: 'error', text: err.message || 'Invalid credentials or incorrect password.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-[440px] bg-[#0d1424] rounded-2xl p-8 md:p-10 border border-[#1e293b]/30 shadow-2xl">
            <h2 className="text-3xl font-bold text-center text-white mb-2 tracking-wide">
                {view === 'SIGNUP' ? 'Create Account' : 'Welcome Back'}
            </h2>

            <p className="text-xs text-gray-400 text-center mb-8">
                {view === 'SIGNUP' && signupStep === 'EMAIL' && 'Step 1: Enter your Gmail address'}
                {view === 'SIGNUP' && signupStep === 'OTP' && 'Step 2: Enter the verification code'}
                {view === 'SIGNUP' && signupStep === 'PASSWORD_SETUP' && 'Step 3: Establish security credentials'}
                {view === 'SIGNIN' && 'Sign in using your Gmail and password'}
            </p>

            {message.text && (
                <div className={`p-3 rounded-xl text-xs font-semibold mb-6 text-center border ${message.type === 'success'
                    ? 'bg-emerald-950/40 text-emerald-400 border-emerald-900/40'
                    : 'bg-red-950/40 text-red-400 border-red-900/40'
                    }`}>
                    {message.text}
                </div>
            )}

            {/* SIGN UP SECTION */}
            {view === 'SIGNUP' && (
                <div>
                    {signupStep === 'EMAIL' && (
                        <form onSubmit={handleSendOtp} className="space-y-6">
                            <div>
                                <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2">Gmail Address</label>
                                <input
                                    type="email"
                                    required
                                    placeholder="yourname@gmail.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-[#070b14] border border-[#1e293b] rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-[#38bdf8] text-white placeholder-gray-600 transition"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-[#38bdf8] to-[#0284c7] text-white font-bold text-sm py-3.5 rounded-xl hover:opacity-95 active:scale-[0.99] transition disabled:opacity-50"
                            >
                                {loading ? 'Sending Code...' : 'Verify Gmail'}
                            </button>
                        </form>
                    )}

                    {signupStep === 'OTP' && (
                        <form onSubmit={handleVerifyOtp} className="space-y-6">
                            <div>
                                <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2">Enter Verification Code</label>
                                <input
                                    type="text"
                                    required
                                    maxLength={6}
                                    placeholder="123456"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    className="w-full bg-[#070b14] border border-[#1e293b] rounded-xl px-4 py-3.5 text-sm text-center tracking-[0.5em] font-mono text-xl focus:outline-none focus:border-[#38bdf8] text-white placeholder-gray-700 transition"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-[#38bdf8] to-[#0284c7] text-white font-bold text-sm py-3.5 rounded-xl hover:opacity-95 active:scale-[0.99] transition disabled:opacity-50"
                            >
                                {loading ? 'Verifying...' : 'Confirm Code'}
                            </button>
                        </form>
                    )}

                    {signupStep === 'PASSWORD_SETUP' && (
                        <form onSubmit={handleCreatePassword} className="space-y-5">
                            <div>
                                <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2">Create Password</label>
                                <input
                                    type="password"
                                    required
                                    minLength={6}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-[#070b14] border border-[#1e293b] rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-[#38bdf8] text-white placeholder-gray-600 transition mb-4"
                                />

                                <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2">Confirm Password</label>
                                <input
                                    type="password"
                                    required
                                    minLength={6}
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full bg-[#070b14] border border-[#1e293b] rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-[#38bdf8] text-white placeholder-gray-600 transition"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-[#10b981] to-[#059669] text-white font-bold text-sm py-3.5 rounded-xl hover:opacity-95 active:scale-[0.99] transition disabled:opacity-50"
                            >
                                {loading ? 'Saving...' : 'Finish Setup'}
                            </button>
                        </form>
                    )}

                    <p className="text-center text-xs text-gray-500 mt-8 tracking-wide">
                        Already configured an account?{' '}
                        <button type="button" onClick={() => handleSwitchView('SIGNIN')} className="text-[#38bdf8] hover:underline font-bold transition">Sign In</button>
                    </p>
                </div>
            )}

            {/* SIGN IN SECTION (GMAIL + PASSWORD INPUT ONLY) */}
            {view === 'SIGNIN' && (
                <form onSubmit={handlePasswordSignIn} className="space-y-5">
                    <div>
                        <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2">Gmail Address</label>
                        <input
                            type="email"
                            required
                            placeholder="yourname@gmail.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-[#070b14] border border-[#1e293b] rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-[#38bdf8] text-white placeholder-gray-600 transition mb-4"
                        />

                        <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2">Password</label>
                        <input
                            type="password"
                            required
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-[#070b14] border border-[#1e293b] rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-[#38bdf8] text-white placeholder-gray-600 transition"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-[#38bdf8] to-[#0284c7] text-white font-bold text-sm py-3.5 rounded-xl hover:opacity-95 active:scale-[0.99] transition disabled:opacity-50"
                    >
                        {loading ? 'Authenticating...' : 'Sign In'}
                    </button>

                    <p className="text-center text-xs text-gray-500 mt-8 tracking-wide">
                        Need a new account?{' '}
                        <button type="button" onClick={() => handleSwitchView('SIGNUP')} className="text-[#38bdf8] hover:underline font-bold transition">Sign Up via OTP</button>
                    </p>
                </form>
            )}
        </div>
    );
}

export default function UnifiedAuthPage() {
    return (
        <div className="min-h-screen bg-[#060a12] text-white flex items-center justify-center p-4">
            <Suspense fallback={
                <div className="text-xs text-gray-500 font-mono tracking-widest animate-pulse">
                    LOADING SECURITY SETTINGS...
                </div>
            }>
                <AuthForm />
            </Suspense>
        </div>
    );
}
'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function UnifiedAuthPage() {
    const router = useRouter();

    // Controls global view: 'SIGNUP' or 'SIGNIN'
    const [view, setView] = useState('SIGNUP');

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

    // Helper to reset states when swapping views
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

    // 1. Submit Gmail to send OTP
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

    // 2. Verify 6-digit OTP code 
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
                setMessage({ type: 'success', text: 'Gmail successfully verified! Create your security password.' });
                setSignupStep('PASSWORD_SETUP');
            }
        } catch (err) {
            setMessage({ type: 'error', text: err.message || 'Invalid or expired code.' });
        } finally {
            setLoading(false);
        }
    };

    // 3. Confirm & create account passwords
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

            setMessage({ type: 'success', text: 'Account registered successfully! Redirecting...' });

            // Redirect to dashboard upon completion
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
            setMessage({ type: 'error', text: err.message || 'Invalid email credentials or password.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#090d16] text-white flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-[#111827] border border-gray-800 rounded-2xl shadow-2xl p-6 md:p-8">

                {/* View Titles */}
                <h2 className="text-2xl font-black text-center text-white mb-2">
                    {view === 'SIGNUP' ? 'Create Account' : 'Welcome Back'}
                </h2>

                <p className="text-xs text-gray-400 text-center mb-6">
                    {view === 'SIGNUP' && signupStep === 'EMAIL' && 'Step 1: Enter your Gmail address'}
                    {view === 'SIGNUP' && signupStep === 'OTP' && 'Step 2: Enter the verification code'}
                    {view === 'SIGNUP' && signupStep === 'PASSWORD_SETUP' && 'Step 3: Establish security credentials'}
                    {view === 'SIGNIN' && 'Sign in using your Gmail and password'}
                </p>

                {/* System Messages */}
                {message.text && (
                    <div className={`p-3 rounded-lg text-xs font-semibold mb-4 text-center border ${message.type === 'success'
                            ? 'bg-emerald-950/40 text-emerald-400 border-emerald-900/50'
                            : 'bg-red-950/40 text-red-400 border-red-900/50'
                        }`}>
                        {message.text}
                    </div>
                )}

                {/* ======================================================== */}
                {/* SIGN UP SECTION                                          */}
                {/* ======================================================== */}
                {view === 'SIGNUP' && (
                    <div>
                        {/* Step 1: Email Input */}
                        {signupStep === 'EMAIL' && (
                            <form onSubmit={handleSendOtp} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Gmail Address</label>
                                    <input
                                        type="email"
                                        required
                                        placeholder="yourname@gmail.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-[#090d16] border border-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#00f2fe] text-white"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-gradient-to-r from-[#00f2fe] to-[#4facfe] text-[#090d16] font-bold text-sm py-3 rounded-xl hover:opacity-90 transition disabled:opacity-50"
                                >
                                    {loading ? 'Sending Code...' : 'Verify Gmail'}
                                </button>
                            </form>
                        )}

                        {/* Step 2: OTP Verification */}
                        {signupStep === 'OTP' && (
                            <form onSubmit={handleVerifyOtp} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Enter Verification Code</label>
                                    <input
                                        type="text"
                                        required
                                        maxLength={6}
                                        placeholder="123456"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        className="w-full bg-[#090d16] border border-gray-800 rounded-xl px-4 py-3 text-sm text-center tracking-widest font-mono text-xl focus:outline-none focus:border-[#00f2fe] text-white"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-gradient-to-r from-[#00f2fe] to-[#4facfe] text-[#090d16] font-bold text-sm py-3 rounded-xl hover:opacity-90 transition disabled:opacity-50"
                                >
                                    {loading ? 'Verifying...' : 'Confirm Code'}
                                </button>
                            </form>
                        )}

                        {/* Step 3: Password Inputs */}
                        {signupStep === 'PASSWORD_SETUP' && (
                            <form onSubmit={handleCreatePassword} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Create Password</label>
                                    <input
                                        type="password"
                                        required
                                        minLength={6}
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-[#090d16] border border-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#00f2fe] text-white mb-4"
                                    />

                                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Confirm Password</label>
                                    <input
                                        type="password"
                                        required
                                        minLength={6}
                                        placeholder="••••••••"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full bg-[#090d16] border border-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#00f2fe] text-white"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-gradient-to-r from-[#10b981] to-[#059669] text-white font-bold text-sm py-3 rounded-xl hover:opacity-90 transition disabled:opacity-50"
                                >
                                    {loading ? 'Saving Parameters...' : 'Finish Setup'}
                                </button>
                            </form>
                        )}

                        {/* Switch Link back to Sign In */}
                        <p className="text-center text-xs text-gray-500 mt-6">
                            Already configured an account?{' '}
                            <button type="button" onClick={() => handleSwitchView('SIGNIN')} className="text-[#00f2fe] hover:underline font-semibold">Sign In</button>
                        </p>
                    </div>
                )}

                {/* ======================================================== */}
                {/* SIGN IN SECTION                                          */}
                {/* ======================================================== */}
                {view === 'SIGNIN' && (
                    <form onSubmit={handlePasswordSignIn} className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Gmail Address</label>
                            <input
                                type="email"
                                required
                                placeholder="yourname@gmail.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-[#090d16] border border-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#00f2fe] text-white mb-4"
                            />

                            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Password</label>
                            <input
                                type="password"
                                required
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-[#090d16] border border-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#00f2fe] text-white"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-[#00f2fe] to-[#4facfe] text-[#090d16] font-bold text-sm py-3 rounded-xl hover:opacity-90 transition disabled:opacity-50"
                        >
                            {loading ? 'Authenticating...' : 'Sign In'}
                        </button>

                        {/* Switch Link back to Sign Up */}
                        <p className="text-center text-xs text-gray-500 mt-6">
                            Need a new account?{' '}
                            <button type="button" onClick={() => handleSwitchView('SIGNUP')} className="text-[#00f2fe] hover:underline font-semibold">Sign Up via OTP</button>
                        </p>
                    </form>
                )}

            </div>
        </div>
    );
}
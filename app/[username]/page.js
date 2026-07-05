'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { use } from 'react';
import Link from 'next/link';

export default function PublicProfile({ params }) {
    // Safely unwrap the dynamic URL parameter
    const resolvedParams = use(params);
    const username = resolvedParams.username;

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (username) {
            fetchPublicProfile();
        }
    }, [username]);

    const fetchPublicProfile = async () => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('username', username.toLowerCase())
                .single();

            if (data) {
                setProfile(data);
            }
        } catch (error) {
            console.error('Error loading public profile:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 text-white flex justify-center items-center font-medium">
                Loading Media Kit...
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-center items-center gap-4">
                <h1 className="text-2xl font-bold text-red-400">404: Profile Not Found</h1>
                <p className="text-slate-400 text-sm">This creator username hasn't been claimed yet!</p>
                <Link href="/" className="text-emerald-400 font-semibold text-sm hover:underline">
                    Go Back Home
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center px-6 py-12">

            {/* GLOWING LOGO */}
            <div className="absolute top-8 left-8">
                <span className="text-lg font-black tracking-tight bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
                    LocalSpot.
                </span>
            </div>

            {/* PUBLIC CARD */}
            <div className="max-w-2xl w-full bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden space-y-8">

                {/* Ambient Decorative Backdrop Glow */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl -mr-12 -mt-12" />

                {/* TOP PROFILE IDENTIFIER */}
                <div className="space-y-3">
                    <div className="inline-flex bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
                        ✨ Verified Creator • {profile.category || 'Independent'}
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-tight">{profile.full_name || 'Anonymous Creator'}</h1>
                    <p className="text-emerald-400 font-medium text-base">@{profile.username}</p>
                </div>

                {/* BIO DESCRIPTION */}
                {profile.bio ? (
                    <p className="text-slate-300 text-sm md:text-base leading-relaxed max-w-xl">
                        "{profile.bio}"
                    </p>
                ) : (
                    <p className="text-slate-500 text-sm italic">This creator hasn't written a bio description yet.</p>
                )}

                {/* STATISTICS TRACKER DATA GRID */}
                <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="bg-slate-900/50 border border-slate-800/60 rounded-2xl p-6 text-center">
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Audience Reach</p>
                        <p className="text-3xl font-black text-white">
                            {Number(profile.follower_count).toLocaleString()}
                        </p>
                    </div>
                    <div className="bg-slate-900/50 border border-slate-800/60 rounded-2xl p-6 text-center">
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Base Partnership Rate</p>
                        <p className="text-3xl font-black text-emerald-400">
                            ${profile.base_rate || '0'}
                        </p>
                    </div>
                </div>

                {/* CONTACT / CTA BLOCK */}
                <div className="border-t border-slate-900 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
                    {profile.instagram_handle && (
                        <a
                            href={`https://instagram.com/${profile.instagram_handle}`}
                            target="_blank"
                            className="text-sm text-slate-400 hover:text-white transition-colors flex items-center gap-2"
                        >
                            📸 instagram.com/<span className="text-slate-200 font-medium">{profile.instagram_handle}</span>
                        </a>
                    )}

                    <button className="w-full md:w-auto bg-white hover:bg-slate-100 text-slate-950 font-bold py-3 px-8 rounded-xl text-sm transition-all shadow-lg">
                        Lock Partnership Deal
                    </button>
                </div>

            </div>
        </div>
    );
}
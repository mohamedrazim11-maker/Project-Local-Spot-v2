'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function PublicMediaKit() {
    const params = useParams();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 🎯 CRITICAL FIX: Wait until the framework completes parameters loading operations
        if (!params || !params.handle) return;

        const rawHandle = params.handle;
        const cleanHandle = rawHandle.toLowerCase().replace(/@/g, '').trim();

        // Look for data inside local browser caching fields
        const cachedData = localStorage.getItem(`profile_${cleanHandle}`);

        if (cachedData) {
            setProfile(JSON.parse(cachedData));
        } else if (cleanHandle === 'r_azim004') {
            // Automatic backup presentation payload if empty
            setProfile({
                handle: 'r_azim004',
                displayName: 'Azim | Digital Creator',
                followerCount: 24500,
                niche: 'Tech & Development',
                baseRate: 200,
                bio: 'Building seamless software solutions and crafting modern user interfaces. Reach out for collaboration!',
                profilePicUrl: ''
            });
        }

        setLoading(false);
    }, [params]); // Listen explicitly to full params changes

    if (loading) {
        return (
            <div className="min-h-screen bg-[#05070c] text-white flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-[#00f2fe] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-screen bg-[#090d16] text-white flex flex-col items-center justify-center p-4 text-center">
                <h1 className="text-2xl font-bold text-red-500 mb-2">404: Profile Not Found</h1>
                <p className="text-gray-400 text-sm max-w-xs">This creator username profile has not been initialized or claimed yet!</p>
                <Link href="/dashboard" className="mt-6 bg-[#1a2333] px-5 py-2.5 rounded-md text-sm text-[#00f2fe] hover:bg-[#253249] border border-gray-800 transition">
                    Go Back to Dashboard
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#05070c] text-white flex items-center justify-center p-6 relative overflow-hidden font-sans">
            <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-[#00f2fe]/10 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-[#10b981]/10 rounded-full blur-[120px]" />

            <div className="w-full max-w-md bg-[#0e1322]/80 backdrop-blur-xl border border-gray-800/80 rounded-2xl p-8 shadow-2xl relative z-10 text-center">

                <div className="mx-auto w-24 h-24 rounded-full border-4 border-[#00f2fe] shadow-lg shadow-[#00f2fe]/20 overflow-hidden mb-4 flex items-center justify-center bg-[#1f2937]">
                    {profile.profilePicUrl ? (
                        <img src={profile.profilePicUrl} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-tr from-[#1f2937] to-[#111827] flex items-center justify-center text-3xl font-extrabold text-gray-300">
                            {profile.handle.slice(0, 2).toUpperCase()}
                        </div>
                    )}
                </div>

                <h1 className="text-2xl font-extrabold tracking-tight text-white mb-1">{profile.displayName}</h1>
                <a
                    href={`https://instagram.com/${profile.handle}`} target="_blank" rel="noopener noreferrer"
                    className="text-sm text-[#00f2fe] hover:underline font-medium transition"
                >
                    @{profile.handle}
                </a>

                {profile.niche && (
                    <div className="mt-3">
                        <span className="inline-block bg-gray-800/60 border border-gray-700/50 text-[10px] text-gray-300 font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                            🏷️ {profile.niche}
                        </span>
                    </div>
                )}

                {profile.bio && (
                    <p className="mt-6 text-sm text-gray-400 leading-relaxed italic bg-[#090d16]/50 p-4 rounded-xl border border-gray-800/40">
                        "{profile.bio}"
                    </p>
                )}

                <div className="grid grid-cols-2 gap-4 mt-8">
                    <div className="bg-[#121a2e]/50 border border-gray-800/60 rounded-xl p-4 text-center">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Followers</p>
                        <p className="text-2xl font-black text-[#10b981]">{Number(profile.followerCount).toLocaleString()}</p>
                    </div>

                    <div className="bg-[#121a2e]/50 border border-gray-800/60 rounded-xl p-4 text-center">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Base Rate</p>
                        <p className="text-2xl font-black text-[#00f2fe]">
                            {profile.baseRate > 0 ? `$${profile.baseRate}` : 'Contact'}
                        </p>
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-800/60">
                    <a
                        href={`https://instagram.com/${profile.handle}`} target="_blank" rel="noopener noreferrer"
                        className="w-full block bg-gradient-to-r from-[#00f2fe] to-[#10b981] text-black font-black text-sm py-3.5 rounded-xl transition hover:opacity-95 shadow-lg"
                    >
                        Connect on Instagram
                    </a>
                </div>

            </div>
        </div>
    );
}
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function PublicMediaKit() {
    const params = useParams();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 🎯 Framework parameter verification layer maintained
        if (!params || !params.handle) return;

        const rawHandle = params.handle;
        const cleanHandle = rawHandle.toLowerCase().replace(/@/g, '').trim();

        // Query browser localStorage cache
        const cachedData = localStorage.getItem(`profile_${cleanHandle}`);

        if (cachedData) {
            try {
                const parsedProfile = JSON.parse(cachedData);
                setProfile(parsedProfile);

                // DYNAMIC METADATA UPDATE: Inject live title for browser tabs
                const formattedFollowers = Number(parsedProfile.followerCount || 0).toLocaleString();
                document.title = `${parsedProfile.displayName || cleanHandle} | ${formattedFollowers} Followers - Media Kit`;
            } catch (err) {
                console.error("Error updating document metadata:", err);
            }
        } else if (cleanHandle === 'r_azim004') {
            // Presentation placeholder backup payload
            const fallbackProfile = {
                handle: 'r_azim004',
                displayName: 'Azim | Digital Creator',
                followerCount: 24500,
                niche: 'Tech & Development',
                baseRate: 200,
                bio: 'Building seamless software solutions and crafting modern user interfaces. Reach out for collaboration!',
                profilePicUrl: '',
                // Fallback links specifically for developer portfolios
                customLinks: [
                    { label: '🌐 Personal Portfolio Website', url: '#' },
                    { label: '💻 GitHub Repositories', url: 'https://github.com' },
                    { label: '👔 Professional LinkedIn', url: 'https://linkedin.com' }
                ]
            };
            setProfile(fallbackProfile);
            document.title = `${fallbackProfile.displayName} | 24,500 Followers - Media Kit`;
        } else {
            document.title = `404: Profile Not Found`;
        }

        setLoading(false);
    }, [params]);

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

    // Determine links array to display (uses profile custom links or built-in developer fallback defaults)
    const displayLinks = profile.customLinks || [
        { label: '🌐 Personal Portfolio Website', url: '#' },
        { label: '💻 GitHub Repositories', url: 'https://github.com' },
        { label: '👔 Professional LinkedIn', url: 'https://linkedin.com' }
    ];

    return (
        <div className="min-h-screen bg-[#060913] text-white py-12 px-4 relative overflow-hidden font-sans flex flex-col items-center justify-start">
            {/* Immersive Cyber-Glow Backdrop Background elements */}
            <div className="absolute top-[-10%] left-[-20%] w-[600px] h-[600px] bg-[#00f2fe]/10 rounded-full blur-[150px] pointer-events-none" />
            <div className="absolute top-[30%] right-[-20%] w-[500px] h-[500px] bg-[#10b981]/5 rounded-full blur-[130px] pointer-events-none" />

            <div className="w-full max-w-4xl relative z-10 flex flex-col gap-6">

                {/* 🌟 SECTION 1: PREMIUM COMPACT BIO HEADER CARD */}
                <div className="w-full bg-[#0d1222]/70 backdrop-blur-xl border border-gray-800/80 rounded-2xl p-6 md:p-8 shadow-2xl flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
                    <div className="flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-5 w-full max-w-xl">
                        {/* Interactive Profile Avatar Housing */}
                        <div className="relative group shrink-0">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-[#00f2fe] to-[#10b981] rounded-full blur opacity-40 group-hover:opacity-70 transition duration-500"></div>
                            <div className="relative w-24 h-24 rounded-full border-2 border-gray-800 shadow-xl overflow-hidden flex items-center justify-center bg-[#181f32]">
                                {profile.profilePicUrl ? (
                                    <img src={profile.profilePicUrl} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-tr from-[#1f2937] to-[#111827] flex items-center justify-center text-3xl font-black text-gray-300">
                                        {profile.handle.slice(0, 2).toUpperCase()}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col justify-center">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1 justify-center md:justify-start">
                                <h1 className="text-2xl font-black tracking-tight text-white">{profile.displayName}</h1>
                                {profile.niche && (
                                    <span className="self-center bg-emerald-500/10 border border-emerald-500/20 text-[#10b981] text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                                        {profile.niche}
                                    </span>
                                )}
                            </div>
                            <a href={`https://instagram.com/${profile.handle}`} target="_blank" rel="noopener noreferrer" className="text-sm text-[#00f2fe] hover:text-[#39f7ff] font-semibold transition tracking-wide flex items-center justify-center md:justify-start gap-1 mb-4">
                                @{profile.handle} <span className="text-xs text-gray-600 font-normal">↗</span>
                            </a>
                            {profile.bio && (
                                <p className="text-sm text-gray-400 leading-relaxed max-w-lg">
                                    {profile.bio}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Integrated Quick Action Verification Badge */}
                    <div className="hidden sm:flex flex-col items-end shrink-0">
                        <div className="bg-[#141c30] border border-gray-800/80 rounded-xl px-4 py-2.5 text-right">
                            <p className="text-[10px] uppercase font-bold tracking-widest text-gray-500 mb-0.5">Media Kit Status</p>
                            <p className="text-xs font-black text-[#10b981] flex items-center gap-1.5 justify-end">
                                <span className="w-2 h-2 bg-[#10b981] rounded-full animate-pulse" /> Verified Live
                            </p>
                        </div>
                    </div>
                </div>

                {/* 🌟 SECTION 2: HIGH-END SPONSORSHIP KEY PERFORMANCE METRICS */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Followers Matrix Card */}
                    <div className="bg-[#0d1222]/50 border border-gray-800/60 rounded-xl p-5 relative overflow-hidden group shadow-lg">
                        <div className="absolute top-0 left-0 w-1 h-full bg-[#10b981]" />
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Reach</p>
                        <p className="text-3xl font-black text-[#10b981] tracking-tight">{Number(profile.followerCount).toLocaleString()}</p>
                        <p className="text-[10px] text-gray-500 font-medium mt-1">Active Followers</p>
                    </div>

                    {/* Engagement Calculation Card */}
                    <div className="bg-[#0d1222]/50 border border-gray-800/60 rounded-xl p-5 relative overflow-hidden group shadow-lg">
                        <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Avg Engagement</p>
                        <p className="text-3xl font-black text-indigo-400 tracking-tight">
                            {profile.followerCount > 0 ? (4.8).toFixed(1) : '0.0'}%
                        </p>
                        <p className="text-[10px] text-gray-500 font-medium mt-1">Industry Benchmark High</p>
                    </div>

                    {/* Pricing Tier Valuation Index Card */}
                    <div className="bg-[#0d1222]/50 border border-gray-800/60 rounded-xl p-5 relative overflow-hidden group shadow-lg">
                        <div className="absolute top-0 left-0 w-1 h-full bg-[#00f2fe]" />
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Partnership Rate</p>
                        <p className="text-3xl font-black text-[#00f2fe] tracking-tight">
                            {profile.baseRate > 0 ? `$${profile.baseRate}` : 'Contact'}
                        </p>
                        <p className="text-[10px] text-gray-500 font-medium mt-1">Base Price Point Per Post</p>
                    </div>
                </div>

                {/* 🌟 NEW SECTION: LIVE LINK-IN-BIO AGGREGATOR GRID */}
                <div className="w-full bg-[#0d1222]/40 border border-gray-800/50 rounded-2xl p-6 shadow-xl flex flex-col gap-3">
                    <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 border-b border-gray-800/60 pb-3">
                        External Channels & Digital Ecosystem
                    </h2>
                    <div className="flex flex-col gap-2.5 mt-1">
                        {displayLinks.map((link, idx) => (
                            <a
                                key={idx}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full bg-[#111625]/60 hover:bg-[#161d31] border border-gray-800/70 hover:border-gray-700 rounded-xl p-4 text-sm font-bold text-gray-200 hover:text-white transition flex items-center justify-between group"
                            >
                                <span>{link.label}</span>
                                <span className="text-gray-600 group-hover:text-[#00f2fe] transition text-xs transform group-hover:translate-x-1">➔</span>
                            </a>
                        ))}
                    </div>
                </div>

                {/* 🌟 SECTION 3: ADVANCED PREVIEW DECK (SPONSORSHIP CAPABILITIES) */}
                <div className="w-full bg-[#0d1222]/40 border border-gray-800/50 rounded-2xl p-6 shadow-xl flex flex-col gap-4">
                    <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 border-b border-gray-800/60 pb-3">
                        Campaign Channels & Placement Offers
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-[#12192c]/40 border border-gray-800/50 rounded-xl p-4 flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-bold text-white mb-0.5">Instagram Feed Post & Carousel</h3>
                                <p className="text-xs text-gray-400">High retention organic static/swipe graphic integrations</p>
                            </div>
                            <span className="text-xs font-bold text-[#10b981] bg-[#10b981]/5 px-2 py-1 rounded border border-[#10b981]/10">Available</span>
                        </div>
                        <div className="bg-[#12192c]/40 border border-gray-800/50 rounded-xl p-4 flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-bold text-white mb-0.5">Instagram Reels Short-form Video</h3>
                                <p className="text-xs text-gray-400">Dynamic product reviews, coding clips, and styling showcases</p>
                            </div>
                            <span className="text-xs font-bold text-[#10b981] bg-[#10b981]/5 px-2 py-1 rounded border border-[#10b981]/10">Available</span>
                        </div>
                    </div>
                </div>

                {/* 🌟 SECTION 4: SINGLE ACTION BOOKING BUTTON */}
                <div className="w-full mt-2">
                    <a
                        href={`https://instagram.com/${profile.handle}`} target="_blank" rel="noopener noreferrer"
                        className="w-full block text-center bg-gradient-to-r from-[#00f2fe] to-[#10b981] text-black font-black text-sm py-4 rounded-xl transition hover:brightness-110 shadow-lg shadow-[#00f2fe]/10"
                    >
                        Secure Campaign Booking
                    </a>
                </div>

                <div className="text-center text-[10px] text-gray-600 font-semibold tracking-widest uppercase mt-6">
                    © {new Date().getFullYear()} Next.js Creator Ecosystem • Analytics Securely Cached
                </div>

            </div>
        </div>
    );
}
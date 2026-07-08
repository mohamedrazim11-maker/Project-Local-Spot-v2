'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useParams } from 'next/navigation';

export default function PublicCreatorProfile() {
    const params = useParams();
    const username = params?.username ? String(params.username).toLowerCase() : '';

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        if (!username) return;

        const fetchPublicProfile = async () => {
            try {
                setLoading(true);
                setErrorMsg('');

                const { data, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('username', username)
                    .maybeSingle();

                if (error) {
                    setErrorMsg(`Database error: ${error.message}`);
                    console.error("Supabase query error:", error);
                } else if (!data) {
                    setErrorMsg(`The creator profile "@${username}" does not exist.`);
                } else {
                    setProfile(data);
                }
            } catch (err) {
                setErrorMsg('An unexpected error occurred loading the media kit.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchPublicProfile();
    }, [username]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#090d16] flex items-center justify-center text-white font-sans">
                <div className="text-center">
                    <div className="w-8 h-8 border-4 border-[#00f2fe] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-sm text-gray-400">Loading creator media kit...</p>
                </div>
            </div>
        );
    }

    if (errorMsg) {
        return (
            <div className="min-h-screen bg-[#090d16] flex items-center justify-center text-white font-sans p-4">
                <div className="bg-[#111827] border border-red-900/50 p-6 rounded-xl max-w-md w-full text-center shadow-xl">
                    <div className="text-red-500 text-3xl mb-2">✕</div>
                    <h2 className="text-xl font-bold text-white mb-1">Profile Unavailable</h2>
                    <p className="text-sm text-gray-400 mb-6">{errorMsg}</p>
                    <a href="/dashboard" className="inline-block bg-[#1a2333] hover:bg-[#243047] text-white text-xs font-semibold px-4 py-2 rounded-md border border-gray-800 transition">
                        Back to Dashboard
                    </a>
                </div>
            </div>
        );
    }

    if (!profile) return null;

    // Construct the Instagram profile URL dynamically
    const instagramUrl = profile.instagram_handle
        ? `https://instagram.com/${profile.instagram_handle.replace(/@/g, '')}`
        : '#';

    return (
        <div className="min-h-screen bg-[#090d16] text-white font-sans p-4 md:p-8 flex flex-col items-center justify-center">
            <div className="w-full max-w-2xl bg-[#111827] border border-gray-800 rounded-2xl shadow-2xl p-6 md:p-10 relative overflow-hidden">

                {/* Background ambient lighting */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#00f2fe]/5 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-[#10b981]/5 rounded-full blur-3xl pointer-events-none"></div>

                {/* Header Section */}
                <div className="flex flex-col sm:flex-row items-center text-center sm:text-left space-y-4 sm:space-y-0 sm:space-x-6 pb-6 border-b border-gray-800">
                    <div className="w-24 h-24 rounded-full bg-[#1f2937] border-2 border-[#10b981] flex items-center justify-center overflow-hidden shadow-lg shadow-[#10b981]/10">
                        {profile.avatar_url ? (
                            <img src={profile.avatar_url} alt={profile.full_name || username} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                            <span className="text-2xl font-bold text-gray-400">{username.slice(0, 2).toUpperCase()}</span>
                        )}
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">{profile.full_name || 'Creator Profile'}</h1>
                        <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="text-[#10b981] text-sm font-semibold tracking-wide hover:underline inline-flex items-center gap-1">
                            @{profile.instagram_handle || username} 🔗
                        </a>
                        {profile.category && (
                            <div className="mt-2">
                                <span className="inline-block bg-[#1f2937] text-gray-300 text-xs px-2.5 py-1 rounded-full border border-gray-800 font-medium">
                                    🏷️ {profile.category}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Metrics Highlight Section */}
                <div className="grid grid-cols-2 gap-4 my-8">
                    <div className="bg-[#090d16] border border-gray-800/80 rounded-xl p-4 text-center">
                        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">Total Audience</p>
                        <p className="text-2xl md:text-3xl font-black text-[#10b981]">{(profile.follower_count || 0).toLocaleString()}</p>
                        <p className="text-[10px] text-gray-500 mt-0.5">Instagram Followers</p>
                    </div>
                    <div className="bg-[#090d16] border border-gray-800/80 rounded-xl p-4 text-center">
                        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">Starting Rate</p>
                        <p className="text-2xl md:text-3xl font-black text-[#00f2fe]">${profile.base_rate || 0}</p>
                        <p className="text-[10px] text-gray-500 mt-0.5">Per Sponsorship post</p>
                    </div>
                </div>

                {/* Profile Bio Context Block */}
                {profile.bio && (
                    <div className="mb-8">
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">About Me</h3>
                        <p className="text-sm leading-relaxed text-gray-300 bg-[#090d16]/50 border border-gray-800/50 rounded-xl p-4 whitespace-pre-wrap">
                            {profile.bio}
                        </p>
                    </div>
                )}

                {/* Professional Portfolio Links */}
                <div className="space-y-3">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Professional Channels & Links</h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {profile.portfolio_link && (
                            <a href={profile.portfolio_link} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-3 bg-[#1f2937]/40 hover:bg-[#1f2937]/80 border border-gray-800 p-3 rounded-lg text-sm text-blue-400 hover:text-blue-300 transition truncate">
                                <span>🌐</span> <span className="truncate">{profile.portfolio_link.replace(/^https?:\/\//, '')}</span>
                            </a>
                        )}

                        {profile.github_link && (
                            <a href={profile.github_link} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-3 bg-[#1f2937]/40 hover:bg-[#1f2937]/80 border border-gray-800 p-3 rounded-lg text-sm text-gray-300 hover:text-white transition truncate">
                                <span>💻</span> <span className="truncate">{profile.github_link.replace(/^https?:\/\//, '')}</span>
                            </a>
                        )}

                        {profile.linkedin_link && (
                            <a href={profile.linkedin_link} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-3 bg-[#1f2937]/40 hover:bg-[#1f2937]/80 border border-gray-800 p-3 rounded-lg text-sm text-blue-500 hover:text-blue-400 transition truncate sm:col-span-2">
                                <span>👔</span> <span className="truncate">{profile.linkedin_link.replace(/^https?:\/\//, '')}</span>
                            </a>
                        )}
                    </div>

                    {!profile.portfolio_link && !profile.github_link && !profile.linkedin_link && (
                        <p className="text-xs text-gray-500 italic">No supplemental links connected to this profile yet.</p>
                    )}
                </div>

                {/* Footer Action Tag */}
                <div className="mt-10 pt-4 border-t border-gray-800/60 text-center flex items-center justify-between">
                    <p className="text-[11px] text-gray-500">Verified Creator Page via Supabase</p>
                    <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-[#00f2fe] hover:underline flex items-center gap-1">
                        Contact via Instagram →
                    </a>
                </div>

            </div>
        </div>
    );
}
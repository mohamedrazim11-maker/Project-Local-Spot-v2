'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function PublicCreatorProfile({ params }) {
    // Read directly from the resolved params prop
    const username = params?.username ? String(params.username).toLowerCase() : '';

    const [profile, setProfile] = useState(null);
    const [packages, setPackages] = useState([]); // Packages state array
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        if (!username) return;

        const fetchPublicProfileAndPackages = async () => {
            try {
                setLoading(true);
                setErrorMsg('');

                // 1. Fetch Profile Info
                const { data: profileData, error: profileError } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('username', username)
                    .maybeSingle();

                if (profileError) throw profileError;
                if (!profileData) {
                    setErrorMsg(`The creator profile "@${username}" does not exist.`);
                    setLoading(false);
                    return;
                }

                setProfile(profileData);

                // 2. Fetch Packages linked to this Profile ID
                const { data: packagesData, error: packagesError } = await supabase
                    .from('packages')
                    .select('*')
                    .eq('profile_id', profileData.id)
                    .order('price', { ascending: true });

                if (!packagesError) {
                    setPackages(packagesData);
                }

            } catch (err) {
                setErrorMsg('An unexpected error occurred loading the media kit.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchPublicProfileAndPackages();
    }, [username]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#090d16] flex items-center justify-center text-white">
                <div className="text-center">
                    <div className="w-8 h-8 border-4 border-[#00f2fe] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-sm text-gray-400">Loading creator media kit...</p>
                </div>
            </div>
        );
    }

    if (errorMsg) {
        return (
            <div className="min-h-screen bg-[#090d16] flex items-center justify-center text-white p-4">
                <div className="bg-[#111827] border border-red-900/50 p-6 rounded-xl max-w-md w-full text-center shadow-xl">
                    <div className="text-red-500 text-3xl mb-2">✕</div>
                    <h2 className="text-xl font-bold text-white mb-1">Profile Unavailable</h2>
                    <p className="text-sm text-gray-400 mb-6">{errorMsg}</p>
                    <a href="/dashboard" className="inline-block bg-[#1a2333] text-white text-xs font-semibold px-4 py-2 rounded-md border border-gray-800">
                        Back to Dashboard
                    </a>
                </div>
            </div>
        );
    }

    if (!profile) return null;

    const instagramUrl = profile.instagram_handle
        ? `https://instagram.com/${profile.instagram_handle.replace(/@/g, '')}`
        : '#';

    return (
        <div className="min-h-screen bg-[#090d16] text-white font-sans p-4 md:p-8 flex flex-col items-center justify-center">
            <div className="w-full max-w-2xl bg-[#111827] border border-gray-800 rounded-2xl shadow-2xl p-6 md:p-10 relative overflow-hidden">

                <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#00f2fe]/5 rounded-full blur-3xl pointer-events-none"></div>

                {/* Header */}
                <div className="flex flex-col sm:flex-row items-center text-center sm:text-left space-y-4 sm:space-y-0 sm:space-x-6 pb-6 border-b border-gray-800">
                    <div className="w-24 h-24 rounded-full bg-[#1f2937] border-2 border-[#10b981] flex items-center justify-center overflow-hidden">
                        {profile.avatar_url ? (
                            <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                            <span className="text-2xl font-bold text-gray-400">{username.slice(0, 2).toUpperCase()}</span>
                        )}
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-extrabold text-white">{profile.full_name || 'Creator Profile'}</h1>
                        <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="text-[#10b981] text-sm font-semibold hover:underline inline-flex items-center gap-1">
                            @{profile.instagram_handle || username} 🔗
                        </a>
                        {profile.category && (
                            <div className="mt-2">
                                <span className="inline-block bg-[#1f2937] text-gray-300 text-xs px-2.5 py-1 rounded-full border border-gray-800">
                                    🏷️ {profile.category}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-4 my-8">
                    <div className="bg-[#090d16] border border-gray-800/80 rounded-xl p-4 text-center">
                        <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Total Audience</p>
                        <p className="text-2xl md:text-3xl font-black text-[#10b981]">{(profile.follower_count || 0).toLocaleString()}</p>
                    </div>
                    <div className="bg-[#090d16] border border-gray-800/80 rounded-xl p-4 text-center">
                        <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Starting Rate</p>
                        <p className="text-2xl md:text-3xl font-black text-[#00f2fe]">${profile.base_rate || 0}</p>
                    </div>
                </div>

                {/* About Bio */}
                {profile.bio && (
                    <div className="mb-8">
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">About Me</h3>
                        <p className="text-sm leading-relaxed text-gray-300 bg-[#090d16]/50 border border-gray-800/50 rounded-xl p-4 whitespace-pre-wrap">{profile.bio}</p>
                    </div>
                )}

                {/* Sponsorship Packages */}
                {packages.length > 0 && (
                    <div className="mb-8">
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Sponsorship Packages</h3>
                        <div className="space-y-4">
                            {packages.map((pkg) => (
                                <div key={pkg.id} className="bg-gradient-to-r from-[#141c2e] to-[#111827] border border-gray-800 p-5 rounded-xl hover:border-gray-700 transition">
                                    <div className="flex justify-between items-center border-b border-gray-800/50 pb-2 mb-2">
                                        <h4 className="text-sm font-bold text-white">{pkg.title}</h4>
                                        <span className="text-[#00f2fe] font-extrabold text-sm">${pkg.price}</span>
                                    </div>
                                    <p className="text-xs text-gray-400 leading-relaxed whitespace-pre-wrap">{pkg.description || 'Contact for additional custom terms.'}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Links Section */}
                <div className="space-y-3">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Channels & Links</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {profile.portfolio_link && (
                            <a href={profile.portfolio_link} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-3 bg-[#1f2937]/40 hover:bg-[#1f2937]/80 border border-gray-800 p-3 rounded-lg text-sm text-blue-400 transition truncate">
                                <span>🌐</span> <span className="truncate">{profile.portfolio_link.replace(/^https?:\/\//, '')}</span>
                            </a>
                        )}
                        {profile.github_link && (
                            <a href={profile.github_link} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-3 bg-[#1f2937]/40 hover:bg-[#1f2937]/80 border border-gray-800 p-3 rounded-lg text-sm text-gray-300 transition truncate">
                                <span>💻</span> <span className="truncate">{profile.github_link.replace(/^https?:\/\//, '')}</span>
                            </a>
                        )}
                        {profile.linkedin_link && (
                            <a href={profile.linkedin_link} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-3 bg-[#1f2937]/40 hover:bg-[#1f2937]/80 border border-gray-800 p-3 rounded-lg text-sm text-blue-500 transition truncate sm:col-span-2">
                                <span>👔</span> <span className="truncate">{profile.linkedin_link.replace(/^https?:\/\//, '')}</span>
                            </a>
                        )}
                    </div>
                </div>

                {/* Footer Brand Action */}
                <div className="mt-10 pt-4 border-t border-gray-800/60 text-center flex items-center justify-between">
                    <p className="text-[11px] text-gray-500">Verified Creator Page via Supabase</p>
                    <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-[#00f2fe] hover:underline">
                        Book a Package →
                    </a>
                </div>

            </div>
        </div>
    );
}
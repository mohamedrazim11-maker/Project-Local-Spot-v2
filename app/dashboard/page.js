'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function CreatorDashboard() {
    const router = useRouter();
    const [handle, setHandle] = useState('r_azim004');
    const [metrics, setMetrics] = useState({
        followerCount: 0,
        displayName: '',
        niche: '',
        baseRate: 0,
        bio: '',
        profilePicUrl: ''
    });

    const [portfolioLink, setPortfolioLink] = useState('');
    const [githubLink, setGithubLink] = useState('');
    const [linkedinLink, setLinkedinLink] = useState('');

    const [isSyncing, setIsSyncing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [alert, setAlert] = useState({ type: null, message: '' });
    const [copied, setCopied] = useState(false);
    const [isLoadingSession, setIsLoadingSession] = useState(true);

    const triggerAlert = (type, message) => {
        setAlert({ type, message });
        setTimeout(() => setAlert({ type: null, message: '' }), 4000);
    };

    const handleSignOut = async () => {
        if (window.confirm('Are you sure you want to sign out?')) {
            await supabase.auth.signOut();
            router.push('/');
        }
    };

    // 1. Initial Page Load Check: Safeguard the route by forcing a redirect if no session exists
    useEffect(() => {
        const checkUserSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                // Instantly bounce the unauthenticated visitor to the landing root directory
                router.push('/');
            } else {
                setIsLoadingSession(false);
            }
        };
        checkUserSession();
    }, [router]);

    const handleInstagramSync = async () => {
        if (!handle.trim()) {
            triggerAlert('error', 'Please enter an Instagram handle before syncing.');
            return;
        }
        setIsSyncing(true);
        try {
            const response = await fetch(`/api/instagram?handle=${encodeURIComponent(handle)}`);
            const data = await response.json();

            if (!response.ok || data.success === false) {
                throw new Error(data.error || `Sync Failed (${response.status})`);
            }

            setMetrics((prev) => ({
                ...prev,
                followerCount: data.follower_count || 0,
                displayName: data.full_name || prev.displayName || handle,
                bio: data.bio || prev.bio || '',
                profilePicUrl: data.profile_pic_url || ''
            }));
            triggerAlert('success', 'Profile metrics synchronized cleanly!');
        } catch (err) {
            triggerAlert('error', err.message || 'Could not sync profile data.');
        } finally {
            setIsSyncing(false);
        }
    };

    // Automatically load existing profile info when the handle matches a record
    useEffect(() => {
        if (isLoadingSession || !handle.trim()) return;
        const cleanHandle = handle.replace(/@/g, '').trim().toLowerCase();

        const fetchExistingData = async () => {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('instagram_handle', cleanHandle)
                .maybeSingle();

            if (data && !error) {
                setMetrics({
                    followerCount: data.follower_count || 0,
                    displayName: data.full_name || '',
                    niche: data.category || '',
                    baseRate: data.base_rate || 0,
                    bio: data.bio || '',
                    profilePicUrl: data.avatar_url || ''
                });
                setPortfolioLink(data.portfolio_link || '');
                setGithubLink(data.github_link || '');
                setLinkedinLink(data.linkedin_link || '');
            }
        };

        const delayDebounce = setTimeout(() => {
            fetchExistingData();
        }, 500);

        return () => clearTimeout(delayDebounce);
    }, [handle, isLoadingSession]);

    const handleSaveForm = async (e) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            const cleanHandle = handle.replace(/@/g, '').trim().toLowerCase();

            // Fetch current session data
            const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
            const currentUserId = sessionData?.session?.user?.id;

            // Strict blockade: If no id exists, do not call supabase.from().upsert()
            if (sessionError || !currentUserId) {
                setIsSaving(false);
                triggerAlert('error', 'Missing Session: You are not recognized as a logged-in user. Redirecting...');
                router.push('/');
                return;
            }

            // Securely execute upsert now that currentUserId is verified
            const { error } = await supabase
                .from('profiles')
                .upsert({
                    id: currentUserId,
                    username: cleanHandle || 'user_' + currentUserId.slice(0, 5),
                    instagram_handle: cleanHandle,
                    follower_count: Number(metrics.followerCount) || 0,
                    full_name: metrics.displayName || '',
                    category: metrics.niche || '',
                    base_rate: Number(metrics.baseRate) || 0,
                    bio: metrics.bio || '',
                    avatar_url: metrics.profilePicUrl || '',
                    portfolio_link: (portfolioLink || '').trim(),
                    github_link: (githubLink || '').trim(),
                    linkedin_link: (linkedinLink || '').trim()
                }, { onConflict: 'id' });

            if (error) {
                triggerAlert('error', `Supabase Error: ${error.message}`);
            } else {
                triggerAlert('success', 'Media Kit updates successfully loaded to your pre-existing profiles table!');
            }
        } catch (err) {
            triggerAlert('error', `Runtime Error: ${err.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteProfile = async () => {
        const cleanHandle = handle.replace(/@/g, '').trim().toLowerCase();
        if (!cleanHandle) {
            triggerAlert('error', 'No active handle profile specified to clear.');
            return;
        }

        if (window.confirm(`Are you sure you want to permanently clear field data for @${cleanHandle}?`)) {
            const { error } = await supabase
                .from('profiles')
                .update({
                    follower_count: 0,
                    full_name: '',
                    category: '',
                    base_rate: 0,
                    bio: '',
                    avatar_url: '',
                    portfolio_link: '',
                    github_link: '',
                    linkedin_link: ''
                })
                .eq('instagram_handle', cleanHandle);

            if (error) {
                triggerAlert('error', `Reset Error: ${error.message}`);
            } else {
                setMetrics({
                    followerCount: 0,
                    displayName: '',
                    niche: '',
                    baseRate: 0,
                    bio: '',
                    profilePicUrl: ''
                });
                setPortfolioLink('');
                setGithubLink('');
                setLinkedinLink('');
                triggerAlert('success', `Data fields reset successfully.`);
            }
        }
    };

    const handleCopyLink = () => {
        const cleanHandle = handle.replace(/@/g, '').trim().toLowerCase();
        const generatedUrl = `${window.location.origin}/${cleanHandle}`;
        navigator.clipboard.writeText(generatedUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const cleanHandlePath = handle.replace(/@/g, '').trim().toLowerCase();

    // Prevent flashing layout layout structures while user checking is processing 
    if (isLoadingSession) {
        return (
            <div className="min-h-screen bg-[#090d16] flex items-center justify-center text-white font-sans">
                <div className="text-center">
                    <div className="w-8 h-8 border-4 border-[#00f2fe] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-sm text-gray-400">Verifying security session context...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#090d16] text-white font-sans p-8 flex flex-col items-center justify-center">
            <div className="w-full max-w-4xl">

                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Creator Dashboard</h1>
                        <p className="text-gray-400 text-sm mt-1">Configure profile metrics for active creator sessions</p>
                    </div>
                    <button onClick={handleSignOut} className="bg-[#1a2333] hover:bg-red-900/40 hover:text-red-400 transition text-sm px-4 py-2 rounded-md border border-gray-800">
                        Sign Out
                    </button>
                </div>

                {alert.type && (
                    <div className={`border px-4 py-3 rounded-md text-sm flex items-center mb-6 transition-all ${alert.type === 'success' ? 'bg-[#06261a] border-[#10b981] text-[#10b981]' : 'bg-[#2d1215] border-[#f43f5e] text-[#f43f5e]'}`}>
                        <span className="mr-2">{alert.type === 'success' ? '✓' : '✕'}</span> {alert.message}
                    </div>
                )}

                <form onSubmit={handleSaveForm} className="bg-[#111827] border border-gray-800 rounded-xl p-8 shadow-xl">

                    <div className="flex items-center space-x-4 mb-8">
                        <div className="w-16 h-16 rounded-full bg-[#1f2937] border-2 border-[#10b981] flex items-center justify-center overflow-hidden">
                            {metrics.profilePicUrl ? (
                                <img src={metrics.profilePicUrl} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            ) : (
                                <span className="text-lg font-bold text-gray-500">{handle ? handle.slice(0, 2).toUpperCase() : 'IG'}</span>
                            )}
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-white">{metrics.displayName || 'Media Kit Setup Profile'}</h2>
                            <p className="text-xs text-gray-400">{handle ? `@${cleanHandlePath}` : 'No account linked'}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Instagram Handle</label>
                            <div className="flex space-x-2">
                                <input
                                    type="text" value={handle} onChange={(e) => setHandle(e.target.value)}
                                    className="bg-[#090d16] border border-gray-800 rounded-md px-4 py-2.5 text-sm w-full focus:outline-none focus:border-gray-700 text-white"
                                />
                                <button
                                    type="button" onClick={handleInstagramSync} disabled={isSyncing}
                                    className="bg-[#064e3b] hover:bg-[#047857] text-[#10b981] font-semibold px-4 py-2.5 rounded-md text-sm border border-[#065f46] transition"
                                >
                                    {isSyncing ? 'Syncing...' : 'Sync'}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Generated Username URL (Auto)</label>
                            <div className="flex space-x-2">
                                <Link
                                    href={`/${cleanHandlePath}`}
                                    className="bg-[#090d16] border border-gray-800 rounded-md px-4 py-2.5 text-sm w-full text-blue-400 hover:text-blue-300 transition underline flex items-center truncate"
                                >
                                    {cleanHandlePath ? `/${cleanHandlePath}` : '/'}
                                </Link>
                                <button
                                    type="button" onClick={handleCopyLink}
                                    className="bg-[#1f2937] hover:bg-[#374151] border border-gray-700 px-4 py-2.5 rounded-md text-xs font-medium transition min-w-[85px]"
                                >
                                    {copied ? 'Copied! ✅' : 'Copy Link'}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Follower Count</label>
                            <input type="text" readOnly value={metrics.followerCount.toLocaleString()} className="bg-[#090d16] border border-gray-800 rounded-md px-4 py-2.5 text-sm w-full font-bold text-[#10b981] outline-none" />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Display Name</label>
                            <input type="text" value={metrics.displayName} onChange={(e) => setMetrics({ ...metrics, displayName: e.target.value })} className="bg-[#090d16] border border-gray-800 rounded-md px-4 py-2.5 text-sm w-full focus:outline-none focus:border-gray-700" />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Niche Category</label>
                            <input type="text" placeholder="Lifestyle, Tech, etc." value={metrics.niche} onChange={(e) => setMetrics({ ...metrics, niche: e.target.value })} className="bg-[#090d16] border border-gray-800 rounded-md px-4 py-2.5 text-sm w-full focus:outline-none focus:border-gray-700" />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Base Sponsorship Rate ($)</label>
                            <input type="number" value={metrics.baseRate || ''} onChange={(e) => setMetrics({ ...metrics, baseRate: Number(e.target.value) })} className="bg-[#090d16] border border-gray-800 rounded-md px-4 py-2.5 text-sm w-full focus:outline-none focus:border-gray-700" />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Personal Portfolio Link</label>
                            <input type="url" placeholder="https://yourportfolio.com" value={portfolioLink} onChange={(e) => setPortfolioLink(e.target.value)} className="bg-[#090d16] border border-gray-800 rounded-md px-4 py-2.5 text-sm w-full focus:outline-none focus:border-gray-700 text-white" />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">GitHub Profile Link</label>
                            <input type="url" placeholder="https://github.com/yourusername" value={githubLink} onChange={(e) => setGithubLink(e.target.value)} className="bg-[#090d16] border border-gray-800 rounded-md px-4 py-2.5 text-sm w-full focus:outline-none focus:border-gray-700 text-white" />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">LinkedIn Profile Link</label>
                            <input type="url" placeholder="https://linkedin.com/in/yourusername" value={linkedinLink} onChange={(e) => setLinkedinLink(e.target.value)} className="bg-[#090d16] border border-gray-800 rounded-md px-4 py-2.5 text-sm w-full focus:outline-none focus:border-gray-700 text-white" />
                        </div>
                    </div>

                    <div className="mb-8">
                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Profile Bio Description</label>
                        <textarea rows={3} value={metrics.bio} onChange={(e) => setMetrics({ ...metrics, bio: e.target.value })} className="bg-[#090d16] border border-gray-800 rounded-md p-4 text-sm w-full focus:outline-none focus:border-gray-700 resize-none" />
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t border-gray-800">
                        <button type="submit" disabled={isSaving} className="bg-[#00f2fe] hover:bg-[#00d8e4] text-black font-bold px-6 py-2.5 rounded-md text-sm transition shadow-lg shadow-[#00f2fe]/10">
                            {isSaving ? 'Saving Changes...' : 'Save and Create Media Kit'}
                        </button>
                        <button type="button" onClick={handleDeleteProfile} className="bg-transparent hover:bg-red-950/30 text-red-500 hover:text-red-400 font-semibold px-4 py-2.5 rounded-md text-sm border border-red-900/50 hover:border-red-500/50 transition">
                            Reset Fields
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}
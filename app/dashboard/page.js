'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function CreatorDashboard() {
    const [handle, setHandle] = useState('r_azim004');
    const [metrics, setMetrics] = useState({
        followerCount: 0,
        displayName: '',
        niche: '',
        baseRate: 0,
        bio: '',
        profilePicUrl: ''
    });

    const [isSyncing, setIsSyncing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [alert, setAlert] = useState({ type: null, message: '' });
    const [copied, setCopied] = useState(false);

    const triggerAlert = (type, message) => {
        setAlert({ type, message });
        setTimeout(() => setAlert({ type: null, message: '' }), 4000);
    };

    const handleSignOut = () => {
        if (window.confirm('Are you sure you want to sign out?')) {
            window.location.href = '/';
        }
    };

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

    const handleSaveForm = (e) => {
        e.preventDefault();
        setIsSaving(true);

        const cleanHandle = handle.replace(/@/g, '').trim().toLowerCase();
        const profilePayload = {
            handle: cleanHandle,
            ...metrics
        };

        // Save to localStorage using the clean string handle identifier key name
        localStorage.setItem(`profile_${cleanHandle}`, JSON.stringify(profilePayload));

        setTimeout(() => {
            setIsSaving(false);
            triggerAlert('success', 'Media Kit settings saved! Click or copy the link below.');
        }, 600);
    };

    // New Delete Profile handler function 
    const handleDeleteProfile = () => {
        const cleanHandle = handle.replace(/@/g, '').trim().toLowerCase();

        if (!cleanHandle) {
            triggerAlert('error', 'No active handle profile specified to clear.');
            return;
        }

        if (window.confirm(`Are you sure you want to permanently delete the profile data for @${cleanHandle}?`)) {
            // Delete storage record entry from disk
            localStorage.removeItem(`profile_${cleanHandle}`);

            // Revert state variables cleanly back to defaults
            setMetrics({
                followerCount: 0,
                displayName: '',
                niche: '',
                baseRate: 0,
                bio: '',
                profilePicUrl: ''
            });

            triggerAlert('success', `Profile data for @${cleanHandle} has been deleted successfully.`);
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
                    <div className={`border px-4 py-3 rounded-md text-sm flex items-center mb-6 transition-all ${alert.type === 'success' ? 'bg-[#06261a] border-[#10b981] text-[#10b981]' : 'bg-[#2d1215] border-[#f43f5e] text-[#f43f5e]'
                        }`}>
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
                    </div>

                    <div className="mb-8">
                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Profile Bio Description</label>
                        <textarea rows={3} value={metrics.bio} onChange={(e) => setMetrics({ ...metrics, bio: e.target.value })} className="bg-[#090d16] border border-gray-800 rounded-md p-4 text-sm w-full focus:outline-none focus:border-gray-700 resize-none" />
                    </div>

                    {/* Action buttons section at the bottom wrapper layout */}
                    <div className="flex justify-between items-center pt-4 border-t border-gray-800">
                        <button type="submit" disabled={isSaving} className="bg-[#00f2fe] hover:bg-[#00d8e4] text-black font-bold px-6 py-2.5 rounded-md text-sm transition shadow-lg shadow-[#00f2fe]/10">
                            {isSaving ? 'Saving Changes...' : 'Save and Create Media Kit'}
                        </button>

                        {/* Streamlined, standalone Delete button option */}
                        <button type="button" onClick={handleDeleteProfile} className="bg-transparent hover:bg-red-950/30 text-red-500 hover:text-red-400 font-semibold px-4 py-2.5 rounded-md text-sm border border-red-900/50 hover:border-red-500/50 transition">
                            Delete Profile
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}
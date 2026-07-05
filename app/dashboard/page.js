'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreatorDashboard() {
    const router = useRouter();

    // Form Input States
    const [instagramHandle, setInstagramHandle] = useState('');
    const [followerCount, setFollowerCount] = useState(0); // 📊 Holds exact numeric values dynamically parsed after sync
    const [displayName, setDisplayName] = useState('');
    const [nicheCategory, setNicheCategory] = useState('');
    const [baseRate, setBaseRate] = useState('');
    const [bio, setBio] = useState('');
    const [profilePic, setProfilePic] = useState(''); // 🖼️ Tracks incoming profile avatar source URLs

    // Status UI Visibility controls
    const [isSyncing, setIsSyncing] = useState(false);
    const [syncError, setSyncError] = useState(null);
    const [syncSuccess, setSyncSuccess] = useState(false);
    const [copyStatus, setCopyStatus] = useState('Copy');
    const [isMediaKitCreated, setIsMediaKitCreated] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // ⚡ Sync Action Handler - Captures live / backup info payload streams
    const handleInstagramSync = async () => {
        if (!instagramHandle.trim()) {
            setSyncError('Please enter an Instagram handle first before clicking Sync.');
            return;
        }

        setIsSyncing(true);
        setSyncError(null);
        setSyncSuccess(false);

        try {
            const res = await fetch(`/api/instagram?handle=${encodeURIComponent(instagramHandle.trim())}`);
            const data = await res.json();

            if (!res.ok || data.success === false) {
                throw new Error(data.error || data.message || 'Failed to pull profile data.');
            }

            // 🎯 Direct Capture of Follower Count and Profile Picture properties
            if (data.follower_count !== undefined) {
                setFollowerCount(Number(data.follower_count));
            }
            if (data.profile_pic_url) {
                setProfilePic(data.profile_pic_url);
            }

            // Secondary fields mapping
            if (data.full_name) setDisplayName(data.full_name);
            if (data.bio) setBio(data.bio);

            setSyncSuccess(true);
        } catch (err) {
            console.error('Frontend Sync Logs:', err.message);
            setSyncError(err.message || 'Could not sync profile data automatically.');
        } finally {
            setIsSyncing(false);
        }
    };

    // 💾 Form Submission
    const handleSaveKit = (e) => {
        e.preventDefault();
        if (!instagramHandle.trim()) {
            setSyncError('An Instagram handle is required to generate your public kit layout page.');
            return;
        }
        setIsMediaKitCreated(true);
        alert('Media Kit Configuration Saved Safely!');
    };

    // 📋 Copy URL Action Handler
    const handleCopyLink = async () => {
        const currentHandle = instagramHandle.replace(/@/g, '').trim();
        const linkToCopy = `http://localhost:3000/${currentHandle}`;

        try {
            await navigator.clipboard.writeText(linkToCopy);
            setCopyStatus('Copied! ✓');
            setTimeout(() => setCopyStatus('Copy'), 2000);
        } catch (err) {
            console.error('Failed to copy text:', err);
        }
    };

    // 🚪 Sign Out Handler
    const handleSignOut = () => {
        setInstagramHandle('');
        setFollowerCount(0);
        setDisplayName('');
        setBio('');
        setProfilePic('');
        setIsMediaKitCreated(false);
        router.push('/login');
    };

    return (
        <div className="min-h-screen bg-[#070b13] text-gray-100 p-8 flex flex-col items-center relative">
            <div className="w-full max-w-4xl">

                {/* Header Elements */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-white">Creator Dashboard</h1>
                        <p className="text-sm text-gray-400 mt-1">Configure profile metrics for active creator sessions</p>
                    </div>
                    <button
                        onClick={handleSignOut}
                        className="bg-[#131926] hover:bg-red-950/40 hover:text-red-400 border border-gray-800 hover:border-red-900/60 text-sm px-4 py-2 rounded-lg transition font-medium"
                    >
                        Sign Out
                    </button>
                </div>

                {/* Action Status Banners */}
                {syncError && (
                    <div className="bg-red-950/40 border border-red-800 text-red-400 p-4 rounded-xl mb-6 flex items-center gap-2 text-sm">
                        <span>❌</span> {syncError}
                    </div>
                )}
                {syncSuccess && (
                    <div className="bg-emerald-950/40 border border-emerald-800 text-emerald-400 p-4 rounded-xl mb-6 flex items-center gap-2 text-sm">
                        <span>✅</span> Profile metrics synchronized cleanly from live engine profiles!
                    </div>
                )}

                {/* Configuration Core Card Grid Frame */}
                <div className="bg-[#0f1624] border border-gray-800/60 rounded-2xl p-6 shadow-xl mb-6">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
                        <div className="flex items-center gap-4">
                            {/* 📷 Dynamic Avatar Viewer Box */}
                            <div className="w-14 h-14 rounded-full bg-[#1b2333] border-2 border-emerald-500 flex items-center justify-center overflow-hidden shrink-0 shadow-lg shadow-emerald-500/10">
                                {profilePic ? (
                                    <img src={profilePic} alt="Instagram Profile Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-2xl">👤</span>
                                )}
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-white">Media Kit Setup Profile</h2>
                                <p className="text-xs text-gray-400">Current session metrics initialized</p>
                            </div>
                        </div>

                        {/* 🔗 Link Container - Visible ONLY after submission */}
                        {isMediaKitCreated && (
                            <div className="flex items-center justify-between gap-3 bg-[#070b13] p-2 px-3 rounded-lg border border-gray-800 text-xs animate-in fade-in duration-300">
                                <span className="text-emerald-400 font-mono">
                                    localhost:3000/{instagramHandle.replace(/@/g, '').trim()}
                                </span>
                                <button
                                    type="button"
                                    onClick={handleCopyLink}
                                    className="text-gray-300 hover:text-white bg-[#1a2333] px-2.5 py-1 rounded border border-gray-700/60 transition active:scale-95 font-medium min-w-[65px]"
                                >
                                    {copyStatus}
                                </button>
                            </div>
                        )}
                    </div>

                    <form onSubmit={handleSaveKit} className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                            {/* Handle Entry field */}
                            <div>
                                <label className="block text-xs font-semibold tracking-wider text-gray-400 uppercase mb-2">Instagram Handle</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={instagramHandle}
                                        placeholder="Enter username (e.g. r_azim004)"
                                        onChange={(e) => {
                                            setInstagramHandle(e.target.value);
                                            setIsMediaKitCreated(false);
                                        }}
                                        className="w-full bg-[#070b13] border border-gray-800 focus:border-blue-500 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none placeholder-gray-600"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleInstagramSync}
                                        disabled={isSyncing}
                                        className="bg-[#1a2333] hover:bg-[#25324a] text-emerald-400 border border-emerald-800/40 text-xs px-4 rounded-lg font-medium transition disabled:opacity-50 flex items-center gap-1 shrink-0"
                                    >
                                        {isSyncing ? 'Syncing...' : '⚡ Sync'}
                                    </button>
                                </div>
                            </div>

                            {/* URL Generation Mirror block */}
                            <div>
                                <label className="block text-xs font-semibold tracking-wider text-gray-400 uppercase mb-2">Generated Username URL (Auto)</label>
                                <input
                                    type="text"
                                    value={instagramHandle.trim() ? `localhost:3000/${instagramHandle.replace(/@/g, '').trim()}` : 'Awaiting input entry...'}
                                    disabled
                                    className="w-full bg-[#070b13]/60 border border-gray-800 text-gray-500 rounded-lg px-4 py-2.5 text-sm cursor-not-allowed"
                                />
                            </div>

                            {/* Follower Count Display Input */}
                            <div>
                                <label className="block text-xs font-semibold tracking-wider text-gray-400 uppercase mb-2">Follower Count (Captured Live)</label>
                                <input
                                    type="number"
                                    value={followerCount}
                                    disabled
                                    className="w-full bg-[#070b13]/60 border border-gray-800 text-emerald-400 font-mono font-bold rounded-lg px-4 py-2.5 text-sm cursor-not-allowed"
                                />
                            </div>

                            {/* Display Name Input */}
                            <div>
                                <label className="block text-xs font-semibold tracking-wider text-gray-400 uppercase mb-2">Display Name</label>
                                <input
                                    type="text"
                                    value={displayName}
                                    placeholder="Your brand display name"
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    className="w-full bg-[#070b13] border border-gray-800 focus:border-blue-500 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none placeholder-gray-600"
                                />
                            </div>

                            {/* Niche Category Input Field */}
                            <div>
                                <label className="block text-xs font-semibold tracking-wider text-gray-400 uppercase mb-2">Niche Category</label>
                                <input
                                    type="text"
                                    value={nicheCategory}
                                    placeholder="e.g. Lifestyle, Education, Tech"
                                    onChange={(e) => setNicheCategory(e.target.value)}
                                    className="w-full bg-[#070b13] border border-gray-800 focus:border-blue-500 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none placeholder-gray-600"
                                />
                            </div>

                            {/* Base Rates Setup */}
                            <div>
                                <label className="block text-xs font-semibold tracking-wider text-gray-400 uppercase mb-2">Base Sponsorship Rate ($)</label>
                                <input
                                    type="number"
                                    value={baseRate}
                                    placeholder="0"
                                    onChange={(e) => setBaseRate(e.target.value)}
                                    className="w-full bg-[#070b13] border border-gray-800 focus:border-blue-500 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none placeholder-gray-600"
                                />
                            </div>

                        </div>

                        {/* Profile Bio Long Text Inputs */}
                        <div>
                            <label className="block text-xs font-semibold tracking-wider text-gray-400 uppercase mb-2">Profile Bio Description</label>
                            <textarea
                                rows={4}
                                value={bio}
                                placeholder="Write an impactful overview bio narrative description describing your creative background..."
                                onChange={(e) => setBio(e.target.value)}
                                className="w-full bg-[#070b13] border border-gray-800 focus:border-blue-500 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none resize-none leading-relaxed placeholder-gray-600"
                            />
                        </div>

                        {/* Form Submit Row Elements */}
                        <div className="pt-2 flex justify-between items-center">
                            <button
                                type="submit"
                                className="bg-[#00c896] hover:bg-[#00b386] text-slate-950 font-semibold text-sm px-5 py-3 rounded-xl transition shadow-lg shadow-emerald-500/10"
                            >
                                Save and Create Media Kit
                            </button>

                            <button
                                type="button"
                                onClick={() => setShowDeleteModal(true)}
                                className="text-gray-500 hover:text-red-400 text-xs font-medium transition underline underline-offset-4"
                            >
                                Delete Account completely
                            </button>
                        </div>

                    </form>
                </div>

            </div>

            {/* ⚠️ DELETE ACCOUNT OVERLAY MODAL */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-[#0f1624] border border-red-900/60 rounded-2xl p-6 max-w-md w-full shadow-2xl animate-in fade-in zoom-in-95 duration-150">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <span className="text-red-500">⚠️</span> Delete Account Profile?
                        </h3>
                        <p className="text-sm text-gray-400 mt-3 leading-relaxed">
                            Are you absolutely sure? This will remove all calculated follower records, configured media kits, and reset dashboard states back to empty templates permanently.
                        </p>
                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setShowDeleteModal(false)}
                                className="bg-[#1a2333] border border-gray-800 text-gray-300 px-4 py-2 rounded-lg text-sm transition hover:bg-[#25324a]"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-lg text-sm transition shadow-lg shadow-red-600/20"
                                onClick={() => {
                                    alert('Account removed.');
                                    setShowDeleteModal(false);
                                    router.push('/login');
                                }}
                            >
                                Yes, Delete My Data
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
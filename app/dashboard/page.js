'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form states matching our database schema columns
    const [username, setUsername] = useState('');
    const [fullName, setFullName] = useState('');
    const [bio, setBio] = useState('');
    const [category, setCategory] = useState('');
    const [followerCount, setFollowerCount] = useState(0);
    const [baseRate, setBaseRate] = useState(0);
    const [instagram, setInstagram] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchProfile();
    }, []);

    // 1. Fetch existing profile data if it exists
    const fetchProfile = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                router.push('/login');
                return;
            }

            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (data) {
                setUsername(data.username || '');
                setFullName(data.full_name || '');
                setBio(data.bio || '');
                setCategory(data.category || '');
                setFollowerCount(data.follower_count || 0);
                setBaseRate(data.base_rate || 0);
                setInstagram(data.instagram_handle || '');
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    };

    // 2. Save or Update profile data in Supabase
    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage('');

        try {
            const { data: { user } } = await supabase.auth.getUser();

            const updates = {
                id: user.id,
                username: username.toLowerCase().trim(),
                full_name: fullName,
                bio,
                category,
                follower_count: parseInt(followerCount),
                base_rate: parseFloat(baseRate),
                instagram_handle: instagram,
            };

            const { error } = await supabase.from('profiles').upsert(updates);

            if (error) throw error;
            setMessage('✅ Media Kit profile updated successfully!');
        } catch (error) {
            setMessage(`❌ Error updating profile: ${error.message}`);
        } finally {
            setSaving(false);
        }
    };

    // 3. Log Out function
    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push('/login');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 text-white flex justify-center items-center font-semibold">
                Loading Your Control Center...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white p-6 md:p-12">
            <div className="max-w-4xl mx-auto space-y-8">

                {/* HEADER SECTION */}
                <div className="flex justify-between items-center border-b border-slate-900 pb-6">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight">Creator Dashboard</h1>
                        <p className="text-sm text-slate-400">Manage your metrics and build your public page</p>
                    </div>
                    <button
                        onClick={handleSignOut}
                        className="bg-slate-900 hover:bg-slate-800 border border-slate-800 px-4 py-2 rounded-xl text-sm transition-colors"
                    >
                        Sign Out
                    </button>
                </div>

                {message && (
                    <div className="p-4 bg-slate-900 border border-slate-800 text-sm font-medium rounded-xl text-emerald-400">
                        {message}
                    </div>
                )}

                {/* PROFILE EDITOR FORM */}
                <form onSubmit={handleUpdateProfile} className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6">
                    <h2 className="text-xl font-bold border-b border-slate-800 pb-4">Media Kit Configurations</h2>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Unique Username</label>
                            <input
                                type="text"
                                placeholder="suresh-vlogs"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Display Name</label>
                            <input
                                type="text"
                                placeholder="Suresh Kumar"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Follower Count</label>
                            <input
                                type="number"
                                placeholder="15000"
                                value={followerCount}
                                onChange={(e) => setFollowerCount(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Base Sponsorship Rate ($)</label>
                            <input
                                type="number"
                                placeholder="150"
                                value={baseRate}
                                onChange={(e) => setBaseRate(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Niche Niche Category</label>
                            <input
                                type="text"
                                placeholder="Food / Travel / Technology"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Instagram Handle</label>
                            <input
                                type="text"
                                placeholder="suresh_vlogs_official"
                                value={instagram}
                                onChange={(e) => setInstagram(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Profile Bio Description</label>
                        <textarea
                            rows="3"
                            placeholder="Tell brands why they should work with you..."
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 transition-colors resize-none"
                        />
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={saving}
                            className="w-full md:w-auto bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-3 px-8 rounded-xl text-sm transition-all shadow-lg shadow-emerald-500/10 disabled:opacity-50"
                        >
                            {saving ? 'Saving Metrics...' : 'Save and Update Profile'}
                        </button>
                    </div>
                </form>

            </div>
        </div>
    );
}
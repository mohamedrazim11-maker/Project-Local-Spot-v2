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

    // --- New Packages State ---
    const [packages, setPackages] = useState([]);
    const [newPkg, setNewPkg] = useState({ title: '', description: '', price: '' });
    const [isAddingPackage, setIsAddingPackage] = useState(false);

    const [isSyncing, setIsSyncing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [alert, setAlert] = useState({ type: null, message: '' });
    const [copied, setCopied] = useState(false);
    const [isLoadingSession, setIsLoadingSession] = useState(true);

    // Account Deletion States
    const [deleting, setDeleting] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

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

    // Route protection initialization
    useEffect(() => {
        const checkUserSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push('/');
            } else {
                setIsLoadingSession(false);
                // Fetch creator's existing packages once session is verified
                fetchCreatorPackages(session.user.id);
            }
        };
        checkUserSession();
    }, [router]);

    // Fetch existing packages associated with the active profile
    const fetchCreatorPackages = async (userId) => {
        const { data, error } = await supabase
            .from('packages')
            .select('*')
            .eq('profile_id', userId)
            .order('created_at', { ascending: true });

        if (data && !error) {
            setPackages(data);
        }
    };

    const handleInstagramSync = async () => {
        if (!handle.trim()) {
            triggerAlert('error', 'Please enter an Instagram handle before syncing.');
            return;
        }

        // Live validation for illegal handle syntax characters
        const invalidChars = /[^a-zA-Z0-9._]/g;
        if (invalidChars.test(handle.replace(/@/g, ''))) {
            triggerAlert('error', 'Instagram handle can only contain letters, numbers, periods, and underscores.');
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

    // Automatically load existing profile data
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

    // Helper function to dynamically attach protocol string markers
    const formatUrl = (url) => {
        const trimmed = (url || '').trim();
        if (!trimmed) return '';
        if (/^https?:\/\//i.test(trimmed)) return trimmed;
        return `https://${trimmed}`;
    };

    // Save profile updates
    const handleSaveForm = async (e) => {
        e.preventDefault();

        const cleanHandle = handle.replace(/@/g, '').trim().toLowerCase();

        // Validate Instagram Handle syntax constraints
        const invalidChars = /[^a-zA-Z0-9._]/g;
        if (invalidChars.test(cleanHandle)) {
            triggerAlert('error', 'Saved handle can only contain letters, numbers, periods, or underscores.');
            return;
        }

        setIsSaving(true);

        try {
            const { data: sessionData } = await supabase.auth.getSession();
            const currentUserId = sessionData?.session?.user?.id;

            if (!currentUserId) {
                triggerAlert('error', 'Missing Session. Redirecting...');
                router.push('/');
                return;
            }

            // Secure validation filtering for external target URLs
            const sanitizedPortfolio = formatUrl(portfolioLink);
            const sanitizedGithub = formatUrl(githubLink);
            const sanitizedLinkedin = formatUrl(linkedinLink);

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
                    portfolio_link: sanitizedPortfolio,
                    github_link: sanitizedGithub,
                    linkedin_link: sanitizedLinkedin
                }, { onConflict: 'id' });

            if (error) {
                triggerAlert('error', `Supabase Error: ${error.message}`);
            } else {
                setPortfolioLink(sanitizedPortfolio);
                setGithubLink(sanitizedGithub);
                setLinkedinLink(sanitizedLinkedin);
                triggerAlert('success', 'Media Kit updates successfully loaded!');
            }
        } catch (err) {
            triggerAlert('error', `Runtime Error: ${err.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    // --- Create a Package ---
    const handleAddPackage = async (e) => {
        e.preventDefault();
        if (!newPkg.title || !newPkg.price) {
            triggerAlert('error', 'Package Title and Price are required.');
            return;
        }

        if (Number(newPkg.price) < 0) {
            triggerAlert('error', 'Price cannot be a negative value.');
            return;
        }

        setIsAddingPackage(true);
        const { data: sessionData } = await supabase.auth.getSession();
        const currentUserId = sessionData?.session?.user?.id;

        const { data, error } = await supabase
            .from('packages')
            .insert([{
                profile_id: currentUserId,
                title: newPkg.title.trim(),
                description: (newPkg.description || '').trim(),
                price: Number(newPkg.price) || 0
            }])
            .select();

        if (error) {
            triggerAlert('error', `Failed to add package: ${error.message}`);
        } else {
            setPackages([...packages, ...data]);
            setNewPkg({ title: '', description: '', price: '' });
            triggerAlert('success', 'New campaign package activated!');
        }
        setIsAddingPackage(false);
    };

    // --- Delete a Package ---
    const handleDeletePackage = async (id) => {
        if (!window.confirm('Delete this service package?')) return;

        const { error } = await supabase
            .from('packages')
            .delete()
            .eq('id', id);

        if (error) {
            triggerAlert('error', `Could not delete: ${error.message}`);
        } else {
            setPackages(packages.filter(p => p.id !== id));
            triggerAlert('success', 'Package removed.');
        }
    };

    const handleCopyLink = () => {
        const cleanHandle = handle.replace(/@/g, '').trim().toLowerCase();
        const generatedUrl = `${window.location.origin}/${cleanHandle}`;
        navigator.clipboard.writeText(generatedUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // --- Delete Complete User Account & Data ---
    const handleDeleteAccount = async () => {
        setDeleting(true);
        try {
            const { error } = await supabase.rpc('delete_user_account');
            if (error) throw error;

            await supabase.auth.signOut();
            router.push('/');
            router.refresh();
        } catch (err) {
            triggerAlert('error', err.message || 'An error occurred while deleting your account.');
            setDeleting(false);
        }
    };

    const cleanHandlePath = handle.replace(/@/g, '').trim().toLowerCase();

    if (isLoadingSession) {
        return (
            <div className="min-h-screen bg-[#090d16] flex items-center justify-center text-white">
                <div className="text-center">
                    <div className="w-8 h-8 border-4 border-[#00f2fe] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-sm text-gray-400">Verifying session context...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#090d16] text-white p-8 flex flex-col items-center justify-center font-sans">
            <div className="w-full max-w-4xl">

                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Creator Dashboard</h1>
                        <p className="text-gray-400 text-sm mt-1">Configure profile metrics and campaign rates</p>
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

                {/* MAIN FORM */}
                <form onSubmit={handleSaveForm} className="bg-[#111827] border border-gray-800 rounded-xl p-8 shadow-xl mb-8">
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
                                <input type="text" value={handle} onChange={(e) => setHandle(e.target.value)} className="bg-[#090d16] border border-gray-800 rounded-md px-4 py-2.5 text-sm w-full focus:outline-none focus:border-gray-700 text-white" />
                                <button type="button" onClick={handleInstagramSync} disabled={isSyncing} className="bg-[#064e3b] hover:bg-[#047857] text-[#10b981] font-semibold px-4 py-2.5 rounded-md text-sm border border-[#065f46] transition disabled:opacity-50" >
                                    {isSyncing ? 'Syncing...' : 'Sync'}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Generated Username URL (Auto)</label>
                            <div className="flex space-x-2">
                                <Link href={`/${cleanHandlePath}`} className="bg-[#090d16] border border-gray-800 rounded-md px-4 py-2.5 text-sm w-full text-blue-400 hover:text-blue-300 transition underline flex items-center truncate" >
                                    {cleanHandlePath ? `/${cleanHandlePath}` : '/'}
                                </Link>
                                <button type="button" onClick={handleCopyLink} className="bg-[#1f2937] hover:bg-[#374151] border border-gray-700 px-4 py-2.5 rounded-md text-xs font-medium transition min-w-[85px]" >
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
                            <input type="number" min="0" value={metrics.baseRate || ''} onChange={(e) => setMetrics({ ...metrics, baseRate: Math.max(0, Number(e.target.value)) })} className="bg-[#090d16] border border-gray-800 rounded-md px-4 py-2.5 text-sm w-full focus:outline-none focus:border-gray-700" />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Personal Portfolio Link</label>
                            <input type="text" placeholder="yourportfolio.com" value={portfolioLink} onChange={(e) => setPortfolioLink(e.target.value)} className="bg-[#090d16] border border-gray-800 rounded-md px-4 py-2.5 text-sm w-full focus:outline-none focus:border-gray-700" />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">GitHub Profile Link</label>
                            <input type="text" placeholder="github.com/username" value={githubLink} onChange={(e) => setGithubLink(e.target.value)} className="bg-[#090d16] border border-gray-800 rounded-md px-4 py-2.5 text-sm w-full focus:outline-none focus:border-gray-700" />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">LinkedIn Profile Link</label>
                            <input type="text" placeholder="linkedin.com/in/username" value={linkedinLink} onChange={(e) => setLinkedinLink(e.target.value)} className="bg-[#090d16] border border-gray-800 rounded-md px-4 py-2.5 text-sm w-full focus:outline-none focus:border-gray-700" />
                        </div>
                    </div>

                    <div className="mb-8">
                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Profile Bio Description</label>
                        <textarea rows={3} value={metrics.bio} onChange={(e) => setMetrics({ ...metrics, bio: e.target.value })} className="bg-[#090d16] border border-gray-800 rounded-md p-4 text-sm w-full focus:outline-none focus:border-gray-700 resize-none" />
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t border-gray-800">
                        <button type="submit" disabled={isSaving} className="bg-[#00f2fe] hover:bg-[#00d8e4] text-black font-bold px-6 py-2.5 rounded-md text-sm transition shadow-lg disabled:opacity-50">
                            {isSaving ? 'Saving Changes...' : 'Save Profile Core'}
                        </button>
                    </div>
                </form>

                {/* --- SERVICE PACKAGES CONFIGURATOR --- */}
                <div className="bg-[#111827] border border-gray-800 rounded-xl p-8 shadow-xl mb-8">
                    <h2 className="text-xl font-bold mb-2">Sponsorship Packages & Bundles</h2>
                    <p className="text-xs text-gray-400 mb-6">Create predefined service rates for brands to instantly review and order.</p>

                    <form onSubmit={handleAddPackage} className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-[#090d16] p-4 rounded-lg border border-gray-800 mb-6">
                        <div className="md:col-span-2">
                            <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Package Title</label>
                            <input type="text" placeholder="e.g., 1 Dedicated IG Reel + 1 Story Link" value={newPkg.title} onChange={e => setNewPkg({ ...newPkg, title: e.target.value })} className="bg-[#111827] border border-gray-800 rounded px-3 py-2 text-sm w-full focus:outline-none text-white" />
                        </div>
                        <div>
                            <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Price ($)</label>
                            <input type="number" placeholder="450" value={newPkg.price} onChange={e => setNewPkg({ ...newPkg, price: e.target.value })} className="bg-[#111827] border border-gray-800 rounded px-3 py-2 text-sm w-full focus:outline-none text-white" />
                        </div>
                        <div className="md:col-span-3">
                            <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Package Deliverables Description</label>
                            <textarea rows={2} placeholder="Detail exact timeline deliverables, usage rights terms, or product specifications..." value={newPkg.description} onChange={e => setNewPkg({ ...newPkg, description: e.target.value })} className="bg-[#111827] border border-gray-800 rounded px-3 py-2 text-sm w-full focus:outline-none resize-none text-white" />
                        </div>
                        <div className="md:col-span-3 text-right">
                            <button type="submit" disabled={isAddingPackage} className="bg-[#10b981] hover:bg-[#059669] text-white px-4 py-1.5 text-xs font-bold rounded transition disabled:opacity-50">
                                {isAddingPackage ? 'Adding...' : '+ Add Package Bundle'}
                            </button>
                        </div>
                    </form>

                    {/* Live List Display */}
                    <div className="space-y-3">
                        {packages.length === 0 ? (
                            <p className="text-xs text-gray-500 italic">No packages configured yet. Create your first bundle bundle layout above!</p>
                        ) : (
                            packages.map((pkg) => (
                                <div key={pkg.id} className="flex justify-between items-start border border-gray-800/60 bg-[#090d16]/40 p-4 rounded-lg">
                                    <div className="max-w-[80%]">
                                        <h4 className="text-sm font-bold text-white flex items-center gap-2">
                                            {pkg.title} <span className="text-[#00f2fe] text-xs font-medium">${pkg.price}</span>
                                        </h4>
                                        <p className="text-xs text-gray-400 mt-1 whitespace-pre-wrap">{pkg.description || 'No description listed.'}</p>
                                    </div>
                                    <button type="button" onClick={() => handleDeletePackage(pkg.id)} className="text-xs text-red-500 hover:text-red-400 bg-red-950/10 border border-red-900/30 hover:border-red-500/50 px-2 py-1 rounded transition">
                                        Remove
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* --- DANGER ZONE / ACCOUNT REMOVAL PANEL --- */}
                <div className="bg-red-950/10 border border-red-900/30 rounded-xl p-8 shadow-xl">
                    <h3 className="text-lg font-bold text-red-400 mb-1">Danger Zone</h3>
                    <p className="text-xs text-gray-400 mb-6 leading-relaxed">
                        Deleting your account will purge all user configurations, profile routes, and database logs permanently. This operation cannot be rolled back.
                    </p>

                    {!showConfirm ? (
                        <button
                            type="button"
                            onClick={() => setShowConfirm(true)}
                            className="bg-red-950/40 hover:bg-red-900/40 border border-red-900/50 text-red-400 text-xs font-bold px-5 py-3 rounded-md transition w-full md:w-auto"
                        >
                            Delete Account...
                        </button>
                    ) : (
                        <div className="space-y-4">
                            <p className="text-xs font-bold text-red-400 animate-pulse">
                                ⚠️ Are you absolutely sure? This will delete your authentication profile and table data.
                            </p>
                            <div className="flex flex-wrap gap-3">
                                <button
                                    type="button"
                                    disabled={deleting}
                                    onClick={handleDeleteAccount}
                                    className="bg-red-600 hover:bg-red-500 text-white text-xs font-bold px-5 py-3 rounded-md transition disabled:opacity-50"
                                >
                                    {deleting ? 'Purging Records...' : 'Yes, Confirm Delete'}
                                </button>
                                <button
                                    type="button"
                                    disabled={deleting}
                                    onClick={() => setShowConfirm(false)}
                                    className="bg-[#1f2937] hover:bg-[#374151] text-gray-300 border border-gray-700 text-xs font-bold px-5 py-3 rounded-md transition"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
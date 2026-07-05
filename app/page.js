import Link from 'next/link';

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-emerald-500 selection:text-slate-900">

            {/* 1. NAVIGATION BAR */}
            <header className="border-b border-slate-900 sticky top-0 bg-slate-950/80 backdrop-blur-md z-50">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl font-black tracking-tight bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
                            LocalSpot.
                        </span>
                    </div>
                    <nav className="flex items-center gap-6">
                        <Link href="/login" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
                            Sign In
                        </Link>
                        <Link href="/login" className="text-sm font-medium bg-emerald-500 hover:bg-emerald-600 text-slate-950 px-4 py-2 rounded-full transition-all shadow-lg shadow-emerald-500/20">
                            Create Your Kit
                        </Link>
                    </nav>
                </div>
            </header>

            {/* 2. HERO SECTION */}
            <main className="max-w-7xl mx-auto px-6 pt-20 pb-16 text-center">
                <div className="max-w-3xl mx-auto space-y-6">
                    <span className="text-xs font-semibold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                        For Micro-Influencers & Creators
                    </span>
                    <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight leading-none">
                        Share Your Stats. <br />
                        <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                            Get Local Brand Deals.
                        </span>
                    </h1>
                    <p className="text-lg md:text-xl text-slate-400 font-normal max-w-2xl mx-auto">
                        Turn your Instagram or TikTok analytics and sponsorship rates into a beautiful, professional media kit website in under a minute. Share it instantly with local businesses for free!
                    </p>
                    <div className="pt-4">
                        <Link href="/login" className="inline-flex items-center justify-center text-base font-semibold bg-emerald-500 hover:bg-emerald-600 text-slate-950 px-8 py-4 rounded-full transition-all shadow-xl shadow-emerald-500/20 hover:scale-105 transform">
                            Start Free Media Kit
                        </Link>
                    </div>
                </div>

                {/* 3. FEATURES SECTION */}
                <section className="mt-32 grid md:grid-cols-3 gap-8 text-left">
                    <div className="p-8 rounded-3xl bg-slate-900/50 border border-slate-900 hover:border-slate-800 transition-colors">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 font-bold text-xl mb-6">
                            ✨
                        </div>
                        <h3 className="text-xl font-bold mb-2">1-Minute Setup</h3>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            No coding required. Just paste your social links, type your sponsorship package pricing, and your customized webpage is ready.
                        </p>
                    </div>

                    <div className="p-8 rounded-3xl bg-slate-900/50 border border-slate-900 hover:border-slate-800 transition-colors">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 font-bold text-xl mb-6">
                            📊
                        </div>
                        <h3 className="text-xl font-bold mb-2">Showcase Analytics</h3>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            Display your follower milestones, niche categories, and target audiences clearly to potential local brand sponsors.
                        </p>
                    </div>

                    <div className="p-8 rounded-3xl bg-slate-900/50 border border-slate-900 hover:border-slate-800 transition-colors">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 font-bold text-xl mb-6">
                            🔗
                        </div>
                        <h3 className="text-xl font-bold mb-2">Custom Bio Link</h3>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            Get a dedicated unique public link to drop right into your Instagram or TikTok bio (e.g., localspot.com/yourusername).
                        </p>
                    </div>
                </section>
            </main>

            {/* 4. FOOTER */}
            <footer className="border-t border-slate-900 mt-20 py-8 text-center text-sm text-slate-500">
                <p>© 2026 LocalSpot. Built for Creators.</p>
            </footer>

        </div>
    );
}
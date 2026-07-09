import Link from 'next/link';

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-[#060a12] text-white antialiased selection:bg-cyan-500/30">

            {/* 1. NAVIGATION HEADER */}
            <nav className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between border-b border-gray-900/40">
                <div className="flex items-center gap-2">
                    <span className="text-xl font-black tracking-tight text-[#00f2fe]">
                        LocalSpot<span className="text-emerald-400">.</span>
                    </span>
                </div>

                <div className="flex items-center gap-6">
                    {/* CRITICAL ROUTING LINK FOR PASSWORD SIGN IN */}
                    <Link
                        href="/login?mode=signin"
                        className="text-sm font-medium text-gray-300 hover:text-white transition"
                    >
                        Sign In
                    </Link>

                    <Link
                        href="/login"
                        className="bg-emerald-500 text-[#060a12] px-4 py-2 rounded-full text-sm font-bold shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:bg-emerald-400 transition"
                    >
                        Create Your Kit
                    </Link>
                </div>
            </nav>

            {/* 2. HERO CONTENT SECTION */}
            <main className="max-w-4xl mx-auto text-center px-6 pt-24 pb-16">
                <div className="inline-block bg-[#022c22]/50 border border-emerald-900/60 rounded-full px-4 py-1.5 mb-8">
                    <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-emerald-400">
                        For Micro-Influencers & Creators
                    </p>
                </div>

                <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-6 max-w-3xl mx-auto leading-[1.1]">
                    Share Your Stats.<br />
                    <span className="bg-gradient-to-r from-[#00f2fe] to-[#4facfe] bg-clip-text text-transparent">
                        Get Local Brand Deals.
                    </span>
                </h1>

                <p className="text-base text-gray-400 max-w-xl mx-auto mb-10 leading-relaxed">
                    Turn your Instagram or TikTok analytics and sponsorship rates into a beautiful, professional media kit website in under a minute. Share it instantly with local businesses for free!
                </p>

                <Link
                    href="/login"
                    className="inline-block bg-gradient-to-r from-[#00f2fe] to-[#4facfe] text-[#060a12] font-black text-sm px-8 py-4 rounded-xl shadow-[0_4px_30px_rgba(0,242,254,0.15)] hover:opacity-95 active:scale-[0.99] transition"
                >
                    Start Free Media Kit
                </Link>
            </main>

            {/* 3. VALUE PROPS / FEATURES GRID */}
            <section className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Card 1 */}
                <div className="bg-[#0d1424] border border-[#1e293b]/40 p-8 rounded-2xl shadow-xl">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center mb-6 border border-amber-500/20">
                        <span className="text-amber-400 font-bold">✨</span>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-3">1-Minute Setup</h3>
                    <p className="text-xs text-gray-400 leading-relaxed">
                        No coding required. Just paste your social links, type your sponsorship package pricing, and your customized webpage is ready.
                    </p>
                </div>

                {/* Card 2 */}
                <div className="bg-[#0d1424] border border-[#1e293b]/40 p-8 rounded-2xl shadow-xl">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center mb-6 border border-purple-500/20">
                        <span className="text-purple-400 font-bold">📊</span>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-3">Showcase Analytics</h3>
                    <p className="text-xs text-gray-400 leading-relaxed">
                        Display your follower milestones, niche categories, and target audiences clearly to potential local brand sponsors.
                    </p>
                </div>

                {/* Card 3 */}
                <div className="bg-[#0d1424] border border-[#1e293b]/40 p-8 rounded-2xl shadow-xl">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center mb-6 border border-blue-500/20">
                        <span className="text-blue-400 font-bold">🔗</span>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-3">Custom Bio Link</h3>
                    <p className="text-xs text-gray-400 leading-relaxed">
                        Get a dedicated unique public link to drop right into your Instagram or TikTok bio (e.g., localspot.com/yourusername).
                    </p>
                </div>

            </section>
        </div>
    );
}
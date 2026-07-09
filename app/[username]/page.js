import { supabase } from '@/lib/supabase';
import PublicCreatorProfile from './PublicCreatorProfile';

// Dynamic SEO Metadata Generator running securely on the server
export async function generateMetadata({ params }) {
    // Await params promise before destructuring in newer Next.js versions
    const resolvedParams = await params;
    const { username } = resolvedParams;
    const cleanHandle = String(username || '').replace(/@/g, '').trim().toLowerCase();

    // Fetch live data directly from the profiles database
    const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, category, bio, avatar_url')
        .eq('username', cleanHandle)
        .maybeSingle();

    if (!profile) {
        return {
            title: 'Creator Profile | Media Kit',
            description: 'View this creator\'s verified media kit, sponsorship packages, and live audience metrics.',
        };
    }

    const title = `${profile.full_name || cleanHandle} | Media Kit & Packages`;
    const description = profile.bio || `Check out my verified ${profile.category || 'content'} portfolio, audience metrics, and brand sponsorship bundles.`;
    const image = profile.avatar_url || '/default-preview.png';

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            type: 'profile',
            images: [
                {
                    url: image,
                    width: 400,
                    height: 400,
                    alt: `${profile.full_name || cleanHandle}'s Profile Picture`,
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [image],
        },
    };
}

export default async function Page({ params }) {
    // Await params promise here as well before passing it down
    const resolvedParams = await params;
    return <PublicCreatorProfile params={resolvedParams} />;
}
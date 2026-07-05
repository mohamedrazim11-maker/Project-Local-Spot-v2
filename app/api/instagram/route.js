import { NextResponse } from 'next/server';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const handle = searchParams.get('handle');

    if (!handle) {
        return NextResponse.json({ success: false, error: 'Instagram handle is required' }, { status: 400 });
    }

    const cleanHandle = handle.replace(/@/g, '').trim();

    const apiKey = process.env.RAPIDAPI_KEY;
    const apiHost = process.env.RAPIDAPI_HOST;

    try {
        const response = await fetch(`https://${apiHost}/api/instagram/userInfo`, {
            method: 'POST',
            headers: {
                // 🎯 EXACT LOWERCASE MATCH FROM THE IMAGE_54C104.PNG SNIPPET:
                'x-rapidapi-key': apiKey,
                'x-rapidapi-host': apiHost,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({ username: cleanHandle }),
        });

        if (!response.ok) {
            const serverErrorText = await response.text();
            let structuredMessage = `Error (${response.status})`;
            try {
                const errJson = JSON.parse(serverErrorText);
                structuredMessage = errJson.message || structuredMessage;
            } catch (e) {
                structuredMessage = serverErrorText || structuredMessage;
            }
            return NextResponse.json({ success: false, error: structuredMessage }, { status: response.status });
        }

        const json = await response.json();

        // Dig into the nested response path: result -> array index 0 -> user
        let profileData = null;
        if (json.result && json.result.length > 0 && json.result[0].user) {
            profileData = json.result[0].user;
        } else {
            profileData = json.data || json.user || json;
        }

        if (!profileData) {
            return NextResponse.json({ success: false, error: 'Could not resolve the user data profile path.' }, { status: 404 });
        }

        const totalFollowers = profileData.follower_count ?? profileData.followers ?? 0;
        const profilePic = profileData.profile_pic_url_hd || profileData.profile_pic_url || '';
        const bioText = profileData.biography || profileData.bio || '';
        const displayName = profileData.full_name || cleanHandle;

        return NextResponse.json({
            success: true,
            username: cleanHandle,
            full_name: displayName,
            follower_count: Number(totalFollowers),
            profile_pic_url: profilePic,
            bio: bioText,
        });

    } catch (error) {
        return NextResponse.json({ success: false, error: `Internal Server Error: ${error.message}` }, { status: 500 });
    }
}
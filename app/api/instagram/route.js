import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// 🔍 Helper function to read and parse public/.env.local from disk manually
function loadPublicEnv() {
    const envVars = {};
    try {
        // Target specifically the public/.env.local path
        const filePath = path.join(process.cwd(), 'public', '.env.local');

        if (!fs.existsSync(filePath)) {
            console.error(`❌ Configuration file missing at: ${filePath}`);
            return envVars;
        }

        const fileContent = fs.readFileSync(filePath, 'utf-8');

        // Parse line by line
        fileContent.split(/\r?\n/).forEach((line) => {
            const trimmedLine = line.trim();
            if (!trimmedLine || trimmedLine.startsWith('#')) return; // skip empty lines/comments

            const eqIndex = trimmedLine.indexOf('=');
            if (eqIndex !== -1) {
                const key = trimmedLine.substring(0, eqIndex).trim();
                let value = trimmedLine.substring(eqIndex + 1).trim();

                // Clear wrapping quotes if any exist
                if ((value.startsWith('"') && value.endsWith('"')) ||
                    (value.startsWith("'") && value.endsWith("'"))) {
                    value = value.slice(1, -1).trim();
                }

                if (key) {
                    envVars[key] = value;
                }
            }
        });
    } catch (err) {
        console.error("Failed to read public/.env.local file configuration:", err);
    }
    return envVars;
}

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const handle = searchParams.get('handle');

        if (!handle) {
            return NextResponse.json({ success: false, error: 'Instagram handle is required' }, { status: 400 });
        }

        const cleanHandle = handle.replace(/@/g, '').trim().toLowerCase();

        // 1. Manually pull variables from the public/.env.local folder path
        const publicEnv = loadPublicEnv();
        const apiKey = publicEnv.rapidapi_key;
        const apiHost = publicEnv.rapidapi_host || 'instagram120.p.rapidapi.com';

        // Security Check to see if your variables loaded
        if (!apiKey) {
            return NextResponse.json({
                success: false,
                error: 'API Key missing. Please check your public/.env.local file values.'
            }, { status: 500 });
        }

        console.log(`📡 Fetching live data from RapidAPI for username: ${cleanHandle}`);

        // 2. Direct network request to the live RapidAPI endpoint
        const response = await fetch(`https://${apiHost}/api/instagram/userInfo`, {
            method: 'POST',
            headers: {
                'x-rapidapi-key': apiKey,
                'x-rapidapi-host': apiHost,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({ username: cleanHandle }),
        });

        const json = await response.json();

        // If your RapidAPI subscription tier returns a 403 or other gateway error status
        if (!response.ok) {
            return NextResponse.json({
                success: false,
                error: json.message || `RapidAPI returned error status code: ${response.status}`
            }, { status: response.status });
        }

        // 3. Drill into the response object precisely mapping the RapidAPI response schema
        let profileData = json.result?.[0]?.user || json.data || json.user || json;

        if (!profileData) {
            return NextResponse.json({
                success: false,
                error: 'Instagram account data payload structure mismatch.'
            }, { status: 404 });
        }

        // Extract direct live fields
        const liveFollowers = profileData.follower_count || profileData.followers || 0;

        return NextResponse.json({
            success: true,
            username: cleanHandle,
            full_name: profileData.full_name || cleanHandle,
            follower_count: Number(liveFollowers),
            profile_pic_url: profileData.profile_pic_url_hd || profileData.profile_pic_url || '',
            bio: profileData.biography || profileData.bio || '',
        });

    } catch (error) {
        console.error('------ COMPILATION CATCH BLOCK ------', error);
        return NextResponse.json({
            success: false,
            error: `System-level transmission exception: ${error.message}`
        }, { status: 500 });
    }
}
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        // Get cookies from the request
        const cookies = request.headers.get('cookie') || '';

        // Forward refresh request to Flask backend with cookies
        const response = await fetch('http://localhost:5000/auth/refresh', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': cookies,
            },
            credentials: 'include',
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(data, { status: response.status });
        }

        // Extract Set-Cookie headers from backend response
        const setCookieHeaders = response.headers.getSetCookie();

        // Create Next.js response
        const nextResponse = NextResponse.json(data, { status: 200 });

        // Forward new access token cookie to client
        setCookieHeaders.forEach((cookie) => {
            nextResponse.headers.append('Set-Cookie', cookie);
        });

        return nextResponse;
    } catch (error) {
        console.error('Token refresh error:', error);
        return NextResponse.json(
            { message: 'Token refresh failed' },
            { status: 401 }
        );
    }
}

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        // Get cookies from the request
        const cookies = request.headers.get('cookie') || '';

        // Forward logout request to Flask backend
        const response = await fetch('http://localhost:5000/auth/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': cookies,
            },
            credentials: 'include',
        });

        const data = await response.json();

        // Extract Set-Cookie headers to clear cookies
        const setCookieHeaders = response.headers.getSetCookie();

        // Create Next.js response
        const nextResponse = NextResponse.json(data, { status: 200 });

        // Forward cookie clearing headers to client
        setCookieHeaders.forEach((cookie) => {
            nextResponse.headers.append('Set-Cookie', cookie);
        });

        return nextResponse;
    } catch (error) {
        console.error('Logout error:', error);
        return NextResponse.json(
            { message: 'Logout failed' },
            { status: 500 }
        );
    }
}

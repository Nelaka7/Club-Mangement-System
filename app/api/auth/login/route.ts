import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Forward login request to Flask backend
        const response = await fetch('http://localhost:5000/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
            credentials: 'include',
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(data, { status: response.status });
        }

        // Extract Set-Cookie headers from backend response
        const setCookieHeaders = response.headers.getSetCookie();

        // Create Next.js response with user data
        const nextResponse = NextResponse.json(data, { status: 200 });

        // Forward cookies from backend to client
        setCookieHeaders.forEach((cookie) => {
            nextResponse.headers.append('Set-Cookie', cookie);
        });

        return nextResponse;
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}

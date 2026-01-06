import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Forward login request to Flask backend
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
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

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

export default function RootPage() {
    const router = useRouter();
    const { user, loading } = useAuth();

    useEffect(() => {
        if (!loading) {
            if (user) {
                // Redirect authenticated users to dashboard
                router.push('/dashboard');
            } else {
                // Redirect unauthenticated users to sign-in
                router.push('/sign-in');
            }
        }
    }, [user, loading, router]);

    // Show a loading state while checking authentication
    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading...</p>
            </div>
        </div>
    );
}

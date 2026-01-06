'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

interface Club {
  id: number;
  name: string;
  description: string;
  executive_id?: number;
}

const ManageClubs = () => {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/sign-in');
      return;
    }
    // Check if user has permission (only Club Executive or Admin)
    if (user.role !== 'Club Executive' && user.role !== 'Admin') {
      alert('Access denied. Only Club Executives and Admins can manage members.');
      router.push('/dashboard');
      return;
    }
    // For demo, allow all users to see, but in real app check role
    fetchClubs();
  }, [user, router]);

  const fetchClubs = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/clubs/`);
      if (!response.ok) {
        throw new Error('Failed to fetch clubs');
      }
      const data = await response.json();
      setClubs(data);
    } catch (err) {
      setError('Failed to load clubs');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8 flex justify-center items-center">Loading...</div>;
  }

  if (error) {
    return <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8 flex justify-center items-center text-red-500">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Club Management
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Manage your clubs as an executive or admin.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clubs.map((club) => (
            <div key={club.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {club.name}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {club.description}
              </p>
              <div className="space-y-2">
                <Link
                  href={`/manage-clubs/${club.id}/members`}
                  className="block w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 text-center"
                >
                  Manage Members
                </Link>
                <Link
                  href={`/manage-clubs/${club.id}/events`}
                  className="block w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 text-center"
                >
                  Manage Events
                </Link>
              </div>
            </div>
          ))}
        </div>
        {clubs.length === 0 && (
          <p className="text-center text-gray-600 dark:text-gray-400 mt-8">
            No clubs available for management.
          </p>
        )}
      </div>
    </div>
  );
};

export default ManageClubs;
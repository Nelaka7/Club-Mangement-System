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
}

interface Event {
  id: number;
  club_id: number;
  title: string;
  description: string;
  event_date: string;
}

interface DashboardData {
  clubs: string[];
  upcoming_events: Event[];
}

const Dashboard = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/sign-in');
      return;
    }
    fetchDashboard();
  }, [user, router]);

  const fetchDashboard = async () => {
    if (!user) return;
    try {
      // Fetch user's dashboard data
      const response = await fetch(`${API_BASE_URL}/dashboard/${user.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }
      const dashboardData = await response.json();
      setData(dashboardData);
    } catch (err) {
      setError('Failed to load dashboard');
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
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            User Dashboard
          </h1>
          <button
            onClick={logout}
            className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          A personalized homepage showing a user's clubs, upcoming events, and notifications.
        </p>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* User's Clubs */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              My Clubs
            </h2>
            {data?.clubs && data.clubs.length > 0 ? (
              <ul className="space-y-2">
                {data.clubs.map((club, index) => (
                  <li key={index} className="p-3 bg-gray-50 dark:bg-gray-700 rounded">
                    <p className="font-medium text-gray-900 dark:text-white">{club}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-600 dark:text-gray-400">No clubs joined yet.</p>
            )}
          </div>

          {/* Upcoming Events */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Upcoming Events
            </h2>
            {data?.upcoming_events && data.upcoming_events.length > 0 ? (
              <ul className="space-y-2">
                {data.upcoming_events.map((event) => (
                  <li key={event.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded">
                    <h3 className="font-medium text-gray-900 dark:text-white">{event.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{event.description}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">
                      {new Date(event.event_date).toLocaleDateString()}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-600 dark:text-gray-400">No upcoming events.</p>
            )}
          </div>
        </div>

        {/* Notifications Placeholder */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Notifications
          </h2>
          <p className="text-gray-600 dark:text-gray-400">No new notifications.</p>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/clubs" className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Club Directory
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              A searchable, filterable page for discovering all clubs.
            </p>
          </Link>
          <Link href="/calendar" className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Event Calendar
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              A central calendar view for all upcoming events from a user's clubs.
            </p>
          </Link>
          {(user?.role === 'Club Executive' || user?.role === 'Admin') && (
            <Link href="/manage-clubs" className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Club Management
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                A dedicated area for each club to manage its members and create/edit events.
              </p>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
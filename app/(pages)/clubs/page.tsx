'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';

interface Club {
  id: number;
  name: string;
  description: string;
  executive_id?: number;
  created_at: string;
}

const Clubs = () => {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [filteredClubs, setFilteredClubs] = useState<Club[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [joinedClubs, setJoinedClubs] = useState<number[]>([]);
  const [joiningClubId, setJoiningClubId] = useState<number | null>(null);
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    fetchClubs();
    if (user) {
      fetchUserMemberships();
    }
  }, [user]);

  useEffect(() => {
    filterClubs();
  }, [clubs, searchTerm]);

  const fetchClubs = async () => {
    try {
      const response = await fetch('http://localhost:5000/clubs/');
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

  const fetchUserMemberships = async () => {
    if (!user) return;
    try {
      const response = await fetch(`http://localhost:5000/memberships/user/${user.id}`);
      if (response.ok) {
        const data = await response.json();
        const clubIds = data.map((m: any) => m.club_id);
        setJoinedClubs(clubIds);
      }
    } catch (err) {
      console.error('Failed to fetch memberships:', err);
    }
  };

  const handleJoinClub = async (clubId: number) => {
    if (!user) {
      router.push('/sign-in');
      return;
    }

    setJoiningClubId(clubId);
    try {
      const response = await fetch('http://localhost:5000/memberships/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id,
          club_id: clubId,
        }),
      });

      if (response.ok) {
        setJoinedClubs([...joinedClubs, clubId]);
        alert('Successfully joined the club!');
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to join club');
      }
    } catch (err) {
      alert('Network error. Please try again.');
    } finally {
      setJoiningClubId(null);
    }
  };

  const filterClubs = () => {
    const filtered = clubs.filter(club =>
      club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      club.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredClubs(filtered);
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
        {/* Header with Auth Actions */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Club Directory
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Discover all clubs available in the university.
            </p>
          </div>
          <div className="flex gap-3">
            {user ? (
              <button
                onClick={() => router.push('/dashboard')}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
              >
                Go to Dashboard
              </button>
              ) : (
              <>
                <button
                  onClick={() => router.push('/sign-in')}
                  className="px-4 py-2 border border-purple-600 text-purple-600 rounded-md hover:bg-purple-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => router.push('/sign-up')}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search clubs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          />
        </div>

        {/* Clubs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClubs.map((club) => (
            <div key={club.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {club.name}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {club.description}
              </p>
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  Created: {new Date(club.created_at).toLocaleDateString()}
                </p>
                {user && (
                  joinedClubs.includes(club.id) ? (
                    <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                      ✓ Joined
                    </span>
                  ) : (
                    <button 
                      onClick={() => handleJoinClub(club.id)}
                      disabled={joiningClubId === club.id}
                      className="text-sm bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {joiningClubId === club.id ? 'Joining...' : 'Join Club'}
                    </button>
                  )
                )}
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredClubs.length === 0 && (
          <p className="text-center text-gray-600 dark:text-gray-400 mt-8">
            No clubs found matching your search.
          </p>
        )}
      </div>
    </div>
  );
};

export default Clubs;
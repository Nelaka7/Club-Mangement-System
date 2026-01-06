'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../../context/AuthContext';
import { useRouter } from 'next/navigation';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

interface Member {
  id: number;
  username: string;
  email: string;
  role: string;
}

const ManageMembers = () => {
  const { clubId } = useParams();
  const [members, setMembers] = useState<Member[]>([]);
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
    if (clubId) {
      fetchMembers();
    }
  }, [clubId, user, router]);

  const fetchMembers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/clubs/${clubId}/members`);
      if (!response.ok) {
        throw new Error('Failed to fetch members');
      }
      const data = await response.json();
      setMembers(data);
    } catch (err) {
      setError('Failed to load members');
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
        <div className="flex items-center mb-8">
          <Link href="/manage-clubs" className="text-blue-500 hover:text-blue-700 mr-4">
            ← Back to Clubs
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Manage Members - Club {clubId}
          </h1>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Current Members
          </h2>
          {members.length > 0 ? (
            <ul className="space-y-2">
              {members.map((member) => (
                <li key={member.id} className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 rounded">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{member.username}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{member.email} - {member.role}</p>
                  </div>
                  <button className="bg-red-500 text-white py-1 px-3 rounded hover:bg-red-600">
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600 dark:text-gray-400">No members in this club.</p>
          )}
          <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Add New Member</h3>
            <form className="space-y-4">
              <input
                type="text"
                placeholder="Username"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              <button
                type="submit"
                className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
              >
                Add Member
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageMembers;
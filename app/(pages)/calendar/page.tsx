'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';

interface Event {
  id: number;
  club_id: number;
  title: string;
  description: string;
  event_date: string;
}

const Calendar = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/sign-in');
      return;
    }
    fetchUserEvents();
  }, [user, router]);

  const fetchUserEvents = async () => {
    if (!user) return;
    try {
      // Fetch user's dashboard data to get their events
      const response = await fetch(`http://localhost:5000/dashboard/${user.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }
      const data = await response.json();
      // Sort events by date
      const sortedEvents = data.upcoming_events.sort((a: Event, b: Event) =>
        new Date(a.event_date).getTime() - new Date(b.event_date).getTime()
      );
      setEvents(sortedEvents);
    } catch (err) {
      setError('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const groupEventsByMonth = (events: Event[]) => {
    const grouped: { [key: string]: Event[] } = {};
    events.forEach(event => {
      const date = new Date(event.event_date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!grouped[monthKey]) {
        grouped[monthKey] = [];
      }
      grouped[monthKey].push(event);
    });
    return grouped;
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8 flex justify-center items-center">Loading...</div>;
  }

  if (error) {
    return <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8 flex justify-center items-center text-red-500">{error}</div>;
  }

  const groupedEvents = groupEventsByMonth(events);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center mb-8">
          <Link href="/dashboard" className="text-blue-500 hover:text-blue-700 mr-4">
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Event Calendar
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          A central calendar view for all upcoming events from a user's clubs.
        </p>

        {Object.keys(groupedEvents).length > 0 ? (
          <div className="space-y-8">
            {Object.entries(groupedEvents).map(([monthKey, monthEvents]) => {
              const [year, month] = monthKey.split('-');
              const monthName = new Date(parseInt(year), parseInt(month) - 1).toLocaleString('default', { month: 'long' });
              return (
                <div key={monthKey} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                    {monthName} {year}
                  </h2>
                  <div className="space-y-4">
                    {monthEvents.map((event) => (
                      <div key={event.id} className="flex items-start space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex-shrink-0 w-16 text-center">
                          <div className="text-lg font-bold text-gray-900 dark:text-white">
                            {new Date(event.event_date).getDate()}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {new Date(event.event_date).toLocaleDateString('en-US', { weekday: 'short' })}
                          </div>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white">{event.title}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{event.description}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-500">
                            {new Date(event.event_date).toLocaleTimeString('en-US', {
                              hour: 'numeric',
                              minute: '2-digit',
                              hour12: true
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
            <p className="text-gray-600 dark:text-gray-400">No upcoming events from your clubs.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Calendar;
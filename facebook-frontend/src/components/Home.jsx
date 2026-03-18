import React from 'react';
import { useAuth } from '../auth/AuthContext';

export default function Home() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Facebook Clone</h1>
              <p className="mt-1 text-sm text-gray-600">
                Signed in{user?.name ? ` as ${user.name}` : ''}.
              </p>
            </div>
            <button
              type="button"
              onClick={logout}
              className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-black"
            >
              Log out
            </button>
          </div>

          <div className="mt-6 text-sm text-gray-700">
            This is a protected route. Replace this with your feed.
          </div>
        </div>
      </div>
    </div>
  );
}


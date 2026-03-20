import React, { useState } from 'react';
import { apiRequest } from '../../lib/api';
import { useAuth } from '../../auth/AuthContext';
import { UserIcon, PhotoIcon, VideoCameraIcon } from '@heroicons/react/24/solid';

export default function CreatePostBox({ onPostCreated }) {
  const { user, accessToken } = useAuth();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      setLoading(true);
      const res = await apiRequest('/posts', {
        method: 'POST',
        token: accessToken,
        // body: JSON.stringify({ content, privacy: 'public' })
        body: { content, privacy: 'public' }
      });
      setContent('');
      if (onPostCreated) onPostCreated(res);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border p-4 mb-4">
      <div className="flex gap-3">
        <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
          <UserIcon className="w-6 h-6 text-gray-400 mx-auto mt-2" />
        </div>
        <form onSubmit={handleSubmit} className="flex-1">
          <input
            type="text"
            placeholder={`What's on your mind, ${user?.name?.split(' ')[0]}?`}
            className="w-full bg-gray-100 rounded-full px-4 py-2 focus:outline-none hover:bg-gray-200 transition"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={loading}
          />
          <button type="submit" className="hidden" disabled={loading}>Post</button>
        </form>
      </div>
      <div className="border-t my-3" />
      <div className="flex justify-around">
        <button className="flex items-center gap-2 text-gray-500 font-semibold hover:bg-gray-100 px-4 py-2 rounded-lg transition overflow-hidden">
          <span className="text-red-500">🎥</span> Live Video
        </button>
        <button className="flex items-center gap-2 text-gray-500 font-semibold hover:bg-gray-100 px-4 py-2 rounded-lg transition overflow-hidden">
          <span className="text-green-500">📷</span> Photo/Video
        </button>
        <button className="flex items-center gap-2 text-gray-500 font-semibold hover:bg-gray-100 px-4 py-2 rounded-lg transition overflow-hidden">
          <span className="text-yellow-500">😊</span> Feeling/Activity
        </button>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../lib/api';
import { useAuth } from '../../auth/AuthContext';
import { XMarkIcon } from '@heroicons/react/24/outline';

export default function ShareModal({ postId, onClose }) {
  const { accessToken } = useAuth();
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sharingTo, setSharingTo] = useState(null);

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const res = await apiRequest('/friends/list', { token: accessToken });
        setFriends(res || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchFriends();
  }, [accessToken]);

  const handleShare = async (friendId) => {
    setSharingTo(friendId);
    try {
      await apiRequest(`/posts/${postId}/share/${friendId}`, { method: 'POST', token: accessToken });
      alert('Post shared successfully via message!');
      onClose();
    } catch (err) {
      alert(err.message || 'Failed to share post');
    } finally {
      setSharingTo(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col relative">
        <div className="flex items-center justify-center p-4 border-b">
          <h2 className="text-xl font-bold text-gray-900">Send in Message</h2>
          <button
            onClick={onClose}
            className="absolute right-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        <div className="p-4 overflow-y-auto flex-1 custom-scrollbar">
          {loading ? (
            <div className="flex justify-center py-10">
              <svg className="animate-spin w-8 h-8 text-[#1877f2]" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            </div>
          ) : friends.length === 0 ? (
            <div className="text-center text-gray-500 py-8 font-medium">You don't have any friends to share with yet.</div>
          ) : (
            <div className="space-y-2">
              {friends.map(({ friend_id: friend }) => friend && (
                <div key={friend._id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl border border-gray-100 transition">
                  <div className="flex items-center gap-3">
                    <img
                      src={friend.profile?.profile_pic_id?.url || `https://ui-avatars.com/api/?name=${friend.name}&background=random`}
                      className="w-12 h-12 rounded-full object-cover border"
                      alt={friend.name}
                    />
                    <div>
                      <div className="font-bold text-[15px] text-gray-900 leading-tight">{friend.name}</div>
                      <div className="text-sm text-gray-500">@{friend.username}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleShare(friend._id)}
                    disabled={sharingTo === friend._id}
                    className="bg-[#1877f2] text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-[#166fe5] disabled:opacity-50 transition"
                  >
                    {sharingTo === friend._id ? 'Sending...' : 'Send'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import React, { useEffect, useState, useCallback } from 'react';
import { apiRequest } from '../../lib/api';
import { useAuth } from '../../auth/AuthContext';
import { UserIcon } from '@heroicons/react/24/solid';

export default function FriendList() {
  const { accessToken } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!accessToken) return;
    try {
      setLoading(true);
      const res = await apiRequest('/friends/list', { token: accessToken });
      setData(res || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20 text-gray-400">
        <svg className="animate-spin w-8 h-8" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
      </div>
    );
  }

  if (data.length === 0) {
    return <div className="text-center py-20 text-gray-500 italic text-sm">No friends to show.</div>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {data.map((item) => {
        const friend = item.friend_id;
        if (!friend) return null;
        return (
          <div key={item._id} className="flex items-center gap-4 p-4 border rounded-xl hover:bg-gray-50 transition cursor-pointer">
            <div className="w-16 h-16 rounded-lg bg-gray-200 overflow-hidden flex-shrink-0">
              {friend.profile?.profile_pic_id?.url ? (
                <img src={friend.profile.profile_pic_id.url} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <UserIcon className="w-10 h-10 text-gray-400 mx-auto mt-3" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-gray-900 truncate">{friend.name}</h3>
              <p className="text-sm text-gray-500 truncate">@{friend.username}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

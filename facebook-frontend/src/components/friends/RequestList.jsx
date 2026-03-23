import React, { useEffect, useState, useCallback } from 'react';
import { apiRequest } from '../../lib/api';
import { useAuth } from '../../auth/AuthContext';
import { UserIcon } from '@heroicons/react/24/solid';

export default function RequestList() {
  const { accessToken } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!accessToken) return;
    try {
      setLoading(true);
      const res = await apiRequest('/friends/requests', { token: accessToken });
      setData(res || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleAccept = async (senderId) => {
    try {
      await apiRequest(`/friends/accept/${senderId}`, { method: 'POST', token: accessToken });
      fetchData(); // refresh list
    } catch (err) { alert(err.message); }
  };

  const handleReject = async (senderId) => {
    try {
      await apiRequest(`/friends/reject/${senderId}`, { method: 'POST', token: accessToken });
      fetchData();
    } catch (err) { alert(err.message); }
  };

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
    return <div className="text-center py-20 text-gray-500 italic text-sm">No pending friend requests.</div>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {data.map((item) => {
        const sender = item.sender_id;
        if (!sender) return null;
        return (
          <div key={item._id} className="flex flex-col gap-3 p-4 border rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                {sender.profile?.profile_pic_id?.url ? (
                  <img src={sender.profile.profile_pic_id.url} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <UserIcon className="w-10 h-10 text-gray-400 mx-auto mt-3" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900 truncate">{sender.name}</h3>
                <p className="text-sm text-gray-500 truncate">@{sender.username}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <button onClick={() => handleAccept(sender._id)} className="bg-[#1877f2] text-white py-2 rounded-md font-semibold text-sm hover:bg-[#166fe5] transition">
                Confirm
              </button>
              <button onClick={() => handleReject(sender._id)} className="bg-gray-200 text-gray-900 py-2 rounded-md font-semibold text-sm hover:bg-gray-300 transition">
                Delete
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

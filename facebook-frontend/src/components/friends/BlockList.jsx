import React, { useEffect, useState, useCallback } from 'react';
import { apiRequest } from '../../lib/api';
import { useAuth } from '../../auth/AuthContext';

export default function BlockList() {
  const { accessToken } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!accessToken) return;
    try {
      setLoading(true);
      const res = await apiRequest('/friends/blocks', { token: accessToken });
      setData(res || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleUnblock = async (blockedId) => {
    try {
      await apiRequest(`/friends/unblock/${blockedId}`, { method: 'DELETE', token: accessToken });
      fetchData(); // refresh list
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
    return <div className="text-center py-20 text-gray-500 italic text-sm">No blocked users.</div>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {data.map((item) => {
        const blocked = item.blocked_user_id;
        if (!blocked) return null;
        return (
          <div key={item._id} className="flex items-center justify-between p-4 border rounded-xl">
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-gray-900 truncate">{blocked.name}</h3>
              <p className="text-sm text-gray-500 truncate">@{blocked.username}</p>
            </div>
            <button onClick={() => handleUnblock(blocked._id)} className="bg-red-50 text-red-600 border border-red-200 px-4 py-2 rounded-md font-semibold text-sm hover:bg-red-100 transition">
              Unblock
            </button>
          </div>
        );
      })}
    </div>
  );
}

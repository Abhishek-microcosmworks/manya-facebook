import React, { useState } from 'react';
import FriendList from './friends/FriendList';
import RequestList from './friends/RequestList';
import BlockList from './friends/BlockList';

export default function FriendsTab({ profileId, isOwner }) {
  const [activeSubTab, setActiveSubTab] = useState('friends');

  return (
    <div className="bg-white rounded-xl shadow-sm border p-4 min-h-[400px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
        <h2 className="text-xl font-bold">Friends</h2>
        {isOwner && (
          <div className="flex gap-2">
            <button
              onClick={() => setActiveSubTab('friends')}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition ${activeSubTab === 'friends' ? 'bg-[#1877f2] text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
            >
              All Friends
            </button>
            <button
              onClick={() => setActiveSubTab('requests')}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition ${activeSubTab === 'requests' ? 'bg-[#1877f2] text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
            >
              Requests
            </button>
            <button
              onClick={() => setActiveSubTab('blocks')}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition ${activeSubTab === 'blocks' ? 'bg-[#1877f2] text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
            >
              Blocked
            </button>
          </div>
        )}
      </div>

      <div className="mt-4">
        {activeSubTab === 'friends' && <FriendList />}
        {activeSubTab === 'requests' && isOwner && <RequestList />}
        {activeSubTab === 'blocks' && isOwner && <BlockList />}
      </div>
    </div>
  );
}

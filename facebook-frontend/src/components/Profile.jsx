import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { apiRequest } from '../lib/api';
import { CameraIcon, PencilIcon } from '@heroicons/react/24/solid';

export default function Profile() {
  const { username } = useParams();
  const { user: currentUser, accessToken, setSession, expiry } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const isOwner = currentUser?.username === username;

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiRequest(`/profile/${username}`);
      setProfile(res.user);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [username]);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  const handleUpdateMedia = async (type, file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append(type, file);

    try {
      setIsUpdating(true);
      const res = await apiRequest('/profile/update', {
        method: 'PATCH',
        body: formData,
        token: accessToken
      });
      setProfile(res.user);
      if (isOwner && accessToken && expiry)
        setSession({ accessToken, user: res.user, expiry });
    } catch (err) {
      alert(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-[#f0f2f5] animate-pulse" />;
  if (!profile) return <div className="text-center py-20">Profile not found</div>;

  return (
    <div className="min-h-screen bg-[#f0f2f5]">
      {/* Header Section */}
      <div className="bg-white shadow-sm">
        <div className="max-w-[1095px] mx-auto relative">
          {/* Cover Photo */}
          <div className="h-[200px] md:h-[400px] bg-gray-200 rounded-b-xl relative overflow-hidden">
            {profile.coverPic ? (
              <img src={profile.coverPic} className="w-full h-full object-cover" alt="Cover" />
            ) : null}
            {isOwner && (
              <label htmlFor='coverInput'
              className="absolute bottom-4 right-4 z-30 bg-white px-3 py-2 rounded-md shadow-md cursor-pointer flex items-center gap-2 hover:bg-gray-100 transition">
                <CameraIcon className="w-5 h-5" />
                <span className="hidden md:inline font-semibold">Edit Cover Photo</span>
                <input type="file" id='coverInput' accept='image/*' hidden onChange={(e) => handleUpdateMedia('coverPic', e.target.files[0])} />
              </label>
            )}
          </div>

          {/* Profile Info Row */}
          <div className="px-4 md:px-8 pb-4 flex flex-col md:flex-row items-center md:items-end gap-4 -mt-12 md:-mt-16 relative z-10">
            <div className="relative group">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white bg-gray-300 overflow-hidden shadow-sm">
                <img src={profile.profilePic || 'https://via.placeholder.com/150'} className="w-full h-full object-cover" alt="Avatar" />
              </div>
              {isOwner && (
                <label htmlFor='profileInput'
                className="absolute bottom-2 right-2 z-20 bg-gray-200 p-2 rounded-full border border-white cursor-pointer hover:bg-gray-300 transition">
                  <CameraIcon className="w-5 h-5" />
                  <input type="file" id='profileInput' accept='image/*' hidden onChange={(e) => handleUpdateMedia('profilePic', e.target.files[0])} />
                </label>
              )}
            </div>
            
            <div className="flex-1 text-center md:text-left mb-2">
              <h1 className="text-3xl font-bold text-gray-900">{profile.name}</h1>
              <p className="text-gray-600 font-semibold">{profile.friendCount} friends</p>
            </div>

            {isOwner && (
              <div className="flex gap-2 mb-2">
                <button className="bg-[#1877f2] text-white px-4 py-2 rounded-md font-bold hover:bg-[#166fe5]">
                  + Add to story
                </button>
                <button className="bg-gray-200 text-gray-900 px-4 py-2 rounded-md font-bold hover:bg-gray-300 flex items-center gap-2">
                  <PencilIcon className="w-4 h-4" /> Edit profile
                </button>
              </div>
            )}
          </div>

          <div className="border-t mx-4 md:mx-8" />
          
          {/* Tabs */}
          <div className="flex px-4 md:px-8 py-1 overflow-x-auto">
            {['Posts', 'About', 'Friends', 'Photos', 'Videos'].map((tab) => (
              <button key={tab} className={`px-4 py-3 font-semibold text-gray-600 border-b-4 border-transparent hover:bg-gray-100 rounded-md transition ${tab === 'Posts' ? 'text-[#1877f2] border-b-[#1877f2] hover:bg-transparent' : ''}`}>
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-[1095px] mx-auto grid grid-cols-1 lg:grid-cols-5 gap-4 px-4 py-4">
        {/* Left Sidebar */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <h2 className="text-xl font-bold mb-3">Intro</h2>
            {profile.bio ? (
              <p className="text-center text-[15px] mb-4 text-gray-800">{profile.bio}</p>
            ) : (
              <button className="w-full bg-gray-100 py-2 rounded-md font-semibold hover:bg-gray-200 mb-4 transition">Add Bio</button>
            )}
            <button className="w-full bg-gray-100 py-2 rounded-md font-semibold hover:bg-gray-200 transition">Edit Details</button>
          </div>
        </div>

        {/* Feed Section */}
        <div className="lg:col-span-3">
          <div className="bg-white p-4 rounded-lg shadow-sm border mb-4">
            <h2 className="text-xl font-bold">Posts</h2>
            <div className="py-10 text-center text-gray-500 italic">No posts yet.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
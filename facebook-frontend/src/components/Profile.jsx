import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { apiRequest } from '../lib/api';
import {
  CameraIcon, PencilIcon, ArrowLeftIcon, XMarkIcon, MapPinIcon, GlobeAltIcon, UserIcon, UserPlusIcon, ClockIcon, CheckIcon, ChatBubbleLeftEllipsisIcon, EllipsisHorizontalIcon
} from '@heroicons/react/24/solid';
import EditProfileModal from './EditProfileModal';
import FriendsTab from './FriendsTab';
import PostCard from './feed/PostCard';
import CreatePostModal from './feed/CreatePostModal';

export default function Profile() {
  const { username } = useParams();
  const navigate = useNavigate();

  const { user: currentUser, accessToken, setSession, expiry } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [friendStatus, setFriendStatus] = useState('none'); // 'none', 'pending_sent', 'pending_received', 'friends', 'blocked'
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeTab, setActiveTab] = useState('Posts');

  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const isOwner = currentUser?.username === username;

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiRequest(`/profile/${username}`);
      if (res.user) {
        setProfile(res.user);
        return res.user;
      }
    } catch (err) {
      console.error('Fetch profile error:', err);
    } finally {
      setLoading(false);
    }
  }, [username]);

  const fetchFriendStatus = useCallback(async (profileId) => {
    if (isOwner || !profileId || !accessToken) return;
    try {
      const res = await apiRequest(`/friends/status/${profileId}`, { token: accessToken });
      if (res.status === 'blocked_by') {
        // Hide profile if blocked by them
        setProfile(null);
      } else {
        setFriendStatus(res.status);
      }
    } catch (err) {
      console.error('Fetch friend status error:', err);
    }
  }, [isOwner, accessToken]);

  useEffect(() => {
    fetchProfile().then(user => {
      if (user && user.id) fetchFriendStatus(user.id);
    });
  }, [fetchProfile, fetchFriendStatus]);

  const fetchUserPosts = useCallback(async () => {
    if (!profile?.id || !accessToken) return;
    try {
      setPostsLoading(true);
      const res = await apiRequest(`/posts/user/${profile.id}`, { token: accessToken });
      setPosts(res || []);
    } catch (err) {
      console.error(err);
    } finally {
      setPostsLoading(false);
    }
  }, [profile?.id, accessToken]);

  // Fetch posts efficiently when tab is active and profile is locked
  useEffect(() => {
    if (activeTab === 'Posts' && profile?.id) {
      fetchUserPosts();
    }
  }, [activeTab, profile?.id, fetchUserPosts]);

  // Uploads a single file (profile pic or cover pic)
  const handleUpdateMedia = async (type, file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append(type, file);

    try {
      setIsUpdating(true);
      const res = await apiRequest('/profile/update', {
        method: 'PATCH',
        body: formData,
        token: accessToken,
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

  // Saves text-field changes from the edit modal
  const handleSaveProfile = async (form) => {
    const res = await apiRequest('/profile/update', {
      method: 'PATCH',
      body: form,          // plain JSON — api.js sets Content-Type automatically
      token: accessToken,
    });
    return res.user;
  };

  const handleModalClose = (updatedUser) => {
    setShowEditModal(false);
    if (updatedUser) {
      setProfile(updatedUser);
      if (isOwner && accessToken && expiry)
        setSession({ accessToken, user: updatedUser, expiry });
      // If the username changed, navigate to the new profile URL so the
      // URL param stays in sync with currentUser.username (keeps isOwner = true)
      if (updatedUser.username && updatedUser.username !== username) {
        navigate(`/profile/${updatedUser.username}`, { replace: true });
      }
    }
  };

  const handleFriendAction = async (action) => {
    if (!profile?.id || !accessToken) return;
    try {
      setIsUpdating(true);
      if (action === 'add') {
        const res = await apiRequest(`/friends/request/${profile.id}`, { method: 'POST', token: accessToken });
        if (res.success) setFriendStatus('pending_sent');
      } else if (action === 'accept') {
        await apiRequest(`/friends/accept/${profile.id}`, { method: 'POST', token: accessToken });
        setFriendStatus('friends');
      } else if (action === 'cancel' || action === 'reject') {
        const route = action === 'cancel' ? `/friends/cancel/${profile.id}` : `/friends/reject/${profile.id}`;
        await apiRequest(route, { method: 'POST', token: accessToken });
        setFriendStatus('none');
      } else if (action === 'remove') {
        await apiRequest(`/friends/remove/${profile.id}`, { method: 'DELETE', token: accessToken });
        setFriendStatus('none');
      } else if (action === 'block') {
        await apiRequest(`/friends/block/${profile.id}`, { method: 'POST', token: accessToken });
        setFriendStatus('blocked');
      } else if (action === 'unblock') {
        await apiRequest(`/friends/unblock/${profile.id}`, { method: 'DELETE', token: accessToken });
        setFriendStatus('none');
      }
    } catch (err) {
      alert(err.message || 'Action failed');
    } finally {
      setIsUpdating(false);
      setShowDropdown(false);
    }
  };

  // Full-page pulse only on initial load (when no profile cached in state yet)
  if (loading && !profile) return <div className="min-h-screen bg-[#f0f2f5] animate-pulse" />;

  // Only show "Not found" if loading finished and we STILL don't have a profile
  if (!profile) return <div className="text-center py-20 text-gray-500 font-semibold text-lg">Profile not found</div>;

  return (
    <>
      <div className="min-h-screen bg-[#f0f2f5]">
        {/* Edit Modal */}
        {showEditModal && (
          <EditProfileModal
            profile={profile}
            onClose={handleModalClose}
            onSave={handleSaveProfile}
          />
        )}

        {/* Updating overlay */}
        {isUpdating && (
          <div className="fixed inset-0 z-40 bg-black/30 flex items-center justify-center">
            <div className="bg-white rounded-xl px-6 py-4 shadow-xl flex items-center gap-3">
              <svg className="animate-spin w-5 h-5 text-[#1877f2]" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              <span className="font-semibold text-gray-700">Uploading…</span>
            </div>
          </div>
        )}

        {/* Header Section */}
        <div className="bg-white shadow-sm">
          <div className="max-w-[1095px] mx-auto relative">

            {/* Back button (mobile) */}
            <button
              onClick={() => navigate(-1)}
              className="md:hidden absolute top-4 left-4 z-50 h-9 w-9 flex items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </button>

            {/* Cover Photo */}
            <div className="h-[200px] md:h-[400px] bg-gray-200 rounded-b-xl relative overflow-hidden">
              {profile.coverPic ? (
                <img src={profile.coverPic} className="w-full h-full object-cover" alt="Cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400" />
              )}
              {isOwner && (
                <label
                  htmlFor="coverInput"
                  className="absolute bottom-4 right-4 z-30 bg-white px-3 py-2 rounded-md shadow-md cursor-pointer flex items-center gap-2 hover:bg-gray-100 transition"
                >
                  <CameraIcon className="w-5 h-5" />
                  <span className="hidden md:inline font-semibold text-sm">Edit Cover Photo</span>
                  <input
                    type="file"
                    id="coverInput"
                    accept="image/*"
                    hidden
                    onChange={(e) => handleUpdateMedia('coverPic', e.target.files[0])}
                  />
                </label>
              )}
            </div>

            {/* Profile Info Row */}
            <div className="px-4 md:px-8 pb-4 flex flex-col md:flex-row gap-4 relative z-10">

              {/* Avatar */}
              <div className="-mt-12 md:-mt-16 relative group flex-shrink-0 mx-auto md:mx-0">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white bg-gray-300 overflow-hidden shadow-sm">
                  {profile.profilePic ? (
                    <img src={profile.profilePic} className="w-full h-full object-cover" alt="Avatar" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                      <UserIcon className="w-16 h-16 text-gray-400" />
                    </div>
                  )}
                </div>
                {isOwner && (
                  <label
                    htmlFor="profileInput"
                    className="absolute bottom-2 right-2 z-20 bg-gray-200 p-2 rounded-full border-2 border-white cursor-pointer hover:bg-gray-300 transition"
                  >
                    <CameraIcon className="w-4 h-4" />
                    <input
                      type="file"
                      id="profileInput"
                      accept="image/*"
                      hidden
                      onChange={(e) => handleUpdateMedia('profilePic', e.target.files[0])}
                    />
                  </label>
                )}
              </div>

              {/* Name + meta */}
              <div className="flex-1 text-center md:text-left mb-2 min-w-0 pt-2 md:pt-4">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 truncate">{profile.name}</h1>
                <p className="text-gray-500 text-sm">@{profile.username}</p>
                {profile.bio && (
                  <p className="text-gray-700 text-sm mt-1 line-clamp-2">{profile.bio}</p>
                )}
                <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-1.5">
                  {profile.location && (
                    <span className="flex items-center gap-1 text-gray-500 text-sm">
                      <MapPinIcon className="w-4 h-4" /> {profile.location}
                    </span>
                  )}
                  {profile.website && (
                    <a
                      href={profile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-[#1877f2] text-sm hover:underline"
                    >
                      <GlobeAltIcon className="w-4 h-4" /> {profile.website.replace(/^https?:\/\//, '')}
                    </a>
                  )}
                </div>
              </div>

              {/* Owner actions */}
              {isOwner && (
                <div className="flex gap-2 mb-2 flex-shrink-0 pt-2 md:pt-4 items-start justify-center md:justify-end">
                  <button className="bg-[#1877f2] text-white px-4 py-2 rounded-md font-bold text-sm hover:bg-[#166fe5] transition">
                    + Add to story
                  </button>
                  <button
                    onClick={() => setShowEditModal(true)}
                    className="bg-gray-200 text-gray-900 px-4 py-2 rounded-md font-bold text-sm hover:bg-gray-300 transition flex items-center gap-2"
                  >
                    <PencilIcon className="w-4 h-4" /> Edit profile
                  </button>
                </div>
              )}

              {/* Non-Owner Friend Actions */}
              {!isOwner && profile?.id && (
                <div className="flex gap-2 mb-2 flex-shrink-0 pt-2 md:pt-4 items-start justify-center md:justify-end relative">
                  {friendStatus === 'none' && (
                    <button onClick={() => handleFriendAction('add')} className="bg-[#1877f2] text-white px-4 py-2 rounded-md font-bold text-sm hover:bg-[#166fe5] transition flex items-center gap-2">
                      <UserPlusIcon className="w-4 h-4" /> Add Friend
                    </button>
                  )}
                  {friendStatus === 'pending_sent' && (
                    <button onClick={() => handleFriendAction('cancel')} className="bg-gray-200 text-gray-900 px-4 py-2 rounded-md font-bold text-sm hover:bg-gray-300 transition flex items-center gap-2">
                      <ClockIcon className="w-4 h-4" /> Cancel Request
                    </button>
                  )}
                  {friendStatus === 'pending_received' && (
                    <button onClick={() => handleFriendAction('accept')} className="bg-[#1877f2] text-white px-4 py-2 rounded-md font-bold text-sm hover:bg-[#166fe5] transition flex items-center gap-2">
                      <UserPlusIcon className="w-4 h-4" /> Respond
                    </button>
                  )}
                  {friendStatus === 'friends' && (
                    <button onClick={() => setShowDropdown(!showDropdown)} className="bg-gray-200 text-gray-900 px-4 py-2 rounded-md font-bold text-sm hover:bg-gray-300 transition flex items-center gap-2">
                      <CheckIcon className="w-4 h-4" /> Friends
                    </button>
                  )}
                  {friendStatus === 'blocked' && (
                    <button onClick={() => handleFriendAction('unblock')} className="bg-red-50 text-red-600 border border-red-200 px-4 py-2 rounded-md font-bold text-sm hover:bg-red-100 transition flex items-center gap-2">
                      Unblock
                    </button>
                  )}

                  {friendStatus !== 'blocked' && (
                    <button className="bg-[#1877f2] text-white px-4 py-2 rounded-md font-bold text-sm hover:bg-[#166fe5] transition flex items-center gap-2">
                      <ChatBubbleLeftEllipsisIcon className="w-4 h-4" /> Message
                    </button>
                  )}

                  {/* More options dropdown */}
                  <button onClick={() => setShowDropdown(!showDropdown)} className="bg-gray-200 text-gray-900 px-3 py-2 rounded-md font-bold text-sm hover:bg-gray-300 transition">
                    <EllipsisHorizontalIcon className="w-5 h-5" />
                  </button>

                  {showDropdown && (
                    <div className="absolute right-0 top-12 mt-1 w-48 bg-white rounded-lg shadow-xl border overflow-hidden z-50">
                      {friendStatus === 'friends' && (
                        <button onClick={() => handleFriendAction('remove')} className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 font-semibold transition">
                          Unfriend
                        </button>
                      )}
                      {friendStatus === 'pending_received' && (
                        <button onClick={() => handleFriendAction('reject')} className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 font-semibold transition">
                          Delete Request
                        </button>
                      )}
                      {friendStatus !== 'blocked' && (
                        <button onClick={() => handleFriendAction('block')} className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-gray-100 font-semibold transition">
                          Block
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="border-t mx-4 md:mx-8" />

            {/* Tabs */}
            <div className="flex px-4 md:px-8 py-1 overflow-x-auto">
              {['Posts', 'About', 'Friends', 'Photos', 'Videos'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-3 font-semibold text-sm border-b-4 hover:bg-gray-100 rounded-md transition whitespace-nowrap
                  ${activeTab === tab ? 'text-[#1877f2] border-b-[#1877f2] hover:bg-transparent' : 'border-transparent text-gray-600'}`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="max-w-[1095px] mx-auto grid grid-cols-1 lg:grid-cols-5 gap-4 px-4 py-4">

          {/* Left Sidebar — Intro */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white p-4 rounded-xl shadow-sm border">
              <h2 className="text-xl font-bold mb-3">Intro</h2>

              {profile.bio ? (
                <p className="text-center text-[15px] mb-4 text-gray-800">{profile.bio}</p>
              ) : isOwner ? (
                <button
                  onClick={() => setShowEditModal(true)}
                  className="w-full bg-gray-100 py-2 rounded-md font-semibold hover:bg-gray-200 mb-4 transition text-sm"
                >
                  Add Bio
                </button>
              ) : null}

              {/* Location & website in sidebar */}
              <div className="space-y-2 mb-4">
                {profile.location && (
                  <div className="flex items-center gap-2 text-gray-700 text-sm">
                    <MapPinIcon className="w-5 h-5 text-gray-500 flex-shrink-0" />
                    <span>Lives in <span className="font-semibold">{profile.location}</span></span>
                  </div>
                )}
                {profile.website && (
                  <div className="flex items-center gap-2 text-sm">
                    <GlobeAltIcon className="w-5 h-5 text-gray-500 flex-shrink-0" />
                    <a
                      href={profile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#1877f2] hover:underline truncate"
                    >
                      {profile.website.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                )}
              </div>

              {isOwner && (
                <button
                  onClick={() => setShowEditModal(true)}
                  className="w-full bg-gray-100 py-2 rounded-md font-semibold hover:bg-gray-200 transition text-sm"
                >
                  Edit Details
                </button>
              )}
            </div>
          </div>

          {/* Feed or Tabs */}
          <div className="lg:col-span-3">
            {activeTab === 'Posts' && (
              <div className="space-y-4 pb-20">

                {isOwner && (
                  <div className="w-full rounded-xl bg-white p-4 shadow-sm border">
                    <div className="flex gap-2">
                      <div className="h-10 w-10 rounded-full bg-gray-300 overflow-hidden shrink-0">
                        <img src={profile?.profilePic || 'https://via.placeholder.com/150'} alt="me" className="w-full h-full object-cover" />
                      </div>
                      <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="flex-1 rounded-full bg-[#f0f2f5] px-4 text-left text-[17px] text-gray-600 hover:bg-gray-200 transition"
                      >
                        What's on your mind, {profile?.name?.split(' ')[0]}?
                      </button>
                    </div>
                  </div>
                )}

                {postsLoading ? (
                  <div className="flex justify-center py-10">
                    <svg className="animate-spin w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                  </div>
                ) : posts.length === 0 ? (
                  <div className="bg-white p-12 rounded-xl shadow-sm border text-center text-gray-500 italic">
                    No posts to show.
                  </div>
                ) : (
                  posts.map(post => (
                    <PostCard key={post._id + post.feed_type} post={post} />
                  ))
                )}
              </div>
            )}

            {activeTab === 'Friends' && (
              <FriendsTab profileId={profile.id} isOwner={isOwner} />
            )}

            {/* Placeholders for other tabs */}
            {['About', 'Photos', 'Videos'].includes(activeTab) && (
              <div className="bg-white p-4 rounded-xl shadow-sm border mb-4 py-20 text-center text-gray-500 italic text-sm">
                {activeTab} content coming soon.
              </div>
            )}
          </div>
        </div>
      </div>

      {isCreateModalOpen && (
        <CreatePostModal
          onClose={() => setIsCreateModalOpen(false)}
          onPostCreated={fetchUserPosts}
        />
      )}
    </>
  );
}
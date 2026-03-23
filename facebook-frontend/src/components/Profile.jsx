import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { apiRequest } from '../lib/api';
import {
  UserIcon, UserPlusIcon, ClockIcon, CheckIcon, ChatBubbleLeftEllipsisIcon, EllipsisHorizontalIcon
} from '@heroicons/react/24/solid';
import EditProfileModal from './EditProfileModal';
import FriendsTab from './FriendsTab';
import PostCard from './feed/PostCard';
import SavedPosts from './feed/SavedPosts';
import CreatePostModal from './feed/CreatePostModal';
import ProfileHeader from './ProfileHeader';

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
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(() => tabFromUrl || 'Posts');

  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const isOwner = currentUser?.username === username;
  useEffect(() => {
    const validTabs = isOwner ? ['Posts', 'About', 'Friends', 'Saved', 'Photos', 'Videos'] : ['Posts', 'About', 'Friends', 'Photos', 'Videos'];
    if (tabFromUrl && validTabs.includes(tabFromUrl)) setActiveTab(tabFromUrl);
    else setActiveTab('Posts');
  }, [tabFromUrl, isOwner]);

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
            {/* Profile Header (Cover, Avatar, Info, Actions) */}
            <ProfileHeader
              profile={profile}
              isOwner={isOwner}
              isUpdating={isUpdating}
              handleUpdateMedia={handleUpdateMedia}
              setShowEditModal={setShowEditModal}
              friendStatus={friendStatus}
              handleFriendAction={handleFriendAction}
              showDropdown={showDropdown}
              setShowDropdown={setShowDropdown}
              navigate={navigate}
            />

            <div className="border-t mx-4 md:mx-8" />

            {/* Tabs */}
            <div className="flex px-4 md:px-8 py-1 overflow-x-auto">
              {(isOwner
                ? ['Posts', 'About', 'Friends', 'Saved', 'Photos', 'Videos']
                : ['Posts', 'About', 'Friends', 'Photos', 'Videos']
              ).map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    setSearchParams(tab === 'Posts' ? {} : { tab });
                  }}
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
                    <PostCard key={post._id + post.feed_type} post={post} initiallySaved={!!post.is_saved} />
                  ))
                )}
              </div>
            )}

            {activeTab === 'Friends' && (
              <FriendsTab profileId={profile.id} isOwner={isOwner} />
            )}

            {activeTab === 'Saved' && isOwner && (
              <SavedPosts />
            )}

            {activeTab === 'Saved' && !isOwner && (
              <div className="bg-white p-4 rounded-xl shadow-sm border mb-4 py-20 text-center text-gray-500 italic text-sm">
                Only you can see what you've saved.
              </div>
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
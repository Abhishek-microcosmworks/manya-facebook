import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useUserSearch } from '../hooks/useUserSearch';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { apiRequest } from '../lib/api';
import PostCard from './feed/PostCard';
import CreatePostModal from './feed/CreatePostModal';
import {HomeIcon, UserGroupIcon, VideoCameraIcon, BuildingStorefrontIcon, NewspaperIcon, MagnifyingGlassIcon, ChatBubbleLeftEllipsisIcon, BellIcon,
  PlusIcon, PhotoIcon, FaceSmileIcon, VideoCameraIcon as LiveVideoIcon } from '@heroicons/react/24/solid';

export default function Home() {
  const { user, logout, accessToken } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const searchRef = useRef(null);
  const { results, isLoading, setResults } = useUserSearch(searchQuery, accessToken);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    setSearchQuery(e.target.value);
    setIsDropdownOpen(true);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setResults([]);
    setIsDropdownOpen(false);
  };

  const fetchTimeline = useCallback(async () => {
    if (!accessToken) return;
    try {
      setLoading(true);
      const res = await apiRequest('/posts/timeline', { token: accessToken });
      setPosts(res || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => { fetchTimeline(); }, [fetchTimeline]);

  return (
    <div className="min-h-screen bg-[#f0f2f5] font-sans">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 flex h-14 items-center justify-between bg-white px-4 shadow-sm">
        {/* Left: Logo & Search */}
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1877f2] text-2xl font-bold text-white select-none">
            f
          </div>
         {/* Search Container */}
        <div className="relative hidden lg:block" ref={searchRef}>
          <div className="flex items-center gap-2 rounded-full bg-[#f0f2f5] px-3 py-2">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search Facebook"
              value={searchQuery}
              onChange={handleInputChange}
              onFocus={() => setIsDropdownOpen(true)}
              className="bg-transparent text-[15px] outline-none placeholder:text-gray-500 w-[240px]"
            />
          </div>

          {/* Dropdown Results */}
          {isDropdownOpen && searchQuery.trim().length >= 2 && (
            <div className="absolute top-full left-0 mt-2 w-full min-w-[300px] bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden max-h-80 overflow-y-auto z-50">
              
              {isLoading && (
                <div className="p-4 text-center text-gray-500 text-sm flex justify-center items-center">
                  <div className="w-4 h-4 border-2 border-[#1877f2] border-t-transparent rounded-full animate-spin mr-2"></div>
                  Searching...
                </div>
              )}

              {!isLoading && results.length === 0 && (
                <div className="p-4 text-center text-gray-500 text-sm">
                  No users found for "{searchQuery}"
                </div>
              )}

              {!isLoading && results.length > 0 && results.map((u) => (
                <Link
                  key={u.id}
                  to={`/profile/${u.username}`}
                  onClick={clearSearch}
                  className="flex items-center p-3 hover:bg-gray-100 transition-colors border-b border-gray-50 last:border-0"
                >
                  <img
                    src={u.profilePic || 'https://via.placeholder.com/40'}
                    alt={u.name}
                    className="w-10 h-10 rounded-full object-cover mr-3 border border-gray-200"
                  />
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">{u.name}</div>
                    <div className="text-xs text-gray-500">@{u.username}</div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
        </div>

        {/* Center: Main Nav (Desktop) */}
        <div className="hidden h-full flex-1 justify-center md:flex lg:gap-2">
          <button className="flex h-full w-24 items-center justify-center border-b-4 border-[#1877f2] text-[#1877f2]">
            <HomeIcon className="h-7 w-7" />
          </button>
          <button className="flex h-full w-24 items-center justify-center border-b-4 border-transparent text-gray-500 hover:bg-gray-100">
            <VideoCameraIcon className="h-7 w-7" />
          </button>
          <button className="flex h-full w-24 items-center justify-center border-b-4 border-transparent text-gray-500 hover:bg-gray-100">
            <BuildingStorefrontIcon className="h-7 w-7" />
          </button>
          <button className="flex h-full w-24 items-center justify-center border-b-4 border-transparent text-gray-500 hover:bg-gray-100">
            <UserGroupIcon className="h-7 w-7" />
          </button>
        </div>

        {/* Right: Profile & Actions */}
        <div className="flex items-center gap-2">
          <Link to={`/profile/${user?.username}`} className=" hidden items-center gap-2 rounded-full p-1 pr-3 font-semibold hover:bg-gray-100 xl:flex">
            <div className="h-7 w-7 rounded-full bg-gray-300 overflow-hidden">
               <img src={user?.profilePic || 'https://via.placeholder.com/150'} alt="me" className="h-full w-full object-cover" />
            </div>
            <span className="hidden text-[15px]">{user?.name?.split(' ')[0]}</span>
          </Link>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 cursor-pointer">
            <PlusIcon className="h-5 w-5 text-black" />
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 cursor-pointer">
            <ChatBubbleLeftEllipsisIcon className="h-5 w-5 text-black" />
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 cursor-pointer">
            <BellIcon className="h-5 w-5 text-black" />
          </div>
          <button onClick={logout} className="ml-2 rounded-md bg-gray-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-black">
            Log out
          </button>
        </div>
      </nav>

      {/* Main Layout Grid */}
      <div className="mx-auto grid max-w-[1440px] grid-cols-1 pt-4 md:grid-cols-1 lg:grid-cols-4 xl:grid-cols-4">
        
        {/* Left Sidebar (Hidden on small screens) */}
        <aside className="sticky top-[72px] hidden h-[calc(100vh-72px)] overflow-y-auto px-2 lg:block">
          <ul className="space-y-1">
            <SidebarItem to={`/profile/${user?.username}`} img={user?.profilePic} label={user?.name} />
            <SidebarItem icon={<UserGroupIcon className="h-9 w-9 text-[#1877f2]" />} label="Friends" />
            <SidebarItem icon={<VideoCameraIcon className="h-9 w-9 text-[#1877f2]" />} label="Watch" />
            <SidebarItem icon={<NewspaperIcon className="h-9 w-9 text-[#1877f2]" />} label="Feeds" />
            <SidebarItem icon={<BuildingStorefrontIcon className="h-9 w-9 text-[#1877f2]" />} label="Marketplace" />
          </ul>
        </aside>

        {/* Middle Feed */}
        <main className="col-span-1 flex flex-col items-center px-4 lg:col-span-2">
          {/* Create Post Box */}
          <div className="mb-4 w-full max-w-[590px] rounded-lg bg-white p-4 shadow-sm">
            <div className="flex gap-2">
              <Link to={`/profile/${user?.username}`} className="h-10 w-10 rounded-full bg-gray-300 overflow-hidden shrink-0">
                 <img src={user?.profilePic || 'https://via.placeholder.com/150'} alt="me" className="w-full h-full object-cover" />
              </Link>
              <button 
                onClick={() => setIsCreateModalOpen(true)}
                className="flex-1 rounded-full bg-[#f0f2f5] px-4 text-left text-[17px] text-gray-600 hover:bg-gray-200 transition"
              >
                What's on your mind, {user?.name?.split(' ')[0]}?
              </button>
            </div>
            <div className="my-3 h-px w-full bg-gray-200" />
            <div className="flex justify-between">
              <PostAction icon={<LiveVideoIcon className="h-6 w-6 text-red-500" />} label="Live video" />
              <PostAction icon={<PhotoIcon className="h-6 w-6 text-green-500" />} label="Photo/ Video" />
              <PostAction icon={<FaceSmileIcon className="h-6 w-6 text-yellow-500" />} label="Feeling/ Activity" />
            </div>
          </div>

          {/* Posts Feed */}
          <div className="w-full max-w-[590px] space-y-4 pb-20">
            {loading ? (
              <div className="flex justify-center py-20">
                <svg className="animate-spin w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
              </div>
            ) : posts.length === 0 ? (
              <div className="rounded-lg bg-white p-12 text-center text-gray-500 shadow-sm ring-1 ring-gray-200">
                No posts to show right now.
                <br className="mb-2"/> 
                Start posting or build out your friend network!
              </div>
            ) : (
              posts.map(post => (
                <PostCard key={post._id + post.feed_type} post={post} />
              ))
            )}
          </div>
        </main>

        {/* Right Sidebar (Contacts) */}
        <aside className="sticky top-[72px] hidden h-[calc(100vh-72px)] overflow-y-auto px-4 xl:block">
          <div className="flex items-center justify-between border-b pb-2 text-gray-600">
            <span className="font-semibold">Contacts</span>
            <div className="flex gap-4">
              <VideoCameraIcon className="h-4 w-4" />
              <MagnifyingGlassIcon className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <p className="text-sm italic text-gray-400">No active contacts yet.</p>
          </div>
        </aside>
      </div>

      {isCreateModalOpen && (
        <CreatePostModal 
          onClose={() => setIsCreateModalOpen(false)} 
          onPostCreated={fetchTimeline} 
        />
      )}
    </div>
  );
}

/* Sub-components for better organization */
function SidebarItem({ to, icon, img, label }) {
  const content = (
    <div className="flex items-center gap-3 rounded-md p-2 hover:bg-gray-200 transition cursor-pointer">
      {img ? (
        <div className="h-9 w-9 rounded-full bg-gray-300 overflow-hidden shrink-0">
          <img src={img || 'https://via.placeholder.com/150'} alt={label} className="h-full w-full object-cover" />
        </div>
      ) : (
        icon
      )}
      <span className="text-[15px] font-semibold text-gray-900">{label}</span>
    </div>
  );
  return to ? <Link to={to}>{content}</Link> : content;
}

function PostAction({ icon, label }) {
  return (
    <button className="flex flex-1 items-center justify-center gap-2 rounded-md py-2 hover:bg-gray-100 transition">
      {icon}
      <span className="text-[15px] font-semibold text-gray-600">{label}</span>
    </button>
  );
}
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import {HomeIcon, UserGroupIcon, VideoCameraIcon, BuildingStorefrontIcon, NewspaperIcon, MagnifyingGlassIcon, ChatBubbleLeftEllipsisIcon, BellIcon,
  PlusIcon, PhotoIcon, FaceSmileIcon, VideoCameraIcon as LiveVideoIcon } from '@heroicons/react/24/solid';

export default function Home() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-[#f0f2f5] font-sans">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 flex h-14 items-center justify-between bg-white px-4 shadow-sm">
        {/* Left: Logo & Search */}
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1877f2] text-2xl font-bold text-white select-none">
            f
          </div>
          <div className="hidden items-center gap-2 rounded-full bg-[#f0f2f5] px-3 py-2 lg:flex">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-500" />
            <input 
              type="text" 
              placeholder="Search Facebook" 
              className="bg-transparent text-[15px] outline-none placeholder:text-gray-500" 
            />
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
                 <img src={user?.profilePic || 'https://via.placeholder.com/150'} alt="me" />
              </Link>
              <button className="flex-1 rounded-full bg-[#f0f2f5] px-4 text-left text-[17px] text-gray-600 hover:bg-gray-200 transition">
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

          {/* Placeholder for Posts */}
          <div className="w-full max-w-[590px] space-y-4">
            <div className="rounded-lg bg-white p-12 text-center text-gray-500 shadow-sm ring-1 ring-gray-200">
               Posts will appear here. Start building your Feed API!
            </div>
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
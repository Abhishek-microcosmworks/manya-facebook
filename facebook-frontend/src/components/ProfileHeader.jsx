import React from 'react';
import {
  CameraIcon, PencilIcon, ArrowLeftIcon, MapPinIcon, GlobeAltIcon, UserIcon, UserPlusIcon, ClockIcon, CheckIcon, ChatBubbleLeftEllipsisIcon, EllipsisHorizontalIcon
} from '@heroicons/react/24/solid';

export default function ProfileHeader({
  profile,
  isOwner,
  isUpdating,
  handleUpdateMedia,
  setShowEditModal,
  friendStatus,
  handleFriendAction,
  showDropdown,
  setShowDropdown,
  navigate
}) {
  return (
    <>

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
    </>
  );
}

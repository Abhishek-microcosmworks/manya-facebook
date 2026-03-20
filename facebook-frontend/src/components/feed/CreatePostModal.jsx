import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { apiRequest } from '../../lib/api';
import { XMarkIcon, GlobeAltIcon, FaceSmileIcon, PhotoIcon } from '@heroicons/react/24/solid';

export default function CreatePostModal({ onClose, onPostCreated }) {
  const { user, accessToken } = useAuth();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const overlayRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      setLoading(true);
      const res = await apiRequest('/posts', {
        method: 'POST',
        token: accessToken,
        body: { content, privacy: 'public' }
      });
      setContent('');
      if (onPostCreated) onPostCreated(res);
      onClose();
    } catch (err) {
      alert(err.message || 'Failed to post');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div
      ref={overlayRef}
      onClick={(e) => e.target === overlayRef.current && onClose()}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-white/50 backdrop-blur-sm px-4"
    >
      <div className="w-full max-w-[500px] bg-white rounded-xl shadow-2xl border flex flex-col relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-center p-4 border-b relative">
          <h2 className="text-xl font-bold text-gray-900">Create post</h2>
          <button
            onClick={onClose}
            className="absolute right-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 flex-1">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
               <img src={user?.profilePic || 'https://via.placeholder.com/150'} alt="me" className="w-full h-full object-cover" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 leading-tight">{user?.name}</h3>
              <div className="flex items-center gap-1 bg-gray-200 text-gray-800 text-xs font-semibold px-2 py-0.5 rounded-md mt-0.5 w-max cursor-pointer hover:bg-gray-300 transition">
                <GlobeAltIcon className="w-3 h-3" /> Public
              </div>
            </div>
          </div>

          <textarea
            placeholder={`What's on your mind, ${user?.name?.split(' ')[0]}?`}
            className="w-full h-32 text-lg resize-none focus:outline-none placeholder-gray-500 text-gray-900"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={loading}
            autoFocus
          />
        </div>

        {/* Addons */}
        <div className="px-4 pb-4">
          <div className="flex items-center justify-between border rounded-lg p-3 shadow-sm mb-4">
            <span className="font-semibold text-[15px] text-gray-800">Add to your post</span>
            <div className="flex items-center gap-2">
              <div className="p-2 hover:bg-gray-100 rounded-full cursor-pointer transition">
                <PhotoIcon className="w-6 h-6 text-green-500" />
              </div>
              <div className="p-2 hover:bg-gray-100 rounded-full cursor-pointer transition">
                <FaceSmileIcon className="w-6 h-6 text-yellow-500" />
              </div>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!content.trim() || loading}
            className="w-full bg-[#1877f2] text-white font-bold py-2.5 rounded-lg hover:bg-[#166fe5] disabled:bg-[#e4e6eb] disabled:text-gray-400 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
          >
            {loading ? (
              <svg className="animate-spin w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            ) : "Post"}
          </button>
        </div>
      </div>
    </div>
  );
}

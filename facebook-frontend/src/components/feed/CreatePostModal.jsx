import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { apiRequest } from '../../lib/api';
import { XMarkIcon, GlobeAltIcon, FaceSmileIcon, PhotoIcon } from '@heroicons/react/24/solid';
import EmojiPicker from 'emoji-picker-react';

export default function CreatePostModal({ onClose, onPostCreated }) {
  const { user, accessToken } = useAuth();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [validationError, setValidationError] = useState('');

  const overlayRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setValidationError('');
    }
  };

  const onEmojiClick = (emojiData) => {
    setContent((prev) => prev + emojiData.emoji);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedContent = content.trim();
    if (!trimmedContent && !selectedFile) return;
    if (selectedFile && !trimmedContent) {
      setValidationError('Add a caption with your photo/video.');
      return;
    }

    try {
      setLoading(true);
      setValidationError('');
      let media_id = null;

      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('usage', 'post');

        const uploadRes = await apiRequest('/media/upload', {
          method: 'POST',
          token: accessToken,
          body: formData,
        });
        media_id = uploadRes._id || uploadRes.id;
      }

      const res = await apiRequest('/posts', {
        method: 'POST',
        token: accessToken,
        body: { content: trimmedContent, privacy: 'public', media_id }
      });

      setContent('');
      setSelectedFile(null);
      setPreviewUrl(null);
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
      <div className="w-full max-w-[500px] bg-white rounded-xl shadow-2xl border flex flex-col relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-center p-4 border-b relative">
          <h2 className="text-xl font-bold text-gray-900">Create post</h2>
          <button onClick={onClose} className="absolute right-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 flex-1 overflow-y-auto max-h-[400px]">
          <div className="flex items-center gap-3 mb-4">
            <img src={user?.profilePic || `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=random`} alt="me" className="w-10 h-10 rounded-full object-cover" />
            <div>
              <h3 className="font-bold text-gray-900">{user?.name}</h3>
              <div className="flex items-center gap-1 bg-gray-200 text-gray-800 text-xs font-semibold px-2 py-0.5 rounded-md mt-0.5 w-max">
                <GlobeAltIcon className="w-3 h-3" /> Public
              </div>
            </div>
          </div>

          <textarea
            placeholder={selectedFile ? 'Add a caption...' : `What's on your mind, ${user?.name?.split(' ')[0]}?`}
            className="w-full min-h-[100px] text-lg resize-none focus:outline-none placeholder-gray-500 text-gray-900"
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              if (validationError) setValidationError('');
            }}
            disabled={loading}
          />
          {validationError && (
            <p className="mt-2 text-sm text-red-600">{validationError}</p>
          )}

          {/* Media Preview */}
          {previewUrl && (
            <div className="relative mt-2 border rounded-lg overflow-hidden group">
              <button
                onClick={() => { setSelectedFile(null); setPreviewUrl(null); }}
                className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md z-10 opacity-0 group-hover:opacity-100 transition"
              >
                <XMarkIcon className="w-5 h-5 text-gray-600" />
              </button>
              {selectedFile.type.startsWith('video') ? (
                <video src={previewUrl} className="w-full max-h-60 object-cover" controls />
              ) : (
                <img src={previewUrl} alt="Preview" className="w-full max-h-60 object-cover" />
              )}
            </div>
          )}
        </div>

        {/* Addons */}
        <div className="px-4 pb-4">
          {showEmojiPicker && (
            <div className="absolute bottom-20 left-4 z-[110]">
              <EmojiPicker onEmojiClick={onEmojiClick} />
            </div>
          )}

          <div className="flex items-center justify-between border rounded-lg p-3 shadow-sm mb-4">
            <span className="font-semibold text-gray-800">Add to your post</span>
            <div className="flex items-center gap-2">
              <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*,video/*" />
              <button onClick={() => fileInputRef.current.click()} className="p-2 hover:bg-gray-100 rounded-full transition">
                <PhotoIcon className="w-6 h-6 text-green-500" />
              </button>
              <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="p-2 hover:bg-gray-100 rounded-full transition">
                <FaceSmileIcon className="w-6 h-6 text-yellow-500" />
              </button>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={(!content.trim() && !selectedFile) || loading}
            className="w-full bg-[#1877f2] text-white font-bold py-2.5 rounded-lg hover:bg-[#166fe5] disabled:bg-gray-200 transition"
          >
            {loading ? "Uploading..." : "Post"}
          </button>
        </div>
      </div>
    </div>
  );
}
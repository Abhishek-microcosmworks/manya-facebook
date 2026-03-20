import React, { useEffect, useState, useRef } from 'react';
import { XMarkIcon, MapPinIcon, GlobeAltIcon } from '@heroicons/react/24/solid';

export default function EditProfileModal({ profile, onClose, onSave }) {
  const [form, setForm] = useState({
    name: profile.name || '',
    username: profile.username || '',
    bio: profile.bio || '',
    location: profile.location || '',
    website: profile.website || '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const overlayRef = useRef(null);

  const isDirty =
    form.name !== (profile.name || '') ||
    form.username !== (profile.username || '') ||
    form.bio !== (profile.bio || '') ||
    form.location !== (profile.location || '') ||
    form.website !== (profile.website || '');

  const set = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isDirty) return;
    setError('');
    setSaving(true);
    try {
      const updated = await onSave(form);
      onClose(updated);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Close on backdrop click
  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose();
  };

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // Prevent body scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
    >
      <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h2 className="text-xl font-bold text-gray-900">Edit profile</h2>
          <button
            onClick={() => onClose()}
            className="p-2 rounded-full hover:bg-gray-100 transition"
            aria-label="Close"
          >
            <XMarkIcon className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Body */}
        <form
          onSubmit={handleSubmit}
          className="overflow-y-auto flex-1 px-4 py-4 space-y-5"
        >
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Name
            </label>
            <input
              type="text"
              value={form.name}
              onChange={set('name')}
              maxLength={60}
              placeholder="Your full name"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1877f2] focus:border-transparent transition"
            />
          </div>

          {/* Username */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Username
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm select-none">
                @
              </span>
              <input
                type="text"
                value={form.username}
                onChange={set('username')}
                maxLength={30}
                placeholder="your.username"
                className="w-full border border-gray-300 rounded-lg pl-7 pr-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1877f2] focus:border-transparent transition"
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Letters, numbers, dots, and underscores only.
            </p>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Bio
            </label>
            <textarea
              value={form.bio}
              onChange={set('bio')}
              maxLength={160}
              rows={3}
              placeholder="Tell people about yourself…"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 resize-none focus:outline-none focus:ring-2 focus:ring-[#1877f2] focus:border-transparent transition"
            />
            <p className="text-xs text-right text-gray-400 mt-0.5">
              {form.bio.length}/160
            </p>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
              <MapPinIcon className="w-4 h-4 text-gray-500" /> Location
            </label>
            <input
              type="text"
              value={form.location}
              onChange={set('location')}
              maxLength={100}
              placeholder="City, Country"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1877f2] focus:border-transparent transition"
            />
          </div>

          {/* Website */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
              <GlobeAltIcon className="w-4 h-4 text-gray-500" /> Website
            </label>
            <input
              type="url"
              value={form.website}
              onChange={set('website')}
              maxLength={200}
              placeholder="https://yourwebsite.com"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1877f2] focus:border-transparent transition"
            />
          </div>
        </form>

        {/* Footer */}
        <div className="px-4 py-3 border-t flex justify-end gap-3">
          <button
            type="button"
            onClick={() => onClose()}
            className="px-4 py-2 rounded-lg bg-gray-100 text-gray-800 font-semibold text-sm hover:bg-gray-200 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!isDirty || saving}
            onClick={handleSubmit}
            className="px-5 py-2 rounded-lg bg-[#1877f2] text-white font-semibold text-sm hover:bg-[#166fe5] disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
          >
            {saving ? (
              <>
                <svg className="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Saving…
              </>
            ) : (
              'Save'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

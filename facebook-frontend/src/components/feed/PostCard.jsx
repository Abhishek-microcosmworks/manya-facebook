import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../lib/api';
import { useAuth } from '../../auth/AuthContext';
import {
  UserIcon, HandThumbUpIcon, ChatBubbleLeftIcon,
  ShareIcon, ArrowPathRoundedSquareIcon, BookmarkIcon, XMarkIcon
} from '@heroicons/react/24/outline';
import {
  HandThumbUpIcon as HandThumbUpIconSolid,
  BookmarkIcon as BookmarkIconSolid
} from '@heroicons/react/24/solid';
import { formatDistanceToNow } from 'date-fns';
import CommentSection from './CommentSection';

// --- SHARE MODAL COMPONENT ---
function ShareModal({ postId, onClose }) {
  const { accessToken } = useAuth();
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sharingTo, setSharingTo] = useState(null);

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const res = await apiRequest('/friends/list', { token: accessToken });
        setFriends(res || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchFriends();
  }, [accessToken]);

  const handleShare = async (friendId) => {
    setSharingTo(friendId);
    try {
      await apiRequest(`/posts/${postId}/share/${friendId}`, { method: 'POST', token: accessToken });
      alert('Post shared successfully via message!');
      onClose();
    } catch (err) {
      alert(err.message || 'Failed to share post');
    } finally {
      setSharingTo(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col relative">
        <div className="flex items-center justify-center p-4 border-b">
          <h2 className="text-xl font-bold text-gray-900">Send in Message</h2>
          <button
            onClick={onClose}
            className="absolute right-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        <div className="p-4 overflow-y-auto flex-1 custom-scrollbar">
          {loading ? (
            <div className="flex justify-center py-10">
              <svg className="animate-spin w-8 h-8 text-[#1877f2]" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            </div>
          ) : friends.length === 0 ? (
            <div className="text-center text-gray-500 py-8 font-medium">You don't have any friends to share with yet.</div>
          ) : (
            <div className="space-y-2">
              {friends.map(({ friend_id: friend }) => friend && (
                <div key={friend._id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl border border-gray-100 transition">
                  <div className="flex items-center gap-3">
                    <img
                      src={friend.profile?.profile_pic_id?.url || `https://ui-avatars.com/api/?name=${friend.name}&background=random`}
                      className="w-12 h-12 rounded-full object-cover border"
                      alt={friend.name}
                    />
                    <div>
                      <div className="font-bold text-[15px] text-gray-900 leading-tight">{friend.name}</div>
                      <div className="text-sm text-gray-500">@{friend.username}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleShare(friend._id)}
                    disabled={sharingTo === friend._id}
                    className="bg-[#1877f2] text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-[#166fe5] disabled:opacity-50 transition"
                  >
                    {sharingTo === friend._id ? 'Sending...' : 'Send'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// --- MAIN POST CARD COMPONENT ---
export default function PostCard({ post, initiallySaved = false, onUnsave }) {
  const { user: currentUser, accessToken } = useAuth();

  const isRepost = post.feed_type === 'repost';
  const renderData = isRepost ? post.original_post : post;

  const initialLiked = renderData.likes?.some(l => l.user_id === currentUser.id);
  const [isLiked, setIsLiked] = useState(initialLiked);
  const [likesCount, setLikesCount] = useState(renderData.likes?.length || 0);
  const [showComments, setShowComments] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);
  const [loadingSaveAction, setLoadingSaveAction] = useState(false);

  // New States for Save & Share
  const [isSaved, setIsSaved] = useState(initiallySaved);
  const [showShareModal, setShowShareModal] = useState(false);

  const handleLike = async () => {
    if (loadingAction) return;
    try {
      setLoadingAction(true);
      if (isLiked) {
        setIsLiked(false);
        setLikesCount(c => c - 1);
        await apiRequest(`/posts/${renderData._id}/like`, { method: 'DELETE', token: accessToken });
      } else {
        setIsLiked(true);
        setLikesCount(c => c + 1);
        await apiRequest(`/posts/${renderData._id}/like`, { method: 'POST', token: accessToken });
      }
    } catch (err) {
      setIsLiked(initialLiked);
      setLikesCount(renderData.likes?.length || 0);
    } finally {
      setLoadingAction(false);
    }
  };

  const handleRepost = async () => {
    if (!window.confirm("Repost this to your timeline?")) return;
    try {
      await apiRequest(`/posts/${renderData._id}/repost`, { method: 'POST', token: accessToken });
      alert("Successfully reposted!");
    } catch (err) {
      alert(err.message || 'Failed to repost');
    }
  };

  const handleSaveToggle = async () => {
    if (!accessToken) return;
    if (loadingSaveAction) return;

    const previousIsSaved = isSaved;
    setLoadingSaveAction(true);

    try {
      if (previousIsSaved) {
        setIsSaved(false); // Optimistic UI
        await apiRequest(`/posts/${renderData._id}/save`, { method: 'DELETE', token: accessToken });
        if (onUnsave) onUnsave(renderData._id); // Callback for SavedPosts view to remove it
      } else {
        setIsSaved(true);
        await apiRequest(`/posts/${renderData._id}/save`, { method: 'POST', token: accessToken });
      }
    } catch (err) {
      // Backend throws ConflictException when already saved; treat it as success to avoid noisy errors.
      const status = err?.status;
      if (status === 409) {
        setIsSaved(true);
        return;
      }
      if (status === 404) {
        setIsSaved(false);
        return;
      }

      // Revert on failure for all other errors.
      setIsSaved(previousIsSaved);
      alert(err.message || 'Failed to update saved status');
    } finally {
      setLoadingSaveAction(false);
    }
  };

  const author = isRepost ? renderData.author : post.author;

  return (
    <div className="bg-white rounded-xl shadow-sm border mb-4 relative">
      {isRepost && (
        <div className="px-4 pt-3 flex items-center gap-2 text-sm text-gray-500 font-semibold">
          <ArrowPathRoundedSquareIcon className="w-4 h-4" />
          <Link to={`/profile/${post.author?.username}`} className="hover:underline">
            {post.author?.name}
          </Link>
          <span>reposted</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between p-4 pb-2">
        <div className="flex items-center gap-3">
          <Link to={`/profile/${author?.username}`} className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex-shrink-0 cursor-pointer">
            {author?.profile?.profile_pic_id?.url ? (
              <img src={author.profile.profile_pic_id.url} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <UserIcon className="w-6 h-6 text-gray-400 mx-auto mt-2" />
            )}
          </Link>
          <div>
            <Link to={`/profile/${author?.username}`} className="font-bold text-[15px] text-gray-900 cursor-pointer hover:underline leading-tight block">
              {author?.name}
            </Link>
            <div className="text-[13px] text-gray-500 flex items-center gap-1">
              <span>{formatDistanceToNow(new Date(renderData.created_at), { addSuffix: true })}</span>
              <span>•</span>
              <span className="capitalize">{renderData.privacy}</span>
            </div>
          </div>
        </div>

        {/* Save Bookmark Icon */}
        <button
          onClick={handleSaveToggle}
          disabled={loadingSaveAction}
          className="p-2 rounded-full hover:bg-gray-100 transition text-gray-500 focus:outline-none"
          title={isSaved ? "Unsave Post" : "Save Post"}
        >
          {isSaved ? <BookmarkIconSolid className="w-6 h-6 text-[#1877f2]" /> : <BookmarkIcon className="w-6 h-6" />}
        </button>
      </div>

      {/* Content */}
      <div className="px-4 pb-3 text-[15px] text-gray-900 whitespace-pre-wrap">
        {renderData.content}
      </div>

      {/* Media Placeholder */}
      {renderData.media_id && (
        <div className="w-full h-72 bg-gray-100 flex items-center justify-center text-gray-400 border-y">
          Attached Media Placeholder
        </div>
      )}

      {/* Counters */}
      <div className="px-4 py-2 flex justify-between text-sm text-gray-500 border-b mx-4">
        <div className="flex items-center gap-1">
          {likesCount > 0 && (
            <>
              <div className="bg-[#1877f2] rounded-full p-1 border border-white">
                <HandThumbUpIconSolid className="w-3 h-3 text-white" />
              </div>
              <span className="hover:underline cursor-pointer">{likesCount}</span>
            </>
          )}
        </div>
        <div className="flex gap-3">
          {renderData.comments_count > 0 && (
            <span
              onClick={() => setShowComments(true)}
              className="hover:underline cursor-pointer"
            >
              {renderData.comments_count} Comments
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex px-4 py-1 gap-1">
        <button
          onClick={handleLike}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-semibold transition ${isLiked ? 'text-[#1877f2]' : 'text-gray-600 hover:bg-gray-100'}`}
        >
          {isLiked ? <HandThumbUpIconSolid className="w-5 h-5" /> : <HandThumbUpIcon className="w-5 h-5" />}
          <span className="hidden sm:flex"> Like</span>
        </button>
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-semibold text-gray-600 hover:bg-gray-100 transition"
        >
          <ChatBubbleLeftIcon className="w-5 h-5" />
          <span className="hidden sm:flex">Comment</span>
        </button>
        <button
          onClick={handleRepost}
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-semibold text-gray-600 hover:bg-gray-100 transition sm:flex"
        >
          <ArrowPathRoundedSquareIcon className="w-5 h-5" />
          <span className="hidden sm:flex">Repost</span>
        </button>
        <button
          onClick={() => setShowShareModal(true)}
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-semibold text-gray-600 hover:bg-gray-100 transition"
        >
          <ShareIcon className="w-5 h-5" />
          <span className="hidden sm:flex">Share</span>
        </button>
      </div>

      {showComments && <CommentSection postId={renderData._id} />}
      {showShareModal && <ShareModal postId={renderData._id} onClose={() => setShowShareModal(false)} />}
    </div>
  );
}
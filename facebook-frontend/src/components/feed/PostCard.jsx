import React, { useState } from 'react';
import { apiRequest } from '../../lib/api';
import { useAuth } from '../../auth/AuthContext';
import { UserIcon, HandThumbUpIcon, ChatBubbleLeftIcon, ShareIcon, ArrowPathRoundedSquareIcon } from '@heroicons/react/24/outline';
import { HandThumbUpIcon as HandThumbUpIconSolid } from '@heroicons/react/24/solid';
import { formatDistanceToNow } from 'date-fns';
import CommentSection from './CommentSection';
import { Link } from 'react-router-dom';

export default function PostCard({ post }) {
  const { user: currentUser, accessToken } = useAuth();
  
  // Real-time optimistic UI states
  const isRepost = post.feed_type === 'repost';
  const renderData = isRepost ? post.original_post : post;
  
  const initialLiked = renderData.likes?.some(l => l.user_id === currentUser.id);
  const [isLiked, setIsLiked] = useState(initialLiked);
  const [likesCount, setLikesCount] = useState(renderData.likes?.length || 0);
  const [showComments, setShowComments] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);

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
      alert('Failed to interact');
      // Revert optimistic update
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

  const author = isRepost ? renderData.author : post.author;

  return (
    <div className="bg-white rounded-xl shadow-sm border mb-4">
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
      <div className="flex items-center gap-3 p-4">
        <Link to={`/profile/${author?.username}`} className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex-shrink-0 cursor-pointer">
          {author?.profile?.profile_pic_id?.url ? (
            <img src={author.profile.profile_pic_id.url} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <UserIcon className="w-6 h-6 text-gray-400 mx-auto mt-2" />
          )}
        </Link>
        <div>
          <Link to={`/profile/${author?.username}`} className="font-bold text-gray-900 cursor-pointer hover:underline">
            {author?.name}
          </Link>
          <p className="text-xs text-gray-500">
            {formatDistanceToNow(new Date(renderData.created_at), { addSuffix: true })} • {renderData.privacy}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-2 text-gray-800">
        {renderData.content}
      </div>

      {/* Media Placeholder */}
      {renderData.media_id && (
        <div className="w-full h-64 bg-gray-100 flex items-center justify-center text-gray-400">
          Attached Media Placeholder
        </div>
      )}

      {/* Counters */}
      <div className="px-4 py-2 flex justify-between text-sm text-gray-500">
        <div className="flex items-center gap-1">
          {likesCount > 0 && (
            <>
              <div className="bg-[#1877f2] rounded-full p-1 border-2 border-white">
                <HandThumbUpIconSolid className="w-3 h-3 text-white" />
              </div>
              <span className="hover:underline cursor-pointer">{likesCount} Likes</span>
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

      <div className="border-t mx-4" />

      {/* Actions */}
      <div className="flex px-2 py-1 gap-1">
        <button 
          onClick={handleLike} 
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-semibold transition ${isLiked ? 'text-[#1877f2]' : 'text-gray-600 hover:bg-gray-100'}`}
        >
          {isLiked ? <HandThumbUpIconSolid className="w-5 h-5" /> : <HandThumbUpIcon className="w-5 h-5" />}
          Like
        </button>
        <button 
          onClick={() => setShowComments(!showComments)}
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-semibold text-gray-600 hover:bg-gray-100 transition"
        >
          <ChatBubbleLeftIcon className="w-5 h-5" />
          Comment
        </button>
        <button 
          onClick={handleRepost}
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-semibold text-gray-600 hover:bg-gray-100 transition"
        >
          <ArrowPathRoundedSquareIcon className="w-5 h-5" />
          Repost
        </button>
      </div>

      {/* Comments Section Drawer */}
      {showComments && (
        <CommentSection postId={renderData._id} />
      )}
    </div>
  );
}

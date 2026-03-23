import React, { useState, useEffect, useCallback } from 'react';
import { apiRequest } from '../../lib/api';
import { useAuth } from '../../auth/AuthContext';
import { UserIcon } from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';
import { HandThumbUpIcon } from '@heroicons/react/24/solid';

export default function CommentSection({ postId }) {
  const { accessToken } = useAuth();
  const [comments, setComments] = useState([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchComments = useCallback(async () => {
    try {
      const res = await apiRequest(`/posts/${postId}/comments`, { token: accessToken });
      setComments(res || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [postId, accessToken]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    try {
      await apiRequest(`/posts/${postId}/comment`, {
        method: 'POST',
        token: accessToken,
        body: { content }
      });
      setContent('');
      fetchComments(); // Refresh comments
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="p-4 bg-gray-50 border-t rounded-b-xl">
      <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
        <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
          <UserIcon className="w-5 h-5 text-gray-400 mx-auto mt-1.5" />
        </div>
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write a comment..."
          className="flex-1 bg-gray-200 rounded-full px-4 py-1.5 text-sm focus:outline-none hover:bg-gray-300 transition"
        />
        <button type="submit" className="hidden">Post</button>
      </form>

      {loading ? (
        <div className="text-center text-sm text-gray-500">Loading comments...</div>
      ) : (
        <div className="space-y-4">
          {comments.map(comment => (
            <CommentItem 
              key={comment._id} 
              comment={comment} 
              fetchComments={fetchComments} 
            />
          ))}
        </div>
      )}
    </div>
  );
}

// --- NEW COMPONENT FOR INDIVIDUAL COMMENTS ---
function CommentItem({ comment, fetchComments }) {
  const { accessToken } = useAuth();
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [replies, setReplies] = useState([]);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [likesCount, setLikesCount] = useState(comment.likes_count || 0);

  // Handle Liking / Unliking a comment
  const handleLikeComment = async () => {
    try {
      await apiRequest(`/comments/${comment._id}/like`, { method: 'POST', token: accessToken });
      setLikesCount(c => c + 1);
    } catch (err) {
      if (err.message === 'Already liked') {
        try {
          // Fallback to Unlike if they already liked it
          await apiRequest(`/comments/${comment._id}/like`, { method: 'DELETE', token: accessToken });
          setLikesCount(c => Math.max(0, c - 1));
        } catch (unlikeErr) {
          console.error('Failed to unlike');
        }
      } else {
        alert(err.message);
      }
    }
  };

  // Toggle Reply Section & Fetch Replies
  const toggleReply = async () => {
    const willShow = !showReplyInput;
    setShowReplyInput(willShow);
    
    // Fetch replies only if we are opening it and it has replies
    if (willShow && comment.replies_count > 0 && replies.length === 0) {
      setLoadingReplies(true);
      try {
        const res = await apiRequest(`/comments/${comment._id}/replies`, { token: accessToken });
        setReplies(res || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingReplies(false);
      }
    }
  };

  // Submit a Reply
  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyContent.trim()) return;
    try {
      await apiRequest(`/comments/${comment._id}/reply`, {
        method: 'POST',
        token: accessToken,
        body: { content: replyContent }
      });
      setReplyContent('');
      
      // Fetch latest replies to update the UI
      const res = await apiRequest(`/comments/${comment._id}/replies`, { token: accessToken });
      setReplies(res || []);
      fetchComments(); // Refresh parent to update the reply count text
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="flex gap-2">
      <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
        {comment.user_id?.profile?.profile_pic_id?.url ? (
          <img src={comment.user_id.profile.profile_pic_id.url} alt="Avatar" className="w-full h-full object-cover" />
        ) : (
          <UserIcon className="w-5 h-5 text-gray-400 mx-auto mt-1.5" />
        )}
      </div>
      
      <div className="flex-1">
        <div className="bg-gray-100 rounded-2xl px-3 py-2 inline-block">
          <h4 className="font-bold text-sm text-gray-900 leading-tight shrink-0">{comment.user_id?.name}</h4>
          <p className="text-sm text-gray-800">{comment.content}</p>
        </div>
        
        {/* Interaction Bar */}
        <div className="flex items-center gap-3 px-3 mt-1 text-xs text-gray-500 font-bold">
          <button onClick={handleLikeComment} className="hover:underline text-gray-500 focus:outline-none">Like</button>
          <button onClick={toggleReply} className="hover:underline text-gray-500 focus:outline-none">Reply</button>
          <span className="font-normal text-gray-400">{formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}</span>
          
          {likesCount > 0 && (
            <span className="text-[#1877f2] font-normal flex items-center gap-1 bg-white shadow-sm rounded-full px-1.5"><HandThumbUpIcon className="w-4 h-4" /> {likesCount}</span>
          )}
          
          {comment.replies_count > 0 && !showReplyInput && (
            <span className="text-gray-400 font-normal cursor-pointer hover:underline" onClick={toggleReply}>
              • {comment.replies_count} Replies
            </span>
          )}
        </div>

        {/* Replies Section */}
        {showReplyInput && (
          <div className="mt-3 space-y-3 pl-3 ml-2 border-l-2 border-gray-200">
            {loadingReplies ? (
              <div className="text-xs text-gray-400">Loading replies...</div>
            ) : (
              replies.map(reply => (
                <div key={reply._id} className="flex gap-2">
                  <div className="w-6 h-6 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                    {reply.user_id?.profile?.profile_pic_id?.url ? (
                      <img src={reply.user_id.profile.profile_pic_id.url} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <UserIcon className="w-4 h-4 text-gray-400 mx-auto mt-1" />
                    )}
                  </div>
                  <div className="bg-gray-100 rounded-2xl px-3 py-1.5 inline-block">
                    <h4 className="font-bold text-[13px] text-gray-900 leading-tight shrink-0">{reply.user_id?.name}</h4>
                    <p className="text-[13px] text-gray-800">{reply.content}</p>
                  </div>
                </div>
              ))
            )}
            
            {/* Reply Input Form */}
            <form onSubmit={handleReplySubmit} className="flex gap-2 mt-2">
              <input
                type="text"
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder={`Reply to ${comment.user_id?.name?.split(' ')[0]}...`}
                className="flex-1 bg-gray-200 rounded-full px-3 py-1 text-xs focus:outline-none hover:bg-gray-300 transition"
              />
              <button type="submit" className="hidden">Reply</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
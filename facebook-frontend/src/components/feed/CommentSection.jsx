import React, { useState, useEffect, useCallback } from 'react';
import { apiRequest } from '../../lib/api';
import { useAuth } from '../../auth/AuthContext';
import { UserIcon } from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';

export default function CommentSection({ postId }) {
  const { user, accessToken } = useAuth();
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
            <div key={comment._id} className="flex gap-2">
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
                <div className="flex items-center gap-3 px-3 mt-1 text-xs text-gray-500 font-bold">
                  <span className="cursor-pointer hover:underline text-gray-500">Like</span>
                  <span className="cursor-pointer hover:underline text-gray-500">Reply</span>
                  <span className="font-normal text-gray-400">{formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}</span>
                  {comment.likes_count > 0 && (
                    <span className="text-gray-400 font-normal">👍 {comment.likes_count}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { apiRequest } from '../../lib/api';
import { useAuth } from '../../auth/AuthContext';
import { PhotoIcon, FaceSmileIcon, XMarkIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';
import { HandThumbUpIcon } from '@heroicons/react/24/solid';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';
import EmojiPicker from 'emoji-picker-react';

export default function CommentSection({ postId }) {
  const { accessToken, user } = useAuth();
  const [comments, setComments] = useState([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Media & Emoji States for main comment
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef(null);

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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if ((!content.trim() && !selectedFile) || submitting) return;

    try {
      setSubmitting(true);
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

      await apiRequest(`/posts/${postId}/comment`, {
        method: 'POST',
        token: accessToken,
        body: { content: content.trim(), media_id }
      });

      // Reset states
      setContent('');
      setSelectedFile(null);
      setPreviewUrl(null);
      setShowEmojiPicker(false);
      fetchComments(); // Refresh comments
    } catch (err) {
      console.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 bg-gray-50 border-t rounded-b-xl">
      <div className="mb-4">
        <form onSubmit={handleSubmit} className="flex items-start gap-2">
          <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden shrink-0">
            <img src={user?.profilePic || `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=random`} alt="me" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 bg-gray-200 rounded-2xl px-3 py-1.5 focus-within:bg-gray-300 transition relative">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write a comment..."
              className="w-full bg-transparent border-none focus:ring-0 text-sm resize-none overflow-hidden"
              rows="1"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  if (content.trim() || selectedFile) {
                    handleSubmit(e);
                  }
                }
              }}
            />

            {/* Preview Section */}
            {previewUrl && (
              <div className="relative mt-2 inline-block">
                <img src={previewUrl} className="h-20 w-20 object-cover rounded-lg border" alt="preview" />
                <button onClick={() => { setSelectedFile(null); setPreviewUrl(null) }} className="absolute -top-2 -right-2 bg-white rounded-full border p-0.5">
                  <XMarkIcon className="w-3 h-3 text-gray-600" />
                </button>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 mt-1">
              <button type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="text-gray-500 hover:text-yellow-600">
                <FaceSmileIcon className="w-5 h-5" />
              </button>
              <button type="button" onClick={() => fileInputRef.current.click()} className="text-gray-500 hover:text-green-600">
                <PhotoIcon className="w-5 h-5" />
              </button>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*,video/*" />
              <button
                type="submit"
                disabled={(!content.trim() && !selectedFile) || submitting}
                className="inline-flex items-center rounded-full bg-[#1877f2] p-1.5 text-white disabled:bg-gray-300"
                title="Post comment"
              >
                <PaperAirplaneIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </form>
        {showEmojiPicker && (
          <div className="absolute z-10 mt-2">
            <EmojiPicker onEmojiClick={(emoji) => setContent(c => c + emoji.emoji)} />
          </div>
        )}
      </div>

      {loading ? (
        <div className="text-center text-sm text-gray-500">Loading comments...</div>
      ) : (
        <div className="space-y-4">
          {comments.map(comment => (
            <CommentItem key={comment._id} comment={comment} fetchComments={fetchComments} />
          ))}
        </div>
      )}
    </div>
  );
}

function CommentItem({ comment, fetchComments }) {
  const { accessToken } = useAuth();
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [replies, setReplies] = useState([]);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [likesCount, setLikesCount] = useState(comment.likes_count || 0);

  // States for Reply Media/Emoji
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

  const handleLikeComment = async () => {
    try {
      await apiRequest(`/comments/${comment._id}/like`, { method: 'POST', token: accessToken });
      setLikesCount(c => c + 1);
    } catch (err) {
      if (err.message === 'Already liked') {
        try {
          await apiRequest(`/comments/${comment._id}/like`, { method: 'DELETE', token: accessToken });
          setLikesCount(c => Math.max(0, c - 1));
        } catch (unlikeErr) { console.error('Failed to unlike'); }
      }
    }
  };

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

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyContent.trim() && !selectedFile) return;
    try {
      let media_id = null;
      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('usage', 'post');
        const uploadRes = await apiRequest('/media/upload', { method: 'POST', token: accessToken, body: formData });
        media_id = uploadRes._id || uploadRes.id;
      }

      await apiRequest(`/comments/${comment._id}/reply`, {
        method: 'POST',
        token: accessToken,
        body: { content: replyContent, media_id }
      });

      setReplyContent('');
      setSelectedFile(null);
      setPreviewUrl(null);
      // Fetch latest replies to update the UI
      const res = await apiRequest(`/comments/${comment._id}/replies`, { token: accessToken });
      setReplies(res || []);
      fetchComments(); // Refresh parent to update the reply count text
    } catch (err) { console.error(err.message); }
  };

  return (
    <div className="flex gap-2">
      <Link to={`/profile/${comment.user_id?.username}`} className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden shrink-0">
        <img src={comment.user_id?.profile?.profile_pic_id?.url || 'https://via.placeholder.com/150'} alt="Avatar" className="w-full h-full object-cover" />
      </Link>

      <div className="flex-1">
        <div className="bg-gray-100 rounded-2xl px-3 py-2 inline-block max-w-full">
          <Link to={`/profile/${comment.user_id?.username}`} className="block font-bold text-sm text-gray-900 hover:underline">
            {comment.user_id?.name}
          </Link>
          <p className="text-sm text-gray-800">{comment.content}</p>
          {comment.media_id && (
            <div className="mt-2 rounded-lg overflow-hidden border bg-black">
              <img src={comment.media_id.url} alt="comment media" className="max-w-full max-h-60 mx-auto" />
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 px-3 mt-1 text-xs text-gray-500 font-bold">
          <button onClick={handleLikeComment} className="hover:underline">Like</button>
          <button onClick={toggleReply} className="hover:underline">Reply</button>
          <span className="font-normal text-gray-400">{formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}</span>
          {likesCount > 0 && <span className="text-[#1877f2] flex items-center gap-1 bg-white shadow-sm rounded-full px-1.5"><HandThumbUpIcon className="w-3 h-3" /> {likesCount}</span>}
        </div>

        {showReplyInput && (
          <div className="mt-3 space-y-3 pl-3 ml-2 border-l-2 border-gray-200">
            {replies.map(reply => (
              <div key={reply._id} className="flex gap-2">
                <Link to={`/profile/${reply.user_id?.username}`} className="w-6 h-6 rounded-full bg-gray-200 overflow-hidden shrink-0">
                  <img src={reply.user_id?.profile?.profile_pic_id?.url || 'https://via.placeholder.com/150'} alt="Avatar" className="w-full h-full object-cover" />
                </Link>
                <div className="bg-gray-100 rounded-2xl px-3 py-1.5 inline-block">
                  <Link to={`/profile/${reply.user_id?.username}`} className="block font-bold text-[13px] text-gray-900 hover:underline">{reply.user_id?.name}</Link>
                  <p className="text-[13px] text-gray-800">{reply.content}</p>
                  {reply.media_id && <img src={reply.media_id.url} className="mt-1 max-h-40 rounded border" alt="reply media" />}
                </div>
              </div>
            ))}

            <form onSubmit={handleReplySubmit} className="mt-2">
              <div className="flex items-center gap-2 bg-gray-200 rounded-full px-3 py-1 focus-within:bg-gray-300">
                <input
                  type="text"
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder={`Reply to ${comment.user_id?.name?.split(' ')[0]}...`}
                  className="flex-1 bg-transparent border-none focus:ring-0 text-xs"
                />
                <button type="button" onClick={() => fileInputRef.current.click()} className="text-gray-500 hover:text-green-600">
                  <PhotoIcon className="w-4 h-4" />
                </button>
                <input type="file" ref={fileInputRef} onChange={(e) => {
                  const f = e.target.files[0];
                  if (f) { setSelectedFile(f); setPreviewUrl(URL.createObjectURL(f)); }
                }} className="hidden" />
              </div>
              {previewUrl && (
                <div className="relative mt-1 ml-2 inline-block">
                  <img src={previewUrl} className="h-10 w-10 object-cover rounded border" alt="preview" />
                  <button onClick={() => { setSelectedFile(null); setPreviewUrl(null) }} className="absolute -top-1 -right-1 bg-white rounded-full border p-0.5">
                    <XMarkIcon className="w-2 h-2 text-gray-600" />
                  </button>
                </div>
              )}
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
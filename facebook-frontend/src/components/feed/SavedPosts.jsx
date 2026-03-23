import React, { useEffect, useState, useCallback } from 'react';
import { apiRequest } from '../../lib/api';
import { useAuth } from '../../auth/AuthContext';
import PostCard from './PostCard';
import { BookmarkIcon } from '@heroicons/react/24/solid';

export default function SavedPosts() {
    const { accessToken } = useAuth();
    const [savedPosts, setSavedPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchSavedPosts = useCallback(async () => {
        if (!accessToken) return;
        try {
            setLoading(true);
            const res = await apiRequest('/posts/saved', { token: accessToken });
            setSavedPosts(res || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [accessToken]);

    useEffect(() => {
        fetchSavedPosts();
    }, [fetchSavedPosts]);

    const handleUnsave = (postId) => {
        // Optimistically remove the post from the screen immediately 
        setSavedPosts((prev) => prev.filter(item => item.post._id !== postId));
    };

    return (
        <div className="w-full max-w-[590px] mx-auto pb-20">
            <div className="bg-white rounded-xl shadow-sm border p-4 mb-4 flex items-center gap-4">
                <div className="p-3 bg-[#1877f2]/10 rounded-full">
                    <BookmarkIcon className="w-8 h-8 text-[#1877f2]" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 leading-tight">Saved</h1>
                    <p className="text-sm text-gray-500 font-medium">Only you can see what you've saved</p>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <svg className="animate-spin w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                </div>
            ) : savedPosts.length === 0 ? (
                <div className="bg-white rounded-xl p-12 text-center text-gray-500 shadow-sm border font-medium">
                    You haven't saved any posts yet.
                </div>
            ) : (
                <div className="space-y-4">
                    {savedPosts.map((item) => (
                        <PostCard
                            key={item._id}
                            // Format the response to match what PostCard expects (injecting the populated author back as author)
                            post={{ ...item.post, author: item.post.user_id, feed_type: 'post' }}
                            initiallySaved={true}
                            onUnsave={handleUnsave}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
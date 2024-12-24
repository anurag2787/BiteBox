"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { useDarkMode } from "../../DarkModeContext";
import { Heart, MessageCircle, ChevronDown, ChevronUp, Send } from "lucide-react";
import { format } from "date-fns";
import { UserAuth } from "../../context/AuthContext";
import loader from "@/Components/loader";

const PostDetailsPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [post, setPost] = useState(null);
  const [error, setError] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [replyText, setReplyText] = useState("");
  const [expandedComments, setExpandedComments] = useState(new Set());
  const [activeReplyId, setActiveReplyId] = useState(null);
  const { darkMode } = useDarkMode();
  const { user } = UserAuth();

  const userId = user ? user.email : null;

  useEffect(() => {
    const postId = searchParams.get("id");
    if (!postId) {
      setError("Post ID is missing!");
      return;
    }

    const fetchPost = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/posts/${postId}`);
        setPost(response.data);
        setIsLiked(response.data.likes?.some((like) => like.userId === userId));
      } catch (err) {
        setError("Failed to fetch post details");
        console.error(err);
      }
    };

    fetchPost();
  }, [searchParams, userId]);

  const handleLike = async () => {
    if (!userId || !post) return;

    try {
      await axios.put(`http://localhost:5000/api/posts/${post._id}/like`, { userId });
      setPost((prevPost) => ({
        ...prevPost,
        likes: [...prevPost.likes, { userId }],
      }));
      setIsLiked(true);
    } catch (err) {
      console.error("Error liking the post:", err);
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim() || !post) return;

    try {
      const response = await axios.post(
        `http://localhost:5000/api/posts/${post._id}/comment`,
        { userId, text: commentText }
      );
      setPost((prevPost) => ({
        ...prevPost,
        comments: response.data.comments,
      }));
      setCommentText("");
    } catch (err) {
      console.error("Error adding comment:", err);
    }
  };

  const handleAddReply = async (commentId) => {
    if (!replyText.trim() || !post) return;

    try {
      const response = await axios.post(
        `http://localhost:5000/api/posts/${post._id}/comment/${commentId}/reply`,
        { userId, text: replyText }
      );
      
      setPost((prevPost) => ({
        ...prevPost,
        comments: prevPost.comments.map((comment) =>
          comment._id === commentId ? response.data.comment : comment
        ),
      }));
      
      setReplyText("");
      setActiveReplyId(null);
    } catch (err) {
      console.error("Error adding reply:", err);
    }
  };

  const toggleReplies = (commentId) => {
    setExpandedComments((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  };

  if (error) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-black"
      }`}>
        <p className="text-red-500 text-xl font-semibold">{error}</p>
      </div>
    );
  }

  if (!post) {
    return <div>{loader()}</div>;
  }

  const formattedDate = post.createdAt
    ? format(new Date(post.createdAt), "MMMM dd, yyyy")
    : "Unknown";

  return (
    <div className={`min-h-screen py-8 px-4 ${
      darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-100 text-gray-900"
    }`}>
      <div className="max-w-4xl mx-auto">
        <div className={`rounded-lg overflow-hidden shadow-lg ${
          darkMode ? "bg-gray-800" : "bg-white"
        }`}>
          <div className="relative h-96">
            <img
              src={post.thumbnail || "/placeholder-image.jpg"}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="p-8 space-y-6">
            <h1 className="text-4xl font-bold tracking-tight">{post.title}</h1>
            
            <div className="flex items-center justify-between">
              <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                Posted by {post.user} on {formattedDate}
              </p>
              
              <button
                onClick={handleLike}
                disabled={isLiked}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                  isLiked
                    ? "bg-pink-600 text-white"
                    : `${darkMode ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-100 hover:bg-gray-200"}`
                }`}
              >
                <Heart className={`w-10 h-5 ${isLiked ? "fill-current" : ""}`} />
                <span>{post.likes.length}</span>
              </button>
            </div>
            
            <div className={`prose max-w-none ${darkMode ? "prose-invert" : ""}`}>
              <p className="text-lg leading-relaxed">{post.content}</p>
            </div>

            <div className="space-y-6 mt-12">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-6 h-6" />
                <h2 className="text-xl font-bold">Comments ({post.comments.length})</h2>
              </div>

              <div className="flex gap-4">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className={`flex-grow p-4 rounded-lg resize-none h-24 ${
                    darkMode
                      ? "bg-gray-700 text-white border-gray-600"
                      : "bg-gray-50 text-gray-900 border-gray-200"
                  } border focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="Add a comment..."
                />
                <button
                  onClick={handleAddComment}
                  className={`self-end px-6 py-3 rounded-lg flex items-center gap-2 ${
                    darkMode
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "bg-blue-500 hover:bg-blue-600"
                  } text-white transition-colors`}
                >
                  <Send className="w-4 h-4" />
                  Post
                </button>
              </div>

              <div className="space-y-6">
                {post.comments.map((comment) => (
                  <div
                    key={comment._id}
                    className={`rounded-lg ${
                      darkMode ? "bg-gray-700" : "bg-gray-50"
                    } p-6 space-y-4`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{comment.user}</p>
                        <p className={darkMode ? "text-gray-300" : "text-gray-700"}>
                          {comment.text}
                        </p>
                      </div>
                      <button
                        onClick={() => setActiveReplyId(activeReplyId === comment._id ? null : comment._id)}
                        className={`px-4 py-2 rounded-lg text-sm ${
                          darkMode
                            ? "bg-gray-600 hover:bg-gray-500"
                            : "bg-gray-200 hover:bg-gray-300"
                        } transition-colors`}
                      >
                        Reply
                      </button>
                    </div>

                    {activeReplyId === comment._id && (
                      <div className="flex gap-2 mt-4">
                        <input
                          type="text"
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          className={`flex-grow p-2 rounded-lg ${
                            darkMode
                              ? "bg-gray-600 text-white border-gray-500"
                              : "bg-white text-gray-900 border-gray-200"
                          } border`}
                          placeholder="Write a reply..."
                        />
                        <button
                          onClick={() => handleAddReply(comment._id)}
                          className={`px-4 rounded-lg ${
                            darkMode
                              ? "bg-blue-600 hover:bg-blue-700"
                              : "bg-blue-500 hover:bg-blue-600"
                          } text-white`}
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      </div>
                    )}

                    {comment.replies?.length > 0 && (
                      <div>
                        <button
                          onClick={() => toggleReplies(comment._id)}
                          className={`flex items-center gap-1 text-sm ${
                            darkMode ? "text-gray-400" : "text-gray-600"
                          } hover:underline`}
                        >
                          {expandedComments.has(comment._id) ? (
                            <>
                              <ChevronUp className="w-4 h-4" />
                              Hide Replies
                            </>
                          ) : (
                            <>
                              <ChevronDown className="w-4 h-4" />
                              Show {comment.replies.length} Replies
                            </>
                          )}
                        </button>

                        {expandedComments.has(comment._id) && (
                          <div className="ml-6 mt-4 space-y-4 pl-4 border-l-2 border-gray-300">
                            {comment.replies.map((reply) => (
                              <div
                                key={reply._id}
                                className={`p-4 rounded-lg ${
                                  darkMode ? "bg-gray-600" : "bg-white"
                                }`}
                              >
                                <p className="font-medium text-sm">{reply.user}</p>
                                <p className={`text-sm ${
                                  darkMode ? "text-gray-300" : "text-gray-700"
                                }`}>
                                  {reply.text}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostDetailsPage;
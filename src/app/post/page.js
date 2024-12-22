'use client'
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const PostsPage = () => {
  const [posts, setPosts] = useState([]);
  const router = useRouter();
  

  // Fetch all posts
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/posts/"); 
        const data = await response.json();
        setPosts(data);
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    };

    fetchPosts();
  }, []);

  // Redirect to Create New Post page
  const handleCreatePost = () => {
    router.push("/post/createpost");
  };

  // Redirect to Single Post page
  const handleViewPost = (post_Id) => {
    router.push(`/posts/${post._Id}`);
  };

  return (
    <div className="container mx-auto p-4">
      {/* Button to create a new post */}
      <div className="flex justify-end mb-4">
        <button
          onClick={handleCreatePost}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
        >
          Create New Post
        </button>
      </div>

      {/* Display posts in cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {posts.map((post) => (
          <div
            key={post._id}
            className="bg-white shadow-md rounded-lg overflow-hidden cursor-pointer"
            onClick={() => handleViewPost(post._id)}
          >
            <img
              src={post.thumbnail}
              alt={post.title}
              className="w-full h-40 object-cover"
            />
            <div className="p-4">
              <h3 className="text-lg font-bold">{post.title}</h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PostsPage;

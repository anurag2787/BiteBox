"use client";
import React, { useState } from "react";
import axios from "axios";
import { useDarkMode } from "../../DarkModeContext";
import { UserAuth } from "../../context/AuthContext";
import { 
  Video, 
  Mic,
  MicOff,
  Camera,
  CameraOff,
  Settings,
  Heart,
  Send
} from "lucide-react";
import { Room, VideoTrack } from "livekit-client";

const StartNewLiveStream = () => {
  const { darkMode } = useDarkMode();
  const { user } = UserAuth();
  const [room, setRoom] = useState(null);
  const [streamId, setStreamId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streamData, setStreamData] = useState({
    title: "",
    description: "",
    thumbnail: "",
  });
  const [localParticipant, setLocalParticipant] = useState(null);
  const [isMicEnabled, setIsMicEnabled] = useState(true);
  const [isCameraEnabled, setIsCameraEnabled] = useState(true);
  const [isStreamStarted, setIsStreamStarted] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [likes, setLikes] = useState(0);

  const initializeLiveKit = async (streamId) => {
    try {
      const room = new Room({
        adaptiveStream: true,
        dynacast: true,
      });

      await room.connect(process.env.NEXT_PUBLIC_LIVEKIT_URL, streamId);
      setRoom(room);
      setLocalParticipant(room.localParticipant);

      // Enable initial media
      await room.localParticipant.setCameraEnabled(true);
      await room.localParticipant.setMicrophoneEnabled(true);
    } catch (err) {
      console.error("Failed to initialize LiveKit:", err);
    }
  };

  const handleStartStream = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post("http://localhost:5000/api/streams", {
        userId: user.email,
        username: user.email,
        title: streamData.title,
        description: streamData.description,
        thumbnail: streamData.thumbnail,
      });

      const newStreamId = response.data.stream._id;
      setStreamId(newStreamId);
      await initializeLiveKit(newStreamId);
      setIsStreamStarted(true);
      console.log("Share this link to join:", `http://localhost:3000/streams/joinlivestream/?id=${newStreamId}`);
    } catch (err) {
      console.error("Failed to start stream:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMicrophone = async () => {
    if (localParticipant) {
      const enabled = !isMicEnabled;
      await localParticipant.setMicrophoneEnabled(enabled);
      setIsMicEnabled(enabled);
    }
  };

  const toggleCamera = async () => {
    if (localParticipant) {
      const enabled = !isCameraEnabled;
      await localParticipant.setCameraEnabled(enabled);
      setIsCameraEnabled(enabled);
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) return;

    try {
      const response = await axios.post(
        `http://localhost:5000/api/streams/${streamId}/comment`,
        {
          userId: user.email,
          text: commentText,
        }
      );
      setComments(response.data.comments);
      setCommentText("");
    } catch (err) {
      console.error("Error adding comment:", err);
    }
  };

  React.useEffect(() => {
    return () => {
      if (room) {
        room.disconnect();
      }
    };
  }, [room]);

  return (
    <div className={`min-h-screen py-8 px-4 ${
      darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"
    }`}>
      <div className="max-w-6xl mx-auto">
        {!isStreamStarted ? (
          <div className={`rounded-lg shadow-lg p-8 ${
            darkMode ? "bg-gray-800" : "bg-white"
          }`}>
            <h1 className="text-2xl font-bold mb-6">Start New Live Stream</h1>
            
            <form onSubmit={handleStartStream} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Stream Title</label>
                  <input
                    type="text"
                    value={streamData.title}
                    onChange={(e) => setStreamData(prev => ({...prev, title: e.target.value}))}
                    className={`w-full p-3 rounded-lg border ${
                      darkMode 
                        ? "bg-gray-700 border-gray-600" 
                        : "bg-white border-gray-300"
                    }`}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    value={streamData.description}
                    onChange={(e) => setStreamData(prev => ({...prev, description: e.target.value}))}
                    className={`w-full p-3 rounded-lg border h-32 resize-none ${
                      darkMode 
                        ? "bg-gray-700 border-gray-600" 
                        : "bg-white border-gray-300"
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Thumbnail URL</label>
                  <input
                    type="text"
                    value={streamData.thumbnail}
                    onChange={(e) => setStreamData(prev => ({...prev, thumbnail: e.target.value}))}
                    className={`w-full p-3 rounded-lg border ${
                      darkMode 
                        ? "bg-gray-700 border-gray-600" 
                        : "bg-white border-gray-300"
                    }`}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 rounded-lg flex items-center justify-center gap-2 ${
                  darkMode 
                    ? "bg-blue-600 hover:bg-blue-700" 
                    : "bg-blue-500 hover:bg-blue-600"
                } text-white transition-colors`}
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Video className="w-5 h-5" />
                    Start Streaming
                  </>
                )}
              </button>
            </form>
          </div>
        ) : (
          <div className="space-y-6">
            <div className={`rounded-lg overflow-hidden ${
              darkMode ? "bg-gray-800" : "bg-white"
            }`}>
              <div className="aspect-video relative bg-black">
                {localParticipant && (
                  <VideoTrack
                    participant={localParticipant}
                    className="w-full h-full object-cover"
                  />
                )}
                
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-4 px-6 py-3 rounded-full bg-black/50">
                  <button
                    onClick={toggleMicrophone}
                    className={`p-3 rounded-full ${isMicEnabled ? 'bg-blue-500' : 'bg-red-500'}`}
                  >
                    {isMicEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                  </button>

                  <button
                    onClick={toggleCamera}
                    className={`p-3 rounded-full ${isCameraEnabled ? 'bg-blue-500' : 'bg-red-500'}`}
                  >
                    {isCameraEnabled ? <Camera className="w-5 h-5" /> : <CameraOff className="w-5 h-5" />}
                  </button>

                  <button className="p-3 rounded-full bg-gray-600 hover:bg-gray-700">
                    <Settings className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            <div className={`p-6 rounded-lg ${
              darkMode ? "bg-gray-800" : "bg-white"
            }`}>
              <h1 className="text-2xl font-bold mb-2">{streamData.title}</h1>
              <p className={`${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                {streamData.description}
              </p>
              <p className="mt-4 text-blue-500">
                Share link: http://localhost:3000/streams/joinlivestream/?id={streamId}
              </p>
            </div>

            <div className={`p-6 rounded-lg ${
              darkMode ? "bg-gray-800" : "bg-white"
            }`}>
              <div className="flex items-center gap-4 mb-6">
                <button
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                    darkMode ? "bg-gray-700" : "bg-gray-100"
                  }`}
                >
                  <Heart className="w-5 h-5" />
                  <span>{likes}</span>
                </button>
              </div>

              <div className="space-y-4">
                <h2 className="text-lg font-semibold">Comments</h2>
                
                <div className="flex gap-4">
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Write a comment..."
                    className={`flex-grow p-3 rounded-lg ${
                      darkMode 
                        ? "bg-gray-700 border-gray-600" 
                        : "bg-white border-gray-300"
                    } border`}
                  />
                  <button
                    onClick={handleAddComment}
                    className={`px-6 rounded-lg flex items-center gap-2 ${
                      darkMode 
                        ? "bg-blue-600 hover:bg-blue-700" 
                        : "bg-blue-500 hover:bg-blue-600"
                    } text-white`}
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-4 mt-4">
                  {comments.map((comment, index) => (
                    <div
                      key={comment._id || index}
                      className={`p-4 rounded-lg ${
                        darkMode ? "bg-gray-700" : "bg-gray-100"
                      }`}
                    >
                      <p className="font-medium">{comment.user}</p>
                      <p className={darkMode ? "text-gray-300" : "text-gray-700"}>
                        {comment.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StartNewLiveStream;
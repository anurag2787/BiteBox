"use client";
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

const JoinLiveStream = () => {
  const [roomId, setRoomId] = useState(null);
  const [peerConnection, setPeerConnection] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const remoteVideoRef = useRef(null);
  const YOUR_WEBSERVER_URL = `${process.env.NEXT_PUBLIC_BACKEND_API}`;

  // Get roomId from URL when component mounts
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (id) {
      setRoomId(id);
      setIsLoading(false);
    }
  }, []);

  // Handle WebRTC connection
  useEffect(() => {
    let pc = null;

    const initializeConnection = async () => {
      if (!roomId) return;

      try {
        // Join the stream
        const { data } = await axios.post(`${YOUR_WEBSERVER_URL}/api/streams/${roomId}/join`, {
          userId: "user123", // Example user ID
        });

        // Create and configure peer connection
        pc = new RTCPeerConnection({
          iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
        });

        // Handle ICE candidates
        pc.onicecandidate = async (event) => {
          if (event.candidate) {
            try {
              await axios.post(`${YOUR_WEBSERVER_URL}/api/streams/${roomId}/ice-candidate`, {
                candidate: event.candidate,
              });
            } catch (error) {
              console.error("Error sending ICE candidate:", error);
            }
          }
        };

        // Set up remote video stream
        pc.ontrack = (event) => {
          if (remoteVideoRef.current && event.streams[0]) {
            remoteVideoRef.current.srcObject = event.streams[0];
          }
        };

        // Handle connection state changes
        pc.onconnectionstatechange = () => {
          if (pc.connectionState === 'connected') {
            setIsConnected(true);
          } else if (['disconnected', 'failed', 'closed'].includes(pc.connectionState)) {
            setIsConnected(false);
          }
        };

        // Set remote description and create answer
        await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        // Send answer to server
        await axios.post(`${YOUR_WEBSERVER_URL}/api/streams/${roomId}/answer`, {
          sdp: answer.sdp,
          type: answer.type,
        });

        setPeerConnection(pc);
      } catch (error) {
        console.error("Error initializing connection:", error);
        setIsConnected(false);
      }
    };

    initializeConnection();

    // Cleanup function
    return () => {
      if (pc) {
        pc.close();
        setPeerConnection(null);
        setIsConnected(false);
      }
    };
  }, [roomId]);

  const leaveRoom = async () => {
    try {
      if (roomId) {
        await axios.post(`${YOUR_WEBSERVER_URL}/api/streams/${roomId}/leave`, {
          userId: "user123",
        });
      }

      if (peerConnection) {
        peerConnection.close();
        setPeerConnection(null);
      }

      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = null;
      }

      setIsConnected(false);
    } catch (error) {
      console.error("Error leaving room:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!roomId) {
    return (
      <div className="p-4 text-center text-red-500">
        No room ID provided. Please check the URL.
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="max-w-4xl mx-auto">
        {isConnected ? (
          <div className="space-y-4">
            <div className="aspect-video bg-black rounded-lg overflow-hidden relative">
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
            </div>
            <button
              onClick={leaveRoom}
              className="w-full md:w-auto mt-4 bg-red-500 hover:bg-red-600 text-white py-2 px-6 rounded-lg transition-colors duration-200"
            >
              Leave Stream
            </button>
          </div>
        ) : (
          <div className="text-center p-8 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="animate-pulse">
              <div className="text-gray-500 dark:text-gray-400">
                Connecting to stream...
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JoinLiveStream;
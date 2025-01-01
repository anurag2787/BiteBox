"use client";
import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import axios from "axios";

const JoinLiveStream = () => {
  const searchParams = useSearchParams();
  const roomId = searchParams.get("id");
  const [peerConnection, setPeerConnection] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [videoUrl, setVideoUrl] = useState(null);
  const remoteVideoRef = useRef(null);

  const YOUR_WEBSERVER_URL = 'http://localhost:5000'; // URL of your WebRTC signaling server

  useEffect(() => {
    if (roomId) {
      joinRoom(roomId);
    }
    return () => {
      if (peerConnection) {
        peerConnection.close();
      }
    };
  }, [roomId]);

  const joinRoom = async (roomId) => {
    try {
      // Send a request to join the stream (get SDP offer from the server)
      const { data } = await axios.post(`${YOUR_WEBSERVER_URL}/api/streams/${roomId}/join`, {
        userId: "user123", // Example user ID (use actual user ID here)
      });

      // Create a new RTCPeerConnection and set up media streams
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });

      // Handle ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          // Send ICE candidate to server
          axios.post(`${YOUR_WEBSERVER_URL}/api/streams/${roomId}/ice-candidate`, {
            candidate: event.candidate,
          });
        }
      };

      // Set the remote SDP offer
      await pc.setRemoteDescription(new RTCSessionDescription(data.offer));

      // Create an answer and send it back to the server
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      // Send the answer to the server
      await axios.post(`${YOUR_WEBSERVER_URL}/api/streams/${roomId}/answer`, {
        sdp: answer.sdp,
        type: answer.type,
      });

      // Listen for remote tracks and display them
      pc.ontrack = (event) => {
        const [stream] = event.streams;
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = stream;
        }
      };

      setPeerConnection(pc);
      setIsConnected(true);
    } catch (error) {
      console.error("Error joining room:", error);
    }
  };

  const leaveRoom = async () => {
    try {
      // Notify the server that the user is leaving the stream
      await axios.post(`${YOUR_WEBSERVER_URL}/api/streams/${roomId}/leave`, {
        userId: "user123", // Example user ID
      });

      // Close the WebRTC connection
      if (peerConnection) {
        peerConnection.close();
      }

      setIsConnected(false);
    } catch (error) {
      console.error("Error leaving room:", error);
    }
  };

  return (
    <div className="p-4">
      {isConnected ? (
        <div className="aspect-video bg-black rounded-lg overflow-hidden">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
          <button
            onClick={leaveRoom}
            className="mt-4 bg-red-500 text-white py-2 px-4 rounded"
          >
            Leave Stream
          </button>
        </div>
      ) : (
        <div className="text-center text-gray-500">Connecting to stream...</div>
      )}
    </div>
  );
};

export default JoinLiveStream;

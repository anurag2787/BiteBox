"use client";
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import { useDarkMode } from "../../DarkModeContext";
import { UserAuth } from "../../context/AuthContext";
import { Video, Mic, MicOff, Camera, CameraOff, Settings, Heart, Send, X } from "lucide-react";

const JoinLiveStream = () => {

  const { darkMode } = useDarkMode();
  const { user } = UserAuth();

  const [isConnected, setIsConnected] = useState(true);
  const [isJoined, setIsJoined] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const videoRef = useRef(null);
  const [streamId, setStreamId] = useState('');
  const [inputStreamId, setInputStreamId] = useState('');
  const [peer, setPeer] = useState(null);
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  useEffect(() => {
    if (id) {
      setInputStreamId(id);
      console.log(inputStreamId);
    }
    else{
      alert("refresh the page");
    }
  }, [id]);

  async function joinStream() {
    setIsJoined(true);
    try {
        const newPeer = new RTCPeerConnection({
            iceServers: [{ urls: "stun:stun.stunprotocol.org" }]
        });

        // Handle ICE candidates
        newPeer.onicecandidate = async (event) => {
            if (event.candidate) {
                // You might want to send candidates to the server if needed
            }
        };

        newPeer.ontrack = (event) => {
            if (videoRef.current) {
                videoRef.current.srcObject = event.streams[0];
            }
        };

        newPeer.onnegotiationneeded = async () => {
            const offer = await newPeer.createOffer();
            await newPeer.setLocalDescription(offer);

            const payload = {
                sdp: newPeer.localDescription,
                streamId: inputStreamId
            };

            const { data } = await axios.post('http://localhost:5000/consumer', payload);

            const desc = new RTCSessionDescription(data.sdp);
            await newPeer.setRemoteDescription(desc);

            setStreamId(inputStreamId);
            setPeer(newPeer);
            setIsConnected(true);
        };

        newPeer.addTransceiver('video', { direction: 'recvonly' });
    } catch (error) {
        console.error('View stream error:', error);
        setIsConnected(false);
    }
}

  const stopViewing = () => {
    setIsJoined(false);
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    if (peer) {
      peer.close();
      setPeer(null);
    }
    setStreamId('');
    // setIsConnected(false);
  };


  return (
    <div className="p-4">
      <div className="max-w-4xl mx-auto">
        {isConnected ? (
          <div className="space-y-6">
            <div className={`rounded-lg overflow-hidden ${darkMode ? "bg-gray-800" : "bg-white"}`}>
              <div className="aspect-video relative bg-black">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            {isJoined ? (
              <button
              type="submit"
              onClick={stopViewing}
              className="w-full py-3 rounded-lg flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white transition-colors"
            >
              Leave Stream
            </button>) : (
            <button
            type="submit"
            onClick={joinStream}
            className="w-full py-3 rounded-lg flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white transition-colors"
          >
            Join Stream
          </button>
            )}

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
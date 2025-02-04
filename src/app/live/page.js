'use client';

import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

function ViewPage() {
  const videoRef = useRef(null);
  const [streamId, setStreamId] = useState('');
  const [inputStreamId, setInputStreamId] = useState('');
  const [peer, setPeer] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  async function joinStream() {
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
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    if (peer) {
      peer.close();
      setPeer(null);
    }
    setStreamId('');
    setIsConnected(false);
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">View Stream</h1>
      {!isConnected && (
        <div className="mb-4">
          <input 
            type="text" 
            value={inputStreamId}
            onChange={(e) => setInputStreamId(e.target.value)}
            placeholder="Enter Stream ID"
            className="border p-2 mr-2 rounded"
          />
          <button 
            onClick={joinStream}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Join Stream
          </button>
        </div>
      )}
      {isConnected && (
        <div>
          <p className="mb-4">Connected to Stream: {streamId}</p>
          <button 
            onClick={stopViewing}
            className="px-4 py-2 bg-red-500 text-white rounded mb-4"
          >
            Stop Viewing
          </button>
        </div>
      )}
      <video 
        ref={videoRef} 
        autoPlay 
        playsInline 
        className="border border-gray-300 rounded"
        style={{ width: '100%', maxHeight: '300px' }}
      />
    </div>
  );
}

export default ViewPage;
"use client";
import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Room, VideoTrack, AudioTrack } from "livekit-client";

const JoinLiveStream = () => {
  const searchParams = useSearchParams();
  const [room, setRoom] = useState(null);
  const [participants, setParticipants] = useState([]);
  const roomId = searchParams.get("id");
  const YOUR_LIVEKIT_URL=process.env.NEXT_PUBLIC_LIVEKIT_URL;

  const joinRoom = async () => {
    try {
      const room = new Room();
      // Connect directly to the room using the roomId
      await room.connect(YOUR_LIVEKIT_URL, roomId);
      setRoom(room);

      const handleParticipantsChanged = () => {
        setParticipants(Array.from(room.participants.values()));
      };

      room.on('participantConnected', handleParticipantsChanged);
      room.on('participantDisconnected', handleParticipantsChanged);
      handleParticipantsChanged();
    } catch (err) {
      console.error('Failed to join room:', err);
    }
  };

  useEffect(() => {
    if (roomId) {
      joinRoom();
    }
    return () => room?.disconnect();
  }, [roomId]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
      {participants.map((participant) => (
        <div key={participant.identity} className="aspect-video bg-black rounded-lg overflow-hidden">
          <VideoTrack participant={participant} />
          <AudioTrack participant={participant} />
        </div>
      ))}
    </div>
  );
};

export default JoinLiveStream;
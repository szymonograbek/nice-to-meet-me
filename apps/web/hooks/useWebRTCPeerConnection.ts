"use client";

import { useEffect, useRef, useState } from "react";
import { Socket, io } from "socket.io-client";
import { ClientToServerEvents, ServerToClientEvents } from "validation";
import Peer, { MediaConnection } from "peerjs";
import { getIceServers } from "@/actions/ice-servers";

type HookArgs = {
  roomId: string;
  userStream: MediaStream | null;
};

const backendURL = new URL(process.env.NEXT_PUBLIC_BACKEND_URL!);

export const useWebRTCPeerConnection = ({ roomId, userStream }: HookArgs) => {
  const socketRef = useRef<Socket<
    ServerToClientEvents,
    ClientToServerEvents
  > | null>(null);

  const [peerStream, setPeerStream] = useState<MediaStream | null>(null);
  const [call, setCall] = useState<MediaConnection | null>(null);
  const currentUserPeerRef = useRef<Peer | null>(null);

  useEffect(() => {
    const setupPeerAndSockets = async () => {
      if (!userStream) return;

      const ICEServers = await getIceServers();

      const Peer = (await import("peerjs")).default;

      const peer = new Peer({
        host: backendURL.hostname,
        port: parseInt(backendURL.port, 10) ?? 8080,
        path: "/peer-server",
        secure: backendURL.protocol.includes("https"),
        config: {
          "ice-servers": ICEServers.map((server) => ({ url: server.urls })),
        },
      });

      currentUserPeerRef.current = peer;

      socketRef.current = io(process.env.NEXT_PUBLIC_BACKEND_URL!);

      console.log("Created peer", { peer, backendURL });

      peer.on("open", (peerId) => {
        console.log(`Joining room ${roomId}`, { peer });
        socketRef.current?.emit("join", roomId, peerId);

        socketRef.current?.on("created", () => {
          console.log("room created, you are the first one here");
        });

        socketRef.current?.on("userJoined", async (peerId) => {
          const call = peer.call(peerId, userStream);

          call.on("stream", (stream) => {
            setPeerStream(stream);
          });

          setCall(call);
        });

        peer.on("call", async (call) => {
          call.answer(userStream);

          call.on("stream", (stream) => {
            setPeerStream(stream);
          });

          setCall(call);
        });
      });
    };

    setupPeerAndSockets();

    return () => {
      socketRef.current?.disconnect();
      currentUserPeerRef.current?.destroy();
    };
  }, [roomId, userStream]);

  const updateCallUserStream = (stream: MediaStream) => {
    const senders = call?.peerConnection.getSenders();
    const videoTracks = stream.getVideoTracks();
    const audioTracks = stream.getAudioTracks();

    senders?.forEach((sender) => {
      if (sender.track?.kind === "video" && videoTracks[0]) {
        sender.replaceTrack(videoTracks[0]);
      }

      if (sender.track?.kind === "audio" && audioTracks[0]) {
        sender.replaceTrack(audioTracks[0]);
      }
    });
  };

  const leaveRoom = () => {
    socketRef.current?.emit("leave", roomId);
    socketRef.current?.disconnect();

    if (call) {
      call.close();
    }
  };

  return {
    peerStream,
    call,
    updateCallUserStream,
    leaveRoom,
  };
};

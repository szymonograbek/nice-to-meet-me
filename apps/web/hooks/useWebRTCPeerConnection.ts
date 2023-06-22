import { ICE_SERVERS } from "@/utils/constants";
import { useEffect, useRef, useState } from "react";
import { Socket, io } from "socket.io-client";
import { ClientToServerEvents, ServerToClientEvents } from "validation";

type HookArgs = {
  roomId: string;
};

export const useWebRTCPeerConnection = ({ roomId }: HookArgs) => {
  const [userStream, setUserStream] = useState<MediaStream | null>(null);
  const hostRef = useRef(false);
  const socketRef = useRef<Socket<
    ServerToClientEvents,
    ClientToServerEvents
  > | null>(null);

  const rtcConnectionRef = useRef<RTCPeerConnection | null>(null);

  const userVideoRef = useRef<HTMLVideoElement | null>(null);
  const peerVideoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    // Join the socket
    socketRef.current = io(process.env.NEXT_PUBLIC_SOCKET_URL!);
    socketRef.current?.emit("join", roomId);

    const setUserVideo = async () => {
      if (userStream) return;

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: true,
        });

        if (userVideoRef.current) {
          userVideoRef.current.srcObject = stream;

          userVideoRef.current.onloadedmetadata = () => {
            userVideoRef.current?.play();
          };
        }

        setUserStream(stream);

        return stream;
      } catch (error) {
        console.log(error);
      }
    };

    const handleRoomCreated = async () => {
      console.log("Room created!");
      hostRef.current = true;

      await setUserVideo();
    };

    const handleRoomJoined = async () => {
      console.log("Room joined!", roomId);
      const stream = await setUserVideo();

      if (stream) socketRef.current?.emit("ready", roomId);
    };

    const handleICECandidateEvent = (event: RTCPeerConnectionIceEvent) => {
      console.log("Handle ice candidate");
      if (event.candidate) {
        socketRef.current?.emit("ice-candidate", event.candidate, roomId);
      }
    };

    const handlerNewIceCandidateMsg = (incoming: RTCIceCandidateInit) => {
      const candidate = new RTCIceCandidate(incoming);

      rtcConnectionRef.current
        ?.addIceCandidate(candidate)
        .catch((e) => console.log(e));
    };

    const handleTrackEvent = (event: RTCTrackEvent) => {
      console.log("Handle track event");
      if (peerVideoRef.current) {
        peerVideoRef.current.srcObject = event.streams[0];
      }
    };

    const createPeerConnection = () => {
      console.log("Create peer conn");
      const connection = new RTCPeerConnection(ICE_SERVERS);

      connection.onicecandidate = handleICECandidateEvent;
      connection.ontrack = handleTrackEvent;

      return connection;
    };

    const addTracksToRtcConnection = () => {
      if (!rtcConnectionRef.current || !userStream) return;

      rtcConnectionRef.current.addTrack(userStream.getTracks()[0], userStream);
      rtcConnectionRef.current.addTrack(userStream.getTracks()[1], userStream);
    };

    const initiateCall = async () => {
      console.log("Initiate call");
      if (hostRef.current && userStream) {
        rtcConnectionRef.current = createPeerConnection();

        addTracksToRtcConnection();

        const offer = await rtcConnectionRef.current.createOffer();

        rtcConnectionRef.current?.setLocalDescription(offer);
        socketRef.current?.emit("offer", offer, roomId);
      }
    };

    const handleReceivedOffer = async (offer: RTCSessionDescriptionInit) => {
      console.log("Handle offer");
      if (!hostRef.current && userStream) {
        rtcConnectionRef.current = createPeerConnection();

        addTracksToRtcConnection();

        rtcConnectionRef.current.setRemoteDescription(offer);

        const answer = await rtcConnectionRef.current.createAnswer();

        rtcConnectionRef.current?.setLocalDescription(answer);
        socketRef.current?.emit("answer", answer, roomId);
      }
    };

    const handleAnswer = (answer: RTCSessionDescriptionInit) => {
      console.log("Handle answer");
      rtcConnectionRef.current
        ?.setRemoteDescription(answer)
        .catch((err) => console.log(err));
    };

    const onPeerLeave = () => {
      hostRef.current = true;
      if (peerVideoRef.current?.srcObject) {
        (peerVideoRef.current.srcObject as MediaStream)
          .getTracks()
          .forEach((track) => track.stop());
      }

      if (rtcConnectionRef.current) {
        rtcConnectionRef.current.ontrack = null;
        rtcConnectionRef.current.onicecandidate = null;
        rtcConnectionRef.current.close();
        rtcConnectionRef.current = null;
      }
    };

    socketRef.current?.on("created", handleRoomCreated);

    socketRef.current?.on("joined", handleRoomJoined);

    socketRef.current?.on("ready", initiateCall);

    socketRef.current?.on("leave", onPeerLeave);

    socketRef.current?.on("offer", handleReceivedOffer);
    socketRef.current?.on("answer", handleAnswer);
    socketRef.current?.on("ice-candidate", handlerNewIceCandidateMsg);

    return () => {
      socketRef.current?.disconnect();
    };
  }, [roomId, userStream, setUserStream]);

  const leaveRoom = () => {
    socketRef.current?.emit("leave", roomId);

    if (userVideoRef.current?.srcObject) {
      (userVideoRef.current.srcObject as MediaStream)
        .getTracks()
        .forEach((track) => track.stop());
    }
    if (peerVideoRef.current?.srcObject) {
      (peerVideoRef.current.srcObject as MediaStream)
        .getTracks()
        .forEach((track) => track.stop());
    }

    if (rtcConnectionRef.current) {
      rtcConnectionRef.current.ontrack = null;
      rtcConnectionRef.current.onicecandidate = null;
      rtcConnectionRef.current.close();
      rtcConnectionRef.current = null;
    }
  };

  return {
    leaveRoom,
    userVideoRef,
    peerVideoRef,
    userStream,
  };
};

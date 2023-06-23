import { socket } from "@/lib/socket";
import { ICE_SERVERS } from "@/utils/constants";
import { useEffect, useRef, useState } from "react";

type HookArgs = {
  roomId: string;
};

export const useWebRTCPeerConnection = ({ roomId }: HookArgs) => {
  const [userStreamEnabled, setUserStreamEnabled] = useState(false);

  const userStream = useRef<MediaStream | null>(null);
  const hostRef = useRef(false);

  const rtcConnectionRef = useRef<RTCPeerConnection | null>(null);

  const userVideoRef = useRef<HTMLVideoElement | null>(null);
  const peerVideoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    // Join the socket
    socket.emit("join", roomId);

    const setUserVideo = async () => {
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

        userStream.current = stream;
        setUserStreamEnabled(true);

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

      if (stream) socket.emit("ready", roomId);
    };

    const handleICECandidateEvent = (event: RTCPeerConnectionIceEvent) => {
      console.log("Handle ice candidate");
      if (event.candidate) {
        socket.emit("ice-candidate", event.candidate, roomId);
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
      if (!rtcConnectionRef.current || !userStream.current) return;

      rtcConnectionRef.current.addTrack(
        userStream.current.getTracks()[0],
        userStream.current
      );
      rtcConnectionRef.current.addTrack(
        userStream.current.getTracks()[1],
        userStream.current
      );
    };

    const initiateCall = async () => {
      console.log("Initiate call");
      if (hostRef.current && userStream.current) {
        rtcConnectionRef.current = createPeerConnection();

        addTracksToRtcConnection();

        const offer = await rtcConnectionRef.current.createOffer();

        rtcConnectionRef.current?.setLocalDescription(offer);
        socket.emit("offer", offer, roomId);
      }
    };

    const handleReceivedOffer = async (offer: RTCSessionDescriptionInit) => {
      console.log("Handle offer");
      if (!hostRef.current && userStream.current) {
        rtcConnectionRef.current = createPeerConnection();

        addTracksToRtcConnection();

        rtcConnectionRef.current.setRemoteDescription(offer);

        const answer = await rtcConnectionRef.current.createAnswer();

        rtcConnectionRef.current?.setLocalDescription(answer);
        socket.emit("answer", answer, roomId);
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

    socket.on("created", handleRoomCreated);

    socket.on("joined", handleRoomJoined);

    socket.on("ready", initiateCall);

    socket.on("leave", onPeerLeave);

    socket.on("offer", handleReceivedOffer);
    socket.on("answer", handleAnswer);
    socket.on("ice-candidate", handlerNewIceCandidateMsg);

    return () => {
      socket.disconnect();
    };
  }, [roomId]);

  const leaveRoom = () => {
    socket.emit("leave", roomId);

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
    userStream: userStream.current,
    userStreamEnabled,
  };
};

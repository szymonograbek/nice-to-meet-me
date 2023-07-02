import {
  MutableRefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Socket, io } from "socket.io-client";
import { ClientToServerEvents, ServerToClientEvents } from "validation";
import { getIceServers } from "@/actions/ice-servers";

type HookArgs = {
  roomId: string;
  userVideoRef: MutableRefObject<HTMLVideoElement | null>;
  peerVideoRef: MutableRefObject<HTMLVideoElement | null>;
  requestUserVideoUpdate: () => Promise<MediaStream | undefined>;
  userStream: MediaStream | null;
};

export const useWebRTCPeerConnection = ({
  roomId,
  userVideoRef,
  peerVideoRef,
  requestUserVideoUpdate,
  userStream,
}: HookArgs) => {
  const socketRef = useRef<Socket<
    ServerToClientEvents,
    ClientToServerEvents
  > | null>(null);
  const hostRef = useRef(false);
  const rtcConnectionRef = useRef<RTCPeerConnection | null>(null);

  const [peerConnected, setPeerConnected] = useState(false);

  useEffect(() => {
    socketRef.current = io(process.env.NEXT_PUBLIC_SOCKET_URL!);

    console.log(`Joining room ${roomId}`);
    socketRef.current?.emit("join", roomId);

    return () => {
      socketRef.current?.disconnect();
    };
  }, [roomId]);

  useEffect(() => {
    const handleRoomCreated = async () => {
      console.log(`Room created`);
      hostRef.current = true;

      await requestUserVideoUpdate();
    };

    socketRef.current?.on("created", handleRoomCreated);

    return () => {
      socketRef.current?.off("created", handleRoomCreated);
    };
  }, [requestUserVideoUpdate]);

  useEffect(() => {
    const handleRoomJoined = async () => {
      console.log(`Room joined ${roomId}`);
      setPeerConnected(true);

      const stream = await requestUserVideoUpdate();

      if (stream) socketRef.current?.emit("ready", roomId);
    };

    socketRef.current?.on("joined", handleRoomJoined);

    return () => {
      socketRef.current?.off("joined", handleRoomJoined);
    };
  }, [requestUserVideoUpdate, roomId]);

  useEffect(() => {
    const handleICECandidateEvent = (event: RTCPeerConnectionIceEvent) => {
      console.log(`ICE Candidate`, { candidate: event.candidate });
      if (event.candidate) {
        socketRef.current?.emit("ice-candidate", event.candidate, roomId);
      }
    };

    const handleTrackEvent = (event: RTCTrackEvent) => {
      console.log(`Peer tracks`, { event });
      if (peerVideoRef.current) {
        peerVideoRef.current.srcObject = event.streams[0];
      }
    };

    const createPeerConnection = async () => {
      console.log(`Create peer connection`);
      const iceServers = await getIceServers();

      console.log({ iceServers });

      const connection = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.relay.metered.ca:80" }],
      });

      connection.onicecandidate = handleICECandidateEvent;
      connection.ontrack = handleTrackEvent;

      return connection;
    };

    const addTracksToRtcConnection = () => {
      console.log(`Add tracks to RTC Connection`);
      if (!rtcConnectionRef.current || !userStream) return;

      rtcConnectionRef.current.addTrack(userStream.getTracks()[0], userStream);
      rtcConnectionRef.current.addTrack(userStream.getTracks()[1], userStream);
    };

    const initiateCall = async () => {
      console.log(`Initiate call`);
      setPeerConnected(true);

      if (hostRef.current && userStream) {
        rtcConnectionRef.current = await createPeerConnection();

        addTracksToRtcConnection();

        const offer = await rtcConnectionRef.current.createOffer();

        rtcConnectionRef.current?.setLocalDescription(offer);
        socketRef.current?.emit("offer", offer, roomId);
      }
    };

    const handleReceivedOffer = async (offer: RTCSessionDescriptionInit) => {
      if (!hostRef.current && userStream) {
        rtcConnectionRef.current = await createPeerConnection();

        addTracksToRtcConnection();

        rtcConnectionRef.current.setRemoteDescription(offer);

        const answer = await rtcConnectionRef.current.createAnswer();

        console.log(`Handle offer and respond with an answer`, {
          offer,
          answer,
        });

        // Enable stereo and increatse max bitrate
        answer.sdp = answer.sdp?.replace(
          "useinbandfec=1",
          "useinbandfec=1; stereo=1; maxaveragebitrate=510000"
        );

        rtcConnectionRef.current?.setLocalDescription(answer);
        socketRef.current?.emit("answer", answer, roomId);
      }
    };

    socketRef.current?.on("ready", initiateCall);
    socketRef.current?.on("offer", handleReceivedOffer);

    return () => {
      socketRef.current?.off("ready", initiateCall);
      socketRef.current?.off("offer", handleReceivedOffer);
    };
  }, [peerVideoRef, roomId, userStream]);

  useEffect(() => {
    const onPeerLeave = () => {
      console.log(`Peer left`);

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

      setPeerConnected(false);
    };

    socketRef.current?.on("leave", onPeerLeave);

    return () => {
      socketRef.current?.off("leave", onPeerLeave);
    };
  }, [peerVideoRef]);

  useEffect(() => {
    const handleAnswer = (answer: RTCSessionDescriptionInit) => {
      console.log(`Peer answered`, { answer });
      rtcConnectionRef.current
        ?.setRemoteDescription(answer)
        .catch((err) => console.log(err));
    };

    socketRef.current?.on("answer", handleAnswer);

    return () => {
      socketRef.current?.off("answer", handleAnswer);
    };
  }, []);

  useEffect(() => {
    const handlerNewIceCandidateMsg = (incoming: RTCIceCandidateInit) => {
      console.log(`New ICE Candidate`, { incoming });

      const candidate = new RTCIceCandidate(incoming);

      rtcConnectionRef.current
        ?.addIceCandidate(candidate)
        .catch((e) => console.log(e));
    };

    socketRef.current?.on("ice-candidate", handlerNewIceCandidateMsg);

    return () => {
      socketRef.current?.off("ice-candidate", handlerNewIceCandidateMsg);
    };
  }, []);

  const replaceVideoTrack = useCallback((track: MediaStreamTrack) => {
    console.log(`Replace video track`, { track });

    rtcConnectionRef.current
      ?.getSenders()
      .find((s) => s.track?.kind === track.kind)
      ?.replaceTrack(track);
  }, []);

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
    replaceVideoTrack,
    peerConnected,
  };
};

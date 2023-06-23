"use client";

import { Camera } from "@/components/Camera";
import { TrackSwitch } from "@/components/TrackSwitch";
import { Button } from "@/components/ui/button";
import { useTrackControls } from "@/hooks/useTrackControls";
import { useWebRTCPeerConnection } from "@/hooks/useWebRTCPeerConnection";
import { Mic, MicOff, PhoneOff, Video, VideoOff } from "lucide-react";

type MeetingPageProps = {
  params: {
    id: string;
  };
};

export default function MeetingPage({ params }: MeetingPageProps) {
  const roomId = params.id;

  const {
    leaveRoom,
    peerVideoRef,
    userVideoRef,
    userStream,
    userStreamEnabled,
  } = useWebRTCPeerConnection({
    roomId,
  });

  const { toggleAudio, toggleVideo, isAudioEnabled, isVideoEnabled } =
    useTrackControls({ stream: userStream, userStreamEnabled });

  return (
    <div className="h-full w-full">
      <div className="flex h-full flex-col justify-between">
        <div className="grid auto-cols-min grid-cols-1 justify-items-center gap-4">
          <Camera ref={userVideoRef} muted />
          <Camera ref={peerVideoRef} />
        </div>

        <div className="mt-8 flex flex-row items-center justify-center">
          <TrackSwitch
            icon={isAudioEnabled ? <Mic /> : <MicOff />}
            tooltip={isAudioEnabled ? "Mute" : "Unmute"}
            className="mr-2"
            onClick={toggleAudio}
          />

          <TrackSwitch
            icon={isVideoEnabled ? <Video /> : <VideoOff />}
            tooltip={isAudioEnabled ? "Camera off" : "Camera on"}
            className="mr-2"
            onClick={toggleVideo}
          />

          <Button onClick={leaveRoom} variant="destructive">
            <PhoneOff className="mr-2 h-4" /> Leave
          </Button>
        </div>
      </div>
    </div>
  );
}

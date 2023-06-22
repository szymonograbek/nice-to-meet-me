"use client";

import { Camera } from "@/components/Camera";
import { TrackSwitch } from "@/components/TrackSwitch";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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

  const { leaveRoom, peerVideoRef, userVideoRef, userStream } =
    useWebRTCPeerConnection({
      roomId,
    });

  const { toggleAudio, toggleVideo, isAudioEnabled, isVideoEnabled } =
    useTrackControls({ stream: userStream });

  console.log({ peerVideo: peerVideoRef.current });

  return (
    <div className="h-full w-full flex flex-col justify-between">
      <div className="grid gap-3 grid-cols-1 grid-rows-2 justify-items-center">
        <Camera ref={userVideoRef} />
        <Camera ref={peerVideoRef} />
      </div>

      <div className="flex flex-row items-center w-full justify-center">
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
          <PhoneOff className="h-4 mr-2" /> Leave
        </Button>
      </div>
    </div>
  );
}

"use client";

import { Camera } from "@/components/Camera";
import { TrackSwitch } from "@/components/TrackSwitch";
import { Button } from "@/components/ui/button";
import { useTrackControls } from "@/hooks/useTrackControls";
import { useUserStream } from "@/hooks/useUserStream";
import { useWebRTCPeerConnection } from "@/hooks/useWebRTCPeerConnection";
import { Mic, MicOff, PhoneOff, Video, VideoOff } from "lucide-react";
import { useCallback, useRef } from "react";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { MeetingDropdownMenu } from "@/components/MeetingDropdownMenu";

type MeetingPageProps = {
  params: {
    id: string;
  };
};

export default function MeetingPage({ params }: MeetingPageProps) {
  const userVideoRef = useRef<HTMLVideoElement | null>(null);
  const peerVideoRef = useRef<HTMLVideoElement | null>(null);

  const roomId = params.id;

  const [autoAnimatedParent] = useAutoAnimate();

  const {
    updateUserStream,
    initializeUserStream,
    userStream,
    userStreamEnabled,
    selectedVideoDevice,
  } = useUserStream({
    userVideoRef,
  });

  const { leaveRoom, replaceVideoTrack } = useWebRTCPeerConnection({
    roomId,
    userVideoRef: userVideoRef,
    peerVideoRef: peerVideoRef,
    userStream: userStream.current,
    requestUserVideoUpdate: initializeUserStream,
  });

  const { toggleAudio, toggleVideo, isAudioEnabled, isVideoEnabled } =
    useTrackControls({ stream: userStream.current, userStreamEnabled });

  const onVideoDeviceSelect = useCallback(
    async (deviceId: string) => {
      const stream = await updateUserStream({ videoDeviceId: deviceId });

      const videoTracks = stream?.getVideoTracks();

      if (videoTracks?.length) {
        const track = videoTracks[0];

        replaceVideoTrack(track);
      }
    },
    [updateUserStream, replaceVideoTrack]
  );

  return (
    <div className="flex h-screen w-screen flex-col justify-between p-8">
      <div className="flex min-h-0 flex-1 flex-row items-center justify-center">
        <div
          className="grid h-full auto-cols-fr auto-rows-fr grid-cols-none grid-rows-2 gap-2 xl:h-[60%] xl:w-full xl:grid-cols-2 xl:grid-rows-none"
          ref={autoAnimatedParent}
        >
          <Camera ref={userVideoRef} muted />
          <Camera ref={peerVideoRef} />
        </div>
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

        <div className="mr-2">
          <MeetingDropdownMenu
            selectedVideoDevice={selectedVideoDevice}
            onVideoDeviceSelect={onVideoDeviceSelect}
          />
        </div>

        <Button onClick={leaveRoom} variant="destructive">
          <PhoneOff className="mr-2 h-4" />
          Leave
        </Button>
      </div>
    </div>
  );
}

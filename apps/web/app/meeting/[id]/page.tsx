"use client";

import { Camera } from "@/components/Camera";
import { TrackSwitch } from "@/components/TrackSwitch";
import { useTrackControls } from "@/hooks/useTrackControls";
import { Mic, MicOff, PhoneOff, Video, VideoOff } from "lucide-react";
import { useEffect, useRef } from "react";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { MeetingDropdownMenu } from "@/components/MeetingDropdownMenu";
import { useWebRTCPeerConnection } from "@/hooks/useWebRTCPeerConnection";
import { useUserStream } from "@/hooks/useUserStream";
import { Button } from "@/components/ui/button";

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

  const { userStream, changeStreamVideoDevice } = useUserStream();

  const { peerStream, updateCallUserStream, leaveRoom } =
    useWebRTCPeerConnection({
      roomId,
      userStream,
    });

  useEffect(() => {
    if (userVideoRef.current) {
      userVideoRef.current.srcObject = userStream;
    }
  }, [userStream]);

  useEffect(() => {
    if (peerVideoRef.current) {
      peerVideoRef.current.srcObject = peerStream;
    }
  }, [peerStream]);

  const {
    toggleAudio,
    toggleVideo,
    isAudioEnabled,
    isVideoEnabled,
    selectedDevices,
  } = useTrackControls({ userStream });

  const handleVideoDeviceChange = async (deviceId: string) => {
    const newStream = await changeStreamVideoDevice(deviceId);
    updateCallUserStream(newStream);
  };

  const handleRoomLeave = () => {
    leaveRoom();

    if (peerVideoRef.current?.srcObject) {
      (peerVideoRef.current.srcObject as MediaStream)
        .getTracks()
        .forEach((track) => track.stop());
    }
  };

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
            selectedVideoDevice={selectedDevices.video}
            onVideoDeviceSelect={handleVideoDeviceChange}
          />
        </div>

        <Button onClick={handleRoomLeave} variant="destructive">
          <PhoneOff className="mr-2 h-4" />
          Leave
        </Button>
      </div>
    </div>
  );
}

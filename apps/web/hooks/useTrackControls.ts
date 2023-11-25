import { useCallback, useEffect, useState } from "react";

type HookArgs = {
  userStream: MediaStream | null;
};

type DevicesState = {
  audioIn: string | null;
  video: string | null;
};

export const useTrackControls = ({ userStream }: HookArgs) => {
  const [isAudioEnabled, setAudioEnabled] = useState(false);
  const [isVideoEnabled, setVideoEnabled] = useState(false);
  const [selectedDevices, setSelectedDevices] = useState<DevicesState>({
    audioIn: null,
    video: null,
  });

  useEffect(() => {
    if (!userStream) return;

    const audioTracks = userStream?.getAudioTracks();
    const videoTracks = userStream?.getVideoTracks();

    if (audioTracks && audioTracks[0]) {
      setAudioEnabled(audioTracks[0].enabled);
    }

    if (videoTracks && videoTracks[0]) {
      setVideoEnabled(videoTracks[0].enabled);
    }

    const tracks = userStream.getTracks();

    const newDevicesState = tracks.reduce<DevicesState>(
      (state, track) => {
        if (track.kind === "video") {
          state.video = track.getSettings().deviceId ?? null;
        }

        if (track.kind === "audio") {
          state.audioIn = track.getSettings().deviceId ?? null;
        }

        return state;
      },
      {
        audioIn: null,
        video: null,
      }
    );

    setSelectedDevices((prev) => ({ ...prev, ...newDevicesState }));
  }, [userStream]);

  const toggleAudio = useCallback(() => {
    const audioTracks = userStream?.getAudioTracks();

    audioTracks?.forEach((track) => (track.enabled = !isAudioEnabled));

    setAudioEnabled((prev) => !prev);
  }, [userStream, isAudioEnabled]);

  const toggleVideo = useCallback(() => {
    const videoTracks = userStream?.getVideoTracks();

    videoTracks?.forEach((track) => (track.enabled = !isVideoEnabled));

    setVideoEnabled((prev) => !prev);
  }, [userStream, isVideoEnabled]);

  return {
    isAudioEnabled,
    isVideoEnabled,
    toggleAudio,
    toggleVideo,
    selectedDevices,
  };
};

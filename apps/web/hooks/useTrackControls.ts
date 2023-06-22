import { useEffect, useState } from "react";

type HookArgs = {
  stream: MediaStream | null;
};

export const useTrackControls = ({ stream }: HookArgs) => {
  const [isAudioEnabled, setAudioEnabled] = useState(false);
  const [isVideoEnabled, setVideoEnabled] = useState(false);

  useEffect(() => {
    if (!stream) return;

    const audioTracks = stream?.getAudioTracks();
    const videoTracks = stream?.getVideoTracks();

    if (audioTracks && audioTracks[0]) {
      setAudioEnabled(audioTracks[0].enabled);
    }

    if (videoTracks && videoTracks[0]) {
      setVideoEnabled(videoTracks[0].enabled);
    }
  }, [stream]);

  const toggleAudio = () => {
    const audioTracks = stream?.getAudioTracks();

    if (audioTracks && audioTracks[0]) {
      const newState = !audioTracks[0].enabled;

      audioTracks[0].enabled = newState;
      setAudioEnabled(newState);
    }
  };

  const toggleVideo = () => {
    const videoTracks = stream?.getVideoTracks();

    if (videoTracks && videoTracks[0]) {
      const newState = !videoTracks[0].enabled;

      videoTracks[0].enabled = newState;
      setVideoEnabled(newState);
    }
  };

  return { isAudioEnabled, isVideoEnabled, toggleAudio, toggleVideo };
};

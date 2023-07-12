"use client";

import { MutableRefObject, useCallback, useRef, useState } from "react";

type HookArgs = {
  userVideoRef: MutableRefObject<HTMLVideoElement | null>;
};

export type UpdateUserVideoArgs = {
  audioInputDeviceId?: string;
  audioOutputDeviceId?: string;
  videoDeviceId?: string;
};

type DevicesState = {
  audioIn: string | null;
  audioOut: string | null;
  video: string | null;
};

export const useUserStream = ({ userVideoRef }: HookArgs) => {
  const [userStreamEnabled, setUserStreamEnabled] = useState(false);
  const [selectedDevices, setSelectedDevices] = useState<DevicesState>({
    audioIn: null,
    audioOut: null,
    video: null,
  });

  const userStream = useRef<MediaStream | null>(null);

  const getVideoSettings = (
    deviceId?: string | null
  ): MediaTrackConstraints | boolean => {
    const defaultParams: MediaTrackConstraints = {
      width: 640,
      height: 480,
    };

    if (deviceId) {
      return {
        ...defaultParams,
        deviceId: deviceId,
      };
    }

    return defaultParams;
  };

  const getAudioSettings = (
    outputDeviceId?: string | null
  ): MediaTrackConstraints | boolean => {
    // TODO add device selection
    if (outputDeviceId) {
    }

    return true;
  };

  const updateUserStream = useCallback(
    async (options?: UpdateUserVideoArgs) => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: getAudioSettings(
            options?.audioOutputDeviceId || selectedDevices.audioOut
          ),
          video: getVideoSettings(
            options?.videoDeviceId || selectedDevices.video
          ),
        });

        if (userVideoRef.current) {
          userVideoRef.current.srcObject = stream;

          userVideoRef.current.onloadedmetadata = () => {
            userVideoRef.current?.play();
          };
        }

        setSelectedDevices((prev) => ({
          ...prev,
          video: options?.videoDeviceId || null,
        }));

        userStream.current = stream;

        return stream;
      } catch (e) {
        console.log(e);
      }
    },
    [selectedDevices.audioOut, selectedDevices.video, userVideoRef]
  );

  const initializeUserStream = useCallback(async () => {
    try {
      const stream = await updateUserStream();

      if (!stream) throw "Couldn't load the user stream";

      const tracks = stream.getTracks();

      let tempDevicesState: Partial<DevicesState> = {
        audioIn: null,
        video: null,
      };

      for (const track of tracks) {
        if (track.kind === "video") {
          tempDevicesState.video = track.getSettings().deviceId || null;
        } else if (track.kind === "audio") {
          tempDevicesState.audioIn = track.getSettings().deviceId || null;
        }
      }

      setSelectedDevices((prev) => ({ ...prev, ...tempDevicesState }));
      setUserStreamEnabled(true);

      return stream;
    } catch (error) {
      console.log(error);
    }
  }, [updateUserStream]);

  return {
    updateUserStream,
    initializeUserStream,
    userStream,
    userStreamEnabled,
    selectedVideoDevice: selectedDevices.video,
  };
};

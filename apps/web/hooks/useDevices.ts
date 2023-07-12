import { useEffect, useState } from "react";

export const useDevices = () => {
  const [videoDevices, setVideoDevices] = useState<Array<MediaDeviceInfo>>([]);
  const [audioOutputDevices, setAudioOutputDevices] = useState<
    Array<MediaDeviceInfo>
  >([]);
  const [audioInputDevices, setAudioInputDevices] = useState<
    Array<MediaDeviceInfo>
  >([]);

  useEffect(() => {
    // TODO: refresh when permissions are set
    const getDevices = async () => {
      const foundDevices = await navigator.mediaDevices.enumerateDevices();

      const tempVideoDevices: Array<MediaDeviceInfo> = [];
      const tempAudioInDevices: Array<MediaDeviceInfo> = [];
      const tempAudioOutDevices: Array<MediaDeviceInfo> = [];

      for (const device of foundDevices) {
        if (device.kind === "videoinput") {
          tempVideoDevices.push(device);
        } else if (device.kind === "audioinput") {
          tempAudioInDevices.push(device);
        } else if (device.kind === "audiooutput") {
          tempAudioOutDevices.push(device);
        }
      }

      setVideoDevices(tempVideoDevices);
      setAudioInputDevices(tempAudioInDevices);
      setAudioOutputDevices(tempAudioOutDevices);
    };

    getDevices();
  }, []);

  return { videoDevices, audioInputDevices, audioOutputDevices };
};

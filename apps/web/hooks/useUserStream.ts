"use client";

import { useEffect, useState } from "react";

export const useUserStream = () => {
  const [userStream, setUserStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    const getUserStream = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: { width: 640, height: 480 },
      });

      setUserStream(stream);
    };

    getUserStream();
  }, []);

  const changeStreamVideoDevice = async (deviceId: string) => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: { width: 640, height: 480, deviceId },
    });

    setUserStream(stream);

    return stream;
  };

  return { userStream, changeStreamVideoDevice };
};

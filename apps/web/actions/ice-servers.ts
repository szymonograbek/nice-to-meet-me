"use server";

interface ICEServer {
  urls: string;
}

export const getIceServers = async () => {
  const response = await fetch(process.env.METERED_API_URL!);

  const iceServers = await response.json();

  return iceServers as Array<ICEServer>;
};

"use server";

export const getIceServers = async () => {
  const response = await fetch(process.env.METERED_API_URL!);

  const iceServers = await response.json();

  return iceServers;
};

import z from "zod";
import { peerId, roomName } from "./shared";

export const joinEventMeetingSchema = z
  .function()
  .args(roomName, peerId)
  .returns(z.void());

type JoinMeetingEvent = z.infer<typeof joinEventMeetingSchema>;

export const readyEventSchema = z.function().args(roomName).returns(z.void());

type ReadyEvent = z.infer<typeof readyEventSchema>;

export const leaveEventSchema = z.function().args(roomName).returns(z.void());

type LeaveEvent = z.infer<typeof leaveEventSchema>;

export type ClientToServerEvents = {
  join: JoinMeetingEvent;
  ready: ReadyEvent;
  leave: LeaveEvent;
};

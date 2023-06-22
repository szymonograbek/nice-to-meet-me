import z from "zod";
import { answerSchema, offerSchema, roomName } from "./shared";

export const joinEventMeetingSchema = z
  .function()
  .args(roomName)
  .returns(z.void());

type JoinMeetingEvent = z.infer<typeof joinEventMeetingSchema>;

export const readyEventSchema = z.function().args(roomName).returns(z.void());

type ReadyEvent = z.infer<typeof readyEventSchema>;

export const iceCandidateClientEventSchema = z
  .function()
  .args(z.instanceof(RTCIceCandidate), roomName)
  .returns(z.void());

type ICECandidateEvent = z.infer<typeof iceCandidateClientEventSchema>;

export const offerClientEventSchema = z
  .function()
  .args(offerSchema, roomName)
  .returns(z.void());

type OfferEvent = z.infer<typeof offerClientEventSchema>;

export const answerClientEventSchema = z
  .function()
  .args(answerSchema, roomName)
  .returns(z.void());

type AnswerEvent = z.infer<typeof answerClientEventSchema>;

export const leaveEventSchema = z.function().args(roomName).returns(z.void());

type LeaveEvent = z.infer<typeof leaveEventSchema>;

export type ClientToServerEvents = {
  join: JoinMeetingEvent;
  ready: ReadyEvent;
  "ice-candidate": ICECandidateEvent;
  offer: OfferEvent;
  answer: AnswerEvent;
  leave: LeaveEvent;
};

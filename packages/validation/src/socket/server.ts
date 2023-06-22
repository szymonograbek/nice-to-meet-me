import z from "zod";
import { answerSchema, offerSchema } from "./shared";

export const iceCandidateServerEventSchema = z
  .function()
  .args(z.instanceof(RTCIceCandidate))
  .returns(z.void());

type ICECandidateEvent = z.infer<typeof iceCandidateServerEventSchema>;

export const offerServerEventSchema = z
  .function()
  .args(offerSchema)
  .returns(z.void());

type OfferEvent = z.infer<typeof offerServerEventSchema>;

export const answerServerEventSchema = z
  .function()
  .args(answerSchema)
  .returns(z.void());

type AnswerEvent = z.infer<typeof answerServerEventSchema>;

export type ServerToClientEvents = {
  created: VoidFunction;
  joined: VoidFunction;
  full: VoidFunction;
  ready: VoidFunction;
  "ice-candidate": ICECandidateEvent;
  offer: OfferEvent;
  answer: AnswerEvent;
  leave: VoidFunction;
};

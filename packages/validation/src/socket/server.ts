import z from "zod";

export const joinedEventSchema = z
  .function()
  .args(z.string())
  .returns(z.void());

type JoinedEvent = z.infer<typeof joinedEventSchema>;

export type ServerToClientEvents = {
  created: VoidFunction;
  userJoined: JoinedEvent;
  full: VoidFunction;
  ready: VoidFunction;
  leave: VoidFunction;
};

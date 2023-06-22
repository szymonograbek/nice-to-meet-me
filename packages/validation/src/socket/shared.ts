import z from "zod";

export const roomName = z.string();

const stpType = z
  .literal("answer")
  .or(z.literal("offer"))
  .or(z.literal("pranswer"))
  .or(z.literal("rollback"));

export const offerSchema = z.object({
  sdp: z.string().optional(),
  type: stpType,
});

export const answerSchema = z.object({
  sdp: z.string().optional(),
  type: stpType,
});

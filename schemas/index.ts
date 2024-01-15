import { z } from "zod";

export const recommendSchema = z.object({
  story: z.enum(["action", "comedy", "romance"]),
  setting: z.enum(["past", "present", "future"]),
  mood: z.enum(["happy", "reflective", "excited"]),
});

export const searchSchema = z.object({
  type: z.enum(["tv", "movie"]),
  search: z.string().min(0),
});

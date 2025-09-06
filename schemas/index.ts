import { z } from "zod";



export const searchSchema = z.object({
  type: z.enum(["tv", "movie"]),
  search: z.string().min(0),
});

import { z } from "zod";

const pageSchema = z
  .string()
  .regex(/^[1-9]\d*$/)
  .transform(Number)
  .default("1");

const mediaTypeSchema = z.enum(["movie", "tv"]);

export const tmdbSearchParamsSchema = z.object({
  type: mediaTypeSchema,
  query: z.string().trim().min(1),
  page: pageSchema,
});

export const tmdbDetailParamsSchema = z.object({
  type: mediaTypeSchema,
  id: z
    .string()
    .regex(/^[1-9]\d*$/)
    .transform(Number),
});

export const tmdbMoviesParamsSchema = z.object({
  status: z.enum(["top_rated", "popular", "now_playing", "upcoming"]),
  page: pageSchema,
});

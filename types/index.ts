type genreType = {
  id: number;
  name: string;
};

export type FilmType = {
  adult: boolean;
  backdrop_path: string;
  id: number;
  name: string;
  original_language: string;
  original_title: string;
  overview: string;
  poster_path: string;
  media_type: string;
  genre_ids: number[];
  vote_average: number;
  release_date: string;
  runtime: number;
  genres: genreType[];
};

export type TypeEnum = "story" | "setting" | "mood";

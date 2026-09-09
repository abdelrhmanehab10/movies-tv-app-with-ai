"use client";
import DisplayResults from "@/components/display-results";
import { FC } from "react";

interface FilmStatusProps {
  status: string;
}

const FilmStatus: FC<FilmStatusProps> = ({ status }) => {
  return <DisplayResults link={`/api/tmdb/movies?status=${status}`} />;
};

export default FilmStatus;

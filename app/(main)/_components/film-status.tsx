"use client";
import LoadingScreen from "@/components/LoadingScreen";
import MediaPagination from "@/components/MediaPagination";
import ResultCard from "@/components/ResultCard";
import DisplayResults from "@/components/display-results";
import { cn } from "@/lib/utils";
import { FilmType } from "@/types";
import axios from "axios";
import { FC, useEffect, useState } from "react";

interface FilmStatusProps {
  status: string;
}

const FilmStatus: FC<FilmStatusProps> = ({ status }) => {
  return (
    <DisplayResults link={`https://api.themoviedb.org/3/movie/${status}`} />
  );
};

export default FilmStatus;

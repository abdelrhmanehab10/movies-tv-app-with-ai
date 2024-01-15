"use client";
import LoadingScreen from "@/components/LoadingScreen";
import MediaPagination from "@/components/MediaPagination";
import ResultCard from "@/components/ResultCard";
import DisplayResults from "@/components/display-results";
import { cn } from "@/lib/utils";
import { FilmType } from "@/types";
import axios from "axios";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const SearchPage = () => {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") as string;
  const type = searchParams.get("t") as string;

  return (
    <DisplayResults
      link={`https://api.themoviedb.org/3/search/${type}?query=${query}&include_adult=false&language=en-US`}
      query={query}
      type={type}
    />
  );
};

export default SearchPage;

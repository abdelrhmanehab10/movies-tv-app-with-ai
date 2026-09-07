"use client";

import DisplayResults from "@/components/display-results";
import { useSearchParams } from "next/navigation";

const SearchResults = () => {
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

export default SearchResults;

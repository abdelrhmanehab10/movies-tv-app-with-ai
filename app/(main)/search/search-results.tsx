"use client";

import DisplayResults from "@/components/display-results";
import { useSearchParams } from "next/navigation";

const SearchResults = () => {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") as string;
  const type = searchParams.get("t") as string;
  const apiParams = new URLSearchParams({ query, type });

  return (
    <DisplayResults
      link={`/api/tmdb/search?${apiParams}`}
      query={query}
      type={type}
    />
  );
};

export default SearchResults;

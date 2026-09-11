import { cn } from "@/lib/utils";
import { createPaginatedUrl } from "@/lib/pagination";
import { FilmType } from "@/types";
import axios from "axios";
import { FC, useEffect, useState } from "react";
import ResultCard from "./ResultCard";
import MediaPagination from "./MediaPagination";
import LoadingScreen from "./LoadingScreen";

interface DisplayResultsProps {
  link: string;
  query?: string;
  type?: string;
}

const DisplayResults: FC<DisplayResultsProps> = ({ link, query, type }) => {
  const [results, setResults] = useState<FilmType[]>([]);
  const [searchPage, setSearchPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  const getMedia = async () => {
    setIsLoading(true);

    try {
      const url = createPaginatedUrl(link, searchPage, window.location.origin);
      const { data } = await axios.get(url);
      setTotalPages(data.total_pages);
      setResults(data.results);
      setError(null);
    } catch {
      setError("We couldn't load the results. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsMounted(true);
    getMedia();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [link, searchPage]);

  if (!isMounted) return;

  const onClick = (page: number) => {
    setSearchPage(page);
  };

  return (
    <>
      <main
        className={cn(
          "h-[40vh] flex justify-center items-center w-full",
          results.length > 0 && "h-full block"
        )}
      >
        {error ? (
          <div role="alert" className="flex flex-col items-center gap-3 text-center">
            <p>{error}</p>
            <button
              type="button"
              onClick={getMedia}
              className="rounded-md bg-primary px-4 py-2 text-primary-foreground"
            >
              Retry
            </button>
          </div>
        ) : results.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 py-2">
              {results.map((result) => (
                <ResultCard key={result.id} item={result} />
              ))}
            </div>
            <MediaPagination
              onClick={onClick}
              query={query}
              type={type}
              currentPage={searchPage}
              totalPages={totalPages}
            />
          </>
        ) : isLoading ? (
          <LoadingScreen />
        ) : (
          <p>There is no results, please try again</p>
        )}
      </main>
    </>
  );
};

export default DisplayResults;

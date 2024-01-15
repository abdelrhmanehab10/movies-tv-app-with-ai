import { cn } from "@/lib/utils";
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
  const [isMounted, setIsMounted] = useState<boolean>(false);

  const getMedia = async () => {
    setIsLoading(true);
    const { data } = await axios.get(link + `?page=${searchPage}`, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
      },
    });
    setTotalPages(data.total_pages);
    setIsLoading(false);
    setResults(data.results);
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
        {results.length > 0 ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 py-2">
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

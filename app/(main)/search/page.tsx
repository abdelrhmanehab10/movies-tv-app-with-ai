import LoadingScreen from "@/components/LoadingScreen";
import SearchBar from "@/app/(main)/_components/SearchBar";
import { Suspense } from "react";
import SearchResults from "./search-results";

const SearchPage = () => (
  <div className="mx-auto w-full max-w-6xl">
    <Suspense fallback={null}>
      <SearchBar />
    </Suspense>
    <Suspense fallback={<LoadingScreen />}>
      <SearchResults />
    </Suspense>
  </div>
);

export default SearchPage;

"use client";

import { useState } from "react";
import LoadingScreen from "@/app/_components/LoadingScreen";
import { Search } from "lucide-react";
import Slider from "./_components/Slider";

export default function Home() {
  const [isLoading, setIsLoading] = useState<boolean>(true);

  setTimeout(() => {
    setIsLoading(false);
  }, 1000);

  return isLoading ? (
    <LoadingScreen />
  ) : (
    <div className="text-left px-5 py-3">
      <h1 className="text-lg">What do you want to watch?</h1>
      <form className="mt-5">
        <div className="relative w-full">
          <input
            placeholder="search"
            className="w-full rounded-2xl px-5 py-3 bg-[#3A3F47]"
          />
          <Search className="absolute right-5 top-1/2 -translate-y-1/2" />
        </div>
      </form>
      {/* TODO: slider for hot films */}
      <Slider />
    </div>
  );
}

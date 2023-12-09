"use client";

import { useState } from "react";
import LoadingScreen from "@/app/_components/LoadingScreen";
import { Button } from "@/components/ui/button";
import { useModal } from "@/hooks/useModal";

export default function Home() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { onOpen } = useModal();

  setTimeout(() => {
    setIsLoading(false);
  }, 1000);

  return isLoading ? (
    <LoadingScreen />
  ) : (
    <main className="text-center px-5 py-3">
      <header>
        <h1 className="text-lg inline">What do you want to watch? or we</h1>
        <Button onClick={onOpen} className="ml-2">
          Recommend ✨
        </Button>
      </header>
      {/* <search>
        <form className="mt-5">
          <div className="relative w-full">
            <input
              placeholder="search"
              className="w-full rounded-2xl px-5 py-3 bg-[#3A3F47]"
            />
            <Search className="absolute right-5 top-1/2 -translate-y-1/2" />
          </div>
        </form>
      </search>
      <Slider /> */}
    </main>
  );
}

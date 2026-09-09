"use client";

import ResultCard from "@/components/ResultCard";
import { useResults } from "@/hooks/useResults";
import Link from "next/link";
import { useEffect } from "react";

const RecommendedForYou = () => {
  const { results, hydrateResults } = useResults();

  useEffect(() => {
    hydrateResults();
  }, [hydrateResults]);

  if (results.length === 0) return;

  return (
    <section>
      <div className="mb-4">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">
          Your AI pick
        </p>
        <h2 className="mt-1 text-2xl font-semibold">Recommended for you</h2>
        <p className="mt-2 text-sm text-white/50">
          <Link className="font-medium text-primary hover:underline" href="/login">
            Sign in
          </Link>{" "}
          to save your recommended list.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {results.map((result) => (
          <ResultCard key={result.id} item={result} />
        ))}
      </div>
    </section>
  );
};

export default RecommendedForYou;

"use client";

import ResultCard from "@/components/ResultCard";
import { useResults } from "@/hooks/useResults";

const RecommendedForYou = () => {
  const { results } = useResults();

  if (results.length === 0) return;

  return (
    <section>
      <div className="mb-4">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">
          Your AI pick
        </p>
        <h2 className="mt-1 text-2xl font-semibold">Recommended for you</h2>
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

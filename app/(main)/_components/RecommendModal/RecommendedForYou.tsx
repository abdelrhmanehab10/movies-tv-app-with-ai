"use client";
import ResultCard from "@/components/ResultCard";
import { useResults } from "@/hooks/useResults";

const RecommendedForYou = () => {
  const { results } = useResults();

  if (results.length === 0) return;

  return (
    <>
      <h3 className="text-lg underline underline-offset-8">
        Recommended For You 🎦
      </h3>
      <div className="py-4 grid grid-cols-2 md:grid-cols-4 gap-3">
        {results.map((result) => (
          <ResultCard key={result.id} item={result} />
        ))}
      </div>
    </>
  );
};

export default RecommendedForYou;

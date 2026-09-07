import RecommendButton from "./_components/RecommendButton";
import RecommendedForYou from "./_components/recommend-modal/RecommendedForYou";

export default function Home() {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-100px)] w-full max-w-5xl flex-col py-8 sm:py-14">
      <section className="flex flex-1 flex-col items-center justify-center gap-5 px-1 py-8 text-center">
        <div className="max-w-xl">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Not sure what to watch?
          </h1>
          <p className="mt-2 max-w-md text-sm leading-6 text-white/60">
            Tell Cinemotion your mood and get a film suggestion made for
            tonight.
          </p>
        </div>
        <RecommendButton
          size="sm"
          className="shrink-0 rounded-full px-4"
        />
      </section>
      <div className="mt-10 w-full">
        <RecommendedForYou />
      </div>
    </div>
  );
}

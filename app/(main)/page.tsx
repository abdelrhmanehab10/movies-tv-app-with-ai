import MediaTabs from "./_components/MediaTabs";
import RecommendedForYou from "./_components/RecommendModal/RecommendedForYou";

export default function Home() {
  return (
    <main className="">
      <RecommendedForYou />
      <div>
        <MediaTabs />
      </div>
    </main>
  );
}

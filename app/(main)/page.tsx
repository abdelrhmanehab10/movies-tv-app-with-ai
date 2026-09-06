import MediaTabs from "./_components/MediaTabs";
import RecommendedForYou from "./_components/recommend-modal/RecommendedForYou";

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

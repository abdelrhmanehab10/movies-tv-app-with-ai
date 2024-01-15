import SearchBar from "@/app/(main)/_components/SearchBar";
import RecommendButton from "./_components/RecommendButton";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <>
      <header className="text-center md:text-left px-5 py-3">
        <h1 className="text-lg inline">What do you want to watch? or we</h1>
        <RecommendButton />
        <SearchBar />
      </header>
      <main className="px-5 py-3">{children}</main>
    </>
  );
};

export default MainLayout;

import { FC } from "react";
import Image from "next/image";

interface LoadingScreenProps {}

const LoadingScreen: FC<LoadingScreenProps> = ({}) => {
  return (
    <main className="h-full flex flex-col justify-center items-center">
      <header>
        <figure className="text-center">
          <Image
            width={1000}
            height={1000}
            className="w-28"
            src="/logo.png"
            alt="logo"
          />
          <figcaption>Loading ...</figcaption>
        </figure>
      </header>
    </main>
  );
};

export default LoadingScreen;

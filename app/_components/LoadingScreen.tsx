import { FC } from "react";
import Image from "next/image";

interface LoadingScreenProps {}

const LoadingScreen: FC<LoadingScreenProps> = ({}) => {
  return (
    <div className="h-full flex flex-col justify-center items-center">
      <Image
        width={1000}
        height={1000}
        className="w-28"
        src="/logo.png"
        alt="logo"
      />
      <p className="animate-pulse">Loading ...</p>
    </div>
  );
};

export default LoadingScreen;

import { FC } from "react";
import { Skeleton } from "./ui/skeleton";

interface ImageLoaderProps {}

const ImageLoader: FC<ImageLoaderProps> = ({}) => {
  return <Skeleton className="w-full h-full rounded-lg" />;
};

export default ImageLoader;

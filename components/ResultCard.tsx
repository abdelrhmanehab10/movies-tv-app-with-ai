"use client";

import { FC } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { FilmType } from "@/types";

import { Skeleton } from "@/components/ui/skeleton";

interface ResultCardProps {
  item: FilmType;
  onCloseModal?: () => void;
}

const ResultCard: FC<ResultCardProps> = ({ item, onCloseModal }) => {
  const router = useRouter();

  const imagePath: string =
    process.env.NEXT_PUBLIC_IMAGE_URL +
    (item?.poster_path || item?.backdrop_path || "/logo.png");
  const voteAverage: string = item?.vote_average.toFixed(1);
  const mediaType: string = item?.media_type;
  const title: string = item?.original_title || item?.name;
  const isForAdult: string = item?.adult ? "+18" : "";

  const handleCardClick = () => {
    onCloseModal ? onCloseModal() : null;
    router.push(`/detail?type=${item?.media_type}&id=${item?.id}`);
  };

  return (
    <article
      onClick={handleCardClick}
      className="w-full h-full flex justify-center items-center relative overflow-hidden cursor-pointer"
    >
      <figure>
        <Skeleton className="rounded-lg w-full h-full bg-primary" />
        <Image
          src={
            item?.poster_path || item?.backdrop_path ? imagePath : "/logo.png"
          }
          width={400}
          height={400}
          alt={title + " poster"}
          className="rounded-lg object-fill transition-opacity opacity-0 duration-500 h-full"
          onLoad={(image) => {
            image.currentTarget.classList.remove("opacity-0");
          }}
          loading="lazy"
        />
        <figcaption
          className="
        opacity-0 
        text-white 
        rounded-lg 
        absolute 
        inset-0 
        transition 
        bg-black/70 
        hover:opacity-100
        "
        >
          <header className="bg-primary flex justify-between items-center w-full px-2 py-1 rounded-t-lg">
            <h2 className="text-sm capitalize">{mediaType}</h2>
            <div className="flex items-center gap-1">
              {isForAdult && (
                <span className="text-[8px]">For: {isForAdult}</span>
              )}
              <span className="text-[8px]">IMDB: {voteAverage}</span>
            </div>
          </header>
          <section className="pt-10">
            <h1 className="mt-2 font-bold text-center">{title}</h1>
            <p className="text-center text-[10px] mt-1 px-4 overflow-hidden text-ellipsis">
              {item?.overview.slice(0, 300)}...
            </p>
          </section>
        </figcaption>
      </figure>
    </article>
  );
};

export default ResultCard;

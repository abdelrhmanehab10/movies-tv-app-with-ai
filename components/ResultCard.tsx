"use client";

import { FC } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { FilmType } from "@/types";
import { getTmdbImageUrl } from "@/lib/tmdb-images";

import { Skeleton } from "@/components/ui/skeleton";

interface ResultCardProps {
  item: FilmType;
  onCloseModal?: () => void;
}

const ResultCard: FC<ResultCardProps> = ({ item, onCloseModal }) => {
  const router = useRouter();

  const imagePath = getTmdbImageUrl(item?.poster_path || item?.backdrop_path);
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
      <figure className="relative aspect-[2/3] w-full overflow-hidden rounded-lg">
        <Skeleton className="absolute inset-0 rounded-lg bg-primary" />
        <Image
          src={imagePath}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1280px) 25vw, 16vw"
          alt={title + " poster"}
          className="rounded-lg object-cover transition-opacity opacity-0 duration-500"
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
          <header className="bg-primary flex justify-between items-center w-full px-2 py-2 rounded-t-lg">
            <h2 className="text-sm capitalize">{mediaType}</h2>
            <div className="flex items-center gap-1">
              {isForAdult && (
                <span className="text-xs">For: {isForAdult}</span>
              )}
              <span className="text-xs">IMDB: {voteAverage}</span>
            </div>
          </header>
          <section className="px-2 pt-8">
            <h1 className="mt-2 text-base md:text-lg font-semibold leading-tight text-center">
              {title}
            </h1>
            <p className="text-xs md:text-sm leading-5 text-center mt-2 px-2 overflow-hidden">
              {item?.overview.slice(0, 300)}...
            </p>
          </section>
        </figcaption>
      </figure>
    </article>
  );
};

export default ResultCard;

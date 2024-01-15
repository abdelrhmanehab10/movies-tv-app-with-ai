import { FC } from "react";
import Image from "next/image";

import { Calendar, Clock, Ticket } from "lucide-react";
import { FilmType } from "@/types";
interface DetailHeaderProps {
  mediaDetail: FilmType;
}

const DetailHeader: FC<DetailHeaderProps> = ({ mediaDetail }) => {
  return (
    <div className="md:px-16">
      <div className="relative w-full h-96 md:h-[30vh]">
        <Image
          src={
            ((process.env.NEXT_PUBLIC_IMAGE_URL as string) +
              mediaDetail?.backdrop_path) as string
          }
          fill
          className="w-full rounded-b-xl object-cover"
          alt="backdrop"
        />
        <div className="bg-black/40 absolute inset-0" />
        <div className="bg-white/70 absolute right-2 bottom-2 px-4 rounded-xl  text-primary">
          <span className="text-xs font-semibold">
            {mediaDetail?.vote_average.toFixed(1)}
          </span>
        </div>
        <div className="w-32 h-44 absolute -bottom-1/4 left-10 md:left-28">
          <Image
            src={
              ((process.env.NEXT_PUBLIC_IMAGE_URL as string) +
                mediaDetail?.poster_path) as string
            }
            fill
            className="w-32 rounded-3xl"
            alt="backdrop"
          />
        </div>
      </div>
      <h1 className="my-3 ml-48 md:ml-64 text-xl md:text-2xl font-semibold">
        {mediaDetail?.name || mediaDetail?.original_title}
      </h1>
      <ul className="mt-20 md:mt-16 flex justify-center items-center gap-4">
        <li className="text-[12px] md:text-base flex justify-center items-center gap-2 text-gray-400">
          <Calendar className="w-5 h-5" /> {mediaDetail?.release_date}
        </li>
        <span className="text-gray-400">||</span>
        <li className="text-[12px] md:text-base flex justify-center items-center gap-2 text-gray-400">
          <Clock className="w-5 h-5" /> {mediaDetail?.runtime} Minutes
        </li>
        <span className="text-gray-400">||</span>
        <li className="text-[12px] md:text-base flex justify-center items-center gap-2 text-gray-400">
          <Ticket className="w-5 h-5" /> {mediaDetail?.genres[0]?.name}
        </li>
      </ul>
    </div>
  );
};

export default DetailHeader;

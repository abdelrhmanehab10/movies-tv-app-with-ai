import { FC } from "react";
import Image from "next/image";

interface SliderCardProps {}

const SliderCard: FC<SliderCardProps> = ({}) => {
  return (
    <div
      className="keen-slider__slide relative"
      style={{ overflow: "visible" }}
    >
      <Image
        className="rounded"
        width={3000}
        height={3000}
        src={"/movie-1.png"}
        alt={"film-name"}
      />
      <span className="absolute -bottom-10 -left-5 text-9xl text-background drop-shadow-[2px_2px_0px_rgb(2,150,299)]">
        1
      </span>
    </div>
  );
};

export default SliderCard;

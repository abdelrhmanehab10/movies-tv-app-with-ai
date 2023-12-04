import * as React from "react";
import { useKeenSlider } from "keen-slider/react";
import SliderCard from "./SliderCard";

import "keen-slider/keen-slider.min.css";

export default function Slider() {
  const [ref] = useKeenSlider<HTMLDivElement>({
    loop: false,
    mode: "free",
    slides: { origin: 0, perView: 2.1, spacing: 20 },
  });
  return (
    <div ref={ref} className="keen-slider mt-5 mx-auto object-cover">
      <SliderCard />
      <SliderCard />
      <SliderCard />
    </div>
  );
}

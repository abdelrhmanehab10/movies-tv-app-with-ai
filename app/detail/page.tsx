import LoadingScreen from "@/components/LoadingScreen";
import { Suspense } from "react";
import MediaDetail from "./media-detail";

const DetailPage = () => (
  <Suspense fallback={<LoadingScreen />}>
    <MediaDetail />
  </Suspense>
);

export default DetailPage;

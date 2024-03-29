"use client";
import { FC, useEffect, useState } from "react";
import RecommendationModal from "@/app/(main)/_components/RecommendModal/modal";

interface ModalProviderProps {}

const ModalProvider: FC<ModalProviderProps> = ({}) => {
  const [isMounted, setIsMounted] = useState<boolean>(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return;
  }

  return (
    <>
      <RecommendationModal />
    </>
  );
};

export default ModalProvider;

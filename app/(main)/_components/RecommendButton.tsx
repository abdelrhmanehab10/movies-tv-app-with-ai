"use client";
import { Button } from "@/components/ui/button";
import { useModal } from "@/hooks/useModal";

const RecommendButton = () => {
  const { onOpen } = useModal();
  return (
    <Button onClick={onOpen} size={"sm"} className="ml-2">
      Recommend ✨
    </Button>
  );
};

export default RecommendButton;

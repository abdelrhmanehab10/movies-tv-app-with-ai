"use client";
import { Button } from "@/components/ui/button";
import { useModal } from "@/hooks/useModal";
import { useResults } from "@/hooks/useResults";
import { cn } from "@/lib/utils";

const RecommendButton = () => {
  const { onOpen } = useModal();
  return (
    <Button onClick={onOpen} className="ml-2">
      Recommend ✨
    </Button>
  );
};

export default RecommendButton;

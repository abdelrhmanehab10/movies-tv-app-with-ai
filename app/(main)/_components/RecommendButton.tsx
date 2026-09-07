"use client";

import { Button, ButtonProps } from "@/components/ui/button";
import { useModal } from "@/hooks/useModal";
import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";

interface RecommendButtonProps {
  className?: string;
  size?: ButtonProps["size"];
}

const RecommendButton = ({
  className,
  size = "default",
}: RecommendButtonProps) => {
  const { onOpen } = useModal();

  return (
    <Button onClick={onOpen} size={size} className={cn(className)}>
      <Sparkles className="mr-2 h-4 w-4" aria-hidden="true" />
      Recommend for me
    </Button>
  );
};

export default RecommendButton;

"use client";

import { FC, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useModal } from "@/hooks/useModal";
import { FilmType } from "@/types";
import RecommendationModalForm from "@/app/(main)/_components/RecommendModal/form";
import { recommendSchema } from "@/schemas";
import { z } from "zod";
import { useResults } from "@/hooks/useResults";
import ResultCard from "@/components/ResultCard";

interface RecommendationModalProps {}

const RecommendationModal: FC<RecommendationModalProps> = ({}) => {
  const { isOpen, onClose } = useModal();
  const [results, setResults] = useState<FilmType[]>([]);
  const { onResults } = useResults();

  const form = useForm<z.infer<typeof recommendSchema>>({
    resolver: zodResolver(recommendSchema),
  });

  const closeHandler = () => {
    onClose();
    form.reset();
    onResults(results);
    setTimeout(() => {
      setResults([]);
    }, 3000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={closeHandler}>
      <DialogContent className="bg-foreground border-foreground">
        <DialogHeader className="text-left">
          <DialogTitle>Cinemotion Tool</DialogTitle>
          <DialogDescription>
            Answer the next 3 questions, and we will recommend the best movie or
            series for you.
          </DialogDescription>
          {results.length > 0 ? (
            <main className="grid grid-cols-2 grid-rows-2 gap-3 py-2">
              {results.map((resultItem, idx) => (
                <ResultCard
                  key={idx}
                  item={resultItem}
                  onCloseModal={closeHandler}
                />
              ))}
            </main>
          ) : (
            <RecommendationModalForm form={form} onUpdateResult={setResults} />
          )}
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default RecommendationModal;

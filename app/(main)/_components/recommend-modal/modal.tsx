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
import { FilmType, TypeEnum } from "@/types";
import { z } from "zod";
import ResultCard from "@/components/ResultCard";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { QuestionsAndAnswers } from "@/constant";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "@radix-ui/react-select";
import { Loader2 } from "lucide-react";
import axios, { AxiosError } from "axios";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";

const storyEnum = ["action", "comedy", "romance"] as const;
const settingEnum = ["past", "present", "future"] as const;
const moodEnum = ["happy", "reflective", "excited"] as const;

const recommendSchema = z.object({
  story: z.enum(storyEnum),
  setting: z.enum(settingEnum),
  mood: z.enum(moodEnum),
});

const RecommendationModal = () => {
  const { isOpen, onClose } = useModal();

  const {
    mutate,
    isPending: isLoading,
    data,
  } = useMutation({
    mutationFn: async (values: z.infer<typeof recommendSchema>) => {
      const { data } = await axios.post("/api/recommend", values);
      return data;
    },
    onError: (error) => {
      toast.error(error.message || "Something went wrong");
    },
  });

  const form = useForm<z.infer<typeof recommendSchema>>({
    resolver: zodResolver(recommendSchema),
  });

  const closeHandler = () => {
    onClose();
    form.reset();
  };

  return (
    <Dialog open={isOpen} onOpenChange={closeHandler}>
      <DialogContent className="bg-foreground border-foreground">
        <DialogHeader className="text-left">
          <DialogTitle>Cinemotion Tool</DialogTitle>
          <DialogDescription>
            Fill out the form, and we will recommend the best movie or series
            for you.
          </DialogDescription>
          {data ? (
            <main className="grid grid-cols-2 grid-rows-2 gap-3 py-2">
              {data.map((resultItem, idx) => (
                <ResultCard
                  key={idx}
                  item={resultItem}
                  onCloseModal={closeHandler}
                />
              ))}
            </main>
          ) : (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit((values) => mutate(values))}
                className="pt-3"
              >
                {QuestionsAndAnswers.map((qa, idx) => (
                  <FormField
                    key={idx}
                    control={form.control}
                    name={qa.type as TypeEnum}
                    render={({ field }) => (
                      <FormItem className="mb-2">
                        <FormLabel>{qa.question}</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={isLoading}
                        >
                          <FormControl className="my-2">
                            <SelectTrigger>
                              {field.value || qa.description}
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {qa.answers.map((answer, idx) => (
                              <SelectItem
                                className="capitalize"
                                key={idx}
                                value={answer}
                              >
                                {answer}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
                <Button disabled={isLoading} type={"submit"} className="w-full">
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Recommend"
                  )}
                </Button>
              </form>
            </Form>
          )}
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default RecommendationModal;

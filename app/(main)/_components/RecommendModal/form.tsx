"use client";

import { Dispatch, FC, SetStateAction, useState } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import axios, { AxiosError } from "axios";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { QuestionsAndAnswers } from "@/constant";
import { z } from "zod";
import { recommendSchema } from "@/schemas";
import { FilmType, TypeEnum } from "@/types";
import { UseFormReturn } from "react-hook-form";
import { toast } from "sonner";
import { useResults } from "@/hooks/useResults";

interface RecommendationModalFormProps {
  onUpdateResult: Dispatch<SetStateAction<FilmType[]>>;
  form: UseFormReturn<
    {
      story: "action" | "comedy" | "romance";
      setting: "past" | "present" | "future";
      mood: "happy" | "reflective" | "excited";
    },
    any,
    undefined
  >;
}

const RecommendationModalForm: FC<RecommendationModalFormProps> = ({
  onUpdateResult,
  form,
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { onResults } = useResults();
  async function onSubmit(values: z.infer<typeof recommendSchema>) {
    try {
      setIsLoading(true);
      const { data } = await axios.post("/api/recommend", values);
      splitResultsAndSearchWithEachResult(data);
      setIsLoading(false);
    } catch (error: AxiosError | any) {
      const errorText = error?.response.data;
      toast.error(errorText);
    }
  }

  const splitResultsAndSearchWithEachResult = (data: any) => {
    const filmsArray = data.message.content
      .split("\n")
      .map((film: string) => film.slice(3));
    filmsArray.forEach((film: string) => search(film));
  };

  async function search(film: string) {
    const response = await axios.get(
      `https://api.themoviedb.org/3/search/multi?query=${film}&include_adult=yes&language=en-US&page=1`,
      {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
        },
      }
    );

    const newResult = response.data.results[0];

    onUpdateResult((prev) => [...prev, newResult]);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="pt-3">
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
  );
};

export default RecommendationModalForm;

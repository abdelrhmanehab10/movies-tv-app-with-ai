"use client";

import { useState } from "react";
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
  Brain,
  Clapperboard,
  Clock3,
  Flame,
  Heart,
  Loader2,
  Moon,
  PartyPopper,
  Rocket,
  Shuffle,
  Sparkles,
  Sun,
  type LucideIcon,
} from "lucide-react";
import axios, { AxiosError } from "axios";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { useResults } from "@/hooks/useResults";

const storyEnum = ["action", "comedy", "romance"] as const;
const settingEnum = ["past", "present", "future"] as const;
const moodEnum = ["happy", "reflective", "excited"] as const;

const recommendSchema = z.object({
  story: z.enum(storyEnum),
  setting: z.enum(settingEnum),
  mood: z.enum(moodEnum),
});

type RecommendationValues = z.infer<typeof recommendSchema>;
type RecommendationMode = "quick" | "advanced";

const optionIcons: Record<TypeEnum, Record<string, LucideIcon>> = {
  mood: {
    happy: Sun,
    reflective: Moon,
    excited: Flame,
  },
  story: {
    action: Rocket,
    comedy: PartyPopper,
    romance: Heart,
  },
  setting: {
    past: Clock3,
    present: Clapperboard,
    future: Brain,
  },
};

const vibePresets: Array<{
  label: string;
  description: string;
  icon: LucideIcon;
  values: RecommendationValues;
}> = [
  {
    label: "Feel-good night",
    description: "Easy laughs and a warm ending",
    icon: Heart,
    values: { mood: "happy", story: "comedy", setting: "present" },
  },
  {
    label: "Edge of your seat",
    description: "Big energy, bigger stakes",
    icon: Flame,
    values: { mood: "excited", story: "action", setting: "future" },
  },
  {
    label: "Quietly brilliant",
    description: "A story that stays with you",
    icon: Brain,
    values: { mood: "reflective", story: "romance", setting: "past" },
  },
  {
    label: "Unexpected chemistry",
    description: "A playful mix with a little tension",
    icon: Sparkles,
    values: { mood: "excited", story: "romance", setting: "present" },
  },
];

const getRandomValue = <T,>(values: readonly T[]) =>
  values[Math.floor(Math.random() * values.length)];

const RecommendationModal = () => {
  const { isOpen, onClose } = useModal();
  const { onResults } = useResults();
  const [mode, setMode] = useState<RecommendationMode>("quick");

  const {
    mutate,
    isPending: isLoading,
    data,
    reset: resetMutation,
  } = useMutation({
    mutationFn: async (values: RecommendationValues) => {
      const { data } = await axios.post<FilmType>("/api/recommend", values);
      return data;
    },
    onSuccess: (result) => {
      onResults([result]);
    },
    onError: (error) => {
      const axiosError = error as AxiosError<{ error?: string }>;
      toast.error(
        axiosError.response?.data?.error ||
          axiosError.message ||
          "Something went wrong"
      );
    },
  });

  const form = useForm<RecommendationValues>({
    resolver: zodResolver(recommendSchema),
  });

  const closeHandler = () => {
    onClose();
    form.reset();
    resetMutation();
    setMode("quick");
  };

  const chooseVibe = (values: RecommendationValues) => {
    mutate(values);
  };

  const surpriseMe = () => {
    const values: RecommendationValues = {
      mood: getRandomValue(moodEnum),
      story: getRandomValue(storyEnum),
      setting: getRandomValue(settingEnum),
    };

    form.reset(values);
    mutate(values);
  };

  const selectedValues = form.watch();
  const selectedCount = Object.values(selectedValues).filter(Boolean).length;

  return (
    <Dialog open={isOpen} onOpenChange={closeHandler}>
      <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto border-white/10 bg-foreground sm:max-w-xl">
        <DialogHeader className="min-w-0 text-left">
          <div className="flex min-w-0 items-start gap-3 pr-7">
            <div className="mt-0.5 rounded-xl bg-primary/15 p-2 text-primary">
              <Sparkles className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <DialogTitle>Find your next favorite</DialogTitle>
              <DialogDescription className="mt-1">
                Choose a vibe, tune the details, or hand the decision to
                chance.
              </DialogDescription>
            </div>
          </div>
          {!data && (
            <>
              <div
                role="tablist"
                aria-label="Recommendation mode"
                className="mt-5 grid grid-cols-2 rounded-xl border border-white/10 bg-white/[0.03] p-1"
              >
                {(["quick", "advanced"] as const).map((option) => {
                  const isActive = mode === option;
                  const label = option === "quick" ? "Quick pick" : "Advanced";
                  const description =
                    option === "quick"
                      ? "Choose a ready-made vibe"
                      : "Tune every detail";

                  return (
                    <button
                      key={option}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => setMode(option)}
                      className={`rounded-lg px-3 py-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-white/55 hover:text-white"
                      }`}
                    >
                      <span className="block text-sm font-medium">{label}</span>
                      <span
                        className={`mt-0.5 block text-[11px] ${
                          isActive
                            ? "text-primary-foreground/70"
                            : "text-white/35"
                        }`}
                      >
                        {description}
                      </span>
                    </button>
                  );
                })}
              </div>

              {mode === "quick" && (
                <div className="mt-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-white/60">
                      Pick a ready-made vibe
                    </p>
                    <span className="text-xs text-white/40">One tap to reveal</span>
                  </div>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {vibePresets.map((preset) => {
                      const Icon = preset.icon;

                      return (
                        <button
                          key={preset.label}
                          type="button"
                          disabled={isLoading}
                          onClick={() => chooseVibe(preset.values)}
                          className="group flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-3 text-left transition-colors hover:border-white/25 hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-60"
                        >
                          <span className="rounded-lg bg-white/[0.08] p-2 text-white/70 group-hover:text-white">
                            <Icon className="h-4 w-4" aria-hidden="true" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-sm font-medium text-white">
                              {preset.label}
                            </span>
                            <span className="mt-0.5 block truncate text-xs text-white/45">
                              {preset.description}
                            </span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isLoading}
                    onClick={surpriseMe}
                    className="h-auto min-w-0 w-full justify-between rounded-xl border-primary/30 bg-primary/[0.04] px-3 py-3 text-left text-white/90 hover:border-primary/60 hover:bg-primary/10 hover:text-white"
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <Shuffle className="h-4 w-4 text-primary" aria-hidden="true" />
                      <span>
                        <span className="block text-sm font-medium">
                          Surprise me
                        </span>
                        <span className="block text-xs font-normal text-white/45">
                          Randomize everything and reveal a pick
                        </span>
                      </span>
                    </span>
                    <span className="text-xs text-primary">I&apos;m feeling lucky</span>
                  </Button>
                </div>
              )}
            </>
          )}
          {data ? (
            <main className="flex justify-center py-2">
              <div className="w-full max-w-[220px] sm:max-w-[240px]">
                <ResultCard item={data} onCloseModal={closeHandler} />
              </div>
            </main>
          ) : mode === "advanced" ? (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit((values) => mutate(values))}
                className="mt-5 space-y-4"
              >
                <div className="flex items-center justify-between border-t border-white/10 pt-4">
                  <p className="text-xs font-medium text-white/60">
                    Or build your own vibe
                  </p>
                  <p className="text-xs text-white/40">Fine-tune the details</p>
                </div>
                {QuestionsAndAnswers.map((qa) => (
                  <FormField
                    key={qa.type}
                    control={form.control}
                    name={qa.type as TypeEnum}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm">{qa.question}</FormLabel>
                        <FormControl>
                          <div
                            role="group"
                            aria-label={qa.description}
                            className="grid grid-cols-3 gap-2"
                          >
                            {qa.answers.map((answer) => {
                              const Icon = optionIcons[qa.type as TypeEnum][answer];
                              const isSelected = field.value === answer;

                              return (
                                <button
                                  key={answer}
                                  type="button"
                                  aria-pressed={isSelected}
                                  disabled={isLoading}
                                  onClick={() => field.onChange(answer)}
                                  className={`flex min-h-16 flex-col items-center justify-center gap-1 rounded-xl border px-2 py-2 text-center capitalize transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-60 ${
                                    isSelected
                                      ? "border-primary bg-primary/15 text-white"
                                      : "border-white/10 bg-white/[0.03] text-white/55 hover:border-white/25 hover:bg-white/[0.06] hover:text-white"
                                  }`}
                                >
                                  <Icon
                                    className={`h-4 w-4 ${
                                      isSelected ? "text-primary" : ""
                                    }`}
                                    aria-hidden="true"
                                  />
                                  <span className="text-xs font-medium">
                                    {answer}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
                <Button
                  disabled={isLoading}
                  type="submit"
                  className="mt-1 h-11 w-full rounded-xl"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" aria-hidden="true" />
                      Make my pick
                    </>
                  )}
                </Button>
              </form>
            </Form>
          ) : null}
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default RecommendationModal;

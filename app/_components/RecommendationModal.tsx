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
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import axios from "axios";

const formSchema = z.object({
  story: z.enum(["action", "comedy", "romance"]),
  setting: z.enum(["past", "present", "future"]),
  mood: z.enum(["happy", "reflective", "excited"]),
});

type TypeEnum = "story" | "setting" | "mood";

const QuestionsAndAnswers = [
  {
    type: "mood",
    question: "How would you describe your current mood?",
    answers: ["happy", "reflective", "excited"],
  },
  {
    type: "story",
    question: "What kind of story are you in the mood for today?",
    answers: ["action", "comedy", "romance"],
  },
  {
    type: "setting",
    question: "What setting interests you the most right now?",
    answers: ["past", "present", "future"],
  },
];

interface RecommendationModalProps {}

const RecommendationModal: FC<RecommendationModalProps> = ({}) => {
  const { isOpen, onClose } = useModal();
  const [isActive, setIsActive] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<string>("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);

    try {
      setIsLoading(true);
      const { data } = await axios.post("/api/recommend/", values);
      setIsLoading(false);
      console.log(data.message.content.split('"'));
      setResult(data.message.content.split('""'));
    } catch (error) {
      setIsLoading(false);
      console.log(error);
    } finally {
      setIsActive(0);
    }
  }

  const closeHandler = () => {
    setResult("");
    setIsActive(0);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={closeHandler}>
      <DialogContent className="bg-foreground border-foreground ">
        <DialogHeader className="text-left">
          <DialogTitle>Cinemotion Tool</DialogTitle>
          <DialogDescription>
            Answer the next 3 question, Then we will recommend the best movie or
            series for you
          </DialogDescription>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="pt-3">
              {result.length > 0 ? (
                result
              ) : (
                <FormField
                  control={form.control}
                  name={QuestionsAndAnswers[isActive]?.type as TypeEnum}
                  render={({ field }) => (
                    <FormItem className="mb-2">
                      <FormLabel>
                        {QuestionsAndAnswers[isActive]?.question}
                      </FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex justify-around space-x-2"
                        >
                          {QuestionsAndAnswers[isActive]?.answers?.map(
                            (answer, i) => (
                              <FormItem key={i} className="w-full">
                                <FormControl className="w-full">
                                  <RadioGroupItem value={answer}>
                                    {answer}
                                  </RadioGroupItem>
                                </FormControl>
                              </FormItem>
                            )
                          )}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              <Button
                onClick={() =>
                  isActive === 2 ? "" : setIsActive(isActive + 1)
                }
                type={isActive > 2 ? "submit" : "button"}
                className="w-full"
              >
                {isLoading ? <Loader className="animate-spin" /> : "Next"}
              </Button>
            </form>
          </Form>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default RecommendationModal;

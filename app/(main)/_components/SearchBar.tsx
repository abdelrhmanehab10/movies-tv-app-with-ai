"use client";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { searchSchema } from "@/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRouter, useSearchParams } from "next/navigation";
import { createUrl } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

const SearchBar = ({}) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const form = useForm<z.infer<typeof searchSchema>>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      type: "movie",
      search: "",
    },
  });

  const onSubmit = (values: z.infer<typeof searchSchema>) => {
    const newParams = new URLSearchParams(searchParams.toString());

    if (values) {
      newParams.set("q", values.search);
      newParams.set("t", values.type);
      newParams.set("p", "1");
    } else {
      newParams.delete("q");
      newParams.delete("t");
      newParams.delete("p", "1");
    }

    router.push(createUrl("/search", newParams));
  };

  return (
    <search>
      <Form {...form}>
        <form
          className="flex items-center pt-5 md:w-2/3"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <FormField
            control={form.control}
            name={"type"}
            render={({ field }) => (
              <FormItem className="w-1/3">
                <Select
                  defaultValue={field.value}
                  onValueChange={field.onChange}
                  // disabled={isLoading}
                >
                  <FormControl className="border-r-transparent py-6 rounded-full rounded-r-none ml-1 pl-6">
                    <SelectTrigger>
                      <SelectValue placeholder="Select the type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="movie">movie</SelectItem>
                    <SelectItem value="tv">tv</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name={"search"}
            render={({ field }) => (
              <FormItem className="w-full">
                <FormControl className="border-l-0 border-r-0 py-6 rounded-full rounded-l-none rounded-r-none w-full">
                  <Input
                    className="focus-visible:bg-transparent"
                    autoComplete="off"
                    placeholder="Let's found whatever you want.."
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <Button
            type="submit"
            className="border border-l-0  py-6 rounded-full rounded-l-none"
          >
            <Search className="w-5 h-5" />
          </Button>
        </form>
      </Form>
    </search>
  );
};

export default SearchBar;

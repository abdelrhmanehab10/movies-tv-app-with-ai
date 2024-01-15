import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import React from "react";
import FilmStatus from "./film-status";

const status = ["top_rated", "popular", "now_playing", "upcoming"];

const MediaTabs = () => {
  return (
    <Tabs defaultValue={"popular"}>
      <TabsList className="bg-transparent">
        {status.map((state, idx) => (
          <TabsTrigger key={idx} value={state}>
            {state.replace("_", " ").toUpperCase()}
          </TabsTrigger>
        ))}
      </TabsList>
      {status.map((state, idx) => (
        <TabsContent key={idx} value={state}>
          <FilmStatus status={state} />
        </TabsContent>
      ))}
    </Tabs>
  );
};

export default MediaTabs;

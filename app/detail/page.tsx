"use client";

import { FC, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import axios from "axios";

import { FilmType } from "@/types";
import LoadingScreen from "@/components/LoadingScreen";
import DetailHeader from "./components/DetailHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface MediaDetailProps {}

const MediaDetail: FC<MediaDetailProps> = ({}) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [mediaDetail, setMediaDetail] = useState<FilmType>();

  const params = useSearchParams();
  const type = params.get("type") as string;
  const id = params.get("id") as string;

  const URL = `https://api.themoviedb.org/3/${type}/${id}`;

  const getMediaDetail = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(URL, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
        },
      });
      setIsLoading(false);

      setMediaDetail(response.data);
    } catch (error) {
      setIsLoading(false);
      console.log(error);
    }
  };

  useEffect(() => {
    getMediaDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, id]);

  return isLoading ? (
    <LoadingScreen />
  ) : (
    <>
      <DetailHeader mediaDetail={mediaDetail as FilmType} />
      <main className="text-left mt-6">
        <Tabs defaultValue="about" className="md:px-12">
          <TabsList className="bg-transparent text-xl">
            <TabsTrigger className="text-lg" value="about">
              About Movie
            </TabsTrigger>
            <TabsTrigger
              className="text-lg line-through"
              value="reviews"
              disabled
            >
              Reviews
            </TabsTrigger>
            <TabsTrigger className="text-lg line-through" value="cast" disabled>
              Cast
            </TabsTrigger>
          </TabsList>
          <TabsContent value="about" className="p-2">
            {mediaDetail?.overview}
          </TabsContent>
          <TabsContent value="reviews">Change your password here.</TabsContent>
          <TabsContent value="cast">Change your password here.</TabsContent>
        </Tabs>
      </main>
    </>
  );
};

export default MediaDetail;

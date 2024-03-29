import type { Metadata } from "next";
import { Poppins } from "next/font/google";

import "./globals.css";

import { cn } from "@/lib/utils";
import ModalProvider from "@/components/providers/ModalProvider";

import { Toaster } from "sonner";

const font = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Cinemotion",
  description:
    "A movie app, Has a tool that use ai to suggest movie or series based on your mode.",
  icons: { icon: "/logo.png" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={cn("bg-foreground text-white", font.className)}>
        <ModalProvider />
        {children}
        <Toaster />
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { AppShell } from "./_components/app-shell.view";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "Orbe — SSW próprio",
  description: "Frontend que consome apenas o ssw-mock",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={cn("font-sans", geist.variable)}>
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}

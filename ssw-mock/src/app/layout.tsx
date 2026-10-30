import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SSW - Rastreamento",
  description: "Consulta de rastreamentos (mock)",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}

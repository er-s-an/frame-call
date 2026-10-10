import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Frame Call",
  description: "Music and camera for a brand film, committed only when the Qloo taste graph names them.",
};

export const runtime = "nodejs";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

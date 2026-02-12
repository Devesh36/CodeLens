import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CodeLens AI - Understand Code Line by Line",
  description:
    "Get AI-powered explanations for your code. Paste code, get instant line-by-line analysis powered by Groq.",
  keywords: [
    "code explanation",
    "AI",
    "programming",
    "learning",
    "code analysis",
    "Groq",
  ],
  authors: [{ name: "CodeLens AI" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}

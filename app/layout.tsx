import type { Metadata } from "next";
import { Fredoka } from "next/font/google";
import { Agentation } from "agentation";
import "./globals.css";

const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Topic Picker",
  description: "Impromptu speaking practice spinner.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <link rel="stylesheet" href="https://use.typekit.net/YOUR_PROJECT_ID.css" />
      </head>
      <body className={`${fredoka.variable} font-sans antialiased`}>
        {children}
        {process.env.NODE_ENV === "development" && <Agentation />}
      </body>
    </html>
  );
}

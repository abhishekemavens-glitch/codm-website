import type { Metadata } from "next";
import "./globals.css";

import { ThemeProvider } from "../context/ThemeContext";
import ScrollReset from "../components/ScrollReset";

import Header from "../components/Header";
import Footer from "../components/Footer";

export const metadata: Metadata = {
  title: "CODM Software | Salesforce, AI & Enterprise Technology",
  description:
    "CODM delivers Salesforce, AI, Agentforce and custom software solutions for modern enterprises.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ScrollReset />

        <ThemeProvider>
          <Header />

          {children}

          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}

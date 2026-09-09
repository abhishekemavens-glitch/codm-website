"use client";

import { useEffect, useState } from "react";

import Header from "../components/Header";
import Hero from "../components/Hero";
import Industries from "../components/Industries";
import WhyCodm from "../components/WhyCodm";
import ServicesSection from "../components/ServicesSection";
import TrustedBy from "../components/TrustedBy";
import Testimonials from "../components/Testimonials";
import LatestBlogs from "../components/LatestBlogs";
import ContactCTA from "../components/ContactCTA";
import Footer from "../components/Footer";

export default function Home() {
  const [pageReady, setPageReady] = useState(false);

  useEffect(() => {
    // Prevent the browser from restoring an old scroll position
    // while the page is being rebuilt/hydrated.
    window.history.scrollRestoration = "manual";
    window.scrollTo(0, 0);

    const timer = window.setTimeout(() => {
      setPageReady(true);
    }, 50);

    return () => window.clearTimeout(timer);
  }, []);

  if (!pageReady) {
    return (
      <main className="min-h-screen bg-[var(--background)]" />
    );
  }

  return (
    <>
      <Header />
      <Hero />
      <Industries />
      <WhyCodm />
      <ServicesSection />
      <TrustedBy />
      <Testimonials />
      <LatestBlogs />
      <ContactCTA />
      <Footer />
    </>
  );
}

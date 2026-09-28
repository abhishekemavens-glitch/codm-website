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
import { Reveal } from "@/components/Reveal";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-x-hidden">
      {/* Header stays outside Reveal so sticky/fixed behaviour is untouched */}
      <Header />

      {/* HERO — animates on load since it's already in view */}
      <Reveal className="relative z-10" distance={24} duration={0.7}>
        <Hero />
      </Reveal>

      {/* Industries animates itself (useInViewOnce + Reveal on the card) */}
      <div className="relative z-10">
        <Industries />
      </div>

      {/* WhyCodm animates itself (Stagger on the cards) */}
      <div className="relative z-10">
        <WhyCodm />
      </div>

      {/* ServicesSection animates itself (Stagger on the cards) */}
      <div className="relative z-10">
        <ServicesSection />
      </div>

      {/* Still wrapped until TrustedBy gets its own Stagger */}
      <Reveal className="relative z-10">
        <TrustedBy />
      </Reveal>

      {/* Testimonial slides in from the side for variety */}
      <Reveal className="relative z-10" direction="left">
        <Testimonials />
      </Reveal>

      <Reveal className="relative z-10">
        <LatestBlogs />
      </Reveal>

      <Reveal className="relative z-10">
        <ContactCTA />
      </Reveal>

      {/* Footer stays outside Reveal */}
      <Footer />
    </main>
  );
}

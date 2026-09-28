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

      <Reveal className="relative z-10">
        <Industries />
      </Reveal>

      <Reveal className="relative z-10">
        <WhyCodm />
      </Reveal>

      <Reveal className="relative z-10">
        <ServicesSection />
      </Reveal>

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

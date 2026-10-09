import Hero from "../components/Hero";
import Industries from "../components/Industries";
import WhyCodm from "../components/WhyCodm";
import ServicesSection from "../components/ServicesSection";
import TrustedBy from "../components/TrustedBy";
import Testimonials from "../components/Testimonials";
import LatestBlogs from "../components/LatestBlogs";
import ContactCTA from "../components/ContactCTA";
import { Reveal } from "@/components/Reveal";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-x-hidden">
      {/* Hero */}
      <Reveal className="relative z-10" distance={24} duration={0.7}>
        <Hero />
      </Reveal>

      {/* Industries */}
      <div className="relative z-10">
        <Industries />
      </div>

      {/* Why CODM */}
      <div className="relative z-10">
        <WhyCodm />
      </div>

      {/* Services */}
      <div className="relative z-10">
        <ServicesSection />
      </div>

      {/* Trusted By */}
      <div className="relative z-10">
        <TrustedBy />
      </div>

      {/* Testimonials */}
      <div className="relative z-10">
        <Testimonials />
      </div>

      {/* Latest Blogs */}
      <div className="relative z-10">
        <LatestBlogs />
      </div>

      {/* Contact CTA */}
      <div className="relative z-10">
        <ContactCTA />
      </div>
    </main>
  );
}

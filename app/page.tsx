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
  return (
    <main className="relative min-h-screen overflow-x-hidden">
      <Header />

      <div className="relative z-10">
        <Hero />
      </div>

      <div className="relative z-10">
        <Industries />
      </div>

      <div className="relative z-10">
        <WhyCodm />
      </div>

      <div className="relative z-10">
        <ServicesSection />
      </div>

      <div className="relative z-10">
        <TrustedBy />
      </div>

      <div className="relative z-10">
        <Testimonials />
      </div>

      <div className="relative z-10">
        <LatestBlogs />
      </div>

      <div className="relative z-10">
        <ContactCTA />
      </div>

      <Footer />
    </main>
  );
}

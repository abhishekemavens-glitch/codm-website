import Header from "../components/Header";
import Hero from "../components/Hero";
import Industries from "../components/Industries";
import WhyCodm from "../components/WhyCodm";
import ServicesSection from "../components/ServicesSection";
import TrustedBy from "../components/TrustedBy";
import Testimonials from "../components/Testimonials";
import LatestBlogs from "../components/LatestBlogs";

export default function Home() {
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
    </>
  );
}
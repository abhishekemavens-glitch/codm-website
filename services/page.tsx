import Header from "../../components/Header";
import Footer from "../../components/Footer";

export default function ServicesPage() {
  return (
    <main className="relative min-h-screen overflow-x-hidden">
      <Header />

      <div className="relative z-10">
        <section
          id="services"
          className="
            relative
            overflow-hidden
            bg-[var(--background)]
            py-20
            md:py-28
          "
        >
          <div
            className="
              pointer-events-none
              absolute
              left-1/2
              top-0
              h-[500px]
              w-[800px]
              -translate-x-1/2
              rounded-full
              blur-[140px]
            "
            aria-hidden="true"
            style={{
              background:
                "radial-gradient(circle, rgba(114, 92, 255, 0.12), transparent 70%)",
            }}
          />

          <div className="relative mx-auto max-w-[1200px] px-5 sm:px-8">
            <h1
              className="
                mx-auto
                max-w-[950px]
                text-center
                text-[44px]
                font-medium
                leading-[1.03]
                tracking-[-0.055em]
                text-[var(--foreground)]
                md:text-[64px]
              "
            >
              Our Services
            </h1>

            <p
              className="
                mx-auto
                mt-5
                max-w-[750px]
                text-center
                text-base
                leading-7
                text-[var(--muted)]
                md:text-lg
              "
            >
              We deliver Salesforce, AI, Agentforce and custom software
              solutions for modern enterprises.
            </p>
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}
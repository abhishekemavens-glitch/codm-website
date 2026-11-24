
import Link from "next/link";

export default function NotFound() {
  return (
    <main
      className="flex min-h-[520px] items-center justify-center px-6 py-20"
      style={{ background: "var(--background)", color: "var(--foreground)" }}
    >
      <div className="mx-auto w-full max-w-3xl text-center">

        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#8b6cf6]">
          CODM SOFTWARE
        </p>

        <h1 className="mt-5 text-[clamp(90px,16vw,160px)] font-medium leading-none tracking-tight text-[#8b6cf6]">
          404
        </h1>

        <h2 className="mt-5 text-3xl font-medium md:text-4xl">
          Page Not Found
        </h2>

        <p
          className="mx-auto mt-5 max-w-xl text-base leading-7"
          style={{ color: "var(--muted)" }}
        >
          Sorry, the page you are looking for doesn't exist,
          may have been moved, or is temporarily unavailable.
        </p>

        <div className="mt-9 flex flex-wrap justify-center gap-4">

          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#8957f5] to-[#5145e8] px-8 py-4 text-sm font-medium text-white transition-transform hover:-translate-y-1"
          >
            Back to Homepage →
          </Link>

          <Link
            href="/contact-us"
            className="inline-flex items-center justify-center rounded-full border px-8 py-4 text-sm font-medium transition-colors hover:border-[#8b6cf6]"
            style={{ borderColor: "var(--border)" }}
          >
            Contact Us
          </Link>

        </div>

        <div className="mt-12 flex flex-wrap justify-center gap-x-8 gap-y-4 text-sm">
          <Link href="/services" className="hover:text-[#8b6cf6]">
            Services
          </Link>

          <Link href="/products" className="hover:text-[#8b6cf6]">
            Products
          </Link>

          <Link href="/industries" className="hover:text-[#8b6cf6]">
            Industries
          </Link>

          <Link href="/insights" className="hover:text-[#8b6cf6]">
            Insights
          </Link>
        </div>

      </div>
    </main>
  );
}

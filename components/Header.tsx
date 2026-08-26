"use client";

import ThemeToggle from "./ThemeToggle";

export default function Header() {
  return (
    <header className="fixed left-0 top-0 z-50 w-full border-b border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-[78px] max-w-[1400px] items-center justify-between px-6 lg:px-10">
        
        {/* LOGO */}
        <a
          href="/"
          className="text-2xl font-bold tracking-[-0.07em]"
        >
          codm<span className="text-[var(--accent)]">.</span>
        </a>

        {/* NAVIGATION */}
        <nav className="hidden items-center gap-8 text-sm font-medium lg:flex">
          <a
            href="/services"
            className="transition-opacity hover:opacity-50"
          >
            Services
          </a>

          <a
            href="/industries"
            className="transition-opacity hover:opacity-50"
          >
            Industries
          </a>

          <a
            href="/case-studies"
            className="transition-opacity hover:opacity-50"
          >
            Case Studies
          </a>

          <a
            href="/about"
            className="transition-opacity hover:opacity-50"
          >
            About
          </a>

          <a
            href="/blog"
            className="transition-opacity hover:opacity-50"
          >
            Insights
          </a>
        </nav>

        {/* RIGHT */}
        <div className="flex items-center gap-3">
          <ThemeToggle />

         <a
  href="/contact"
  className="hidden h-[44px] items-center whitespace-nowrap rounded-full bg-[var(--foreground)] px-6 text-sm font-semibold text-[var(--background)] transition-transform hover:scale-105 sm:flex"
>
  Get in touch
</a>
        </div>
      </div>
    </header>
  );
}
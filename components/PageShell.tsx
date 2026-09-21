import type { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";

/*
 * Wrapper for every inner page.
 * Same structure as the homepage (Header and Footer inside <main>),
 * plus top spacing so content doesn't hide under the fixed header.
 *
 * Save as: components/PageShell.tsx
 */
export default function PageShell({ children }: { children: ReactNode }) {
  return (
    <main className="relative min-h-screen overflow-x-hidden">
      <Header />

      {/* Header is fixed on desktop, so leave room for it there */}
      <div className="relative z-10 pt-10 min-[901px]:pt-[160px]">
        {children}
      </div>

      <Footer />
    </main>
  );
}

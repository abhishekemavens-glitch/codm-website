import type { ReactNode } from "react";

export default function PageShell({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <main className="relative min-h-screen overflow-x-hidden">
      <div className="relative z-10">
        {children}
      </div>
    </main>
  );
}

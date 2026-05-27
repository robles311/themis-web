"use client";

import { useRef, type MouseEvent, type ReactNode } from "react";

type Props = {
  icon: ReactNode;
  title: string;
  description: string;
};

export function FeatureCard({ icon, title, description }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  function handleMove(e: MouseEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
    el.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      className="group relative overflow-hidden rounded-2xl border border-black/10 bg-white/90 p-7 shadow-[0_8px_32px_0_rgba(0,0,0,0.04)] backdrop-blur-2xl transition-all duration-300 hover:-translate-y-0.5 hover:border-black/25 hover:bg-white"
      style={{ WebkitBackdropFilter: "blur(40px)" }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(420px circle at var(--mouse-x,50%) var(--mouse-y,50%), rgba(0,0,0,0.06), transparent 60%)",
        }}
      />
      <div className="relative">
        <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-black/10 bg-black/[0.03] text-black">
          {icon}
        </div>
        <h3 className="font-serif text-xl font-semibold text-black">{title}</h3>
        <p className="mt-2.5 text-sm leading-relaxed text-gray-600">
          {description}
        </p>
      </div>
    </div>
  );
}
